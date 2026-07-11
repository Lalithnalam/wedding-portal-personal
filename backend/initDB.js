const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Submission = require('./models/Submission');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB Atlas!");
    console.log("Initializing database 'wedding-portal'...");

    // Insert a temporary dummy submission to force MongoDB to create the DB and collection
    const dummy = new Submission({
        guestName: "System Init",
        side: "Bride Side",
        relationship: "Other",
        blessingMeter: 5,
        wishes: "Initialization wish",
        marriageDos: "Initialization dos",
        marriageDonts: "Initialization donts"
    });

    await dummy.save();
    console.log("Dummy submission saved (Database created).");

    // Immediately remove it so the dashboard stays clean
    await Submission.deleteOne({ _id: dummy._id });
    console.log("Dummy submission removed. Database is now ready and visible!");

    process.exit(0);
  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });
