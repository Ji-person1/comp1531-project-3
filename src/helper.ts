import { getData } from './datastore';
import { DataStore, errorObject, User } from './interfaces';

// A helper function for generating a session id
export function generateSessionId(): number {
  const data = getData();

  let sessionId = random5DigitNumber();
  if (!data.sessions) {
    return random5DigitNumber();
  }
  while (data.sessions.some(session => session.sessionId === sessionId)) {
    sessionId = random5DigitNumber();
  }

  return sessionId;
}

// A helper function for generating a userId
export function generateUserId(): number {
  const data = getData();

  let randomId = random5DigitNumber();
  if (!data.sessions) {
    return random5DigitNumber();
  }
  while (data.users.some(user => user.id === randomId)) {
    randomId = random5DigitNumber();
  }

  return randomId;
}

// A helper function for generating a quiz id
export function generateQuizId(): number {
  const data = getData();

  let randomId = random5DigitNumber();
  if (!data.quizzes) {
    return random5DigitNumber();
  }
  while (data.quizzes.some(quiz => quiz.quizId === randomId)) {
    randomId = random5DigitNumber();
  }

  return randomId;
}

// Generates a random five digit number
export function random5DigitNumber(): number {
  return Math.floor(10000 + Math.random() * 90000);
}

// Randomly picks a colour from a possible seven of them
export function randomColour (): string {
  const colours = ['red', 'orange', 'yellow', 'blue', 'green', 'purple', 'brown'];

  const randomIndex = Math.floor(Math.random() * colours.length);
  return colours[randomIndex];
}

// When given the datastore, can find a token, since most functions need
// the datastore for other reasons, getting the data should be handled on their
// end
export function findToken (data: DataStore, token: number): User | errorObject {
  const session = data.sessions.find(session => session.sessionId === token);
  if (!session) {
    return { error: '401 invalid session' };
  }

  const user = data.users.find(user => user.id === session.authUserId);
  if (!user) {
    return { error: '401 token is not linked to a user' };
  }
  return user;
}
