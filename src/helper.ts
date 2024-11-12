import { getData, setData } from './datastore';
import { DataStore, errorObject, GameStage, User } from './interfaces';

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

// note that theoretically i don't need to have this be able to verify errors
// since checkvalid already does this to an extent
export function findToken (data: DataStore, token: number): User | errorObject {
  const session = data.sessions.find(session => session.sessionId === token);
  if (!session) {
    throw new Error('Session not found/invalid');
  }

  const user = data.users.find(user => user.id === session.authUserId);
  if (!user) {
    throw new Error('User not found/invalid');
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
    throw new Error('Quiz does not found');
  }

  const linkedUser = findToken(data, token);
  if ('error' in linkedUser) {
    throw new Error('Token should be valid here');
  }

  if (linkedUser.id !== quiz.creatorId) {
    throw new Error('You are not the creator of the quizId provided');
  }

  return {};
}

export function checkQuizExistOwner (token: number, quizId: number): Record<string, never> {
  const data = getData();
  if (isNaN(quizId)) {
    throw new Error('quizId is invalid');
  }

  const linkedUser = findToken(data, token);
  if ('error' in linkedUser) {
    throw new Error('Token should be valid here');
  }

  const quiz = data.quizzes.find(q => q.quizId === quizId);
  const quizBin = data.bin.find(q => q.quizId === quizId);
  if (!quiz && !quizBin) {
    throw new Error('Quiz does not exist');
  } else if (quiz && quizBin) {
    if (linkedUser.id !== quiz.creatorId && linkedUser.id !== quiz.creatorId) {
      throw new Error('You are not the creator of the quizId provided');
    }
  } else if (quiz) {
    if (linkedUser.id !== quiz.creatorId) {
      throw new Error('You are not the creator of the quizId provided');
    }
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

export function getAnswerId(questionId: number): number[] {
  const data = getData();

  // Find the quiz containing the question with the given questionId
  const quizWithQuestion = data.quizzes.find(quiz =>
    quiz.questions.some(question => question.questionId === questionId)
  );

  if (!quizWithQuestion) {
    throw new Error('Question not found in any quiz');
  }

  // Find the specific question in the quiz
  const question = quizWithQuestion.questions.find(q => q.questionId === questionId);
  if (!question) {
    throw new Error('Question not found');
  }

  // Map through answerOptions to get answerIds
  const answerIds = question.answerOptions
    .filter(option => option.answerId !== undefined) // Ensure answerId exists
    .map(option => option.answerId as number); // Cast to number

  return answerIds;
}

export function setOpen(sessionId: number): Record<string, never> {
  const data = getData();
  const session = data.quizSession.find(s => s.quizSessionId === sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  session.state = GameStage.QUESTION_OPEN;

  setData(data);

  return {};
}

export function setLobby(sessionId: number): Record<string, never> {
  const data = getData();

  const session = data.quizSession.find(s => s.quizSessionId === sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  session.state = GameStage.LOBBY;

  setData(data);

  return {};
}

export function setAnswerShow(sessionId: number): Record<string, never> {
  const data = getData();

  const session = data.quizSession.find(s => s.quizSessionId === sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  session.state = GameStage.ANSWER_SHOW;

  setData(data);

  return {};
}


