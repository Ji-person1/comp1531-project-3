import {
  ServerAuthRegister,
  ServerQuizCreate,
  ServerClear,
  ServerQuizCreateQuestion,
  serverStartSession,
  serverPlayerJoin,
  ServerViewChat,
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
  let PlayerId: { playerId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    ServerQuizCreateQuestion(UserToken.token,
      quizId.quizId, 'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    sessionId = serverStartSession(UserToken.token, quizId.quizId, 20).body;
    PlayerId = serverPlayerJoin(sessionId.sessionId, 'Jim').body;
  });

  test('player ID does not exist', () => {
    const response = ServerViewChat(-1);
    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual(ERROR);
  });

  test('invalid player ID type', () => {
    const response = ServerViewChat(PlayerId.playerId + 1000);
    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual(ERROR);
  });
});

describe('Success Cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let sessionId: { sessionId: number };
  let PlayerId1: { playerId: number };
  let PlayerId2: { playerId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('jim.zheng123@icloud.com', '1234abcd', 'Jim', 'Zheng').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    ServerQuizCreateQuestion(UserToken.token,
      quizId.quizId, 'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    sessionId = serverStartSession(UserToken.token, quizId.quizId, 20).body;
    PlayerId1 = serverPlayerJoin(sessionId.sessionId, 'Jim').body;
    PlayerId2 = serverPlayerJoin(sessionId.sessionId, 'Bob').body;
  });

  test('empty chat history', () => {
    const response = ServerViewChat(PlayerId1.playerId);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual([]);
  });

  test('single message in chat', () => {
    ServerSendChat(PlayerId1.playerId, 'Hello World!');
    const response = ServerViewChat(PlayerId1.playerId);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([{
      playerId: PlayerId1.playerId,
      playerName: 'Jim',
      message: 'Hello World!',
      timeSent: expect.any(Number)
    }]);
  });

  test('multiple messages in order', () => {
    ServerSendChat(PlayerId1.playerId, 'Message 1');
    ServerSendChat(PlayerId2.playerId, 'Message 2');
    ServerSendChat(PlayerId1.playerId, 'Message 3');
    
    const response = ServerViewChat(PlayerId1.playerId);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].message).toBe('Message 1');
    expect(response.body[1].message).toBe('Message 2');
    expect(response.body[2].message).toBe('Message 3');
    // Verify timestamps are in order
    expect(response.body[0].timeSent).toBeLessThan(response.body[1].timeSent);
    expect(response.body[1].timeSent).toBeLessThan(response.body[2].timeSent);
  });

  test('messages from different sessions not mixed', () => {
    // Create a second session
    const sessionId2 = serverStartSession(UserToken.token, quizId.quizId, 20).body;
    const PlayerId3 = serverPlayerJoin(sessionId2.sessionId, 'Alice').body;
    
    ServerSendChat(PlayerId1.playerId, 'Session 1 message');
    ServerSendChat(PlayerId3.playerId, 'Session 2 message');
    
    const response = ServerViewChat(PlayerId1.playerId);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].message).toBe('Session 1 message');
  });
});

