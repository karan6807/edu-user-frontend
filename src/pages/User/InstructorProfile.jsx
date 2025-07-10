// src/components/InstructorProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../../components/CourseCard';

function InstructorProfile() {
  // Fix: Change from instructorId to id to match the route parameter
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [instructor, setInstructor] = useState(null);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInstructorData();
  }, [id]);

  const fetchInstructorData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fix: Use the correct API endpoints
      // Fetch instructor details
      const instructorResponse = await axios.get(`http://localhost:5000/api/instructor-profile/${id}`);
      setInstructor(instructorResponse.data);

      // Fetch instructor's courses
      const coursesResponse = await axios.get(`http://localhost:5000/api/instructor-profile/${id}/courses`);
      setInstructorCourses(coursesResponse.data);

    } catch (err) {
      console.error('Error fetching instructor data:', err);
      setError(err.response?.data?.message || 'Failed to load instructor profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getProfileImage = () => {
    if (instructor?.profileImage) {
      // If it's a relative path, prepend the base URL
      if (instructor.profileImage.startsWith('/')) {
        return `http://localhost:5000${instructor.profileImage}`;
      }
      return instructor.profileImage;
    }
    return '/default-instructor-avatar.jpg';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="mt-3 text-muted">Loading instructor profile...</h4>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <div className="mb-4">
              <i className="fas fa-exclamation-triangle fa-4x text-danger opacity-50"></i>
            </div>
            <h4 className="text-danger mb-3">Error Loading Profile</h4>
            <p className="text-muted mb-4">{error}</p>
            <button
              className="btn btn-primary me-3"
              onClick={() => navigate('/courses')}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Courses
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={fetchInstructorData}
            >
              <i className="fas fa-refresh me-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No instructor found
  if (!instructor) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <div className="mb-4">
              <i className="fas fa-user-slash fa-4x text-muted opacity-50"></i>
            </div>
            <h4 className="text-muted mb-3">Instructor Not Found</h4>
            <p className="text-muted mb-4">The instructor you're looking for doesn't exist or has been removed.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/courses')}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Back Button */}
      <div className="row mb-4">
        <div className="col-12">
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate('/courses')}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Courses
          </button>
        </div>
      </div>

      {/* Instructor Profile Header */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-3 text-center mb-4 mb-md-0">
                  <img
                    src={getProfileImage()}
                    alt={instructor.name}
                    className="rounded-circle shadow"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/default-instructor-avatar.jpg';
                    }}
                  />
                </div>
                <div className="col-md-9">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h1 className="mb-2">{instructor.name}</h1>
                      <p className="text-muted mb-0 fs-5">{instructor.email}</p>
                    </div>
                    <div className="text-end">
                      {instructor.rating > 0 && (
                        <div className="mb-2">
                          <span className="badge bg-warning text-dark fs-6">
                            <i className="fas fa-star me-1"></i>
                            {instructor.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                      {!instructor.isActive && (
                        <span className="badge bg-secondary">Inactive</span>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {instructor.bio && (
                    <div className="mb-3">
                      <h6 className="fw-bold mb-2">About</h6>
                      <p className="text-muted">{instructor.bio}</p>
                    </div>
                  )}

                  {/* Specializations */}
                  {instructor.specializations && instructor.specializations.length > 0 && (
                    <div className="mb-3">
                      <h6 className="fw-bold mb-2">Specializations</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {instructor.specializations.map((spec, index) => (
                          <span key={index} className="badge bg-primary">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  {(instructor.socialLinks?.linkedin || instructor.socialLinks?.github || instructor.socialLinks?.website) && (
                    <div>
                      <h6 className="fw-bold mb-2">Connect</h6>
                      <div className="d-flex gap-3">
                        {instructor.socialLinks.linkedin && (
                          <a
                            href={instructor.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary btn-sm"
                          >
                            <i className="fab fa-linkedin me-1"></i>
                            LinkedIn
                          </a>
                        )}
                        {instructor.socialLinks.github && (
                          <a
                            href={instructor.socialLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-dark btn-sm"
                          >
                            <i className="fab fa-github me-1"></i>
                            GitHub
                          </a>
                        )}
                        {instructor.socialLinks.website && (
                          <a
                            href={instructor.socialLinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-info btn-sm"
                          >
                            <i className="fas fa-globe me-1"></i>
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructor's Courses */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0">
              <i className="fas fa-graduation-cap me-2 text-primary"></i>
              Courses by {instructor.name}
            </h3>
            <span className="badge bg-secondary fs-6">
              {instructorCourses.length} course{instructorCourses.length !== 1 ? 's' : ''}
            </span>
          </div>

          {instructorCourses.length > 0 ? (
            <div className="row">
              {instructorCourses.map((course) => (
                <div key={course._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="fas fa-book-open fa-4x text-muted opacity-50"></i>
              </div>
              <h5 className="text-muted mb-3">No Courses Yet</h5>
              <p className="text-muted">
                This instructor hasn't published any courses yet. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructorProfile;