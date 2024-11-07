import {
  ServerAuthRegister, ServerQuizCreate, ServerQuizCreateQuestion,
  ServerQuizQuestionDelete, ServerClear,
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

  beforeEach(() => {
    UserToken = ServerAuthRegister('HaoWu0000@gmail.com', '2734uqsd', 'Hao', 'Wu').body;
    quizId = ServerQuizCreate(UserToken.token, 'functional quiz', 'a test quiz').body;
    questionId = ServerQuizCreateQuestion(UserToken.token, quizId.quizId,
      'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]).body;
  });

  test('question does not exist', () => {
    const res = ServerQuizQuestionDelete(UserToken.token, quizId.quizId, -questionId.questionId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(400);
  });

  test('question already deleted', () => {
    const res = ServerQuizQuestionDelete(UserToken.token, quizId.quizId, questionId.questionId);
    expect(res.statusCode).toStrictEqual(200);
    const resTwo = ServerQuizQuestionDelete(UserToken.token, quizId.quizId, questionId.questionId);
    expect(resTwo.body).toStrictEqual(ERROR);
    expect(resTwo.statusCode).toStrictEqual(400);
  });

  test('invalid token', () => {
    const res = ServerQuizQuestionDelete(Number(-UserToken.token).toString(),
      quizId.quizId, questionId.questionId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  test('quiz does not exist', () => {
    const res = ServerQuizQuestionDelete(UserToken.token, -quizId.quizId, questionId.questionId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(403);
  });

  test('Not the owner of the quiz', () => {
    const otherUserToken = ServerAuthRegister('z533333@unsw.edu.au', '1234abcd', 'Hao', 'Wu').body;
    const res = ServerQuizQuestionDelete(otherUserToken.token, quizId.quizId,
      questionId.questionId);
    expect(res.body).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(403);
  });
});

describe('Success cases', () => {
  let UserToken: { token: string };
  let quizId: { quizId: number };
  let questionId: { questionId: number };
  let questionIdTwo: { questionId: number };

  beforeEach(() => {
    UserToken = ServerAuthRegister('1dq11333@gmail.com', '1234abcd', 'Hao', 'Wu').body;
    quizId = ServerQuizCreate(UserToken.token, 'first quiz', 'a test quiz').body;
    questionId = ServerQuizCreateQuestion(UserToken.token, quizId.quizId,
      'Who is the Rizzler?', 30, 5, [
        { answer: 'Duke Dennis', correct: true },
        { answer: 'Kai Cenat', correct: false }
      ]).body;
    questionIdTwo = ServerQuizCreateQuestion(UserToken.token, quizId.quizId,
      'Another Question', 30, 5, [
        { answer: 'Dukes', correct: true },
        { answer: 'Kait', correct: false }
      ]).body;
  });

  test('Basic return success check', () => {
    const res = ServerQuizQuestionDelete(UserToken.token, quizId.quizId, questionId.questionId);
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  test('delete the second question', () => {
    const res = ServerQuizQuestionDelete(UserToken.token, quizId.quizId, questionIdTwo.questionId);
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  test('delete questions then view question', () => {
    const res = ServerQuizQuestionDelete(UserToken.token, quizId.quizId, questionId.questionId);
    expect(res.statusCode).toStrictEqual(200);
    const resTwo = ServerQuizQuestionDelete(UserToken.token, quizId.quizId,
      questionIdTwo.questionId);
    expect(resTwo.statusCode).toStrictEqual(200);
    const resThree = ServerQuizInfo(UserToken.token, quizId.quizId);
    expect(resThree.body).toStrictEqual({
      quizId: quizId.quizId,
      name: 'first quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'a test quiz',
      numQuestions: 0,
      questions: []
    });
    expect(resThree.statusCode).toStrictEqual(200);
  });
});
