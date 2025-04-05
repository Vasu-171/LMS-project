const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Create a course (Teacher only)
router.post('/', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  const { name, description } = req.body;

  // Validate input
  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO courses (name, description, teacher_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get all courses (available to students and teachers)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT courses.*, users.name as teacher_name 
       FROM courses 
       JOIN users ON courses.teacher_id = users.id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Delete a course by ID (Teacher only)
router.delete('/:id', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  try {
    const courseId = req.params.id;
    const result = await pool.query(
      'DELETE FROM courses WHERE id = $1 AND teacher_id = $2 RETURNING *',
      [courseId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized to delete this course' });
    }

    res.json({ message: 'Course deleted successfully', course: result.rows[0] });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Enroll a student in a course (Student can now enroll)
router.post('/:id/enroll', authenticateToken, authorizeRoles('student'), async (req, res) => {
  const courseId = req.params.id;
  const studentId = req.user.id; // Using the student ID from JWT payload

  try {
    // Check if the course exists
    const courseCheck = await pool.query(
      'SELECT * FROM courses WHERE id = $1',
      [courseId]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check for duplicate enrollment
    const enrollmentCheck = await pool.query(
      'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [studentId, courseId]
    );

    if (enrollmentCheck.rows.length > 0) {
      return res.status(400).json({ message: `You are already enrolled in the course ${courseCheck.rows[0].name}` });
    }

    // Enroll the student
    const enrollmentResult = await pool.query(
      'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *',
      [studentId, courseId]
    );

    res.status(201).json({
      message: 'Student enrolled successfully',
      enrollment: enrollmentResult.rows[0],
    });
  } catch (err) {
    console.error('Enrollment error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get students enrolled in teacher's courses (Teacher only)
router.get('/enrollments', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.name, u.email, c.name as course_name
       FROM enrollments e
       JOIN users u ON e.student_id = u.id
       JOIN courses c ON e.course_id = c.id
       WHERE c.teacher_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch enrollments error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
