import { adminAuthRegister } from './auth.js';
import { clear } from './other.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    clear()
})

describe('Error cases', () => {
    test('invalid email', () => {
        expect(adminAuthRegister("no", "1234abcd", "Jim", "Zheng")).toEqual(ERROR);
    });
    test('Password too short', () => {
        expect(adminAuthRegister("jim.zheng123@icloud.com", "no", "Jim", "Zheng")).toEqual(ERROR);
    });
    test('Password only letters', () => {
        expect(adminAuthRegister("jim.zheng123@icloud.com", "aaaaaaaa", "Jim", "Zheng")).toEqual(ERROR);
    });
    test('Password only numbers', () => {
        expect(adminAuthRegister("jim.zheng123@icloud.com", "12345678", "Jim", "Zheng")).toEqual(ERROR);
    });
    test('invalid first name', () => {
        expect(adminAuthRegister("jim.zheng123@icloud.com", "1234abcd", "1234", "Zheng")).toEqual(ERROR);
    });
    test('invalid last name', () => {
        expect(adminAuthRegister("jim.zheng123@icloud.com", "1234abcd", "Jim", "1234")).toEqual(ERROR);
    });
    test('reused email', () => {
        adminAuthRegister("jim.zheng123@icloud.com", "1234abcd", "Jim", "Zheng");
        expect(adminAuthRegister("jim.zheng123@icloud.com", "abcd1234", "Mij", "Gnehz")).toEqual(ERROR);
    });
});

describe('Success cases', () => {
    test('Correct basic case', () => {
        const registerRet = adminAuthRegister("jim.zheng123@icloud.com", "1234abcd", "Jim", "Zheng")
        expect(registerRet.authUserId).toEqual(expect.any(Number));
    });
    test('Correct long password case', () => {
        const registerRet = adminAuthRegister("jim.zheng123@icloud.com", "123456789ABCDEFGhijklmno", "Jim", "Zheng")
        expect(registerRet.authUserId).toEqual(expect.any(Number));
    });
    test('Correct weird names case', () => {
        const registerRet = adminAuthRegister("jim.zheng123@icloud.com", "1234abcd", "Jim-ello", "What is my last name")
        expect(registerRet.authUserId).toEqual(expect.any(Number));
    });
});