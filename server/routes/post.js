// /routes/post.js

import { Router } from "express";
const router = Router();
import {
  createPost,
  getAllPosts,
  deletePost,
  updatePost,
  getPostById,
  getNearbyPosts,
  reservePost,
  unreservePost,
  getReservedPosts,
  getUserPosts,
  searchPosts,
} from "../controllers/postController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { body } from "express-validator";

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - post_type
 *         - status
 *         - category
 *         - quantity
 *         - quantity_unit
 *         - location
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the post
 *         post_type:
 *           type: string
 *           enum: [sell, request]
 *           description: Type of post (sell or request)
 *         status:
 *           type: string
 *           enum: [fresh, day_old, stale]
 *           description: The status of the item
 *         category:
 *           type: string
 *           default: bread
 *           description: The category of the item
 *         description:
 *           type: string
 *           description: Additional details about the post
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Image'
 *           description: Array of images attached to the post
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: The quantity of the item
 *         quantity_unit:
 *           type: string
 *           enum: [kg, g, pieces, loaves, boxes, packages]
 *           default: pieces
 *           description: The unit of measurement for the quantity
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *             photo_url:
 *               type: string
 *           description: The user who created the post
 *         reserved_by:
 *           type: object
 *           nullable: true
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *             photo_url:
 *               type: string
 *           description: The user who reserved the post (if any)
 *         location:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [Point]
 *               description: GeoJSON type
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               minItems: 2
 *               maxItems: 2
 *               description: [longitude, latitude]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the post was created
 *       example:
 *         _id: "60d21b4967d0d8992e610c85"
 *         post_type: "sell"
 *         status: "fresh"
 *         category: "bread"
 *         description: "Fresh baguettes available"
 *         images: [
 *           {
 *             "_id": "60d21b4967d0d8992e610c86",
 *             "filename": "image-1234567890.jpg",
 *             "url": "http://localhost:5000/uploads/image-1234567890.jpg"
 *           }
 *         ]
 *         quantity: 5
 *         quantity_unit: "pieces"
 *         user: {
 *           "_id": "60d21b4967d0d8992e610c80",
 *           "username": "john_doe",
 *           "photo_url": "http://example.com/profile.jpg"
 *         }
 *         reserved_by: null
 *         location: {
 *           "type": "Point",
 *           "coordinates": [10.1234, 36.8016]
 *         }
 *         createdAt: "2025-04-27T12:00:00.000Z"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post management API
 */

/**
 * @swagger
 * /api/posts/create:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - post_type
 *               - status
 *               - quantity
 *               - location
 *             properties:
 *               imageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image IDs previously uploaded via /api/upload endpoints
 *               post_type:
 *                 type: string
 *                 enum: [sell, request]
 *               status:
 *                 type: string
 *                 enum: [fresh, day_old, stale]
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               quantity_unit:
 *                 type: string
 *                 enum: [kg, g, pieces, loaves, boxes, packages]
 *                 default: pieces
 *               location:
 *                 type: object
 *                 required:
 *                   - type
 *                   - coordinates
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  "/create",
  authMiddleware,
  [
    body("post_type")
      .notEmpty()
      .withMessage("Post type is required")
      .isIn(["giveaway", "request"])
      .withMessage('Post type must be either "sell" or "request"'),
    body("status")
      .notEmpty()
      .withMessage("Status is required")
      .isIn(["fresh", "day_old", "stale"])
      .withMessage('Status must be one of: "fresh", "day_old", "stale"'),
    body("category")
      .default("bread")
      .isString()
      .withMessage("Category must be a string"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string")
      .isLength({ max: 1000 })
      .withMessage("Description must not exceed 1000 characters"),
    body("quantity")
      .notEmpty()
      .withMessage("Quantity is required")
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
    body("location")
      .notEmpty()
      .withMessage("Location is required")
      .isObject()
      .withMessage("Location must be an object"),
    body("location.type")
      .notEmpty()
      .withMessage("Location type is required")
      .equals("Point")
      .withMessage('Location type must be "Point"'),
    body("location.coordinates")
      .notEmpty()
      .withMessage("Location coordinates are required")
      .isArray()
      .withMessage("Location coordinates must be an array")
      .custom((value) => {
        if (!Array.isArray(value) || value.length !== 2) {
          throw new Error(
            "Location coordinates must have exactly two numbers (longitude and latitude)"
          );
        }
        const [lng, lat] = value;
        if (typeof lng !== "number" || typeof lat !== "number") {
          throw new Error("Coordinates must be numbers");
        }
        if (lng < -180 || lng > 180) {
          throw new Error("Longitude must be between -180 and 180");
        }
        if (lat < -90 || lat > 90) {
          throw new Error("Latitude must be between -90 and 90");
        }
        return true;
      }),
    body("location.coordinates.*")
      .isNumeric()
      .withMessage("Coordinates must be numbers"),
  ],
  createPost
);

/**
 * @swagger
 * /api/posts/nearby:
 *   post:
 *     summary: Find nearby posts based on location
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: object
 *                 properties:
 *                   gps:
 *                     type: object
 *                     properties:
 *                       latitude:
 *                         type: number
 *                       longitude:
 *                         type: number
 *                   state:
 *                     type: string
 *                     description: State name to geocode
 *     responses:
 *       200:
 *         description: List of nearby posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post("/nearby", getNearbyPosts);

/**
 * @swagger
 * /api/posts/all:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of all posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Server error
 */
router.get("/all", getAllPosts);

/**
 * @swagger
 * /api/posts/delete/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the post owner
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.delete("/delete/:id", authMiddleware, deletePost);

/**
 * @swagger
 * /api/posts/update/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image IDs previously uploaded via /api/upload endpoints
 *               post_type:
 *                 type: string
 *                 enum: [sell, request]
 *               status:
 *                 type: string
 *                 enum: [fresh, day_old, stale]
 *               photo_url:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the post owner
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.put("/update/:id", authMiddleware, updatePost);

/**
 * @swagger
 * /api/posts/reserve/{id}:
 *   put:
 *     summary: Reserve a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post reserved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Post already reserved or trying to reserve own post
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.put("/reserve/:id", authMiddleware, reservePost);

/**
 * @swagger
 * /api/posts/unreserve/{id}:
 *   put:
 *     summary: Unreserve a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Reservation removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Post is not reserved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the user who reserved the post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.put("/unreserve/:id", authMiddleware, unreservePost);

/**
 * @swagger
 * /api/posts/reserved:
 *   get:
 *     summary: Get posts reserved by the current user
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reserved posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/reserved", authMiddleware, getReservedPosts);

/**
 * @swagger
 * /api/posts/user:
 *   get:
 *     summary: Get posts by current user
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [fresh, day_old, stale]
 *         description: Filter by status
 *       - in: query
 *         name: post_type
 *         schema:
 *           type: string
 *           enum: [sell, request]
 *         description: Filter by post type
 *     responses:
 *       200:
 *         description: List of posts by current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/user", authMiddleware, getUserPosts);

/**
 * @swagger
 * /api/posts/user/{userId}:
 *   get:
 *     summary: Get posts by specific user
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [fresh, day_old, stale]
 *         description: Filter by status
 *       - in: query
 *         name: post_type
 *         schema:
 *           type: string
 *           enum: [sell, request]
 *         description: Filter by post type
 *     responses:
 *       200:
 *         description: List of posts by specific user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/user/:userId", getUserPosts);

/**
 * @swagger
 * /api/posts/search:
 *   get:
 *     summary: Search and filter posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Text to search for in posts
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [fresh, day_old, stale]
 *         description: Filter by status
 *       - in: query
 *         name: post_type
 *         schema:
 *           type: string
 *           enum: [sell, request]
 *         description: Filter by post type
 *       - in: query
 *         name: reserved
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by reservation status
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude coordinate for location-based search
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitude coordinate for location-based search
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: integer
 *         description: Maximum distance in kilometers for location-based search
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of filtered posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get("/search", searchPosts);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     post:
 *                       $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid post ID format
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getPostById);

export default router;
