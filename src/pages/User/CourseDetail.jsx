// src/pages/CourseDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

function CourseDetail() {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [cartMessage, setCartMessage] = useState("");

    // Fetch course details and categories from backend
    useEffect(() => {
        const fetchCourseDetail = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch course details
                const courseResponse = await axios.get(`${API_URL}/api/courses/${id}`);
                setCourse(courseResponse.data);

                // Fetch categories for category name display
                const categoriesResponse = await axios.get(`${API_URL}/api/categories`);
                setCategories(categoriesResponse.data || []);

            } catch (err) {
                console.error("Error fetching course details:", err);
                setError(err.response?.data?.message || "Failed to fetch course details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchCourseDetail();
        }
    }, [id]);

    // Check if user is logged in
    const isUserLoggedIn = () => {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        return !!token;
    };

    // Handle Buy Now button click
    const handleBuyNow = () => {
        if (!isUserLoggedIn()) {
            // Redirect to login page if not authenticated
            navigate('/login');
            return;
        }

        if (!course) {
            console.error("Course data not available");
            return;
        }

        // Create cart data for direct checkout (similar to Cart.jsx format)
        const courseData = {
            _id: course._id,
            title: course.title,
            instructor: course.instructor || "N/A",
            price: course.price || 0,
            image: course.thumbnailUrl ?
                (course.thumbnailUrl.startsWith('http') ? course.thumbnailUrl : `${API_URL}${course.thumbnailUrl}`) :
                course.image || '/default-course-image.jpg',
            duration: course.duration || "N/A",
        };

        const courses = [courseData];
        const subtotal = course.price || 0;
        const tax = subtotal * 0.18;
        const total = subtotal + tax;

        const cartData = { courses, subtotal, tax, total };

        // Store cart data in sessionStorage (same as Cart.jsx does)
        sessionStorage.setItem("cartData", JSON.stringify(cartData));

        // Navigate to checkout page
        navigate("/checkout");
    };

    // Add to cart function
    const handleAddToCart = async () => {
        try {
            setIsAddingToCart(true);
            setCartMessage("");

            // Get token from localStorage (adjust based on how you store auth token)
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');

            if (!token) {
                // Redirect to login page if not authenticated
                navigate('/login');
                return;
            }

            const response = await axios.post(`${API_URL}/api/cart`, {
                courseId: course._id
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setCartMessage("Course added to cart successfully!");
            setTimeout(() => setCartMessage(""), 3000);

            // Dispatch custom event to update cart count in navbar
            window.dispatchEvent(new CustomEvent('cartUpdated'));

        } catch (err) {
            console.error("Error adding to cart:", err);

            // Handle specific error cases
            if (err.response?.status === 401) {
                setCartMessage("Please login to add courses to cart");
            } else if (err.response?.status === 409) {
                setCartMessage("Course is already in your cart");
            } else {
                setCartMessage(err.response?.data?.message || "Failed to add course to cart");
            }

            setTimeout(() => setCartMessage(""), 3000);
        } finally {
            setIsAddingToCart(false);
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
        const parts = [];
        if (course.category) {
            parts.push(getCategoryName(course.category));
        }
        if (course.subcategory) {
            parts.push(getCategoryName(course.subcategory));
        }
        if (course.sub_subcategory) {
            parts.push(getCategoryName(course.sub_subcategory));
        }
        return parts.length > 0 ? parts.join(" > ") : "Uncategorized";
    };

    const getImageUrl = () => {
        if (!course?.thumbnailUrl) {
            return '/images/default-course-thumbnail.jpg';
        }
        
        // Just return the thumbnailUrl as-is since backend returns full Cloudinary URLs
        return course.thumbnailUrl;
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="container my-5">
                <div className="row justify-content-center">
                    <div className="col-12 text-center py-5">
                        <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <h4 className="mt-3 text-muted">Loading course details...</h4>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="container my-5">
                <div className="row justify-content-center">
                    <div className="col-12 text-center py-5">
                        <div className="mb-4">
                            <i className="fas fa-exclamation-triangle fa-4x text-danger opacity-50"></i>
                        </div>
                        <h4 className="text-danger mb-3">Error Loading Course</h4>
                        <p className="text-muted mb-4">{error}</p>
                        <div>
                            <button
                                className="btn btn-primary me-3"
                                onClick={() => window.location.reload()}
                            >
                                <i className="fas fa-refresh me-2"></i>
                                Try Again
                            </button>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => navigate("/courses")}
                            >
                                <i className="fas fa-arrow-left me-2"></i>
                                Back to Courses
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Course not found
    if (!course) {
        return (
            <div className="container my-5">
                <div className="row justify-content-center">
                    <div className="col-12 text-center py-5">
                        <div className="mb-4">
                            <i className="fas fa-search fa-4x text-muted opacity-50"></i>
                        </div>
                        <h4 className="text-muted mb-3">Course Not Found</h4>
                        <p className="text-muted mb-4">The course you're looking for doesn't exist or has been removed.</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/courses")}
                        >
                            <i className="fas fa-arrow-left me-2"></i>
                            Back to Courses
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container my-5">
            {/* Back Button */}
            <div className="mb-3">
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate(-1)}
                >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back
                </button>
            </div>

            {/* Course Header */}
            <div className="row mb-4">
                <div className="col-lg-8">
                    {/* Course Title */}
                    <div className="mb-4">
                        <h1 className="fw-bold mb-2">{course.title}</h1>
                        <h5 className="text-muted mb-3">
                            by{" "}
                            <Link
                                to={`/instructors/${course.instructor}`}
                                className="text-decoration-none text-primary"
                            >
                                {course.instructor}
                            </Link>
                        </h5>

                        {/* Course Status Badge */}
                        <div className="mb-3">
                            {course.isPublished ? (
                                <span className="badge bg-success me-2">
                                    <i className="fas fa-check-circle me-1"></i>
                                    Published
                                </span>
                            ) : (
                                <span className="badge bg-warning text-dark me-2">
                                    <i className="fas fa-clock me-1"></i>
                                    Draft
                                </span>
                            )}
                            {course.price === 0 ? (
                                <span className="badge bg-info">
                                    <i className="fas fa-gift me-1"></i>
                                    Free Course
                                </span>
                            ) : (
                                <span className="badge bg-primary">
                                    <i className="fas fa-rupee-sign me-1"></i>
                                    Paid Course
                                </span>
                            )}
                        </div>
                    </div>


                    {/* Course Thumbnail */}
                    {(course.thumbnailUrl || course.image) && (
                        <div className="mb-4">
                            <img
                                src={getImageUrl()}
                                alt={course.title}
                                className="img-fluid rounded shadow-sm"
                                style={{ maxHeight: "300px", objectFit: "cover", width: "100%" }}
                                onError={(e) => {
                                    e.target.src = '/default-course-image.jpg'; // Fallback image
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="col-lg-4">
                    {/* Course Info Cards */}
                    <div className="row g-3">
                        <div className="col-6">
                            <div className="card shadow-sm h-100">
                                <div className="card-body text-center">
                                    <i className="fas fa-clock fa-2x text-primary mb-2"></i>
                                    <h6 className="text-uppercase text-muted small">Duration</h6>
                                    <p className="mb-0 fw-bold">{course.duration || "Not specified"}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="card shadow-sm h-100">
                                <div className="card-body text-center">
                                    <i className="fas fa-layer-group fa-2x text-success mb-2"></i>
                                    <h6 className="text-uppercase text-muted small">Level</h6>
                                    <p className="mb-0 fw-bold">{course.level || "Beginner"}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="card shadow-sm h-100">
                                <div className="card-body text-center">
                                    <i className="fas fa-tag fa-2x text-warning mb-2"></i>
                                    <h6 className="text-uppercase text-muted small">Price</h6>
                                    <p className="mb-0 fw-bold">
                                        {course.price === 0 ? (
                                            <span className="text-success">Free</span>
                                        ) : (
                                            <span>₹{course.price}</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="card shadow-sm h-100">
                                <div className="card-body text-center">
                                    <i className="fas fa-language fa-2x text-info mb-2"></i>
                                    <h6 className="text-uppercase text-muted small">Language</h6>
                                    <p className="mb-0 fw-bold">{course.language || "English"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4">
                        {/* Cart Success/Error Message */}
                        {cartMessage && (
                            <div className={`alert ${cartMessage.includes('successfully') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
                                <i className={`fas ${cartMessage.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                                {cartMessage}
                            </div>
                        )}

                        {course.price === 0 ? (
                            // Free Course - Start Learning Button
                            <button
                                className="btn btn-success w-100 py-3"
                                onClick={() => navigate(`/course/${course._id}/learning`)}
                                disabled={!course.isPublished}
                            >
                                <i className="fas fa-play me-2"></i>
                                Start Learning
                            </button>
                        ) : (
                            // Paid Course - Add to Cart and Buy Now Buttons
                            <div className="d-grid gap-2">
                                <button
                                    className="btn btn-outline-primary py-3"
                                    onClick={handleAddToCart}
                                    disabled={!course.isPublished || isAddingToCart}
                                >
                                    {isAddingToCart ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Adding to Cart...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-cart-plus me-2"></i>
                                            Add to Cart
                                        </>
                                    )}
                                </button>
                                <button
                                    className="btn btn-primary py-3"
                                    onClick={handleBuyNow}
                                    disabled={!course.isPublished}
                                >
                                    <i className="fas fa-shopping-cart me-2"></i>
                                    Buy Now - ₹{course.price}
                                </button>
                            </div>
                        )}

                        {!course.isPublished && (
                            <small className="text-muted d-block text-center mt-2">
                                This course is not yet published
                            </small>
                        )}
                    </div>
                </div>
            </div>

            {/* Course Details */}
            <div className="row">
                <div className="col-lg-8">
                    {/* Description */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <h5 className="card-title">
                                <i className="fas fa-info-circle me-2 text-primary"></i>
                                Description
                            </h5>
                            <p className="card-text">{course.description}</p>
                        </div>
                    </div>

                    {/* What You'll Learn */}
                    {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                <h5 className="card-title">
                                    <i className="fas fa-graduation-cap me-2 text-success"></i>
                                    What You'll Learn
                                </h5>
                                <ul className="mb-0">
                                    {course.whatYouWillLearn.map((item, index) => (
                                        <li key={index} className="mb-2">
                                            <i className="fas fa-check text-success me-2"></i>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Learning Outcomes */}
                    {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                <h5 className="card-title">
                                    <i className="fas fa-target me-2 text-warning"></i>
                                    Learning Outcomes
                                </h5>
                                <ul className="mb-0">
                                    {course.learningOutcomes.map((outcome, index) => (
                                        <li key={index} className="mb-2">
                                            <i className="fas fa-arrow-right text-warning me-2"></i>
                                            {outcome}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Promo Video */}
                    {course.videoUrl && (
                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                <h5 className="card-title">
                                    <i className="fas fa-play-circle me-2 text-danger"></i>
                                    Course Preview
                                </h5>
                                <div className="ratio ratio-16x9">
                                    <video
                                        controls
                                        className="rounded"
                                        poster={course.thumbnailUrl}
                                    >
                                        <source src={course.videoUrl} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {course.tags && course.tags.length > 0 && (
                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                <h5 className="card-title">
                                    <i className="fas fa-tags me-2 text-info"></i>
                                    Tags
                                </h5>
                                <div>
                                    {course.tags.map((tag, index) => (
                                        <span key={index} className="badge bg-secondary me-2 mb-2">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-lg-4">
                    {/* Course Category */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <h6 className="card-title">
                                <i className="fas fa-sitemap me-2 text-primary"></i>
                                Category
                            </h6>
                            <p className="mb-0">
                                <small className="text-muted">{getCategoryPath()}</small>
                            </p>
                        </div>
                    </div>

                    {/* Course Stats */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <h6 className="card-title">
                                <i className="fas fa-chart-bar me-2 text-success"></i>
                                Course Stats
                            </h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Created:</span>
                                <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Updated:</span>
                                <span>{new Date(course.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-muted">Status:</span>
                                <span className={course.isPublished ? "text-success" : "text-warning"}>
                                    {course.isPublished ? "Published" : "Draft"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Share Course */}
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h6 className="card-title">
                                <i className="fas fa-share-alt me-2 text-info"></i>
                                Share Course
                            </h6>
                            <div className="d-grid gap-2">
                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert("Course link copied to clipboard!");
                                    }}
                                >
                                    <i className="fas fa-copy me-2"></i>
                                    Copy Link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseDetail;