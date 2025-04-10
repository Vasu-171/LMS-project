import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import styles from '../styles/dashboardNavbar.module.css'; 

const DashboardNavbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  // Debugging: Check if user data is available
  console.log("User Data:", JSON.stringify(user, null, 2));


  if (!user) return null; // Prevent rendering if no user is available

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <nav className={styles.dashboardNavbar}>
      <div className={styles.logo} onClick={() => router.push('/')}>
        LMS
      </div>
      <div className={styles.userDropdown}>
        {/*  Display  user name , email, role  */}
        <div className={styles.userInfo} onClick={toggleDropdown}>
          {user.name}
        </div>
        {dropdownOpen && (
          <div className={styles.dropdownMenu}>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <button onClick={logout} className={styles.logoutBtn}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default DashboardNavbar;
