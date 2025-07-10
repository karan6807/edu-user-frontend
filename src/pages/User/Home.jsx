/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Home() {
    const [courses, setCourses] = useState([]);

    const faqData = [
        {
            question: "What is JavaScript?",
            answer: "JavaScript is a versatile scripting language used to create interactive features on websites.",
        },
        {
            question: "What is React?",
            answer: "React is a JavaScript library for building user interfaces using components.",
        },
        {
            question: "What is a Full Stack Developer?",
            answer: "A Full Stack Developer works on both frontend and backend parts of a web application.",
        },
        {
            question: "What is Node.js?",
            answer: "Node.js is a runtime environment that allows you to run JavaScript on the server side.",
        },
        {
            question: "How to learn programming?",
            answer: "Start with basics like HTML, CSS, and JavaScript, then build projects and explore advanced topics.",
        },
        {
            question: "What is Git and GitHub?",
            answer: "Git is a version control system, and GitHub is a platform to host and collaborate on code.",
        },
    ];

    // ✅ Fetch courses from backend - Show only 3 courses
    useEffect(() => {
        const fetchFeaturedCourses = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/admin/courses");
                setCourses(res.data.slice(0, 3)); // Get only 3 courses
            } catch (err) {
                console.error("Error fetching courses:", err);
            }
        };

        fetchFeaturedCourses();
    }, []);

    return (
        <div>
            <style>
                {`
          .hero-section {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/books.jpg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
          }
          .hero-section h1, 
          .hero-section p {
            color: white;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
          }
        `}
            </style>

            {/* Hero Section */}
            <div className="hero-section text-center p-5">
                <h1>Learn New Skills Online</h1>
                <p className="lead">Join thousands of learners and explore top courses today.</p>
                <div className="d-inline-block">
                    <Link to="/courses" className="btn btn-primary btn-lg text-white fw-bold mt-3 px-4 px-md-5 py-2 py-md-3 rounded-pill shadow-lg">
                        Browse Courses
                    </Link>
                </div>
            </div>

            {/* Features */}
            <div className="container my-5 p-5">
                <div className="row text-center">
                    <div className="col-md-4">
                        <i className="bi bi-journal-richtext fs-1 text-primary"></i>
                        <h4 className="mt-3">Expert Instructors</h4>
                        <p>Learn from professionals with real-world experience.</p>
                    </div>
                    <div className="col-md-4">
                        <i className="bi bi-laptop fs-1 text-primary"></i>
                        <h4 className="mt-3">Flexible Learning</h4>
                        <p>Study anytime, anywhere on your schedule.</p>
                    </div>
                    <div className="col-md-4">
                        <i className="bi bi-award fs-1 text-primary"></i>
                        <h4 className="mt-3">Certificates</h4>
                        <p>Earn certificates and showcase your achievements.</p>
                    </div>
                </div>
            </div>

            {/* Popular Courses - Simple Row Layout */}
            <div className="container my-5">
                <h2 className="text-center mb-4">Popular Courses</h2>

                {courses.length > 0 ? (
                    <div className="row">
                        {courses.map((course) => (
                            <div key={course._id} className="col-md-4 mb-4">
                                <div className="card h-100 shadow-sm">
                                    <img
                                        src={`http://localhost:5000${course.thumbnailUrl}`}
                                        className="card-img-top"
                                        alt={course.title}
                                        style={{
                                            height: "180px",
                                            width: "100%",
                                            objectFit: "cover",
                                            objectPosition: "center",
                                        }}
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/300x180?text=No+Image";
                                        }}
                                    />
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title">{course.title}</h5>
                                        <p className="card-text">{course.description?.slice(0, 80)}...</p>
                                        <div className="mt-auto">
                                            <Link to={`/course/${course._id}`} className="btn btn-primary w-100">
                                                View Course
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center">
                        <p>No courses available at the moment.</p>
                    </div>
                )}
            </div>

            {/* FAQs */}
            <p className="text-success fw-bold text-center">FAQs</p>
            <h2 className="fw-bold text-center">Frequently Asked Questions</h2>
            <p className="text-center text-muted">
                Install our top-rated e-learning platform and get access to top courses, instructors, and resources.
            </p>

            <div className="container mt-5">
                <div className="row">
                    {faqData.map((faq, index) => (
                        <div key={index} className="col-md-6 mb-4">
                            <div className="card h-100 shadow-sm border-0 p-3">
                                <h5 className="fw-bold mb-2">{faq.question}</h5>
                                <p className="text-muted mb-0">{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Call to Action */}
            <div className="bg-white py-5 mt-5 text-center">
                <h3>Ready to get started?</h3>
                <p>Create your free account and start learning today!</p>
                <Link to="/signup" className="btn btn-primary">
                    Sign Up Now
                </Link>
            </div>
        </div>
    );
}

export default Home;