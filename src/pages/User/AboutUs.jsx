// src/pages/AboutUs.jsx
import React from "react";

function AboutUs() {
    return (
        <div className="container my-5">
            {/* Hero Section */}
            <div className="text-center mb-5">
                <h1 className="display-4 fw-bold">About Edu</h1>
                <p className="lead">Empowering learners with world-class online education.</p>
            </div>

            {/* Mission Section */}
            <div className="row align-items-center mb-5">
                <div className="col-md-6">
                    <img
                        src="https://img.freepik.com/free-vector/online-tutorials-concept_52683-37480.jpg"
                        alt="Our Mission"
                        className="img-fluid rounded"
                    />
                </div>
                <div className="col-md-6">
                    <h2>Our Mission</h2>
                    <p>
                        At Edu, our mission is to make quality education accessible to everyone, anywhere.
                        We provide top-notch courses from industry experts to help learners enhance their skills
                        and succeed in their careers.
                    </p>
                </div>
            </div>

            {/* Vision Section */}
            <div className="row align-items-center mb-5 flex-md-row-reverse">
                <div className="col-md-6">
                    <img
                        src="https://img.freepik.com/free-photo/teacher-talking-with-her-students-online_23-2148771464.jpg?ga=GA1.1.270160562.1749891703&semt=ais_hybrid&w=740"
                        alt="Our Vision"
                        className="img-fluid rounded"
                    />
                </div>
                <div className="col-md-6">
                    <h2>Our Vision</h2>
                    <p>
                        We envision a world where anyone can learn anything at their own pace.
                        Edu aims to build a global learning community driven by curiosity, knowledge,
                        and innovation.
                    </p>
                </div>
            </div>

            {/* Our Team Section */}
            <div className="text-center mb-5">
                <h2 className="mb-4">Meet Our Team</h2>
                <div className="row">
                    <div className="col-md-4 mb-4">
                        <div className="card h-100 shadow-sm">
                            <img
                                src="https://images.pexels.com/photos/30386124/pexels-photo-30386124/free-photo-of-confident-african-male-in-red-shirt-portrait.jpeg?auto=compress&cs=tinysrgb&w=600"
                                className="card-img-top"
                                alt="Team Member"
                            />
                            <div className="card-body">
                                <h5 className="card-title">Jatin Sharma</h5>
                                <p className="card-text">Founder & Full-Stack Developer</p>
                            </div>
                        </div>
                    </div>
                    {/* Add more team members here */}
                </div>
            </div>

            {/* Call to Action */}
            <div className="bg-light p-5 rounded text-center">
                <h3>Ready to Learn?</h3>
                <p>Join thousands of learners and boost your skills with Edu today!</p>
                <a href="/courses" className="btn btn-primary">
                    Browse Courses
                </a>
            </div>
        </div>
    );
}

export default AboutUs;
