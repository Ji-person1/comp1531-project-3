import { QuestionBody } from './interfaces';
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
  let questionBody: QuestionBody;
  let questionBody2: QuestionBody;
  beforeEach(() => {
    userToken = ServerAuthRegister('swastik@example.com', 'password123', 'Swastik', 'Mishra').body;
    quizId = ServerQuizCreate(userToken.token, 'Test Quiz', 'This is a test quiz').body;
    questionBody = {
      question: 'Who is the Rizzler?',
      timeLimit: 30,
      points: 5,
      answerOptions: [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ],
    };
  });
  test('Question too short', () => {
    questionBody.question = 'a';
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Question too long', () => {
    questionBody.question = 'a'.repeat(51);
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Too many answers', () => {
    questionBody.answerOptions = [
      { answer: 'Duke Dennis', correct: true },
      { answer: 'Due Dennis', correct: false },
      { answer: 'Duk Dennis', correct: false },
      { answer: 'Uke Dennis', correct: false },
      { answer: 'Dke Dennis', correct: false },
      { answer: 'Duke Denns', correct: false },
      { answer: 'Kai Cenat', correct: false }
    ];
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('One answer', () => {
    questionBody.answerOptions = [
      { answer: 'Kai Cenat', correct: true }
    ];
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Negative time limit', () => {
    questionBody.timeLimit = -30;
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('One question duration too long', () => {
    questionBody.timeLimit = 181;
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Sum of questions too long', () => {
    questionBody.timeLimit = 90;
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual({ questionId: expect.any(Number) });
    questionBody2 = {
      question: 'Another question?',
      timeLimit: 91,
      points: 5,
      answerOptions: [
        { answer: 'Yes', correct: true },
        { answer: 'No!', correct: false }
      ]
    };
    const resTwo = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody2);
    expect(resTwo.statusCode).toStrictEqual(400);
    expect(resTwo.body).toStrictEqual(ERROR);
  });

  test('Points too low', () => {
    questionBody.points = 0;
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Points too high', () => {
    questionBody.points = 11;
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('One character answer', () => {
    questionBody.answerOptions = [
      { answer: '', correct: true },
      { answer: 'Kai Cenat', correct: false }
    ];
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Answer too long', () => {
    questionBody.answerOptions = [
      { answer: 'D'.repeat(51), correct: true },
      { answer: 'Kai Cenat', correct: false }
    ];
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Duplicate answers', () => {
    questionBody.answerOptions = [
      { answer: 'Kai Cenat', correct: true },
      { answer: 'Kai Cenat', correct: false }
    ];
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('No correct answers', () => {
    questionBody.answerOptions = [
      { answer: 'Duke Dennis', correct: false },
      { answer: 'Kai Cenat', correct: false }
    ];
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Invalid token', () => {
    const res = ServerQuizCreateQuestion(
      Number(-userToken.token).toString(), quizId.quizId, questionBody
    );
    expect(res.statusCode).toStrictEqual(401);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Logged out token', () => {
    ServerAuthLogout(userToken.token);
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody);
    expect(res.statusCode).toStrictEqual(401);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Quiz does not exist', () => {
    const res = ServerQuizCreateQuestion(userToken.token, -quizId.quizId, questionBody);
    expect(res.statusCode).toStrictEqual(403);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Quiz no longer exists exist', () => {
    ServerQuizRemove(userToken.token, quizId.quizId);
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody);
    expect(res.statusCode).toStrictEqual(403);
    expect(res.body).toStrictEqual(ERROR);
  });
});

describe('Success cases', () => {
  let userToken: { token: string };
  let quizId: { quizId: number };
  let questionBody: QuestionBody;

  beforeEach(() => {
    userToken = ServerAuthRegister('swastik@example.com', 'password123', 'Swastik', 'Mishra').body;
    quizId = ServerQuizCreate(userToken.token, 'Test Quiz', 'This is a test quiz').body;
    questionBody = {
      question: 'Who is the Rizzler?',
      timeLimit: 30,
      points: 5,
      answerOptions: [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ],
    };
  });

  test('Successful question creation', () => {
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual({ questionId: expect.any(Number) });
  });

  test('Second identical quiz', () => {
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody);
    expect(res.statusCode).toStrictEqual(200);
    const resTwo = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody);
    expect(resTwo.statusCode).toStrictEqual(200);
    expect(resTwo.body).toStrictEqual({ questionId: expect.any(Number) });
  });

  test('Quizzes show up on quizInfo', () => {
    const res = ServerQuizCreateQuestion(userToken.token, quizId.quizId, questionBody);
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
