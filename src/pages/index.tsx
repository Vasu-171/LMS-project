import React from 'react';
import '../styles/home.css';
import Link from 'next/link';
import Navbar from '../components/Navbar';

const HomePage = () => {
  return (
    <>
      <Navbar />
      <div className="hero">
        <h1>Welcome to the LMS Portal</h1>
        <p>
          A platform for students, teachers, and admins to manage learning effectively.
        </p>
        <div className="btn-container">
          <Link href="/login">Login</Link>
          <Link href="/register">Sign Up</Link>
        </div>
      </div>
    </>
  );
};

export default HomePage;


