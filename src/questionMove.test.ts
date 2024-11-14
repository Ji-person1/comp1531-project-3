import {
  ServerAuthRegister,
  ServerQuizCreate,
  ServerQuizCreateQuestion,
  ServerQuestionMove,
  ServerClear,
  ServerQuizInfo
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Error cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let questionId: { questionId: number };
  let questionIdTwo: { questionId: number };
  let questionIdThree: { questionId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('HaoWu0000@gmail.com', '2734uqsd', 'Hao', 'Wu').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    const questionBody = {
      question: 'Who is the Rizzler?',
      timeLimit: 30,
      points: 5,
      answerOptions: [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ],
    };
    const questionBody2 = {
      question: 'Who is not the Rizzler?',
      timeLimit: 30,
      points: 6,
      answerOptions: [
        { answer: 'Duke Dennis', correct: false },
        { answer: 'Kai Cenat', correct: true }
      ],
    };
    const questionBody3 = {
      question: 'Is hawk tuah funny?',
      timeLimit: 30,
      points: 500,
      answerOptions: [
        { answer: 'yes', correct: false },
        { answer: 'no', correct: true }
      ]
    };
    questionId = ServerQuizCreateQuestion(UserToken.token, quizId.quizId,
      questionBody).body;
    questionIdTwo = ServerQuizCreateQuestion(UserToken.token, quizId.quizId,
      questionBody2).body;
    questionIdThree = ServerQuizCreateQuestion(UserToken.token, quizId.quizId,
      questionBody3).body;
  });

  test('invalid token', () => {
    const res = ServerQuestionMove('-1', quizId.quizId, questionId.questionId, 1);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(401);
  });

  test('quiz does not exist', () => {
    const res = ServerQuestionMove(UserToken.token, -quizId.quizId, questionId.questionId, 1);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(403);
  });

  test('Not the owner of the quiz', () => {
    const otherUserToken = ServerAuthRegister('1dq11333@gmail.com', '1234abcd', 'Hao', 'Wu').body;
    const res = ServerQuestionMove(otherUserToken.token, quizId.quizId, questionId.questionId, 1);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(403);
  });

  test('question does not exist', () => {
    const res = ServerQuestionMove(UserToken.token, quizId.quizId, -questionId.questionId, 1);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(400);
  });

  test('position does not exist', () => {
    const res = ServerQuestionMove(UserToken.token, quizId.quizId, questionId.questionId, -1);
    const resTwo = ServerQuestionMove(UserToken.token, quizId.quizId,
      questionIdTwo.questionId, 100);
    expect(res.body).toStrictEqual(ERROR);
    expect(resTwo.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(400);
    expect(resTwo.statusCode).toBe(400);
  });

  test('NewPosition is the position of the current question', () => {
    const res = ServerQuestionMove(UserToken.token, quizId.quizId, questionIdThree.questionId, 2);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(400);
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
    const questionBody = {
      question: 'Who is the Rizzler?',
      timeLimit: 30,
      points: 5,
      answerOptions: [
        { answer: 'Duke', correct: true },
        { answer: 'Kai', correct: false }
      ],
    };
    const questionBody2 = {
      question: 'Who is not the Rizzler?',
      timeLimit: 30,
      points: 6,
      answerOptions: [
        { answer: 'Duke', correct: false },
        { answer: 'Kai', correct: true }
      ],
    };
    const questionBody3 = {
      question: 'Is this quiz good?',
      timeLimit: 30,
      points: 10,
      answerOptions: [
        { answer: 'Yes', correct: false },
        { answer: 'No', correct: true }
      ]
    };
    questionId = ServerQuizCreateQuestion(userToken.token,
      quizId.quizId, questionBody).body;
    questionIdTwo = ServerQuizCreateQuestion(userToken.token,
      quizId.quizId, questionBody2).body;
    questionIdThree = ServerQuizCreateQuestion(userToken.token,
      quizId.quizId, questionBody3).body;
  });

  test('position 0 to 1', () => {
    const res = ServerQuestionMove(userToken.token, quizId.quizId, questionId.questionId, 1);
    expect(res.body).toStrictEqual({});
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
          questionId: expect.any(Number),
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
          questionId: expect.any(Number),
          question: 'Who is the Rizzler?',
          timeLimit: 30,
          points: 5,
          answerOptions: [
            {
              answerId: expect.any(Number),
              answer: 'Duke',
              colour: expect.any(String),
              correct: true
            },
            {
              answerId: expect.any(Number),
              answer: 'Kai',
              colour: expect.any(String),
              correct: false
            }
          ]
        },
        {
          questionId: expect.any(Number),
          question: 'Is this quiz good?',
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

  test('Reverse move', () => {
    const res = ServerQuestionMove(userToken.token, quizId.quizId, questionIdTwo.questionId, 0);
    expect(res.body).toStrictEqual({});
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
          questionId: expect.any(Number),
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
          questionId: expect.any(Number),
          question: 'Who is the Rizzler?',
          timeLimit: 30,
          points: 5,
          answerOptions: [
            {
              answerId: expect.any(Number),
              answer: 'Duke',
              colour: expect.any(String),
              correct: true
            },
            {
              answerId: expect.any(Number),
              answer: 'Kai',
              colour: expect.any(String),
              correct: false
            }
          ]
        },
        {
          questionId: expect.any(Number),
          question: 'Is this quiz good?',
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

  test('Move final to head', () => {
    const res = ServerQuestionMove(userToken.token, quizId.quizId, questionIdThree.questionId, 0);
    expect(res.body).toStrictEqual({});
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
          questionId: expect.any(Number),
          question: 'Is this quiz good?',
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
        },
        {
          questionId: expect.any(Number),
          question: 'Who is the Rizzler?',
          timeLimit: 30,
          points: 5,
          answerOptions: [
            {
              answerId: expect.any(Number),
              answer: 'Duke',
              colour: expect.any(String),
              correct: true
            },
            {
              answerId: expect.any(Number),
              answer: 'Kai',
              colour: expect.any(String),
              correct: false
            }
          ]
        },
        {
          questionId: expect.any(Number),
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
        }
      ]
    });
    expect(resInfo.statusCode).toStrictEqual(200);
  });
});
