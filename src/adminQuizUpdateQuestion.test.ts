import { QuestionBody } from './interfaces';
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
  let questionBody: QuestionBody;
  beforeEach(() => {
    userToken = ServerAuthRegister('swastik@example.com', 'password123', 'Swastik', 'Mishra').body;
    quizId = ServerQuizCreate(userToken.token, 'Test Quiz', 'This is a test quiz').body;
    questionBody = {
      question: 'Who is the Rizzler?',
      timeLimit: 30,
      points: 5,
      answerOptions: [
        { answer: 'Duke', correct: true },
        { answer: 'Kai', correct: false }
      ],
    };
    questionId = ServerQuizCreateQuestion(userToken.token,
      quizId.quizId, questionBody).body;
  });

  test('Question too short', () => {
    questionBody.question = 'a';
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Question too long', () => {
    questionBody.question = 'a'.repeat(51);
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, questionBody);
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
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('One answer', () => {
    questionBody.answerOptions = [
      { answer: 'Kai Cenat', correct: true }
    ];
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Negative time limit', () => {
    questionBody.timeLimit = -30;
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('One question duration too long', () => {
    questionBody.timeLimit = 181;
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Sum of questions too long', () => {
    questionBody.timeLimit = 90;
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, questionBody);
    expect(res.statusCode).toStrictEqual(200);
    expect(res.body).toStrictEqual({});
    questionBody.timeLimit = 91;
    const resTwo = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, questionBody);
    expect(resTwo.statusCode).toStrictEqual(400);
    expect(resTwo.body).toStrictEqual(ERROR);
  });

  test('Points too low', () => {
    questionBody.points = 0;
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Points too high', () => {
    questionBody.points = 11;
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('One character answer', () => {
    questionBody.answerOptions[0].answer = '';
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Answer too long', () => {
    questionBody.answerOptions[0].answer = 'D'.repeat(51);
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Duplicate answers', () => {
    questionBody.answerOptions[0].answer = questionBody.answerOptions[1].answer;
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('No correct answers', () => {
    questionBody.answerOptions[0].correct = false;
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, questionBody);
    expect(res.statusCode).toStrictEqual(400);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Invalid token', () => {
    const res = ServerQuizUpdateQuestion(Number(-userToken.token).toString(), quizId.quizId,
      questionId.questionId, questionBody);
    expect(res.statusCode).toBe(401);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Token does not own quiz', () => {
    const userTokenTwo = ServerAuthRegister('HaoWu0000@gmail.com', '2734uqsd', 'Hao', 'Wu').body;
    const res = ServerQuizUpdateQuestion(userTokenTwo.token, quizId.quizId,
      questionId.questionId, questionBody);
    expect(res.statusCode).toStrictEqual(403);
    expect(res.body).toStrictEqual(ERROR);
  });

  test('Quiz does not exist', () => {
    const res = ServerQuizUpdateQuestion(userToken.token, -quizId.quizId,
      questionId.questionId, questionBody);
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(ERROR);
  });

  test('Question does not exist', () => {
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      -questionId.questionId, questionBody);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(ERROR);
  });

  test('Quiz no longer exists exist', () => {
    ServerQuizRemove(userToken.token, quizId.quizId);
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, questionBody);
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
  let questionBody: QuestionBody;
  let questionBody2: QuestionBody;
  let questionBody3: QuestionBody;
  let questionBody4: QuestionBody;

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
      ]
    };
    questionBody2 = {
      question: 'Who is not the Rizzler?',
      timeLimit: 30,
      points: 6,
      answerOptions: [
        { answer: 'Duke', correct: false },
        { answer: 'Kai', correct: true }
      ]
    };
    questionBody3 = {
      question: 'Is this quiz good',
      timeLimit: 30,
      points: 10,
      answerOptions: [
        { answer: 'Yes', correct: false },
        { answer: 'No', correct: true }
      ]
    };
    questionBody4 = {
      question: 'What does it mean when someone takes your food?',
      timeLimit: 45,
      points: 8,
      answerOptions: [
        { answer: 'Fanum Tax', correct: true },
        { answer: 'bullying', correct: false },
        { answer: 'Sharing', correct: false }
      ]
    };
    questionId = ServerQuizCreateQuestion(userToken.token,
      quizId.quizId, questionBody).body;
    questionIdTwo = ServerQuizCreateQuestion(userToken.token,
      quizId.quizId, questionBody2).body;
    questionIdThree = ServerQuizCreateQuestion(userToken.token,
      quizId.quizId, questionBody3).body;
  });

  test('Successful question update', () => {
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, questionBody4);
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toBe(200);
  });

  test('Successful question update with check', () => {
    const res = ServerQuizUpdateQuestion(userToken.token, quizId.quizId,
      questionId.questionId, questionBody4);
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
