import { format } from "date-fns";
import { sv } from "date-fns/locale";
import "./Todo.css"

import type { CalendarEvent } from "../types/CalendarTypes";

type TodoProps = {
    events: CalendarEvent[];
    date: Date;
}

const Todo = ({ events, date }: TodoProps) => {

    const level = 1;

    const tasks = events.filter((event) => event.type === "task");
    const seminars = events.filter((event) => event.type === "seminar");

    const isOutOfReach = (event: CalendarEvent) =>
        event.type === "seminar" && event.tierLevel !== undefined && event.tierLevel > level;

    if (events.length === 0) {
        return (
            <div>
                <p>{format(date, "EEEE d MMMM", { locale: sv })}</p>
                <p>Inget planerat för det här datumet ännu.</p>
            </div>
        )
    }

    return (
        <div>

            <h2>Planeringar för {format(date, "EEEE d MMMM", { locale: sv })}</h2>

            {tasks.length > 0 && (
                <div>
                    <h3>Tasks</h3>
                    <div className="task-list">
                        {tasks.map((task) => (
                            <div key={task.id} className="task-card">
                                {task.title}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {seminars.length > 0 && (
                <div>
                    <h3>Seminarier</h3>
                    <div className="seminar-list">
                        {seminars.map((seminar) => {
                            const outOfReach = isOutOfReach(seminar);

                            return (
                                <div
                                    key={seminar.id}
                                    className={`seminar-card ${outOfReach ? "seminar-card--locked" : ""}`}
                                >
                                    <div className="seminar-card-header">
                                        <span className="seminar-title">{seminar.title}</span>

                                        {outOfReach && (
                                            <span className="seminar-lock-badge">
                                                <span className="material-symbols-rounded" aria-hidden="true">
                                                    lock
                                                </span>
                                                Tier {seminar.tierLevel}
                                            </span>
                                        )}
                                    </div>

                                    {seminar.description && (
                                        <p className="seminar-description">{seminar.description}</p>
                                    )}

                                    <span className="seminar-time">
                                        {format(new Date(seminar.date), "HH:mm", { locale: sv })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Todo