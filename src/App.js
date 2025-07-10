// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/User/Login';
import Signup from './pages/User/Signup';
import Profile from './pages/User/Profile';
import CourseDetail from './pages/User/CourseDetail';
import ForgotPassword from './pages/User/ForgotPassword';
import ResetPassword from './pages/User/ResetPassword';
import VerifyOtp from './pages/User/VerifyOtp';
import Home from './pages/User/Home';
import Courses from './pages/User/Courses';
import AboutUs from './pages/User/AboutUs';
import Contact from './pages/User/Contact';
import Cart from './pages/User/Cart';
import Checkout from './pages/User/Checkout';
import OrderSuccess from './pages/User/OrderSuccess';
import Footer from './components/Footer';
import CourseCard from './components/CourseCard';
import Favorite from './pages/User/Favorite';
import MyCourses from './pages/User/MyCourses';
import Learning from './pages/User/Learning';
import InstructorProfile from './pages/User/InstructorProfile';

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/favorites" element={<Favorite />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/learning" element={<Learning />} />
        {/* Add the parameterized route for course-specific learning */}
        <Route path="/course/:id/learning" element={<Learning />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/coursecard" element={<CourseCard />} />
        <Route path="/instructor/:id" element={<InstructorProfile />} />
        {/* Cart and Checkout routes */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
      </Routes>
      <Footer />
    </Router>
  );
}