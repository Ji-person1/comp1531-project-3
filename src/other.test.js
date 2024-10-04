import { clear } from './other.js';
import { getData } from './dataStore.js';
import { adminAuthRegister } from './auth.js';
import { adminQuizCreate } from './quiz.js';

describe(('2 tests function "clear"'), () => {
    beforeEach(() => {
        clear();
    });
    test('1: empty_test', () => {
        expect({users: [], quizzes: []}).toStrictEqual(getData());
    });
    
    test('2: fill something and clean it', () => {
        const userId = adminAuthRegister('mail@gmail.com', 'aaaaa111', 'firstName', 'lastName');
        const quizId = adminQuizCreate(userId.id, 'this is name', 'this is description');
        clear();
        expect({users: [], quizzes: []}).toStrictEqual(getData());
    });
    test('3: fill more things and clean it', () => {
        const userId = adminAuthRegister('mail@gmail.com', 'aaaaa111', 'firstName', 'lastName');
        const quizId = adminQuizCreate(userId.id, 'this is name', 'this is description');
        const userId2 = adminAuthRegister('mail2@gmail.com', 'aaaaa111', 'firstName', 'lastName');
        const quizId2 = adminQuizCreate(userId2.id, 'this is name', 'this is description');
        clear();
        expect({users: [], quizzes: []}).toStrictEqual(getData());
    });
    test('4: clean and then fill it', () => {
        const userId = adminAuthRegister('mail@gmail.com', 'aaaaa111', 'firstName', 'lastName');
        const quizId = adminQuizCreate(userId.id, 'this is name', 'this is description');
        clear();
        const userId2 = adminAuthRegister('mail2@gmail.com', 'aaaaa111', 'firstName', 'lastName');
        const quizId2 = adminQuizCreate(userId2.id, 'this is name', 'this is description');
        expect(userId2).toStrictEqual({id: 1});
        expect(quizId2).toStrictEqual({quizId: 1});
    });
});