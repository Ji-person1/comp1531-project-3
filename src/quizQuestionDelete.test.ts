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
  beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register',
      { json: { email: "HaoWu0000@gmail.com", password: "2734uqsd", nameFirst: "Hao", nameLast: "Wu" } })
    UserToken = JSON.parse(res.body.toString())

    const quizRes = request('POST', SERVER_URL + '/v1/admin/quiz',
           	{ json: { token: UserToken.token, name: "functional quiz", description: "a test quiz" } })
    quizId = JSON.parse(quizRes.body.toString())

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
    questionId = JSON.parse(questionRes.body.toString())
  })

  test('invalid token', () => {
    const res = request('DELETE', SERVER_URL +
     `/v1/admin/quiz/${quizId.quizId}/question/${questionId.questionId}`,
    { qs: { token: -UserToken.token } })
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR)
    expect(res.statusCode).toStrictEqual(401)
  })

  test('quiz does not exist', () => {
    const res = request('DELETE', SERVER_URL +
        `/v1/admin/quiz/${-quizId.quizId}/question/${questionId.questionId}`,
    { qs: { token: UserToken.token} })
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR)
    expect(res.statusCode).toStrictEqual(403)
  })

  test('Not the owner of the quiz', () => {
    const resTwo = request('POST', SERVER_URL + '/v1/admin/auth/register', 
      {json: {email: "z533333@unsw.edu.au", password: "1234abcd", nameFirst: "Hao", nameLast: "Wu"}})
    const UserTokenTwo = JSON.parse(resTwo.body.toString())

    const errRes = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/question/${questionId.questionId}`,
    { qs: { token: UserTokenTwo.token} })
    expect(JSON.parse(errRes.body.toString())).toStrictEqual(ERROR)
    expect(errRes.statusCode).toStrictEqual(403)
  })

  test('question does not exist', () => {
    const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/question/${-questionId.questionId}`,
    { qs: { token: UserToken.token} });

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
    request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register',
      { json: { email: "1dq11333@gmail.com", password: "1234abcd", nameFirst: "Hao", nameLast: "Wu" } })
    UserToken = JSON.parse(res.body.toString())

    const quizRes = request('POST', SERVER_URL + '/v1/admin/quiz',
      { json: { token: UserToken.token, name: "first quiz", description: "a test quiz" } })
    quizId = JSON.parse(quizRes.body.toString())

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
    questionId = JSON.parse(questionRes.body.toString())

    const questionRes2 = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/question`, {
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
    });request('POST', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/question`,
      {
        json: {
          token: UserToken.token,
          quizId: quizId.quizId,
            question: "Sample Question",
            timeLimit: 5,
            points: 5,
            answerOptions: [
              {
                answer: "Sample Answer",
                correct: true
              },
              {
                answer: "Sample Answer 2",
                correct: false
              }
            ]
        }
      })
    questionIdTwo = JSON.parse(questionRes2.body.toString())
  })
  
  test('Basic return success check', () => {
    const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/question/${questionId.questionId}`,
    { qs: { token: UserToken.token } })
    expect(JSON.parse(res.body.toString())).toStrictEqual({})
    expect(res.statusCode).toStrictEqual(200)
  })
  test('delete the second question', () => {
    const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId.quizId}/question/${questionIdTwo.questionId}`,
    { qs: { token: UserToken.token } })
    expect(JSON.parse(res.body.toString())).toStrictEqual({})
    expect(res.statusCode).toStrictEqual(200)
  })
})
