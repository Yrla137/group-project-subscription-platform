import { format } from "date-fns";
import { sv } from "date-fns/locale";

import type { CalendarEvent } from "../types/CalendarTypes";

type TodoProps = {
    events: CalendarEvent[];
    date: Date;
}

const Todo = ({ events, date }: TodoProps) => {

    const tasks = events.filter((event) => event.type === "task");
    const seminars = events.filter((event) => event.type === "seminar");

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
            <p>{format(date, "EEEE d MMMM", { locale: sv })}</p>

            {tasks.length > 0 && (
                <div>
                    <h3>Tasks</h3>
                    <ul>
                        {tasks.map((task) => (
                            <li key={task.id}>{task.title}</li>
                        ))}
                    </ul>
                </div>
            )}

            {seminars.length > 0 && (
                <div>
                    <h3>Seminarier</h3>
                    <ul>
                        {seminars.map((seminar) => (
                            <li key={seminar.id}>{seminar.title}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Todo