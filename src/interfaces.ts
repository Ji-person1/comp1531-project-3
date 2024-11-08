// A file for storing all the interfaces

export enum GameStage {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
}

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
    answerId?: number;
    colour?: string;
}

export interface Session {
    sessionId: number;
    authUserId: number;
    createdAt: number;
}

export interface PlayerSession {
  playerName: string;
  score: number;
  numQuestions: number;
  atQuestion: number;
}

export interface QuizSession {
  state: GameStage;
  quizSessionId: number;
  authUserId: number;
  createdAt: number;
  quiz: Quiz;
  players: PlayerSession[];
  questionResults: QuestionResults[];
}

export interface QuestionResults {
  questionId: number;
  playersCorrect: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}

export interface DataStore {
    users: User[];
    quizzes: Quiz[];
    bin: Quiz[];
    sessions: Session[];
    quizSession: QuizSession[];
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
    questionId: number;
}

export interface quizList {
    quizzes: QuizListInfo[];
}

export interface quizSessionId {
  sessionId: number;
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


export interface SessionInfo {
    sessionId: number;
    state: GameStage;
}
  
  export interface SessionsResponse {
    activeSessions: SessionInfo[];
    inactiveSessions: SessionInfo[];
}