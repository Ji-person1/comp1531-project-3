import {
  ServerAuthRegister,
  ServerQuizCreate,
  ServerQuizCreateQuestion,
  serverStartSession,
  ServerSessionUpdate,
  ServerQuizSessionResultsCSV,
  ServerClear,
} from './ServerTestCallHelper';
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});
describe('quizSessionResultCsv error test', () => {
  let userToken: { token: string };
  let userTokenTwo: { token: string };
  let quizId: { quizId: number };
  let sessionId: { sessionId: number };

  beforeEach(() => {
    userToken = ServerAuthRegister('HaoWu1@gmail.com', 'password123', 'Hao', 'Wu').body;
    userTokenTwo = ServerAuthRegister('HaoWu2@gmail.com', 'password123', 'Hao', 'Wu').body;
    quizId = ServerQuizCreate(userToken.token, 'Test Quiz', 'This is a test quiz').body;
    ServerQuizCreateQuestion(
      userToken.token,
      quizId.quizId,
      'Heads or Tails?',
      30,
      5,
      [
        { answer: 'Head', correct: true },
        { answer: 'Tail', correct: false }
      ]
    );
    sessionId = serverStartSession(userToken.token, quizId.quizId, 0).body;
    ServerSessionUpdate(userToken.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    ServerSessionUpdate(userToken.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    ServerSessionUpdate(userToken.token, quizId.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
  });
  test('Session Id does not refer to a valid session within this quiz', () => {
    ServerSessionUpdate(userToken.token, quizId.quizId, sessionId.sessionId, 'GO_TO_FINAL_RESULTS');
    const result = ServerQuizSessionResultsCSV(userToken.token, quizId.quizId, 0);
    expect(result.body).toStrictEqual(ERROR);
    expect(result.statusCode).toStrictEqual(400);
  });

  test('Session is not in FINAL_RESULTS state', () => {
    const result = ServerQuizSessionResultsCSV(userToken.token, quizId.quizId, sessionId.sessionId);
    expect(result.body).toEqual(ERROR);
    expect(result.statusCode).toEqual(400);
  });

  test('Token is invalid', () => {
    const result = ServerQuizSessionResultsCSV(
      JSON.stringify({ sessionId: -1 }), quizId.quizId, sessionId.sessionId
    );
    expect(result.body).toEqual(ERROR);
    expect(result.statusCode).toEqual(401);
  });

  test('Token is empty', () => {
    const res = ServerQuizSessionResultsCSV(JSON.stringify(''), quizId.quizId, sessionId.sessionId);
    expect(res.body).toEqual(ERROR);
    expect(res.statusCode).toEqual(401);
  });

  test('user is not an owner of this quiz or quiz doesn\'t exist', () => {
    const res = ServerQuizSessionResultsCSV(userTokenTwo.token, quizId.quizId, sessionId.sessionId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(403);
  });

  test('successful case', () => {
    ServerSessionUpdate(
      userToken.token, quizId.quizId, sessionId.sessionId, 'GO_TO_FINAL_RESULTS'
    );
    const res = ServerQuizSessionResultsCSV(userToken.token, quizId.quizId, sessionId.sessionId);
    expect(res.body).toStrictEqual({ url: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);
  });
});
