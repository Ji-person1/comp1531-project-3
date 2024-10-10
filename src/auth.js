import validator from 'validator';
import {getData} from './dataStore.js'

/**
 * Creates a new user when given the email, first name, last name and password
 * validates the passed in variables
 * returns an error object if any validation fails.
 * 
 * @param {string} email - The email address of a user.
 * @param {string} password - The password for the account.
 * @param {string} nameFirst - first name of the user.
 * @param {string} nameLast - the last name of the user
 * @returns {number|object} error if failed, object containing a number if successful
 */
export function adminAuthRegister (email, password, nameFirst, nameLast) {
    const data = getData()

    if (!validator.isEmail(email)) {
        return { error: 'invalid email address' }
    }
    
    if (data.users.find(user => user.email === email)) {
        return { error: 'email already in use' }
    }
    const nameTest = /^[a-zA-Z\s'-]+$/

    if (!nameTest.test(nameFirst)) {
        return { error: 'invalid characters in first name' }
    }
    else if (nameFirst.length < 2 || nameFirst.length > 20) {
        return { error: 'invalid first name length' }
    }

    if (!nameTest.test(nameLast)) {
        return { error: 'invalid characters in last name' }
    }
    else if (nameLast.length < 2 || nameLast.length > 20) {
        return { error: 'invalid last name length' }
    }

    const passwordTest = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    if (!passwordTest.test(password)) {
        return { error: 'password must be at least 8 characters long and contain at least one letter and one number.' }
    }
    const authUserId = data.users.length > 0 ? data.users[data.users.length - 1].id + 1 : 1

    const newUser = {
        id: authUserId,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
        password: password,
        numSuccessfulLogins: 0,
        numFailedPasswordsSinceLastLogin: 0
    }
    data.users.push(newUser)
    return {authUserId: authUserId}
}

/**
 * given the password and email of the user, returns the userId
 * if the two do not match, returns an error object
 * 
 * @param {string} email - The email address of a user.
 * @param {string} password - The password for the account.
 * @returns {object} error if failed, object containing a number number if successful
 */
export function adminAuthLogin (email, password) {
    const data = getData()

    const user = data.users.find(user => user.email === email)

    if (!user) {
        return { error: "email not found" }
    }

    if (user.password !== password) {
        user.numFailedPasswordsSinceLastLogin++
        return { error: "wrong password" }
    }

    user.numSuccessfulLogins++
    user.numFailedPasswordsSinceLastLogin = 0
    return {authUserId: user.id}
}

/**
 * finds details on an account based on the userid passed in
 * returns error if the account cannot be found. 
 * 
 * @param {string} authUserId - the user id of the account being searched
 * @returns {object} error if failed, the details of the account otherwise
 */
export function adminUserDetails (authUserId) {
    const data = getData();

    const user = data.users.find(user => user.id === authUserId)

    if (!user) {
        return {error: 'invalid userId'}
    }

    return { 
        user: {
            userId: user.id,
            name: user.nameFirst + " " + user.nameLast,
            email: user.email,
            numSuccessfulLogins: user.numSuccessfulLogins,
            numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
        }
    }
}

/**
 * updates the details, when provided with them. Changing the email
 * first name and last name of the user. 
 * 
 * @param {string} authUserId - The id of the user, used for verification.
 * @param {string} email - The new email address of a user.
 * @param {string} nameFirst - the new first name of the user.
 * @param {string} nameLast - the new last name of the user
 * @returns {object} error if failed, empty object if successful
 */
export function adminUserDetailsUpdate (authUserId, email, nameFirst, nameLast) {
    const data = getData();
    const user = data.users.find(user => user.id === authUserId); 
    if (!user) {
        return { error: 'user id not found' }
    }

    if (user.email === email) {
        return { error: 'email already in use' }
    }
    if (/[^a-zA-Z\s'-]/.test(nameFirst) == true) {
        return {error: "nameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes"};
    }
    if (nameFirst.length < 2) {
        return {error: "namefirst is less than two characters"};
    }
    if (nameFirst.length > 20) {
        return {error: "nameFkirst is more than twenty characters"};
    }
    if (/[^a-zA-Z\s'-]/.test(nameLast) == true) {
        return {error: "nameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes"};
    }
    if (nameLast.length < 2) {
        return {error: "nameLast is less than two characters"};
    }
    if (nameLast.length > 20) {
        return {error: "nameLast is more than twenty characters"};
    }

    user.email = email
    user.nameFirst = nameFirst
    user.nameLast = nameLast
    return {}; 
}

/**
 * updates the password of a user to a new password, if given the user id and 
 * former password of the user to a new password passed in.
 * 
 * @param {string} authUserId - The user id of the account
 * @param {string} oldPassword - The former password for the account.
 * @param {string} newPassword - The new password for the account.
 * @returns {object} error if failed, empty object if successful
 */
export function adminUserPasswordUpdate (authUserId, oldPassword, newPassword) {
    const data = getData();
    const user = data.users.find(user => user.id === authUserId)
    if (!user) {
        return { error: "Invalid user id" }
    }
    else if (oldPassword != user.password) {
        return {error: "Old Password is not the correct old password"}
    }
    else if (oldPassword == newPassword) {
        return {error: "Old Password and New Password match exactly"}
    }
    else if (newPassword.length < 8) {
        return {error: "New Password is less than 8 characters"}
    }
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasNumber) {
        return {error: "New Password does not contain at least one number and at least one letter"};
    }

    user.password = newPassword
    return {}; 
}
