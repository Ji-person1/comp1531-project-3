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
  playerId: number;
  playerName: string;
  score: number;
  numQuestions: number;
  atQuestion: number;
  quizsessionId: number;
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
  numWrong: number;
  numRight: number;
}

export interface DataStore {
    users: User[];
    quizzes: Quiz[];
    bin: Quiz[];
    sessions: Session[];
<<<<<<< HEAD
    players: Player[];
    messages: Chat[]
=======
    quizSession: QuizSession[];
    players: PlayerSession[];
>>>>>>> 4bbb3e06622a94c4b0db6d88ad1a2f261f3300e3
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

export interface PlayerId {
    playerId: number;
}

export interface DuplicatedId {
    duplicatedQuestionId: number;
}

<<<<<<< HEAD
export interface Player {
    playerName: string;
    score: number;
    playerId: number;
    time: number;
}

export interface Chat {
    playerId: number;
    message: string;
    playerName: string;
    timeSent: number;
}
=======
export interface SessionInfo {
    sessionId: number;
    state: GameStage;
}

export interface SessionsResponse {
    activeSessions: SessionInfo[];
    inactiveSessions: SessionInfo[];
}

export interface PlayerStatusResponse {
    state: GameStage,
    numQuestions: number,
    atQuestion: number
}
>>>>>>> 4bbb3e06622a94c4b0db6d88ad1a2f261f3300e3
