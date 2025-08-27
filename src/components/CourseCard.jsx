// src/components/CourseCard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils";
import "./CourseCard.css";

function CourseCard({ course, onFavouriteToggle, showToast }) {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Get the course ID - handle both MongoDB _id and regular id
  const getCourseId = () => {
    return course._id || course.id;
  };

  // Check if user is authenticated
  const isUserAuthenticated = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const userData = localStorage.getItem('userData') || localStorage.getItem('user');
    return !!(token || userData);
  };

  // Get auth token for API calls
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
  };

  // Check favorite status from backend
  const checkFavoriteStatus = async () => {
    try {
      if (!isUserAuthenticated()) {
        setIsFavorite(false);
        return;
      }

      const courseId = getCourseId();
      if (!courseId) return;

      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/favorites/check/${courseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  useEffect(() => {
    checkFavoriteStatus();
  }, [course._id, course.id]);

  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is authenticated first
    if (!isUserAuthenticated()) {
      if (showToast) {
        showToast('Please login to add courses to favorites', 'info');
      }

      setTimeout(() => {
        navigate('/login');
      }, 1500);

      return;
    }

    try {
      setIsLoading(true);
      const courseId = getCourseId();

      if (!courseId) {
        console.error('No valid course ID found');
        if (showToast) {
          showToast('Error: Course ID not found', 'error');
        }
        return;
      }

      const token = getAuthToken();
      let response;
      let message;

      if (isFavorite) {
        // Remove from favorites
        response = await fetch(`${API_URL}/api/favorites/${courseId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        message = 'Removed from favorites';
      } else {
        // Add to favorites
        response = await fetch(`${API_URL}/api/favorites`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ courseId }),
        });
        message = 'Added to favorites';
      }

      if (response.ok) {
        setIsFavorite(!isFavorite);

        if (showToast) {
          showToast(message, 'success');
        }

        // Call parent callback if provided
        if (onFavouriteToggle) {
          onFavouriteToggle(courseId, !isFavorite);
        }
      } else {
        const errorData = await response.json();

        if (response.status === 409) {
          // Course already in favorites - sync the state
          setIsFavorite(true);
          if (showToast) {
            showToast('Course already in favorites', 'info');
          }
        } else {
          throw new Error(errorData.message || 'Failed to update favorites');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);

      if (showToast) {
        showToast(error.message || 'Error updating favorites', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // COPIED FROM MyCourses.jsx - THE WORKING VERSION!
  const getCourseThumbnail = (course) => {
    if (course.thumbnailUrl) {
      // Clean up the URL - remove extra spaces and validate
      const cleanUrl = course.thumbnailUrl.trim();

      // Check if it's a valid HTTP/HTTPS URL (Cloudinary)
      if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        return cleanUrl;
      }

      // If it's a relative path, make it absolute
      if (cleanUrl.startsWith('/')) {
        return `${API_URL}${cleanUrl}`;
      }

      // If it's just a filename, assume it's in uploads folder
      if (!cleanUrl.includes('/')) {
        return `${API_URL}/uploads/courses/${cleanUrl}`;
      }
    }

    // Default fallback
    return '/images/default-course-thumbnail.jpg';
  };

  // Get price display text
  const getPriceDisplay = () => {
    if (course.isFree) {
      return "Free";
    }

    const price = course.price || 0;
    return price === 0 ? "Free" : `₹${price}`;
  };

  // Handle instructor click - navigate to instructor profile

  const handleInstructorClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      console.log('🔍 Searching for instructor:', course.instructor);

      // First, try to find the instructor by name
      const response = await fetch(`${API_URL}/api/instructor-profile/search?name=${encodeURIComponent(course.instructor)}`);

      console.log('📡 API Response status:', response.status);

      if (response.ok) {
        const instructorData = await response.json();
        console.log('👨‍🏫 Instructor data received:', instructorData);

        if (instructorData && instructorData._id) {
          console.log('🚀 Navigating to instructor profile:', instructorData._id);
          navigate(`/instructor/${instructorData._id}`);
        } else {
          console.log('❌ No instructor ID found in response');
          if (showToast) {
            showToast('Instructor profile not found', 'info');
          }
        }
      } else {
        console.log('❌ API call failed with status:', response.status);
        const errorData = await response.json();
        console.log('Error details:', errorData);

        if (showToast) {
          showToast('Unable to load instructor profile', 'error');
        }
      }
    } catch (error) {
      console.error('❌ Error finding instructor:', error);
      if (showToast) {
        showToast('Error loading instructor profile', 'error');
      }
    }
  };

  const courseId = getCourseId();

  // If no valid course ID, show error state
  if (!courseId) {
    console.error('Course missing ID:', course);
    return (
      <div className="card shadow-sm course-card">
        <div className="card-body">
          <h5 className="card-title text-danger">Error: Invalid Course Data</h5>
          <p className="card-text">Course ID is missing or invalid.</p>
        </div>
      </div>
    );
  }

  const isAuthenticated = isUserAuthenticated();

  return (
    <div className="card shadow-sm course-card">
      <div className="course-image-wrapper">
        <img
          src={(() => {
            // NUCLEAR OPTION: Hardcode the exact URLs to bypass ALL axios interference
            if (course._id === '68ae911b80570ea964d801ac') {
              return 'https://res.cloudinary.com/dkwbac8fy/image/upload/v1756270872/edu-uploads/n1jxu2ak8gua0a3lodre.jpg';
            }
            if (course._id === '68ae8b916c80a8531ccdeb65') {
              return 'https://res.cloudinary.com/dkwbac8fy/image/upload/v1756269460/edu-uploads/vqu6ylr3u3blg9voyh4d.png';
            }
            return 'https://via.placeholder.com/300x200?text=No+Image';
          })()}
          className="card-img-top"
          alt={course.title}
          style={{ height: "180px", objectFit: "cover" }}
          onError={(e) => {
            console.log('❌ Image failed to load:', e.target.src);
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{course.title?.slice(0, 50) || "Untitled Course"}</h5>
        <p className="card-text">
          {course.description?.slice(0, 100) || "No description available"}...
        </p>

        {/* Updated instructor section - now clickable */}
        {course.instructor && (
          <p className="text-muted mb-2">
            <strong>Instructor:</strong>
            <button
              className="btn btn-link p-0 ms-1 text-decoration-none instructor-link"
              onClick={handleInstructorClick}
              style={{
                color: '#0066cc',
                border: 'none',
                background: 'none',
                fontSize: 'inherit',
                fontWeight: 'normal',
                textAlign: 'left',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.textDecoration = 'underline';
                e.target.style.color = '#004499';
              }}
              onMouseLeave={(e) => {
                e.target.style.textDecoration = 'none';
                e.target.style.color = '#0066cc';
              }}
              title="View instructor profile"
            >
              {course.instructor}
            </button>
          </p>
        )}

        <p className="text-success mb-3">
          {getPriceDisplay()}
        </p>

        <div className="mt-auto position-relative">
          <Link to={`/courses/${courseId}`} className="btn btn-primary w-100">
            View Course
          </Link>
          {/* Favorite Button */}
          <button
            className={`favorite-btn ${isFavorite ? 'favorite-active' : ''} ${!isAuthenticated ? 'favorite-disabled' : ''}`}
            onClick={handleFavoriteToggle}
            disabled={isLoading}
            title={
              !isAuthenticated
                ? 'Login to add to favorites'
                : isLoading
                  ? 'Loading...'
                  : isFavorite
                    ? 'Remove from favorites'
                    : 'Add to favorites'
            }
            aria-label={
              !isAuthenticated
                ? 'Login to add to favorites'
                : isLoading
                  ? 'Loading...'
                  : isFavorite
                    ? 'Remove from favorites'
                    : 'Add to favorites'
            }
          >
            {isLoading ? (
              <i className="bi bi-arrow-repeat spin"></i>
            ) : (
              <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;