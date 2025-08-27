/* eslint-disable no-unused-vars */
// ✅ Updated Courses.jsx — with API integration to fetch real course data from MongoDB

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import CourseCard from '../../components/CourseCard';

// Category icons mapping
const getCategoryIcon = (
  categoryName,
  subcategoryName = null,
  itemName = null
) => {
  // Sub-item icons (specific technologies)
  if (itemName) {
    const itemIcons = {
      // Frontend Technologies
      HTML: <i className="fab fa-html5 text-orange"></i>,
      CSS: <i className="fab fa-css3-alt text-primary"></i>,
      JavaScript: <i className="fab fa-js-square text-warning"></i>,
      "React.js": <i className="fab fa-react text-info"></i>,
      "Vue.js": <i className="fab fa-vuejs text-success"></i>,
      "Tailwind CSS": <i className="fas fa-wind text-cyan"></i>,

      // Backend Technologies
      "Node.js": <i className="fab fa-node-js text-success"></i>,
      "Express.js": <i className="fas fa-server text-secondary"></i>,
      MongoDB: <i className="fas fa-leaf text-success"></i>,
      SQL: <i className="fas fa-database text-info"></i>,
      "REST APIs": <i className="fas fa-exchange-alt text-primary"></i>,

      // Programming Languages
      C: <i className="fas fa-code text-secondary"></i>,
      "C++": <i className="fas fa-code text-primary"></i>,
      Java: <i className="fab fa-java text-danger"></i>,
      Python: <i className="fab fa-python text-warning"></i>,
      TypeScript: <i className="fas fa-code text-info"></i>,
      Go: <i className="fas fa-code text-success"></i>,

      // Full Stack
      "MERN Stack": <i className="fas fa-layer-group text-success"></i>,
      "MEAN Stack": <i className="fas fa-layer-group text-danger"></i>,
      "Django Full Stack": <i className="fab fa-python text-success"></i>,

      // Mobile Development
      Flutter: <i className="fas fa-mobile-alt text-info"></i>,
      "React Native": <i className="fab fa-react text-info"></i>,
      "Android (Kotlin)": <i className="fab fa-android text-success"></i>,

      // Data Structures & Algorithms
      "Arrays & Strings": <i className="fas fa-list text-primary"></i>,
      "Linked Lists": <i className="fas fa-link text-info"></i>,
      "Trees & Graphs": <i className="fas fa-project-diagram text-success"></i>,
      Recursion: <i className="fas fa-redo text-warning"></i>,
      "Dynamic Programming": <i className="fas fa-chart-line text-danger"></i>,

      // System Design
      "Low-Level Design": <i className="fas fa-microchip text-secondary"></i>,
      "High-Level Design": <i className="fas fa-sitemap text-primary"></i>,
      "Scalable Systems": (
        <i className="fas fa-expand-arrows-alt text-success"></i>
      ),

      // DevOps & Tools
      "Git & GitHub": <i className="fab fa-github text-dark"></i>,
      Docker: <i className="fab fa-docker text-info"></i>,
      Kubernetes: <i className="fas fa-dharmachakra text-primary"></i>,
      "CI/CD Basics": <i className="fas fa-sync-alt text-success"></i>,

      // Cybersecurity
      "Ethical Hacking (Intro)": (
        <i className="fas fa-user-secret text-dark"></i>
      ),
      "Network Security": <i className="fas fa-shield-alt text-primary"></i>,
      "OWASP Top 10": (
        <i className="fas fa-exclamation-triangle text-warning"></i>
      ),
      "Tools & Labs": <i className="fas fa-tools text-secondary"></i>,

      // Robotics
      "Arduino Projects": <i className="fas fa-microchip text-info"></i>,
      "Raspberry Pi": <i className="fab fa-raspberry-pi text-danger"></i>,
      "Python for Robotics": <i className="fas fa-robot text-warning"></i>,
      "Robot Operating System (ROS)": (
        <i className="fas fa-cogs text-secondary"></i>
      ),

      // AI & ML
      "Machine Learning Basics": <i className="fas fa-brain text-purple"></i>,
      "Deep Learning with TensorFlow": (
        <i className="fas fa-neural-network text-warning"></i>
      ),
      "Natural Language Processing": (
        <i className="fas fa-language text-info"></i>
      ),
      "AI Projects with Python": <i className="fas fa-robot text-success"></i>,
    };
    return (
      itemIcons[itemName] || <i className="fas fa-file-code text-secondary"></i>
    );
  }

  // Subcategory icons
  if (subcategoryName) {
    const subcategoryIcons = {
      Frontend: <i className="fas fa-desktop text-primary"></i>,
      Backend: <i className="fas fa-server text-success"></i>,
    };
    return (
      subcategoryIcons[subcategoryName] || (
        <i className="fas fa-folder text-warning"></i>
      )
    );
  }

  // Main category icons
  const categoryIcons = {
    All: <i className="fas fa-home text-primary"></i>,
    "Web Development": <i className="fas fa-globe text-info"></i>,
    "Full Stack Development": (
      <i className="fas fa-layer-group text-success"></i>
    ),
    "Mobile App Development": (
      <i className="fas fa-mobile-alt text-primary"></i>
    ),
    "Programming Languages": <i className="fas fa-code text-secondary"></i>,
    "Data Structures & Algorithms": (
      <i className="fas fa-project-diagram text-danger"></i>
    ),
    "System Design": <i className="fas fa-sitemap text-info"></i>,
    "DevOps & Tools": <i className="fas fa-tools text-warning"></i>,
    "Cybersecurity Basics": <i className="fas fa-shield-alt text-danger"></i>,
    "Robotics Programming": <i className="fas fa-robot text-success"></i>,
    "AI & Machine Learning": <i className="fas fa-brain text-purple"></i>,
  };

  return (
    categoryIcons[categoryName] || (
      <i className="fas fa-folder text-secondary"></i>
    )
  );
};

function Courses() {
  // State for courses and categories from API
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState("All");
  const [filter, setFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("search")?.toLowerCase() || "";

  // Fetch courses and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use environment variable instead of hardcoded localhost
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        
        // FORCE DIRECT CLOUDINARY URL - NO PROCESSING
        const getCourseThumbnail = (course) => {
          console.log('Raw thumbnailUrl from backend:', course.thumbnailUrl);
          
          if (!course.thumbnailUrl) {
            return 'https://via.placeholder.com/300x200?text=No+Image';
          }
          
          // FORCE: If it contains cloudinary.com, return it directly
          if (course.thumbnailUrl.includes('cloudinary.com')) {
            console.log('Using Cloudinary URL directly:', course.thumbnailUrl);
            return course.thumbnailUrl;
          }
          
          // If it's just a filename, construct Cloudinary URL
          if (!course.thumbnailUrl.includes('/') && !course.thumbnailUrl.includes('http')) {
            const cloudinaryUrl = `https://res.cloudinary.com/dkwbac8fy/image/upload/${course.thumbnailUrl}`;
            console.log('Constructed Cloudinary URL:', cloudinaryUrl);
            return cloudinaryUrl;
          }
          
          console.log('Using thumbnailUrl as-is:', course.thumbnailUrl);
          return course.thumbnailUrl;
        };

        // Fetch courses
        const coursesResponse = await axios.get(`${API_URL}/api/courses`);

        // Fetch categories
        const categoriesResponse = await axios.get(`${API_URL}/api/categories`);

        console.log("Fetched courses:", coursesResponse.data);
        console.log("First course FULL OBJECT:", coursesResponse.data[0]);
        console.log("Fetched categories:", categoriesResponse.data);

        // HARDCODE CORRECT CLOUDINARY URLS - BYPASS ALL PROCESSING
        const processedCourses = (coursesResponse.data || []).map(course => {
          console.log('Original course:', course.title, course.thumbnailUrl);
          
          let correctThumbnail = 'https://via.placeholder.com/300x200?text=No+Image';
          
          if (course.thumbnailUrl) {
            // FORCE: Extract just the Cloudinary part if malformed
            if (course.thumbnailUrl.includes('cloudinary.com')) {
              // If it contains the full URL, extract it
              const match = course.thumbnailUrl.match(/(https:\/\/res\.cloudinary\.com\/[^\s]+)/);
              if (match) {
                correctThumbnail = match[1];
              } else {
                correctThumbnail = course.thumbnailUrl;
              }
            } else {
              // If it's just a filename, construct full Cloudinary URL
              correctThumbnail = `https://res.cloudinary.com/dkwbac8fy/image/upload/${course.thumbnailUrl}`;
            }
          }
          
          console.log('Final thumbnail:', correctThumbnail);
          
          return {
            ...course,
            thumbnail: correctThumbnail
          };
        });
        setCourses(processedCourses);
        setCategories(categoriesResponse.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper functions to work with hierarchical categories
  const getMainCategories = () => {
    return categories.filter((cat) => cat.level === 1);
  };

  const getSubCategories = (parentCategoryId) => {
    return categories.filter((cat) => {
      if (cat.level !== 2) return false;
      const parentId = cat.parentCategory && cat.parentCategory._id
        ? cat.parentCategory._id
        : cat.parentCategory;
      return parentId === parentCategoryId;
    });
  };

  const getSubSubCategories = (parentSubcategoryId) => {
    return categories.filter((cat) => {
      if (cat.level !== 3) return false;
      const parentId = cat.parentCategory && cat.parentCategory._id
        ? cat.parentCategory._id
        : cat.parentCategory;
      return parentId === parentSubcategoryId;
    });
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Unknown";
    const category = categories.find(cat => (cat._id || cat.id) === categoryId);
    return category ? category.name : "Unknown";
  };

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.getElementById("courses-sidebar");
        const toggleBtn = document.getElementById("sidebar-toggle-btn");

        if (
          sidebar &&
          !sidebar.contains(event.target) &&
          toggleBtn &&
          !toggleBtn.contains(event.target)
        ) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, sidebarOpen]);

  const toggleCategory = (categoryName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const toggleSubcategory = (key) => {
    setExpandedSubcategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCategorySelect = (category, subcategory = "All", subSubcategory = "All") => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSelectedSubSubcategory(subSubcategory);
    if (isMobile) setSidebarOpen(false);
  };

  const handleClearSearch = () => {
    queryParams.delete("search");
    navigate({ search: queryParams.toString() });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Filter courses based on selected categories and search
  let filteredCourses = courses;

  if (selectedCategory !== "All") {
    filteredCourses = filteredCourses.filter((course) => {
      if (selectedSubcategory === "All") {
        return course.category === selectedCategory;
      } else if (selectedSubSubcategory === "All") {
        return course.category === selectedCategory && course.subcategory === selectedSubcategory;
      } else {
        return (
          course.category === selectedCategory &&
          course.subcategory === selectedSubcategory &&
          course.sub_subcategory === selectedSubSubcategory
        );
      }
    });
  }

  if (searchQuery) {
    filteredCourses = filteredCourses.filter((course) =>
      course.title.toLowerCase().includes(searchQuery) ||
      course.description.toLowerCase().includes(searchQuery) ||
      course.instructor.toLowerCase().includes(searchQuery)
    );
  }

  filteredCourses = filteredCourses.filter((course) => {
    if (filter === "Free") return course.price === 0;
    if (filter === "Paid") return course.price > 0;
    if (filter === "Published") return course.isPublished;
    if (filter === "Draft") return !course.isPublished;
    return true;
  });

  if (sortOrder === "asc") {
    filteredCourses.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOrder === "desc") {
    filteredCourses.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortOrder === "price-low") {
    filteredCourses.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "price-high") {
    filteredCourses.sort((a, b) => b.price - a.price);
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="mt-3 text-muted">Loading courses...</h4>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 text-center py-5">
            <div className="mb-4">
              <i className="fas fa-exclamation-triangle fa-4x text-danger opacity-50"></i>
            </div>
            <h4 className="text-danger mb-3">Error Loading Courses</h4>
            <p className="text-muted mb-4">{error}</p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-refresh me-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      {/* Add Font Awesome CSS and Custom Styles */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <style>{`
        .text-orange { color: #ff6b35; }
        .text-cyan { color: #17a2b8; }
        .text-purple { color: #6f42c1; }
        
        /* Sidebar Styles */
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1040;
        }
        
        .sidebar-mobile {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 300px;
          z-index: 1050;
          transform: translateX(-100%);
          transition: transform 0.3s ease-in-out;
          overflow-y: auto;
        }
        
        .sidebar-mobile.show {
          transform: translateX(0);
        }
        
        .sidebar-desktop {
          position: sticky;
          top: 10px;
          height: calc(100vh - 40px);
          overflow-y: auto;
        }
        
        /* Smooth transitions */
        .list-group-item {
          transition: all 0.3s ease;
        }
        
        .list-group-item:hover {
          background-color:rgb(37, 37, 37);
        }
        
        /* Mobile responsive adjustments */
@media (max-width: 576px) {
          .sidebar-mobile {
            width: 280px;
          }
          
          /* Mobile card sizing - 4 mini cards per row */
          .mobile-cards .col {
            flex: 0 0 auto;
            width: 50% !important;
            height: 300px !important;
            padding: 0.5rem !important;
          }
          
          .mobile-cards .card {
            font-size: 0.7rem;
          }
          
          .mobile-cards .card-img-top {
            height: 90px !important;
            object-fit: cover;
          }
          
          .mobile-cards .card-title {
            font-size: 0.5rem !important;
            line-height: 1.2;
            height: 2.2rem;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          
          .mobile-cards .card-text {
            font-size: 0.4rem !important;
            line-height: 1.1;
            height: 1.9rem;
            margin-top:-17px;
            margin-bottom: -2px;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          
          .mobile-cards .btn {
            font-size: 0.6rem !important;
            padding: 0.2rem 0.4rem !important;
          }
          
          .mobile-cards .badge {
            font-size: 0.5rem !important;
          }
        }
          @media (max-width: 400px) {
  #courses-sidebar {
    padding: 0.7rem !important;
  }
  .list-group-item {
    font-size: 0.8rem;
    padding: 0.5rem;
  }
}


      `}</style>

      <div className="container-fluid">
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <div className="row">
          {/* Enhanced Sidebar - Updated for API categories */}
          <div className={`col-lg-3 ${isMobile ? "" : "col-md-4"}`}>
            <div
              id="courses-sidebar"
              className={`bg-white shadow rounded ${isMobile
                ? `sidebar-mobile ${sidebarOpen ? "show" : ""}`
                : `sidebar-desktop ${sidebarOpen ? "" : "d-none"}`
                }`}
              style={{
                minHeight: isMobile ? "100vh" : "80vh",
                ...(isMobile ? {} : { top: "20px" }),
              }}
            >
              <div className="p-3">
                {/* Sidebar Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0 fw-bold">
                    <i className="fas fa-filter me-2 text-primary"></i>
                    Categories
                  </h5>
                  {isMobile && (
                    <button
                      className="btn btn-sm btn-light"
                      onClick={() => setSidebarOpen(false)}
                      aria-label="Close sidebar"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>

                {/* Categories List - Updated for API data */}
                <div className="list-group list-group-flush">
                  {/* "All" Category */}
                  <div
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 border-0 rounded ${selectedCategory === "All"
                      ? "active text-white"
                      : "text-dark"
                      }`}
                    style={{ cursor: "pointer", fontSize: "0.9rem" }}
                    onClick={() => handleCategorySelect("All")}
                  >
                    <span className="d-flex align-items-center">
                      {getCategoryIcon("All")}
                      <span className="ms-2 fw-medium">All Courses</span>
                    </span>
                  </div>

                  {/* API-based Main Categories */}
                  {getMainCategories().map((category) => {
                    const subcategories = getSubCategories(category._id || category.id);

                    return (
                      <div key={category._id || category.id} className="mb-1">
                        {/* Main Category */}
                        <div
                          className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 border-0 rounded ${selectedCategory === (category._id || category.id) &&
                            selectedSubcategory === "All"
                            ? "active text-white"
                            : "text-dark"
                            }`}
                          style={{ cursor: "pointer", fontSize: "0.9rem" }}
                          onClick={() => {
                            handleCategorySelect(category._id || category.id);
                            if (subcategories.length > 0) {
                              toggleCategory(category._id || category.id);
                            }
                          }}
                        >
                          <span className="d-flex align-items-center">
                            {getCategoryIcon(category.name)}
                            <span className="ms-2 fw-medium">
                              {category.name}
                            </span>
                          </span>
                          {subcategories.length > 0 && (
                            <span
                              className={`badge ${selectedCategory === (category._id || category.id) &&
                                selectedSubcategory === "All"
                                ? "bg-light text-dark"
                                : "bg-secondary"
                                }`}
                            >
                              <i
                                className={`fas ${expandedCategories[category._id || category.id]
                                  ? "fa-minus"
                                  : "fa-plus"
                                  }`}
                              ></i>
                            </span>
                          )}
                        </div>

                        {/* Subcategories */}
                        {subcategories.length > 0 &&
                          expandedCategories[category._id || category.id] && (
                            <div className="ms-3 mt-1">
                              {subcategories.map((subcategory) => {
                                const subSubcategories = getSubSubCategories(subcategory._id || subcategory.id);
                                const subcategoryKey = `${category._id || category.id}-${subcategory._id || subcategory.id}`;

                                return (
                                  <div key={subcategory._id || subcategory.id} className="mb-2">
                                    {/* Subcategory Header */}
                                    <div
                                      className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center p-2 border-0 rounded ${selectedCategory === (category._id || category.id) &&
                                        selectedSubcategory === (subcategory._id || subcategory.id)
                                        ? "active text-white"
                                        : "bg-light text-dark"
                                        }`}
                                      style={{
                                        cursor: "pointer",
                                        fontSize: "0.85rem",
                                      }}
                                      onClick={() => {
                                        handleCategorySelect(
                                          category._id || category.id,
                                          subcategory._id || subcategory.id
                                        );
                                        if (subSubcategories.length > 0) {
                                          toggleSubcategory(subcategoryKey);
                                        }
                                      }}
                                    >
                                      <span className="d-flex align-items-center">
                                        {getCategoryIcon(
                                          category.name,
                                          subcategory.name
                                        )}
                                        <span className="ms-2">
                                          {subcategory.name}
                                        </span>
                                      </span>
                                      {subSubcategories.length > 0 && (
                                        <span
                                          className={`badge ${selectedCategory === (category._id || category.id) &&
                                            selectedSubcategory === (subcategory._id || subcategory.id)
                                            ? "bg-light text-dark"
                                            : "bg-secondary"
                                            }`}
                                        >
                                          <i
                                            className={`fas ${expandedSubcategories[subcategoryKey]
                                              ? "fa-minus"
                                              : "fa-plus"
                                              }`}
                                          ></i>
                                        </span>
                                      )}
                                    </div>

                                    {/* Sub-subcategories */}
                                    {subSubcategories.length > 0 &&
                                      expandedSubcategories[subcategoryKey] && (
                                        <div className="ms-3 mt-1">
                                          {subSubcategories.map((subSubcategory) => (
                                            <div
                                              key={subSubcategory._id || subSubcategory.id}
                                              className={`list-group-item list-group-item-action p-2 border-0 rounded mb-1 ${selectedCategory === (category._id || category.id) &&
                                                selectedSubcategory === (subcategory._id || subcategory.id) &&
                                                selectedSubSubcategory === (subSubcategory._id || subSubcategory.id)
                                                ? "active text-white"
                                                : "text-dark"
                                                }`}
                                              style={{
                                                cursor: "pointer",
                                                fontSize: "0.8rem",
                                                borderLeft: "3px solid #28a745",
                                              }}
                                              onClick={() =>
                                                handleCategorySelect(
                                                  category._id || category.id,
                                                  subcategory._id || subcategory.id,
                                                  subSubcategory._id || subSubcategory.id
                                                )
                                              }
                                            >
                                              <span className="d-flex align-items-center">
                                                {getCategoryIcon(
                                                  category.name,
                                                  subcategory.name,
                                                  subSubcategory.name
                                                )}
                                                <span className="ms-2">
                                                  {subSubcategory.name}
                                                </span>
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={sidebarOpen ? "col-lg-9 col-md-8" : "col-12"}>
            <div className="d-flex justify-content-between align-items-center p-3">
              <div className="d-flex align-items-center">
                <button
                  id="sidebar-toggle-btn"
                  className="btn btn-outline-primary me-3"
                  onClick={toggleSidebar}
                >
                  <i
                    className={`fas ${sidebarOpen ? "fa-chevron-left" : "fa-bars"
                      }`}
                  ></i>
                </button>
                <h2 className="fw-bold mb-0">
                  <i className="fas fa-graduation-cap me-2 text-primary"></i>
                  Courses
                </h2>
              </div>
              <div
                className="d-flex gap-3 flex-wrap overflow"
                style={{ maxWidth: "30%", marginTop: "0.8rem" }}
              >
                <select
                  className="form-select form-select-sm"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="default">Sort By</option>
                  <option value="asc">A-Z</option>
                  <option value="desc">Z-A</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <select
                  className="form-select form-select-sm"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="All">Filter</option>
                  <option value="Free">Free</option>
                  <option value="Paid">Paid</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
                {searchQuery && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={handleClearSearch}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>

            {/* Breadcrumb - Updated for API categories */}
            {selectedCategory !== "All" && (
              <nav aria-label="breadcrumb" className="px-3">
                <ol className="breadcrumb mb-0 bg-white rounded px-2 py-1 mb-3">
                  <li className="breadcrumb-item">
                    <button
                      className="btn btn-link p-0 text-decoration-none small"
                      onClick={() => handleCategorySelect("All")}
                    >
                      <i className="fas fa-home me-1"></i>All
                    </button>
                  </li>
                  <li className="breadcrumb-item">
                    <button
                      className="btn btn-link p-0 text-decoration-none small"
                      onClick={() => handleCategorySelect(selectedCategory)}
                    >
                      {getCategoryName(selectedCategory)}
                    </button>
                  </li>
                  {selectedSubcategory !== "All" && (
                    <li className="breadcrumb-item">
                      <button
                        className="btn btn-link p-0 text-decoration-none small"
                        onClick={() => handleCategorySelect(selectedCategory, selectedSubcategory)}
                      >
                        {getCategoryName(selectedSubcategory)}
                      </button>
                    </li>
                  )}
                  {selectedSubSubcategory !== "All" && (
                    <li
                      className="breadcrumb-item active small"
                      aria-current="page"
                    >
                      {getCategoryName(selectedSubSubcategory)}
                    </li>
                  )}
                </ol>
              </nav>
            )}

            {/* Course Results Info */}
            <div className="px-3 mb-3">
              <span className="text-muted fw-medium">
                <i className="fas fa-search me-1"></i>
                {filteredCourses.length} course
                {filteredCourses.length !== 1 ? "s" : ""} found
              </span>
              {selectedCategory !== "All" && (
                <span className="badge bg-primary ms-2">
                  <i className="fas fa-tag me-1"></i>
                  {selectedSubSubcategory !== "All"
                    ? getCategoryName(selectedSubSubcategory)
                    : selectedSubcategory !== "All"
                      ? getCategoryName(selectedSubcategory)
                      : getCategoryName(selectedCategory)}
                </span>
              )}
            </div>

            <div className="row px-3">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <div
                    key={course._id || course.id}
                    className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
                  >
                    <CourseCard course={course} />
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <div className="mb-4">
                    <i className="fas fa-search fa-4x text-muted opacity-50"></i>
                  </div>
                  <h4 className="text-muted mb-3">No courses found</h4>
                  <p className="text-muted mb-4">
                    We couldn't find any courses matching your current filters.
                    <br />
                    Try adjusting your search criteria or browse other
                    categories.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedSubcategory("All");
                      setSelectedSubSubcategory("All");
                      setFilter("All");
                      setSortOrder("default");
                    }}
                  >
                    <i className="fas fa-refresh me-2"></i>
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Courses;