import { getData, setData } from "./datastore.ts";

interface errorObject {
    error: string
}

interface quizDetails {
    quizId: number
    name: string
    timeCreated: number
    timeLastEdited: number
    description: string
    numQuestions: number
    questions: Questions[]
}

interface Questions {
    question: string;
    timeLimit: number;
    points: number;
    answerOptions: Answer[];
}

interface Answer {
    answer: string;
    correct: boolean;
}

interface quizList {
    quizzes: QuizListInfo[]
}

interface QuizListInfo {
    quizId: number;
    name: string;
}

interface QuizId {
    quizId: number
}

/**
 * Update the description of the relevant quiz.
 * 
 * @param {number} authUserId - the id of the user
 * @param {number} quizId - the id of the quiz being updated
 * @param {string} description - the new description of the quiz
 * @returns {number|object} error if failed, empty if successful
 */
export function adminQuizDescriptionUpdate (token: number, quizId: number, description: string): errorObject | {} { 
    const data = getData();

    const session = data.sessions.find(session => session.sessionId === token);
    if (!session) {
        return { error: '401 invalid session' };
    }

    const user = data.users.find(user => user.id === session.authUserId);
    if (!user) {
        return { error: '401 token is not linked to a user' };
    }

    const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
    if (!quiz) {
        return { error: '403 no quiz provided' };
    }
    if (quiz.creatorId !== user.id) {
        return { error: '403 Quiz ID does not refer to a quiz that this user owns' };
    }
    if (description.length > 100) {
        return { error: '400 decscription is too long' };
    }

    quiz.description = description;
    setData(data)
    return {};
}

/**
 * Updates the name of a quiz when given the correct authUserId, quizId and name
 * 
 * @param {string} authUserId - The id of the user.
 * @param {string} quizId - The id of the quiz.
 * @param {string} name - the name of the quiz.
 * @returns {object} error if failed, empty if successful.
 */
export function adminQuizNameUpdate (token: number, quizId: number, name: string): errorObject | {} { 
    const data = getData();

    const session = data.sessions.find(session => session.sessionId === token);
    if (!session) {
        return { error: '401 invalid session' };
    }

    const user = data.users.find(user => user.id === session.authUserId);
    if (!user) {
        return { error: '400  user not found' };
    }

    const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
    if (!quiz) {
        return { error: '403 no quiz provided' };
    }
    else if (quiz.creatorId !== session.authUserId) {
        return { error: '403 not the owner of the quiz' };
    }

    if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
        return {error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.'};
    }
    if (name.length < 3 || name.length > 30) {
        return {error: 'Name is either less than 3 characters long or more than 30 characters long.'};
    }
    if (data.quizzes.find(quiz => quiz.creatorId === user.id && quiz.name === name)) {
        return {error: 'Name is already used by the current logged in user for another quiz.'};
    }
    quiz.name = name
    setData(data)
    return {};
}


/**
 * Get all of the relevant information about the current quiz. Returning an error if
 * either adminauthuserid doesn't work or quizid
 * 
 * @param {string} authUserId - The email address of a user.
 * @param {string} quizId - The password for the account.
 * @returns {number|object} error if failed, number if successful
 */
export function adminQuizInfo(token: number, quizId: number): errorObject | quizDetails {
    const data = getData();

    const session = data.sessions.find(session => session.sessionId === token);
    if (!session) {
        return { error: '401 invalid session' };
    }

    const user = data.users.find(user => user.id === session.authUserId);
    if (!user) {
        return { error: '400 user not found' };
    }

    const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
    if (!quiz) {
        return { error: '403 no quiz provided' };
    }

    if (quiz.creatorId !== user.id) {
        return { error: '403 Quiz ID does not refer to a quiz that this user owns' };
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
 * @param {string} authUserId - The email address of a user.
 * @param {string} quizId - The password for the account.
 * @returns {number|object} error if failed, number if successful
 */
export function adminQuizList(token : number): errorObject | quizList {
    const data = getData();

    const session = data.sessions.find(session => session.sessionId === token);
    if (!session) {
        return { error: '401 invalid session' };
    }

    const user = data.users.find(user => user.id === session.authUserId);
    if (!user) {
        return { error: '401  user not found' };
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
 * @param {string} authUserId - The email address of a user.
 * @param {string} name - The name of the new quiz.
 * @param {string} description - The description of the new quiz.
 * @returns {object} error object if failed, object containing a number if successful
 */
export function adminQuizCreate(token: number, name: string, description: string): errorObject | QuizId {
    const data = getData();

    const session = data.sessions.find(session => session.sessionId === token);
    if (!session) {
        return { error: '401 invalid session' };
    }

    const user = data.users.find(user => user.id === session.authUserId);
    if (!user) {
        return { error: '400  user not found' };
    }

    if (name.length < 3 || name.length > 30 || !/^[a-zA-Z0-9 ]+$/.test(name)) {
        return { error: '400 Invalid quiz name' };
    }
    if (description.length > 100) {
        return { error: '400 Description too long' };
    }
    if (data.quizzes.some(quiz => quiz.creatorId === user.id && quiz.name === name)) {
        return { error: '400 Quiz name already used by this user' };
    }

    const newQuizId = data.quizzes.length > 0 ? Math.max(...data.quizzes.map(q => q.quizId)) + 1 : 1;
    const newQuiz = {
        quizId: newQuizId,
        creatorId: user.id,
        name,
        description,
        timeCreated: Math.floor(Date.now() / 1000),
        timeLastEdited: Math.floor(Date.now() / 1000),
        numQuestions: 0,
        questions: []
    };

    data.quizzes.push(newQuiz);
    setData(data)
    return { quizId: newQuizId };
}

/**
 * Given a particular quiz, permanently remove the quiz.
 * 
 * @param {number} authUserId - The email address of a user.
 * @param {number} quizId - The name of the new quiz.
 * @returns {object} error object if failed, object containing a number if successful
 */
export function adminQuizRemove(token: number, quizId: number): errorObject | {} {
    const data = getData();

    const session = data.sessions.find(session => session.sessionId === token);
    if (!session) {
        return { error: '401 invalid session' };
    }

    const user = data.users.find(user => user.id === session.authUserId);
    if (!user) {
        return { error: '400  user not found' };
    }

    const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
    if (!quiz) {
        return { error: '400 quiz not found' };
    }
    if (quiz.creatorId !== user.id) {
        return { error: '400 current user is not the owner of the quiz' };
    }

    data.bin.push(quiz); 
    data.quizzes = data.quizzes.filter(quiz => quiz.quizId !== quizId);
    setData(data); 
    return {};
}

/**
 * Given a particular quiz, permanently remove the quiz.
 * 
 * @param {number} token - The token of the user
 * @param {number} quizId - The name of the new quiz.
 * @param {string} userEmail - The email of the user
 * @returns {object} error object if failed, empty object if successful
 */
export function adminQuizTransfer(token: number, quizId: number, userEmail: string): {} | errorObject {
    const data = getData();
    
    const session = data.sessions.find(session => session.sessionId === token);
    if (!session) {
      return { error: '401: Token is invalid or empty' };
    }
    
    const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
    if (!quiz || quiz.creatorId !== session.authUserId) {
      return { error: '403: User is not an owner of this quiz or quiz doesnt exist' };
    }
    
    const targetUser = data.users.find(user => user.email === userEmail);
    if (!targetUser) {
      return { error: '400: UserEmail is not a real user' };
    }
    if (targetUser.id === session.authUserId) {
      return { error: '400: UserEmail is the current logged in user' };
    }
    
    if (data.quizzes.some(existingQuiz => existingQuiz.creatorId === targetUser.id && existingQuiz.name === quiz.name)) {
      return { error: '400: Quiz ID refers to a quiz that has a name that is already used by the target user' };
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
 * @returns {object} An object with the new questionId if successful, or an error object if unsuccessful
 */
export function adminQuizCreateQuestion(token: number, quizId: number, question: string, duration: number, points: number, answers: Answer[]): { questionId: number } | errorObject {
    const data = getData();
    
    // Check if token is valid
    const session = data.sessions.find(session => session.sessionId === token);
    if (!session) {
      return { error: '401: Token is invalid or empty' };
    }
  
    // Check if quiz exists and user owns it
    const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
    if (!quiz || quiz.creatorId !== session.authUserId) {
      return { error: '403: User is not an owner of this quiz or quiz doesnt exist' };
    }
  
    // Validate question
    if (question.length < 5 || question.length > 50) {
      return { error: '400: Question string is less than length 5 or greater length 50' };
    }
  
    // Validate answers
    if (answers.length < 2 || answers.length > 6) {
      return { error: '400: The question has less than 2 answers or more than 6 answers' };
    }
  
    if (duration <= 0) {
      return { error: '400: The question time limit is not positive' };
    }
  
    const totalDuration = quiz.questions.reduce((sum, question) => sum + question.timeLimit, 0) + duration;
    if (totalDuration > 180) {
      return { error: '400: The quiz is longer than 3 minutes' };
    }
  
    if (points < 1 || points > 10) {
      return { error: '400: The points awarded for the question are less than 1 or greater than 10' };
    }
  
    if (answers.some(answer => answer.answer.length < 1 || answer.answer.length > 30)) {
      return { error: '400: The length of any answer is shorter than 1 character long, or longer than 30 characters long' };
    }
  
    if (answers.length !== new Set(answers.map(answer => answer.answer)).size) {
      return { error: '400: Any answer strings are duplicates of one another (within the same question)' };
    }
  
    if (!answers.some(answer => answer.correct)) {
      return { error: '400: There are no correct answers' };
    }
  
    // Create new question
    const newQuestion: Questions = {
      question,
      timeLimit: duration,
      points,
      answerOptions: answers
    };
  
    quiz.questions.push(newQuestion);
    quiz.numQuestions++;
    quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  
    setData(data);
  
    return { questionId: quiz.questions.length };
  }
