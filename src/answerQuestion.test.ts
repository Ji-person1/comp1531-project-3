import {
    ServerAuthRegister, ServerQuizCreate,
    ServerClear,
    ServerQuizCreateQuestion,
    serverStartSession,
    serverPlayerJoin,
    serverAnswerSubmit
  } from './ServerTestCallHelper';

import { getAnswerId, setLobby, setOpen } from './helper';
  
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Error Cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let questionId: { questionId: number };
  let sessionId: { sessionId: number };
  let playerId: { playerId: number };
  let answerIds: { answerIds: number[] }; 

  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    questionId = ServerQuizCreateQuestion(UserToken.token,
      quizId.quizId, 'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]).body;
      
    sessionId = serverStartSession(UserToken.token, quizId.quizId, 20).body;
    playerId = serverPlayerJoin(sessionId.sessionId, 'Jim').body;
    answerIds = { answerIds: getAnswerId(questionId.questionId)}
    setOpen(sessionId.sessionId); 
  });

  test('Invalid player ID', () => {
    const response = serverAnswerSubmit(-playerId.playerId, 1, answerIds.answerIds);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(ERROR);
  });

  test('invalid questionPosition', () => {
    const response = serverAnswerSubmit(playerId.playerId, 2, answerIds.answerIds);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(ERROR);
  });

  test('Quizsession not open', () => {
    setLobby(sessionId.sessionId); 
    const response = serverAnswerSubmit(playerId.playerId, 1, answerIds.answerIds);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(ERROR);
  });

  test('Session not on question', () => {
    setLobby(sessionId.sessionId); 
    const response = serverAnswerSubmit(playerId.playerId, 1, answerIds.answerIds);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(ERROR);
  });

  test.todo('Do a test for when we can change sessions');

  test('Session not on question', () => {
    setLobby(sessionId.sessionId); 
    const response = serverAnswerSubmit(playerId.playerId, 1, []);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(ERROR);
  });
});

describe('Success Cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let questionId: { questionId: number };
  let sessionId: { sessionId: number };
  let playerId: { playerId: number };
  let answerIds: { answerIds: number[] }; 

  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    questionId = ServerQuizCreateQuestion(UserToken.token,
      quizId.quizId, 'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]).body;
      
    sessionId = serverStartSession(UserToken.token, quizId.quizId, 20).body;
    playerId = serverPlayerJoin(sessionId.sessionId, 'Jim').body;
    answerIds = { answerIds: getAnswerId(questionId.questionId)}
    setOpen(sessionId.sessionId); 
  });

  test('basic return check', () => {
    const response = serverAnswerSubmit(playerId.playerId, 1, answerIds.answerIds);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ playerId: expect.any(Number) });
  });

  test.todo('add a test with status');

  test.todo('add a test with current information of player');
});
