const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Create a course (Teacher only)
router.post('/', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  const { name, description } = req.body;

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

//  Get courses - filters by user role
router.get('/', authenticateToken, async (req, res) => {
  try {
    let result;

    if (req.user.role === 'teacher') {
      // Only return courses created by this teacher
      result = await pool.query(
        `SELECT courses.*, users.name as teacher_name 
         FROM courses 
         JOIN users ON courses.teacher_id = users.id 
         WHERE teacher_id = $1`,
        [req.user.id]
      );
    } else {
      // Admin and Student get all courses
      result = await pool.query(
        `SELECT courses.*, users.name as teacher_name 
         FROM courses 
         JOIN users ON courses.teacher_id = users.id`
      );
    }

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

// Enroll a student (Student route)
router.post('/:id/enroll', authenticateToken, authorizeRoles('student'), async (req, res) => {
  const courseId = req.params.id;
  const studentId = req.user.id;

  try {
    const courseCheck = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const enrollmentCheck = await pool.query(
      'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [studentId, courseId]
    );
    if (enrollmentCheck.rows.length > 0) {
      return res.status(400).json({ message: `You are already enrolled in ${courseCheck.rows[0].name}` });
    }

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

// Get enrolled students in teacher's courses
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

// Teacher enrolls student by email
router.post('/:id/enroll-student', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  const courseId = req.params.id;
  const { studentEmail } = req.body;

  try {
    const studentResult = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND role = $2',
      [studentEmail, 'student']
    );
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const studentId = studentResult.rows[0].id;

    const courseCheck = await pool.query(
      'SELECT * FROM courses WHERE id = $1 AND teacher_id = $2',
      [courseId, req.user.id]
    );
    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized to enroll in this course' });
    }

    const duplicate = await pool.query(
      'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [studentId, courseId]
    );
    if (duplicate.rows.length > 0) {
      return res.status(400).json({ message: 'Student already enrolled' });
    }

    const enrolled = await pool.query(
      'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *',
      [studentId, courseId]
    );

    res.status(201).json({ message: 'Student enrolled successfully', enrollment: enrolled.rows[0] });
  } catch (err) {
    console.error('Enroll student error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Remove student from course (Teacher)
router.delete('/:courseId/remove-student/:studentId', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  const { courseId, studentId } = req.params;

  try {
    const courseCheck = await pool.query(
      'SELECT * FROM courses WHERE id = $1 AND teacher_id = $2',
      [courseId, req.user.id]
    );
    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized to remove student from this course' });
    }

    const result = await pool.query(
      'DELETE FROM enrollments WHERE course_id = $1 AND student_id = $2 RETURNING *',
      [courseId, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json({ message: 'Student removed from course' });
  } catch (err) {
    console.error('Remove student error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create a course (Admin only - assign to any teacher)
router.post('/admin', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { name, description, teacher_id } = req.body;

  if (!name || !description || !teacher_id) {
    return res.status(400).json({ message: 'Name, description, and teacher_id are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO courses (name, description, teacher_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, teacher_id]
    );

    res.status(201).json({ message: 'Course added successfully', course: result.rows[0] });
  } catch (err) {
    console.error('Admin add course error:', err);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});


module.exports = router;
