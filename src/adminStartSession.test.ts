import { QuestionBody } from './interfaces';
import {
  ServerAuthRegister, ServerQuizCreate, ServerQuizRemove,
  ServerClear,
  ServerQuizCreateQuestion,
  serverStartSession
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});
const questionBody: QuestionBody = {
  question: 'Who is the Rizzler?',
  timeLimit: 30,
  points: 5,
  answerOptions: [
    { answer: 'Duke Dennis', correct: true },
    { answer: 'Kai Cenat', correct: false }
  ],
};
describe('Error Cases', () => {
  let UserToken: { token: string };
  let UserTokenTwo: { token: string };
  let quizId: { quizId: number };
  let quizIdTwo: { quizId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
    UserTokenTwo = ServerAuthRegister('z5394791@unsw.edu.au', '1234abcd', 'Mij', 'Heng').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    ServerQuizCreateQuestion(UserToken.token, quizId.quizId, questionBody);
    quizIdTwo = ServerQuizCreate(UserToken.token, 'A fun quiz', 'a very quiz').body;
  });

  test('Invalid token', () => {
    const response = serverStartSession(Number(-UserToken.token).toString(), quizId.quizId, 10);

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual(ERROR);
  });

  test('Empty token', () => {
    const response = serverStartSession('', quizId.quizId, 10);

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual(ERROR);
  });

  test('autoStartNum greater than 50', () => {
    const response = serverStartSession(UserToken.token, quizId.quizId, 51);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(ERROR);
  });

  test('10 other sessions for quiz', () => {
    for (let i = 0; i < 10; i++) {
      const response = serverStartSession(UserToken.token, quizId.quizId, 20);
      expect(response.statusCode).toBe(200);
    }
    const response = serverStartSession(UserToken.token, quizId.quizId, 20);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(ERROR);
  });

  test('Empty questions in a quiz', () => {
    const response = serverStartSession(UserToken.token, quizIdTwo.quizId, 20);

    expect(response.body).toEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Trashed quiz', () => {
    ServerQuizRemove(UserToken.token, quizId.quizId);
    const response = serverStartSession(UserToken.token, quizId.quizId, 20);

    expect(response.body).toEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Not the owner', () => {
    const response = serverStartSession(UserTokenTwo.token, quizId.quizId, 20);

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual(ERROR);
  });

  test('QuizId does not exist', () => {
    const response = serverStartSession(UserToken.token, -quizId.quizId, 20);

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual(ERROR);
  });
});

describe('Success Cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    ServerQuizCreateQuestion(UserToken.token, quizId.quizId, questionBody);
  });

  test('Trashed quiz', () => {
    const response = serverStartSession(UserToken.token, quizId.quizId, 20);

    expect(response.body).toEqual({ sessionId: expect.any(Number) });
    expect(response.statusCode).toBe(200);
  });

  test.todo('add a test to demonstrate players can join once that is implemented');

  test.todo('add a test to check no new questions are added to this once a session begins');
});
