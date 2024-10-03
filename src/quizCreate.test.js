import { adminAuthRegister } from './auth.js';
import { adminQuizCreate, adminQuizList } from './quiz.js';
import { clear } from './other.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    clear();
});

describe('adminQuizCreate', () => {
    test('Invalid authUserId', () => {
        expect(adminQuizCreate(999, 'Test Quiz', 'A test quiz')).toEqual(ERROR);
    });
    test('Invalid name - too short', () => {
        const authUserId = adminAuthRegister('swastik@example.com', 'password123', 'swastik', 'mishra');
        expect(adminQuizCreate(authUserId, 'Ab', 'A test quiz')).toEqual(ERROR);
    });

    test('Invalid name - too long', () => {
        const authUserId = adminAuthRegister('swastik@example.com', 'password123', 'swastik', 'mishra');
        const longName = 'A'.repeat(31);
        expect(adminQuizCreate(authUserId, longName, 'A test quiz')).toEqual(ERROR);
    });

    test('Invalid name - non-alphanumeric characters', () => {
        const authUserId = adminAuthRegister('swastik@example.com', 'password123', 'swastik', 'mishra');
        expect(adminQuizCreate(authUserId, 'Test Quiz!', 'A test quiz')).toEqual(ERROR);
    });

    test('Invalid description - too long', () => {
        const authUserId = adminAuthRegister('swastik@example.com', 'password123', 'swastik', 'mishra');
        const longDescription = 'A'.repeat(101);
        expect(adminQuizCreate(authUserId, 'Test Quiz', longDescription)).toEqual(ERROR);
    });

    test('Successfully create a quiz', () => {
        const authUserId = adminAuthRegister('swastik@example.com', 'password123', 'swastik', 'mishra');
        const result = adminQuizCreate(authUserId, 'Test Quiz', 'A test quiz');
        expect(result).toEqual({ quizId: expect.any(Number) });
        
        const quizzes = adminQuizList(authUserId);
        expect(quizzes).toEqual({
            quizzes: [
                { quizId: result.quizId, name: 'Test Quiz' }
            ]
        });
    });

    test('Create multiple quizzes', () => {
        const authUserId = adminAuthRegister('swastik@example.com', 'password123', 'swastik', 'mishra');
        const quiz1 = adminQuizCreate(authUserId, 'Quiz 1', 'First quiz');
        const quiz2 = adminQuizCreate(authUserId, 'Quiz 2', 'Second quiz');
        
        const quizzes = adminQuizList(authUserId);
        expect(quizzes).toEqual({
            quizzes: [
                { quizId: quiz1.quizId, name: 'Quiz 1' },
                { quizId: quiz2.quizId, name: 'Quiz 2' }
            ]
        });
    });

    test('Create quiz with same name for different users', () => {
        const user1 = adminAuthRegister('swastik@example.com', 'password123', 'swastik', 'mishra');
        const user2 = adminAuthRegister('neo@example.com', 'password321', 'neo', 'smith');

        const quiz1 = adminQuizCreate(user1, 'Common Quiz', 'A quiz');
        const quiz2 = adminQuizCreate(user2, 'Common Quiz', 'Another quiz');

        expect(quiz1.quizId).not.toBe(quiz2.quizId);

        const quizzes1 = adminQuizList(user1);
        const quizzes2 = adminQuizList(user2);

        expect(quizzes1).toEqual({
            quizzes: [
                { quizId: quiz1.quizId, name: 'Common Quiz' }
            ]
        });

        expect(quizzes2).toEqual({
            quizzes: [
                { quizId: quiz2.quizId, name: 'Common Quiz' }
            ]
        });
    });
});