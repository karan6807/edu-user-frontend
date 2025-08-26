import React, { useState, useEffect } from "react";
import {
    Trash2,
    ShoppingCart,
    CreditCard,
    ArrowLeft,
    CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderComplete, setOrderComplete] = useState(false);
    const [removingCourse, setRemovingCourse] = useState(null);

    // Fetch cart data from API
    useEffect(() => {
        const fetchCartData = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                console.log("Fetching cart data...");
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/cart`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );

                console.log("Cart data received:", response.data);

                // Assuming the API returns cart items with populated course data
                // Adjust this based on your actual API response structure
                if (response.data && response.data.items) {
                    setCourses(response.data.items.map(item => ({
                        _id: item.course._id,
                        title: item.course.title,
                        instructor: item.course.instructor || "N/A",
                        price: item.course.price || 0,
                        image: item.course.thumbnailUrl ?
                            (item.course.thumbnailUrl.startsWith('http') ? item.course.thumbnailUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${item.course.thumbnailUrl}`) :
                            "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150&h=100&fit=crop",
                        duration: item.course.duration || "N/A",
                    })));
                } else if (response.data && Array.isArray(response.data)) {
                    // If API returns array directly
                    setCourses(response.data.map(item => ({
                        _id: item.course._id,
                        title: item.course.title,
                        instructor: item.course.instructor || "N/A",
                        price: item.course.price || 0,
                        image: item.course.thumbnailUrl ?
                            (item.course.thumbnailUrl.startsWith('http') ? item.course.thumbnailUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${item.course.thumbnailUrl}`) :
                            "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150&h=100&fit=crop",
                        duration: item.course.duration || "N/A",
                    })));
                }
            } catch (error) {
                console.error("Error fetching cart data:", error);

                if (error.response?.status === 401) {
                    console.log("Unauthorized - redirecting to login");
                    localStorage.removeItem("token");
                    navigate("/login");
                } else {
                    console.error("Cart fetch error:", error.response?.data?.message || error.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCartData();
    }, [navigate]);

    const subtotal = courses.reduce((sum, course) => sum + (course.price || 0), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    const removeCourse = async (courseId) => {
        if (removingCourse) return; // Prevent multiple removals

        try {
            setRemovingCourse(courseId);
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            console.log("Removing course from cart:", courseId);

            // Call API to remove course from cart
            await axios.delete(
                `${process.env.REACT_APP_API_URL}/api/cart/${courseId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            // Update local state
            setCourses(courses.filter((course) => course._id !== courseId));
            console.log("Course removed successfully");

            // 🔥 IMPORTANT: Dispatch custom event to update navbar cart count in real-time
            window.dispatchEvent(new CustomEvent('cartUpdated'));

        } catch (error) {
            console.error("Error removing course from cart:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
            } else {
                alert(error.response?.data?.message || "Failed to remove course from cart");
            }
        } finally {
            setRemovingCourse(null);
        }
    };

    const handleProceedToCheckout = () => {
        if (courses.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const cartData = { courses, subtotal, tax, total };
        sessionStorage.setItem("cartData", JSON.stringify(cartData));
        navigate("/checkout");
    };

    const handleContinueShopping = () => {
        navigate("/courses");
    };

    // Loading state
    if (loading) {
        return (
            <div className="container my-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center p-5">
                                <div className="spinner-border text-primary mb-3" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <h4 className="text-muted">Loading your cart...</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (orderComplete) {
        return (
            <div className="container my-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card border-0 shadow-lg">
                            <div className="card-body text-center p-5">
                                <CheckCircle className="text-success mb-4" size={80} />
                                <h2 className="text-success mb-3">Order Complete!</h2>
                                <p className="text-muted mb-4">
                                    Thank you for your purchase! Your courses are now available in
                                    your dashboard.
                                </p>
                                <div className="d-flex gap-3 justify-content-center">
                                    <button
                                        className="btn btn-primary px-4"
                                        onClick={() => setOrderComplete(false)}
                                    >
                                        Continue Shopping
                                    </button>
                                    <button
                                        className="btn btn-outline-primary px-4"
                                        onClick={() => navigate("/dashboard")}
                                    >
                                        Go to Dashboard
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <div className="row mb-4">
                <div className="col-12">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <button className="btn btn-link p-0 text-decoration-none" onClick={() => navigate("/")}>
                                    Home
                                </button>
                            </li>
                            <li className="breadcrumb-item active">Cart</li>
                            <li className="breadcrumb-item">
                                <button className="btn btn-link p-0 text-decoration-none" onClick={() => navigate("/checkout")}>
                                    Checkout
                                </button>
                            </li>
                        </ol>
                    </nav>
                </div>
                <div className="col">
                    <h2 className="d-flex align-items-center">
                        <ShoppingCart className="me-2" size={28} />
                        Shopping Cart
                        <span className="badge bg-primary ms-2">{courses.length}</span>
                    </h2>
                </div>
            </div>

            {courses.length === 0 ? (
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center p-5">
                                <ShoppingCart className="text-muted mb-3" size={60} />
                                <h4 className="text-muted mb-3">Your cart is empty</h4>
                                <p className="text-muted mb-4">
                                    Explore our courses and add some to your cart to get started!
                                </p>
                                <button className="btn btn-primary" onClick={handleContinueShopping}>
                                    <ArrowLeft className="me-2" size={16} />
                                    Browse Courses
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="row">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-0">
                                {courses.map((course) => (
                                    <div key={course._id} className="border-bottom p-4">
                                        <div className="row align-items-center">
                                            <div className="col-md-9">
                                                <div className="d-flex">
                                                    <img
                                                        src={course.image}
                                                        alt={course.title}
                                                        className="rounded me-3"
                                                        style={{ width: "120px", height: "80px", objectFit: "cover" }}
                                                        onError={(e) => {
                                                            e.target.src = "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150&h=100&fit=crop";
                                                        }}
                                                    />
                                                    <div>
                                                        <h5 className="mb-1">{course.title}</h5>
                                                        <p className="text-muted mb-1">by {course.instructor}</p>
                                                        <p className="text-muted mb-0">{course.duration}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3 d-flex align-items-center justify-content-between">
                                                <span className="h6 mb-0">
                                                    {course.price === 0 ? "Free" : `₹${(course.price || 0).toLocaleString()}`}
                                                </span>
                                                <button
                                                    className="btn btn-outline-danger btn-sm ms-3"
                                                    onClick={() => removeCourse(course._id)}
                                                    disabled={removingCourse === course._id}
                                                >
                                                    {removingCourse === course._id ? (
                                                        <div className="spinner-border spinner-border-sm" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="btn btn-outline-primary" onClick={handleContinueShopping}>
                            <ArrowLeft className="me-2" size={16} />
                            Continue Shopping
                        </button>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm position-sticky" style={{ top: "2rem" }}>
                            <div className="card-header bg-white border-0 pb-0">
                                <h5 className="mb-0">Order Summary</h5>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Subtotal:</span>
                                        <span>₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>GST (18%):</span>
                                        <span>₹{tax.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between fw-bold fs-5">
                                        <span>Total:</span>
                                        <span>₹{total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary w-100 py-3"
                                    onClick={handleProceedToCheckout}
                                    disabled={courses.length === 0}
                                >
                                    <CreditCard className="me-2" size={16} />
                                    Proceed to Checkout
                                </button>

                                <div className="mt-3 text-center">
                                    <small className="text-muted">
                                        🔒 Secure checkout with 256-bit SSL encryption
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;