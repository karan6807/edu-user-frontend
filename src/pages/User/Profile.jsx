/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Edit3,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  X,
  AlertCircle,
  GraduationCap,
} from "lucide-react";

export default function Profile() {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState({
    name: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    location: "",
    joinDate: "",
    bio: "",
    profileImage: null,
    dateOfBirth: "",
    major: "Computer Science",
  });

  const [editData, setEditData] = useState({ ...userInfo });

  // Fetch user profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      // ✅ UPDATED: Changed API endpoint to use user-profile routes
      const response = await axios.get(`${API_URL}/api/user-profile/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // DEBUG: Log the entire response to see what we're getting
      console.log('Full API Response:', response.data);
      console.log('User Data:', response.data.user);

      if (response.data.user) {
        const userData = response.data.user;

        // DEBUG: Log specific fields to see what's available
        console.log('Phone:', userData.phone);
        console.log('Location:', userData.location);
        console.log('Bio:', userData.bio);
        console.log('DateOfBirth:', userData.dateOfBirth);
        console.log('Major:', userData.major);

        // Split username into first and last name if needed
        const nameParts = userData.username.split(' ');
        const firstName = nameParts[0] || userData.username;
        const lastName = nameParts.slice(1).join(' ') || '';

        const completeProfileData = {
          name: userData.username,
          firstName: firstName,
          lastName: lastName,
          username: userData.username,
          email: userData.email,
          // Now these fields should be properly populated from UserProfile model
          phone: userData.phone || '',
          location: userData.location || '',
          bio: userData.bio || '',
          dateOfBirth: userData.dateOfBirth || '',
          major: userData.major || 'Computer Science',
          profileImage: userData.profileImage || null,
          joinDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'Unknown',
        };

        console.log('Complete Profile Data:', completeProfileData);

        setUserInfo(completeProfileData);
        setEditData(completeProfileData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.response?.data?.message || 'Failed to fetch profile data');
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...userInfo });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...userInfo });
    setError('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setSaving(false);
        return;
      }

      // Prepare data for API call
      const updateData = {
        username: editData.name,
        phone: editData.phone,
        location: editData.location,
        bio: editData.bio,
        dateOfBirth: editData.dateOfBirth,
        major: editData.major,
        profileImage: editData.profileImage,
      };

      // ✅ UPDATED: Changed API endpoint to use user-profile routes
      const response = await axios.put(`${API_URL}/api/user-profile/profile`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.user) {
        // Update local state with response data
        const updatedUserData = response.data.user;

        // Split username into first and last name if needed
        const nameParts = updatedUserData.username.split(' ');
        const firstName = nameParts[0] || updatedUserData.username;
        const lastName = nameParts.slice(1).join(' ') || '';

        const updatedProfileData = {
          ...userInfo,
          name: updatedUserData.username,
          firstName: firstName,
          lastName: lastName,
          username: updatedUserData.username,
          phone: updatedUserData.phone || '',
          location: updatedUserData.location || '',
          bio: updatedUserData.bio || '',
          dateOfBirth: updatedUserData.dateOfBirth || '',
          major: updatedUserData.major || 'Computer Science',
          profileImage: updatedUserData.profileImage || null,
        };

        setUserInfo(updatedProfileData);
        setIsEditing(false);
        setError('');

        // Dispatch custom event to notify navbar about profile update
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      }

      setSaving(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error.response?.data?.message || 'Failed to save profile changes');
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value,
      ...(field === "firstName" || field === "lastName"
        ? {
          name:
            field === "firstName"
              ? `${value} ${prev.lastName}`
              : `${prev.firstName} ${value}`,
          username:
            field === "firstName"
              ? `${value} ${prev.lastName}`
              : `${prev.firstName} ${value}`,
        }
        : {}),
    }));
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditData(prev => ({
          ...prev,
          profileImage: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !userInfo.email) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="container-sm">
          <div className="row justify-content-center">
            <div className="col-12 col-md-6">
              <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                <AlertCircle className="me-2" size={20} />
                <div>
                  <strong>Error:</strong> {error}
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={fetchUserProfile}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .profile-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
          }
          
          .profile-card {
            border-radius: 15px;
            border: none;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .profile-avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          }
          
          .camera-btn {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            position: absolute;
            bottom: 0;
            right: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          .form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          }
          
          .form-select:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          }
          
          .card-header-custom {
            background-color: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            border-radius: 15px 15px 0 0;
          }
          
          .btn-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
          }
          
          .btn-gradient:hover {
            background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
            color: white;
          }
        `}
      </style>

      <div className="container-fluid bg-light min-vh-100 py-4">
        <div className="container" style={{ maxWidth: '1200px' }}>
          {/* Error Alert */}
          {error && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="alert alert-warning alert-dismissible fade show" role="alert">
                  <AlertCircle className="me-2" size={16} />
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError('')}
                    aria-label="Close"
                  ></button>
                </div>
              </div>
            </div>
          )}

          {/* Profile Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card profile-card profile-header">
                <div className="card-body p-4 text-white">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <div className="position-relative">
                        <div className="profile-avatar bg-light d-flex align-items-center justify-content-center overflow-hidden">
                          {(isEditing ? editData.profileImage : userInfo.profileImage) ? (
                            <img
                              src={isEditing ? editData.profileImage : userInfo.profileImage}
                              alt="Profile"
                              className="w-100 h-100"
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <User size={50} className="text-muted" />
                          )}
                        </div>
                        {isEditing && (
                          <label className="camera-btn btn btn-light">
                            <Camera size={16} className="text-muted" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfilePictureChange}
                              className="d-none"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    <div className="col">
                      <h1 className="h2 mb-1 fw-bold">{userInfo.name}</h1>
                      <p className="mb-0 opacity-75">{userInfo.major} Student</p>
                    </div>
                    <div className="col-auto">
                      {!isEditing ? (
                        <button
                          onClick={handleEdit}
                          className="btn btn-light d-flex align-items-center gap-2"
                        >
                          <Edit3 size={16} />
                          <span>Edit Profile</span>
                        </button>
                      ) : (
                        <div className="d-flex gap-2">
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn btn-success d-flex align-items-center gap-2"
                          >
                            {saving ? (
                              <>
                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <Save size={16} />
                                <span>Save</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="btn btn-secondary d-flex align-items-center gap-2"
                          >
                            <X size={16} />
                            <span>Cancel</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="row g-4">
            {/* Personal Information */}
            <div className="col-lg-6">
              <div className="card profile-card h-100">
                <div className="card-header card-header-custom">
                  <h4 className="mb-0 fw-semibold">Personal Information</h4>
                </div>
                <div className="card-body p-4">
                  {/* Full Name */}
                  <div className="mb-3">
                    <label className="form-label fw-medium text-muted">Full Name</label>
                    {isEditing ? (
                      <div className="row g-2">
                        <div className="col-6">
                          <input
                            type="text"
                            value={editData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="First Name"
                            className="form-control"
                          />
                        </div>
                        <div className="col-6">
                          <input
                            type="text"
                            value={editData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder="Last Name"
                            className="form-control"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="mb-0 fw-medium">{userInfo.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label fw-medium text-muted">
                      <Mail size={16} className="me-1" />
                      Email Address
                    </label>
                    <p className="mb-0 fw-medium">{userInfo.email}</p>
                  </div>

                  {/* Phone */}
                  <div className="mb-3">
                    <label className="form-label fw-medium text-muted">
                      <Phone size={16} className="me-1" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter phone number"
                        className="form-control"
                      />
                    ) : (
                      <p className="mb-0 fw-medium">{userInfo.phone || 'Not provided'}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="mb-3">
                    <label className="form-label fw-medium text-muted">
                      <MapPin size={16} className="me-1" />
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Enter your location"
                        className="form-control"
                      />
                    ) : (
                      <p className="mb-0 fw-medium">{userInfo.location || 'Not provided'}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="mb-0">
                    <label className="form-label fw-medium text-muted">
                      <Calendar size={16} className="me-1" />
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="form-control"
                      />
                    ) : (
                      <p className="mb-0 fw-medium">
                        {userInfo.dateOfBirth ? formatDate(userInfo.dateOfBirth) : 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-lg-6">
              <div className="row g-4">
                {/* Academic Information */}
                <div className="col-12">
                  <div className="card profile-card">
                    <div className="card-header card-header-custom">
                      <h4 className="mb-0 fw-semibold">Academic Information</h4>
                    </div>
                    <div className="card-body p-4">
                      {/* Major */}
                      <div className="mb-0">
                        <label className="form-label fw-medium text-muted">
                          <GraduationCap size={16} className="me-1" />
                          Major
                        </label>
                        {isEditing ? (
                          <select
                            className="form-select"
                            value={editData.major}
                            onChange={(e) => handleInputChange('major', e.target.value)}
                          >
                            <option value="Computer Science">Computer Science</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Civil">Civil</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Other">Other</option>
                          </select>
                        ) : (
                          <p className="mb-0 fw-medium">{userInfo.major}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* About Me */}
                <div className="col-12">
                  <div className="card profile-card">
                    <div className="card-header card-header-custom">
                      <h4 className="mb-0 fw-semibold">About Me</h4>
                    </div>
                    <div className="card-body p-4">
                      {isEditing ? (
                        <textarea
                          value={editData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          placeholder="Tell us about yourself..."
                          rows="4"
                          className="form-control"
                          style={{ resize: 'none' }}
                        />
                      ) : (
                        <p className="mb-0">{userInfo.bio || 'No bio available. Click Edit Profile to add one.'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="col-12">
                  <div className="card profile-card">
                    <div className="card-header card-header-custom">
                      <h4 className="mb-0 fw-semibold">Account Details</h4>
                    </div>
                    <div className="card-body p-4">
                      <div className="mb-0">
                        <label className="form-label fw-medium text-muted">
                          <Calendar size={16} className="me-1" />
                          Member Since
                        </label>
                        <p className="mb-0 fw-medium">{userInfo.joinDate}</p>
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
}