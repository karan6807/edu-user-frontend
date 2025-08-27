/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { AlertCircle, CreditCard, Shield, Truck, Clock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const Checkout = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        paymentMethod: 'card'
    });

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [isDirectPurchase, setIsDirectPurchase] = useState(false); // Track if it's a direct purchase

    // Get user info
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Indian states for dropdown
    const indianStates = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
    ];

    // Fetch cart items on component mount
    useEffect(() => {
        const fetchCartData = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                // FIRST: Check if there's direct "Buy Now" data in sessionStorage
                const sessionCartData = sessionStorage.getItem("cartData");
                if (sessionCartData) {
                    console.log("Using Buy Now data from sessionStorage");
                    const parsedData = JSON.parse(sessionCartData);
                    setIsDirectPurchase(true); // Mark as direct purchase

                    // Format the data to match your component's expected structure
                    const formattedItems = parsedData.courses.map(course => ({
                        _id: course._id,
                        courseId: course._id,
                        title: course.title,
                        instructor: course.instructor || "N/A",
                        price: course.price || 0,
                        image: course.image || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150&h=100&fit=crop",
                        duration: course.duration || "N/A",
                        quantity: 1,
                    }));

                    setCartItems(formattedItems);

                    // Pre-fill email if user is logged in
                    if (user.email) {
                        setFormData(prev => ({ ...prev, email: user.email }));
                    }

                    setPageLoading(false);
                    return; // Exit early, don't fetch from API
                }

                // SECOND: If no sessionStorage data, fetch from API (regular cart flow)
                console.log("Fetching cart data from API...");
                setIsDirectPurchase(false); // Mark as regular cart purchase
                
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/cart`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );

                console.log("Cart data received for checkout:", response.data);

                // Process cart items - handle both response formats
                if (response.data && response.data.items) {
                    const processedItems = response.data.items.map(item => ({
                        _id: item.course._id,
                        courseId: item.course._id,
                        title: item.course.title,
                        instructor: item.course.instructor || "N/A",
                        price: item.course.discountedPrice || item.course.price || 0,
                        image: item.course.thumbnailUrl ?
                            (item.course.thumbnailUrl.startsWith('http') ? item.course.thumbnailUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${item.course.thumbnailUrl}`) :
                            "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150&h=100&fit=crop",
                        duration: item.course.duration || "N/A",
                        quantity: item.quantity || 1,
                    }));

                    setCartItems(processedItems);
                } else if (response.data && Array.isArray(response.data)) {
                    const processedItems = response.data.map(item => ({
                        _id: item.course._id,
                        courseId: item.course._id,
                        title: item.course.title,
                        instructor: item.course.instructor || "N/A",
                        price: item.course.discountedPrice || item.course.price || 0,
                        image: item.course.thumbnailUrl ?
                            (item.course.thumbnailUrl.startsWith('http') ? item.course.thumbnailUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${item.course.thumbnailUrl}`) :
                            "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150&h=100&fit=crop",
                        duration: item.course.duration || "N/A",
                        quantity: item.quantity || 1,
                    }));

                    setCartItems(processedItems);
                }

                // Pre-fill email if user is logged in
                if (user.email) {
                    setFormData(prev => ({ ...prev, email: user.email }));
                }

            } catch (error) {
                console.error("Error fetching cart data for checkout:", error);

                if (error.response?.status === 401) {
                    console.log("Unauthorized - redirecting to login");
                    localStorage.removeItem("token");
                    navigate("/login");
                } else {
                    console.error("Checkout cart fetch error:", error.response?.data?.message || error.message);
                    alert("Failed to load cart data. Please try again.");
                }
            } finally {
                setPageLoading(false);
            }
        };

        fetchCartData();
    }, [navigate, user.email]);

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
        const price = item.price || 0;
        const quantity = item.quantity || 1;
        return sum + (price * quantity);
    }, 0);

    const shipping = subtotal > 50000 ? 0 : 500; // Free shipping above ₹50,000
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + shipping + tax;

    // Format currency in Indian format
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        else if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Enter valid 10-digit Indian mobile number';

        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.pincode) newErrors.pincode = 'PIN code is required';
        else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Enter valid 6-digit PIN code';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Stripe Checkout Session Handler
    const handleStripeCheckout = async () => {
        if (!validateForm()) return;

        if (cartItems.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        setLoading(true);

        try {
            console.log("=== STRIPE CHECKOUT PROCESS ===");

            // Step 1: Create order first
            const orderPayload = {
                customerInfo: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode
                },
                paymentMethod: 'card',
                // Include items for direct purchase
                ...(isDirectPurchase && {
                    items: cartItems.map(item => ({
                        courseId: item.courseId,
                        quantity: item.quantity || 1,
                        price: item.price
                    }))
                })
            };

            console.log("Creating order...", orderPayload);

            const orderResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderPayload)
            });

            if (!orderResponse.ok) {
                const errorData = await orderResponse.json().catch(() => ({ message: 'Failed to create order' }));
                throw new Error(errorData.message || 'Failed to create order');
            }

            const orderData = await orderResponse.json();
            console.log("Order created successfully:", orderData);

            if (!orderData?.order?._id) {
                throw new Error('Invalid order response - missing order ID');
            }

            // Step 2: Create Stripe Checkout Session
            console.log("Creating Stripe checkout session...");

            const checkoutPayload = {
                orderId: orderData.order._id
            };

            const checkoutResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(checkoutPayload)
            });

            if (!checkoutResponse.ok) {
                const errorData = await checkoutResponse.json().catch(() => ({ message: 'Failed to create checkout session' }));
                throw new Error(errorData.message || 'Failed to create checkout session');
            }

            const checkoutData = await checkoutResponse.json();
            console.log("Checkout session created:", checkoutData);

            if (!checkoutData.success || !checkoutData.url) {
                throw new Error('Invalid checkout session response');
            }

            // Step 3: Clear sessionStorage after successful order creation
            if (isDirectPurchase) {
                sessionStorage.removeItem("cartData");
            }

            // Step 4: Redirect to Stripe Checkout
            console.log("Redirecting to Stripe Checkout...");
            window.location.href = checkoutData.url;

        } catch (error) {
            console.error('Stripe checkout error:', error);
            alert(`Checkout failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Handle non-Stripe payments (UPI, NetBanking)
    const handleNonStripePayment = async () => {
        console.log("Processing non-Stripe payment:", formData.paymentMethod);
        alert(`${formData.paymentMethod} payment is not yet implemented. Please use card payment.`);
    };

    // Main submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.paymentMethod === 'card') {
            // Use Stripe Checkout for card payments
            await handleStripeCheckout();
        } else {
            // Handle other payment methods
            await handleNonStripePayment();
        }
    };

    // Show loading state
    if (pageLoading) {
        return (
            <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading checkout...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-light min-vh-100 py-4">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card shadow-sm">
                            <div className="card-header bg-white">
                                <h4 className="mb-0">
                                    <CreditCard className="me-2" size={24} />
                                    Checkout
                                </h4>
                            </div>

                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    {/* Customer Information */}
                                    <div className="mb-4">
                                        <h5 className="mb-3">Customer Information</h5>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label">First Name *</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your first name"
                                                />
                                                {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Last Name *</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your last name"
                                                />
                                                {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Email *</label>
                                                <input
                                                    type="email"
                                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your email"
                                                />
                                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Phone Number *</label>
                                                <input
                                                    type="tel"
                                                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter 10-digit mobile number"
                                                />
                                                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping Address */}
                                    <div className="mb-4">
                                        <h5 className="mb-3">
                                            <Truck className="me-2" size={20} />
                                            Shipping Address
                                        </h5>
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <label className="form-label">Address *</label>
                                                <textarea
                                                    className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    placeholder="Enter your complete address"
                                                />
                                                {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">City *</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your city"
                                                />
                                                {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">State *</label>
                                                <select
                                                    className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Select State</option>
                                                    {indianStates.map(state => (
                                                        <option key={state} value={state}>{state}</option>
                                                    ))}
                                                </select>
                                                {errors.state && <div className="invalid-feedback">{errors.state}</div>}
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">PIN Code *</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.pincode ? 'is-invalid' : ''}`}
                                                    name="pincode"
                                                    value={formData.pincode}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter 6-digit PIN code"
                                                />
                                                {errors.pincode && <div className="invalid-feedback">{errors.pincode}</div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="mb-4">
                                        <h5 className="mb-3">
                                            <Shield className="me-2" size={20} />
                                            Payment Method
                                        </h5>
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value="card"
                                                        checked={formData.paymentMethod === 'card'}
                                                        onChange={handleInputChange}
                                                    />
                                                    <label className="form-check-label">
                                                        <CreditCard size={16} className="me-2" />
                                                        Credit/Debit Card
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value="upi"
                                                        checked={formData.paymentMethod === 'upi'}
                                                        onChange={handleInputChange}
                                                    />
                                                    <label className="form-check-label">
                                                        UPI
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value="netbanking"
                                                        checked={formData.paymentMethod === 'netbanking'}
                                                        onChange={handleInputChange}
                                                    />
                                                    <label className="form-check-label">
                                                        Net Banking
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="mb-4">
                                        <h5 className="mb-3">Order Summary</h5>
                                        <div className="border rounded p-3">
                                            {cartItems.map((item, index) => (
                                                <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="d-flex align-items-center">
                                                        <img
                                                            src={item.image}
                                                            alt={item.title}
                                                            className="rounded me-3"
                                                            style={{ width: '50px', height: '40px', objectFit: 'cover' }}
                                                        />
                                                        <div>
                                                            <h6 className="mb-0">{item.title}</h6>
                                                            <small className="text-muted">
                                                                {item.instructor} • {item.duration}
                                                                {item.quantity > 1 && ` • Qty: ${item.quantity}`}
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <span className="fw-bold">{formatCurrency(item.price * item.quantity)}</span>
                                                </div>
                                            ))}
                                            <hr />
                                            <div className="d-flex justify-content-between">
                                                <span>Subtotal:</span>
                                                <span>{formatCurrency(subtotal)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Shipping:</span>
                                                <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Tax (GST 18%):</span>
                                                <span>{formatCurrency(tax)}</span>
                                            </div>
                                            <hr />
                                            <div className="d-flex justify-content-between fw-bold fs-5">
                                                <span>Total:</span>
                                                <span>{formatCurrency(total)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security Info */}
                                    <div className="alert alert-info d-flex align-items-center mb-4">
                                        <Shield className="me-2" size={20} />
                                        <small>
                                            Your payment information is secure and encrypted.
                                            We use industry-standard security measures to protect your data.
                                        </small>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="text-center">
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg px-5"
                                            disabled={loading || cartItems.length === 0}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="spinner-border spinner-border-sm me-2" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="me-2" size={20} />
                                                    Complete Payment ({formatCurrency(total)})
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;