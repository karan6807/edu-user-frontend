/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Play,
  BookOpen,
  Clock,
  Users,
  Star,
  ChevronDown,
  ChevronRight,
  Check,
  Lock,
} from "lucide-react";

const Learning = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const { id } = useParams(); // Get course ID from URL
  const navigate = useNavigate();
  const [activeLesson, setActiveLesson] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [courseData, setCourseData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedProgress, setSavedProgress] = useState(null);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const videoRef = React.useRef(null);
  const progressSaveTimer = React.useRef(null);

  useEffect(() => {
    if (id) {
      fetchCourseData();
      fetchProgress();
    }
  }, [id]);

  // Load saved progress when video is ready
  useEffect(() => {
    if (savedProgress && videoRef.current && !progressLoaded) {
      const video = videoRef.current;
      if (video.readyState >= 2) { // Video metadata loaded
        video.currentTime = savedProgress.currentTime || 0;
        setProgressLoaded(true);
      }
    }
  }, [savedProgress, progressLoaded]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to access this course.');
        setLoading(false);
        return;
      }

      // Fetch course data from your API
      const courseResponse = await axios.get(`${API_URL}/api/courses/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setCourseData(courseResponse.data);

      // Fetch categories for category name display
      const categoriesResponse = await axios.get(`${API_URL}/api/categories`);
      setCategories(categoriesResponse.data || []);

    } catch (error) {
      console.error('Error fetching course data:', error);
      if (error.response?.status === 401) {
        setError('Please log in to access this course.');
      } else if (error.response?.status === 404) {
        setError('Course not found.');
      } else {
        setError('Failed to load course data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration) {
      const progress = (video.currentTime / video.duration) * 100;
      setVideoProgress(progress.toFixed(0)); // round to integer
      
      // Save progress every 10 seconds
      if (progressSaveTimer.current) {
        clearTimeout(progressSaveTimer.current);
      }
      
      progressSaveTimer.current = setTimeout(() => {
        saveProgress(video.currentTime, video.duration);
      }, 2000); // Save after 2 seconds of no time updates
    }
  };

  // Fetch saved progress
  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/progress/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSavedProgress(response.data.progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  // Save progress to backend
  const saveProgress = async (currentTime, duration) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(`${API_URL}/api/progress`, {
        courseId: id,
        currentTime: currentTime,
        duration: duration
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Also save to localStorage as backup
      localStorage.setItem(`progress_${id}`, JSON.stringify({
        currentTime,
        duration,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Handle video loaded metadata
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video && savedProgress && savedProgress.currentTime > 0) {
      video.currentTime = savedProgress.currentTime;
      setProgressLoaded(true);
    }
  };

  // Helper function to get category name by ID
  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find(cat => (cat._id || cat.id) === categoryId);
    return category ? category.name : "Unknown Category";
  };

  // Helper function to get full category path
  const getCategoryPath = () => {
    if (!courseData) return "Uncategorized";
    const parts = [];
    if (courseData.category) {
      parts.push(getCategoryName(courseData.category));
    }
    if (courseData.subcategory) {
      parts.push(getCategoryName(courseData.subcategory));
    }
    if (courseData.sub_subcategory) {
      parts.push(getCategoryName(courseData.sub_subcategory));
    }
    return parts.length > 0 ? parts.join(" > ") : "Uncategorized";
  };

  const getImageUrl = () => {
    if (!courseData) return '/default-course-image.jpg';
    if (courseData.thumbnailUrl) {
      // If it's already a full URL (Cloudinary), use it directly
      if (courseData.thumbnailUrl.startsWith('http')) {
        return courseData.thumbnailUrl;
      }
      // If it's a relative path (old local uploads), add API_URL
      return `${API_URL}${courseData.thumbnailUrl}`;
    }
    return courseData.image || '/default-course-image.jpg';
  };

  const getVideoUrl = () => {
    if (!courseData.videoUrl) return "https://www.w3schools.com/html/mov_bbb.mp4";
    // If it's already a full URL (Cloudinary), use it directly
    if (courseData.videoUrl.startsWith('http')) {
      return courseData.videoUrl;
    }
    // If it's a relative path (old local uploads), add API_URL
    return `${API_URL}${courseData.videoUrl}`;
  };

  if (loading) {
    return (
      <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
          <div>
            <Link to="/my-courses" className="btn btn-primary me-2">
              Back to My Courses
            </Link>
            <button
              className="btn btn-outline-secondary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          <div className="alert alert-warning">
            <i className="bi bi-info-circle-fill me-2"></i>
            Course not found
          </div>
          <Link to="/my-courses" className="btn btn-primary">
            Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 bg-light min-vh-100 mb-3">
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-secondary shadow-sm">
        <div className="container">
          <span className="navbar-brand mb-0 h1">
            <BookOpen className="me-2" size={29} />
            Learning Dashboard
          </span>
          <div className="navbar-nav ms-auto">
            <Link to="/my-courses" className="nav-link text-white">
              <i className="bi bi-arrow-left me-1"></i>
              Back to My Courses
            </Link>
          </div>
        </div>
      </nav>

      <div className="container-fluid">
        <div className="row g-0">
          {/* Main Content */}
          <div className="col-12">
                     {/* Video Player Section */}
            <div className="row justify-content-center">
              <div className="col-12 col-lg-10 col-xl-8">
                <div
                  className="bg-light position-relative mx-4"
                  style={{ borderRadius: "10px", marginTop: "40px" }}
                >
                  <div className="ratio ratio-16x9">
                    <video
                      ref={videoRef}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      controls
                      className="w-100 h-100"
                      style={{ objectFit: "cover", borderRadius: "10px" }}
                      poster={getImageUrl()}
                    >
                      <source src={getVideoUrl()} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4 p-4">
              {/* Course Information */}
              <div className="col-lg-8 col-md-7">
                <div className="card h-100" style={{ borderRadius: "10px" }}>
                  <div className="card-body">
                    <div className="d-flex align-items-start justify-content-between mb-1">
                      <div>
                        <h3 className="card-title">{courseData.title}</h3>
                        <p className="text-muted">
                          {courseData.description}
                        </p>
                      </div>
                      <span
                        className={`badge ${
                          courseData.level === "Beginner"
                            ? "bg-success"
                            : courseData.level === "Intermediate"
                            ? "bg-warning"
                            : "bg-danger"
                        }`}
                      >
                        {courseData.level || "Beginner"}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">Course Progress</h6>
                        <small className="text-muted">
                          {videoProgress}% Complete
                          {savedProgress && savedProgress.percentage > 0 && (
                            <span className="ms-2 badge bg-info">
                              Resume from {savedProgress.percentage}%
                            </span>
                          )}
                        </small>
                      </div>
                      <div className="progress" style={{ height: "8px" }}>
                        <div
                          className={`progress-bar ${videoProgress >= 90 ? 'bg-success' : 'bg-primary'}`}
                          style={{ width: `${videoProgress}%` }}
                        ></div>
                      </div>
                      {videoProgress >= 90 && (
                        <small className="text-success mt-1 d-block">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          Course completed! 🎉
                        </small>
                      )}
                    </div>

                    {/* Course Details Row */}
                    <div className="row g-3 mb-4">
                      <div className="col-6 col-md-4">
                        <div className="d-flex align-items-center">
                          <Users className="text-info me-2" size={16} />
                          <small className="text-muted">
                            <Link
                              to={`/instructors/${courseData.instructor}`}
                              className="text-decoration-none"
                            >
                              {courseData.instructor}
                            </Link>
                          </small>
                        </div>
                      </div>
                      <div className="col-6 col-md-4">
                        <div className="d-flex align-items-center">
                          <Clock className="text-success me-2" size={16} />
                          <small>
                            <strong>Duration:</strong> {courseData.duration || "Not specified"}
                          </small>
                        </div>
                      </div>
                      <div className="col-6 col-md-4">
                        <div className="d-flex align-items-center">
                          <Star className="text-danger me-2" size={16} />
                          <small>
                            <strong>Level:</strong> {courseData.level || "Beginner"}
                          </small>
                        </div>
                      </div>
                      <div className="col-6 col-md-4">
                        <div className="d-flex align-items-center">
                          <Clock className="text-secondary me-2" size={16} />
                          <small>
                            <strong>Course Added:</strong> {new Date(courseData.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                      <div className="col-6 col-md-4">
                        <div className="d-flex align-items-center">
                          <BookOpen className="text-warning me-2" size={16} />
                          <small>
                            <strong>Language:</strong> {courseData.language || "English"}
                          </small>
                        </div>
                      </div>
                      <div className="col-6 col-md-4">
                        <div className="d-flex align-items-center">
                          <BookOpen className="text-primary me-2" size={16} />
                          <small>
                            <strong>Category:</strong> {getCategoryPath()}
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Learning Outcomes */}
                    <div className="mb-4">
                      <h6>Learning Outcomes</h6>
                      {courseData.learningOutcomes && courseData.learningOutcomes.length > 0 ? (
                        <ul className="mb-0 ps-3">
                          {courseData.learningOutcomes.map((outcome, index) => (
                            <li key={index}>{outcome}</li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="mb-0 ps-3">
                          <li>Complete understanding of {courseData.title}</li>
                          <li>Practical skills and hands-on experience</li>
                          <li>Real-world application of concepts</li>
                        </ul>
                      )}
                    </div>

                    {/* Course Tags */}
                    <div className="mb-2">
                      <h6>Tags</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {courseData.tags && courseData.tags.length > 0 ? (
                          courseData.tags.map((tag, index) => (
                            <span key={index} className="badge bg-secondary">{tag}</span>
                          ))
                        ) : (
                          <>
                            <span className="badge bg-secondary">Course</span>
                            <span className="badge bg-secondary">Learning</span>
                            <span className="badge bg-secondary">Education</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* What You'll Learn */}
              <div className="col-lg-4 col-md-5">
                <div className="card h-100" style={{ borderRadius: "10px" }}>
                  <div className="card-header bg-primary text-white">
                    <h6 className="mb-0">What You'll Learn</h6>
                  </div>
                  <div className="card-body">
                    <ul className="list-unstyled mb-0">
                      {courseData.whatYouWillLearn && courseData.whatYouWillLearn.length > 0 ? (
                        courseData.whatYouWillLearn.map((item, index) => (
                          <li key={index} className="mb-3">
                            <div className="d-flex align-items-start">
                              <Check
                                className="text-success me-2 mt-1 flex-shrink-0"
                                size={16}
                              />
                              <span>{item}</span>
                            </div>
                          </li>
                        ))
                      ) : (
                        // Default items if no specific learning objectives are provided
                        <>
                          <li className="mb-3">
                            <div className="d-flex align-items-start">
                              <Check
                                className="text-success me-2 mt-1 flex-shrink-0"
                                size={16}
                              />
                              <span>Master the fundamentals of {courseData.title}</span>
                            </div>
                          </li>
                          <li className="mb-3">
                            <div className="d-flex align-items-start">
                              <Check
                                className="text-success me-2 mt-1 flex-shrink-0"
                                size={16}
                              />
                              <span>Apply practical skills in real-world scenarios</span>
                            </div>
                          </li>
                          <li className="mb-3">
                            <div className="d-flex align-items-start">
                              <Check
                                className="text-success me-2 mt-1 flex-shrink-0"
                                size={16}
                              />
                              <span>Build confidence in your abilities</span>
                            </div>
                          </li>
                          <li className="mb-3">
                            <div className="d-flex align-items-start">
                              <Check
                                className="text-success me-2 mt-1 flex-shrink-0"
                                size={16}
                              />
                              <span>Understand best practices and industry standards</span>
                            </div>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="d-md-none fixed-bottom bg-white border-top">
        <div className="row g-0">
          <div className="col-4">
            <Link to="/my-courses" className="btn btn-link w-100 p-3 text-center">
              <BookOpen size={20} className="d-block mx-auto mb-1" />
              <small>Courses</small>
            </Link>
          </div>
          <div className="col-4">
            <button className="btn btn-link w-100 p-3 text-center text-primary">
              <Play size={20} className="d-block mx-auto mb-1" />
              <small>Learning</small>
            </button>
          </div>
          <div className="col-4">
            <button className="btn btn-link w-100 p-3 text-center">
              <Users size={20} className="d-block mx-auto mb-1" />
              <small>Progress</small>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learning;