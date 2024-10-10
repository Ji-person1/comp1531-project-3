import { adminQuizDescriptionUpdate, adminQuizCreate } from './quiz.js';
import { clear } from './other.js';
import { adminAuthRegister } from './auth.js';


describe(('test_adminQuizDescriptionUpdate'), () => {
    beforeEach(() => {
        clear();
    });
    test(('AuthUserId is not a valid user'), () => {
        const userID = adminAuthRegister('sampleEmail@gmail.com', 'password123', 'nameFirst', 'nameLast');
        const quizId = adminQuizCreate(userID.authUserId, 'quizName1', 'description');
        let result = adminQuizDescriptionUpdate(userID.authUserId + 1, quizId.quizId, 'description_new');
        expect(result).toStrictEqual({error: expect.any(String)});
    });
    test(('Quiz ID does not refer to a valid quiz'), () => {
        const userID = adminAuthRegister('sampleEmail@gmail.com', 'password123', 'nameFirst', 'nameLast');
        const quizId = adminQuizCreate(userID.authUserId, 'quizName1', 'description');
        let result = adminQuizDescriptionUpdate(userID.authUserId, quizId.quizId + 1, 'description_new');
        expect(result).toStrictEqual({error: expect.any(String)});
    });
    test(('Quiz ID does not refer to a quiz that this user owns'), () => {
        const userID = adminAuthRegister('sampleEmail@gmail.com', 'password123', 'nameFirst', 'nameLast');
        const quizId = adminQuizCreate(userID.authUserId, 'quizName1', 'description');
        const userID2 = adminAuthRegister('sampleEmail02@gmail.com', 'password123', 'firstName', 'lastName');
        const quizId2 = adminQuizCreate(userID2.authUserId, 'quizName2', 'description02');
        let result = adminQuizDescriptionUpdate(userID2.authUserId, quizId.quizId, 'description02_new');
        expect(result).toStrictEqual({error: expect.any(String)});
    });
    test(('Description is more than 100 characters in length'), () => {
        const userID = adminAuthRegister('sampleEmail@gmail.com', 'password123', 'nameFirst', 'nameLast');
        const quizId = adminQuizCreate(userID.authUserId, 'quizName1', 'description');
        let description = [];
        for(let i = 0; i < 101; i++) {
            description[i] = 'a';
        }
        let result = adminQuizDescriptionUpdate(userID.authUserId, quizId.quizId, description);
        expect(result).toStrictEqual({error: expect.any(String)});
    });
    test(('sucessfulTest1'), () => {
        const userID = adminAuthRegister('sampleEmail@gmail.com', 'password123', 'nameFirst', 'nameLast');
        const quizId = adminQuizCreate(userID.authUserId, 'quizName1', 'description');
        let result = adminQuizDescriptionUpdate(userID.authUserId, quizId.quizId, 'description_new');
        expect(result).toStrictEqual({});
    });
    test(('sucessfulTest2'), () => {
        const userID = adminAuthRegister('sampleEmail@gmail.com', 'password123', 'nameFirst', 'nameLast');
        const quizId = adminQuizCreate(userID.authUserId, 'quizName1', 'description');
        const userID2 = adminAuthRegister('sampleEmail02@gmail.com', 'password123', 'firstName', 'lastName');
        const quizId2 = adminQuizCreate(userID2.authUserId, 'quizName2', 'description02');
        let result = adminQuizDescriptionUpdate(userID2.authUserId, quizId2.quizId, 'description02_new');
        expect(quizId2).toStrictEqual({quizId: 2});
    });
});