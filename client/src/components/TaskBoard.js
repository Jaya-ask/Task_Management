import React, { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./TaskBoard.css";

const columns = ["To Do", "In Progress", "Done"];

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "To Do" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/tasks").then(res => setTasks(res.data));
  }, []);

  const handleCreateTask = () => {
    if (!newTask.title) return;
    axios.post("http://localhost:5000/tasks", newTask).then(res => {
      setTasks([...tasks, res.data]);
      setNewTask({ title: "", description: "", status: "To Do" });
      setIsModalOpen(false);
    });
  };

  const handleDragEnd = result => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;

    setTasks(prev =>
      prev.map(task =>
        task.id.toString() === taskId ? { ...task, status: newStatus } : task
      )
    );

    axios.put(`http://localhost:5000/tasks/${taskId}`, { status: newStatus });
  };

  return (
    <div className="board">
      <h1>Task Management Dashboard</h1>

      <button className="add-task-button" onClick={() => setIsModalOpen(true)}>Add New Task</button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create New Task</h2>
            <input
              placeholder="Title"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={newTask.description}
              onChange={e => setNewTask({ ...newTask, description: e.target.value })}
            />
            <select
              value={newTask.status}
              onChange={e => setNewTask({ ...newTask, status: e.target.value })}
            >
              {columns.map(col => (
                <option key={col}>{col}</option>
              ))}
            </select>
            <div className="modal-buttons">
              <button onClick={handleCreateTask}>Save</button>
              <button onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="columns">
          {columns.map(col => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div className="column" ref={provided.innerRef} {...provided.droppableProps}>
                  <h3>{col}</h3>
                  {tasks
                    .filter(task => task.status === col)
                    .map((task, idx) => (
                      <Draggable draggableId={task.id.toString()} index={idx} key={task.id}>
                        {(provided) => (
                          <div
                            className="task"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <strong>{task.title}</strong>
                            <p>{task.description}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TaskBoard;
