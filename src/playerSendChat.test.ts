import {
    ServerAuthRegister, ServerClear, ServerSendChat
  } from './ServerTestCallHelper';
  
  const ERROR = { error: expect.any(String) };
  
  beforeEach(() => {
    ServerClear();
  });
  
  describe('Error Cases', () => {
    let PlayerId: { playerId: number}
    beforeEach(() => {
      PlayerId = ServerAuthRegister('swapnav.saikia123@icloud.com', '1234abcd', 'Swapnav', 'Saikia').body;
    });

    test('Logout with invalid token (401 Unauthorized)', () => {
      const invalidPlayerId = Number(-PlayerId.playerId)
      const logoutRes = ServerSendChat(invalidPlayerId);
      expect(logoutRes.statusCode).toBe(400);
      expect(logoutRes.body).toStrictEqual(ERROR);
    });  
});

