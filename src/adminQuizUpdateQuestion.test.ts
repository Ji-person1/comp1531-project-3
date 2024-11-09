import {
  ServerAuthRegister, ServerQuizCreate, ServerQuizCreateQuestion,
  ServerQuizUpdateQuestion, ServerClear,
  ServerQuizRemove,
  ServerQuizInfo
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('adminQuizUpdateQuestion', () => {
  let userToken: { token: string };
  let quizId: { quizId: number };
  let questionId: { questionId: number };

  beforeEach(() => {
    userToken = ServerAuthRegister('swastik@example.com', 'password123', 'Swastik', 'Mishra').body;
    quizId = ServerQuizCreate(userToken.token, 'Test Quiz', 'This is a test quiz').body;
    questionId = ServerQuizCreateQuestion(userToken.token,
      quizId.quizId, 'Who is not the Rizzler?', 30, 5, [
        { answer: 'Duke', correct: false },
        { answer: 'Kai', correct: true }
      ]).body;
  });

  test('Question too short', () => {
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, 'a', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Question too long', () => {
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, 'a'.repeat(51), 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Too many answers', () => {
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, 'Who is the Rizzler?', 30, 5, [
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
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, 'Who is the Rizzler?', 30, 5, [
        { answer: 'Kai Cenat', correct: true }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Negative time limit', () => {
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, 'Who is the Rizzler?', -30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('One question duration too long', () => {
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, 'Who is the Rizzler?', 181, 5, [
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
    const resTwo = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, 'Another question?', 91, 5, [
        { answer: 'Yes', correct: true },
        { answer: 'No!', correct: false }
      ]);
    expect(resTwo.statusCode).toStrictEqual(400);
    expect(resTwo.body).toStrictEqual(ERROR);
  });

  test('Points too low', () => {
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, 'Who is the Rizzler?', 30, 0, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Points too high', () => {
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, 'Who is the Rizzler?', 90, 11, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('One character answer', () => {
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, 'Who is the Rizzler?', 90, 11, [
        { answer: 'D', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Answer too long', () => {
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, 'Who is the Rizzler?', 90, 11, [
        { answer: 'D'.repeat(31), correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Duplicate answers', () => {
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, 'Who is the Rizzler?', 90, 11, [
        { answer: 'Kai Cenat', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('No correct answers', () => {
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, 'Who is the Rizzler?', 90, 11, [
        { answer: 'Me', correct: false },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Invalid token', () => {
    const res = ServerQuizUpdateQuestion(Number(-userToken.token).toString(),
      quizId.quizId, questionId.questionId, 'Who is the Rizzler?', 45, 8, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toBe(401);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Token does not own quiz', () => {
    const userTokenTwo = ServerAuthRegister('HaoWu0000@gmail.com', '2734uqsd', 'Hao', 'Wu').body;
    const res = ServerQuizUpdateQuestion(userTokenTwo.token, quizId.quizId,
      questionId.questionId, 'Who is the Rizzler?', 90, 5, [
        { answer: 'Me', correct: false },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toStrictEqual(403);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Quiz does not exist', () => {
    const res = ServerQuizUpdateQuestion(userToken.token, -quizId.quizId,
      questionId.questionId, 'Who is the Rizzler?', 45, 8, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(ERROR);
  });

  test('Question does not exist', () => {
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      -questionId.questionId, 'Who is the Rizzler?', 45, 8, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(ERROR);
  });

  test('Quiz no longer exists exist', () => {
    ServerQuizRemove(userToken.token, quizId.quizId);
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, 'Who is the Rizzler?', 30, 5, [
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
  let questionId: { questionId: number };
  let questionIdTwo: { questionId: number };
  let questionIdThree: { questionId: number };

  beforeEach(() => {
    userToken = ServerAuthRegister('swastik@example.com', 'password123', 'Swastik', 'Mishra').body;
    quizId = ServerQuizCreate(userToken.token, 'Test Quiz', 'This is a test quiz').body;
    questionId = ServerQuizCreateQuestion(userToken.token,
      quizId.quizId, 'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]).body;
    questionIdTwo = ServerQuizCreateQuestion(userToken.token,
      quizId.quizId, 'Who is not the Rizzler?', 30, 6, [
        { answer: 'Duke', correct: false },
        { answer: 'Kai', correct: true }
      ]).body;
    questionIdThree = ServerQuizCreateQuestion(userToken.token,
      quizId.quizId, 'Is this quiz good', 30, 10, [
        { answer: 'Yes', correct: false },
        { answer: 'No', correct: true }
      ]).body;
  });

  test('Successful question update', () => {
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, 'What does it mean when someone takes your food?', 45, 8, [
        { answer: 'Fanum Tax', correct: true },
        { answer: 'bullying', correct: false },
        { answer: 'Sharing', correct: false }
      ]);
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toBe(200);
  });

  test('Successful question update with check', () => {
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, 'What does it mean when someone takes your food?', 45, 8, [
        { answer: 'Fanum Tax', correct: true },
        { answer: 'bullying', correct: false },
        { answer: 'Sharing', correct: false }
      ]);
    expect(res.statusCode).toBe(200);
    const resInfo = ServerQuizInfo(userToken.token, quizId.quizId);
    expect(resInfo.body).toStrictEqual({
      quizId: quizId.quizId,
      name: 'Test Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'This is a test quiz',
      numQuestions: 3,
      questions: [
        {
          questionId: questionId.questionId,
          question: 'What does it mean when someone takes your food?',
          timeLimit: 45,
          points: 8,
          answerOptions: [
            {
              answerId: expect.any(Number),
              answer: 'Fanum Tax',
              colour: expect.any(String),
              correct: true
            },
            {
              answerId: expect.any(Number),
              answer: 'bullying',
              colour: expect.any(String),
              correct: false
            },
            {
              answerId: expect.any(Number),
              answer: 'Sharing',
              colour: expect.any(String),
              correct: false
            }
          ]
        },
        {
          questionId: questionIdTwo.questionId,
          question: 'Who is not the Rizzler?',
          timeLimit: 30,
          points: 6,
          answerOptions: [
            {
              answerId: expect.any(Number),
              answer: 'Duke',
              colour: expect.any(String),
              correct: false
            },
            {
              answerId: expect.any(Number),
              answer: 'Kai',
              colour: expect.any(String),
              correct: true
            },
          ]
        },
        {
          questionId: questionIdThree.questionId,
          question: 'Is this quiz good',
          timeLimit: 30,
          points: 10,
          answerOptions: [
            {
              answerId: expect.any(Number),
              answer: 'Yes',
              colour: expect.any(String),
              correct: false
            },
            {
              answerId: expect.any(Number),
              answer: 'No',
              colour: expect.any(String),
              correct: true
            }
          ]
        }
      ]
    });
    expect(resInfo.statusCode).toStrictEqual(200);
  });
});
