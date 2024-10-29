import { getData } from './datastore';
import { DataStore, errorObject, User } from './interfaces';

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

export function random5DigitNumber(): number {
  return Math.floor(10000 + Math.random() * 90000);
}

export function randomColour (): string {
  const colours = ['red', 'orange', 'yellow', 'blue', 'green', 'purple', 'brown'];

  const randomIndex = Math.floor(Math.random() * colours.length);
  return colours[randomIndex];
}

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
