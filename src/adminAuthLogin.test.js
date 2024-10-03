import { adminAuthRegister, adminAuthLogin } from './auth.js';
import { clear } from './other.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    clear()
})

describe('Error cases', () => {
    test('No registered users', () => {
        expect(adminAuthLogin("jim.zheng123@icloud.com", "")).toEqual(ERROR);
        expect(adminAuthLogin("", "1234abcd")).toEqual(ERROR);
    });

    test('incorrect password/email case', () => {
        adminAuthRegister("jim.zheng123@icloud.com", "1234abcd", "Jim", "Zheng")
        expect(adminAuthLogin("jim.zheng123@icloud.com", "")).toEqual(ERROR);
        expect(adminAuthLogin("", "1234abcd")).toEqual(ERROR);
    });

    test('Wrong account', () => {
        adminAuthRegister("jim.zheng123@icloud.com", "1234abcd", "Jim", "Zheng")
        adminAuthRegister("z5394791@unsw.edu.au", "6789mnbv", "Zim", "Zheng")
        expect(adminAuthLogin("jim.zheng123@icloud.com", "6789mnbv")).toEqual(ERROR);
        expect(adminAuthLogin("z5394791@unsw.edu.au", "1234abcd")).toEqual(ERROR);
    });
});

describe('Success cases', () => {
    test('correct with one account', () => {
        const userId = adminAuthRegister("jim.zheng123@icloud.com", "1234abcd", "Jim", "Zheng")
        expect(adminAuthLogin("jim.zheng123@icloud.com", "1234abcd")).toEqual(userId);
    });

    test('correct with two accounts', () => {
        const userId = adminAuthRegister("jim.zheng123@icloud.com", "1234abcd", "Jim", "Zheng")
        const userIdTwo = adminAuthRegister("z5394791@unsw.edu.au", "6789mnbv", "Zim", "Zheng")
        expect(adminAuthLogin("jim.zheng123@icloud.com", "1234abcd")).toEqual(userId);
        expect(adminAuthLogin("z5394791@unsw.edu.au", "6789mnbv")).toEqual(userIdTwo);
    });
});