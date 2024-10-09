import { getData, setData } from "./datastore";

export function clear(): {} {
    const data = getData()
    data.users = []
    data.quizzes = []
    
    setData(data);
    return {}
}