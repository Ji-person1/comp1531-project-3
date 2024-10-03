import { clear } from './other.js';
import { getData } from './dataStore.js';
import { adminAuthRegister } from './auth.js';
import { adminQuizCreate } from './quiz.js';

describe(('2 tests function "clear"'), () => {
    test('1: empty_test', () => {
        clear();
        expect({users: [], quizzes: []}).toStrictEqual(getData());
    });
    beforeEach(() => {

        adminAuthRegister('mail@gmail.com', 'this is password', 'first-name', 'last-name');
        adminQuizCreate(0, 'this is name', 'this is description');
        const data = getData();
        
    });
    test('2: fill something and clean it', () => {
        clear();
        expect({users: [], quizzes: []}).toStrictEqual(getData());
    });
    test('3: fill more things and clean it', () => {
        adminAuthRegister('mail2@gmail.com', 'this is password', 'first-name2', 'last-name2');
        adminQuizCreate(1, 'this is name', 'this is description');
        clear();
        expect({users: [], quizzes: []}).toStrictEqual(getData());
    });
    test('4: clean and then fill it', () => {
        clear();
        adminAuthRegister('mail2@gmail.com', 'this is password', 'first-name2', 'last-name2');
        adminQuizCreate(0, 'this is name', 'this is description');
        expect(data.users.length).toStrictEqual(1);
        expect(data.quiezzes.length).toStrictEqual(1);
    });
});