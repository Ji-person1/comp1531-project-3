import { data } from "./dataStore";

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

export { isVaildUserId, isVaildQuizId };