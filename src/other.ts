import { getData, setData } from "./datastore.ts";

export function clear(): {} {
    const data = getData()
    data.users = []
    data.quizzes = []
    data.sessions = []
    data.bin = []

    setData(data);
    return {}
}