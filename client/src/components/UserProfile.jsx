import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { userAPI } from "../api/userAPI";
import { breadAPI } from "../api/breadAPI";
import { uploadAPI } from "../api/uploadAPI";
import BreadItem from "./bread/BreadItem";
import LoadingSpinner from "./LoadingSpinner";
import "./UserProfile.css";

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser, updateUser } = useApp();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [updateError, setUpdateError] = useState("");

  const isOwnProfile = !userId || (currentUser && userId === currentUser._id);

  useEffect(() => {
    loadProfile();
  }, [userId, currentUser]);

  useEffect(() => {
    if (profileUser) {
      setEditForm({
        username: profileUser.username || "",
        email: profileUser.email || "",
        phone: profileUser.phone || "",
      });
    }
  }, [profileUser]);

  useEffect(() => {
    if (profileUser) {
      loadUserPosts(activeTab);
    }
  }, [profileUser, activeTab]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isOwnProfile) {
        setProfileUser({
          ...currentUser,
        });
      } else {
        const userData = await userAPI.getUserById(userId);
        const user = userData.data || userData;

        setProfileUser({
          ...user,
        });
      }
    } catch (err) {
      console.error("Profile load error:", err);
      setError(
        err.message || "Failed to load profile. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async (status) => {
    try {
      setLoading(true);
      const response = await breadAPI.getUserPosts(profileUser._id, { status });
      const postsData =
        response?.data?.data?.posts || response?.data?.posts || [];
      setPosts(postsData);
    } catch (err) {
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadProgress(0);

      // If there's an existing photo, delete it first
      if (profileUser.photo_url) {
        const filename = profileUser.photo_url.split("/").pop();
        await uploadAPI.deleteImage(filename);
      }

      // Upload the new image
      const response = await uploadAPI.uploadSingleImage(file);
      const uploadedPhotoUrl = response.data.image.url;

      // Update user profile with new photo URL
      const updatedUser = await userAPI.updateProfile({
        photo_url: uploadedPhotoUrl,
      });

      // Use the updated user data directly
      const processedUser = {
        ...updatedUser,
        photo_url: uploadedPhotoUrl,
      };

      setProfileUser(processedUser);

      // Update global user state if it's own profile
      if (isOwnProfile) {
        updateUser({
          ...currentUser,
          ...processedUser,
          photo_url: uploadedPhotoUrl,
        });
      }

      setUploadProgress(100);

      // Show success message
      setUpdateSuccess("Profile picture updated successfully!");
      setTimeout(() => setUpdateSuccess(""), 3000);
    } catch (err) {
      console.error("Photo update error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update profile picture. Please try again."
      );
      setUploadProgress(0);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdateError("");
    setUpdateSuccess("");

    try {
      const updates = {
        username: editForm.username.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone ? editForm.phone.trim() : "",
      };

      const updatedUser = await userAPI.updateProfile(updates);

      // Update local state
      setProfileUser((prev) => ({
        ...prev,
        ...updatedUser,
        username: updatedUser.username || updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      }));

      // Update global user state if it's own profile
      if (isOwnProfile) {
        updateUser({
          ...currentUser,
          ...updatedUser,
        });
      }

      setUpdateSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);
      setUpdateError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setUpdateError("");
    setUpdateSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setUpdateError("New passwords do not match");
      return;
    }

    try {
      await userAPI.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setUpdateSuccess("Password updated successfully!");
      setTimeout(() => setUpdateSuccess(""), 3000);
    } catch (err) {
      setUpdateError(
        err.response?.data?.message || "Failed to update password"
      );
    }
  };

  const handleDelete = async (post) => {
    try {
      await breadAPI.deletePost(post._id);
      // Refresh the posts list after deletion
      loadUserPosts(activeTab);
    } catch (err) {
      console.error("Failed to delete post:", err);
      setError("Failed to delete post. Please try again.");
    }
  };

  if (loading && !profileUser) {
    return (
      <div className="user-profile-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-error">
        <div className="user-profile-error-content">
          <p className="user-profile-error-text">{error}</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="user-profile-not-found">
        <p>User not found</p>
      </div>
    );
  }
  return (
    <div className="user-profile">
      <div className="user-profile-container">
        <div className="user-profile-header">
          <div className="user-profile-info">
            <div className="user-profile-avatar-container">
              <img
                src={profileUser.photo_url || "/no-image.png"}
                alt={profileUser.username}
                className="user-profile-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/no-image.png";
                }}
              />
              {isOwnProfile && (
                <label className="user-profile-avatar-upload">
                  <input
                    type="file"
                    className="user-profile-avatar-input"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </label>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="user-profile-upload-progress">
                  <div
                    className="user-profile-upload-progress-bar"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
            <div className="user-profile-details">
              <h1>
                <span className="material-symbols-outlined">
                  account_circle
                </span>
                {profileUser.username}
              </h1>
              <div className="user-profile-email">
                <span className="material-symbols-outlined">mail</span>
                {profileUser.email}
              </div>
              <p className="user-profile-date">
                <span className="material-symbols-outlined">
                  calendar_today
                </span>
                Member since{" "}
                {new Date(profileUser.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {isOwnProfile && (
            <div className="user-profile-edit-wrapper">
              <button
                className="user-profile-edit-button"
                onClick={() => setIsEditing(!isEditing)}
              >
                <span className="material-symbols-outlined">
                  {isEditing ? "close" : "edit"}
                </span>
                {isEditing ? "Cancel Editing" : "Edit Profile"}
              </button>
            </div>
          )}
        </div>

        {isOwnProfile && isEditing && (
          <div className="user-profile-edit-section">
            {updateSuccess && (
              <div className="user-profile-message success">
                <span className="material-symbols-outlined">check_circle</span>
                {updateSuccess}
              </div>
            )}
            {updateError && (
              <div className="user-profile-message error">
                <span className="material-symbols-outlined">error</span>
                {updateError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="user-profile-form">
              <h2>
                <span className="material-symbols-outlined">person</span>
                Edit Profile Information
              </h2>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone (optional)</label>
                <input
                  type="tel"
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                />
              </div>
              <button type="submit" className="user-profile-submit-button">
                Update Profile
              </button>
            </form>

            <form onSubmit={handlePasswordSubmit} className="user-profile-form">
              <h2>Change Password</h2>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <button type="submit" className="user-profile-submit-button">
                Update Password
              </button>
            </form>
          </div>
        )}

        <div className="user-profile-tabs">
          <div className="user-profile-tab-container">
            <button
              className={`user-profile-tab ${
                activeTab === "active" ? "user-profile-tab-active" : ""
              }`}
              onClick={() => setActiveTab("active")}
            >
              Active Posts
            </button>
            {/* Completed Posts Tab - Temporarily disabled
            <button
              className={`user-profile-tab ${
                activeTab === 'completed' ? 'user-profile-tab-active' : ''
              }`}
              onClick={() => setActiveTab('completed')}
            >
              Completed Posts
            </button>
            */}
          </div>
        </div>

        <div className="user-profile-content">
          {loading ? (
            <div className="user-profile-posts-loading">
              <LoadingSpinner />
            </div>
          ) : posts.length === 0 ? (
            <div className="user-profile-no-posts">
              <span className="material-symbols-outlined">inventory_2</span>
              <p>No posts found</p>
              {isOwnProfile && (
                <Link
                  to="/posts/create"
                  className="filter-btn filter-btn-primary"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Create Your First Post
                </Link>
              )}
            </div>
          ) : (
            <div className="user-profile-posts-grid">
              {posts.map((post) => (
                <div key={post._id} className="user-profile-post-card">
                  <BreadItem
                    post={post}
                    onDelete={handleDelete}
                    onEdit={() => {}}
                    onUpdate={() => loadUserPosts(activeTab)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
