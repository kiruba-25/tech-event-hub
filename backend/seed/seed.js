// Run: node seed/seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Announcement = require("../models/Announcement");
const Certificate = require("../models/Certificate");

const run = async () => {
  await connectDB();

  await User.deleteMany();
  await Event.deleteMany();
  await Registration.deleteMany();
  await Announcement.deleteMany();
  await Certificate.deleteMany();

  const admin = await User.create({
    name: "Aravind Admin",
    email: "admin@eventhub.com",
    password: "admin123",
    role: "admin",
    department: "HR",
  });

  const employee = await User.create({
    name: "Aravind Kumar",
    email: "employee@eventhub.com",
    password: "employee123",
    role: "employee",
    department: "Engineering",
  });

  const events = await Event.insertMany([
    {
      title: "React Conference 2026",
      category: "Conference",
      description: "Explore the future of Web Development with industry experts.",
      date: new Date("2026-07-18"),
      startTime: "10:00 AM",
      endTime: "05:00 PM",
      location: "Auditorium Hall",
      meetingLink: "https://meet.company.com/react-conf-2026",
      highlights: ["Hands-on Sessions", "Expert Talks", "Networking", "Certificate Provided"],
      createdBy: admin._id,
    },
    {
      title: "Q3 Planning Meeting",
      category: "Meeting",
      description: "Quarterly planning session with all department leads.",
      date: new Date("2026-07-12"),
      startTime: "11:00 AM",
      endTime: "12:30 PM",
      location: "Meeting Room 3A",
      createdBy: admin._id,
    },
    {
      title: "Pongal Celebration 2026",
      category: "Fest",
      description: "Celebrate together, create memories.",
      date: new Date("2026-01-15"),
      startTime: "10:00 AM",
      endTime: "02:00 PM",
      location: "Open Terrace",
      createdBy: admin._id,
    },
    {
      title: "Cyber Security Training",
      category: "Training",
      description: "Hands-on workshop covering current best practices.",
      date: new Date("2026-07-09"),
      startTime: "08:30 AM",
      endTime: "01:00 PM",
      location: "Lab 2",
      createdBy: admin._id,
    },
  ]);

  const extraEmployee = await User.create({
    name: "Priya Sharma",
    email: "priya@eventhub.com",
    password: "employee123",
    role: "employee",
    department: "Design",
  });

  await Registration.insertMany([
    { event: events[0]._id, user: employee._id, status: "Upcoming" },
    { event: events[1]._id, user: employee._id, status: "Active" },
    { event: events[3]._id, user: employee._id, status: "Completed", certificateEarned: true, attended: true },
    { event: events[0]._id, user: extraEmployee._id, status: "Upcoming" },
    { event: events[2]._id, user: extraEmployee._id, status: "Completed", certificateEarned: true, attended: true },
  ]);

  await Certificate.insertMany([
    {
      user: employee._id,
      event: events[3]._id,
      certificateId: "CERT-2026-1001",
      issueDate: new Date("2026-07-09"),
    },
    {
      user: extraEmployee._id,
      event: events[2]._id,
      certificateId: "CERT-2026-1002",
      issueDate: new Date("2026-01-15"),
    },
  ]);

  await Announcement.insertMany([
    {
      title: "Welcome to the new EventHub portal!",
      message: "You can now register for company events, track certificates, and view the shared calendar all in one place.",
      audience: "All",
      createdBy: admin._id,
    },
    {
      title: "React Conference registrations closing soon",
      message: "Seats for the React Conference 2026 are filling up fast — register from the Upcoming Events page today.",
      audience: "Engineering",
      createdBy: admin._id,
    },
  ]);

  console.log("Seed data inserted:");
  console.log("Admin login -> admin@eventhub.com / admin123");
  console.log("Employee login -> employee@eventhub.com / employee123");
  console.log("Employee login -> priya@eventhub.com / employee123");
  mongoose.connection.close();
};

run();