import { useState } from "react";
import { useTasks } from "../hooks/useTasks";

export default function CreateTaskForm({ onClose }: { onClose: () => void }) {
    const { createTask } = useTasks();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        await createTask({
            user_id: 4, // METODO: Ersätt med aktuell användare från databasen när det finns tillgängligt.
            task_title: title,
            task_description: description,
            task_date: date,
        });

        onClose(); 
    };

    return (
        <form onSubmit={handleSubmit} className="task-form">
            <h3>Lägg till ny uppgift</h3>
            <input 
                type="text" 
                placeholder="Titel..." 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
            />
            <textarea 
                placeholder="Beskrivning (valfritt)..." 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
            />
            <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
            />
            <button type="submit">Spara</button>
        </form>
    );
}