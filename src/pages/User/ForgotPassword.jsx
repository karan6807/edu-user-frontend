import React, { useState } from 'react';
import axios from 'axios';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post('http://localhost:5000/api/user/forgot-password', { email });
            setMessage(res.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error sending reset link');
        }
    };


    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
                <h3 className="text-center mb-3">Forgot Password</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        Send Reset Link
                    </button>
                </form>
                {message && (
                    <div className="mt-3 text-center">
                        <small className={message.includes('sent') ? 'text-success' : 'text-danger'}>
                            {message}
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
}
