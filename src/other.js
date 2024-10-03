import { getData } from "./dataStore"
export function clear() {
    const data = getData()
    data.users = []
    data.quizzes = []
    return{}
}