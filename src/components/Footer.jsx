/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";

function Footer() {
  return (
    <footer className="bg-dark text-white pt-4 pb-2 mt-5">
      <div className="container">
        <div className="row">

          {/* Website Info */}
          <div className="col-md-3">
            <h5>Edu</h5>
            <p>Empowering learners everywhere.</p>
          </div>

          {/* Categories */}
          <div className="col-md-3">
            <h6>Categories</h6>
            <ul className="list-unstyled">
              <li>Web Development</li>
              <li>Design</li>
              <li>Marketing</li>
              <li>Business</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-md-3">
            <h6>Contact</h6>
            <p>Email: support@edu.com</p>
            <p>Phone: +91 12345 67890</p>
            <p>HQ: 1600 Amphitheatre Parkway in, Mountain View, California </p>
          </div>

          {/* Social Links */}
          <div className="col-md-3">
            <h6>Follow Us</h6>
            <a href="#" className="text-white me-2">
              <i className="bi bi-facebook"></i>
            </a>
            <a href="#" className="text-white me-2">
              <i className="bi bi-twitter"></i>
            </a>
            <a href="#" className="text-white me-2">
              <i className="bi bi-instagram"></i>
            </a>
          </div>

        </div>
        <hr className="bg-light" />
        <p className="text-center mb-0">&copy; 2025 Edu. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
