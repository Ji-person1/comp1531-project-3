import validator from 'validator';
import { getData, setData } from './datastore';
import { findToken, generateSessionId } from './helper';
import {
  UserDetails, errorObject, Token,
} from './interfaces';

/**
 * Creates a new user when given the email, first name, last name and password
 * validates the passed in variables
 * returns an error object if any validation fails.
 *
 * @param {string} email - The email address of a user.
 * @param {string} password - The password for the account.
 * @param {string} nameFirst - first name of the user.
 * @param {string} nameLast - the last name of the user
 * @returns {objectbject} error object if failed, token object otherwise.
 */
export function adminAuthRegister (email: string, password: string, nameFirst: string,
  nameLast: string): errorObject | Token {
  const data = getData();

  if (!validator.isEmail(email)) {
    return { error: '400 invalid email address' };
  }

  if (data.users.find(user => user.email === email)) {
    return { error: '400 email already in use' };
  }
  const nameTest = /^[a-zA-Z\s'-]+$/;

  if (!nameTest.test(nameFirst)) {
    return { error: '400 invalid characters in first name' };
  } else if (nameFirst.length < 2 || nameFirst.length > 20) {
    return { error: '400 invalid first name length' };
  }

  if (!nameTest.test(nameLast)) {
    return { error: '400 invalid characters in last name' };
  } else if (nameLast.length < 2 || nameLast.length > 20) {
    return { error: '400 invalid last name length' };
  }

  const passwordTest = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordTest.test(password)) {
    return { error: '400 invalid password.' };
  }
  const authUserId = data.users.length > 0 ? data.users[data.users.length - 1].id + 1 : 1;
  const emptyPasswordArray: string[] = [];

  const newUser = {
    id: authUserId,
    email: email,
    nameFirst: nameFirst,
    nameLast: nameLast,
    password: password,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    prevPasswords: emptyPasswordArray
  };

  const sessionId = generateSessionId();
  const newSession = {
    sessionId: sessionId,
    authUserId: authUserId,
    createdAt: Math.floor(Date.now() / 1000)
  };

  data.sessions.push(newSession);
  data.users.push(newUser);
  setData(data);
  return { token: sessionId.toString() };
}

/**
 * given the password and email of the user, returns the userId
 * if the two do not match, returns an error object
 *
 * @param {string} email - The email address of a user.
 * @param {string} password - The password for the account.
 * @returns {object} error if failed, object containing a number number if successful
 */
export function adminAuthLogin (email: string, password: string): Token | errorObject {
  const data = getData();

  const user = data.users.find(user => user.email === email);

  if (!user) {
    return { error: '400 email not found' };
  }

  if (user.password !== password) {
    user.numFailedPasswordsSinceLastLogin++;
    setData(data);
    return { error: '400 wrong password' };
  }

  user.numSuccessfulLogins++;
  user.numFailedPasswordsSinceLastLogin = 0;
  const sessionId = generateSessionId();
  const newSession = {
    sessionId: sessionId,
    authUserId: user.id,
    createdAt: Math.floor(Date.now() / 1000)
  };

  data.sessions.push(newSession);
  setData(data);
  return { token: sessionId.toString() };
}

/**
 * finds details on an account based on the userid passed in
 * returns error if the account cannot be found.
 *
 * @param {string} token - a token used to find the linked account.
 * @returns {object} error if failed, the details of the account otherwise
 */
export function adminUserDetails (token: number): errorObject | UserDetails {
  const data = getData();

  const user = findToken(data, token);
  if ('error' in user) {
    return user;
  }

  return {
    user: {
      userId: user.id,
      name: user.nameFirst + ' ' + user.nameLast,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
    }
  };
}

/**
 * updates the details, when provided with them. Changing the email
 * first name and last name of the user.
 *
 * @param {string} token - a token used to find the linked account.
 * @param {string} email - The new email address of a user.
 * @param {string} nameFirst - the new first name of the user.
 * @param {string} nameLast - the new last name of the user
 * @returns {object} error if failed, empty object if successful
 */
export function adminUserDetailsUpdate (token: number, email: string,
  nameFirst: string, nameLast: string): errorObject | Record<string, never> {
  const data = getData();
  const user = findToken(data, token);
  if ('error' in user) {
    return user;
  }

  if (user.email === email) {
    return { error: '400 email already in use' };
  }
  if (!validator.isEmail(email)) {
    return { error: '400 invalid email address' };
  }
  if (/[^a-zA-Z\s'-]/.test(nameFirst) === true) {
    return { error: '400 nameFirst invalid characters' };
  }
  if (nameFirst.length < 2) {
    return { error: '400 namefirst is less than two characters' };
  }
  if (nameFirst.length > 20) {
    return { error: '400 nameFirst is more than twenty characters' };
  }
  if (/[^a-zA-Z\s'-]/.test(nameLast) === true) {
    return { error: '400 nameLast invalid characters' };
  }
  if (nameLast.length < 2) {
    return { error: '400 nameLast is less than two characters' };
  }
  if (nameLast.length > 20) {
    return { error: '400 nameLast is more than twenty characters' };
  }

  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;
  setData(data);
  return {};
}

/**
 * updates the password of a user to a new password, if given the user id and
 * former password of the user to a new password passed in.
 *
 * @param {string} token - a token used to find the linked account.
 * @param {string} oldPassword - The former password for the account.
 * @param {string} newPassword - The new password for the account.
 * @returns {object} error if failed, empty object if successful
 */
export function adminUserPasswordUpdate (token: number, oldPassword: string,
  newPassword: string): errorObject | Record<string, never> {
  const data = getData();
  const user = findToken(data, token);
  if ('error' in user) {
    return user;
  }

  if (oldPassword !== user.password) {
    return { error: '400 Old Password is not the correct old password' };
  } else if (oldPassword === newPassword) {
    return { error: '400 Old Password and New Password match exactly' };
  } else if (newPassword.length < 8) {
    return { error: '400 New Password is less than 8 characters' };
  }
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  if (!hasLetter || !hasNumber) {
    return { error: '400 New Password does not contain numbers and letters' };
  }

  const prevSearch = user.prevPasswords.find(prevPasswords => prevPasswords === newPassword);
  if (prevSearch) {
    return { error: 'password has been used before' };
  }

  user.password = newPassword;
  user.prevPasswords.push(oldPassword);
  setData(data);
  return {};
}

/**
 * Logs out an admin user who has an active user session.
 *
 * @param {number} token - The token for the current user session.
 * @returns {object} error if token is invalid, empty object if successful
 */
export function adminAuthLogout (token: number): errorObject | Record<string, never> {
  const data = getData();

  const sessionIndex = data.sessions.findIndex(session => session.sessionId === token);

  if (sessionIndex === -1) {
    return { error: '401 invalid token' };
  }

  data.sessions.splice(sessionIndex, 1);

  setData(data);

  return {};
}
