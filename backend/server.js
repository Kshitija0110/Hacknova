const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB().catch(err => {
  console.error(`Error: ${err.message}`.red.bold);
  process.exit(1);
});

// Route files
const auth = require('./routes/authRoutes');
const students = require('./routes/studentRoutes');
const faculty = require('./routes/facultyRoutes');
const courses = require('./routes/courseRoutes');
const admin = require('./routes/adminRoutes2');
const attendance = require('./routes/attendanceRoutes');
const assignments = require('./routes/assignmentRoutes');
const assignmentGrades = require('./routes/assignmentGradeRoutes');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', auth);
app.use('/api/students', students);
app.use('/api/faculty', faculty);
app.use('/api/courses', courses);
app.use('/api/admin', admin);
app.use('/api/attendance', attendance);
app.use('/api/assignments', assignments);
app.use('/api/grades', assignmentGrades);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = server;

