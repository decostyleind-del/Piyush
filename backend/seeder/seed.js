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

    const users = [
      // ==========================================
      // MANAGEMENT (ADMIN, HR, HODs)
      // ==========================================
      {
        name: "Apoorva Baheti",
        email: "admin@company.com",
        password: hashedPassword,
        role: "Admin",
        department: "Administration",
        employeeCode: "ADM001",
        reportingManager: null,
      },
      {
        name: "HR Manager",
        email: "hr@company.com",
        password: hashedPassword,
        role: "HR",
        department: "HR",
        employeeCode: "HR001",
        reportingManager: "ADM001",
      },
      {
        name: "Piyush Gang",
        email: "mkt@decostyle.co.in", // Cleaned up duplicate entry
        password: hashedPassword,
        role: "HOD",
        department: "IT",
        employeeCode: "EMP270",
        dob: "1984-04-28", // Required for employee login tab
        reportingManager: "ADM001",
      },
      {
        name: "Sarah Jenkins",
        email: "hod.finance@company.com",
        password: hashedPassword,
        role: "HOD",
        department: "Finance",
        employeeCode: "HOD106",
        reportingManager: "ADM001",
      },
      {
        name: "Marcus Thorne",
        email: "hod.sales@company.com",
        password: hashedPassword,
        role: "HOD",
        department: "Sales",
        employeeCode: "HOD107",
        reportingManager: "ADM001",
      },

      // ==========================================
      // 20 EMPLOYEES (Linked to respective HODs)
      // ==========================================

      // --- IT Department (Reports to Amit Patel - HOD105) ---
      {
        name: "John Doe",
        email: "emp1@company.com",
        password: hashedPassword,
        employeeCode: "EMP101",
        dob: "2026-05-12",
        role: "Employee",
        department: "IT",
        reportingManager: "EMP270",
      },

      {
        name: "Aakriti Tiwari",
        employeeCode: "EMP408",
        dob: "1984-04-13",
        role: "Employee",
        department: "IT",
        reportingManager: "EMP270",
      },
      {
        name: "Mohit Choudhary",
        employeeCode: "EMP470",
        dob: "2007-08-14",
        role: "Employee",
        department: "IT",
        reportingManager: "EMP270",
      },
      {
        name: "Shubham Tiwari",
        employeeCode: "EMP507",
        dob: "2000-01-08",
        role: "Employee",
        department: "IT",
        reportingManager: "EMP270",
      },
      {
        name: "Pashupati Ranabhat",
        employeeCode: "EMP111",
        dob: "1995-09-22",
        role: "Employee",
        department: "IT",
        reportingManager: "EMP270",
      },
      {
        name: "Neha Dubey",
        employeeCode: "EMP476",
        dob: "1999-12-21",
        role: "Employee",
        department: "IT",
        reportingManager: "EMP270",
      },
      {
        name: "Shivam Singh Baghel",
        employeeCode: "EMP443",
        dob: "1984-04-13",
        role: "Employee",
        department: "IT",
        reportingManager: "EMP270",
      },
      {
        name: "Jane Smith",
        email: "emp2@company.com",
        password: hashedPassword,
        employeeCode: "EMP102",
        dob: "2026-05-22",
        role: "Employee",
        department: "IT",
        reportingManager: "EMP270",
      },
      {
        name: "Michael Chang",
        email: "emp3@company.com",
        password: hashedPassword,
        employeeCode: "EMP103",
        dob: "2026-03-14",
        role: "Employee",
        department: "IT",
        reportingManager: "EMP270",
      },
      {
        name: "Emily Davis",
        email: "emp4@company.com",
        password: hashedPassword,
        employeeCode: "EMP104",
        dob: "1996-11-30",
        role: "Employee",
        department: "IT",
        reportingManager: "EMP270",
      },
      {
        name: "David Kim",
        email: "emp5@company.com",
        password: hashedPassword,
        employeeCode: "EMP105",
        dob: "1992-07-04",
        role: "Employee",
        department: "IT",
        reportingManager: "EMP270",
      },
      {
        name: "Sarah Wilson",
        employeeCode: "EMP106",
        dob: "1994-03-19",
        role: "Employee",
        department: "IT",
        reportingManager: "EMP270",
      },
      {
        name: "James Anderson",
        employeeCode: "EMP107",
        dob: "1993-06-14",
        role: "Employee",
        department: "IT",
        reportingManager: "EMP270",
      },

      // --- Finance Department (Reports to Sarah Jenkins - HOD106) ---
      {
        name: "Robert Johnson",
        employeeCode: "EMP108",
        dob: "1990-02-15",
        role: "Employee",
        department: "Finance",
        reportingManager: "HOD106",
      },
      {
        name: "Jessica Taylor",
        employeeCode: "EMP109",
        dob: "1995-12-05",
        role: "Employee",
        department: "Finance",
        reportingManager: "HOD106",
      },
      {
        name: "William Martinez",
        email: "emp10@company.com",
        password: hashedPassword,
        employeeCode: "EMP110",
        dob: "1988-10-21",
        role: "Employee",
        department: "Finance",
        reportingManager: "HOD106",
      },
      {
        name: "Olivia Thomas",
        email: "emp11@company.com",
        password: hashedPassword,
        employeeCode: "EMP111",
        dob: "1997-01-20",
        role: "Employee",
        department: "Finance",
        reportingManager: "HOD106",
      },
      {
        name: "Daniel White",
        email: "emp12@company.com",
        password: hashedPassword,
        employeeCode: "EMP112",
        dob: "1991-09-25",
        role: "Employee",
        department: "Finance",
        reportingManager: "HOD106",
      },
      {
        name: "Sophia Harris",
        email: "emp13@company.com",
        password: hashedPassword,
        employeeCode: "EMP113",
        dob: "1994-04-11",
        role: "Employee",
        department: "Finance",
        reportingManager: "HOD106",
      },
      {
        name: "Matthew Clark",
        email: "emp14@company.com",
        password: hashedPassword,
        employeeCode: "EMP114",
        dob: "1989-12-08",
        role: "Employee",
        department: "Finance",
        reportingManager: "HOD106",
      },

      // --- Sales Department (Reports to Marcus Thorne - HOD107) ---
      {
        name: "Linda Lewis",
        email: "emp15@company.com",
        password: hashedPassword,
        employeeCode: "EMP115",
        dob: "1992-11-03",
        role: "Employee",
        department: "Sales",
        reportingManager: "HOD107",
      },
      {
        name: "Chris Walker",
        email: "emp16@company.com",
        password: hashedPassword,
        employeeCode: "EMP116",
        dob: "1996-05-18",
        role: "Employee",
        department: "Sales",
        reportingManager: "HOD107",
      },
      {
        name: "Amanda Hall",
        email: "emp17@company.com",
        password: hashedPassword,
        employeeCode: "EMP117",
        dob: "1993-02-27",
        role: "Employee",
        department: "Sales",
        reportingManager: "HOD107",
      },
      {
        name: "Joshua Allen",
        email: "emp18@company.com",
        password: hashedPassword,
        employeeCode: "EMP118",
        dob: "1990-08-14",
        role: "Employee",
        department: "Sales",
        reportingManager: "HOD107",
      },
      {
        name: "Megan Young",
        email: "emp19@company.com",
        password: hashedPassword,
        employeeCode: "EMP119",
        dob: "1995-09-30",
        role: "Employee",
        department: "Sales",
        reportingManager: "HOD107",
      },
      {
        name: "Kevin King",
        email: "emp20@company.com",
        password: hashedPassword,
        employeeCode: "EMP120",
        dob: "1987-07-22",
        role: "Employee",
        department: "Sales",
        reportingManager: "HOD107",
      },
    ];

    await User.insertMany(users);
    console.log(
      "Database Seeded Successfully with 20 Employees and 5 Management Profiles!",
    );
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedDB();
