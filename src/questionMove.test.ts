import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;


const ERROR = { error: expect.any(String) };

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('Error cases', () => {
    let UserToken: {token: number}
   	let quizId: {quizId: number}
	let questionId: {questionId: number}
    let questionIdTwo: {questionId: number}
    let questionIdThree: {questionId: number}
    beforeEach(() => {
        const res = request('POST', SERVER_URL + '/v1/admin/auth/register', 
                {json: {email: "HaoWu0000@gmail.com", password: "2734uqsd", nameFirst: "Hao", nameLast: "Wu"}});
        UserToken = JSON.parse(res.body.toString());
    
        const quizRes = request('POST', SERVER_URL + '/v1/admin/quiz', 
                   {json: {token: UserToken.token, name: "functional quiz", description: "a test quiz"}});
        quizId = JSON.parse(quizRes.body.toString());
    
        const questionRes = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/question`, {
            json: {
                token: UserToken.token,
                question: "Who is the Rizzler?",
                duration: 30,
                points: 5,
                answers: [
                    { answer: "Duke Dennis", correct: true },
                    { answer: "Kai Cenat", correct: false }
                ]
            },
            timeout: TIMEOUT_MS
        });
        const questionRes2 = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId.quizId}/question`, {
            json: {
                token: UserToken.token,
                question: "Who isn't the Rizzler?",
                duration: 30,
                points: 5,
                answers: [
                    { answer: "Duke Dennis", correct: false },
                    { answer: "Kai Cenat", correct: true }
                ]
            },
            timeout: TIMEOUT_MS
        });
        const questionRes3 = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId.quizId}/question`, {
            json: {
                token: UserToken.token,
                question: "Is hawk tuah funny",
                duration: 30,
                points: 500,
                answers: [
                    { answer: "yes", correct: false },
                    { answer: "no", correct: true }
                ]
            },
            timeout: TIMEOUT_MS
        });

        questionId = JSON.parse(questionRes.body.toString());
        questionIdTwo = JSON.parse(questionRes2.body.toString());
        questionIdThree = JSON.parse(questionRes3.body.toString());
    });

    test('invalid token', () => {
        const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/question/${questionId.questionId}/move`, 
            {json: {token: -UserToken.token, newPositon: 1}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(401);
    });
    test('quiz does not exist', () => {
        const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${-quizId.quizId}/question/${questionId.questionId}/move`, 
            {json: {token: UserToken.token, newPosition: 1}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(403);
    });
    test('Not the owner of the quiz', () => {
        const res = request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "1dq11333@gmail.com", password: "1234abcd", nameFirst: "Hao", nameLast: "Wu"}});
        const UserTokenTwo = JSON.parse(res.body.toString());

        const errRes = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/question/${questionId.questionId}/move`, 
            {json: {token: UserTokenTwo.token, newPosition: 1}});
        expect(JSON.parse(errRes.body.toString())).toStrictEqual(ERROR);
        expect(errRes.statusCode).toStrictEqual(403);
    });
    test('question does not exist', () => {
        const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/question/${-questionId.questionId}/move`, 
            {json: {token: UserToken.token, newPosition: 1}});
        
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });
    test('positon does not exist', () => {
        const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/question/${questionId.questionId}/move`, 
            {json: {token: UserToken.token, quizId: quizId.quizId, questionId: questionId.questionId, newPosition: -1}});
        const res2 = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/question/${questionIdTwo.questionId}/move`, 
            {json: {token: UserToken.token, quizId: quizId.quizId, questionId: questionIdTwo.questionId, newPosition: 100}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
        expect(res2.statusCode).toStrictEqual(400);
    });
    test('NewPosition is the position of the current question', () => {
        const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/question/${questionIdThree.questionId}/move`, 
            {json: {token: UserToken.token, newPosition: 2}});
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(400);
    });
});

describe('Success cases', () => {
    let UserToken: {token: number}
    let quizId: {quizId: number}
    let questionId: {questionId: number}
    let questionIdTwo: {questionId: number}
    beforeEach(() => {
        const res = request('POST', SERVER_URL + '/v1/admin/auth/register', 
            {json: {email: "1dq11333@gmail.com", password: "1234abcd", nameFirst: "Hao", nameLast: "Wu"}});
        UserToken = JSON.parse(res.body.toString());

        const quizRes = request('POST', SERVER_URL + '/v1/admin/quiz', 
            {json: {token: UserToken.token, name: "first quiz", description: "a test quiz"}});
        quizId = JSON.parse(quizRes.body.toString());

        const questionRes = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId.quizId}/question`, {
            json: {
                token: UserToken.token,
                question: "Who is the Rizzler?",
                duration: 30,
                points: 5,
                answers: [
                    { answer: "Duke Dennis", correct: true },
                    { answer: "Kai Cenat", correct: false }
                ]
            },
            timeout: TIMEOUT_MS
        });
        const questionRes2 = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId.quizId}/question`, {
            json: {
                token: UserToken.token,
                question: "Who isn't the Rizzler?",
                duration: 30,
                points: 5,
                answers: [
                    { answer: "Duke Dennis", correct: false },
                    { answer: "Kai Cenat", correct: true }
                ]
            },
            timeout: TIMEOUT_MS
        });
            request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId.quizId}/question`, {
            json: {
                token: UserToken.token,
                question: "Is hawk tuah funny",
                duration: 30,
                points: 500,
                answers: [
                    { answer: "yes", correct: false },
                    { answer: "no", correct: true }
                ]
            },
            timeout: TIMEOUT_MS
        });

        request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId.quizId}/question`, {
            json: {
                token: UserToken.token,
                question: "Do you like this question",
                duration: 30,
                points: 1,
                answers: [
                    { answer: "yes", correct: false },
                    { answer: "no", correct: true }
                ]
            },
            timeout: TIMEOUT_MS
        });
        questionId = JSON.parse(questionRes.body.toString());
        questionIdTwo = JSON.parse(questionRes2.body.toString());
    }); 
    test('position 0 to 1', () => {
        const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/question/${questionId.questionId}/move`, 
            {json: {token: UserToken.token, newPosition: 1}});
        expect(JSON.parse(res.body.toString())).toStrictEqual({});
        expect(res.statusCode).toStrictEqual(200);
    });

    test('position 1 to 2', () => {
        const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/question/${questionIdTwo.questionId}/move`, 
            {json: {token: UserToken.token, newPosition: 2}});
        expect(JSON.parse(res.body.toString())).toStrictEqual({});
        expect(res.statusCode).toStrictEqual(200);
    });
});