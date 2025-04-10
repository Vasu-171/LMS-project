const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

//  ADMIN ROUTES
// Get all teachers
router.get('/teachers', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email FROM users WHERE role = 'teacher'");
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching teachers:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new teacher
router.post('/teachers', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'teacher') RETURNING id, name, email",
      [name, email, hashedPassword]
    );
    res.status(201).json({ message: 'Teacher added', teacher: result.rows[0] });
  } catch (err) {
    console.error('Error adding teacher:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a teacher
router.delete('/teachers', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1 AND role = 'teacher'", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get all students (admin only)
router.get('/students', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE role = $1',
      ['student']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// Add a new student (Admin only)
router.post('/students', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
      [name, email, hashedPassword, 'student']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding student:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Delete a student (Admin only)
router.delete('/students/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 AND role = $2 RETURNING id, name, email',
      [id, 'student']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted', student: result.rows[0] });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});


//  TEACHER ROUTES


// Get students in a course
router.get('/students/:courseId', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  const { courseId } = req.params;
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email 
       FROM enrollments e 
       JOIN users u ON u.id = e.student_id 
       WHERE e.course_id = $1`,
      [courseId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add student to course
router.post('/students', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  const { student_id, course_id } = req.body;
  try {
    const exists = await pool.query(
      'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [student_id, course_id]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ message: 'Student already enrolled in course' });
    }

    await pool.query(
      'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)',
      [student_id, course_id]
    );
    res.status(201).json({ message: 'Student added to course' });
  } catch (err) {
    console.error('Error adding student to course:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove student from course
router.delete('/students', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  const { student_id, course_id } = req.body;
  try {
    await pool.query(
      'DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [student_id, course_id]
    );
    res.json({ message: 'Student removed from course' });
  } catch (err) {
    console.error('Error removing student from course:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


//  STUDENT ROUTES


// Get all available courses
router.get('/courses', authenticateToken, authorizeRoles('student'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.name, c.description, u.name AS teacher_name
      FROM courses c
      JOIN users u ON c.teacher_id = u.id
    `);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No courses found' });
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student route - fetch enrolled courses
router.get('/my-courses', authenticateToken, authorizeRoles('student'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.name, c.description, u.name AS teacher_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON c.teacher_id = u.id
      WHERE e.student_id = $1
    `, [req.user.id]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching enrolled courses:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get student ID by email
router.get('/get-student-id', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  const { email } = req.query;
  try {
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND role = $2',
      [email, 'student']
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get student ID error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
