import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    userType: 'student'
  });

  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Name cannot exceed 100 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please provide a valid email address';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Please provide a valid phone number';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    } else if (formData.subject.trim().length > 200) {
      errors.subject = 'Subject cannot exceed 200 characters';
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length > 1000) {
      errors.message = 'Message cannot exceed 1000 characters';
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);

    try {
      // Updated API endpoint - check your backend route configuration
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || null,
          subject: formData.subject.trim(),
          message: formData.message.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          userType: 'student'
        });

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false);
        }, 5000);
      } else {
        if (data.errors) {
          // Handle validation errors from backend
          const backendErrors = {};
          data.errors.forEach(err => {
            const field = err.toLowerCase();
            if (field.includes('name')) backendErrors.name = err;
            else if (field.includes('email')) backendErrors.email = err;
            else if (field.includes('phone')) backendErrors.phone = err;
            else if (field.includes('subject')) backendErrors.subject = err;
            else if (field.includes('message')) backendErrors.message = err;
          });
          setValidationErrors(backendErrors);
        } else {
          setError(data.message || 'Failed to send message. Please try again.');
        }
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      userType: 'student'
    });
    setValidationErrors({});
    setError('');
    setIsSubmitted(false);
  };

  return (
    <>
      <style>{`
        .contact-container {
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        .btn:focus {
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
        .contact-card {
          transition: transform 0.2s ease-in-out;
        }
        .contact-card:hover {
          transform: translateY(-2px);
        }
        .form-control:focus, .form-select:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
        }
        .alert {
          border: none;
          border-radius: 8px;
        }
        .form-text {
          font-size: 0.875rem;
          color: #6c757d;
        }
        .bg-primary {
          background-color: #0d6efd !important;
        }
        .text-primary {
          color: #0d6efd !important;
        }
        .btn-primary {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        .btn-primary:hover {
          background-color: #0b5ed7;
          border-color: #0a58ca;
        }
        .card {
          border: none;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        }
        .shadow-sm {
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
        }
      `}</style>

      <div className="contact-container">
        {/* Header Section */}
        <div className="bg-primary text-white py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto text-center">
                <h1 className="display-4 fw-bold mb-3">Contact Us</h1>
                <p className="lead">
                  Have questions about our educational programs? We're here to help you succeed in your learning journey.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-5">
          <div className="row g-5">
            {/* Contact Form */}
            <div className="col-lg-8">
              <div className="card contact-card shadow-sm border-0">
                <div className="card-body p-4">
                  <h3 className="card-title mb-4 text-primary">
                    📧 Send us a Message
                  </h3>

                  {/* Success Message */}
                  {isSubmitted && (
                    <div className="alert alert-success d-flex align-items-center alert-dismissible fade show" role="alert">
                      ✅
                      <div className="ms-2">
                        <strong>Thank you for your message!</strong> We've received your inquiry and will get back to you within 24 hours.
                      </div>
                      <button type="button" className="btn-close" onClick={() => setIsSubmitted(false)} aria-label="Close"></button>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center alert-dismissible fade show" role="alert">
                      ⚠️
                      <div className="ms-2">{error}</div>
                      <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="name" className="form-label fw-semibold">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          maxLength="100"
                          disabled={loading}
                          required
                        />
                        {validationErrors.name && (
                          <div className="invalid-feedback">{validationErrors.name}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label fw-semibold">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={loading}
                          required
                        />
                        {validationErrors.email && (
                          <div className="invalid-feedback">{validationErrors.email}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="phone" className="form-label fw-semibold">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          className={`form-control ${validationErrors.phone ? 'is-invalid' : ''}`}
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+1 (234) 567-8900"
                          disabled={loading}
                        />
                        {validationErrors.phone && (
                          <div className="invalid-feedback">{validationErrors.phone}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="userType" className="form-label fw-semibold">
                          I am a *
                        </label>
                        <select
                          className="form-select"
                          id="userType"
                          name="userType"
                          value={formData.userType}
                          onChange={handleInputChange}
                          disabled={loading}
                          required
                        >
                          <option value="student">Student</option>
                          <option value="parent">Parent/Guardian</option>
                          <option value="teacher">Teacher/Educator</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label htmlFor="subject" className="form-label fw-semibold">
                          Subject *
                        </label>
                        <input
                          type="text"
                          className={`form-control ${validationErrors.subject ? 'is-invalid' : ''}`}
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="What can we help you with?"
                          maxLength="200"
                          disabled={loading}
                          required
                        />
                        {validationErrors.subject && (
                          <div className="invalid-feedback">{validationErrors.subject}</div>
                        )}
                        <div className="form-text">
                          {formData.subject.length}/200 characters
                        </div>
                      </div>

                      <div className="col-12">
                        <label htmlFor="message" className="form-label fw-semibold">
                          Message *
                        </label>
                        <textarea
                          className={`form-control ${validationErrors.message ? 'is-invalid' : ''}`}
                          id="message"
                          name="message"
                          rows="5"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Please provide details about your inquiry..."
                          maxLength="1000"
                          disabled={loading}
                          required
                        ></textarea>
                        {validationErrors.message && (
                          <div className="invalid-feedback">{validationErrors.message}</div>
                        )}
                        <div className="form-text">
                          {formData.message.length}/1000 characters
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="d-flex gap-3 align-items-center">
                          <button
                            type="submit"
                            className="btn btn-primary btn-lg px-4"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Sending...
                              </>
                            ) : (
                              <>
                                📤 Send Message
                              </>
                            )}
                          </button>

                          {(Object.values(formData).some(value => value.trim() !== '') && formData.userType) && (
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={resetForm}
                              disabled={loading}
                            >
                              🔄 Reset Form
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="col-lg-4">
              {/* Contact Details */}
              <div className="card contact-card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                  <h4 className="card-title text-primary mb-4">
                    📍 Get in Touch
                  </h4>

                  <div className="mb-4">
                    <h6 className="fw-bold text-dark mb-2">
                      🏢 HQ Address
                    </h6>
                    <p className="text-muted mb-0">
                      123 Education Street<br />
                      Learning District<br />
                      Academic City, AC 12345
                    </p>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold text-dark mb-2">
                      📞 Phone
                    </h6>
                    <p className="text-muted mb-0">
                      Main: <a href="tel:+1234567890" className="text-decoration-none">+1 (234) 567-8900</a><br />
                      Admissions: <a href="tel:+1234567891" className="text-decoration-none">+1 (234) 567-8901</a>
                    </p>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold text-dark mb-2">
                      📧 Email
                    </h6>
                    <p className="text-muted mb-0">
                      General: <a href="mailto:info@eduplat.com" className="text-decoration-none">info@eduplat.com</a><br />
                      Support: <a href="mailto:support@eduplat.com" className="text-decoration-none">support@eduplat.com</a>
                    </p>
                  </div>

                  <div>
                    <h6 className="fw-bold text-dark mb-2">
                      🕒 Office Hours
                    </h6>
                    <p className="text-muted mb-0">
                      Monday - Friday: 8:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* Response Time Info */}
              <div className="card contact-card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                  <h4 className="card-title text-success mb-3">
                    ⏰ Response Time
                  </h4>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-success rounded-circle p-2 me-3">
                      ✓
                    </div>
                    <div>
                      <h6 className="mb-1 fw-bold">General Inquiries</h6>
                      <small className="text-muted">Within 24 hours</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-warning rounded-circle p-2 me-3">
                      ⚡
                    </div>
                    <div>
                      <h6 className="mb-1 fw-bold">Urgent Matters</h6>
                      <small className="text-muted">Within 4 hours</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="bg-info rounded-circle p-2 me-3">
                      🎧
                    </div>
                    <div>
                      <h6 className="mb-1 fw-bold">Technical Support</h6>
                      <small className="text-muted">Within 2 hours</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="card contact-card shadow-sm border-0">
                <div className="card-body p-4">
                  <h4 className="card-title text-primary mb-4">
                    ❓ Quick Help
                  </h4>

                  <div className="d-grid gap-2">
                    <button className="btn btn-outline-primary text-start">
                      📚 Course Information
                    </button>
                    <button className="btn btn-outline-primary text-start">
                      👤 Enrollment Process
                    </button>
                    <button className="btn btn-outline-primary text-start">
                      💳 Payment & Billing
                    </button>
                    <button className="btn btn-outline-primary text-start">
                      🎧 Technical Support
                    </button>
                  </div>

                  <hr className="my-4" />

                  <div className="text-center">
                    <h6 className="fw-bold mb-3">Follow Us</h6>
                    <div className="d-flex justify-content-center gap-3">
                      <button className="btn btn-primary btn-sm">
                        📘
                      </button>
                      <button className="btn btn-info btn-sm">
                        🐦
                      </button>
                      <button className="btn btn-danger btn-sm">
                        📺
                      </button>
                      <button className="btn btn-success btn-sm">
                        💬
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto">
                <h3 className="text-center mb-5 text-primary">Frequently Asked Questions</h3>

                <div className="accordion" id="faqAccordion">
                  <div className="accordion-item border-0 shadow-sm mb-3">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                        How do I enroll in a course?
                      </button>
                    </h2>
                    <div id="faq1" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                      <div className="accordion-body">
                        You can enroll in courses through our online platform. Simply browse our course catalog, select your desired course, and follow the enrollment process. Our admissions team is also available to assist you personally.
                      </div>
                    </div>
                  </div>

                  <div className="accordion-item border-0 shadow-sm mb-3">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                        What payment methods do you accept?
                      </button>
                    </h2>
                    <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                      <div className="accordion-body">
                        We accept various payment methods including credit cards, debit cards, bank transfers, and flexible installment plans. Contact our billing department for more information about payment options and financial assistance.
                      </div>
                    </div>
                  </div>

                  <div className="accordion-item border-0 shadow-sm mb-3">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                        How can I access technical support?
                      </button>
                    </h2>
                    <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                      <div className="accordion-body">
                        Our technical support team is available 24/7 through this contact form, live chat, email, or phone. You can also access our comprehensive help center and video tutorials on our website for immediate assistance.
                      </div>
                    </div>
                  </div>

                  <div className="accordion-item border-0 shadow-sm mb-3">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                        Do you offer refunds?
                      </button>
                    </h2>
                    <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                      <div className="accordion-body">
                        Yes, we offer a 30-day money-back guarantee for most courses. If you're not satisfied with your course within the first 30 days, you can request a full refund. Please contact us for more details about our refund policy.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;