import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, getISOWeek, parseISO, startOfISOWeek, subDays } from "date-fns";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useStats } from "../hooks/useStats";
import type { StatsDay } from "../types/StatsTypes";
import Spinner from "../components/Spinner";
import "./StatsPage.css";

const RANGES = [
    { label: "Last 4 weeks", days: 28 },
    { label: "Last 3 months", days: 91 },
];

// Same orange as the habit dots in the calendar
const HABIT_COLOR = "#f59e0b";
// Same coral as the task dots in the calendar
const TASK_COLOR = "#ff6b6b";

interface WeekPoint {
    week: string; // "w.40"
    rate: number | null; // 0–100, null when no habit was scheduled that week
    done: number;
    scheduled: number;
}

// Sums the days per ISO week (Monday to Sunday), so the chart shows one bar per week
function groupByWeek(days: StatsDay[]): WeekPoint[] {
    const weeks = new Map<string, WeekPoint>();

    for (const day of days) {
        const date = parseISO(day.date);
        const key = format(startOfISOWeek(date), "yyyy-MM-dd");

        const week = weeks.get(key) ?? { week: `w.${getISOWeek(date)}`, rate: null, done: 0, scheduled: 0 };
        week.done += day.habitsDone;
        week.scheduled += day.habitsScheduled;
        week.rate = week.scheduled > 0 ? Math.round((week.done / week.scheduled) * 100) : null;
        weeks.set(key, week);
    }

    return [...weeks.values()];
}

function formatPercent(rate: number | null): string {
    return rate === null ? "–" : `${Math.round(rate * 100)}%`;
}

const StatsPage = () => {
    const [rangeDays, setRangeDays] = useState(RANGES[0].days);

    // Recomputed only when the range changes, so the hook doesn't refetch on every render
    const { from, to } = useMemo(() => {
        const today = new Date();
        return {
            from: format(subDays(today, rangeDays - 1), "yyyy-MM-dd"),
            to: format(today, "yyyy-MM-dd"),
        };
    }, [rangeDays]);

    const { stats, isLoading, error } = useStats(from, to);

    const weeks = useMemo(() => (stats ? groupByWeek(stats.days) : []), [stats]);
    const hasHabits = stats !== null && stats.summary.habitRate !== null;

    const tasksDone = stats?.summary.tasksDone ?? 0;
    const tasksTotal = stats?.summary.tasksTotal ?? 0;
    const tasksPercent = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

    const taskPie = [
        { name: "Completed", value: tasksDone, color: TASK_COLOR },
        { name: "Not done", value: tasksTotal - tasksDone, color: "#f3f4f6" },
    ];

    return (
        <div className="stats-page">
            <div className="stats-header">
                <h1>Your progress</h1>

                <div className="stats-range" role="group" aria-label="Time period">
                    {RANGES.map((range) => (
                        <button
                            key={range.days}
                            type="button"
                            className={`stats-range-btn ${rangeDays === range.days ? "stats-range-btn--active" : ""}`}
                            onClick={() => setRangeDays(range.days)}
                            aria-pressed={rangeDays === range.days}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading && !stats && <Spinner />}
            {error && <p className="stats-error">{error}</p>}

            {stats && (
                <>
                    <div className="stats-cards">
                        <div className="stats-card">
                            <span className="stats-card-label">Habits followed</span>
                            <span className="stats-card-value">{formatPercent(stats.summary.habitRate)}</span>
                        </div>

                        <div className="stats-card">
                            <span className="stats-card-label">Current streak</span>
                            <span className="stats-card-value">
                                {stats.summary.currentStreak} {stats.summary.currentStreak === 1 ? "day" : "days"}
                            </span>
                            <span className="stats-card-sub">Best: {stats.summary.bestStreak} days</span>
                        </div>

                        <div className="stats-card">
                            <span className="stats-card-label">Most consistent</span>
                            {stats.summary.mostConsistent ? (
                                <>
                                    <span className="stats-card-value stats-card-value--text">
                                        {stats.summary.mostConsistent.title}
                                    </span>
                                    <span className="stats-card-sub">
                                        {stats.summary.mostConsistent.done} of {stats.summary.mostConsistent.scheduled}{" "}
                                        days
                                    </span>
                                </>
                            ) : (
                                <span className="stats-card-value">–</span>
                            )}
                        </div>
                        <div className="stats-card">
                            <span className="stats-card-label">Tasks completed</span>

                            {tasksTotal > 0 ? (
                                <>
                                    <div className="stats-donut" role="img" aria-label={`${tasksDone} of ${tasksTotal} tasks completed`}>
                                        <ResponsiveContainer width="100%" height={110}>
                                            <PieChart>
                                                <Pie
                                                    data={taskPie}
                                                    dataKey="value"
                                                    innerRadius={34}
                                                    outerRadius={50}
                                                    startAngle={90}
                                                    endAngle={-270}
                                                    stroke="none"
                                                >
                                                    {taskPie.map((slice) => (
                                                        <Cell key={slice.name} fill={slice.color} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <span className="stats-donut-label" aria-hidden="true">
                                            {tasksPercent}%
                                        </span>
                                    </div>
                                    <span className="stats-card-sub">
                                        {tasksDone} of {tasksTotal} tasks
                                    </span>
                                </>
                            ) : (
                                <span className="stats-card-value">–</span>
                            )}
                        </div>
                    </div>

                    <section className="stats-chart-card">
                        <h2>Habits followed per week</h2>
                        <p className="stats-chart-sub">Share of scheduled habits you checked off</p>

                        {hasHabits ? (
                            <div className="stats-chart" role="img" aria-label="Bar chart of habits followed per week">
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={weeks} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                                        <CartesianGrid vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} />
                                        <YAxis
                                            domain={[0, 100]}
                                            ticks={[0, 50, 100]}
                                            tickFormatter={(value) => `${value}%`}
                                            tickLine={false}
                                            axisLine={false}
                                            fontSize={12}
                                        />
                                        <Tooltip
                                            cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
                                            formatter={(value, _name, item) => [
                                                `${value}% (${item.payload.done} of ${item.payload.scheduled})`,
                                                "Followed",
                                            ]}
                                        />
                                        <Bar dataKey="rate" fill={HABIT_COLOR} radius={[6, 6, 0, 0]} maxBarSize={48} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="stats-empty">
                                No habits scheduled in this period yet.{" "}
                                <Link to="/habits" className="stats-link">
                                    Add a habit
                                </Link>{" "}
                                to start tracking your progress.
                            </p>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default StatsPage;
