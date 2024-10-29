import {
  ServerAuthRegister, ServerQuizCreate, ServerQuizCreateQuestion,
  ServerQuizUpdateQuestion, ServerClear
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('adminQuizUpdateQuestion', () => {
  let user1Token: { token: string };
  let quizId: { quizId: number };
  let questionId: { questionId: number };

  beforeEach(() => {
    user1Token = ServerAuthRegister('swastik@example.com', 'password123', 'Swastik', 'Mishra').body;
    quizId = ServerQuizCreate(user1Token.token, 'Test Quiz', 'This is a test quiz').body;
    questionId = ServerQuizCreateQuestion(user1Token.token,
      quizId.quizId, 'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]).body;
  });

  test('Successful question update', () => {
    const res = ServerQuizUpdateQuestion(user1Token.token, quizId.quizId,
      questionId.questionId, 'What does it mean when someone takes your food?', 45, 8, [
        { answer: 'Fanum Tax', correct: true },
        { answer: 'bullying', correct: false },
        { answer: 'Sharing', correct: false }
      ]);
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toBe(200);
  });

  test('Invalid token', () => {
    const res = ServerQuizUpdateQuestion('invalid_token', quizId.quizId,
      questionId.questionId, 'Who is the Rizzler?', 45, 8, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toBe(401);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Quiz does not exist', () => {
    const res = ServerQuizUpdateQuestion(user1Token.token, -quizId.quizId,
      questionId.questionId, 'Who is the Rizzler?', 45, 8, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(ERROR);
  });

  test('Question does not exist', () => {
    const res = ServerQuizUpdateQuestion(user1Token.token, quizId.quizId,
      -questionId.questionId, 'Who is the Rizzler?', 45, 8, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(ERROR);
  });
});
