/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Signup = () => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const res = await axios.post(`${API_URL}/api/user/signup`, {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            setMessage(res.data.message);

            if (res.status === 200) {
                // Navigate to OTP verification page, pass email via state
                navigate('/verify-otp', { state: { email: formData.email } });
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error occurred during signup');
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
                            <h2 className="mb-0">Join <span className="fw-bold">Edu</span></h2>
                            <p className="mb-0">Start your learning journey today</p>
                        </div>

                        <div className="card-body p-5">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="username" className="form-label fw-semibold">Username</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light">
                                            <i className="bi bi-person-fill text-primary"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control py-2"
                                            id="username"
                                            name="username"
                                            placeholder="Enter your username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

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
                                            placeholder="Create a password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="form-text">Use 8 or more characters with a mix of letters, numbers & symbols</div>
                                </div>


                                <div className="form-check mb-4">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="termsCheck"
                                        required
                                        disabled={isLoading}
                                    />
                                    <label className="form-check-label small" htmlFor="termsCheck">
                                        I agree to the <Link to="/terms" className="text-primary">Terms of Service</Link> and <Link to="/privacy" className="text-primary">Privacy Policy</Link>
                                    </label>
                                </div>

                                {/* Error/Success Message */}
                                {message && (
                                    <div className={`alert ${message.includes('success') || message.includes('verify') ? 'alert-success' : 'alert-danger'} text-center mb-3`}>
                                        {message}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 py-2 fw-semibold rounded-pill mb-3"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Creating Account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>

                                <div className="text-center small mt-3">
                                    Already have an account? <Link to="/login" className="text-primary fw-semibold">Log in</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;