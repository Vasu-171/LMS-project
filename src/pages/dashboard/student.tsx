import { useEffect, useState } from 'react';
import DashboardNavbar from '../../components/DashboardNavbar';
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
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<number>>(new Set());
  const [successMessage, setSuccessMessage] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (token) {
      fetchCourses();
      fetchEnrolledCourses();
    }
  }, [token]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/courses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users/my-courses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEnrolledCourses(data);
      const ids = data.map((course: Course) => course.id);
      setEnrolledCourseIds(new Set(ids));
    } catch (err) {
      console.error('Error fetching enrolled courses:', err);
    }
  };

  const handleEnroll = async (courseId: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMessage('Enrolled successfully!');
        setEnrolledCourseIds((prev) => new Set(prev).add(courseId));
        const enrolledCourse = courses.find((course) => course.id === courseId);
        if (enrolledCourse) {
          setEnrolledCourses((prev) => [...prev, enrolledCourse]);
        }

        setTimeout(() => setSuccessMessage(''), 2000);
      } else {
        alert(data.message || 'Enrollment failed');
      }
    } catch (err) {
      console.error('Enrollment error:', err);
    }
  };

  return (
    <div className="student-dashboard">
      <DashboardNavbar />
      <div className="content">
        <h1>Welcome to the Student Dashboard</h1>
        <h2>Available Courses</h2>

        {successMessage && <div className="success-popup">{successMessage}</div>}

        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <h3>{course.name}</h3>
              <p>{course.description}</p>
              <p><strong>Instructor:</strong> {course.teacher_name}</p>
              {enrolledCourseIds.has(course.id) ? (
                <button className="enrolled-button" disabled>Enrolled</button>
              ) : (
                <button onClick={() => handleEnroll(course.id)}>Enroll</button>
              )}
            </div>
          ))}
        </div>

        {/* Enrolled Courses Section */}
        <div className="enrolled-courses">
          <h2>Your Enrolled Courses</h2>
          {enrolledCourses.length === 0 ? (
            <p>You haven't enrolled in any courses yet.</p>
          ) : (
            <div className="courses-grid">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="course-card enrolled-highlight">
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
