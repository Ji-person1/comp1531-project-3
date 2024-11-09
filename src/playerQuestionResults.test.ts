import {
  ServerAuthRegister, ServerQuizCreate,
  ServerClear,
  ServerQuizCreateQuestion,
  serverStartSession,
  serverPlayerJoin,
  serverPlayerQuestionResults
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Error Cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let sessionId: { sessionId: number };
  let playerId: { playerId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('swapnav.saikia123@icloud.com', '1234abcd', 'Swapnav', 'Saikia').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    ServerQuizCreateQuestion(UserToken.token,
      quizId.quizId, 'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    sessionId = serverStartSession(UserToken.token, quizId.quizId, 20).body;
    playerId = serverPlayerJoin(sessionId.sessionId, "Swapnav").body
  });

  test('player ID does not exist', () => {
    const response = serverPlayerQuestionResults(-playerId.playerId, 1);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(ERROR);
  });

});