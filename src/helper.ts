import { getData } from './datastore';

interface errorObject {
    error: string
}


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

export function decodeToken(token: string): number | errorObject {
    return JSON.parse(decodeURIComponent(token));
}