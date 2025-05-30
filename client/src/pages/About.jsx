import { FaBreadSlice, FaHandshake, FaMapMarkerAlt } from 'react-icons/fa';
import './About.css';

export default function About() {
  return (
    <div className="about">
      <h1 className="about-title">About BreadShare</h1>
      
      <div className="about-content">
        <div className="about-section">
          <h2 className="about-section-title">Our Mission</h2>
          <p className="about-section-text">
            BreadShare is dedicated to reducing food waste and helping those in need by connecting
            people who have excess bread with those who can use it. Our platform makes it easy to
            share bread items within your local community, promoting sustainability and community
            support.
          </p>
        </div>

        <div className="about-section">
          <h2 className="about-section-title">How It Works</h2>
          <p className="about-section-text">
            Simply create a post to offer bread items or browse existing posts to find what you need.
            Connect with other users, arrange pickup or delivery, and help reduce food waste while
            supporting your community. Our platform makes sharing bread items simple and efficient.
          </p>
        </div>
      </div>

      <div className="about-features">
        <div className="about-feature">
          <FaBreadSlice className="about-feature-icon" />
          <h3 className="about-feature-title">Share Bread</h3>
          <p className="about-feature-text">
            Post your excess bread items and help reduce food waste in your community.
          </p>
        </div>

        <div className="about-feature">
          <FaHandshake className="about-feature-icon" />
          <h3 className="about-feature-title">Connect</h3>
          <p className="about-feature-text">
            Easily connect with other users to arrange pickup or delivery of bread items.
          </p>
        </div>

        <div className="about-feature">
          <FaMapMarkerAlt className="about-feature-icon" />
          <h3 className="about-feature-title">Local Focus</h3>
          <p className="about-feature-text">
            Find and share bread items within your local area, building stronger communities.
          </p>
        </div>
      </div>
    </div>
  );
}
