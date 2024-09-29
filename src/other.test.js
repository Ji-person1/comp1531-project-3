import { clear } from './other.js';
import { adminAuthRegister } from './auth.js';
import { adminQuizCreate } from './quiz.js';

describe(('2 tests function "clear"'), () => {
    test('empty_test', () => {
        expect(clear()).toStrictEqual({});
    });
    beforeEach(() => {
        adminAuthRegister('mail@gmail.com', 'this is password', 'first-name', 'last-name');
        adminQuizCreate(0, 'this is name', 'this is description');
    });
    test('fill something and clean it', () => {
        expect(clear()).toStrictEqual({});
    });
    test('fill more things and clean it', () => {
        adminAuthRegister('mail2@gmail.com', 'this is password', 'first-name2', 'last-name2');
        adminQuizCreate(1, 'this is name', 'this is description');
        expect(clear()).toStrictEqual({});
    });
});