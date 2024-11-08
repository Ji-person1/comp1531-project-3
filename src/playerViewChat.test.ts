import {
  ServerClear, ServerViewChat
} from './ServerTestCallHelper';
import {
  generatePlayerId
} from './helper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  ServerClear();
});

describe('Error Cases', () => {
  let PlayerId: { playerId: number};

  test('Logout with invalid token (401 Unauthorized)', () => {
    const invalidPlayerId = generatePlayerId
    const logoutRes = ServerViewChat(-invalidPlayerId);
    expect(logoutRes.statusCode).toBe(400);
    expect(logoutRes.body).toStrictEqual(ERROR);
  });  
});

