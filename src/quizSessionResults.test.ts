import {
  ServerAuthRegister,
  ServerQuizCreate,
  ServerQuizCreateQuestion,
  serverStartSession,
  ServerSessionUpdate,
  ServerQuizSessionResults,
  ServerClear,
  serverAnswerSubmit,
  serverPlayerJoin,
  serverPlayerQuestionInfo
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
  ],
};

describe('Error Cases', () => {
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
      questionBody
    );
    sessionId = serverStartSession(userToken.token, quizId.quizId, 0).body;
  });

  test('Session Id does not refer to a valid session within this quiz', () => {
    ServerSessionUpdate(userToken.token, quizId.quizId, sessionId.sessionId, 'GO_TO_FINAL_RESULTS');
    const result = ServerQuizSessionResults(userToken.token, quizId.quizId, 0);
    expect(result.body).toStrictEqual(ERROR);
    expect(result.statusCode).toStrictEqual(400);
  });

  test('Session is not in FINAL_RESULTS state', () => {
    const result = ServerQuizSessionResults(userToken.token, quizId.quizId, sessionId.sessionId);
    expect(result.body).toEqual(ERROR);
    expect(result.statusCode).toEqual(400);
  });

  test('Token is invalid', () => {
    const result = ServerQuizSessionResults(
      JSON.stringify({ sessionId: -1 }), quizId.quizId, sessionId.sessionId
    );
    expect(result.body).toEqual(ERROR);
    expect(result.statusCode).toEqual(401);
  });

  test('Token is empty', () => {
    const result = ServerQuizSessionResults(JSON.stringify(''), quizId.quizId, sessionId.sessionId);
    expect(result.body).toEqual(ERROR);
    expect(result.statusCode).toEqual(401);
  });

  test('user is not an owner of this quiz or quiz doesn\'t exist', () => {
    const result = ServerQuizSessionResults(userTokenTwo.token, quizId.quizId, sessionId.sessionId);
    expect(result.body).toStrictEqual(ERROR);
    expect(result.statusCode).toStrictEqual(403);
  });

  test('quiz doesn\'t exist', () => {
    const result = ServerQuizSessionResults(userToken.token, -quizId.quizId, sessionId.sessionId);
    expect(result.body).toStrictEqual(ERROR);
    expect(result.statusCode).toStrictEqual(403);
  });
});

describe('Successful Cases', () => {
  let userToken: { token: string };
  let quizId: { quizId: number };
  let sessionId: { sessionId: number };
  let player: { playerId: number};
  let player2: { playerId: number};
  let correctAnswerId: number;

  beforeEach(() => {
    userToken = ServerAuthRegister('HaoWu1@gmail.com', 'password123', 'Hao', 'Wu').body;
    quizId = ServerQuizCreate(userToken.token, 'Test Quiz', 'This is a test quiz').body;
    ServerQuizCreateQuestion(
      userToken.token,
      quizId.quizId,
      questionBody
    );
    sessionId = serverStartSession(userToken.token, quizId.quizId, 0).body;
    player = serverPlayerJoin(sessionId.sessionId, 'Hao').body;
    player2 = serverPlayerJoin(sessionId.sessionId, 'Sam').body;

    ServerSessionUpdate(userToken.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    ServerSessionUpdate(userToken.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    correctAnswerId = serverPlayerQuestionInfo(player.playerId, 1).body.answerOptions[0].answerId;
    serverAnswerSubmit(player.playerId, 1, [correctAnswerId]);
  });

  test('one answer', () => {
    ServerSessionUpdate(userToken.token, quizId.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    ServerSessionUpdate(userToken.token, quizId.quizId, sessionId.sessionId, 'GO_TO_FINAL_RESULTS');
    const result = ServerQuizSessionResults(userToken.token, quizId.quizId, sessionId.sessionId);
    expect(result.body).toStrictEqual({
      questionResults: [{
        averageAnswerTime: 0,
        percentCorrect: null,
        playersCorrect: ['Hao'],
        questionId: expect.any(Number),
      }],
      usersRankedByScore: [
        {
          playerName: 'Hao',
          score: expect.any(Number),
        },
        {
          playerName: 'Sam',
          score: expect.any(Number)
        }
      ],
    });
    expect(result.statusCode).toStrictEqual(200);
  });

  test('two users', () => {
    serverAnswerSubmit(player2.playerId, 1, [correctAnswerId]);
    ServerSessionUpdate(userToken.token, quizId.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    ServerSessionUpdate(userToken.token, quizId.quizId, sessionId.sessionId, 'GO_TO_FINAL_RESULTS');
    const result = ServerQuizSessionResults(userToken.token, quizId.quizId, sessionId.sessionId);
    expect(result.body).toStrictEqual({
      questionResults: [{
        averageAnswerTime: expect.any(Number),
        percentCorrect: expect.any(Number),
        playersCorrect: ['Hao', 'Sam'],
        questionId: expect.any(Number),
      }],
      usersRankedByScore: [
        { playerName: 'Hao', score: expect.any(Number) },
        { playerName: 'Sam', score: expect.any(Number) }
      ],
    });
    expect(result.statusCode).toStrictEqual(200);
  });
});
