/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // 🔒 Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/');
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const res = await axios.post('http://localhost:5000/api/user/login', {
                email: formData.email,
                password: formData.password
            });

            setMessage(res.data.message);

            if (res.status === 200) {
                // Store token in localStorage
                localStorage.setItem('token', res.data.token);

                // Handle "Remember Me" functionality
                if (formData.rememberMe) {
                    // Store additional user info if needed
                    localStorage.setItem('rememberMe', 'true');
                }

                // Navigate to home page
                navigate('/');
            }
        } catch (error) {
            setIsLoading(false);
            const errData = error.response?.data;
            setMessage(errData?.message || 'Login failed. Please try again.');

            // Handle OTP verification redirect (same as your Login.jsx)
            if (errData?.redirectTo === '/verify-otp' && errData?.email) {
                navigate('/verify-otp', { state: { email: errData.email } });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-fluid vh-100" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="row justify-content-center align-items-center h-100">
                <div className="col-md-6 col-lg-5 col-xl-4">
                    <div className="card shadow-lg border-0 rounded-lg">
                        <div className="card-header bg-primary text-white text-center py-4">
                            <h2 className="mb-0">Welcome back to <span className="fw-bold">Edu</span></h2>
                            <p className="mb-0">Continue your learning journey</p>
                        </div>

                        <div className="card-body p-5">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="email" className="form-label fw-semibold">Email</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light">
                                            <i className="bi bi-envelope-fill text-primary"></i>
                                        </span>
                                        <input
                                            type="email"
                                            className="form-control py-2"
                                            id="email"
                                            name="email"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label fw-semibold">Password</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light">
                                            <i className="bi bi-lock-fill text-primary"></i>
                                        </span>
                                        <input
                                            type="password"
                                            className="form-control py-2"
                                            id="password"
                                            name="password"
                                            placeholder="Enter your password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="d-flex justify-content-end mt-2">
                                        <Link to="/forgot-password" className="text-primary small">
                                            Forgot password?
                                        </Link>
                                    </div>
                                </div>

                                {/* Remember Me Checkbox */}
                                <div className="mb-3">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="rememberMe"
                                            name="rememberMe"
                                            checked={formData.rememberMe}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                        />
                                        <label className="form-check-label small" htmlFor="rememberMe">
                                            Remember me
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 py-2 fw-semibold rounded-pill mb-3"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Logging in...
                                        </>
                                    ) : (
                                        'Log In'
                                    )}
                                </button>

                                {/* Error/Success Message */}
                                {message && (
                                    <div className={`alert ${message.includes('success') || message.includes('Welcome') ? 'alert-success' : 'alert-danger'} text-center`}>
                                        {message}
                                    </div>
                                )}

                                <div className="text-center small mt-3">
                                    Don't have an account? <Link to="/signup" className="text-primary fw-semibold">Sign up</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;