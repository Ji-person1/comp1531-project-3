import { QuestionBody } from './interfaces';
import {
  ServerAuthRegister, ServerQuizCreate,
  ServerClear,
  ServerQuizCreateQuestion,
  serverStartSession,
  serverPlayerJoin,
  serverPlayerQuestionInfo,
  ServerSessionUpdate,
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
      quizId.quizId, questionBody
    );
    sessionId = serverStartSession(UserToken.token, quizId.quizId, 20).body;
    playerId = serverPlayerJoin(sessionId.sessionId, 'hao').body;
    questionPosition = 1;
  });
  test('Player ID does not exist', () => {
    const res = serverPlayerQuestionInfo(-playerId, questionPosition);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Question position is not valid for the session this player is in', () => {
    const res = serverPlayerQuestionInfo(playerId.playerId, 0);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Session is not currently on this question', () => {
    const res = serverPlayerQuestionInfo(0, questionPosition);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Session is in LOBBY state', () => {
    const res = serverPlayerQuestionInfo(playerId.playerId, questionPosition);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Session is in QUESTION_COUNTDOWN state', () => {
    ServerSessionUpdate(UserToken.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    const res = serverPlayerQuestionInfo(playerId.playerId, questionPosition);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Session is in FINAL_RESULTS state', () => {
    ServerSessionUpdate(UserToken.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    ServerSessionUpdate(UserToken.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    ServerSessionUpdate(UserToken.token, quizId.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    ServerSessionUpdate(UserToken.token, quizId.quizId, sessionId.sessionId, 'GO_TO_FINAL_RESULTS');
    const res = serverPlayerQuestionInfo(playerId.playerId, questionPosition);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Session is in END state', () => {
    ServerSessionUpdate(UserToken.token, quizId.quizId, sessionId.sessionId, 'END');
    const res = serverPlayerQuestionInfo(playerId.playerId, questionPosition);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('test successful return', () => {
    ServerSessionUpdate(UserToken.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    ServerSessionUpdate(UserToken.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    const res = serverPlayerQuestionInfo(playerId.playerId, questionPosition);
    expect(res.statusCode).toStrictEqual(200);
  });
});
