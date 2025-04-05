import { useEffect, useState } from 'react';
import DashboardNavbar from '../../components/DashboardNavbar';
import '../../styles/adminDashboard.css';

type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
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

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [teachers, setTeachers] = useState<Member[]>([]);
  const [students, setStudents] = useState<Member[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '' });
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '' });
  const [courseForm, setCourseForm] = useState({ name: '', description: '', teacher_id: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    try {
      const parsedUser = userStr ? JSON.parse(userStr) : null;
      if (!parsedUser || parsedUser.role !== 'admin') {
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
      fetchTeachers();
      fetchStudents();
      fetchCourses();
    }
  }, [token]);

  const fetchTeachers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users/teachers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

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

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/users/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(teacherForm),
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message || 'Teacher added successfully');
        setTeacherForm({ name: '', email: '', password: '' });
        fetchTeachers();
      } else {
        alert(result.error || 'Error adding teacher');
      }
    } catch (error) {
      console.error('Error adding teacher:', error);
      alert('Server error while adding teacher');
    }
  };

  const handleDeleteTeacher = async (email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;

    try {
      const res = await fetch('http://localhost:5000/api/users/teachers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message || 'Teacher deleted successfully');
        fetchTeachers();
      } else {
        alert(result.error || 'Failed to delete teacher');
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert('Server error while deleting teacher');
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/users/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(studentForm),
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message || 'Student added successfully');
        setStudentForm({ name: '', email: '', password: '' });
        fetchStudents();
      } else {
        alert(result.error || 'Error adding student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Server error while adding student');
    }
  };

  const handleDeleteStudent = async (email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;

    try {
      const res = await fetch('http://localhost:5000/api/users/students', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message || 'Student deleted successfully');
        fetchStudents();
      } else {
        alert(result.error || 'Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Server error while deleting student');
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/courses/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseForm),
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message || 'Course added successfully');
        setCourseForm({ name: '', description: '', teacher_id: '' });
        fetchCourses();
      } else {
        alert(result.error || 'Error adding course');
      }
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Server error while adding course');
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm(`Are you sure you want to delete this course?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/courses/admin/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message || 'Course deleted successfully');
        fetchCourses();
      } else {
        alert(result.error || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Server error while deleting course');
    }
  };

  if (!user) return null;

  return (
    <div className="admin-dashboard">
      <DashboardNavbar />
      <div className="content">
        <h1>Welcome {user.name}</h1>
        <p>Manage the entire LMS platform</p>

        {/* Teachers Section */}
        <div className="box">
          <h2>Teachers</h2>
          <form onSubmit={handleAddTeacher} className="add-form">
            <input type="text" placeholder="Name" value={teacherForm.name}
              onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} required />
            <input type="email" placeholder="Email" value={teacherForm.email}
              onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} required />
            <input type="password" placeholder="Password" value={teacherForm.password}
              onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })} required />
            <button type="submit">Add Teacher</button>
          </form>
          <ul>
            {teachers.map((t) => (
              <li key={t.id}>
                {t.name} ({t.email}){' '}
                <button onClick={() => handleDeleteTeacher(t.email)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Students Section */}
        <div className="box">
          <h2>Students</h2>
          <form onSubmit={handleAddStudent} className="add-form">
            <input type="text" placeholder="Name" value={studentForm.name}
              onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} required />
            <input type="email" placeholder="Email" value={studentForm.email}
              onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} required />
            <input type="password" placeholder="Password" value={studentForm.password}
              onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} required />
            <button type="submit">Add Student</button>
          </form>
          <ul>
            {students.map((s) => (
              <li key={s.id}>
                {s.name} ({s.email}){' '}
                <button onClick={() => handleDeleteStudent(s.email)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Courses Section */}
        <div className="box">
          <h2>Courses</h2>
          <ul>
            {courses.map((c) => (
              <li key={c.id}>
                <strong>{c.name}</strong> - {c.description} (by {c.teacher_name}){' '}
                <button onClick={() => handleDeleteCourse(c.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
