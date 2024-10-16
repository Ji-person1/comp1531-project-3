import { getData } from './datastore.ts';

export function generateSessionId(): number {
    const data = getData();

    let sessionId = random5DigitNumber();
    if (!data.sessions) {
        return random5DigitNumber();
    }
    while (data.sessions.some(session => session.sessionId === sessionId)) {
        sessionId = random5DigitNumber();
    }

    return sessionId;
}

function random5DigitNumber(): number {
    return Math.floor(10000 + Math.random() * 90000);
};