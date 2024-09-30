import { clear } from './other.js';
import { data } from './dataStore.js';
import { adminAuthRegister } from './auth.js';
import { adminQuizCreate } from './quiz.js';

describe(('2 tests function "clear"'), () => {
    test('empty_test', () => {
        clear();
        expect({users: [], quizzes: []}).toStrictEqual(data);
    });
    beforeEach(() => {
        adminAuthRegister('mail@gmail.com', 'this is password', 'first-name', 'last-name');
        adminQuizCreate(0, 'this is name', 'this is description');
        
    });
    test('fill something and clean it', () => {
        clear();
        expect({users: [], quizzes: []}).toStrictEqual(data);
    });
    test('fill more things and clean it', () => {
        adminAuthRegister('mail2@gmail.com', 'this is password', 'first-name2', 'last-name2');
        adminQuizCreate(1, 'this is name', 'this is description');
        clear();
        expect({users: [], quizzes: []}).toStrictEqual(data);
    });
    test('clean and then fill it', () => {
        clear();
        adminAuthRegister('mail2@gmail.com', 'this is password', 'first-name2', 'last-name2');
        adminQuizCreate(0, 'this is name', 'this is description');
        let user = data.users[0];
        expect(Object.keys(user).length).toStrictEqual(5);
    });
});