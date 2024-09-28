import { adminQuizDescriptionUpdate, adminQuizCreate } from './quiz.js';
import { clear } from './other.js';
import { adminAuthRegister } from './auth.js';
import { data } from './dataStore.js';

describe(('test_adminQuizDescriptionUpdate'), () => {
    beforeEach(() => {
        clear();
        adminAuthRegister('sampleEmail@gmail.com', 'password123', 'nameFirst', 'nameLast');
        adminQuizCreate(data.users[0].authUserId, 'quizName1', 'description');
    });
    test(('AuthUserId is not a valid user'), () => {
        let result = adminQuizDescriptionUpdate(data.users[0].authUserId + 1, data.quiezzes[0].quizId, 'description_new');
        expect(result).toStricEqual({error: 'specific error message here'});
    });
    test(('Quiz ID does not refer to a valid quiz'), () => {
        let result = adminQuizDescriptionUpdate(data.users[0].authUserId, data.quiezzes[0].quizId + 1, 'description_new');
        expect(result).toStricEqual({error: 'specific error message here'});
    });
    test(('Quiz ID does not refer to a quiz that this user owns'), () => {
        adminAuthRegister('sampleEmail02@gmail.com', 'password123', 'firstName', 'lastName');
        adminQuizCreate(data.users[1].authUserId, 'quizName2', 'description02');
        let result = adminQuizDescriptionUpdate(data.users[1].authUserId, data.quiezzes[0].quizId, 'description02_new');
        expect(result).toStricEqual({error: 'specific error message here'});
    });
    test(('Description is more than 100 characters in length'), () => {
        let description = [];
        for(let i = 0; i < 101; i++) {
            description[i] = 'a';
        }
        let result = adminQuizDescriptionUpdate(data.users[0].authUserId, data.quiezzes[0].quizId, description);
        expect(result).toStricEqual({error: 'specific error message here'});
    });
    test(('sucessfulTest1'), () => {
        let result = adminQuizDescriptionUpdate(data.users[0].authUserId, data.quiezzes[0].quizId, 'description_new');
        expect(data.quiezzes[0].description).toStricEqual({description: 'description_new'});
    });
    test(('sucessfulTest2'), () => {
        adminAuthRegister('sampleEmail02@gmail.com', 'password123', 'firstName', 'lastName');
        adminQuizCreate(data.users[1].authUserId, 'quizName2', 'description02');
        let result = adminQuizDescriptionUpdate(data.users[1].authUserId, data.quiezzes[1].quizId, 'description02_new');
        expect(data.quiezzes[1].description).toStricEqual({description: 'description02_new'});
    });
    clear();
});
