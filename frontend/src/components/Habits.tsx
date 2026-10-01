import { Link } from "react-router-dom";
import type { useUserHabits } from "../hooks/useUserHabits";
import "./Habits.css";
import { isAfter, startOfDay } from "date-fns";

// Types taken straight from the hook, so they always match what Calendar passes down
type UserHabitsHook = ReturnType<typeof useUserHabits>;

interface HabitsViewProps {
    selectedDate: Date;
    habits: UserHabitsHook["todaysHabits"];
    error: string | null;
    onToggleCompletion: UserHabitsHook["toggleCompletion"];
}

const EMPTY_STATE_MESSAGES: Record<number, string> = {
    0: "Sundays are for resetting - plan a habit for the week ahead.",
    1: "Mondays are great for starting new.",
    2: "A small habit today beats a big plan tomorrow.",
    3: "Halfway there - why not build a habit to match?",
    4: "Almost the weekend - a good day to build momentum.",
    5: "Fridays count too. Start something small.",
    6: "Saturdays are perfect for a habit that sticks.",
};

export default function Habits({ selectedDate, habits, error, onToggleCompletion }: HabitsViewProps) {

    const isFutureDay = isAfter(startOfDay(selectedDate), startOfDay(new Date()));

    // Same order as tasks: open habits first, completed ones last
    const sortedHabits = [...habits].sort((a, b) => {
        if (!!a.is_completed_today === !!b.is_completed_today) return 0;
        return a.is_completed_today ? 1 : -1;
    });

    return (
        <div className="habit-container">
            <div className="habit-header-section">
                <h2 className="habit-main-title">Today's Habits</h2>
                <Link to="/habits" className="habit-add-btn">
                    + New Habit
                </Link>
            </div>

            {error ? (
                <p className="habit-error">Couldn't load your habits. Try reloading the page.</p>
            ) : sortedHabits.length === 0 ? (
                <p className="no-habits">{EMPTY_STATE_MESSAGES[selectedDate.getDay()]}</p>
            ) : (
                sortedHabits.map((habit) => (
                    <div key={habit.id} className={`habit-card ${habit.is_completed_today ? "completed" : ""}`}>
                        <div className="habit-card-left">
                            <input
                                type="checkbox"
                                className="habit-checkbox"
                                checked={!!habit.is_completed_today}
                                onChange={() => onToggleCompletion(habit.id, !!habit.is_completed_today)}
                                disabled={isFutureDay}
                                title={isFutureDay ? "You can check off this habit on the day" : undefined}
                                aria-label={`Mark ${habit.habit_title} as done`}
                            />
                            <div className="habit-text-content">
                                <span className={`habit-title ${habit.is_completed_today ? "line-through" : ""}`}>
                                    {habit.habit_title}
                                </span>
                                {habit.habit_description && <p className="habit-desc">{habit.habit_description}</p>}
                            </div>
                        </div>

                        {habit.duration_minutes && <span className="habit-duration">{habit.duration_minutes} min</span>}
                    </div>
                ))
            )}
        </div>
    );
}