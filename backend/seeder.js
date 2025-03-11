const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load models
const User = require('./models/User');
const Course = require('./models/Course');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');
const Announcement = require('./models/Announcement');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Read JSON files
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);

const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);

const assignments = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/assignments.json`, 'utf-8')
);

const submissions = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/submissions.json`, 'utf-8')
);

const announcements = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/announcements.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    await User.create(users);
    await Course.create(courses);
    await Assignment.create(assignments);
    await Submission.create(submissions);
    await Announcement.create(announcements);
    
    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Course.deleteMany();
    await Assignment.deleteMany();
    await Submission.deleteMany();
    await Announcement.deleteMany();
    
    console.log('Data Destroyed...'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please provide proper command: -i (import) or -d (delete)');
  process.exit();
}