import { format } from "date-fns";
import { sv } from "date-fns/locale";

type TodoProps = {
    todoListId: number|undefined;
    date: Date;
}

const Todo = ({ todoListId, date }: TodoProps) => {

    if (!todoListId) {
        return (
            <div>
                <p>{format(date, "EEEE d MMMM", { locale: sv })}</p>
                <p>Ingen todo-lista för det här datumet ännu.</p>
            </div>
        )
    }

    return (
        <div>
            <p>{format(date, "EEEE d MMMM", { locale: sv })}</p>
            <p>Idag har vi en lista</p>
            {/* hämta och visa tasks kopplade till todoListId här */}
        </div>
    );
}


export default Todo
