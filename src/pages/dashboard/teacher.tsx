import { useEffect, useState } from 'react';
import DashboardNavbar from '../../components/DashboardNavbar';
import '../../styles/teacherDashboard.css';

type User = {
  id: number;
  name: string;
  email: string;
  role: 'teacher' | 'student' | 'admin';
};

type Course = {
  id: number;
  name: string;
  description: string;
  teacher_name?: string;
};

type EnrolledStudent = {
  name: string;
  email: string;
  course_name: string;
};

const TeacherDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentForm, setStudentForm] = useState({ email: '', course_id: '' });
  const [courseForm, setCourseForm] = useState({ name: '', description: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    try {
      const parsedUser = userStr ? JSON.parse(userStr) : null;
      if (!parsedUser || parsedUser.role !== 'teacher') {
        window.location.href = '/login';
      } else {
        setUser(parsedUser);
      }
    } catch {
      localStorage.clear();
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchCourses();
      fetchStudents();
    }
  }, [token]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/courses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/courses/enrollments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseForm),
      });
      const result = await res.json();
      if (res.ok) {
        alert('Course added successfully!');
        setCourseForm({ name: '', description: '' });
        fetchCourses();
      } else {
        alert(result.message || 'Error creating course');
      }
    } catch (err) {
      console.error('Add course error:', err);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${studentForm.course_id}/enroll-student`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentEmail: studentForm.email }),
      });

      const result = await res.json();
      if (res.ok) {
        alert('Student enrolled successfully!');
        setStudentForm({ email: '', course_id: '' });
        fetchStudents();
      } else {
        alert(result.message || 'Failed to enroll student');
      }
    } catch (err) {
      console.error('Enroll error:', err);
    }
  };

  
  const handleRemoveStudent = async (studentEmail: string, courseName: string) => {
    if (!confirm(`Are you sure you want to remove ${studentEmail}?`)) return;
  
    try {
      //  Find the course ID from the course name
      const course = courses.find((c) => c.name === courseName);
      if (!course) return alert('Course not found');
  
      //  Get the student ID by email
      const studentRes = await fetch(`http://localhost:5000/api/users/get-student-id?email=${studentEmail}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const studentData = await studentRes.json();
      const studentId = studentData?.id;
  
      if (!studentId) return alert('Student not found');
  
      //  Make the DELETE call using courseId and studentId
      const res = await fetch(
        `http://localhost:5000/api/courses/${course.id}/remove-student/${studentId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      const result = await res.json();
      if (res.ok) {
        alert('Student removed successfully');
        fetchStudents();
      } else {
        alert(result.message || 'Error removing student');
      }
    } catch (err) {
      console.error('Remove error:', err);
    }
  };
  


  if (!user) return null;

  return (
    <div className="teacher-dashboard">
      <DashboardNavbar />
      <div className="content">
        <h1>Welcome {user.name}</h1>
        <p>Manage your courses and students</p>

        {/* Create Course */}
        <div className="box">
          <h2>Create New Course</h2>
          <form onSubmit={handleAddCourse} className="add-form">
            <input
              type="text"
              placeholder="Course Name"
              value={courseForm.name}
              onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              required
            />
            <button type="submit">Add Course</button>
          </form>
        </div>

        {/* Your Courses */}
        <div className="box">
          <h2>Your Courses</h2>
          <ul>
            {courses.map((course) => (
              <li key={course.id}>
                <strong>{course.name}</strong> - {course.description}
              </li>
            ))}
          </ul>
        </div>

        {/* Enroll Student */}
        <div className="box">
          <h2>Enroll Student</h2>
          <form onSubmit={handleAddStudent} className="add-form">
            <input
              type="email"
              placeholder="Student Email"
              value={studentForm.email}
              onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
              required
            />
            <select
              value={studentForm.course_id}
              onChange={(e) => setStudentForm({ ...studentForm, course_id: e.target.value })}
              required
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            <button type="submit">Enroll Student</button>
          </form>
        </div>

        {/* Enrolled Students */}
        <div className="box">
          <h2>Enrolled Students</h2>
          <ul>
            {students.length === 0 ? (
              <p>No students enrolled yet.</p>
            ) : (
              students.map((s, idx) => (
                <li key={idx}>
                  {s.name} ({s.email}) - <em>{s.course_name}</em>{' '}
                  <button onClick={() => handleRemoveStudent(s.email, s.course_name)}>Remove</button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
