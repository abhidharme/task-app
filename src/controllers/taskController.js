const Task = require("../models/Task");

// Create a new task
const createTask = async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and Description are required." });
  }

  try {
    const task = new Task({ user: req.user.id, title, description });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all tasks for the logged-in user
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get a specific task
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || task.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Update a task
const updateTask = async (req, res) => {
  const { title, description } = req.body;

  try {
    let task = await Task.findById(req.params.id);
    if (!task || task.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.title = title || task.title;
    task.description = description || task.description;

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task || task.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
