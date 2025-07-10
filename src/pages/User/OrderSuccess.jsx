import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Package, CreditCard, Home, ShoppingBag, Eye } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OrderSuccess = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Get URL parameters from Stripe redirect
    const session_id = searchParams.get('session_id');
    const order_id = searchParams.get('order_id');
    const canceled = searchParams.get('canceled');

    // Get token from localStorage
    const token = localStorage.getItem('token');

    useEffect(() => {
        const handleCheckoutReturn = async () => {
            console.log('=== ORDER SUCCESS PAGE ===');
            console.log('URL Params:', { session_id, order_id, canceled });

            // Check if user is authenticated
            if (!token) {
                console.log('No token found - redirecting to login');
                setError('Please log in to view your order');
                setLoading(false);
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            // Handle canceled checkout
            if (canceled === 'true') {
                console.log('Checkout was canceled');
                setError('Payment was canceled. You can try again or choose a different payment method.');
                setLoading(false);
                return;
            }

            // Handle successful checkout
            if (session_id && order_id) {
                try {
                    console.log('Processing checkout success...', { session_id, order_id });

                    // Call backend API to verify payment and get order details
                    const response = await fetch(
                        `${process.env.REACT_APP_API_URL}/api/orders/checkout-success?session_id=${session_id}&order_id=${order_id}`,
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    console.log('API Response Status:', response.status);

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ message: 'Failed to verify payment' }));
                        throw new Error(errorData.message || 'Payment verification failed');
                    }

                    const data = await response.json();
                    console.log('Checkout success response:', data);

                    if (data.success && data.order) {
                        console.log('Order retrieved successfully:', data.order);
                        setOrder(data.order);

                        // Show success message
                        setTimeout(() => {
                            // You can use a toast notification library instead of alert
                            console.log('🎉 Payment successful! Order confirmed.');
                        }, 500);
                    } else {
                        throw new Error(data.message || 'Failed to retrieve order details');
                    }

                } catch (error) {
                    console.error('Error processing checkout success:', error);
                    setError(`Error verifying payment: ${error.message}. Please contact support if money was deducted.`);
                } finally {
                    setLoading(false);
                }
            } else {
                console.log('Missing required parameters:', { session_id, order_id });
                setError('Invalid checkout session. Missing required parameters.');
                setLoading(false);
            }
        };

        handleCheckoutReturn();
    }, [session_id, order_id, canceled, token, navigate]);

    // Format currency in Indian format
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status icon and color
    const getStatusDisplay = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return { icon: Clock, color: 'text-yellow-600 bg-yellow-100', text: 'Order Pending' };
            case 'confirmed':
                return { icon: CheckCircle, color: 'text-green-600 bg-green-100', text: 'Order Confirmed' };
            case 'processing':
                return { icon: Package, color: 'text-blue-600 bg-blue-100', text: 'Processing' };
            case 'shipped':
                return { icon: Package, color: 'text-purple-600 bg-purple-100', text: 'Shipped' };
            case 'delivered':
                return { icon: CheckCircle, color: 'text-green-600 bg-green-100', text: 'Delivered' };
            case 'cancelled':
                return { icon: XCircle, color: 'text-red-600 bg-red-100', text: 'Cancelled' };
            default:
                return { icon: Clock, color: 'text-gray-600 bg-gray-100', text: 'Unknown Status' };
        }
    };

    const handleNavigation = (path) => {
        console.log(`Navigating to: ${path}`);
        navigate(path);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h4 className="text-xl font-semibold text-gray-800">Processing your payment...</h4>
                    <p className="text-gray-600 mt-2">Please wait while we confirm your order.</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-white rounded-lg shadow-lg border border-red-200 p-8 text-center">
                        <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-red-600 mb-2">Payment Issue</h3>
                        <p className="text-gray-600 mb-6">{error}</p>

                        <div className="flex gap-3 justify-center">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={() => handleNavigation('/cart')}
                            >
                                Back to Cart
                            </button>
                            <button
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                onClick={() => handleNavigation('/orders')}
                            >
                                View Orders
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (order) {
        const statusDisplay = getStatusDisplay(order.status);
        const StatusIcon = statusDisplay.icon;

        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Success Header */}
                    <div className="bg-white rounded-lg shadow-lg border border-green-200 p-8 text-center mb-6">
                        <CheckCircle size={80} className="text-green-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h2>
                        <p className="text-gray-600 mb-4">
                            Your order has been placed successfully. You will receive an email confirmation shortly.
                        </p>
                        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
                            Order ID: #{order._id || order.orderId}
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="bg-white rounded-lg shadow-lg mb-6">
                        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
                            <h5 className="text-lg font-semibold flex items-center">
                                <Package className="mr-2" size={20} />
                                Order Details
                            </h5>
                        </div>
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <h6 className="font-semibold text-gray-800">Order Date:</h6>
                                    <p className="text-gray-600">
                                        {formatDate(order.createdAt)}
                                    </p>
                                </div>
                                <div>
                                    <h6 className="font-semibold text-gray-800">Status:</h6>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
                                        <StatusIcon size={16} className="mr-1" />
                                        {statusDisplay.text}
                                    </span>
                                </div>
                            </div>

                            {order.customerInfo && (
                                <div>
                                    <h6 className="font-semibold text-gray-800 mb-2">Customer Information:</h6>
                                    <div className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                                        <p className="font-medium">
                                            {order.customerInfo.firstName} {order.customerInfo.lastName}
                                        </p>
                                        <p>Email: {order.customerInfo.email}</p>
                                        <p>Phone: {order.customerInfo.phone}</p>

                                        {/* Shipping Address */}
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="font-medium mb-2">Shipping Address:</p>
                                            <p>{order.customerInfo.address}</p>
                                            <p>{order.customerInfo.city}, {order.customerInfo.state} {order.customerInfo.pincode}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-lg shadow-lg mb-6">
                        <div className="bg-cyan-600 text-white px-6 py-4 rounded-t-lg">
                            <h5 className="text-lg font-semibold flex items-center">
                                <ShoppingBag className="mr-2" size={20} />
                                Items Ordered ({order.items?.length || 0})
                            </h5>
                        </div>
                        <div className="overflow-x-auto">
                            {order.items && order.items.length > 0 ? (
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {order.items.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {item.course?.thumbnailUrl && (
                                                            <img
                                                                src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${item.course.thumbnailUrl}`}
                                                                alt={item.course.title}
                                                                className="w-12 h-12 rounded-lg object-cover mr-4"
                                                                onError={(e) => {
                                                                    e.target.src = "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop";
                                                                }}
                                                            />
                                                        )}
                                                        <div>
                                                            <h6 className="font-medium text-gray-900">
                                                                {item.course?.title || item.title || 'Course Title'}
                                                            </h6>
                                                            {item.course?.category && (
                                                                <p className="text-sm text-gray-500">{item.course.category}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                                    {item.course?.instructor || item.instructor || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                                    {item.course?.duration || item.duration || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                                                    {formatCurrency(item.course?.discountedPrice || item.course?.price || item.price || 0)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <Package size={48} className="mx-auto mb-3 text-gray-400" />
                                    <p>No items found in this order.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-white rounded-lg shadow-lg mb-6">
                        <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg">
                            <h5 className="text-lg font-semibold flex items-center">
                                <CreditCard className="mr-2" size={20} />
                                Payment Summary
                            </h5>
                        </div>
                        <div className="p-6">
                            <div className="max-w-sm ml-auto">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                                    </div>

                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount:</span>
                                            <span>- {formatCurrency(order.discount)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping:</span>
                                        <span className="text-gray-900">
                                            {(order.shippingCost || 0) > 0 ? formatCurrency(order.shippingCost) : 'Free'}
                                        </span>
                                    </div>

                                    {(order.tax || 0) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tax (GST):</span>
                                            <span className="text-gray-900">{formatCurrency(order.tax)}</span>
                                        </div>
                                    )}

                                    <hr className="my-3" />

                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total:</span>
                                        <span className="text-green-600">
                                            {formatCurrency(order.totalAmount || order.total)}
                                        </span>
                                    </div>

                                    <div className="mt-4 pt-3 border-t">
                                        <p className="text-sm text-gray-500">
                                            Payment Method: {order.paymentMethod || 'Card'}
                                        </p>
                                        {order.paymentStatus && (
                                            <p className="text-sm text-gray-500">
                                                Payment Status: <span className="text-green-600 font-medium">{order.paymentStatus}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <h6 className="text-lg font-semibold text-gray-800 mb-4">What's next?</h6>
                        <div className="flex flex-wrap gap-3 justify-center mb-6">
                            <button
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={() => handleNavigation('/orders')}
                            >
                                <Eye className="mr-2" size={18} />
                                View All Orders
                            </button>
                            <button
                                className="flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                onClick={() => handleNavigation('/courses')}
                            >
                                <ShoppingBag className="mr-2" size={18} />
                                Browse Courses
                            </button>
                            <button
                                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                onClick={() => handleNavigation('/')}
                            >
                                <Home className="mr-2" size={18} />
                                Go to Home
                            </button>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">
                                <strong>Need help?</strong> Contact our support team at support@yourwebsite.com or call 1-800-SUPPORT
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback state
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <Package size={64} className="text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-800">No Order Found</h4>
                <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => handleNavigation('/orders')}
                >
                    View All Orders
                </button>
            </div>
        </div>
    );
};

export default OrderSuccess;