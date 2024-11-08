// A file for storing all the interfaces

export interface UserDetails {
    user : {
        userId: number;
        name: string;
        email: string;
        numSuccessfulLogins: number;
        numFailedPasswordsSinceLastLogin: number
    }
}

export interface errorObject {
    error: string
}

export interface Token {
    token: string
}

export interface User {
    id: number;
    email: string;
    nameFirst: string;
    nameLast: string;
    password: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
    prevPasswords: string[]
}

export interface Quiz {
    quizId: number;
    creatorId: number;
    name: string;
    description: string;
    timeCreated: number;
    timeLastEdited: number;
    numQuestions: number;
    questions: Questions[]
}

export interface Questions {
    questionId: number
    question: string;
    timeLimit: number;
    points: number;
    answerOptions: Answer[];
}

export interface Answer {
    answer: string;
    correct: boolean;
    colour?: string;
}

export interface Session {
    sessionId: number;
    authUserId: number;
    createdAt: number;
    messages: Chat[];
}

export interface DataStore {
    users: User[];
    quizzes: Quiz[];
    bin: Quiz[];
    sessions: Session[];
    players: Player[];
}

export interface quizDetails {
    quizId: number
    name: string
    timeCreated: number
    timeLastEdited: number
    description: string
    numQuestions: number
    questions: Questions[]
}

export interface QuestionId {
    questionId: number
}

export interface quizList {
    quizzes: QuizListInfo[]
}

interface QuizListInfo {
    quizId: number;
    name: string;
}

export interface QuizId {
    quizId: number;
}

export interface DuplicatedId {
    duplicatedQuestionId: number;
}

export interface Player {
    playerName: string;
    score: number;
    playerId: number;
    time: number;
}

export interface Chat {
    playerId: number;
    message: string;
    playerName: string,
    timeSent: number;
}
