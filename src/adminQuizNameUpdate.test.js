import { adminQuizNameUpdate, adminQuizCreate } from './quiz.js';
import { adminAuthRegister } from './auth.js';
import { clear } from './other.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    clear();
});

describe('Error cases', () => {
    test ('invalid userId', () => {
        const userId = adminAuthRegister("swapnav.saikia@gmail.com", "1234abcd", "Swapnav", "Saikia");
        const quizId = adminQuizCreate(userId, "quiz1", "This is my quiz");
        expect(adminQuizNameUpdate(-userId, quizId, "New Quiz Name")).toEqual(ERROR);
    });

    test ('invalid quizId', () => {
        const userId = adminAuthRegister("swapnav.saikia@gmail.com", "1234abcd", "Swapnav", "Saikia");
        const quizId = adminQuizCreate(userId, "quiz1", "This is my quiz");
        expect(adminQuizNameUpdate(userId, -quizId, "New Quiz Name")).toEqual(ERROR);
    });

    test ('quiz name does not exist', () => {
        const userId = adminAuthRegister("swapnav.saikia@gmail.com", "1234abcd", "Swapnav", "Saikia");
        const quizId = adminQuizCreate(userId, "quiz1", "This is my quiz");
        expect(adminQuizNameUpdate(userId, quizId + 1, "New Quiz Name")).toEqual(ERROR); 
    });

    test ('name contains invalid characters', () => {
        const userId = adminAuthRegister("swapnav.saikia@gmail.com", "1234abcd", "Swapnav", "Saikia");
        const quizId = adminQuizCreate(userId, "quiz1", "This is my quiz");
        expect(adminQuizNameUpdate(userId, quizId, "Invalid!Name@#")).toEqual(ERROR);
    });

    test ('name length invalid', () => {
        const userId = adminAuthRegister("swapnav.saikia@gmail.com", "1234abcd", "Swapnav", "Saikia");
        const quizId = adminQuizCreate(userId, "quiz1", "This is my quiz");
        expect(adminQuizNameUpdate(userId, quizId, "Na")).toEqual(ERROR); 
        expect(adminQuizNameUpdate(userId, quizId, "N".repeat(31))).toEqual(ERROR); 
    });

    test ('name already used', () => {
        const userId = adminAuthRegister("swapnav.saikia@gmail.com", "1234abcd", "Swapnav", "Saikia");
        const quizId1 = adminQuizCreate(userId, "quiz1", "This is my quiz");
        const quizId2 = adminQuizCreate(userId, "quiz2", "This is my second quiz");
        expect(adminQuizNameUpdate(userId, quizId1, "quiz2")).toEqual(ERROR); 
    });
});

describe('Success cases', () => {

    test('successful name update', () => {
        const userId = adminAuthRegister("swapnav.saikia@gmail.com", "1234abcd", "Swapnav", "Saikia");
        const quizId = adminQuizCreate(userId, "quiz1", "This is my quiz");
        expect(adminQuizNameUpdate(userId, quizId, "Updated Quiz Name")).toEqual({});
    });
});
    
