require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedDB = async () => {
  try {
    const MONGO_URI =
      process.env.MONGO_URI || "mongodb://localhost:27017/leave_management";
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected successfully for seeding.");

    await mongoose.connection.dropCollection("users").catch(() => {
      console.log("Users collection did not exist yet, skipping drop.");
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Test@123", salt);
    const Adminpassword = await bcrypt.hash("Admin@678", salt);
    const password = await bcrypt.hash("Admin@456", salt);
    const hoadpssword = await bcrypt.hash("Admin@234", salt);

    const users = [
      // ==========================================
      // MANAGEMENT (ADMIN, HR, HODs)
      // ==========================================
      {
        name: "Apoorva Baheti",
        email: "apoorva@decostyle.co.in",
        password: Adminpassword,
        role: "Admin",
        department: "Administration",
        employeeCode: "ADM001",
        reportingManager: null,
      },
      {
        name: "HR Manager",
        email: "hr@decostyle.co.in",
        password: hashedPassword,
        role: "HR",
        department: "HR",
        employeeCode: "HR001",
        reportingManager: "ADM001",
      },
      {
        name: "Piyush Gang",
        email: "mkt@decostyle.co.in",
        password: hashedPassword,
        role: "HOD",
        department: "IT",
        employeeCode: "270",
        dob: "1984-04-28",
        reportingManager: "ADM001",
      },
      {
        name: "GB Sir",
        email: "gb@decostyle.co.in",
        password: hoadpssword,
        role: "HOD",
        dob: "1980-01-01",
        department: "Sales",
        employeeCode: "107",
        reportingManager: "ADM001",
      },

      {
        name: "Kapil Mittal",
        email: "print3d@decostyle.co.in",
        password: password,
        role: "HOD",
        dob: "1980-08-09",
        department: "print3D",
        employeeCode: "print3D",
        reportingManager: "ADM001",
      },

      // ==========================================
      // IT DEPARTMENT (Reports to Piyush Gang - 270)
      // ==========================================
      {
        name: "Aakriti Tiwari",
        email: "aakriti@company.com",
        password: hashedPassword,
        employeeCode: "408",
        dob: "1998-04-13",
        role: "Employee",
        department: "IT",
        reportingManager: "270",
      },
      {
        name: "Mohit Choudhary",
        email: "mohit@company.com",
        password: hashedPassword,
        employeeCode: "470",
        dob: "2007-08-14",
        role: "Employee",
        department: "IT",
        reportingManager: "270",
      },
      {
        name: "Shubham Tiwari",
        email: "shubham@company.com",
        password: hashedPassword,
        employeeCode: "507",
        dob: "2000-01-08",
        role: "Employee",
        department: "IT",
        reportingManager: "270",
      },
      {
        name: "Pashupati Ranabhat",
        email: "pashupati@company.com",
        password: hashedPassword,
        employeeCode: "111",
        dob: "1995-09-22",
        role: "Employee",
        department: "IT",
        reportingManager: "270",
      },
      {
        name: "Neha Dubey",
        email: "neha@company.com",
        password: hashedPassword,
        employeeCode: "476",
        dob: "1999-12-21",
        role: "Employee",
        department: "IT",
        reportingManager: "270",
      },
      {
        name: "Shivam Singh Baghel",
        email: "shivam@company.com",
        password: hashedPassword,
        employeeCode: "443",
        dob: "1998-04-13",
        role: "Employee",
        department: "IT",
        reportingManager: "270",
      },

      // ==========================================
      // SALES DEPARTMENT (Reports to GB Sir - 107)
      // ==========================================
      {
        name: "Dipesh Jain",
        password: hashedPassword,
        employeeCode: "1382",
        dob: "1978-05-15",
        role: "Employee",
        department: "Sales",
        reportingManager: "107",
      },
      {
        name: "Akshay",
        password: hashedPassword,
        employeeCode: "0000",
        dob: "2000-02-15",
        role: "Employee",
        department: "Sales",
        reportingManager: "107",
      },
      {
        name: "Amit",
        password: hashedPassword,
        employeeCode: "386",
        dob: "2002-01-20",
        role: "Employee",
        department: "Sales",
        reportingManager: "107",
      },
      {
        name: "Vinit Mandloi", // Updated from 'Vinit'
        password: hashedPassword,
        employeeCode: "518",
        dob: "2001-08-12", // Added actual DOB
        role: "Employee",
        department: "Sales",
        reportingManager: "107",
      },
      {
        name: "Kadam Ji (SMD)",
        password: hashedPassword,
        employeeCode: "1023",
        role: "Employee",
        department: "Sales",
        reportingManager: "107",
      },
      {
        name: "Sanjay Pandey",
        password: hashedPassword,
        employeeCode: "1552",
        dob: "1980-01-01",
        role: "Employee",
        department: "Sales",
        reportingManager: "107",
      },
      {
        name: "Rajkumar Vishvakarma",
        password: hashedPassword,
        employeeCode: "2222",
        dob: "1987-08-30",
        role: "Employee",
        department: "Sales",
        reportingManager: "107",
      },
      {
        name: "Pankaj Choudhary",
        password: hashedPassword,
        employeeCode: "1751",
        dob: "1997-06-30",
        role: "Employee",
        department: "Sales",
        reportingManager: "107",
      },
      {
        name: "Mahendra Singh Rajput",
        password: hashedPassword,
        employeeCode: "2241",
        dob: "1986-01-01",
        role: "Employee",
        department: "Sales",
        reportingManager: "107",
      },
      {
        name: "Shiv Kumar Dangi",
        password: hashedPassword,
        employeeCode: "509",
        dob: "2000-01-01",
        role: "Employee",
        department: "Sales",
        reportingManager: "107",
      },

      // ==========================================
      // ADMINISTRATION EMPLOYEES (Approved by Admin - ADM001)
      // ==========================================
      {
        name: "Dharmendra Chaudhary",
        password: hashedPassword,
        employeeCode: "1016",
        dob: "1989-09-10",
        role: "Employee",
        department: "Administration",
        reportingManager: "ADM001",
      },

      {
        name: "Aatmaram Gurjar", // Moved from Admin (was 'Atharav' 2146)
        password: hashedPassword,
        employeeCode: "2146",
        dob: "1988-07-05",
        role: "Employee",
        department: "Administration",
        reportingManager: "ADM001",
      },
      {
        name: "Sunny Verma",
        password: hashedPassword,
        employeeCode: "1910",
        dob: "1995-01-28",
        role: "Employee",
        department: "Administration",
        reportingManager: "ADM001",
      },
      {
        name: "Hariom",
        password: hashedPassword,
        employeeCode: "265",
        dob: "2000-08-08",
        role: "Employee",
        department: "Administration",
        reportingManager: "ADM001",
      },
      {
        name: "Ankit",
        password: hashedPassword,
        employeeCode: "262",
        dob: "1999-03-15",
        role: "Employee",
        department: "Administration",
        reportingManager: "ADM001",
      },
      {
        name: "Rohit",
        password: hashedPassword,
        employeeCode: "2343",
        dob: "1989-09-05",
        role: "Employee",
        department: "Administration",
        reportingManager: "ADM001",
      },
      {
        name: "Sunil",
        password: hashedPassword,
        employeeCode: "2006",
        dob: "1995-02-12",
        role: "Employee",
        department: "Administration",
        reportingManager: "ADM001",
      },
      {
        name: "Chandan",
        password: hashedPassword,
        employeeCode: "2173",
        dob: "1997-07-01",
        role: "Employee",
        department: "Administration",
        reportingManager: "ADM001",
      },
      {
        name: "Santosh",
        password: hashedPassword,
        employeeCode: "465",
        dob: "1974-05-18",
        role: "Employee",
        department: "Administration",
        reportingManager: "ADM001",
      },
      {
        name: "Kapil Sirsat",
        password: hashedPassword,
        employeeCode: "1443",
        dob: "1989-10-19",
        role: "Employee",
        department: "Administration",
        reportingManager: "ADM001",
      },
      {
        name: "Kapil Bagwan",
        password: hashedPassword,
        employeeCode: "503",
        dob: "1997-07-31",
        role: "Employee",
        department: "Administration",
        reportingManager: "ADM001",
      },
      {
        name: "Vivek",
        password: hashedPassword,
        employeeCode: "163",
        dob: "2000-11-08",
        role: "Employee",
        department: "Administration",
        reportingManager: "ADM001",
      },
      {
        name: "Vinay",
        password: hashedPassword,
        employeeCode: "469",
        dob: "2000-01-11",
        role: "Employee",
        department: "Administration",
        reportingManager: "ADM001",
      },
      {
        name: "Lochan",
        password: hashedPassword,
        employeeCode: "2260",
        dob: "1995-11-03",
        role: "Employee",
        department: "Administration",
        reportingManager: "ADM001",
      },
      {
        name: "Kishore",
        password: hashedPassword,
        employeeCode: "1413",
        dob: "1992-02-14",
        role: "Employee",
        department: "Administration",
        reportingManager: "ADM001",
      },
      {
        name: "Lokesh",
        password: hashedPassword,
        employeeCode: "295",
        dob: "1997-06-01",
        role: "Employee",
        department: "Administration",
        reportingManager: "ADM001",
      },
      {
        name: "Vishnu Pandey",
        password: hashedPassword,
        employeeCode: "050",
        dob: "1964-08-03",
        role: "Employee",
        department: "Administration",
        reportingManager: "ADM001",
      },
    ];

    await User.insertMany(users);
    console.log(
      `Database Seeded Successfully with ${users.length} Profiles Based on Real Data!`,
    );
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedDB();
