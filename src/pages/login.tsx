import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar'; 
import '../styles/login.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      const role = data.user.role;
      if (role === 'student') router.push('/dashboard/student');
      else if (role === 'teacher') router.push('/dashboard/teacher');
      else if (role === 'admin') router.push('/dashboard/admin');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <Navbar /> {/*  Just added */}
      <div className="login-wrapper">
        <div className="login-container">
          <h2>Login to Your Account</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Your Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {error && <p className="error-text">{error}</p>}

            <button type="submit">Login</button>

            <p className="signup-redirect">
              Don’t have an account? <a href="/register">Sign Up</a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
