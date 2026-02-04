const mongoose = require('mongoose');
const Student = require('./models/Student');
const dotenv = require('dotenv');
dotenv.config();

const fixStudent = async (studentId, newPassword) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const student = await Student.findOne({ studentId });
        if (!student) {
            console.log("❌ Student not found");
            process.exit();
        }

        // We set the plain text password. 
        // The model's pre-save hook will hash it ONCE and save it.
        student.password = newPassword;
        await student.save();

        console.log(`✅ Password for ${studentId} has been reset to: ${newPassword}`);
        console.log("🚀 They should now be able to login!");
        process.exit();
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
};

// Change these to the student you want to fix
fixStudent('YOUR_STUDENT_ID_HERE', 'student123');
