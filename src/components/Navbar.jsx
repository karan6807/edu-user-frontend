/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Navbar() {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const [searchQuery, setSearchQuery] = useState("");
    const [cartCount, setCartCount] = useState(0);
    const [userInfo, setUserInfo] = useState({ name: "", email: "", profileImage: null });
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Fetch cart count when component mounts or token changes
    useEffect(() => {
        if (token) {
            fetchCartCount();
            fetchUserInfo();
        } else {
            setCartCount(0);
            setUserInfo({ name: "", email: "", profileImage: null });
        }
    }, [token]);

    // Function to fetch user info from backend
    const fetchUserInfo = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/user-profile/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.user) {
                setUserInfo({
                    name: response.data.user.username || "",
                    email: response.data.user.email || "",
                    profileImage: response.data.user.profileImage || null
                });
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
        }
    };

    // Function to fetch cart count from backend
    const fetchCartCount = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Assuming the response contains cart items array
            const cartItems = response.data.items || response.data || [];
            setCartCount(Array.isArray(cartItems) ? cartItems.length : 0);
        } catch (error) {
            console.error("Error fetching cart count:", error);
            setCartCount(0);
        }
    };

    // Create a custom event listener for cart updates
    useEffect(() => {
        const handleCartUpdate = () => {
            if (token) {
                fetchCartCount();
            }
        };

        // Listen for custom cart update events
        window.addEventListener('cartUpdated', handleCartUpdate);

        // Cleanup event listener
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, [token]);

    // Create a custom event listener for profile updates
    useEffect(() => {
        const handleProfileUpdate = () => {
            if (token) {
                fetchUserInfo();
            }
        };

        // Listen for custom profile update events
        window.addEventListener('profileUpdated', handleProfileUpdate);

        // Cleanup event listener
        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, [token]);

    // Function to get user initials
    const getUserInitials = (name) => {
        if (!name) return "U"; // Default to "U" for User if no name

        const nameParts = name.trim().split(' ');
        if (nameParts.length >= 2) {
            // First name and last name initials
            return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
        } else {
            // Just first name initial
            return nameParts[0][0].toUpperCase();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setCartCount(0);
        setUserInfo({ name: "", email: "", profileImage: null });
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim() !== "") {
            navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
            <div className="container-fluid">
                <Link className="navbar-brand ms-2 fs-3 fw-lighter" to="/">
                    Edu
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto mb-lg-0 mt-1 gap-3">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/courses">Courses</Link>
                        </li>

                        {token && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/my-courses">My-Courses</Link>
                            </li>
                        )}

                        <li className="nav-item">
                            <Link className="nav-link" to="/about">About Us</Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/contact">Contact</Link>
                        </li>

                        <li className="nav-item position-relative">
                            <Link className="nav-link" to="/cart">
                                Cart
                                {token && cartCount > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                        {cartCount}
                                        <span className="visually-hidden">items in cart</span>
                                    </span>
                                )}
                            </Link>
                        </li>

                        {/* Search Bar - Desktop */}
                        <li className="nav-item ms-5 mt-1 d-none d-lg-block">
                            <form className="d-flex" onSubmit={handleSearch}>
                                <input
                                    className="form-control me-2"
                                    type="search"
                                    placeholder="Search Courses"
                                    aria-label="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button className="btn btn-outline-success" type="submit">
                                    Search
                                </button>
                            </form>
                        </li>

                        {token ? (
                            <li className="nav-item dropdown ms-3">
                                <a
                                    className="nav-link dropdown-toggle d-flex align-items-center"
                                    href="#"
                                    id="navbarDropdown"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    {/* User Avatar - Profile Image or Initials */}
                                    <div
                                        className="d-flex align-items-center justify-content-center rounded-circle overflow-hidden"
                                        style={{
                                            width: '35px',
                                            height: '35px',
                                            backgroundColor: userInfo.profileImage ? 'transparent' : '#667eea',
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            border: userInfo.profileImage ? '2px solid #667eea' : 'none'
                                        }}
                                    >
                                        {userInfo.profileImage ? (
                                            <img
                                                src={userInfo.profileImage}
                                                alt="Profile"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        ) : (
                                            getUserInitials(userInfo.name)
                                        )}
                                    </div>
                                </a>
                                <ul
                                    className="dropdown-menu dropdown-menu-end"
                                    aria-labelledby="navbarDropdown"
                                >
                                    <li>
                                        <Link className="dropdown-item" to="/profile">Profile</Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to="/favorites">Favourite</Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to="/settings">Settings</Link>
                                    </li>
                                    <li>
                                        <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                                    </li>
                                </ul>
                            </li>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">Login</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>

                {/* Search Bar - Mobile */}
                <div className="d-block d-lg-none w-100 px-3 mt-2">
                    <form className="d-flex" onSubmit={handleSearch}>
                        <input
                            className="form-control me-2"
                            type="search"
                            placeholder="Search Courses"
                            aria-label="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="btn btn-outline-success" type="submit">
                            Search
                        </button>
                    </form>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;