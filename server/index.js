const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/task_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Task Schema and Model
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done'],
    default: 'To Do'
  }
});

const Task = mongoose.model('Task', taskSchema);

app.use(cors());
app.use(bodyParser.json());

// Get all tasks (with formatted ID)
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    const formattedTasks = tasks.map(task => ({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status
    }));
    res.json(formattedTasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
});

// Create new task
app.post('/tasks', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json({
      id: savedTask._id.toString(),
      title: savedTask.title,
      description: savedTask.description,
      status: savedTask.status
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating task', error: err.message });
  }
});

// Update task
app.put('/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, { new: true });
    res.json({
      id: updatedTask._id.toString(),
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating task', error: err.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
