import { format } from "date-fns";
import { sv } from "date-fns/locale";

type TodoProps = {
    date: string;
}

const Todo = ({ date }: TodoProps) => {
    return (
        
        <p>{format(date, "EEEE d MMMM", { locale: sv })}</p>
    )
}


export default Todo
