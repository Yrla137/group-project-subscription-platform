import { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { useAuthContext } from "../context/AuthContext";

export default function CreateTaskForm({ onClose }: { onClose: () => void }) {
    const { createTask } = useTasks();
    const { user } = useAuthContext();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [color, setColor] = useState("coral");

    const colors = [
        { name: "coral", hex: "#ff6b6b" },
        { name: "blue", hex: "#4d96ff" },
        { name: "green", hex: "#254729" },
        { name: "yellow", hex: "#e6d541" },
    ];

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        
    const userId = user ? (user.user_id) : null;

        if (!userId) {
        console.error("Ingen inloggad användare hittades!");
        return;
        }

        await createTask({
            user_id: userId,
            task_title: title,
            task_description: description,
            task_date: date,
            color: color,
        });

        onClose(); 
    };

    return (
        <form onSubmit={handleSubmit} className="task-form">
            <div className="task-form-header">
            <h3>Add Task</h3>
            <button type="button" className="modal-close-x" onClick={onClose}>
                    &times;
                </button>
            </div>

            <input 
                type="text" 
                placeholder="Titel..." 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
            />
            <textarea 
                placeholder="Description..." 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
            />
            <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
            />

            <div className="color-picker-container">
                <span className="color-picker-label">Choose color:</span>
                <div className="color-swatches">
                    {colors.map((c) => (
                        <button
                            key={c.name}
                            type="button"
                            onClick={() => setColor(c.name)}
                            className={`color-btn ${color === c.name ? "selected" : ""}`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                        />
                    ))}
                </div>
            </div>

            <button type="submit" className="task-save-btn">Spara</button>
        </form>
    );
}