// components/Navbar.tsx
import Link from 'next/link';
import React from 'react';
import '../styles/navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link href="/">
          <span className="navbar-logo">LMS</span>
        </Link>
      </div>
      <div className="navbar-right">
        <Link href="/login">Login</Link>
        <Link href="/register">Signup</Link>
      </div>
    </nav>
  );
};

export default Navbar;


