import React, { useEffect, useRef } from 'react';
import './PostDetailsModal.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const fallbackImg = '/no-image.png';

export default function PostDetailsModal({ post, onClose }) {
  const modalRef = useRef();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) onClose();
  };

  const images = post.images && post.images.length > 0 ? post.images : [{ url: fallbackImg }];

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="post-modal-backdrop" ref={modalRef} onClick={handleBackdropClick}>
      <div className="post-modal-card">
        <div className="post-modal-image-wrapper">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={10}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            loop={images.length > 1}
          >
            {images.map((img, idx) => (
              <SwiperSlide key={img._id || idx}>
                <img
                  src={img.url || (img.filename ? `/uploads/${img.filename}` : fallbackImg)}
            alt={post.title || 'Bread post'}
            className="post-modal-image"
            onError={e => { e.target.onerror = null; e.target.src = fallbackImg; }}
          />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        
        <div className="post-modal-content">
          <button className="post-modal-close" onClick={onClose}>&times;</button>
          
          <div>
            <h2 className="post-modal-title">
              {post.title || (post.post_type === 'giveaway' ? 'Bread Giveaway' : 'Bread Request')}
            </h2>
            
          <div className="post-modal-badges">
              <span className="post-modal-badge post-modal-badge-type">
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
                  {post.post_type === 'giveaway' ? 'redeem' : 'shopping_cart'}
                </span>
                {post.post_type === 'giveaway' ? 'Giveaway' : 'Request'}
              </span>
              <span className={`post-modal-badge post-modal-badge-${post.status}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
                  {post.status === 'fresh' ? 'new_releases' : post.status === 'day_old' ? 'schedule' : 'warning'}
                </span>
                {post.status}
              </span>
              {post.price && (
                <span className="post-modal-badge post-modal-badge-price">
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
                    payments
                  </span>
                  ${parseFloat(post.price).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <p className="post-modal-description">{post.description}</p>

          <div className="post-modal-info">
            <div>
              <strong>
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '0.35rem' }}>
                  inventory_2
                </span>
                Quantity:
              </strong>
              {post.quantity} {post.quantity_unit}
            </div>
            {post.province && (
              <div>
                <strong>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '0.35rem' }}>
                    location_on
                  </span>
                  Province:
                </strong>
                {post.province}
              </div>
            )}
            {post.address && (
              <div>
                <strong>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '0.35rem' }}>
                    home
                  </span>
                  Address:
                </strong>
                {post.address}
              </div>
            )}
            <div>
              <strong>
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '0.35rem' }}>
                  schedule
                </span>
                Posted:
              </strong>
              {formatDate(post.createdAt)}
            </div>
          </div>

          <div className="post-modal-user">
            <img
              src={post.user?.photo_url || '/default-avatar.png'}
              alt={post.user?.username || 'User'}
              className="post-modal-avatar"
            />
            <div>
            <span className="post-modal-username">{post.user?.username || 'Anonymous'}</span>
              {post.user?.email && (
                <div style={{ fontSize: '0.95rem', color: '#6b7280', marginTop: '0.2rem' }}>
                  {post.user.email}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}