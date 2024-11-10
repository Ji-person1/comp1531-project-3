import {
  ServerAuthRegister, ServerQuizCreate,
  ServerClear,
  ServerQuizCreateQuestion,
  serverStartSession,
  serverPlayerJoin,
  serverPlayerQuestionInfo,
} from './ServerTestCallHelper';
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Error Cases of playerQuestionInfo', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  // let questionId: { questionId: number };
  let sessionId: { sessionId: number };
  let playerId: { playerId: number };
  let questionPosition: number;
  beforeEach(() => {
    UserToken = ServerAuthRegister('example@unsw.edu.au', '1234abcd', 'hao', 'wu').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    ServerQuizCreateQuestion(
      UserToken.token,
      quizId.quizId, 'Who is the Rizzler?', 4, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]
    );
    sessionId = serverStartSession(UserToken.token, quizId.quizId, 20).body;
    playerId = serverPlayerJoin(sessionId.sessionId, 'hao').body;
    questionPosition = 1;
  });
  test('Player ID does not exist', () => {
    const restoreResult = serverPlayerQuestionInfo(-playerId, questionPosition);
    expect(restoreResult.body).toStrictEqual(ERROR);
    expect(restoreResult.statusCode).toStrictEqual(400);
  });

  test('Question position is not valid for the session this player is in', () => {
    const restoreResult = serverPlayerQuestionInfo(playerId.playerId, 0);
    expect(restoreResult.body).toStrictEqual(ERROR);
    expect(restoreResult.statusCode).toStrictEqual(400);
  });

  test('Session is not currently on this question', () => {
    const restoreResult = serverPlayerQuestionInfo(0, questionPosition);
    expect(restoreResult.body).toStrictEqual(ERROR);
    expect(restoreResult.statusCode).toStrictEqual(400);
  });
  test.todo('Session is in LOBBY state');
  test.todo('test successful return');
});
