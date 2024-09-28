import { clear } from './other.js';
import { data } from './dataStore.js';
import { adminAuthRegister } from './auth.js';
import { adminQuizCreate } from './quiz.js';

describe(('2 tests function "clear"'), () => {
    test('empty_test', () => {
        expect(clear()).toStrictEqual({
            users : [],
            quiezzes : []
          });
    });
    beforeEach(() => {
        adminAuthRegister('mail@gmail.com', 'this is password', 'first-name', 'last-name');
        adminQuizCreate('z1111111', 'this is name', 'this is description');
    });
    test('filled something and clean it', () => {
        expect(clear()).toStrictEqual({
            users : [],
            quiezzes : []
          });
    });
});