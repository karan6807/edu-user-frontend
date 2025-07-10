/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../../components/CourseCard';

const Favorite = () => {
  const [favoriteCourses, setFavoriteCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

  // Toast function to show notifications
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Get authentication token from localStorage (match CourseCard logic)
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
  };

  // Check if user is authenticated (match CourseCard logic)
  const isAuthenticated = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const userData = localStorage.getItem('userData') || localStorage.getItem('user');
    return !!(token || userData);
  };

  // Axios instance with authentication
  const authenticatedAxios = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add token to requests
  authenticatedAxios.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Handle authentication errors (match CourseCard logic)
  authenticatedAxios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid - clear both possible token locations
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        navigate('/login');
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadFavoriteCourses();
  }, []);

  const loadFavoriteCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch favorites from backend
      const response = await authenticatedAxios.get('/favorites');
      const favoriteData = response.data.items || [];
      
      // Extract courses from the response
      const courses = favoriteData.map(item => ({
        ...item.course,
        addedAt: item.addedAt
      }));
      
      setFavoriteCourses(courses);
    } catch (err) {
      console.error('Error loading favorite courses:', err);
      if (err.response?.status === 401) {
        setError('Please login to view your favorites');
      } else {
        setError(err.response?.data?.message || 'Failed to load favorite courses');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (courseId, isAdded) => {
    try {
      if (!isAdded) {
        // Course was removed from favorites
        await authenticatedAxios.delete(`/favorites/${courseId}`);
        
        // Update the display immediately
        setFavoriteCourses(prev => prev.filter(course => {
          const id = course._id || course.id;
          return id !== courseId;
        }));
        showToast('Course removed from favorites', 'success');
      } else {
        // Course was added to favorites
        await authenticatedAxios.post('/favorites', { courseId });
        
        // Reload the list to get the updated data
        loadFavoriteCourses();
        showToast('Course added to favorites', 'success');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      showToast(
        err.response?.data?.message || 'Failed to update favorites',
        'error'
      );
    }
  };

  const handleClearAllFavorites = async () => {
    if (window.confirm('Are you sure you want to remove all courses from favorites?')) {
      try {
        await authenticatedAxios.delete('/favorites');
        setFavoriteCourses([]);
        showToast('All favorites cleared', 'success');
      } catch (err) {
        console.error('Error clearing favorites:', err);
        showToast(
          err.response?.data?.message || 'Failed to clear favorites',
          'error'
        );
      }
    }
  };

  const handleRefreshFavorites = () => {
    loadFavoriteCourses();
    showToast('Favorites refreshed', 'info');
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 text-center py-5">
            <div className="mb-4">
              <i className="fas fa-lock fa-4x text-warning opacity-50"></i>
            </div>
            <h4 className="text-warning mb-3">Authentication Required</h4>
            <p className="text-muted mb-4">Please login to view your favorite courses</p>
            <div className="d-flex gap-2 justify-content-center">
              <Link to="/login" className="btn btn-primary">
                <i className="fas fa-sign-in-alt me-2"></i>
                Login
              </Link>
              <Link to="/register" className="btn btn-outline-secondary">
                <i className="fas fa-user-plus me-2"></i>
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="mt-3 text-muted">Loading your favorite courses...</h4>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 text-center py-5">
            <div className="mb-4">
              <i className="fas fa-exclamation-triangle fa-4x text-danger opacity-50"></i>
            </div>
            <h4 className="text-danger mb-3">Error Loading Favorites</h4>
            <p className="text-muted mb-4">{error}</p>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn btn-primary" onClick={loadFavoriteCourses}>
                <i className="fas fa-refresh me-2"></i>
                Try Again
              </button>
              <Link to="/courses" className="btn btn-outline-secondary">
                <i className="fas fa-arrow-left me-2"></i>
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast show position-fixed top-0 end-0 m-3`} style={{ zIndex: 1050 }}>
          <div className={`toast-header bg-${toast.type === 'success' ? 'success' : toast.type === 'error' ? 'danger' : 'info'} text-white`}>
            <strong className="me-auto">
              <i className={`fas fa-${toast.type === 'success' ? 'check-circle' : toast.type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2`}></i>
              Notification
            </strong>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setToast({ show: false, message: '', type: '' })}
            ></button>
          </div>
          <div className="toast-body text-dark">
            {toast.message}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="mb-2">
                <i className="bi bi-heart-fill text-danger me-2"></i>
                My Favorite Courses
              </h2>
              <p className="text-muted mb-0">
                {favoriteCourses.length > 0 
                  ? `You have ${favoriteCourses.length} favorite course${favoriteCourses.length !== 1 ? 's' : ''}`
                  : 'Your favorite courses will appear here'
                }
              </p>
            </div>
            {favoriteCourses.length > 0 && (
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={handleRefreshFavorites}
                  title="Refresh favorites"
                >
                  <i className="fas fa-refresh me-1"></i>
                  Refresh
                </button>
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleClearAllFavorites}
                  title="Clear all favorites"
                >
                  <i className="fas fa-trash me-1"></i>
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Favourite Courses Grid */}
      {favoriteCourses.length > 0 ? (
        <div className="row g-4">
          {favoriteCourses.map((course) => (
            <div 
              key={course._id || course.id} 
              className="col-12 col-sm-6 col-md-4 col-lg-3"
            >
              <CourseCard 
                course={course} 
                onFavouriteToggle={handleFavoriteToggle}
                showToast={showToast}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="row">
          <div className="col-12">
            <div className="text-center py-5">
              <div className="mb-4">
                <i 
                  className="bi bi-heart text-muted" 
                  style={{ fontSize: '4rem' }}
                ></i>
              </div>
              <h4 className="text-muted mb-3">No favorite courses yet</h4>
              <p className="text-muted mb-4">
                Start exploring our courses and click the heart icon to add them to your favorites!
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <Link to="/courses" className="btn btn-primary">
                  <i className="fas fa-search me-2"></i>
                  Browse Courses
                </Link>
                <Link to="/" className="btn btn-outline-secondary">
                  <i className="bi bi-house me-2"></i>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {favoriteCourses.length > 0 && (
        <div className="row mt-5">
          <div className="col-12">
            <div className="card bg-light">
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-6 col-md-3">
                    <div className="fw-bold text-primary fs-4">
                      {favoriteCourses.length}
                    </div>
                    <small className="text-muted">Favorite Courses</small>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="fw-bold text-success fs-4">
                      {favoriteCourses.filter(course => course.price === 0 || course.isFree).length}
                    </div>
                    <small className="text-muted">Free Courses</small>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="fw-bold text-warning fs-4">
                      {favoriteCourses.filter(course => course.price > 0 && !course.isFree).length}
                    </div>
                    <small className="text-muted">Premium Courses</small>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="fw-bold text-info fs-4">
                      ₹{favoriteCourses
                        .filter(course => course.price > 0 && !course.isFree)
                        .reduce((total, course) => total + (course.price || 0), 0)
                        .toLocaleString()}
                    </div>
                    <small className="text-muted">Total Value</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back to Courses Button */}
      {favoriteCourses.length > 0 && (
        <div className="row mt-4">
          <div className="col-12 text-center">
            <Link to="/courses" className="btn btn-outline-primary">
              <i className="fas fa-arrow-left me-2"></i>
              Continue Browsing Courses
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorite;