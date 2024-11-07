import {
  ServerAuthRegister, ServerQuizCreate, ServerQuizTransfer,
  ServerQuizInfo, ServerClear,
  ServerAuthLogout,
  ServerQuizList,
  ServerQuizRemove
} from './ServerTestCallHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Failure cases', () => {
  let userToken: { token: string };
  let userTokenTwo: { token: string };
  let quizId: { quizId: number };

  beforeEach(() => {
    userToken = ServerAuthRegister('swastik1@gmail.com', 'password123', 'Swastik', 'Mishra').body;
    userTokenTwo = ServerAuthRegister('Swastik2@gmail.com', 'password456', 'Neo', 'Mishra').body;

    quizId = ServerQuizCreate(userToken.token, 'Test Quiz', 'This is a test quiz').body;
  });

  test('Target user does not exist', () => {
    const res = ServerQuizTransfer(userToken.token, quizId.quizId, 'nonexistent@gmail.com');
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(ERROR);
  });

  test('Target user is the current owner', () => {
    const res = ServerQuizTransfer(userToken.token, quizId.quizId, 'Swastik1@gmail.com');
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(ERROR);
  });

  test('Quiz name conflict with target user', () => {
    ServerQuizCreate(userTokenTwo.token, 'Test Quiz', 'This is another test quiz');

    const res = ServerQuizTransfer(userToken.token, quizId.quizId, 'Swastik2@gmail.com');
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(ERROR);
  });

  test('Invalid token', () => {
    const res = ServerQuizTransfer(Number(-userToken.token).toString(),
      quizId.quizId, 'Swastik2@gmail.com');
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual(ERROR);
  });

  test('Logged out token', () => {
    const logOutRes = ServerAuthLogout(userToken.token);
    expect(logOutRes.statusCode).toStrictEqual(200);
    const res = ServerQuizTransfer(userToken.token,
      quizId.quizId, 'Swastik2@gmail.com');
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual(ERROR);
  });

  test('Quiz does not exist', () => {
    const res = ServerQuizTransfer(userToken.token, -quizId.quizId, 'Swastik2@gmail.com');
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(ERROR);
  });

  test('Quiz no longer exists', () => {
    ServerQuizRemove(userToken.token, quizId.quizId);
    const res = ServerQuizTransfer(userToken.token, quizId.quizId, 'Swastik2@gmail.com');
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(ERROR);
  });

  test('User is not the owner of the quiz', () => {
    const res = ServerQuizTransfer(userTokenTwo.token, quizId.quizId, 'Swastik1@gmail.com');
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(ERROR);
  });
});

describe('Success cases', () => {
  let userToken: { token: string };
  let userTokenTwo: { token: string };
  let quizId: { quizId: number };
  let quizIdTwo: { quizId: number };
  let quizIdThree: { quizId: number };

  beforeEach(() => {
    userToken = ServerAuthRegister('swastik1@gmail.com', 'password123', 'Swastik', 'Mishra').body;
    userTokenTwo = ServerAuthRegister('Swastik2@gmail.com', 'password456', 'Neo', 'Mishra').body;

    quizId = ServerQuizCreate(userToken.token, 'Test Quiz', 'This is a test quiz').body;
    quizIdTwo = ServerQuizCreate(userToken.token, 'Second test', 'This is a test quiz').body;
    quizIdThree = ServerQuizCreate(userToken.token, 'Third test', 'This is a test quiz').body;
  });

  test('Successful transfer', () => {
    const res = ServerQuizTransfer(userToken.token, quizId.quizId, 'Swastik2@gmail.com');
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toBe(200);

    const quizInfo = ServerQuizInfo(userTokenTwo.token, quizId.quizId);
    expect(quizInfo.body.name).toBe('Test Quiz');
  });

  test('Transfer does not change data for quizInfo', () => {
    const quizInfoOriginal = ServerQuizInfo(userToken.token, quizId.quizId);
    expect(quizInfoOriginal.statusCode).toStrictEqual(200);
    const res = ServerQuizTransfer(userToken.token, quizId.quizId, 'Swastik2@gmail.com');
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toBe(200);

    const quizInfo = ServerQuizInfo(userTokenTwo.token, quizId.quizId);
    expect(quizInfo.body).toStrictEqual(quizInfoOriginal.body);
  });

  test('Transfer of multiple quizzes', () => {
    const res = ServerQuizTransfer(userToken.token, quizId.quizId, 'Swastik2@gmail.com');
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toBe(200);
    const resTwo = ServerQuizTransfer(userToken.token, quizIdTwo.quizId, 'Swastik2@gmail.com');
    expect(resTwo.body).toStrictEqual({});
    expect(resTwo.statusCode).toBe(200);
    const resThree = ServerQuizTransfer(userToken.token, quizIdThree.quizId, 'Swastik2@gmail.com');
    expect(resThree.body).toStrictEqual({});
    expect(resThree.statusCode).toBe(200);

    const quizList = ServerQuizList(userTokenTwo.token);
    expect(quizList.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId.quizId,
          name: 'Test Quiz'
        },
        {
          quizId: quizIdTwo.quizId,
          name: 'Second test'
        },
        {
          quizId: quizIdThree.quizId,
          name: 'Third test'
        }
      ]
    });
  });
});
