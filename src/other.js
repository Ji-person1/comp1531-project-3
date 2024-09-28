import { data } from "./dataStore";

function clear() {
    data.users = [];
    data.quiezzes = [];
    return {}
}

function isVaildUserId(authUserId) {
    for(let user of data.users) {
        if (user.authUserId === authUserId) {
            return true;
        }
    }
    return false;
}

function isVaildQuizId(quizId) {
    for(let quiz of data.quiezzes) {
        if (quiz.quizId === quizId) {
            return true;
        }
    }
    return false;
}

export { clear, isVaildUserId, isVaildQuizId };