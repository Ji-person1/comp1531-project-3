import { getData } from "./dataStore"; // Assume this contains the user data
import { adminUserDetailsUpdate, adminUserPasswordUpdate, adminAuthRegister } from "./auth"; 
import { clear } from './other'

beforeEach(() => {
    clear();
});

const ERROR = { error: expect.any(String) };

describe('adminUserDetailsUpdate', () => {
    it('should return an error if email is already in use', () => {
        const userIdOne = adminAuthRegister('user@example.com', 'OldPassword123', 'ValidName', 'ValidLastName')
        const result = adminUserDetailsUpdate(userIdOne, 'user@example.com', 'ValidName', 'ValidLastName');
        expect(result).toEqual(ERROR);
    });

    it('should return an error if nameFirst contains invalid characters', () => {
        const userIdOne = adminAuthRegister('user@example.com', 'OldPassword123', 'ValidName', 'ValidLastName')
        const result = adminUserDetailsUpdate(userIdOne, 'newemail@example.com', 'Invalid@Name', 'ValidLastName');
        expect(result).toEqual(ERROR);
    });

    it('should return an error if nameFirst is less than 2 characters', () => {
        const userIdOne = adminAuthRegister('user@example.com', 'OldPassword123', 'ValidName', 'ValidLastName')
        const result = adminUserDetailsUpdate(userIdOne, 'newemail@example.com', 'A', 'ValidLastName');
        expect(result).toEqual(ERROR);
    });

    it('should return an error if nameFirst is more than 20 characters', () => {
        const userIdOne = adminAuthRegister('user@example.com', 'OldPassword123', 'ValidName', 'ValidLastName')
        const result = adminUserDetailsUpdate(userIdOne, 'newemail@example.com', 'ThisFirstNameIsWayTooLong', 'ValidLastName');
        expect(result).toEqual(ERROR);
    });

    it('should return an error if nameLast contains invalid characters', () => {
        const userIdOne = adminAuthRegister('user@example.com', 'OldPassword123', 'ValidName', 'ValidLastName')
        const result = adminUserDetailsUpdate(userIdOne, 'newemail@example.com', 'ValidName', 'Invalid#LastName');
        expect(result).toEqual(ERROR);
    });

    it('should return an error if nameLast is less than 2 characters', () => {
        const userIdOne = adminAuthRegister('user@example.com', 'OldPassword123', 'ValidName', 'ValidLastName')
        const result = adminUserDetailsUpdate(userIdOne, 'newemail@example.com', 'ValidName', 'A');
        expect(result).toEqual(ERROR);
    });

    it('should return an error if nameLast is more than 20 characters', () => {
        const userIdOne = adminAuthRegister('user@example.com', 'OldPassword123', 'ValidName', 'ValidLastName')
        const result = adminUserDetailsUpdate(userIdOne, 'newemail@example.com', 'ValidName', 'ThisLastNameIsWayTooLong');
        expect(result).toEqual(ERROR);
    });

    it('should return an empty object for valid input', () => {
        const userIdOne = adminAuthRegister('user@example.com', 'OldPassword123', 'ValidName', 'ValidLastName')
        const result = adminUserDetailsUpdate(userIdOne, 'newemail@example.com', 'ValidName', 'ValidLastName');
        expect(result).toEqual({});
    });
});


describe('adminUserPasswordUpdate', () => {
    it('should return an error if authUserId is not valid', () => {
        const userIdOne = adminAuthRegister('user@example.com', 'OldPassword123', 'ValidName', 'ValidLastName')
        const result = adminUserPasswordUpdate(-userIdOne, 'OldPassword123', 'NewPassword123');
        expect(result).toEqual(ERROR);
    });

    it('should return an error if oldPassword is incorrect', () => {
        const userIdOne = adminAuthRegister('user@example.com', 'OldPassword123', 'ValidName', 'ValidLastName')
        const result = adminUserPasswordUpdate(userIdOne, 'WrongOldPassword', 'NewPassword123');
        expect(result).toEqual(ERROR);
    });

    it('should return an error if oldPassword and newPassword are the same', () => {
        const userIdOne = adminAuthRegister('user@example.com', 'OldPassword123', 'ValidName', 'ValidLastName')
        const result = adminUserPasswordUpdate(userIdOne, 'OldPassword123', 'OldPassword123');
        expect(result).toEqual(ERROR);
    });

    it('should return an error if newPassword is less than 8 characters', () => {
        const userIdOne = adminAuthRegister('user@example.com', 'OldPassword123', 'ValidName', 'ValidLastName')
        const result = adminUserPasswordUpdate(userIdOne, 'OldPassword123', 'Short1');
        expect(result).toEqual(ERROR);
    });

    it('should return an error if newPassword does not contain at least one letter and one number', () => {
        const userIdOne = adminAuthRegister('user@example.com', 'OldPassword123', 'ValidName', 'ValidLastName')
        const result = adminUserPasswordUpdate(userIdOne, 'OldPassword123', 'NoNumber!');
        expect(result).toEqual(ERROR);
    });

    it('should return an error if newPassword does not contain at least one letter', () => {
        const userIdOne = adminAuthRegister('user@example.com', 'OldPassword123', 'ValidName', 'ValidLastName')
        const result = adminUserPasswordUpdate(userIdOne, 'OldPassword123', '12345678');
        expect(result).toEqual(ERROR);
    });

    it('should return an empty object for valid password update', () => {
        const userIdOne = adminAuthRegister('user@example.com', 'OldPassword123', 'ValidName', 'ValidLastName')
        const result = adminUserPasswordUpdate(userIdOne, 'OldPassword123', 'NewPassword123');
        expect(result).toEqual({});
    });
});
