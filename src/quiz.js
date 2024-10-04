import { getData } from "./dataStore";
/**
 * Update the description of the relevant quiz.
 * 
 * @param {number} authUserId - the id of the user
 * @param {number} quizId - the id of the quiz being updated
 * @param {string} description - the new description of the quiz
 * @returns {number|object} error if failed, empty if successful
 */
export function adminQuizDescriptionUpdate (authUserId, quizId, description) { 
    const data = getData();
    const user = data.users.find(user => user.id === authUserId);
    const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
    if (!user) {
        return { error: 'no user provided' };
    }
    if (!quiz) {
        return { error: 'no quiz provided' };
    }

    if (description.length > 100) {
        return { error: 'decscription is too long' };
    }

    if (quiz.creatorId == authUserId) {
        quiz.description = description;
        return {};
    }
    
    
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
}

/**
 * Updates the name of a quiz when given the correct authUserId, quizId and name
 * 
 * @param {string} authUserId - The id of the user.
 * @param {string} quizId - The id of the quiz.
 * @param {string} name - the name of the quiz.
 * @returns {object} error if failed, empty if successful.
 */
export function adminQuizNameUpdate (authUserId, quizId, name) { 
    const data = getData()
    if (!data.users.find(user => user.id === authUserId)) {
        return {error: 'AuthUserId is not a valid user.'};
    }
    const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
    if (quizIndex === -1) {
        return { error: 'Invalid quizId' };
    }
    if (data.quizzes[quizIndex].creatorId !== authUserId) {
        return {error: 'Quiz ID does not refer to a quiz that this user owns.'};
    }
    const quiz = data.quizzes[quizIndex]
    if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
        return {error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.'};
    }
    if (name.length < 3 || name.length > 30) {
        return {error: 'Name is either less than 3 characters long or more than 30 characters long.'};
    }
    if (data.quizzes.find(quiz => quiz.ownerId === authUserId && quiz.name === name)) {
        return {error: 'Name is already used by the current logged in user for another quiz.'};
    }
    quiz.name = name
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
export function adminQuizInfo(authUserId, quizId) {
    const data = getData();

    const user = data.users.find(user => user.id === authUserId);
    if (!user) {
        return { error: 'User Id is not valid!' };
    }

    const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
    if (quizIndex === -1) {
        return { error: 'Invalid quizId' };
    }
    if (data.quizzes[quizIndex].creatorId !== authUserId) {
        return { error: 'Quiz does not exist or does not belong to this user' };
    }

    const quiz = data.quizzes[quizIndex]
    return {
        quizId: data.quizzes[quizIndex].creatorId,
        name: quiz.name,
        timeCreated: quiz.timeCreated,
        timeLastEdited: quiz.timeLastEdited,
        description: quiz.description
    };
}

/**
 * Provides a list of all quizzes that are owned by the currently logged in user.
 * 
 * @param {string} authUserId - The email address of a user.
 * @param {string} quizId - The password for the account.
 * @returns {number|object} error if failed, number if successful
 */
export function adminQuizList(authUserId) {
    const data = getData();
    const user = data.users.find(user => user.id === authUserId);


    if (!user) {
        return { error: 'Invalid authUserId' };
    }


    const userQuizzes = data.quizzes.filter(quiz => quiz.creatorId === authUserId);
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
export function adminQuizCreate(authUserId, name, description) {
    const data = getData();
    const user = data.users.find(user => user.id === authUserId);

    if (!user) {
        return { error: 'Invalid authUserId' };
    }
    if (name.length < 3 || name.length > 30 || !/^[a-zA-Z0-9 ]+$/.test(name)) {
        return { error: 'Invalid quiz name' };
    }
    if (description.length > 100) {
        return { error: 'Description too long' };
    }
    if (data.quizzes.some(quiz => quiz.creatorId === authUserId && quiz.name === name)) {
        return { error: 'Quiz name already used by this user' };
    }
    const newQuizId = data.quizzes.length > 0 ? Math.max(...data.quizzes.map(q => q.quizId)) + 1 : 1;
    const newQuiz = {
        quizId: newQuizId,
        creatorId: authUserId,
        name,
        description,
        timeCreated: Math.floor(Date.now() / 1000),
        timeLastEdited: Math.floor(Date.now() / 1000)
    };

    data.quizzes.push(newQuiz);
    return { quizId: newQuizId };
}


//Given a particular quiz, permanently remove the quiz.
export function adminQuizRemove(authUserId, quizId) {
    const data = getData();
    const user = data.users.find(user => user.id === authUserId);
    if (!user) {
        return { error: 'Invalid authUserId' };
    }
    const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
    if (quizIndex === -1) {
        return { error: 'Invalid quizId' };
    }
    if (data.quizzes[quizIndex].creatorId !== authUserId) {
        return { error: 'Quiz does not belong to this user' }; 
    }
    data.quizzes.splice(quizIndex, 1);
    return {};
}
