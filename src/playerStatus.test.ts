import {
  ServerAuthRegister, ServerQuizCreate,
  ServerClear,
  ServerQuizCreateQuestion,
  serverStartSession,
  serverPlayerJoin,
  serverPlayerStatus
} from './ServerTestCallHelper';
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Error Cases of playerStatus', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let sessionId: { sessionId: number };
  let playerId: { playerId: number };
  beforeEach(() => {
    UserToken = ServerAuthRegister('example@unsw.edu.au', '1234abcd', 'hao', 'wu').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    ServerQuizCreateQuestion(UserToken.token,
      quizId.quizId, 'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    sessionId = serverStartSession(UserToken.token, quizId.quizId, 20).body;
    playerId = serverPlayerJoin(sessionId.sessionId, 'hao').body;
  });

  test('player ID does not exist', () => {
    const result = serverPlayerStatus(-playerId.playerId);
    expect(result.statusCode).toBe(400);
    expect(result.body).toStrictEqual(ERROR);
  });
});

describe('successful cases for playerStatus', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let sessionId: { sessionId: number };
  let playerId: { playerId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('example@unsw.edu.au', '1234abcd', 'hao', 'wu').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    ServerQuizCreateQuestion(UserToken.token,
      quizId.quizId, 'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    sessionId = serverStartSession(UserToken.token, quizId.quizId, 20).body;
    playerId = serverPlayerJoin(sessionId.sessionId, 'hao').body;
  });
  test('get status of a valid player', () => {
    const result = serverPlayerStatus(playerId.playerId);
    expect(result.statusCode).toBe(200);
    expect(result.body).toStrictEqual({
      state: 'LOBBY',
      numQuestions: 0,
      atQuestion: 0
    });
  });
});
