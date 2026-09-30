import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, getISOWeek, parseISO, startOfISOWeek, subDays } from "date-fns";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Lock } from "lucide-react";
import { useStats } from "../hooks/useStats";
import type { StatsDay, StatsSummary } from "../types/StatsTypes";
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

// Made-up numbers shown blurred behind the upgrade notice, so locked users see what the page
// looks like without the backend ever sending their real stats
const PREVIEW_SUMMARY: StatsSummary = {
    habitRate: 0.78,
    tasksDone: 42,
    tasksTotal: 51,
    currentStreak: 9,
    bestStreak: 14,
    mostConsistent: { title: "Morning walk", done: 26, scheduled: 28 },
};

const PREVIEW_WEEKS: WeekPoint[] = [
    { week: "w.1", rate: 64, done: 18, scheduled: 28 },
    { week: "w.2", rate: 71, done: 20, scheduled: 28 },
    { week: "w.3", rate: 80, done: 22, scheduled: 28 },
    { week: "w.4", rate: 78, done: 22, scheduled: 28 },
];

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

// The cards and the chart; used for both real stats and the blurred preview
function StatsContent({ summary, weeks }: { summary: StatsSummary; weeks: WeekPoint[] }) {
    const hasHabits = summary.habitRate !== null;

    const { tasksDone, tasksTotal } = summary;
    const tasksPercent = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

    const taskPie = [
        { name: "Completed", value: tasksDone, color: TASK_COLOR },
        { name: "Not done", value: tasksTotal - tasksDone, color: "#f3f4f6" },
    ];

    return (
        <>
            <div className="stats-cards">
                <div className="stats-card">
                    <span className="stats-card-label">Habits followed</span>
                    <span className="stats-card-value">{formatPercent(summary.habitRate)}</span>
                </div>

                <div className="stats-card">
                    <span className="stats-card-label">Habit streak</span>
                    <span className="stats-card-value">
                        {summary.currentStreak} {summary.currentStreak === 1 ? "day" : "days"}
                    </span>
                    <span className="stats-card-sub">Best: {summary.bestStreak} days</span>
                </div>

                <div className="stats-card">
                    <span className="stats-card-label">Most consistent</span>
                    {summary.mostConsistent ? (
                        <>
                            <span className="stats-card-value stats-card-value--text">
                                {summary.mostConsistent.title}
                            </span>
                            <span className="stats-card-sub">
                                {summary.mostConsistent.done} of {summary.mostConsistent.scheduled} days
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
                            <div
                                className="stats-donut"
                                role="img"
                                aria-label={`${tasksDone} of ${tasksTotal} tasks completed`}
                            >
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
    );
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

    const { stats, isLoading, error, isLocked, requiredTier } = useStats(from, to);

    const weeks = useMemo(() => (stats ? groupByWeek(stats.days) : []), [stats]);

    return (
        <div className="stats-page">
            <div className="stats-header">
                <h1>Your progress</h1>

                {/* The period only matters when there are real stats to show */}
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

            {isLoading && !stats && !isLocked && <Spinner />}
            {error && <p className="stats-error">{error}</p>}

            {isLocked ? (
                <div className="stats-locked">
                    {/* Sample data with no links or buttons, hidden from screen readers and not clickable */}
                    <div className="stats-locked-preview" aria-hidden="true">
                        <StatsContent summary={PREVIEW_SUMMARY} weeks={PREVIEW_WEEKS} />
                    </div>

                    <div className="stats-locked-overlay">
                        <section className="stats-upgrade" aria-labelledby="stats-upgrade-title">
                            <span className="stats-upgrade-icon" aria-hidden="true">
                                <Lock size={22} strokeWidth={2.5} />
                            </span>
                            <h2 id="stats-upgrade-title">Track your progress over time</h2>
                            <p>
                                See how well you follow your habits, how many tasks you finish, and how long your
                                streaks get. Progress stats are included in {requiredTier ?? "a higher plan"}.
                            </p>
                            <Link to="/tiers" className="primary-btn">
                                Upgrade to {requiredTier ?? "unlock stats"}
                            </Link>
                        </section>
                    </div>
                </div>
            ) : (
                stats && <StatsContent summary={stats.summary} weeks={weeks} />
            )}
        </div>
    );
};

export default StatsPage;