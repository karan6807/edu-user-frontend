import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

export default function VerifyOtp() {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setMessage('Email not found. Please signup first.');
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/api/user/verify-otp`, { email, otp });

            setMessage(res.data.message);
            if (res.status === 200) {
                alert('Email verified! Now you can login.');
                navigate('/login');
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error');
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
                <h3 className="text-center mb-3">Verify OTP</h3>
                {email && (
                    <p className="text-center text-muted small mb-3">
                        OTP sent to <strong>{email}</strong>
                    </p>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-success w-100">
                        Verify
                    </button>
                </form>
                {message && (
                    <div className="mt-3 text-center text-danger">
                        <small>{message}</small>
                    </div>
                )}
            </div>
        </div>
    );
}
