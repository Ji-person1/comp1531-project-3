import { adminAuthRegister } from './auth.js';
import { adminQuizCreate, adminQuizList } from './quiz.js';
import { clear } from './other.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    clear();
});

describe('adminQuizList', () => {
    test('Invalid authUserId', () => {
        expect(adminQuizList(999)).toEqual(ERROR);
    });

    test('Valid authUserId with no quizzes', () => {
        const authUserId = adminAuthRegister('swastik@example.com', 'password123', 'swastik', 'mishra');
        expect(adminQuizList(authUserId)).toEqual({ quizzes: [] });
    });

    test('Valid authUserId with multiple quizzes', () => {
        const authUserId = adminAuthRegister('swastik@example.com', 'password123', 'swastik', 'mishra');
        const quiz1 = adminQuizCreate(authUserId, 'Quiz 1', 'First quiz');
        const quiz2 = adminQuizCreate(authUserId, 'Quiz 2', 'Second quiz');

        expect(adminQuizList(authUserId)).toEqual({
            quizzes: [
                { quizId: quiz1.quizId, name: 'Quiz 1' },
                { quizId: quiz2.quizId, name: 'Quiz 2' }
            ]
        });
    });

    test('Multiple users with their own quizzes', () => {
        const user1 = adminAuthRegister('user1@example.com', 'password123', 'swastik', 'mishra');
        const user2 = adminAuthRegister('user2@example.com', 'password456', 'Neo', 'Smith');

        const quiz1 = adminQuizCreate(user1, 'User 1 Quiz', 'Quiz for user 1');
        adminQuizCreate(user2, 'User 2 Quiz', 'Quiz for user 2');

        expect(adminQuizList(user1)).toEqual({
            quizzes: [
                { quizId: quiz1.quizId, name: 'User 1 Quiz' }
            ]
        });
    });
});