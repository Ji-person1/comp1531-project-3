import { adminQuizInfo, adminQuizCreate, } from './quiz.js';
import { adminAuthRegister } from './auth.js';
import { clear } from './other.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    clear()
})

describe('Error cases', () => {
    
    test ('invalid userId', () => {
        const userId = adminAuthRegister("swapnav.saikia@gmail.com", "1234abcd", "Swapnav", "Saikia")
        const quizId = adminQuizCreate(userId, "quiz1", "This is my quiz")
        expect(adminQuizInfo(-userId, quizId)).toEqual(ERROR);
    });
    test ('empty data store', () => {
        expect(adminQuizInfo(1, 1)).toEqual(ERROR);
    });
    test ('invalid quizId', () => {
        const userId = adminAuthRegister("swapnav.saikia@icloud.com", "1234abcd", "Swapnav", "Saikia")
        const quizId = adminQuizCreate(userId, "quiz1", "This is my quiz")
        expect(adminQuizInfo(userId, -quizId.quizId)).toEqual(ERROR);
    });
    test ('Quiz name does not exist', () => {
        const userId = adminAuthRegister("swapnav.saikia@icloud.com", "1234abcd", "Swapnav", "Saikia")
        const quizId = adminQuizCreate(userId, "quiz1", "This is my quiz")
        expect(adminQuizInfo(userId, quizId)).toEqual(ERROR);
    });

});

describe ('Success cases', () => {
    test('Sucessful view', () => {
        const userId = adminAuthRegister("swapnav.saikia@gmail.com", "1234abcd", "Swapnav", "Saikia")
        const quizId = adminQuizCreate(userId, "quiz1", "This is my quiz")
        expect(adminQuizInfo(userId, quizId.quizId)).toEqual({
            quizId: quizId.quizId,
            name: "quiz1",
            timeCreated: expect.any(Number),  
            timeLastEdited: expect.any(Number),
            description: "This is my quiz"
        });
    })
})