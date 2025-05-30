import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadAPI } from "../../api/uploadAPI";
import { useApp } from "../../context/AppContext";
import "../auth/RegisterForm.css";
import { userAPI } from "../../api/userAPI";

const AddPhoto = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useApp();
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(user?.photo_url || null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (photoUrl) {
        const filename = photoUrl.split("/").pop();
        await uploadAPI.deleteImage(filename);
      }
      const response = await uploadAPI.uploadSingleImage(file);
      const uploadedPhotoUrl = response.data.image.url;
      setPhoto(file);
      setPhotoUrl(uploadedPhotoUrl);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to upload photo. Please try again.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (photoUrl) {
        const user = await userAPI.updateProfile({ photo_url: photoUrl });
        if (updateUser) {
          await updateUser(user);
        }
      }
      navigate("/");
    } catch (err) {
      setError("Failed to update profile photo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-container">
        <div className="register-header">
          <h1 className="register-title">Add a Profile Photo</h1>
          <p className="register-subtitle">
            You can skip this step and add a photo later.
          </p>
        </div>
        {error && (
          <div className="register-error">
            <p className="register-error-text">{error}</p>
          </div>
        )}
        <form onSubmit={handleSave} className="register-form">
          <div className="register-photo-section">
            <div className="register-photo-container">
              <img
                src={photoPreview || photoUrl || "/no-image.png"}
                alt="Profile preview"
                className="register-photo-preview"
              />
            </div>
            <label className="register-photo-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="register-photo-input"
              />
              <span className="register-photo-upload-text">
                <span className="material-symbols-outlined register-btn-icon">photo_camera</span>
                {photo ? "Change Photo" : "Add Photo"}
              </span>
            </label>
          </div>
          <button type="submit" disabled={loading} className="register-submit">
            <span className="material-symbols-outlined register-btn-icon">check_circle</span>
            {loading ? "Saving..." : "Save and Continue"}
          </button>
          <button
            type="button"
            className="register-submit"
            onClick={() => navigate("/")}
          >
            <span className="material-symbols-outlined register-btn-icon">skip_next</span>
            Skip
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPhoto;
