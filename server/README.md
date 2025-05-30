# Anti-Wast Backend

## Description

This is the backend for the Anti-Wast project, a platform aimed at reducing food waste. This backend provides the API for user authentication, managing post listings, and image uploads.

## API Response Format

All API endpoints follow a standardized response format:

```json
{
  "status": "success" | "fail" | "error",
  "message": "Human readable message",
  "data": {
    // Response data (posts, user, etc.)
  }
}
```

- `status`:
  - "success" for successful operations
  - "fail" for client errors (4xx)
  - "error" for server errors (5xx)
- `message`: A human-readable description of the operation result
- `data`: Contains the actual response data (may be omitted for some error responses)

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT) for authentication
- Socket.IO for real-time chat
- bcryptjs for password hashing
- multer for file uploads
- CORS for handling Cross-Origin Resource Sharing
- dotenv for managing environment variables
- Swagger for API documentation

## Current Functionality

- **User Authentication:**

  - User registration (`/api/auth/register`) - Create a new user account
  - User login (`/api/auth/login`) - Returns a JWT upon successful login
  - User logout (`/api/auth/logout`) - Allows users to initiate logout (primarily client-side token removal)

- **User Management:**

  - Get user profile (`/api/user/me`) - Get current user's profile
  - Update user profile (`/api/user/profile`) - Update user profile information
  - Change password (`/api/user/password`) - Change user's password securely
  - Delete account (`/api/user/account`) - Delete user account with proper cleanup

- **Image Management:**

  - Upload single image (`/api/upload`) - Upload a single image file
  - Upload multiple images (`/api/upload/multiple`) - Upload up to 10 images at once
  - Delete image (`/api/upload/:filename`) - Delete a specific image
  - Automatic image cleanup when posts are deleted
  - Support for jpeg, jpg, and png formats
  - File size limit of 5MB per image

- **Post Management:**

  - Create a new post (`/api/posts/create`) - Create a new food item post with multiple images
  - Get all posts (`/api/posts/all`) - Get all posts with their images
  - Get a specific post (`/api/posts/:id`) - Get details of a specific post
  - Update a post (`/api/posts/update/:id`) - Update an existing post and its images
  - Delete a post (`/api/posts/delete/:id`) - Delete a specific post and its images
  - Get nearby posts (`/api/posts/nearby`) - Get posts near a specific location
  - Reserve a post (`/api/posts/reserve/:id`) - Reserve a post for collection
  - Unreserve a post (`/api/posts/unreserve/:id`) - Cancel a reservation
  - Get reserved posts (`/api/posts/reserved`) - Get posts reserved by current user
  - Get user posts (`/api/posts/user`) - Get posts by current user
  - Get posts by user ID (`/api/posts/user/:userId`) - Get posts by specific user
  - Search posts (`/api/posts/search`) - Search and filter posts by various criteria

- **Chat System:**

  - Send messages to other users (`/api/chat/send`)
  - Get chat history with a user (`/api/chat/messages/:userId`)
  - Mark messages as read (`/api/chat/messages/:messageId/read`)
  - Get unread message count (`/api/chat/unread`)
  - Real-time message delivery using Socket.IO
  - Read receipts
  - Message history pagination
  - Timestamp-based message filtering

- **Notifications:**
  - Get user notifications (`/api/notifications`)
  - Mark notification as read (`/api/notifications/:id/mark-read`)
  - Mark all notifications as read (`/api/notifications/mark-all-read`)
  - Real-time notification delivery for:
    - New posts in your area
    - Post reservations
    - Post status changes
    - Message notifications
    - System notifications

## Setup Instructions

1.  **Clone the repository:** `git clone <repository_url>`
2.  **Navigate to the backend folder:** `cd backend`
3.  **Install dependencies:** `npm install`
4.  **Create a `.env` file:** In the root of your project create a `.env` file with the following (replace with your actual values):
    ```
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_jwt_key
    PORT=5000
    ```
5.  **Run the server:** `npm start`

## API Documentation

API documentation is available via Swagger UI at `http://localhost:{PORT}/api-docs` when the server is running.

## API Endpoints

### Image Upload:

- **Upload Single Image**

  - `POST /api/upload`
  - Requires authentication
  - Content-Type: multipart/form-data
  - Form field: "image"
  - Response: `{ status, message, data: { image } }`

- **Upload Multiple Images**

  - `POST /api/upload/multiple`
  - Requires authentication
  - Content-Type: multipart/form-data
  - Form field: "images"
  - Max files: 10
  - Response: `{ status, message, data: { images } }`

- **Delete Image**
  - `DELETE /api/upload/:filename`
  - Requires authentication
  - Response: `{ status, message }`

### Authentication:

- **Register User**

  - `POST /api/auth/register`
  - Request body: `{ username, email, password, phone_number, photo_url }`
  - Response:
    ```json
    {
      "status": "success",
      "message": "User registered successfully",
      "data": {
        "token": "jwt_token",
        "user": {}
      }
    }
    ```

- **Login User**

  - `POST /api/auth/login`
  - Request body: `{ email, password }`
  - Response:
    ```json
    {
      "status": "success",
      "message": "Login successful",
      "data": {
        "token": "jwt_token",
        "user": {}
      }
    }
    ```

- **Logout User**
  - `POST /api/auth/logout`
  - Requires authentication
  - Response:
    ```json
    {
      "status": "success",
      "message": "Logout successful"
    }
    ```

### User Management:

- **Get Profile**

  - `GET /api/user/me`
  - Requires authentication
  - Response: User object

- **Update Profile**

  - `PUT /api/user/profile`
  - Requires authentication
  - Request body: `{ name, email, phone_number, photo_url }`
  - Response: `{ message, user }`

- **Change Password**

  - `PUT /api/user/password`
  - Requires authentication
  - Request body: `{ currentPassword, newPassword }`
  - Response: `{ message }`

- **Delete Account**
  - `DELETE /api/user/account`
  - Requires authentication
  - Request body: `{ password }`
  - Response: `{ message }`

### Post Management:

- **Create Post**

  - `POST /api/posts/create`
  - Requires authentication
  - Request body:
    ```json
    {
      "post_type": "sell",
      "status": "fresh",
      "category": "bread",
      "description": "Fresh bread",
      "quantity": 5,
      "location": {
        "type": "Point",
        "coordinates": [longitude, latitude]
      },
      "imageIds": ["image_id1", "image_id2"]
    }
    ```
  - Response: `{ message, post }`

- **Get All Posts**

  - `GET /api/posts/all`
  - Response: Array of posts

- **Get Post by ID**

  - `GET /api/posts/:id`
  - Response: Post object

- **Update Post**

  - `PUT /api/posts/update/:id`
  - Requires authentication (owner only)
  - Request body: post updates
  - Response: `{ message, post }`

- **Delete Post**

  - `DELETE /api/posts/delete/:id`
  - Requires authentication (owner only)
  - Response: `{ message }`

- **Get Nearby Posts**

  - `POST /api/posts/nearby`
  - Requires authentication
  - Request body: `{ location }`
  - Response: Array of posts

- **Reserve Post**

  - `PUT /api/posts/reserve/:id`
  - Requires authentication
  - Response: `{ message, post }`

- **Unreserve Post**

  - `PUT /api/posts/unreserve/:id`
  - Requires authentication
  - Response: `{ message, post }`

- **Get Reserved Posts**

  - `GET /api/posts/reserved`
  - Requires authentication
  - Response: Array of posts

- **Get User Posts**

  - `GET /api/posts/user`
  - Requires authentication
  - Query parameters: `page, limit, status, post_type`
  - Response: `{ posts, pagination }`

- **Get Posts by User ID**

  - `GET /api/posts/user/:userId`
  - Query parameters: `page, limit, status, post_type`
  - Response: `{ posts, pagination }`

- **Search Posts**
  - `GET /api/posts/search`
  - Query parameters: `search, status, post_type, reserved, lat, lng, maxDistance, page, limit`
  - Response: `{ posts, pagination }`

### Chat System:

- **Send Message**

  - `POST /api/chat/send`
  - Requires authentication
  - Request body: `{ recipientId, content }`
  - Response:
    ```json
    {
      "status": "success",
      "message": "Message sent successfully",
      "data": {
        "message": {
          "_id": "message_id",
          "sender": {
            "_id": "user_id",
            "username": "sender_name",
            "avatar": "url"
          },
          "recipient": {
            "_id": "user_id",
            "username": "recipient_name",
            "avatar": "url"
          },
          "content": "message text",
          "readBy": ["user_ids"],
          "createdAt": "timestamp"
        }
      }
    }
    ```

- **Get Messages**

  - `GET /api/chat/messages/:userId`
  - Requires authentication
  - Query parameters:
    - `page` (default: 1)
    - `limit` (default: 50)
    - `before` (timestamp)
    - `after` (timestamp)
  - Response: List of messages with sender/recipient details

- **Mark Message as Read**

  - `PUT /api/chat/messages/:messageId/read`
  - Requires authentication
  - Response: Updated message object with read status

- **Get Unread Count**
  - `GET /api/chat/unread`
  - Requires authentication
  - Response: Count of unread messages

### Real-time Events:

The system uses Socket.IO for real-time communication. Events include:

- `chat:message:new` - New chat message received
- `notification:new` - New notification received
- `post:reserved` - Post reservation status changed
- `post:status` - Post status updated

## WebSocket Authentication

To connect to WebSocket:

1. Establish Socket.IO connection with authentication token:

```javascript
const socket = io("http://localhost:5000", {
  auth: {
    token: "your_jwt_token",
  },
});
```

2. Listen for events:

```javascript
socket.on("chat:message:new", (message) => {
  // Handle new message
});

socket.on("notification:new", (notification) => {
  // Handle new notification
});
```

## Important Notes

- All endpoints with authentication require a valid JWT token in the `Authorization` header as a Bearer token
- All responses follow the standardized format described above
- Error responses include appropriate HTTP status codes and descriptive messages
- Validation errors will include details in the error message
- Images must be uploaded before creating/updating posts
- Images can only be associated with one post at a time
- When a post is deleted, all associated images are automatically deleted
- The system prevents users from deleting their accounts if they have posts that others have reserved

## Next Steps

- Add a rating/feedback system for users after collection
- Implement push notifications for reservations and updates
- Develop a messaging system between users
- Create admin dashboard and moderation tools

## Contributing

(Add your contributing guidelines here if applicable)

## License

(Add your license information here if applicable)
