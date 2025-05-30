import { useState } from "react";
import BreadItem from "./BreadItem";
import './BreadListing.css';
import PostDetailsModal from './PostDetailsModal';
import breadAPI from '../../api/breadAPI';

export default function BreadListingPage({ posts = [], onUpdate }) {
  const [modalPost, setModalPost] = useState(null);

  const handleUpdate = (action, post) => {
    if (action === 'viewDetails') {
      setModalPost(post);
    } else if (action === 'reserved' || action === 'unreserved') {
      // Update the local state of the post
      if (onUpdate) {
        onUpdate(action, post);
      }
    }
    if (onUpdate) onUpdate(action, post);
  };

  const handleDelete = async (post) => {
    try {
      await breadAPI.deletePost(post._id);
      if (onUpdate) {
        onUpdate('deleted', post);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      // Optionally show an error message to the user
    }
  };

  // Deduplicate posts by _id
  const uniqueBreads = posts.filter(
    (post, idx, arr) => arr.findIndex(p => p._id === post._id) === idx
  );

  return (
    <>
    <div className="bread-listing-container">
        {uniqueBreads.length === 0 ? (
        <div className="bread-listing-empty">No bread posts available.</div>
      ) : (
          uniqueBreads.map((bread) => (
            <BreadItem key={bread._id} post={bread} onUpdate={handleUpdate} onDelete={handleDelete} />
        ))
      )}
        {modalPost && (
          <PostDetailsModal post={modalPost} onClose={() => setModalPost(null)} />
        )}
    </div>
      {/* Pagination controls will go here */}
    </>
  );
}