import { useUserHabits } from "../hooks/useUserHabits";
import { Link } from "react-router-dom";
import "./Habits.css";

interface HabitsViewProps {
    selectedDate: Date;
}

const EMPTY_STATE_MESSAGES: Record<number, string> = {
    0: "Sundays are for resetting — plan a habit for the week ahead.",
    1: "Mondays are great for starting new.",
    2: "A small habit today beats a big plan tomorrow.",
    3: "Halfway there — why not build a habit to match?",
    4: "Almost the weekend — a good day to build momentum.",
    5: "Fridays count too. Start something small.",
    6: "Saturdays are perfect for a habit that sticks.",
};

export default function Habits({ selectedDate }: HabitsViewProps) {
    const { todaysHabits, isTodaysLoading, error, toggleCompletion } = useUserHabits(selectedDate);

    if (isTodaysLoading) return <p className="habit-loading">Loading Habits...</p>;
    if (error) return <p className="habit-error">Error: {error}</p>;

    if (todaysHabits.length === 0) {
        const message = EMPTY_STATE_MESSAGES[selectedDate.getDay()];

        return (
            <div className="habit-container habit-empty-state">
                <p className="habit-empty-message">{message}</p>
                <Link to="/habits"><button className="habit-add-btn">Manage habits</button></Link>
            </div>
        );
    }

    return (
        <div className="habit-container">
            <div className="habit-header-section">
                <h2 className="habit-main-title">Todays Habits</h2>
                <Link to="/habits"><button className="habit-add-btn">+ New Habit</button></Link>
            </div>
            {todaysHabits.map((habit) => (
                <div key={habit.id} className={`habit-card ${habit.is_completed_today ? "completed" : ""}`}>
                    <div className="habit-card-left">
                        <div className="habit-text-content">
                            <span className={`habit-title ${habit.is_completed_today ? "line-through" : ""}`}>
                                {habit.habit_title}
                            </span>
                            {habit.habit_description && (
                                <p className="habit-desc">{habit.habit_description}</p>
                            )}
                            {habit.duration_minutes && (
                                <span className="habit-duration">{habit.duration_minutes} min</span>
                            )}
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        className="habit-checkbox"
                        checked={!!habit.is_completed_today}
                        onChange={() => toggleCompletion(habit.id, !!habit.is_completed_today)}
                    />
                </div>
            ))}
        </div>
    );
}