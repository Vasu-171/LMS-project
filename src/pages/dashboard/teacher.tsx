import { useEffect, useState } from 'react';
import DashboardNavbar from '../../components/DashboardNavbar';
import '../../styles/teacherDashboard.css';

type User = {
  id: number;
  name: string;
  email: string;
  role: 'teacher' | 'student' | 'admin';
};

type Member = {
  id: number;
  name: string;
  email: string;
};

type Course = {
  id: number;
  name: string;
  description: string;
  teacher_name: string;
};

type EnrolledStudent = {
  id: number;
  name: string;
  email: string;
};

const TeacherDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentForm, setStudentForm] = useState({ name: '', email: '', course_id: '' });
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

  // Fetch teacher's courses
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

  // Fetch students enrolled in teacher's courses
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

  // Add student to a course
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const courseId = studentForm.course_id;

    // Ensure a valid course ID is selected
    if (!courseId) {
      alert("Please select a valid course");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ studentEmail: studentForm.email }), // Send the student's email in the body
      });

      const result = await res.json();
      if (res.ok) {
        alert(result.message || 'Student added successfully');
        setStudentForm({ name: '', email: '', course_id: '' });
        fetchStudents(); // Fetch students after adding the new one
      } else {
        alert(result.message || 'Error adding student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Server error while adding student');
    }
  };

  // Remove student from a course
  const handleRemoveStudent = async (studentId: number) => {
    if (!confirm(`Are you sure you want to remove this student?`)) return;

    try {
      const res = await fetch('http://localhost:5000/api/courses/enroll', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ student_id: studentId }),
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message || 'Student removed successfully');
        fetchStudents();
      } else {
        alert(result.error || 'Error removing student');
      }
    } catch (error) {
      console.error('Error removing student:', error);
      alert('Server error while removing student');
    }
  };

  if (!user) return null;

  return (
    <div className="teacher-dashboard">
      <DashboardNavbar />
      <div className="content">
        <h1>Welcome {user.name}</h1>
        <p>Manage your courses and students</p>

        {/* Courses Section */}
        <div className="box">
          <h2>Your Courses</h2>
          <ul>
            {courses.map((course) => (
              <li key={course.id}> {/* Added unique key prop */}
                <strong>{course.name}</strong> - {course.description}
              </li>
            ))}
          </ul>
        </div>

        {/* Students Section */}
        <div className="box">
          <h2>Manage Students</h2>
          <form onSubmit={handleAddStudent} className="add-form">
            <input
              type="text"
              placeholder="Name"
              value={studentForm.name}
              onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
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
                <option key={course.id} value={course.id}> {/* Added unique key prop */}
                  {course.name}
                </option>
              ))}
            </select>
            <button type="submit">Add Student</button>
          </form>

          <ul>
            {students.map((student) => (
              <li key={student.id}> {/* Added unique key prop */}
                {student.name} ({student.email}){' '}
                <button onClick={() => handleRemoveStudent(student.id)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
