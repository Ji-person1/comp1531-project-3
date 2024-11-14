import {
  ServerAuthRegister,
  ServerQuizCreate,
  ServerQuizCreateQuestion,
  ServerQuestionDuplicate,
  ServerClear,
  ServerQuizQuestionDelete,
  ServerQuizInfo,
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

describe('Error cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let questionId: { questionId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('HaoWu0000@gmail.com', '2734uqsd', 'Hao', 'Wu').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    questionId = ServerQuizCreateQuestion(UserToken.token, quizId.quizId,
      questionBody).body;
  });

  test('question does not exist', () => {
    const res = ServerQuestionDuplicate(UserToken.token, quizId.quizId, -questionId.questionId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(400);
  });

  test('question no longer exists', () => {
    ServerQuizQuestionDelete(UserToken.token, quizId.quizId, questionId.questionId);
    const res = ServerQuestionDuplicate(UserToken.token, quizId.quizId, questionId.questionId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(400);
  });

  test('invalid token', () => {
    const res = ServerQuestionDuplicate(Number(-UserToken.token).toString(),
      quizId.quizId, questionId.questionId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(401);
  });

  test('quiz does not exist', () => {
    const res = ServerQuestionDuplicate(UserToken.token, -quizId.quizId, questionId.questionId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(403);
  });

  test('Not the owner of the quiz', () => {
    const otherUserToken = ServerAuthRegister('1dq11333@gmail.com', '1234abcd', 'Hao', 'Wu').body;
    const res = ServerQuestionDuplicate(otherUserToken.token, quizId.quizId, questionId.questionId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toBe(403);
  });
});

describe('Success cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let questionId: { questionId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('1dq11333@gmail.com', '1234abcd', 'Hao', 'Wu').body;
    quizId = ServerQuizCreate(UserToken.token, 'first quiz', 'a test quiz').body;
    questionId = ServerQuizCreateQuestion(UserToken.token, quizId.quizId,
      questionBody).body;
  });

  test('Basic return success check', () => {
    const res = ServerQuestionDuplicate(UserToken.token, quizId.quizId, questionId.questionId);
    const resId = res.body;
    expect(resId.duplicatedQuestionId).toStrictEqual(questionId.questionId);
    expect(res.statusCode).toBe(200);
  });

  test('Check with quizInfo', () => {
    const res = ServerQuestionDuplicate(UserToken.token, quizId.quizId, questionId.questionId);
    const resId = res.body;
    expect(resId.duplicatedQuestionId).toStrictEqual(questionId.questionId);
    expect(res.statusCode).toBe(200);
    const resInfo = ServerQuizInfo(UserToken.token, quizId.quizId);
    expect(resInfo.body).toStrictEqual({
      quizId: quizId.quizId,
      name: 'first quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'a test quiz',
      numQuestions: 2,
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
              answer: 'Duke Dennis',
              colour: expect.any(String),
              correct: true
            },
            {
              answerId: expect.any(Number),
              answer: 'Kai Cenat',
              colour: expect.any(String),
              correct: false
            },
          ]
        }
      ]
    });
    expect(resInfo.statusCode).toStrictEqual(200);
  });
});
