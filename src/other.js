import { getData } from "./dataStore";

function clear() {
    const data = getData(); 
    data.users = [];
    data.quiezzes = [];
    return {};
}

export { clear };
