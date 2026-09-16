import { useState } from "react";
import { isSameDay, parseISO } from "date-fns";

import type { TodoList } from "../types/Calendar"

import Todo from "./Todo";
import CalendarDatepicker from "./CalendarDatepicker";

const Calendar = () => {

  // ==========================================
  // MOCK DATA
  // ==========================================

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

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const selectedTodoList = mockTodoLists.find((list) =>
    isSameDay(parseISO(list.todo_date), selectedDate)
  );

  return (
    <div>

      <CalendarDatepicker
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        markedDates={mockTodoLists.map((entry) => parseISO(entry.todo_date))}
      />

      <Todo todoListId={selectedTodoList?.id} date={selectedDate} />

    </div>
  )
}

export default Calendar