import React, { useState, useEffect } from 'react';
import './TaskManagerPage_updated.css';
import { getTasks, addTask, updateTask, deleteTask } from '../lib/tasks-api';
import type { Task } from '../types';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';

interface TaskManagerPageProps {
  currentPage: number;
}

const TaskManagerPage: React.FC<TaskManagerPageProps> = ({ currentPage }) => {
  const { token } = useGoogleAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      if (!token) throw new Error('No auth token');
      const taskData = await getTasks(token);
      setTasks(Array.isArray(taskData) ? taskData : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const addTaskHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !token) return;
    try {
      const newTask = {
        title: newTaskTitle.trim(),
        description: 'Task description',
        completed: false,
        priority: 'medium' as const,
        dueDate: new Date().toISOString(),
        category: 'general'
      };
      const createdTask = await addTask(newTask, token);
      setTasks(prev => [createdTask, ...prev]);
      setNewTaskTitle('');
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      if (!token) return;
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      const newCompletedStatus = !task.completed;
      const updated = await updateTask(taskId, { completed: newCompletedStatus }, token);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTaskHandler = async (taskId: string) => {
    try {
      if (!token) return;
      await deleteTask(taskId, token);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTaskHandler(e);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Refresh when navigating to this page
  useEffect(() => {
    if (currentPage === 3) {
      fetchTasks();
    }
  }, [currentPage]);

  return (
    <div className="task-manager-page">
      <div className="task-manager-header">TASK<br />MANAGER</div>
      
      <div className="task-list-container">
        <div className="task-input-wrapper">
          <input
            type="text"
            className="task-input"
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        
        <div className="task-list">
          {loading ? (
            <div className="loading-indicator">
              <div className="loading-spinner"></div>
              <span>Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="no-tasks">
              <p>No tasks yet. Add one above to get started!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div 
                key={task.id} 
                className={`task-item${task.completed ? ' completed' : ''}`}
              >
                <div className="task-content">
                  <div className="task-text">{task.title}</div>
                  <div className="task-datetime">
                    <div className="task-date">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}</div>
                  </div>
                </div>
                <div className="task-actions">
                  <button 
                    className={`task-complete-btn${task.completed ? ' completed' : ''}`}
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.completed ? '✓' : '○'}
                  </button>
                  <button 
                    className="task-delete-btn"
                    onClick={() => deleteTaskHandler(task.id)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskManagerPage;
