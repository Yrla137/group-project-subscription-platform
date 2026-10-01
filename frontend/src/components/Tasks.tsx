import { useState } from "react";
import { format } from "date-fns";
import type { useTasks } from "../hooks/useTasks";
import type { CalendarHorizon } from "./CalendarDatepicker";

import CreateTaskForm from "./CreateTaskForm";
import "./Tasks.css";

type TasksHook = ReturnType<typeof useTasks>;

interface TaskViewProps {
    selectedDate: Date;
    tasks: TasksHook["tasks"];
    error: string | null;
    onUpdateTask: TasksHook["updateTask"];
    onDeleteTask: TasksHook["deleteTask"];
    onTaskCreated: () => void;
    horizon?: CalendarHorizon | null;
}

export default function Tasks({ selectedDate, tasks, error, onUpdateTask, onTaskCreated, onDeleteTask }: TaskViewProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");

    const filteredTasks = tasks.filter((task) => {
        if (!task.task_date) return false;
        const taskDateOnly = task.task_date.substring(0, 10);
        return taskDateOnly === formattedSelectedDate;
    });

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (a.is_completed === b.is_completed) return 0;
        return a.is_completed ? 1 : -1;
    });

    const handleDeleteClick = (id: number) => {
        if (confirmDeleteId === id) {
  
            onDeleteTask(id);
            setConfirmDeleteId(null);
        } else {

            setConfirmDeleteId(id);

            setTimeout(() => {
                setConfirmDeleteId((prev) => (prev === id ? null : prev));
            }, 3000);
        }
    };

    return (
        <div className="task-container">
            <div className="task-header-section">
                <h2 className="task-main-title">Tasks</h2>
                <button className="task-add-btn" onClick={() => setIsModalOpen(true)}>
                    + New Task
                </button>
            </div>

            {isModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <CreateTaskForm
                            onClose={() => {
                                setIsModalOpen(false);
                                onTaskCreated();
                            }}
                        />
                    </div>
                </div>
            )}

            {error ? (
                <p className="task-error">Couldn't load your tasks. Try reloading the page.</p>
            ) : sortedTasks.length === 0 ? (
                <p className="no-tasks">No tasks today. Add a new one to get started!</p>
            ) : (
                sortedTasks.map((task) => {
                    const colorClass = task.color ? `task-${task.color}` : "task-coral";
                    const completedClass = task.is_completed ? "completed" : "";
                    const isConfirming = confirmDeleteId === task.id;

                    return (
                        <div key={task.id} className={`task-card ${colorClass} ${completedClass}`}>
                            <div className="task-card-left">
                                <input
                                    type="checkbox"
                                    className="task-checkbox"
                                    checked={task.is_completed}
                                    onChange={() => onUpdateTask(task.id, { is_completed: !task.is_completed })}
                                />
                                <div className="task-text-content">
                                    <span className={`task-title ${task.is_completed ? "line-through" : ""}`}>
                                        {task.task_title}
                                    </span>
                                    {task.task_description && <p className="task-desc">{task.task_description}</p>}
                                </div>
                            </div>
                            <button 
                                className={`task-delete-btn ${isConfirming ? "confirming" : ""}`}
                                onClick={() => handleDeleteClick(task.id)}
                                
                                title={isConfirming ? "Click again to confirm delete" : "Delete task"}
                                                            >
                                {isConfirming ? "Delete?" : "×"}
                            </button>
                        </div>
                    );
                })
            )}
        </div>
    );
}