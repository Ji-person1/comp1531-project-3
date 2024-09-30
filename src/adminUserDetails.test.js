import { adminAuthRegister, adminUserDetails } from './auth.js';
import { clear } from './other.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    clear()
})

describe('Error cases', () => {
    test('empty data store', () => {
        expect(adminUserDetails(1)).toEqual(ERROR);
    });
    test('invalid userId', () => {
        const userId = adminAuthRegister("jim.zheng123@icloud.com", "1234abcd", "Jim", "Zheng")
        expect(adminUserDetails(-userId)).toEqual(ERROR);
    });
});

describe('Success cases', () => {
    test('Sucessful view', () => {
        const userId = adminAuthRegister("jim.zheng123@icloud.com", "1234abcd", "Jim", "Zheng")
        expect(adminUserDetails(userId)).toEqual({user: {
            userId: userId,
            name: "Jim Zheng",
            email: "jim.zheng123@icloud.com",
            numSuccessfulLogins: 0,
            numFailedPasswordsSinceLastLogin: 0
        }});
    });

    test('Sucessful view wit multiple users', () => {
        const userId = adminAuthRegister("jim.zheng123@icloud.com", "1234abcd", "Jim", "Zheng")
        adminAuthRegister("z5394791@unsw.edu.au", "1234abcd", "Mij", "Zheng")
        expect(adminUserDetails(userId)).toEqual({user: {
            userId: userId,
            name: "Mij Zheng",
            email: "jim.zheng123@icloud.com",
            numSuccessfulLogins: 0,
            numFailedPasswordsSinceLastLogin: 0
        }});
    });
});