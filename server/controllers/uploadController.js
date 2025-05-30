import AppError from "../utils/AppError.js";
import fs from "fs";
import Image from "../models/Image.js";

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError("Please upload a file", 400));
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;

    // Save image data to database
    const image = await Image.create({
      filename: req.file.filename,
      url: fileUrl,
      uploadedBy: req.user.id,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    res.status(200).json({
      status: "success",
      message: "File uploaded successfully",
      data: {
        image,
      },
    });
  } catch (error) {
    // If database save fails, delete the uploaded file
    if (req.file) {
      fs.unlink(`uploads/${req.file.filename}`, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
    next(new AppError("Error uploading file", 500));
  }
};

export const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new AppError("Please upload at least one file", 400));
    }

    const savedImages = [];
    for (const file of req.files) {
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
        file.filename
      }`;

      const image = await Image.create({
        filename: file.filename,
        url: fileUrl,
        uploadedBy: req.user.id,
        mimetype: file.mimetype,
        size: file.size,
      });

      savedImages.push(image);
    }

    res.status(200).json({
      status: "success",
      message: "Files uploaded successfully",
      data: {
        images: savedImages,
      },
    });
  } catch (error) {
    // If database save fails, delete all uploaded files
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(`uploads/${file.filename}`, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      });
    }
    next(new AppError("Error uploading files", 500));
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const { filename } = req.params;

    // Find the image in database
    const image = await Image.findOne({ filename });

    if (!image) {
      return next(new AppError("Image not found", 404));
    }

    // Check if user owns the image
    if (image.uploadedBy.toString() !== req.user.id) {
      return next(new AppError("Not authorized to delete this image", 403));
    }

    const filepath = `uploads/${filename}`;
    if (!fs.existsSync(filepath)) {
      return next(new AppError("File not found", 404));
    }

    // Delete file and database record
    await Promise.all([
      fs.promises.unlink(filepath),
      Image.findByIdAndDelete(image._id),
    ]);

    res.status(200).json({
      status: "success",
      message: "Image deleted successfully",
    });
  } catch (error) {
    next(new AppError("Error deleting image", 500));
  }
};
