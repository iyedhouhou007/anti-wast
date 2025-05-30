import Post from "../models/Post.js";
import Image from "../models/Image.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { validationResult } from "express-validator";
import { getCoordinates } from "../utils/geocoding.js";
import fs from "fs";
import notificationService from "../services/notificationService.js";
import { getAllUsers } from "./userController.js";

export const createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Invalid input data", 400));
  }

  const {
    post_type,
    status,
    category,
    description,
    quantity,
    quantity_unit,
    location,
    imageIds,
  } = req.body;
  const userId = req.user.id;

  try {
    // Verify that all imageIds exist and belong to the user
    if (imageIds && imageIds.length > 0) {
      const images = await Image.find({
        _id: { $in: imageIds },
        uploadedBy: userId,
        relatedPost: null,
      });

      if (images.length !== imageIds.length) {
        return next(new AppError("One or more invalid image IDs", 400));
      }
    }

    const post = await Post.create({
      post_type,
      status,
      category,
      description,
      quantity,
      quantity_unit,
      location,
      user: userId,
      images: imageIds || [],
    });

    if (!post) {
      return next(new AppError("Failed to create post", 500));
    }

    // Update the relatedPost field for all images
    if (imageIds && imageIds.length > 0) {
      await Image.updateMany(
        { _id: { $in: imageIds } },
        { relatedPost: post._id }
      );
    }

    // if location is [0, 0] or not provided, return error location is not valid
    if (
      !location ||
      (Array.isArray(location.coordinates) &&
        location.coordinates.length === 2 &&
        location.coordinates[0] === 0 &&
        location.coordinates[1] === 0)
    ) {
      return next(new AppError("Invalid location coordinates", 400));
    }

    // Populate the images field before sending response
    await post.populate("images");
    await post.populate("user");

    // Get post coordinates
    const postCoordinates = post.location.coordinates;

    // Find users who have location data and are within 20km (customizable)
    const maxDistance = 20000; // 20km in meters
    const nearbyUsers = await User.find({
      location: { $ne: null },
      _id: { $ne: userId }, // Exclude post creator
      "location.coordinates": {
        $exists: true,
        $ne: null,
      },
    });

    // Filter users who are nearby
    // Note: This is done in JS because not all user locations might be stored in GeoJSON format
    const notifiedUsers = [];

    for (const user of nearbyUsers) {
      try {
        const userLat = user.location?.coordinates?.lat;
        const userLng = user.location?.coordinates?.lng;

        if (!userLat || !userLng) continue;

        // Calculate distance (simplified, you could use a more precise calculation)
        const R = 6371000; // Earth radius in meters
        const dLat = ((postCoordinates[1] - userLat) * Math.PI) / 180;
        const dLng = ((postCoordinates[0] - userLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((userLat * Math.PI) / 180) *
            Math.cos((postCoordinates[1] * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        // If user is within range
        if (distance <= maxDistance) {
          await notificationService.createNotification(
            user._id,
            "NEW_POST",
            `New ${category} available near you!`,
            post._id
          );
          notifiedUsers.push(user._id);
        }
      } catch (error) {
        console.error(
          `Failed to calculate distance for user ${user._id}:`,
          error
        );
        // Continue with other users even if one fails
      }
    }

    console.log(
      `Sent notifications to ${notifiedUsers.length} nearby users for new post ${post._id}`
    );

    res.status(201).json({
      status: "success",
      message: "Post created successfully",
      data: { post },
    });
  } catch (error) {
    next(new AppError("Error creating post", 500));
  }
};

export const getAllPosts = async (req, res, next) => {
  try {
    // populate user and images fields
    const posts = await Post.find()
      .populate("user", "username photo_url")
      .populate("reserved_by", "username photo_url")
      .populate("images");
    if (!posts) {
      return next(new AppError("No posts found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Posts retrieved successfully",
      data: { posts },
    });
  } catch (error) {
    next(new AppError("Error fetching posts", 500));
  }
};

export const getNearbyPosts = async (req, res, next) => {
  try {
    console.log("Request body:", req.body);

    let coordinates;
    const { location, maxDistance = 10000 } = req.body; // default 10km

    // Handle GPS coordinates directly
    if (
      location &&
      typeof location === "object" &&
      (location.gps || location.coordinates)
    ) {
      if (location.gps) {
        coordinates = [location.gps.lng || location.gps.long, location.gps.lat];
      } else if (location.coordinates) {
        coordinates = [
          location.coordinates.lng || location.coordinates.long,
          location.coordinates.lat,
        ];
      }
    }
    // Handle string location
    else if (typeof location === "string") {
      coordinates = await getCoordinates(location);
    } else {
      return next(new AppError("Invalid location format", 400));
    }

    // Save user's location for future notifications
    if (req.user && coordinates) {
      const locationObject = {
        address: typeof location === "string" ? location : "",
        coordinates: {
          lat: coordinates[1],
          lng: coordinates[0],
        },
      };

      await User.findByIdAndUpdate(
        req.user.id,
        { location: locationObject },
        { new: true }
      );

      console.log(`Updated location for user ${req.user.id}`);
    }

    // Continue with existing query logic
    const nearbyPosts = await Post.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: coordinates,
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
      // Only include non-expired and non-reserved posts
      expiresAt: { $gt: new Date() },
      status: { $ne: "Reserved" },
    })
      .populate("user", "username name photo_url")
      .populate("images")
      .sort("-createdAt");

    res.status(200).json({
      status: "success",
      message: "Nearby posts retrieved successfully",
      data: { posts: nearbyPosts, coordinates },
    });
  } catch (error) {
    console.error("Error in getNearbyPosts:", error);
    next(new AppError("Error fetching nearby posts", 500));
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate("images");
    if (!post) return next(new AppError("Post not found", 404));

    if (post.user.toString() !== req.user.id) {
      return next(new AppError("Unauthorized to delete this post", 403));
    }

    // Delete associated images from filesystem and database
    for (const image of post.images) {
      const filepath = `uploads/${image.filename}`;
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      await Image.findByIdAndDelete(image._id);
    }

    await post.deleteOne();
    res.status(200).json({
      status: "success",
      message: "Post and associated images deleted successfully",
    });
  } catch (err) {
    next(new AppError("Error deleting post", 500));
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError("Post not found", 404));

    if (post.user.toString() !== req.user.id)
      return next(new AppError("Unauthorized to update this post", 403));

    const oldStatus = post.status;
    const {
      post_type,
      status,
      category,
      description,
      quantity,
      quantity_unit,
      location,
      imageIds,
    } = req.body;

    // If imageIds is provided, verify they exist and belong to the user
    if (imageIds !== undefined) {
      const images = await Image.find({
        _id: { $in: imageIds },
        uploadedBy: req.user.id,
      });

      if (images.length !== imageIds.length) {
        return next(new AppError("One or more invalid image IDs", 400));
      }

      // Remove post reference from old images
      await Image.updateMany({ relatedPost: post._id }, { relatedPost: null });

      // Update new images with post reference
      await Image.updateMany(
        { _id: { $in: imageIds } },
        { relatedPost: post._id }
      );

      post.images = imageIds;
    }

    if (post_type !== undefined) post.post_type = post_type;
    if (status !== undefined) post.status = status;
    if (category !== undefined) post.category = category;
    if (description !== undefined) post.description = description;
    if (quantity !== undefined) post.quantity = quantity;
    if (quantity_unit !== undefined) post.quantity_unit = quantity_unit;
    if (location !== undefined) post.location = location;

    await post.save();

    // Check if status changed to stale and notify the owner
    if (status && status !== oldStatus && status === "stale") {
      await notificationService.createNotification(
        post.user,
        "POST_EXPIRED",
        `Your ${post.category} post is about to expire`,
        post._id
      );
    }

    // If post is reserved, notify the reserver about status change
    if (post.reserved_by && status && status !== oldStatus) {
      await notificationService.createNotification(
        post.reserved_by,
        "POST_STATUS_CHANGED",
        `The ${post.category} post you reserved has changed status to ${status}`,
        post._id
      );
    }

    // Populate the images and user before sending response
    await post.populate("images");
    await post.populate("user");

    res.status(200).json({
      status: "success",
      message: "Post updated successfully",
      data: { post },
    });
  } catch (error) {
    next(new AppError("Error updating post", 500));
  }
};

export const getPostById = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(new AppError("Post ID is required", 400));
    }

    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return next(new AppError("Invalid post ID format", 400));
    }

    const post = await Post.findById(req.params.id)
      .populate("user", "username photo_url")
      .populate("reserved_by", "username photo_url")
      .populate("images");

    if (!post) {
      return next(new AppError("Post not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Post retrieved successfully",
      data: { post },
    });
  } catch (error) {
    console.error("Error in getPostById:", error);
    next(new AppError("Error fetching post", 500));
  }
};

export const reservePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Get post with all needed populated fields
    const post = await Post.findById(postId)
      .populate("user", "username photo_url")
      .populate("images");

    if (!post) return next(new AppError("Post not found", 404));

    if (post.reserved_by) {
      return next(new AppError("Post already reserved", 400));
    }

    if (post.user.toString() === userId) {
      return next(new AppError("You can't reserve your own post", 403));
    }

    post.reserved_by = userId;
    await post.save();

    // Create notification for post owner
    await notificationService.createNotification(
      post.user._id,
      "POST_RESERVED",
      `Someone has reserved your ${post.category} post`,
      post._id
    );

    // Re-populate all fields after save
    await post.populate("user", "username photo_url");
    await post.populate("reserved_by", "username photo_url");
    await post.populate("images");

    res.status(200).json({
      status: "success",
      message: "Post reserved successfully",
      data: { post },
    });
  } catch (err) {
    console.error("Reserve post error:", err);
    next(new AppError("Error reserving post", 500));
  }
};

export const unreservePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId)
      .populate("user", "username photo_url")
      .populate("images");

    if (!post) return next(new AppError("Post not found", 404));

    if (!post.reserved_by) {
      return next(new AppError("This post is not reserved", 400));
    }

    if (post.reserved_by.toString() !== userId) {
      return next(
        new AppError("You can only unreserve your own reservation", 403)
      );
    }

    post.reserved_by = null;
    await post.save();

    // Create notification for post owner
    await notificationService.createNotification(
      post.user._id,
      "POST_UNRESERVED",
      `The reservation for your ${post.category} post has been cancelled`,
      post._id
    );

    await post.populate("images");

    res.status(200).json({
      status: "success",
      message: "Reservation removed successfully",
      data: { post },
    });
  } catch (err) {
    next(new AppError("Error unreserving post", 500));
  }
};

export const getReservedPosts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const posts = await Post.find({ reserved_by: userId })
      .populate("user")
      .populate("images");

    res.status(200).json({
      status: "success",
      message: "Reserved posts retrieved successfully",
      data: { posts },
    });
  } catch (error) {
    next(new AppError("Error fetching reserved posts", 500));
  }
};

export const getUserPosts = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = { user: userId };

    if (
      req.query.status &&
      ["fresh", "day_old", "stale"].includes(req.query.status)
    ) {
      filter.status = req.query.status;
    }

    if (
      req.query.post_type &&
      ["sell", "request"].includes(req.query.post_type)
    ) {
      filter.post_type = req.query.post_type;
    }

    const posts = await Post.find(filter)
      .populate("user", "username photo_url")
      .populate("reserved_by", "username photo_url")
      .populate("images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(filter);

    res.status(200).json({
      status: "success",
      message: "User posts retrieved successfully",
      data: {
        posts,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(new AppError("Error fetching user posts", 500));
  }
};

export const searchPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};

    // Handle search query
    if (req.query.q) {
      filter.$or = [
        { category: { $regex: req.query.q, $options: "i" } },
        { description: { $regex: req.query.q, $options: "i" } },
      ];
    }

    // Handle type/category filter
    if (req.query.type) {
      filter.category = req.query.type;
    }

    if (
      req.query.status &&
      ["fresh", "day_old", "stale"].includes(req.query.status)
    ) {
      filter.status = req.query.status;
    }

    if (
      req.query.post_type &&
      ["sell", "request"].includes(req.query.post_type)
    ) {
      filter.post_type = req.query.post_type;
    }

    if (req.query.reserved === "true") {
      filter.reserved_by = { $ne: null };
    } else if (req.query.reserved === "false") {
      filter.reserved_by = null;
    }

    // Handle location-based search if coordinates are provided
    if (req.query.lng && req.query.lat && req.query.maxDistance) {
      const lng = parseFloat(req.query.lng);
      const lat = parseFloat(req.query.lat);
      const maxDistance = parseInt(req.query.maxDistance);

      if (!isNaN(lng) && !isNaN(lat) && !isNaN(maxDistance)) {
        filter.location = {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
            $maxDistance: maxDistance * 1000, // Convert to meters
          },
        };
      }
    }

    const posts = await Post.find(filter)
      .populate("user", "username photo_url")
      .populate("reserved_by", "username photo_url")
      .populate("images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(filter);

    if (posts.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No posts found matching the criteria",
        data: {
          posts: [],
          pagination: {
            total: 0,
            page,
            limit,
            pages: 0,
          },
        },
      });
    }

    res.status(200).json({
      status: "success",
      message: "Posts retrieved successfully",
      data: {
        posts,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error in searchPosts:", error);
    next(new AppError("Error searching posts", 500));
  }
};
