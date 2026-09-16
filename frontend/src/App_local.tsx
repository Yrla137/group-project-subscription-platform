import './App.css'
import { useState } from 'react';
import Calendar from "./components/Calendar"
import type {
  Tier,
  User,
  Payment,
  TodoList,
  Task,
  Habit,
  UserHabit,
  Seminar,
} from "./types/Calendar.ts";
import Todo from './components/Todo.tsx';

const App = () => {
  // ==========================================
  // MOCK DATA
  // ==========================================

  const mockTiers: Tier[] = [
    {
      id: 1,
      title: "Free",
      tier_description: "Kom igång gratis med grundläggande funktioner.",
      price: 0.0,
      level_number: 1,
      max_todos_per_day: 5,
      max_future_days: 3,
      max_custom_habits: 2,
    },
    {
      id: 2,
      title: "Plus",
      tier_description: "Fler todos, längre planeringshorisont.",
      price: 49.0,
      level_number: 2,
      max_todos_per_day: 20,
      max_future_days: 14,
      max_custom_habits: 10,
    },
    {
      id: 3,
      title: "Pro",
      tier_description: "Obegränsat för dig som planerar allt.",
      price: 99.0,
      level_number: 3,
      max_todos_per_day: 100,
      max_future_days: 90,
      max_custom_habits: 50,
    },
  ];

  const mockUsers: User[] = [
    {
      id: 1,
      first_name: "Elin",
      last_name: "Andersson",
      email: "elin.andersson@example.com",
      password_hash: "$2b$10$mockhash1",
      role: "administrator",
      current_tier_id: 3,
      created_at: "2026-01-10T09:00:00Z",
    },
    {
      id: 2,
      first_name: "Noah",
      last_name: "Karlsson",
      email: "noah.karlsson@example.com",
      password_hash: "$2b$10$mockhash2",
      role: "member",
      current_tier_id: 2,
      created_at: "2026-02-14T12:30:00Z",
    },
    {
      id: 3,
      first_name: "Saga",
      last_name: "Lindqvist",
      email: "saga.lindqvist@example.com",
      password_hash: "$2b$10$mockhash3",
      role: "member",
      current_tier_id: 1,
      created_at: "2026-03-02T15:45:00Z",
    },
  ];

  const mockPayments: Payment[] = [
    {
      id: 1,
      user_id: 1,
      tier_id: 3,
      amount: 99.0,
      payment_date: "2026-01-10T09:05:00Z",
    },
    {
      id: 2,
      user_id: 2,
      tier_id: 2,
      amount: 49.0,
      payment_date: "2026-02-14T12:35:00Z",
    },
  ];

  const mockTodoLists: TodoList[] = [
    {
      id: 1,
      user_id: 1,
      todo_date: "2026-09-15",
      created_at: "2026-09-14T20:00:00Z",
    },
    {
      id: 2,
      user_id: 2,
      todo_date: "2026-09-15",
      created_at: "2026-09-14T21:10:00Z",
    },
    {
      id: 3,
      user_id: 3,
      todo_date: "2026-09-16",
      created_at: "2026-09-15T08:00:00Z",
    },
  ];

  const mockTasks: Task[] = [
    {
      id: 1,
      todo_list_id: 1,
      task_title: "Skriv projektplan",
      task_description: "Klart utkast till gruppmöte kl 10.",
      created_at: "2026-09-14T20:05:00Z",
      is_completed: true,
    },
    {
      id: 2,
      todo_list_id: 1,
      task_title: "Sätt upp Supabase-schema",
      task_description: null,
      created_at: "2026-09-14T20:10:00Z",
      is_completed: false,
    },
    {
      id: 3,
      todo_list_id: 2,
      task_title: "Handla mat",
      task_description: "Frukt, havregryn, kaffe.",
      created_at: "2026-09-14T21:15:00Z",
      is_completed: false,
    },
    {
      id: 4,
      todo_list_id: 3,
      task_title: "Träna 30 min",
      task_description: null,
      created_at: "2026-09-15T08:05:00Z",
      is_completed: false,
    },
  ];

  const mockHabits: Habit[] = [
    {
      id: 1,
      habit_title: "Drick 2L vatten",
      habit_description: "Håll koll på vätskeintaget under dagen.",
      created_by: 1,
      created_at: "2026-01-11T10:00:00Z",
    },
    {
      id: 2,
      habit_title: "Läs 20 minuter",
      habit_description: null,
      created_by: 1,
      created_at: "2026-01-11T10:05:00Z",
    },
    {
      id: 3,
      habit_title: "Morgonmeditation",
      habit_description: "5–10 minuter innan skärmtid.",
      created_by: 2,
      created_at: "2026-02-15T07:00:00Z",
    },
  ];

  const mockUserHabits: UserHabit[] = [
    {
      id: 1,
      user_id: 1,
      habit_id: 1,
      is_recurring: true,
      recurrence_rule: "DAILY",
      is_active: true,
      created_at: "2026-01-12T08:00:00Z",
    },
    {
      id: 2,
      user_id: 1,
      habit_id: 2,
      is_recurring: true,
      recurrence_rule: "MON,WED,FRI",
      is_active: true,
      created_at: "2026-01-13T08:00:00Z",
    },
    {
      id: 3,
      user_id: 2,
      habit_id: 3,
      is_recurring: true,
      recurrence_rule: "DAILY",
      is_active: false,
      created_at: "2026-02-16T07:30:00Z",
    },
  ];

  const mockSeminars: Seminar[] = [
    {
      id: 1,
      seminar_title: "Effektiv veckoplanering",
      seminar_description: "Lär dig strukturera veckan med tidsblockering.",
      seminar_date: "2026-09-20T17:00:00Z",
      tier_id: 2,
      created_by: 1,
      created_at: "2026-08-01T10:00:00Z",
    },
    {
      id: 2,
      seminar_title: "Bygg hållbara vanor",
      seminar_description: "Beteendevetenskap bakom habit-byggande.",
      seminar_date: "2026-09-27T17:00:00Z",
      tier_id: 3,
      created_by: 1,
      created_at: "2026-08-05T10:00:00Z",
    },
  ];

  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  return (
    <div>
      
      <Calendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        markedDates={mockTasks.map((entry) => new Date(entry.created_at))}
      />

      {/* Skickar det valda datumet vidare som prop, precis som du ville 
      */}
      
      <Todo date={selectedDate} />

    </div>
  )
}

export default App
