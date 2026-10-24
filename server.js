const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Assignment database model
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    dueDate: { type: String, required: true },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Medium"
    },
    completed: { type: Boolean, default: false }
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);

// Get all assignments
app.get("/api/tasks", async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Could not load assignments." });
    }
});

// Add an assignment
app.post("/api/tasks", async (req, res) => {
    try {
        const { title, subject, dueDate, priority } = req.body;

        if (!title?.trim() || !subject?.trim() || !dueDate) {
            return res.status(400).json({
                message: "Please provide a title, subject, and due date."
            });
        }

        const task = await Task.create({
            title,
            subject,
            dueDate,
            priority
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: "Could not add assignment." });
    }
});

// Mark an assignment completed or pending
app.patch("/api/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { completed: req.body.completed },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({ message: "Assignment not found." });
        }

        res.json(task);
    } catch (error) {
        res.status(400).json({ message: "Could not update assignment." });
    }
});

// Delete an assignment
app.delete("/api/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Assignment not found." });
        }

        res.json({ message: "Assignment deleted successfully." });
    } catch (error) {
        res.status(400).json({ message: "Could not delete assignment." });
    }
});

// Test endpoint
app.get("/api/health", (req, res) => {
    res.json({ message: "StudyMate server is running!" });
});

// Connect to MongoDB and start the server
async function startServer() {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI || mongoURI.includes("PASTE_YOUR")) {
            console.error("Please check MONGODB_URI in your .env file.");
            process.exit(1);
        }

        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB successfully!");

        app.listen(PORT, () => {
            console.log(`StudyMate is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Connection error:", error.message);
        process.exit(1);
    }
}

startServer();