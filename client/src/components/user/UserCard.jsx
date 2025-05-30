// src/components/user/UserCard.jsx
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

/**
 * User Card Component
 * @param {Object} props
 * @param {User} props.user - User object from your schema
 * @param {boolean} [props.showDetails] - Whether to show additional details
 */
export default function UserCard({ user, showDetails = false }) {
  // Determine role badge color with default handling
  const getRoleBadgeColor = () => {
    switch (user.role) {
      case "seller":
        return "bg-green-100 text-green-800";
      case "buyer":
        return "bg-blue-100 text-blue-800";
      case "both":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
      {/* Profile Image */}
      <div className="relative h-40 bg-gray-100">
        {/* <img
          src={user.photo_url || "/default-user.jpg"}
          alt={user.username}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "/default-user.jpg";
          }}
        /> */}
        {user.role && (
          <div className="absolute bottom-2 right-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor()}`}
            >
              {user.role.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {user.username}
        </h3>

        {showDetails && (
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            {user.phone_number && (
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {user.phone_number}
              </div>
            )}
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {user.email}
            </div>
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <Link
            to={`/user/${user._id}`}
            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            View Profile
          </Link>

          {/* This could be a button to message the user when chat is implemented */}
          <button className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full hover:bg-amber-200 transition">
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}

// PropTypes for better development experience
UserCard.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone_number: PropTypes.string,
    photo_url: PropTypes.string,
    role: PropTypes.oneOf(["buyer", "seller", "both"]),
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string,
  }).isRequired,
  showDetails: PropTypes.bool,
};
