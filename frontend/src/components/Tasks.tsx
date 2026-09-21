import { useTasks } from "../hooks/useTasks";
import { Link } from "react-router-dom";
import "./Tasks.css";

export default function TaskView() {
    const { tasks, isLoading, error, updateTask } = useTasks();

    if (isLoading) return <p>Laddar uppgifter...</p>;
    if (error) return <p>Fel: {error}</p>;

    const groupedTasks = tasks.reduce((acc, task) => {
        const date = task.task_date ? task.task_date.split("T")[0] : "Inget datum";
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(task);
        return acc;
    }, {} as Record<string, typeof tasks>);

    return (
        <div className="task-container">
            <div className="task-header-section">
                <h2 className="task-main-title">Dagens uppgifter</h2>
                <Link to="/"><button className="task-add-btn">+ Ny uppgift</button></Link>
            </div>
                {Object.keys(groupedTasks).map((date) => (
                    <div key={date} className="task-date-group">
                        <p className="task-date-heading"> {date}</p>
                    
                        {groupedTasks[date].map((task) => (
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
                      
                            
                                {/* <span className="task-badge">Arbete</span> */}
                        </div>
                        ))}
                    </div>
                ))}
        </div>
    );
}