/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} username
 * @property {string} email
 * @property {string} [avatar]
 * @property {string} [phone]
 * @property {string} [address]
 * @property {boolean} [emailVerified]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} BreadPost
 * @property {string} _id
 * @property {User} user
 * @property {string} title
 * @property {string} description
 * @property {number} quantity
 * @property {string} quantity_unit
 * @property {'fresh'|'day_old'|'expired'} status
 * @property {'offer'|'request'} type
 * @property {string[]} images
 * @property {Object} location
 * @property {string} location.type
 * @property {[number, number]} location.coordinates
 * @property {string} [address]
 * @property {User} [reserved_by]
 * @property {boolean} is_reserved
 * @property {boolean} is_completed
 * @property {number} [distance]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Message
 * @property {string} _id
 * @property {string} conversation_id
 * @property {User} sender
 * @property {User} recipient
 * @property {string} content
 * @property {boolean} read
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} Conversation
 * @property {string} _id
 * @property {User[]} participants
 * @property {Message} lastMessage
 * @property {number} unreadCount
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Notification
 * @property {string} _id
 * @property {User} user
 * @property {'post_reserved'|'reservation_cancelled'|'new_message'|'post_completed'} type
 * @property {string} message
 * @property {boolean} read
 * @property {BreadPost} [post]
 * @property {Message} [message]
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} ApiError
 * @property {string} message
 * @property {number} [status]
 * @property {Object} [errors]
 * @property {string} [conflictField]
 * @property {boolean} [isNetworkError]
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} token
 * @property {User} user
 */

export {};
