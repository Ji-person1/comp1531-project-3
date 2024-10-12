import * as fs from 'fs'
const DATA_PATH = './src/data.json'

interface User {
    id: number;
    email: string;
    nameFirst: string;
    nameLast: string;
    password: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
    prevPasswords: string[]
}

interface Quiz {
    quizId: number;
    creatorId: number;
    name: string;
    description: string;
    timeCreated: number;
    timeLastEdited: number;
    numQuestions: number;
    questions: Questions[]
}

interface Questions {
    question: string;
    timeLimit: number;
    points: number;
    answerOptions: Answer[];
}

interface Answer {
    answer: string;
    correct: boolean;
}

interface Session {
    sessionId: number;
    authUserId: number;
    createdAt: number; 
}

interface DataStore {
    users: User[];
    quizzes: Quiz[];
    bin: Quiz[];
    sessions: Session[]; 
}

export function getData(): DataStore {
    const data = fs.readFileSync(DATA_PATH, 'utf-8')
    return JSON.parse(data)
}

export function setData(data: DataStore): void {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
}