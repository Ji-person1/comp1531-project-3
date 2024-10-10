import { adminAuthRegister } from './auth.js';
import { adminQuizCreate, adminQuizRemove, adminQuizList } from './quiz.js';
import { clear } from './other.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    clear();
});

describe('adminQuizRemove', () => {
    test('Invalid authUserId', () => {
        const authUserId = adminAuthRegister('swastik@example.com', 'password123', 'swastik', 'mishra');
        const quiz = adminQuizCreate(authUserId.authUserId, 'Test Quiz', 'A test quiz');
        expect(adminQuizRemove(999, quiz.quizId)).toEqual(ERROR);
    });

    test('Invalid quizId', () => {
        const authUserId = adminAuthRegister('swastik@example.com', 'password123', 'swastik', 'mishra');
        expect(adminQuizRemove(authUserId.authUserId, 999)).toEqual(ERROR);
    });

    test('Quiz does not belong to user', () => {
        const user1 = adminAuthRegister('swastik@example.com', 'password123', 'swastik', 'mishra');
        const user2 = adminAuthRegister('neo@example.com', 'password321', 'neo', 'smith');
        const quiz = adminQuizCreate(user1.authUserId, 'User 1 Quiz', 'Quiz for user 1');
        expect(adminQuizRemove(user2.authUserId, quiz.quizId)).toEqual(ERROR);
    });

    test('Successfully remove a quiz', () => {
        const authUserId = adminAuthRegister('swastik@example.com', 'password123', 'swastik', 'mishra');
        const quiz = adminQuizCreate(authUserId.authUserId, 'Test Quiz', 'A test quiz');
        
        expect(adminQuizRemove(authUserId.authUserId, quiz.quizId)).toEqual({});
        expect(adminQuizList(authUserId.authUserId)).toEqual({ quizzes: [] });
    });

    test('Remove one of multiple quizzes', () => {
        const authUserId = adminAuthRegister('swastik@example.com', 'password123', 'swastik', 'mishra');
        const quiz1 = adminQuizCreate(authUserId.authUserId, 'Quiz 1', 'First quiz');
        const quiz2 = adminQuizCreate(authUserId.authUserId, 'Quiz 2', 'Second quiz');
        
        expect(adminQuizRemove(authUserId.authUserId, quiz1.quizId)).toEqual({});
        expect(adminQuizList(authUserId.authUserId)).toEqual({
            quizzes: [
                { quizId: quiz2.quizId, name: 'Quiz 2' }
            ]
        });
    });
});