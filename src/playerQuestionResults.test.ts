import {
  ServerAuthRegister,
  ServerQuizCreate,
  ServerClear,
  ServerQuizCreateQuestion,
  serverStartSession,
  serverPlayerJoin,
  serverPlayerQuestionResults,
  serverAnswerSubmit,
  serverPlayerStatus,
} from './ServerTestCallHelper';
import { GameStage, QuestionBody } from './interfaces';
import { getAnswerId, setAnswerShow, setOpen } from './helper';

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
  let userToken: { token: string };
  let quizId: { quizId: number };
  let sessionId: { sessionId: number };
  let playerId: { playerId: number };
  let questionId: { questionId: number };
  let answerId: number[];

  beforeEach(() => {
    userToken = ServerAuthRegister('neev.saikia123@icloud.com', '1234abcd', 'Neev', 'Saikia').body;
    quizId = ServerQuizCreate(userToken.token, 'functional quiz', 'a test quiz').body;
    questionId = ServerQuizCreateQuestion(userToken.token,
      quizId.quizId, questionBody).body;

    sessionId = serverStartSession(userToken.token, quizId.quizId, 0).body;
    playerId = serverPlayerJoin(sessionId.sessionId, 'Neev').body;
    answerId = getAnswerId(questionId.questionId);
    setOpen(sessionId.sessionId);
    serverAnswerSubmit(playerId.playerId, 1, answerId);
    setAnswerShow(sessionId.sessionId);
  });

  test('Invalid player ID returns error', () => {
    const response = serverPlayerQuestionResults(-1, 1);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(ERROR);
  });

  test('Non-existent player ID returns error', () => {
    const response = serverPlayerQuestionResults(99999, 1);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(ERROR);
  });

  test('Invalid question position returns error', () => {
    const response = serverPlayerQuestionResults(playerId.playerId, -1);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(ERROR);
  });

  test('Question position out of bounds returns error', () => {
    const response = serverPlayerQuestionResults(playerId.playerId, 999);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(ERROR);
  });

  test('Cannot view results before ANSWER_SHOW state', () => {
    const playerStatus = serverPlayerStatus(playerId.playerId).body;
    if (playerStatus.state !== GameStage.ANSWER_SHOW) {
      const response = serverPlayerQuestionResults(playerId.playerId, 1);
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual(ERROR);
    }
  });
});

describe('Success cases', () => {
  let userToken: { token: string };
  let quizId: { quizId: number };
  let sessionId: { sessionId: number };
  let playerId: { playerId: number };
  let questionId: { questionId: number };
  let answerId: number[];

  beforeEach(() => {
    userToken = ServerAuthRegister('neev.saikia123@icloud.com', '1234abcd', 'Neev', 'Saikia').body;
    quizId = ServerQuizCreate(userToken.token, 'functional quiz', 'a test quiz').body;
    questionId = ServerQuizCreateQuestion(userToken.token,
      quizId.quizId, questionBody).body;

    sessionId = serverStartSession(userToken.token, quizId.quizId, 0).body;
    playerId = serverPlayerJoin(sessionId.sessionId, 'Neev').body;
    answerId = getAnswerId(questionId.questionId);
    setOpen(sessionId.sessionId);
    serverAnswerSubmit(playerId.playerId, 1, answerId);
    setAnswerShow(sessionId.sessionId);
  });

  test('Successfully retrieves question results in ANSWER_SHOW state', () => {
    const playerStatus = serverPlayerStatus(playerId.playerId).body;
    expect(playerStatus.state).toBe(GameStage.ANSWER_SHOW);

    const response = serverPlayerQuestionResults(playerId.playerId, 1);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      questionId: expect.any(Number),
      playersCorrect: expect.any(Array),
      averageAnswerTime: expect.any(Number),
      percentCorrect: expect.any(Number),
      numWrong: expect.any(Number),
      numRight: expect.any(Number)
    }));
  });

  test.todo('retrieves results with multiple questions answered');
});
