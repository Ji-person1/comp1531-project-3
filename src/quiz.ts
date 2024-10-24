import { getData, setData } from "./datastore";

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
    questionId: number;
    question: string;
    timeLimit: number;
    points: number;
    answerOptions: Answer[];
}

interface QuestionBody {
    question: string;
    timeLimit: number;
    points: number;
    answerOptions: Answer[];
}

interface Answer {
    answer: string;
    correct: boolean;
    colour?: string;
}

const colours = ['red', 'orange', 'yellow', 'blue', 'green', 'purple', 'brown'];

interface quizList {
    quizzes: QuizListInfo[]
}

interface QuizListInfo {
    quizId: number;
    name: string;
}

interface QuizId {
    quizId: number;
}

interface DuplicatedId {
    duplicatedQuestionId: number;
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
 * Given a particular quiz, move the quiz into trash
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
 * Transfer ownership of a quiz to another user based on their email.
 * 
 * @param {number} quizId - The ID of the quiz to be transferred.
 * @param {{ token: number; userEmail: string }} transferBody - An object containing the token and userEmail.
 * @returns {object} An empty object if successful, or an error object if unsuccessful.
 */
export function adminQuizTransfer(quizId: number, token: number, userEmail: string ): {} | errorObject {
    const data = getData();
    
    const session = data.sessions.find(session => session.sessionId === token);
    if (!session) {
      return { error: '401: Token is invalid or empty' };
    }
    
    const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
    if (!quiz || quiz.creatorId !== session.authUserId) {
      return { error: '403: User not an owner of this quiz or quiz doesnt exist' };
    }
    
    const targetUser = data.users.find(user => user.email === userEmail);
    if (!targetUser) {
      return { error: '400: UserEmail is not a real user' };
    }
    if (targetUser.id === session.authUserId) {
      return { error: '400: UserEmail is the current logged in user' };
    }
    
    if (data.quizzes.some(existingQuiz => existingQuiz.creatorId === targetUser.id && existingQuiz.name === quiz.name)) {
      return { error: '400: Quiz ID refers to a quiz that has a name already in use by the target user' };
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
    if (!question) {
        return { error: '400: Question is invalid' };
      }
    else if (question.length < 5 || question.length > 50) {
      return { error: '400: Question string is less than length 5 or greater length 50' };
    }
  
    // Validate answers
    if (!answers) {
        return { error: '400: Question is invalid' };
    }
    else if (answers.length < 2 || answers.length > 6) {
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

    const randomQuestionId = Math.floor(10000 + Math.random() * 90000);
    const newQuestion: Questions = {
        questionId: randomQuestionId,
        question,
        timeLimit: duration,
        points,
        answerOptions: answers
    };
    
    quiz.numQuestions++;
    quiz.questions.push(newQuestion);
    quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  
    setData(data);
  
    return { questionId: randomQuestionId};
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

export function adminQuizUpdateQuestion(token: number, quizId: number, questionId: number, question: string, duration: number, points: number, answers: Answer[]): {} | errorObject {
  const data = getData();
  
  const session = data.sessions.find(session => session.sessionId === token);
  if (!session) {
    return { error: '401: Token is invalid or empty' };
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz || quiz.creatorId !== session.authUserId) {
    return { error: '403: Token is valid, but user is not an owner of this quiz or quiz doesnt exist' };
  }

  if (question.length < 5 || question.length > 50) {
    return { error: '400: Question is less than length 5 or greater than length 50' };
  }

  if (answers.length < 2 || answers.length > 6) {
    return { error: '400: The question has more than 6 answers or less than 2 answers' };
  }

  if (duration <= 0) {
    return { error: '400: The question timeLimit is not positive' };
  }

  const totalDuration = quiz.questions.reduce((sum, q, index) => sum + (index === questionId - 1 ? duration : q.timeLimit), 0);
  if (totalDuration > 180) {
    return { error: '400: The quiz is longer than 3 minutes' };
  }

  if (points < 1 || points > 10) {
    return { error: '400: The points awarded for the question are less than 1 or greater than 10' };
  }

  if (answers.some(answer => answer.answer.length < 1 || answer.answer.length > 30)) {
    return { error: '400: The length of an answer is shorter than 1 character long, or longer than 30 characters long' };
  }

  if (answers.length !== new Set(answers.map(answer => answer.answer)).size) {
    return { error: '400: Any two answers are the same (within the same question)' };
  }

  if (!answers.some(answer => answer.correct)) {
    return { error: '400: There are no correct answers' };
  }

  const questionIndex = quiz.questions.findIndex(q => q.questionId === questionId)
  if (questionIndex === -1) {
    return { error: "400: questionId not found/invalid"}
  }

  quiz.questions[questionIndex] = {
    questionId,
    question,
    timeLimit: duration,
    points,
    answerOptions: answers
  };

  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);

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
export function adminQuestionMove (token: number, quizid: number, questionId: number, newPosition: number): errorObject | {} {
    const data = getData();
    const session = data.sessions.find(session => session.sessionId === token);
    if (!session) {
        return { error: '401 invalid session' };
    }
    
    const user = data.users.find(user => user.id === session.authUserId);
    if (!user) {
        return { error: '400 user id not found' }
    }

    const quiz = data.quizzes.find(quiz => quiz.quizId === quizid)
    if (!quiz) {
        return { error: '403 quiz not found/quizId is invalid'}
    }
    else if (quiz.creatorId !== user.id) {
        return { error: '403 user token provided is not the owner of the quiz'}
    }

    const question = quiz.questions.find(quiz => quiz.questionId === questionId)
    if (!question) {
        return { error: '400 question not found/questionId is invalid'}
    }

    if (newPosition < 0) {
        return { error: '400 newposition cannot be less than 0' }
    }
    else if (newPosition > quiz.numQuestions - 1) {
        return { error: '400 newposition cannot be greater than the number of questions' }
    }
    if (quiz.questions.findIndex(q => q.questionId === questionId) === newPosition) {
        return { error: '400 new index is identical to previous position'}
    }
    quiz.questions = quiz.questions.filter(question => question.questionId !== questionId)
    quiz.questions.splice(newPosition, 0, question)
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
export function adminQuestionDuplicate (token: number, quizid: number, questionId: number): errorObject | {} {
  const data = getData();
  const session = data.sessions.find(session => session.sessionId === token);
  if (!session) {
      return { error: '401 invalid session' };
  }
  
  const user = data.users.find(user => user.id === session.authUserId);
  if (!user) {
      return { error: '400 user id not found' }
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizid)
  if (!quiz) {
      return { error: '403 quiz not found/quizId is invalid'}
  }
  else if (quiz.creatorId !== user.id) {
      return { error: '403 user token provided is not the owner of the quiz'}
  }

  const question = quiz.questions.find(quiz => quiz.questionId === questionId)
  if (!question) {
      return { error: '400 question not found/questionId is invalid'}
  }

  const newIndex = quiz.questions.findIndex(quiz => quiz.questionId === questionId) + 1
  const newQuestion = {
    quizid: Math.floor(10000 + Math.random() * 90000),
    question: question.question,
    timeLimit: question.timeLimit,
    points: question.points,
    answerOptions: question.answerOptions
  };

  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  quiz.numQuestions += 1

  setData(data);
  quiz.questions.splice(newIndex, 0, question)
  return {}; 
}

/**
 * remove the question that given in a given quiz.
 *
 * @param {number} token - the id of the user
 * @param {number} quizId - the id of the quiz being deleted
 * @param {number} questionId - the question id being deleted
 * @returns {number|object} error if failed, empty if successful
 */

export function quizQuestionDelete (token: number, quizId: number, questionId: number): errorObject | object {
	const data = getData();

	const session = data.sessions.find(session => session.sessionId === token);
    if (!session) {
        return { error: '401 invalid session' };
    }

	const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
	if (!quiz) {
		return { error: '403: no quiz provided - error' };
	}
	if (quiz.creatorId !== session.authUserId) {
		return { error: '403: Quiz ID does not refer to a quiz that this user owns - error' };
	}
    
	const question = quiz.questions.find(question => question.questionId === questionId);

    if (!question) {
		return { error: '400: no question provided - error' };
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
export function adminQuizTrashEmpty(token: number, quizIds: number[]): errorObject | {} {
    const data = getData();

    const session = data.sessions.find(session => session.sessionId === token);
    if (!session) {
        return { error: '401 invalid session' };
    }

    const user = data.users.find(user => user.id === session.authUserId);
    if (!user) {
        return { error: '401 token is not linked to a user' };
    }


    for (const quizId of quizIds) {
        const quiz = data.bin.find(quiz => quiz.quizId === quizId);
        
        if (!quiz) {
            return { error: '400 one or more Quiz IDs is not currently in the trash' };
        }

        if (quiz.creatorId !== user.id) {
            return { error: '403 Quiz ID does not refer to a quiz that this user owns or it doesn’t exist' };
        }

        data.bin = data.bin.filter(quiz => quiz.quizId !== quizId);
    }

    setData(data);

    return {};
}

export function adminQuizTrash(token: number): errorObject | quizList {
    const data = getData();


    const session = data.sessions.find(session => session.sessionId === token);
    if (!session) {
        return { error: '401 invalid session' };
    }

    const user = data.users.find(user => user.id === session.authUserId);
    if (!user) {
        return { error: 'Token is empty or invalid ' };
    }

    const trashedQuizzes = data.bin.filter(quiz => quiz.creatorId === user.id);

    return {
        quizzes: trashedQuizzes.map(quiz => ({
            quizId: quiz.quizId,
            name: quiz.name
        }))
    };
}

export function adminQuizRestore(token: number, quizId: number): errorObject | {} {
    const data = getData();

    const session = data.sessions.find(session => session.sessionId === token);
    if (!session) {
        return { error: '401 invalid session' };
    }

    const user = data.users.find(user => user.id === session.authUserId);
    if (!user) {
        return { error: '400  user not found' };
    }

    const restoreQuiz = data.bin.find(quiz => quiz.quizId === quizId);
    if (!restoreQuiz) {
        return { error: '400 quizId does not refer to a valid quiz'}
    }
    const searchQuiz = data.quizzes.find(quiz => quiz.name === restoreQuiz.name)
    if (searchQuiz && searchQuiz.creatorId === user.id) {
        return { error: '400 user currently has a quiz of the same name'}
    }

    if (user.id !== restoreQuiz.creatorId) {
        return { error: '403 token is not the owner of the quiz being restored'}
    }

    data.quizzes.push(restoreQuiz)
    setData(data); 

    return {};
}
