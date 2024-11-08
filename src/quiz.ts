import { getData, setData } from './datastore';
import { findToken, random5DigitNumber, randomColour } from './helper';
import {
  quizDetails, QuestionId, Questions, Answer,
  quizList, QuizId, DuplicatedId,
  GameStage,
  QuizSession,
  quizSessionId, SessionInfo, SessionsResponse
} from './interfaces';

/**
 * Update the description of the relevant quiz.
 *
 * @param {string} token - a number used to find the linked account.
 * @param {number} quizId - the id of the quiz being updated
 * @param {string} description - the new description of the quiz
 * @returns {number|object} error if failed, empty if successful
 */
export function adminQuizDescriptionUpdate (token: number, quizId: number,
  description: string): Record<string, never> {
  const data = getData();

  const user = findToken(data, token);
  if ('error' in user) {
    throw new Error('How');
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    throw new Error('no quiz provided');
  }
  if (quiz.creatorId !== user.id) {
    throw new Error('Quiz ID does not refer to a quiz that this user owns');
  }
  if (description.length > 100) {
    throw new Error('400 decscription is too long');
  }

  quiz.description = description;
  setData(data);
  return {};
}

/**
 * Updates the name of a quiz when given the correct authUserId, quizId and name
 *
 * @param {string} token - a number used to find the linked account.
 * @param {string} quizId - The id of the quiz.
 * @param {string} name - the name of the quiz.
 * @returns {object} error if failed, empty if successful.
 */
export function adminQuizNameUpdate (token: number, quizId: number,
  name: string): Record<string, never> {
  const data = getData();

  const session = data.sessions.find(session => session.sessionId === token);
  if (!session) {
    throw new Error('How');
  }

  const user = data.users.find(user => user.id === session.authUserId);
  if (!user) {
    throw new Error('How');
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    throw new Error('How');
  }

  if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
    throw new Error('Name contains invalid characters..');
  }
  if (name.length < 3 || name.length > 30) {
    throw new Error('Name is either less than 3 characters or more than 30 characters.');
  }
  if (data.quizzes.find(quiz => quiz.creatorId === user.id && quiz.name === name)) {
    throw new Error('Name is already used by the current logged in user for another quiz.');
  }
  quiz.name = name;
  setData(data);
  return {};
}

/**
 * Get all of the relevant information about the current quiz. Returning an error if
 * either adminauthuserid doesn't work or quizid
 *
 * @param {string} token - a number used to find the linked account.
 * @param {string} quizId - The password for the account.
 * @returns {number|object} error if failed, number if successful
 */
export function adminQuizInfo(token: number, quizId: number): quizDetails {
  const data = getData();

  const user = findToken(data, token);
  if ('error' in user) {
    throw new Error('Token not found');
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  if (quiz.creatorId !== user.id) {
    throw new Error('User does not own quiz');
  }

  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions
  };
}

/**
 * Provides a list of all quizzes that are owned by the currently logged in user.
 *
 * @param {string} token - a number used to find the linked account.
 * @param {string} quizId - The password for the account.
 * @returns {number|object} error if failed, number if successful
 */
export function adminQuizList(token : number): quizList {
  const data = getData();

  const user = findToken(data, token);
  if ('error' in user) {
    throw new Error('how did this happen');
  }

  const userQuizzes = data.quizzes.filter(quiz => quiz.creatorId === user.id);
  return {
    quizzes: userQuizzes.map(quiz => ({
      quizId: quiz.quizId,
      name: quiz.name
    }))
  };
}

/**
 * Given basic details about a new quiz, create one for the logged in user.
 *
 * @param {string} token - a number used to find the linked account.
 * @param {string} name - The name of the new quiz.
 * @param {string} description - The description of the new quiz.
 * @returns {object} error object if failed, object containing a number if successful
 */
export function adminQuizCreate(token: number, name: string,
  description: string): QuizId {
  const data = getData();

  const user = findToken(data, token);
  if ('error' in user) {
    throw new Error('How did this happen?');
  }

  if (name.length < 3 || name.length > 30 || !/^[a-zA-Z0-9 ]+$/.test(name)) {
    throw new Error('Invalid quiz name');
  }
  if (description.length > 100) {
    throw new Error('Description too long');
  }
  if (data.quizzes.some(quiz => quiz.creatorId === user.id && quiz.name === name)) {
    throw new Error('Quiz name already used by this user');
  }

  const newQuizId = random5DigitNumber();
  const emptyQuestionArray: Questions[] = [];
  const newQuiz = {
    quizId: newQuizId,
    creatorId: user.id,
    name,
    description,
    timeCreated: Math.floor(Date.now() / 1000),
    timeLastEdited: Math.floor(Date.now() / 1000),
    numQuestions: 0,
    questions: emptyQuestionArray
  };

  data.quizzes.push(newQuiz);
  setData(data);
  return { quizId: newQuizId };
}

/**
 * Given a particular quiz, move the quiz into trash
 *
 * @param {string} token - a number used to find the linked account.
 * @param {number} quizId - The name of the new quiz.
 * @returns {object} error object if failed, object containing a number if successful
 */
export function adminQuizRemove(token: number,
  quizId: number): Record<string, never> {
  const data = getData();

  const user = findToken(data, token);
  if ('error' in user) {
    throw new Error('how did this even happen');
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    throw new Error('400 quiz not found');
  }
  if (quiz.creatorId !== user.id) {
    throw new Error('400 current user is not the owner of the quiz');
  }

  data.bin.push(quiz);
  data.quizzes = data.quizzes.filter(quiz => quiz.quizId !== quizId);
  setData(data);
  return {};
}

/**
 * Transfer ownership of a quiz to another user based on their email.
 *
 * @param {number} quizId - The ID of the quiz to be transferred.
 * @param {string} token - a number used to find the linked account.
 * @param {string} userEmail - userEmail.
 * @returns {object} An empty object if successful, or an error object if unsuccessful.
 */
export function adminQuizTransfer(token: number, quizId: number,
  userEmail: string): Record<string, never> {
  const data = getData();

  const session = data.sessions.find(session => session.sessionId === token);
  if (!session) {
    throw new Error('How');
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz || quiz.creatorId !== session.authUserId) {
    throw new Error('Quiz not found.');
  }

  const targetUser = data.users.find(user => user.email === userEmail);
  if (!targetUser) {
    throw new Error('400: UserEmail is not a real user');
  }
  if (targetUser.id === session.authUserId) {
    throw new Error('400: UserEmail is the current logged in user');
  }

  if (data.quizzes.some(existingQuiz => existingQuiz.creatorId === targetUser.id &&
    existingQuiz.name === quiz.name)) {
    throw new Error('400: target already has quiz of the same name');
  }

  quiz.creatorId = targetUser.id;
  setData(data);

  return {};
}

/**
 * Creates a new question for a quiz.
 *
 * @param {number} token - The session token of the current user.
 * @param {number} quizId - The ID of the quiz to add the question to
 * @param {string} question - The question text
 * @param {number} duration - The time limit for the question in seconds
 * @param {number} points - The points that the queston is worth
 * @param {Answer[]} answers - An array of answers
 * @returns {object} object with new questionId if successful or error object if unsuccessful
 */
export function adminQuizCreateQuestion(token: number, quizId: number, question: string,
  duration: number, points: number, answers: Answer[]): QuestionId {
  const data = getData();

  const session = data.sessions.find(session => session.sessionId === token);
  if (!session) {
    throw new Error('how');
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz || quiz.creatorId !== session.authUserId) {
    throw new Error('how');
  }

  if (!question) {
    throw new Error('400: Question is invalid');
  } else if (question.length < 5 || question.length > 50) {
    throw new Error('Question string is less than length 5 or greater length 50');
  }

  if (!answers) {
    throw new Error('Question is invalid');
  } else if (answers.length < 2 || answers.length > 6) {
    throw new Error('The question has less than 2 answers or more than 6 answers');
  }

  if (duration <= 0) {
    throw new Error('The question time limit is not positive');
  }

  const totalDuration = quiz.questions.reduce((sum, question) => sum + question.timeLimit, 0) +
    duration;
  if (totalDuration > 180) {
    throw new Error('The quiz is longer than 3 minutes');
  }

  if (points < 1 || points > 10) {
    throw new Error('The points awarded for the question are less than 1 or greater than 10');
  }

  if (answers.some(answer => answer.answer.length < 1 || answer.answer.length > 30)) {
    throw new Error('The length of an answer is invalid');
  }

  if (answers.length !== new Set(answers.map(answer => answer.answer)).size) {
    throw new Error('Answer strings are duplicates of one another');
  }

  if (!answers.some(answer => answer.correct)) {
    throw new Error('There are no correct answers');
  }

  const colouredAnswers = answers.map((answer:Answer): Answer => ({
    ...answer,
    colour: randomColour(),
    answerId: random5DigitNumber()
  }));

  const randomQuestionId = Math.floor(10000 + Math.random() * 90000);
  const newQuestion: Questions = {
    questionId: randomQuestionId,
    question,
    timeLimit: duration,
    points,
    answerOptions: colouredAnswers
  };

  quiz.numQuestions++;
  quiz.questions.push(newQuestion);
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  setData(data);

  return { questionId: randomQuestionId };
}

/**
 * Updates the details of a particular question within a quiz.
 *
 * @param {number} token - The session token of the current user.
 * @param {number} quizId - The ID of the quiz containing the question.
 * @param {number} questionId - The ID of the question to be updated.
 * @param {string} question - The new question text.
 * @param {number} duration - The new time limit for the question in seconds.
 * @param {number} points - The new points awarded for the question.
 * @param {Answer[]} answers - An array of new answer options.
 * @returns {object} An empty object if successful, or an error object if unsuccessful.
 */

export function adminQuizUpdateQuestion(token: number, quizId: number, questionId: number,
  question: string, duration: number, points: number, answers: Answer[]
): Record<string, never> {
  const data = getData();

  const session = data.sessions.find(session => session.sessionId === token);
  if (!session) {
    throw new Error('Token is invalid or empty');
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz || quiz.creatorId !== session.authUserId) {
    throw new Error('Token is valid, but quizId is not owned or invalid');
  }

  if (question.length < 5 || question.length > 50) {
    throw new Error('Question is less than length 5 or greater than length 50');
  }

  if (answers.length < 2 || answers.length > 6) {
    throw new Error('The question has more than 6 answers or less than 2 answers');
  }

  if (duration <= 0) {
    throw new Error('The question timeLimit is not positive');
  }

  const totalDuration = quiz.questions.reduce((sum, question) => sum + question.timeLimit, 0) +
    duration;
  if (totalDuration > 180) {
    throw new Error('The quiz is longer than 3 minutes');
  }

  if (points < 1 || points > 10) {
    throw new Error('The points awarded for the question are less than 1 or greater than 10');
  }

  if (answers.some(answer => answer.answer.length < 1 || answer.answer.length > 30)) {
    throw new Error('The length of an answer is invalid');
  }

  if (answers.length !== new Set(answers.map(answer => answer.answer)).size) {
    throw new Error(' Any two answers are the same (within the same question)');
  }

  if (!answers.some(answer => answer.correct)) {
    throw new Error(' There are no correct answers');
  }

  const questionIndex = quiz.questions.findIndex(q => q.questionId === questionId);
  if (questionIndex === -1) {
    throw new Error('questionId not found/invalid');
  }

  const colouredAnswers = answers.map((answer:Answer): Answer => ({
    ...answer,
    colour: randomColour(),
    answerId: random5DigitNumber()
  }));

  quiz.questions[questionIndex] = {
    questionId,
    question,
    timeLimit: duration,
    points,
    answerOptions: colouredAnswers
  };

  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);

  return {};
}

/**
 * move a given question to another place
 * the moving should happen in the same quiz
 *
 * @param {number} token - The session token of the current user.
 * @param {number} quizId - The ID of the quiz containing the question.
 * @param {number} questionId - The ID of the question to be updated.
 * @returns {errorObject|object} error if failed, empty object if successful
 */
export function adminQuestionMove (token: number, quizid: number, questionId: number,
  newPosition: number): Record<string, never> {
  const data = getData();
  const user = findToken(data, token);
  if ('error' in user) {
    throw new Error('user not found/quizId is invalid');
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizid);
  if (!quiz) {
    throw new Error('quiz not found/quizId is invalid');
  } else if (quiz.creatorId !== user.id) {
    throw new Error('user token provided is not the owner of the quiz');
  }

  const question = quiz.questions.find(question => question.questionId === questionId);
  if (!question) {
    throw new Error('question not found/questionId is invalid');
  }

  if (newPosition < 0) {
    throw new Error('newposition cannot be less than 0');
  } else if (newPosition > quiz.numQuestions - 1) {
    throw new Error('newposition cannot be greater than the number of questions');
  }
  const nowIndex = quiz.questions.findIndex(q => q.questionId === questionId);
  if (nowIndex === newPosition) {
    throw new Error('new index is identical to previous position');
  }
  quiz.questions = quiz.questions.filter(question => question.questionId !== questionId);
  quiz.questions.splice(newPosition, 0, question);
  setData(data);
  return {};
}

/**
 * copy a question, and add the copy to the positon after the question.
 *
 * @param {number} token - The session token of the current user.
 * @param {number} quizId - The ID of the quiz containing the question.
 * @param {number} questionId - The ID of the question to be updated.
 * @returns {errorObject|object} error if failed, an id if successful
 */
export function adminQuestionDuplicate (token: number, quizid: number,
  questionId: number): DuplicatedId {
  const data = getData();
  const user = findToken(data, token);
  if ('error' in user) {
    throw new Error('401 placeholder');
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizid);
  if (!quiz) {
    throw new Error('403 quiz not found/quizId is invalid');
  } else if (quiz.creatorId !== user.id) {
    throw new Error('403 user token provided is not the owner of the quiz');
  }

  const question = quiz.questions.find(quiz => quiz.questionId === questionId);
  if (!question) {
    throw new Error('400 question not found/questionId is invalid');
  }

  const newIndex = quiz.questions.findIndex(question => question.questionId === questionId) + 1;

  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  quiz.numQuestions += 1;

  setData(data);
  quiz.questions.splice(newIndex, 0, question);
  setData(data);
  return { duplicatedQuestionId: question.questionId };
}

/**
 * remove the question that given in a given quiz.
 *
 * @param {string} token - a number used to find the linked account.
 * @param {number} quizId - the id of the quiz being deleted
 * @param {number} questionId - the question id being deleted
 * @returns {Object} error if failed, empty if successful
 */

export function quizQuestionDelete (token: number, quizId: number, questionId: number):
   Record<string, never> {
  const data = getData();

  const session = data.sessions.find(session => session.sessionId === token);
  if (!session) {
    throw new Error('quiz not found/quizId is invalid');
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    throw new Error('quiz not found/quizId is invalid');
  }
  if (quiz.creatorId !== session.authUserId) {
    throw new Error('quiz not found/quizId is invalid');
  }

  const question = quiz.questions.find(question => question.questionId === questionId);
  if (!question) {
    throw new Error('quiz not found/quizId is invalid');
  }

  const questionIndex = quiz.questions.indexOf(question);

  quiz.questions.splice(questionIndex, 1);
  quiz.numQuestions--;

  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);
  return {};
}

/**
 * Permanently delete specific quizzes that are currently sitting in the trash.
 *
 * @param {number} token - The session token of the user.
 * @param {number[]} quizIds - An array of quiz IDs to be deleted.
 * @returns {errorObject|{}} - An error object if failed, or an empty object if successful.
 */
export function adminQuizTrashEmpty(token: number, quizIds: number[]):
   Record<string, never> {
  const data = getData();

  const user = findToken(data, token);
  if ('error' in user) {
    throw new Error('how');
  }

  for (const quizId of quizIds) {
    const quiz = data.bin.find(quiz => quiz.quizId === quizId);

    if (!quiz) {
      throw new Error('400 one or more Quiz IDs is not currently in the trash');
    }

    if (quiz.creatorId !== user.id) {
      throw new Error('how');
    }

    data.bin = data.bin.filter(quiz => quiz.quizId !== quizId);
  }

  setData(data);

  return {};
}

/**
 * view a list of all of the quizzes currently inside of trash
 *
 * @param {number} token - The session token of the user.
 * @returns {Object} - An error object if failed, or an empty object if successful.
 */
export function adminQuizTrashView(token: number): quizList {
  const data = getData();

  const user = findToken(data, token);
  if ('error' in user) {
    throw new Error('Token not found');
  }

  const trashedQuizzes = data.bin.filter(quiz => quiz.creatorId === user.id);

  return {
    quizzes: trashedQuizzes.map(quiz => ({
      quizId: quiz.quizId,
      name: quiz.name
    }))
  };
}

/**
 * restores a quiz from the bin
 *
 * @param {number} token - The session token of the user.
 * @param {number} quizId - The session token of the user.
 * @returns {Object} - An error object if failed, or an empty object if successful.
 */
export function adminQuizRestore(token: number, quizId: number):
   Record<string, never> {
  const data = getData();

  const user = findToken(data, token);
  if ('error' in user) {
    throw new Error('How');
  }

  const restoreQuiz = data.bin.find(quiz => quiz.quizId === quizId);
  if (!restoreQuiz) {
    throw new Error('400 quizId does not refer to a valid quiz');
  }
  const searchQuiz = data.quizzes.find(quiz => quiz.name === restoreQuiz.name);
  if (searchQuiz && searchQuiz.creatorId === user.id) {
    throw new Error('400 user currently has a quiz of the same name');
  }

  if (user.id !== restoreQuiz.creatorId) {
    throw new Error('How');
  }

  restoreQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  data.quizzes.push(restoreQuiz);
  data.bin = data.bin.filter(quiz => quiz.quizId !== quizId);
  setData(data);

  return {};
}

/**
 * Updates the name of a quiz when given the correct authUserId, quizId and name
 *
 * @param {string} token - a number used to find the linked account.
 * @param {string} quizId - The id of the quiz.
 * @param {string} name - the name of the quiz.
 * @returns {object} error if failed, empty if successful.
 */
export function adminSessionStart (token: number, quizId: number,
  autoStartNum: number): quizSessionId {
  const data = getData();

  const session = data.sessions.find(session => session.sessionId === token);
  if (!session) {
    throw new Error('How');
  }

  const user = data.users.find(user => user.id === session.authUserId);
  if (!user) {
    throw new Error('How');
  }

  if (data.bin.find(quiz => quiz.quizId === quizId)) {
    throw new Error('quiz is currently in the bin');
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    throw new Error('How');
  }

  if (data.bin.find(quiz => quiz.quizId === quizId)) {
    throw new Error('quiz is currently in the bin');
  }

  if (quiz.questions.length === 0) {
    throw new Error('quiz is currently in the bin');
  }

  if (autoStartNum > 50) {
    throw new Error('the autostart number cannot be greater than 50');
  }

  let count = 0;
  if (data.quizSession) {
    for (const session of data.quizSession) {
      if (session.quiz.quizId === quizId && session.state !== GameStage.END) {
        console.log('activated');
        count++;
      }

      if (count >= 10) {
        throw new Error('There are more than ten currently active sessions for this quiz');
      }
    }
  }

  const quizSessionId = random5DigitNumber();
  const newQuizSession: QuizSession = {
    state: GameStage.LOBBY,
    quizSessionId: quizSessionId,
    authUserId: user.id,
    createdAt: Math.floor(Date.now() / 1000),
    quiz: quiz,
    players: [],
    questionResults: []
  };

  data.quizSession.push(newQuizSession);

  setData(data);
  return { sessionId: quizSessionId };
}

/**
 * View all active and inactive sessions for a particular quiz
 * 
 * @param {number} token - The session token of the current user
 * @param {number} quizId - The ID of the quiz
 * @returns {SessionsResponse} Object containing active and inactive sessions
 */
export function adminQuizSessions(token: number, quizId: number): SessionsResponse {
  const data = getData();
  
  const session = data.sessions.find(session => session.sessionId === token);
  if (!session) {
    throw new Error('Invalid toekn');
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    throw new Error('Quiz ID does not lead to a valid quiz');
  }

  if (quiz.creatorId !== session.authUserId) {
    throw new Error('User is not the owner of this quiz');
  }

  const quizSessions = data.quizSession.filter(session => 
    session.quiz.quizId === quizId
  );

  const activeSessions = quizSessions
    .filter(session => session.state !== GameStage.END)
    .map(session => ({
      sessionId: session.quizSessionId,
      state: session.state
    }))
    .sort((a, b) => a.sessionId - b.sessionId);

  const inactiveSessions = quizSessions
    .filter(session => session.state === GameStage.END)
    .map(session => ({
      sessionId: session.quizSessionId,
      state: session.state
    }))
    .sort((a, b) => a.sessionId - b.sessionId);

  return {
    activeSessions,
    inactiveSessions
  };
}