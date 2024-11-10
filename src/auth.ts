import validator from 'validator';
import { getData, setData } from './datastore';
import { findToken, generateSessionId, random5DigitNumber } from './helper';
import {
  UserDetails, Token,
  PlayerId,
  GameStage, Chat,
  QuestionInfo,
  Answer,
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
 * @returns {number|object} error if failed, object containing a number if successful
 */
export function adminAuthRegister (email: string, password: string, nameFirst: string,
  nameLast: string): Token {
  const data = getData();

  if (!validator.isEmail(email)) {
    throw new Error('400 invalid email address');
  }

  if (data.users.find(user => user.email === email)) {
    throw new Error('400 email already in use');
  }
  const nameTest = /^[a-zA-Z\s'-]+$/;

  if (!nameTest.test(nameFirst)) {
    throw new Error('400 invalid characters in first name');
  } else if (nameFirst.length < 2 || nameFirst.length > 20) {
    throw new Error('400 vvinvalid first name length');
  }

  if (!nameTest.test(nameLast)) {
    throw new Error('400 invalid characters in last name');
  } else if (nameLast.length < 2 || nameLast.length > 20) {
    throw new Error('400 invalid last name length');
  }

  const passwordTest = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordTest.test(password)) {
    throw new Error('400 invalid password.');
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
export function adminAuthLogin (email: string, password: string): Token {
  const data = getData();

  const user = data.users.find(user => user.email === email);

  if (!user) {
    throw new Error('400 email not found');
  }

  if (user.password !== password) {
    user.numFailedPasswordsSinceLastLogin++;
    setData(data);
    throw new Error('400 wrong password');
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
export function adminUserDetails (token: number): UserDetails {
  const data = getData();

  const user = findToken(data, token);
  if ('error' in user) {
    throw new Error('How did this even happen');
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
  nameFirst: string, nameLast: string): Record<string, never> {
  const data = getData();
  const user = findToken(data, token);
  if ('error' in user) {
    throw new Error('How did this even happen');
  }

  const emailCheck = data.users.find(u => u.email === email);
  if (emailCheck && emailCheck.id !== user.id) {
    throw new Error('Email already in use');
  }
  if (!validator.isEmail(email)) {
    throw new Error('400 invalid email address');
  }
  if (/[^a-zA-Z\s'-]/.test(nameFirst) === true) {
    throw new Error('400 nameFirst invalid characters');
  }
  if (nameFirst.length < 2) {
    throw new Error('400 namefirst is less than two characters');
  }
  if (nameFirst.length > 20) {
    throw new Error('400 nameFirst is more than twenty characters');
  }
  if (/[^a-zA-Z\s'-]/.test(nameLast) === true) {
    throw new Error('400 nameLast invalid characters');
  }
  if (nameLast.length < 2) {
    throw new Error('400 nameLast is less than two characters');
  }
  if (nameLast.length > 20) {
    throw new Error('400 nameLast is more than twenty characters');
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
  newPassword: string): Record<string, never> {
  const data = getData();
  const user = findToken(data, token);
  if ('error' in user) {
    throw new Error('How did this even happen');
  }

  if (oldPassword !== user.password) {
    throw new Error('400 Old Password is not the correct old password');
  } else if (oldPassword === newPassword) {
    throw new Error('400 Old Password and New Password match exactly');
  } else if (newPassword.length < 8) {
    throw new Error('400 New Password is less than 8 characters');
  }
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  if (!hasLetter || !hasNumber) {
    throw new Error('400 New Password does not contain numbers and letters');
  }

  const prevSearch = user.prevPasswords.find(prevPasswords => prevPasswords === newPassword);
  if (prevSearch) {
    throw new Error('password has been used before');
  }

  user.password = newPassword;
  user.prevPasswords.push(oldPassword);
  setData(data);
  return {};
}

/**
 * Logs out an admin user who has an active user session.
 * removed the error check since the validator means its
 * always going to be a valid token.
 *
 * @param {number} token - The token for the current user session.
 * @returns {object} error if token is invalid, empty object if successful
 */
export function adminAuthLogout (token: number): Record<string, never> {
  const data = getData();

  const sessionIndex = data.sessions.findIndex(session => session.sessionId === token);

  data.sessions.splice(sessionIndex, 1);
  setData(data);

  return {};
}

/**
 * Send a new chat message to everyone in the session.
 *
 * @param {number} playerId - The playerId for the current user session.
 * @param {string} message - The message string that is sent to the chat.
 * @returns {object} error if message is inccorect length, player ID doesn't exist,
 * or empty object if successful
 */
export function playerSendChat (playerId: number, message: string): Record<string, never> {
  const data = getData();
  const player = data.players.find((p) => p.playerId === playerId);
  if (!player) {
    throw new Error('400 Player Id not found');
  }

  const name = player.playerName;

  if (message.length < 1 || message.length > 100) {
    throw new Error('400 message length invalid (<1 or >100 characters)');
  }

  const quizSession = data.quizSession.find(
    (session) => session.players.some((p) => p.playerId === playerId)
  );

  if (!quizSession) {
    throw new Error('400 Player not in any active session');
  }

  let chatSession = data.chat.find((chat) => chat.sessionId === quizSession.quizSessionId);
  if (!chatSession) {
    chatSession = {
      sessionId: quizSession.quizSessionId,
      messages: []
    };
    data.chat.push(chatSession);
  }

  const newMessage: Chat = {
    playerId: playerId,
    message: message,
    playerName: name,
    timeSent: Math.floor(Date.now() / 1000)
  };

  chatSession.messages.push(newMessage);

  data.chat.push(chatSession);

  setData(data);
  return {};
}

export function playerJoin (sessionId: number, playerName: string): PlayerId {
  const data = getData();

  const nameTest = /^[a-zA-Z\s'-]+$/;

  if (!nameTest.test(playerName)) {
    throw new Error('Invalid characters in first name');
  }

  const sessionQuiz = data.quizSession.find(q => q.quizSessionId === sessionId);
  if (!sessionQuiz) {
    throw new Error('Quiz session not found');
  }

  if (sessionQuiz.players.find(p => p.playerName === playerName)) {
    throw new Error('Player name is already in use');
  }

  if (sessionQuiz.state !== GameStage.LOBBY) {
    throw new Error('The session is not in the lobby state.');
  }

  const playerId = random5DigitNumber();
  const newPlayer = {
    playerId: playerId,
    playerName: playerName,
    score: 0,
    numQuestions: 0,
    atQuestion: 0,
    quizsessionId: sessionId
  };
  sessionQuiz.players.push(newPlayer);
  data.players.push(newPlayer);
  setData(data);

  return { playerId: playerId };
}

export function AnswerQuestion (playerId: number, questionPosition: number, answerIds: number[]):
Record<string, never> {
  const data = getData();

  const player = data.players.find(p => p.playerId === playerId);
  if (!player) {
    throw new Error('Player not found');
  }

  const session = data.quizSession.find(q => q.quizSessionId === player.quizsessionId);
  if (!session) {
    throw new Error('this player is somehow not in a quiz');
  }
  if (session.state !== GameStage.QUESTION_OPEN) {
    throw new Error('this player is somehow not in a quiz');
  }
  const quiz = session.quiz;
  if (questionPosition < 0 || questionPosition > quiz.questions.length + 1) {
    throw new Error('Invalid position for questionPosition.');
  }

  const uniqueAnswers = new Set(answerIds);
  if (uniqueAnswers.size !== answerIds.length) {
    throw new Error('Duplicate answers are not allowed.');
  }

  const findquestion = quiz.questions[questionPosition - 1];
  answerIds.forEach(answerId => {
    const answer = findquestion.answerOptions.find(a => a.answerId === answerId);
    if (!answer) {
      throw new Error(`Answer with ID ${answerId} not found in the answer options.`);
    }
    const seshResults = session.questionResults;
    if (answer.correct === true) {
      player.score += findquestion.points;
      seshResults[questionPosition - 1].playersCorrect.push(player.playerName);
      // increment average answer name
      seshResults[questionPosition - 1].numRight += 1;
    } else {
      seshResults[questionPosition - 1].numWrong += 1;
    }
    const correct = seshResults[questionPosition - 1].numRight;
    const incorrect = seshResults[questionPosition - 1].numWrong;
    seshResults[questionPosition - 1].percentCorrect = correct / incorrect * 100;
    setData(data);
  });
  return {};
}

/**
 * Retrieves the status of a player based on their ID
 * @param {number} playerId - The ID number of the player
 * @returns {state, numQuestions, atQuestion}
 * - information about the session and where the player is at
 */
export function playerStatus(playerId: number):
{ state: GameStage, numQuestions: number, atQuestion: number } {
  const data = getData();
  const sessionQuiz = data.quizSession.find(s => s.players.find(p => p.playerId === playerId));
  if (!sessionQuiz) {
    throw new Error('400: player Id not found');
  }
  const player = sessionQuiz.players.find(p => p.playerId === playerId);
  return {
    state: sessionQuiz.state,
    numQuestions: player.numQuestions,
    atQuestion: player.atQuestion
  };
}

/**
 * Gets information about the question for the player
 * @param {number} playerId - The ID number of the player
 * @param {number} questionPosition - The position of the question the player is at
 * @returns {QuestionInfo} - the question information, errorObject if failed
 */
export function playerQuestionInfo(playerId:number,
  questionPosition:number): QuestionInfo {
  const data = getData();
  const session = data.quizSession.find((s) => s.players.find((p) => p.playerId === playerId));
  if (!session) {
    throw new Error('400: Player ID does not exist');
  }

  const player = session.players.find(p => p.playerId === playerId);
  const question = session.quiz.questions[questionPosition - 1];

  if (!question) {
    throw new Error('400: Question position is not valid for the session this player is in');
  }

  if (player.atQuestion !== questionPosition) {
    throw new Error('400: Session not currently on this question');
  }

  if (
    session.state === GameStage.LOBBY ||
    session.state === GameStage.QUESTION_COUNTDOWN ||
    session.state === GameStage.FINAL_RESULTS ||
    session.state === GameStage.END
  ) {
    throw new Error('400: Cannot get question in the current session state');
  }

  const answers = question.answerOptions.map((answer: Answer) => ({
    answerId: answer.answerId,
    answer: answer.answer,
    colour: answer.colour
  }));

  return {
    questionId: question.questionId,
    question: question.question,
    timeLimit: question.timeLimit,
    points: question.points,
    answerOptions: answers
  };
}
