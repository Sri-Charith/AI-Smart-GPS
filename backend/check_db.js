const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const Student = require('./models/Student');
const GatePassRequest = require('./models/GatePassRequest');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const studentCount = await Student.countDocuments();
        const requestCount = await GatePassRequest.countDocuments();
        const approvedToday = await GatePassRequest.countDocuments({
            status: 'Approved',
            leftAt: null
        });

        console.log(`Total Students: ${studentCount}`);
        console.log(`Total Gatepass Requests: ${requestCount}`);
        console.log(`Open Approved Requests: ${approvedToday}`);

        const studentsWithoutEmbeddings = await Student.countDocuments({
            $or: [
                { embedding: { $size: 0 } },
                { embedding: { $exists: false } }
            ]
        });
        console.log(`Students needing embedding extraction: ${studentsWithoutEmbeddings}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
