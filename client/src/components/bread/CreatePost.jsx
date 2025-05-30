import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { breadAPI } from "../../api/breadAPI";
import "./CreatePost.css";

const WILAYAS = [
  "Adrar",
  "Chlef",
  "Laghouat",
  "Oum El Bouaghi",
  "Batna",
  "Béjaïa",
  "Biskra",
  "Béchar",
  "Blida",
  "Bouira",
  "Tamanrasset",
  "Tébessa",
  "Tlemcen",
  "Tiaret",
  "Tizi Ouzou",
  "Algiers",
  "Djelfa",
  "Jijel",
  "Sétif",
  "Saïda",
  "Skikda",
  "Sidi Bel Abbès",
  "Annaba",
  "Guelma",
  "Constantine",
  "Médéa",
  "Mostaganem",
  "M-Sila",
  "Mascara",
  "Ouargla",
  "Oran",
  "El Bayadh",
  "Illizi",
  "Bordj Bou Arréridj",
  "Boumerdès",
  "El Tarf",
  "Tindouf",
  "Tissemsilt",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Aïn Defla",
  "Naâma",
  "Aïn Témouchent",
  "Ghardaïa",
  "Relizane",
];

export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    post_type: "giveaway", // Changed from 'sell' to 'giveaway'
    description: "",
    quantity: 1,
    quantity_unit: "pieces",
    status: "fresh",
    category: "bread",
    images: [],
    address: "",
    province: "",
  });
  const [userLocation, setUserLocation] = useState(null);
  const [imageIds, setImageIds] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [imageFilenames, setImageFilenames] = useState([]); // Add state for filenames
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  // Get user's location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.longitude,
            position.coords.latitude,
          ]);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Please enable location services to create a post");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  }, []);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: files,
    }));
    if (files.length === 0) {
      setImageIds([]);
      setImageUploadError(null);
      setImageUploadProgress(0);
      return;
    }
    setImageUploadLoading(true);
    setImageUploadError(null);
    setImageUploadProgress(0);
    try {
      const uploadFormData = new FormData();
      files.forEach((file) => uploadFormData.append("images", file));
      const res = await breadAPI.uploadImages(
        uploadFormData,
        setImageUploadProgress
      );

      // Extract images from the response based on the actual structure
      // {status, message, data: {images: [{_id, filename, url, ...}]}};
      const uploadedImages = res?.data?.images;

      if (!uploadedImages || !Array.isArray(uploadedImages)) {
        console.error("Unexpected response structure:", res);
        throw new Error("Invalid response from server");
      }
      const ids = uploadedImages.map((img) => img._id);
      const urls = uploadedImages.map((img) => img.url);
      const filenames = uploadedImages.map((img) => img.filename);

      if (ids.length === files.length) {
        setImageIds(ids);
        setImageUrls(urls); // Store the URLs for display
        setImageFilenames(filenames); // Store filenames for deletion
        setImageUploadError(null);
        e.target.value = ""; // Clear the file input after successful upload
      } else {
        console.warn(
          `Mismatch: ${ids.length} images processed, ${files.length} uploaded`
        );
        setImageIds(ids); // Still use the IDs we got back - they were uploaded successfully
        setImageUrls(urls); // Store whatever URLs we got
        setImageFilenames(filenames); // Store filenames for deletion
        setImageUploadError(
          `Note: ${ids.length} of ${files.length} images processed. Your post will include the processed images.`
        );
      }
    } catch (err) {
      console.error("Image upload error:", err);
      setImageUploadError(err.message || "Failed to upload images");
      setImageIds([]);
    } finally {
      setImageUploadLoading(false);
      setImageUploadProgress(0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add("dragging");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("dragging");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("dragging");

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      handleImageChange({ target: { files } });
    }
  };

  const validateForm = () => {
    if (!formData.post_type) return "Post type is required";
    if (!formData.status) return "Status is required";
    if (!formData.quantity || formData.quantity < 1)
      return "Quantity must be at least 1";
    if (!userLocation) return "Location is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (
      formData.images.length > 0 &&
      (imageIds.length !== formData.images.length || imageUploadLoading)
    ) {
      setError("Please wait for images to finish uploading.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const postData = {
        post_type: formData.post_type, // now can be 'giveaway' or 'request'
        status: formData.status,
        category: formData.category,
        description: formData.description,
        quantity: formData.quantity,
        quantity_unit: formData.quantity_unit,
        location: {
          type: "Point",
          coordinates: userLocation,
        },
        address: formData.address,
        province: formData.province,
        imageIds: imageIds,
        // Include image URLs for reference
        images: imageUrls,
      };

      await breadAPI.create(postData);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-container">
      <h1 className="create-post-title">Create New Post</h1>

      {error && (
        <div className="create-post-error">
          <p className="create-post-error-text">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="create-post-form-group">
          <label className="create-post-label">Post Type</label>
          <select
            value={formData.post_type}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, post_type: e.target.value }))
            }
            className="create-post-select"
          >
            <option value="giveaway">Giveaway</option>
            <option value="request">Request</option>
          </select>
        </div>
        <div className="create-post-form-group">
          <label className="create-post-label">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={4}
            className="create-post-textarea"
            placeholder="Describe what you're offering or requesting"
            maxLength={1000}
          />
        </div>
        <div className="create-post-grid">
          <div className="create-post-form-group">
            <label className="create-post-label">Quantity</label>
            <input
              type="number"
              min="1"
              required
              value={formData.quantity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  quantity: parseInt(e.target.value) || 1,
                }))
              }
              className="create-post-input"
            />
          </div>

          <div className="create-post-form-group">
            <label className="create-post-label">Unit</label>
            <select
              value={formData.quantity_unit}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  quantity_unit: e.target.value,
                }))
              }
              className="create-post-select"
            >
              <option value="pieces">Pieces</option>
              <option value="loaves">Loaves</option>
              <option value="kg">Kilograms</option>
              <option value="g">Grams</option>
              <option value="boxes">Boxes</option>
              <option value="packages">Packages</option>
            </select>
          </div>
        </div>
        <div className="create-post-form-group">
          <label className="create-post-label">Status</label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, status: e.target.value }))
            }
            className="create-post-select"
          >
            <option value="fresh">Fresh</option>
            <option value="day_old">Day Old</option>
            <option value="stale">Stale</option>
          </select>
        </div>
        <div className="create-post-grid">
          <div className="create-post-form-group">
            <label className="create-post-label">Province</label>
            <select
              value={formData.province || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, province: e.target.value }))
              }
              className="create-post-select"
              required
            >
              <option value="">Select Province</option>
              {WILAYAS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
          <div className="create-post-form-group">
            <label className="create-post-label">Address (Optional)</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="Enter a descriptive address"
              className="create-post-input"
            />
          </div>
        </div>
        <div className="create-post-form-group">
          <label className="create-post-label">Images (Optional)</label>
          <div
            className="create-post-image-dropzone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("image-upload").click()}
          >
            <span className="material-symbols-outlined create-post-image-icon">
              add_photo_alternate
            </span>
            <p className="create-post-image-text">
              Drag and drop your images here, or click to select files
            </p>
            <p className="create-post-image-subtext">
              Supports: JPG, PNG • Max size: 5MB per image
            </p>
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="create-post-input"
              style={{ display: "none" }}
              disabled={imageUploadLoading}
            />
          </div>

          {imageUploadLoading && (
            <div className="create-post-image-progress">
              <div className="create-post-progress-bar">
                <div
                  className="create-post-progress-fill"
                  style={{ width: `${imageUploadProgress}%` }}
                />
              </div>
              <p className="create-post-progress-text">
                Uploading... {imageUploadProgress}%
              </p>
            </div>
          )}

          {imageUploadError && (
            <p className="create-post-error-text">{imageUploadError}</p>
          )}

          {imageUrls.length > 0 && (
            <div className="create-post-image-previews">
              {imageUrls.map((url, index) => (
                <div key={index} className="create-post-image-preview">
                  <img
                    src={url}
                    alt={`Upload preview ${index + 1}`}
                    className="create-post-preview-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/no-image.png";
                    }}
                  />
                  <button
                    type="button"
                    className="create-post-image-remove"
                    onClick={() => {
                      const newUrls = [...imageUrls];
                      const newIds = [...imageIds];
                      const newFilenames = [...imageFilenames];

                      // Remove the image from all arrays
                      newUrls.splice(index, 1);
                      newIds.splice(index, 1);
                      newFilenames.splice(index, 1);

                      setImageUrls(newUrls);
                      setImageIds(newIds);
                      setImageFilenames(newFilenames);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="create-post-actions">
          {" "}
          <button
            type="button"
            onClick={async () => {
              // Show confirmation if there are changes or uploaded images
              if (
                imageFilenames.length > 0 ||
                formData.description ||
                formData.address
              ) {
                if (imageFilenames.length > 0) {
                  try {
                    setLoading(true);
                    await breadAPI.deleteImages(imageFilenames);
                  } catch (err) {
                    console.error("Failed to clean up images:", err);
                  } finally {
                    setLoading(false);
                  }
                }
              }
              // Navigate back to home page
              navigate("/");
            }}
            className="create-post-button create-post-button-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="create-post-button create-post-button-primary"
          >
            {loading ? "Creating..." : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
