import { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { format } from "date-fns";

import CreateTaskForm from "./CreateTaskForm";
import "./Tasks.css";

interface TaskViewProps {
    selectedDate: Date;
}

export default function Tasks({ selectedDate }: TaskViewProps) {
    const { tasks, isLoading, error, updateTask, refetch } = useTasks();

    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isLoading) return <p className="task-loading">Loading Tasks...</p>;
    if (error) return <p className="task-error">Error: {error}</p>;

    const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");

    const filteredTasks = tasks.filter((task) => {
        if (!task.task_date) return false;
        const taskDateOnly = task.task_date.substring(0, 10)
        return taskDateOnly === formattedSelectedDate;
    });

    return (
        <div className="task-container">
            <div className="task-header-section">
                <h2 className="task-main-title">Todays Tasks</h2>
                <button className="task-add-btn" onClick={() => setIsModalOpen(true)}>
                    + New Task
                </button>
            </div>

            {isModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <CreateTaskForm 
                            onClose={() => 
                                {setIsModalOpen(false); 
                                refetch();
                            }} 
                            
                        />
                    </div>
                </div>
            )}

                {filteredTasks.length === 0 ? (
                <p className="no-tasks">No tasks today.</p>
            ) : (
                    
                filteredTasks.map((task) => (
                    <div key={task.id} className={`task-card ${task.is_completed ? "completed" : ""}`}>
                        <div className="task-card-left">
                            <div className="task-text-content">
                            <span className={`task-title ${task.is_completed ? "line-through" : ""}`}>
                             {task.task_title} 
                            </span>
                            {task.task_description && (
                                <p className="task-desc">{task.task_description}</p>
                                )}      
                            </div>   
                        </div>
                        <input 
                            type="checkbox" 
                            className="task-checkbox"
                            checked={task.is_completed} 
                            onChange={() => updateTask(task.id, { is_completed: !task.is_completed })}
                        />

                            {/* <span className="task-badge">Arbete</span>  /TODO - saving this if there are time to add categories on tasks */}
                    </div>
                ))
            )}
        </div>
    );
}