import { useEffect, useState } from 'react';
import DashboardNavbar from '../../components/DashboardNavbar'; // Correct import for your Navbar
import '../../styles/studentDashboard.css';

type Course = {
  id: number;
  name: string;
  description: string;
  teacher_name: string;
};

const StudentDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<number>>(new Set());
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (token) {
      fetchCourses();
    }
  }, [token]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/courses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleEnroll = (course: Course) => {
    if (!enrolledCourseIds.has(course.id)) {
      setEnrolledCourses([...enrolledCourses, course]);
      setEnrolledCourseIds(new Set([...enrolledCourseIds, course.id]));
      setShowSuccessMessage(true);

      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 2000);
    }
  };

  return (
    <div className="student-dashboard">
      <DashboardNavbar />
      <div className="content">
        <h1>Welcome to the Student Dashboard</h1>
        <h2>Browse and Enroll in Courses</h2>

        {/* Courses Grid Section */}
        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <h3>{course.name}</h3>
              <p>{course.description}</p>
              <p><strong>Instructor:</strong> {course.teacher_name}</p>
              <button className="enroll-button" onClick={() => handleEnroll(course)}>
                Enroll
              </button>
            </div>
          ))}
        </div>

        {/* Success Message Popup */}
        {showSuccessMessage && (
          <div className="success-popup">
            <p>Enrolled successfully!</p>
          </div>
        )}

        {/* Enrolled Courses */}
        <div className="enrolled-courses">
          <h2>Enrolled Courses</h2>
          {enrolledCourses.length === 0 ? (
            <p>You haven't enrolled in any courses yet.</p>
          ) : (
            <div className="enrolled-courses-list">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="enrolled-course-card">
                  <h3>{course.name}</h3>
                  <p>{course.description}</p>
                  <p><strong>Instructor:</strong> {course.teacher_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
