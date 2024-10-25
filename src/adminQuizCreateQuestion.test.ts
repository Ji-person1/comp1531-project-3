import {
  ServerAuthRegister, ServerQuizCreate,
  ServerQuizCreateQuestion, ServerClear,
  ServerAuthLogout,
  ServerQuizRemove,
  ServerQuizInfo
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Failure cases', () => {
  let userToken: { token: string };
  let quizId: { quizId: number };

  beforeEach(() => {
    userToken = ServerAuthRegister('swastik@example.com', 'password123', 'Swastik', 'Mishra').body;
    quizId = ServerQuizCreate(userToken.token, 'Test Quiz', 'This is a test quiz').body;
  });
  test('Question too short', () => {
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId,
      'a', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Question too long', () => {
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId,
      'a'.repeat(51), 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Too many answers', () => {
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId,
      'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Due Dennis', correct: false },
        { answer: 'Duk Dennis', correct: false },
        { answer: 'Uke Dennis', correct: false },
        { answer: 'Dke Dennis', correct: false },
        { answer: 'Duke Denns', correct: false },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('One answer', () => {
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId,
      'Who is the Rizzler?', 30, 5, [
        { answer: 'Kai Cenat', correct: true }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Negative time limit', () => {
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId,
      'Who is the Rizzler?', -30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('One question duration too long', () => {
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId,
      'Who is the Rizzler?', 181, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Sum of questions too long', () => {
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId,
      'Who is the Rizzler?', 90, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual({ questionId: expect.any(Number) });
    const resTwo = ServerQuizCreateQuestion(userToken.token, quizId.quizId,
      'Another question?', 91, 5, [
        { answer: 'Yes', correct: true },
        { answer: 'No!', correct: false }
      ]);
    expect(resTwo.statusCode).toStrictEqual(400);
    expect(resTwo.body).toStrictEqual(ERROR);
  });

  test('Points too low', () => {
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId,
      'Who is the Rizzler?', 30, 0, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Points too high', () => {
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId,
      'Who is the Rizzler?', 90, 11, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('One character answer', () => {
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId,
      'Who is the Rizzler?', 90, 11, [
        { answer: 'D', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Answer too long', () => {
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId,
      'Who is the Rizzler?', 90, 11, [
        { answer: 'D'.repeat(31), correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Duplicate answers', () => {
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId,
      'Who is the Rizzler?', 90, 11, [
        { answer: 'Kai Cenat', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('No correct answers', () => {
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId,
      'Who is the Rizzler?', 90, 11, [
        { answer: 'Me', correct: false },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Invalid token', () => {
    const res = ServerQuizCreateQuestion(Number(-userToken.token).toString(), quizId.quizId,
      'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(401);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Logged out token', () => {
    ServerAuthLogout(userToken.token);
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId,
      'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(401);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Quiz does not exist', () => {
    const res = ServerQuizCreateQuestion(userToken.token, -quizId.quizId,
      'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(403);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Quiz no longer exists exist', () => {
    ServerQuizRemove(userToken.token, quizId.quizId);
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId,
      'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(403);
    expect(res.body).toStrictEqual(ERROR);
  });
});

describe('Success cases', () => {
  let userToken: { token: string };
  let quizId: { quizId: number };

  beforeEach(() => {
    userToken = ServerAuthRegister('swastik@example.com', 'password123', 'Swastik', 'Mishra').body;
    quizId = ServerQuizCreate(userToken.token, 'Test Quiz', 'This is a test quiz').body;
  });

  test('Successful question creation', () => {
    const res = ServerQuizCreateQuestion(userToken.token,
      quizId.quizId, 'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual({ questionId: expect.any(Number) });
  });

  test('Second identical quiz', () => {
    const res = ServerQuizCreateQuestion(userToken.token,
      quizId.quizId, 'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(200);
    const resTwo = ServerQuizCreateQuestion(userToken.token,
      quizId.quizId, 'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(resTwo.statusCode).toStrictEqual(200);
    expect(resTwo.body).toStrictEqual({ questionId: expect.any(Number) });
  });

  test('Quizzes show up on quizInfo', () => {
    const res = ServerQuizCreateQuestion(userToken.token,
      quizId.quizId, 'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(200);
    const resInfo = ServerQuizInfo(userToken.token, quizId.quizId);
    expect(resInfo.body).toStrictEqual({
      quizId: quizId.quizId,
      name: 'Test Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'This is a test quiz',
      numQuestions: 1,
      questions: [
        {
          questionId: expect.any(Number),
          question: 'Who is the Rizzler?',
          timeLimit: 30,
          points: 5,
          answerOptions: [
            {
              answerId: expect.any(Number),
              answer: 'Duke Dennis',
              colour: expect.any(String),
              correct: true
            },
            {
              answerId: expect.any(Number),
              answer: 'Kai Cenat',
              colour: expect.any(String),
              correct: false
            }
          ]
        }
      ]
    });
    expect(resInfo.statusCode).toStrictEqual(200);
  });
});
