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

export function checkValidToken (token: number): Record<string, never> {
  const data = getData();
  if (isNaN(token)) {
    throw new Error('Token is invalid');
  }
  const session = data.sessions.find(session => session.sessionId === token);
  if (!session) {
    throw new Error('Token not found');
  }

  const user = data.users.find(user => user.id === session.authUserId);
  if (!user) {
    throw new Error('Token is invalid');
  }
  return {};
}

export function checkQuizOwnership (token: number, quizId: number): Record<string, never> {
  const data = getData();
  if (isNaN(quizId)) {
    throw new Error('quizId is invalid');
  }
  const quiz = data.quizzes.find(q => q.quizId === quizId);
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  const linkedUser = findToken(data, token);
  if ('error' in linkedUser) {
    throw new Error('Token invalid');
  }

  if (linkedUser.id !== quiz.creatorId) {
    throw new Error('You are not the creator of the quizId provided');
  }

  return {};
}

export function checkBinOwnership (token: number, quizId: number): Record<string, never> {
  const data = getData();
  const linkedUser = findToken(data, token);
  if ('error' in linkedUser) {
    throw new Error('Token invalid');
  }
  const quiz = data.quizzes.find(q => q.quizId === quizId);
  const binQuiz = data.bin.find(b => b.creatorId === linkedUser.id);
  if (!binQuiz && quiz) {
    return {};
  } else if (!binQuiz) {
    throw new Error('User does not own the quiz in the bin');
  }

  return {};
}

export function checkQuizArray (token: number, quizIds: number[]): Record<string, never> {
  const data = getData();

  const linkedUser = findToken(data, token);
  if ('error' in linkedUser) {
    throw new Error('Token should not be invalid at this stage');
  }

  for (const quizId of quizIds) {
    const quiz = data.quizzes.find(q => q.quizId === quizId);
    if (!quiz) {
      throw new Error('Quizid should not be invalid at this stage');
    }

    if (linkedUser.id !== quiz.creatorId) {
      throw new Error(`You are not the creator of the quiz with quizId ${quizId}`);
    }
  }

  return {};
}
