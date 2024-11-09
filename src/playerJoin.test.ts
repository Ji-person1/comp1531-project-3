import {
  ServerAuthRegister, ServerQuizCreate,
  ServerClear,
  ServerQuizCreateQuestion,
  serverStartSession,
  serverPlayerJoin
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Error Cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let sessionId: { sessionId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    ServerQuizCreateQuestion(UserToken.token,
      quizId.quizId, 'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    sessionId = serverStartSession(UserToken.token, quizId.quizId, 20).body;
  });

  test('Invalid name', () => {
    const response = serverPlayerJoin(sessionId.sessionId, '--..');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(ERROR);
  });

  test('Invalid sessionId', () => {
    const response = serverPlayerJoin(-sessionId.sessionId, 'Jim');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(ERROR);
  });

  test('Identical name', () => {
    serverPlayerJoin(sessionId.sessionId, 'Jim');
    const response = serverPlayerJoin(sessionId.sessionId, 'Jim');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(ERROR);
  });

  test.todo('Do a test for when session is not in LOBBY state');
});

describe('Success Cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let sessionId: { sessionId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    ServerQuizCreateQuestion(UserToken.token,
      quizId.quizId, 'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    sessionId = serverStartSession(UserToken.token, quizId.quizId, 20).body;
  });

  test('basic return check', () => {
    const response = serverPlayerJoin(sessionId.sessionId, 'Jim');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ playerId: expect.any(Number) });
  });

  test.todo('add a test with status');

  test.todo('add a test with current information of player');
});
