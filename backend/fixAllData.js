const mongoose = require('mongoose');
const Student = require('./models/Student');
const Admin = require('./models/Admin');
const Guard = require('./models/Guard');
const Department = require('./models/Department');
require('dotenv').config();

const fixAllPasswords = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI;
        if (!MONGO_URI) {
            console.error("❌ MONGO_URI missing in .env");
            process.exit(1);
        }

        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 1. Fix Students (Reset all to 'student123')
        const students = await Student.find({});
        for (let student of students) {
            student.password = 'student123';
            await student.save();
        }
        console.log(`✅ Fixed ${students.length} students (Password set to: student123)`);

        // 2. Fix Admins (Reset all to 'admin123')
        const admins = await Admin.find({});
        for (let admin of admins) {
            admin.password = 'admin123';
            await admin.save();
        }
        console.log(`✅ Fixed ${admins.length} admins (Password set to: admin123)`);

        // 3. Fix Guards (Reset all to 'guard123')
        const guards = await Guard.find({});
        for (let guard of guards) {
            guard.password = 'guard123';
            await guard.save();
        }
        console.log(`✅ Fixed ${guards.length} guards (Password set to: guard123)`);

        // 4. Fix Departments (Reset all to 'hod123')
        const depts = await Department.find({});
        for (let dept of depts) {
            dept.password = 'hod123';
            await dept.save();
        }
        console.log(`✅ Fixed ${depts.length} departments (Password set to: hod123)`);

        console.log("\n🚀 DATABASE FIXED! You can now login with these default passwords.");
        process.exit();
    } catch (err) {
        console.error("❌ Error fixing database:", err.message);
        process.exit(1);
    }
};

fixAllPasswords();
