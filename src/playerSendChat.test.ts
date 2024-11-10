import {
  ServerAuthRegister,
  ServerQuizCreate,
  ServerClear,
  ServerQuizCreateQuestion,
  serverStartSession,
  serverPlayerJoin,
  ServerSendChat
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
    UserToken = ServerAuthRegister('neev.saikia123@icloud.com', '1234abcd', 'Neev', 'Saikia').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    ServerQuizCreateQuestion(UserToken.token,
      quizId.quizId, 'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    sessionId = serverStartSession(UserToken.token, quizId.quizId, 20).body;
    playerId = serverPlayerJoin(sessionId.sessionId, 'Swapnav').body;
  });

  test('Invalid player ID', () => {
    const invalidPlayerId = -1;
    const response = ServerSendChat(invalidPlayerId, 'Hello World');
    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual(ERROR);
  });

  test('Message too short (empty message)', () => {
    const response = ServerSendChat(playerId.playerId, '');
    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual(ERROR);
  });

  test('Message too long (>100 characters)', () => {
    const longMessage = 'a'.repeat(101);
    const response = ServerSendChat(playerId.playerId, longMessage);
    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual(ERROR);
  });

  test('Player not in any active session', () => {
    const newToken = ServerAuthRegister('new.user@email.com', '1234abcd', 'New', 'User').body;
    const newQuizId = ServerQuizCreate(newToken.token, 'new quiz', 'test quiz').body;
    const newSessionId = serverStartSession(newToken.token, newQuizId.quizId, 20).body;
    const newPlayerId = serverPlayerJoin(newSessionId.sessionId, 'NewPlayer').body;

    ServerClear();

    const response = ServerSendChat(newPlayerId.playerId, 'Hello World');
    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual(ERROR);
  });
});

describe('Success Cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let sessionId: { sessionId: number };
  let playerId: { playerId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('neev.saikia123@icloud.com', '1234abcd', 'Neev', 'Saikia').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    ServerQuizCreateQuestion(UserToken.token,
      quizId.quizId, 'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    sessionId = serverStartSession(UserToken.token, quizId.quizId, 20).body;
    playerId = serverPlayerJoin(sessionId.sessionId, 'Swapnav').body;
  });

  test('Successfully send a chat message', () => {
    const response = ServerSendChat(playerId.playerId, 'Hello World');
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({});
  });

  test('Successfully send multiple chat messages', () => {
    const response1 = ServerSendChat(playerId.playerId, 'First message');
    const response2 = ServerSendChat(playerId.playerId, 'Second message');
    const response3 = ServerSendChat(playerId.playerId, 'Third message');

    expect(response1.statusCode).toBe(200);
    expect(response1.body).toStrictEqual({});
    expect(response2.statusCode).toBe(200);
    expect(response2.body).toStrictEqual({});
    expect(response3.statusCode).toBe(200);
    expect(response3.body).toStrictEqual({});
  });

  test.todo('Multiple players sending chat messages');

  test('Send message with maximum allowed length', () => {
    const maxMessage = 'a'.repeat(100);
    const response = ServerSendChat(playerId.playerId, maxMessage);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({});
  });
});
