import {
  ServerAuthRegister,
  ServerQuizCreate,
  ServerQuizCreateQuestion,
  ServerQuizSessions,
  ServerClear,
  ServerAuthLogout,
  serverStartSession
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

const questionBody = {
  question: 'Who is the Rizzler?',
  timeLimit: 30,
  points: 5,
  answerOptions: [
    { answer: 'Duke Dennis', correct: true },
    { answer: 'Kai Cenat', correct: false }
  ]
};

describe('Error Cases', () => {
  let UserToken: { token: string };
  let UserTokenTwo: { token: string };
  let quizId: { quizId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('swastik1@gmail.com', 'password123', 'Swastik', 'Mishra').body;
    UserTokenTwo = ServerAuthRegister('Swastik2@gmail.com', 'password456', 'Neo', 'Mishra').body;
    quizId = ServerQuizCreate(UserToken.token, 'Test Quiz', 'This is a test quiz').body;
    ServerQuizCreateQuestion(UserToken.token,
      quizId.quizId, questionBody);
  });

  test('Invalid token', () => {
    const response = ServerQuizSessions(Number(-UserToken.token).toString(), quizId.quizId);
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual(ERROR);
  });

  test('Empty token', () => {
    const response = ServerQuizSessions('', quizId.quizId);
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual(ERROR);
  });

  test('Logged out token', () => {
    ServerAuthLogout(UserToken.token);
    const response = ServerQuizSessions(UserToken.token, quizId.quizId);
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual(ERROR);
  });

  test('Not the owner', () => {
    const response = ServerQuizSessions(UserTokenTwo.token, quizId.quizId);
    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual(ERROR);
  });

  test('QuizId does not exist', () => {
    const response = ServerQuizSessions(UserToken.token, -quizId.quizId);
    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual(ERROR);
  });
});

describe('Success Cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('swastik1@gmail.com', 'password123', 'Swastik', 'Mishra').body;
    quizId = ServerQuizCreate(UserToken.token, 'Test Quiz', 'This is a test quiz').body;
    ServerQuizCreateQuestion(UserToken.token,
      quizId.quizId, questionBody);
  });

  test('Empty session list', () => {
    const response = ServerQuizSessions(UserToken.token, quizId.quizId);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      activeSessions: expect.any(Array),
      inactiveSessions: expect.any(Array)
    });
    expect(response.body.activeSessions.length).toBe(0);
    expect(response.body.inactiveSessions.length).toBe(0);
  });

  test('One active session exists', () => {
    const session = serverStartSession(UserToken.token, quizId.quizId, 0);
    expect(session.statusCode).toBe(200);

    const response = ServerQuizSessions(UserToken.token, quizId.quizId);
    expect(response.statusCode).toBe(200);
    expect(response.body.activeSessions).toEqual([
      expect.objectContaining({
        sessionId: expect.any(Number),
        state: 'LOBBY'
      })
    ]);
    expect(response.body.inactiveSessions).toEqual([]);
  });

  test('Multiple active sessions exist', () => {
    const session1 = serverStartSession(UserToken.token, quizId.quizId, 0);
    expect(session1.statusCode).toBe(200);
    const session2 = serverStartSession(UserToken.token, quizId.quizId, 0);
    expect(session2.statusCode).toBe(200);
    const response = ServerQuizSessions(UserToken.token, quizId.quizId);
    expect(response.statusCode).toBe(200);
    expect(response.body.activeSessions).toEqual([
      expect.objectContaining({
        sessionId: expect.any(Number),
        state: 'LOBBY'
      }),
      expect.objectContaining({
        sessionId: expect.any(Number),
        state: 'LOBBY'
      })
    ]);
    expect(response.body.inactiveSessions).toEqual([]);
  });

  test.todo('add tests for inactive sessions once that feature is implemented');
});
