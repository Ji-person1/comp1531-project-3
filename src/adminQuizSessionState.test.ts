import {
  ServerAuthRegister,
  ServerQuizCreate,
  ServerQuizCreateQuestion,
  serverStartSession,
  serverPlayerJoin,
  ServerSessionStatus,
  ServerClear
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
  let userToken: { token: string };
  let quizId: { quizId: number };
  let sessionId: { sessionId: number };

  beforeEach(() => {
    userToken = ServerAuthRegister('Swastik1@gmail.com', 'password123', 'Swastik', 'Mishra').body;
    quizId = ServerQuizCreate(userToken.token, 'Test Quiz', 'this is a test quiz').body;
    ServerQuizCreateQuestion(
      userToken.token,
      quizId.quizId,
      questionBody
    );
    sessionId = serverStartSession(userToken.token, quizId.quizId, 0).body;
  });

  test('Invalid token', () => {
    const response = ServerSessionStatus(
      Number(-userToken.token).toString(),
      quizId.quizId,
      sessionId.sessionId
    );
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual(ERROR);
  });

  test('Quiz does not exist', () => {
    const response = ServerSessionStatus(
      userToken.token,
      -1,
      sessionId.sessionId
    );
    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual(ERROR);
  });

  test('Invalid session ID', () => {
    const response = ServerSessionStatus(
      userToken.token,
      quizId.quizId,
      -1
    );
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(ERROR);
  });

  test('User is not quiz owner', () => {
    const otherUser = ServerAuthRegister('Swastik2@example.com', 'password123',
      'Neo', 'Mishra').body;
    const response = ServerSessionStatus(
      otherUser.token,
      quizId.quizId,
      sessionId.sessionId
    );
    expect(response.statusCode).toBe(403);
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
      questionBody
    );
    sessionId = serverStartSession(userToken.token, quizId.quizId, 0).body;
  });

  test('Successfully get session status with no players', () => {
    const response = ServerSessionStatus(
      userToken.token,
      quizId.quizId,
      sessionId.sessionId
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      state: 'LOBBY',
      atQuestion: 0,
      players: [],
      metadata: {
        quizId: quizId.quizId,
        name: 'Test Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is a test quiz',
        numQuestions: 1,
        questions: expect.any(Array),
        timeLimit: 30,
      }
    });
  });

  test('Successfully get session status with players', () => {
    serverPlayerJoin(sessionId.sessionId, 'Swastik');
    serverPlayerJoin(sessionId.sessionId, 'Neo');

    const response = ServerSessionStatus(
      userToken.token,
      quizId.quizId,
      sessionId.sessionId
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      state: 'LOBBY',
      atQuestion: 0,
      players: ['Swastik', 'Neo'],
      metadata: {
        quizId: quizId.quizId,
        name: 'Test Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is a test quiz',
        numQuestions: 1,
        questions: expect.any(Array),
        timeLimit: 30,
      }
    });
  });
});
