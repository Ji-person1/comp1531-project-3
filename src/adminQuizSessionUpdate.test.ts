import {
    ServerAuthRegister,
    ServerQuizCreate,
    ServerQuizCreateQuestion,
    serverStartSession,
    serverPlayerJoin,
    ServerSessionUpdate,
    ServerClear
  } from './ServerTestCallHelper';
  
  const ERROR = { error: expect.any(String) };
  
  beforeEach(() => {
    ServerClear();
  });
  
  describe('Error Cases', () => {
    let userToken: { token: string };
    let quizId: { quizId: number };
    let sessionId: { sessionId: number };
  
    beforeEach(() => {
      userToken = ServerAuthRegister('Swastik1@gmail.com', 'password123', 'Swastik', 'Mishra').body;
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
    });
  
    test('Invalid token', () => {
      const response = ServerSessionUpdate(
        Number(-userToken.token).toString(),
        quizId.quizId,
        sessionId.sessionId,
        'NEXT_QUESTION'
      );
      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual(ERROR);
    });
  
    test('Quiz does not exist', () => {
      const response = ServerSessionUpdate(
        userToken.token,
        -1,
        sessionId.sessionId,
        'NEXT_QUESTION'
      );
      expect(response.statusCode).toBe(403);
      expect(response.body).toEqual(ERROR);
    });
  
    test('Invalid session ID', () => {
      const response = ServerSessionUpdate(
        userToken.token,
        quizId.quizId,
        -1,
        'NEXT_QUESTION'
      );
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual(ERROR);
    });
  
    test('Invalid action', () => {
      const response = ServerSessionUpdate(
        userToken.token,
        quizId.quizId,
        sessionId.sessionId,
        'INVALID_ACTION'
      );
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual(ERROR);
    });
  
    test('Invalid action for current state', () => {
      const response = ServerSessionUpdate(
        userToken.token,
        quizId.quizId,
        sessionId.sessionId,
        'GO_TO_ANSWER' 
      );
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual(ERROR);
    });
  });
  
  describe('Success Cases', () => {
    let userToken: { token: string };
    let quizId: { quizId: number };
    let sessionId: { sessionId: number };
  
    beforeEach(() => {
      userToken = ServerAuthRegister('Swastik1@gmail.com', 'password123', 'Swastik', 'Mishra').body;
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
    });
  
    test('Successful transition from LOBBY to QUESTION_COUNTDOWN', () => {
      const response = ServerSessionUpdate(
        userToken.token,
        quizId.quizId,
        sessionId.sessionId,
        'NEXT_QUESTION'
      );
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({});
    });
  
    test('Full game flow with valid state transitions', async () => {
      let response = ServerSessionUpdate(
        userToken.token,
        quizId.quizId,
        sessionId.sessionId,
        'NEXT_QUESTION'
      );
      expect(response.statusCode).toBe(200);
      response = ServerSessionUpdate(
        userToken.token,
        quizId.quizId,
        sessionId.sessionId,
        'SKIP_COUNTDOWN'
      );
      expect(response.statusCode).toBe(200);

      response = ServerSessionUpdate(
        userToken.token,
        quizId.quizId,
        sessionId.sessionId,
        'GO_TO_ANSWER'
      );
      expect(response.statusCode).toBe(200);

      response = ServerSessionUpdate(
        userToken.token,
        quizId.quizId,
        sessionId.sessionId,
        'GO_TO_FINAL_RESULTS'
      );
      expect(response.statusCode).toBe(200);

      response = ServerSessionUpdate(
        userToken.token,
        quizId.quizId,
        sessionId.sessionId,
        'END'
      );
      expect(response.statusCode).toBe(200);
    });
  
    test('Can end game from any state', () => {
      const response = ServerSessionUpdate(
        userToken.token,
        quizId.quizId,
        sessionId.sessionId,
        'END'
      );
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({});
    });
  });