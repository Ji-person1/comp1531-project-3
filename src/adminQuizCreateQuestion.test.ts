import {
  ServerAuthRegister, ServerQuizCreate,
  ServerQuizCreateQuestion, ServerClear
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('adminQuizCreateQuestion', () => {
  let user1Token: { token: string };
  let quizId: { quizId: number };

  beforeEach(() => {
    user1Token = ServerAuthRegister('swastik@example.com', 'password123', 'Swastik', 'Mishra').body;
    quizId = ServerQuizCreate(user1Token.token, 'Test Quiz', 'This is a test quiz').body;
  });

  test('Successful question creation', () => {
    const res = ServerQuizCreateQuestion(user1Token.token,
      quizId.quizId, 'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('questionId');
  });

  test('Invalid token', () => {
    const res = ServerQuizCreateQuestion('invalid_token', quizId.quizId,
      'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual(ERROR);
  });

  test('Quiz does not exist', () => {
    const res = ServerQuizCreateQuestion(user1Token.token, 999, 'Who is the Rizzler?', 30, 5, [
      { answer: 'Duke Dennis', correct: true },
      { answer: 'Kai Cenat', correct: false }
    ]);
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(ERROR);
  });

  test('Question too short', () => {
    const res = ServerQuizCreateQuestion(user1Token.token, quizId.quizId, 'Riz?', 30, 5, [
      { answer: 'Yes', correct: true },
      { answer: 'No', correct: false }
    ]);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(ERROR);
  });
});
