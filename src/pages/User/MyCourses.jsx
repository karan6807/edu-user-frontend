import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

function MyCourses() {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [freeCourses, setFreeCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState(null);
  const [progressData, setProgressData] = useState({});

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Check if user came from payment success
  const paymentSuccess = searchParams.get('payment_success');
  const orderId = searchParams.get('order_id');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    fetchUserCourses();
    handlePaymentRedirect();
  }, []);

  // Update courses with progress data when progress is loaded
  useEffect(() => {
    if (Object.keys(progressData).length > 0) {
      updateCoursesWithProgress();
    }
  }, [progressData]);

  const handlePaymentRedirect = async () => {
    if (paymentSuccess === 'true' && (orderId || sessionId)) {
      try {
        // Get the token for authorization
        const token = localStorage.getItem('token');

        if (!token) {
          setPaymentMessage({
            type: 'error',
            message: 'Please log in to view your courses after payment.'
          });
          return;
        }

        // Handle checkout success from Stripe - NOW WITH AUTHORIZATION HEADER
        const response = await axios.get(
          `${API_URL}/api/orders/checkout-success?session_id=${sessionId}&order_id=${orderId}&payment_success=true`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setPaymentMessage({
            type: 'success',
            message: 'Payment successful! Your courses are now available.'
          });

          // Remove payment params from URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);

          // Refresh courses and progress after successful payment
          setTimeout(() => {
            fetchUserCourses();
            fetchAllProgress();
          }, 1000);
        }
      } catch (error) {
        console.error('Error handling payment success:', error);

        if (error.response?.status === 401) {
          setPaymentMessage({
            type: 'error',
            message: 'Session expired. Please log in again to view your courses.'
          });
          // Optionally redirect to login
          // window.location.href = '/login';
        } else {
          setPaymentMessage({
            type: 'error',
            message: 'Payment processed but there was an error loading your courses. Please refresh the page.'
          });
        }
      }
    } else if (searchParams.get('canceled') === 'true') {
      setPaymentMessage({
        type: 'warning',
        message: 'Payment was canceled. Your courses are still in your cart.'
      });

      // Remove cancel params from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  };

  // Helper function to get a proper thumbnail URL
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

  // Fetch all user progress data
  const fetchAllProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/progress/user/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Create a map of courseId -> progress
        const progressMap = {};
        response.data.progress.forEach(prog => {
          progressMap[prog.course._id || prog.course] = {
            percentage: prog.percentage,
            isCompleted: prog.isCompleted,
            currentTime: prog.currentTime,
            duration: prog.duration,
            lastWatched: prog.lastWatched
          };
        });
        setProgressData(progressMap);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  // Update courses with progress data
  const updateCoursesWithProgress = () => {
    const updateCourseProgress = (courses) => {
      return courses.map(course => {
        const courseProgress = progressData[course.id] || { percentage: 0, isCompleted: false };
        return {
          ...course,
          progress: courseProgress.percentage || 0,
          isCompleted: courseProgress.isCompleted || false,
          lastWatched: courseProgress.lastWatched || null
        };
      });
    };

    setPurchasedCourses(prev => updateCourseProgress(prev));
    setFreeCourses(prev => updateCourseProgress(prev));
  };

  const fetchUserCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your courses.');
        setLoading(false);
        return;
      }

      // Get user's completed orders (purchased courses)
      const ordersResponse = await axios.get(`${API_URL}/api/orders/user-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Get user's free course enrollments
      const enrollmentsResponse = await axios.get(`${API_URL}/api/enrollments/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Orders response:', ordersResponse.data);

      if (ordersResponse.data.orders) {
        // Extract purchased courses from completed orders
        const purchased = [];
        const free = [];

        ordersResponse.data.orders.forEach(order => {
          if (order.payment.status === 'completed' && order.items) {
            order.items.forEach(item => {
              if (item.course) {
                const courseData = {
                  id: item.course._id,
                  title: item.course.title,
                  instructor: item.course.instructor || 'Unknown Instructor',
                  price: item.price,
                  thumbnail: getCourseThumbnail(item.course),
                  enrollmentDate: order.createdAt,
                  progress: 0, // Will be updated when progress data loads
                  isCompleted: false,
                  lastWatched: null,
                  duration: item.course.duration || 'N/A',
                  description: item.course.description || '',
                  orderNumber: order.orderNumber,
                  purchaseDate: order.createdAt,
                  completedAt: order.completedAt
                };

                if (item.price === 0) {
                  free.push(courseData);
                } else {
                  purchased.push(courseData);
                }
              }
            });
          }
        });

        // Remove duplicates (in case user purchased same course multiple times)
        const uniquePurchased = purchased.filter((course, index, self) =>
          index === self.findIndex(c => c.id === course.id)
        );

        const uniqueFree = free.filter((course, index, self) =>
          index === self.findIndex(c => c.id === course.id)
        );

        setPurchasedCourses(uniquePurchased);
        setFreeCourses(uniqueFree);
        
        // Process enrollments (free courses)
        if (enrollmentsResponse.data.success && enrollmentsResponse.data.enrollments) {
          const enrolledCourses = enrollmentsResponse.data.enrollments.map(enrollment => ({
            id: enrollment.course._id,
            title: enrollment.course.title,
            instructor: enrollment.course.instructor || 'Unknown Instructor',
            price: 0, // Free courses
            thumbnail: getCourseThumbnail(enrollment.course),
            enrollmentDate: enrollment.enrolledAt,
            progress: 0, // Will be updated when progress data loads
            isCompleted: false,
            lastWatched: null,
            duration: enrollment.course.duration || 'N/A',
            description: enrollment.course.description || '',
            enrollmentType: 'free'
          }));

          // Add enrolled courses to free courses (avoid duplicates)
          const existingFreeIds = uniqueFree.map(c => c.id);
          const newFreeCourses = enrolledCourses.filter(course => !existingFreeIds.includes(course.id));
          
          setFreeCourses(prev => [...prev, ...newFreeCourses]);
        }
      }
      
      // Fetch progress after courses are set
      fetchAllProgress();

    } catch (error) {
      console.error('Error fetching user courses:', error);
      setError('Failed to load your courses. Please try again.');

      // If token is invalid, might need to redirect to login
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        // Optionally redirect to login
        // window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-success';
    if (progress >= 70) return 'bg-info';
    if (progress >= 40) return 'bg-warning';
    return 'bg-danger';
  };

  const CourseCard = ({ course, isPurchased }) => (
    <div className="col-12 col-lg-3 col-md-4 col-sm-6 mb-5">
      <div className="card h-100 shadow-sm border-0">
        <div className="position-relative">
          <img
            src={course.thumbnail}
            className="card-img-top"
            alt={course.title}
            style={{ height: '230px', objectFit: 'cover' }}
            onError={(e) => {
              // Better fallback handling
              console.log('Image failed to load:', course.thumbnail);
              e.target.src = '/images/default-course-thumbnail.jpg';
            }}
          />
          <div className="position-absolute top-0 end-0 m-2">
            <span className={`badge ${isPurchased ? 'bg-primary' : 'bg-success'}`}>
              {isPurchased ? 'Purchased' : 'Free'}
            </span>
          </div>
          {course.isCompleted && (
            <div className="position-absolute top-0 start-0 m-2">
              <span className="badge bg-success">
                <i className="bi bi-check-circle-fill me-1"></i>
                Completed
              </span>
            </div>
          )}
          {course.progress > 0 && course.progress < 90 && (
            <div className="position-absolute top-0 start-0 m-2">
              <span className="badge bg-warning">
                <i className="bi bi-play-circle-fill me-1"></i>
                {course.progress}%
              </span>
            </div>
          )}
        </div>

        <div className="card-body d-flex flex-column">
          <h5 className="card-title text-truncate" title={course.title}>
            {course.title}
          </h5>

          <div className="mb-2">
            <small className="text-muted">
              <i className="bi bi-person-fill me-1"></i>
              {course.instructor}
            </small>
          </div>

          <div className="mb-2">
            <small className="text-muted">
              <i className="bi bi-clock-fill me-1"></i>
              {course.duration}
            </small>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="text-muted">Progress</small>
              <small className="text-muted">{course.progress}%</small>
            </div>
            <div className="progress" style={{ height: '6px' }}>
              <div
                className={`progress-bar ${getProgressColor(course.progress)}`}
                role="progressbar"
                style={{ width: `${course.progress}%` }}
                aria-valuenow={course.progress}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>

          <div className="mt-auto">
            <Link
              to={`/course/${course.id}/learning`}
              className="btn btn-primary w-100"
            >
              {course.isCompleted ? 'Review Course' : 
               course.progress > 0 ? `Continue (${course.progress}%)` : 'Start Learning'}
              <i className="bi bi-arrow-right ms-2"></i>
            </Link>
            {course.lastWatched && (
              <small className="text-muted mt-2 d-block text-center">
                Last watched: {new Date(course.lastWatched).toLocaleDateString()}
              </small>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading your courses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 text-center">
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Payment Success/Error Message */}
      {paymentMessage && (
        <div className="row mb-4">
          <div className="col-12">
            <div className={`alert alert-${paymentMessage.type} alert-dismissible fade show`} role="alert">
              <i className={`bi ${paymentMessage.type === 'success' ? 'bi-check-circle-fill' :
                paymentMessage.type === 'error' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'} me-2`}></i>
              {paymentMessage.message}
              <button
                type="button"
                className="btn-close"
                onClick={() => setPaymentMessage(null)}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
            <div>
              <h1 className="display-5 fw-bold text-secondary mb-2">My Courses</h1>
              <p className="text-muted mb-0">
                Continue your learning journey with your enrolled courses
              </p>
            </div>
            <div className="mt-3 mt-md-0">
              <Link to="/courses" className="btn btn-outline-primary">
                <i className="bi bi-search me-2"></i>
                Browse More Courses
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="row my-5 justify-content-around">
            <div className="col-4 col-md-3">
              <div className="card bg-primary text-white text-center">
                <div className="card-body py-3">
                  <h4 className="mb-1">{purchasedCourses.length + freeCourses.length}</h4>
                  <small>Total Courses</small>
                </div>
              </div>
            </div>
            <div className="col-4 col-md-3">
              <div className="card bg-success text-white text-center">
                <div className="card-body py-3">
                  <h4 className="mb-1">
                    {[...purchasedCourses, ...freeCourses].filter(c => c.isCompleted).length}
                  </h4>
                  <small>Completed</small>
                </div>
              </div>
            </div>
            <div className="col-4 col-md-3">
              <div className="card bg-warning text-white text-center">
                <div className="card-body py-3">
                  <h4 className="mb-1">
                    {[...purchasedCourses, ...freeCourses].filter(c => c.progress > 0 && !c.isCompleted).length}
                  </h4>
                  <small>In Progress</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchased Courses Section */}
      {purchasedCourses.length > 0 && (
        <div className="row mb-5">
          <div className="col-12">
            <div className="d-flex align-items-center mb-4">
              <h2 className="h3 mb-0 me-3">
                <i className="bi bi-cart-check-fill text-primary me-2"></i>
                Purchased Courses
              </h2>
              <span className="badge bg-primary rounded-pill">
                {purchasedCourses.length}
              </span>
            </div>
            <div className="row">
              {purchasedCourses.map((course) => (
                <CourseCard key={course.id} course={course} isPurchased={true} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Free Courses Section */}
      {freeCourses.length > 0 && (
        <div className="row mb-5">
          <div className="col-12">
            <div className="d-flex align-items-center mb-4">
              <h2 className="h3 mb-0 me-3">
                <i className="bi bi-gift-fill text-success me-2"></i>
                Free Courses
              </h2>
              <span className="badge bg-success rounded-pill">
                {freeCourses.length}
              </span>
            </div>
            <div className="row">
              {freeCourses.map((course) => (
                <CourseCard key={course.id} course={course} isPurchased={false} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {purchasedCourses.length === 0 && freeCourses.length === 0 && (
        <div className="row">
          <div className="col-12">
            <div className="text-center py-5">
              <i className="bi bi-book display-1 text-muted mb-4"></i>
              <h3 className="text-muted mb-3">No Courses Yet</h3>
              <p className="text-muted mb-4">
                You haven't purchased any courses yet. Start your learning journey today!
              </p>
              <Link to="/courses" className="btn btn-primary btn-lg">
                <i className="bi bi-search me-2"></i>
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyCourses;