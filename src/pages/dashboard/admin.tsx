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
    const res = await fetch('http://localhost:5000/api/users/teachers', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTeachers(data);
  };

  const fetchStudents = async () => {
    const res = await fetch('http://localhost:5000/api/users/students', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setStudents(data);
  };

  const fetchCourses = async () => {
    const res = await fetch('http://localhost:5000/api/courses', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCourses(data);
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
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
      alert('Teacher added');
      setTeacherForm({ name: '', email: '', password: '' });
      fetchTeachers();
    } else {
      alert(result.error || 'Failed');
    }
  };

  const handleDeleteTeacher = async (email: string) => {
    if (!confirm(`Delete ${email}?`)) return;
    const res = await fetch('http://localhost:5000/api/users/teachers', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    });
    const result = await res.json();
    if (res.ok) fetchTeachers();
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
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
      alert('Student added');
      setStudentForm({ name: '', email: '', password: '' });
      fetchStudents();
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!confirm('Delete student?')) return;
    const res = await fetch(`http://localhost:5000/api/users/students/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (res.ok) fetchStudents();
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/courses/admin', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseForm),
    });
    const result = await res.json();
    if (res.ok) {
      alert('Course added');
      setCourseForm({ name: '', description: '', teacher_id: '' });
      fetchCourses();
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm('Delete course?')) return;
    const res = await fetch(`http://localhost:5000/api/courses/admin/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (res.ok) fetchCourses();
  };

  if (!user) return null;

  return (
    <div className="admin-dashboard">
      <DashboardNavbar />
      <div className="content">
        <h1>Welcome {user.name}</h1>
        <p>Platform Management Panel</p>

        <div className="stats-container">
          <div className="stat-card teacher-bg">
            <h3>👩‍🏫 Teachers</h3>
            <p>{teachers.length}</p>
          </div>
          <div className="stat-card student-bg">
            <h3>🎓 Students</h3>
            <p>{students.length}</p>
          </div>
          <div className="stat-card course-bg">
            <h3>📚 Courses</h3>
            <p>{courses.length}</p>
          </div>
        </div>

        <div className="grid-layout">
          {/* TEACHERS */}
          <div className="box">
            <h2>Manage Teachers</h2>
            <form onSubmit={handleAddTeacher} className="add-form">
              <input type="text" placeholder="Name" value={teacherForm.name} onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} required />
              <input type="email" placeholder="Email" value={teacherForm.email} onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} required />
              <input type="password" placeholder="Password" value={teacherForm.password} onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })} required />
              <button type="submit">Add Teacher</button>
            </form>
            <ul>
              {teachers.map(t => (
                <li key={t.id}>
                  {t.name} ({t.email}){' '}
                  <button onClick={() => handleDeleteTeacher(t.email)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>

          {/* STUDENTS */}
          <div className="box">
            <h2>Manage Students</h2>
            <form onSubmit={handleAddStudent} className="add-form">
              <input type="text" placeholder="Name" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} required />
              <input type="email" placeholder="Email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} required />
              <input type="password" placeholder="Password" value={studentForm.password} onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} required />
              <button type="submit">Add Student</button>
            </form>
            <ul>
              {students.map(s => (
                <li key={s.id}>
                  {s.name} ({s.email}){' '}
                  <button onClick={() => handleDeleteStudent(s.id)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>

          {/* COURSES */}
          <div className="box">
            <h2>Manage Courses</h2>
            <form onSubmit={handleAddCourse} className="add-form">
              <input type="text" placeholder="Course Name" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} required />
              <input type="text" placeholder="Description" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} required />
              <select value={courseForm.teacher_id} onChange={(e) => setCourseForm({ ...courseForm, teacher_id: e.target.value })} required>
                <option value="">Select Teacher</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <button type="submit">Add Course</button>
            </form>
            <ul>
              {courses.map(c => (
                <li key={c.id}>
                  <strong>{c.name}</strong> - {c.description} (by {c.teacher_name}){' '}
                  <button onClick={() => handleDeleteCourse(c.id)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
