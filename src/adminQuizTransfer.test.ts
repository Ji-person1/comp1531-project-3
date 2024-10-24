import {
  ServerAuthRegister, ServerQuizCreate, ServerQuizTransfer,
  ServerQuizInfo, ServerClear
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('adminQuizTransfer', () => {
  let user1Token: { token: string };
  let user2Token: { token: string };
  let quizId: { quizId: number };

  beforeEach(() => {
    user1Token = ServerAuthRegister('swastik1@gmail.com', 'password123', 'Swastik', 'Mishra').body;
    user2Token = ServerAuthRegister('Swastik2@gmail.com', 'password456', 'Neo', 'Mishra').body;

    quizId = ServerQuizCreate(user1Token.token, 'Test Quiz', 'This is a test quiz').body;
  });

  test('Successful transfer', () => {
    const res = ServerQuizTransfer(user1Token.token, quizId.quizId, 'Swastik2@gmail.com');
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toBe(200);

    const quizInfo = ServerQuizInfo(user2Token.token, quizId.quizId);
    expect(quizInfo.body.name).toBe('Test Quiz');
  });

  test('Invalid token', () => {
    const res = ServerQuizTransfer('invalid_token', quizId.quizId, 'Swastik2@gmail.com');
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual(ERROR);
  });

  test('Quiz does not exist', () => {
    const res = ServerQuizTransfer(user1Token.token, 999, 'Swastik2@gmail.com');
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(ERROR);
  });

  test('User is not the owner of the quiz', () => {
    const res = ServerQuizTransfer(user2Token.token, quizId.quizId, 'Swastik1@gmail.com');
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(ERROR);
  });

  test('Target user does not exist', () => {
    const res = ServerQuizTransfer(user1Token.token, quizId.quizId, 'nonexistent@gmail.com');
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(ERROR);
  });

  test('Target user is the current owner', () => {
    const res = ServerQuizTransfer(user1Token.token, quizId.quizId, 'Swastik1@gmail.com');
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(ERROR);
  });

  test('Quiz name conflict with target user', () => {
    ServerQuizCreate(user2Token.token, 'Test Quiz', 'This is another test quiz');

    const res = ServerQuizTransfer(user1Token.token, quizId.quizId, 'Swastik2@gmail.com');
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(ERROR);
  });
});
