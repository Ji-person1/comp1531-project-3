import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import {
  adminAuthRegister, adminAuthLogin, adminUserDetails, adminUserDetailsUpdate,
  adminUserPasswordUpdate, adminAuthLogout, playerViewChat,
  playerJoin, playerStatus, AnswerQuestion, playerSendChat,
  playerQuestionInfo, playerQuestionResults
} from './auth';
import {
  adminQuizList, adminQuizCreate, adminQuizDescriptionUpdate, adminQuizNameUpdate, adminQuizInfo,
  adminQuizRemove, adminQuizTransfer, adminQuizCreateQuestion, adminQuizUpdateQuestion,
  adminQuestionMove, adminQuestionDuplicate, adminQuizTrashEmpty, adminQuizTrashView,
  adminQuizRestore, quizQuestionDelete,
  adminSessionStart, adminQuizSessions, adminQuizThumbnailUpdate, adminQuizSessionUpdate,
  quizSessionResults,
  adminQuizCreateQuestionV1,
  adminQuizUpdateQuestionV1,
  quizSessionResultsCSV, adminQuizSessionStatus
} from './quiz';
import { clear } from './other';
import {
  checkBinOwnership, checkQuizArray, checkQuizExistOwner,
  checkQuizOwnership, checkValidToken
} from './helper';
// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file),
  {
    swaggerOptions:
    { docExpansion: config.expandDocs ? 'full' : 'list' }
  }
));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

import { createClient } from '@vercel/kv';

// Replace this with your API_URL
// E.g. https://large-poodle-44208.kv.vercel-storage.com
const KV_REST_API_URL = "https://communal-ray-28417.upstash.io";
// Replace this with your API_TOKEN
// E.g. AaywASQgOWE4MTVkN2UtODZh...
const KV_REST_API_TOKEN = "AW8BAAIjcDFmZDczY2VhYTE2OTc0NDQ3ODJiNzI2YTE1ZmM4ZWVmZnAxMA";

const database = createClient({
  url: KV_REST_API_URL,
  token: KV_REST_API_TOKEN,
});


// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================
app.get('/data', async (req: Request, res: Response) => {
  // Retrieve the whole datastore
  const dataStore = {
    users: await database.hgetall("data:users"),
    quizzes: await database.hgetall("data:quizzes"),
    sessions: await database.hgetall("data:sessions"),
    bin: await database.hgetall("data:bin"),
    quizSession: await database.hgetall("data:quizSession"),
    players: await database.hgetall("data:players"),
    chat: await database.hgetall("data:chat"),
  };
  res.status(200).json(dataStore);
});

app.put('/data', async (req: Request, res: Response) => {
  const { section, data } = req.body;

  // Validate the section
  const validSections = ['users', 'quizzes', 'sessions', 'bin', 'quizSession', 'players', 'chat'];
  if (!validSections.includes(section)) {
    return res.status(400).json({ error: `Invalid section: ${section}` });
  }

  // Update the specific section in the datastore
  await database.hset(`data:${section}`, data);
  return res.status(200).json({ message: `${section} updated successfully` });
});


// ====================================================================
// ======================== ITERATION 2 ===============================
// ====================================================================
// adminAuthLogoutV1
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const token = Number(req.body.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminAuthLogout(token);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// UserDetailsV1
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = Number(req.query.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminUserDetails(token);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
});

// adminUserDetailUpdateV1
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { email, nameFirst, nameLast } = req.body;
  const token = Number(req.body.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminUserPasswordUpdateV1
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const token = Number(req.body.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminUserPasswordUpdate(token, oldPassword, newPassword);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminquizListV1
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = Number(req.query.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminQuizList(token);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminQuizCreateV1
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { name, description } = req.body;
  const token = Number(req.body.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminQuizCreate(token, name, description);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminQuizRemoveV1
app.delete('/v1/admin/quiz/:quizId', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId as string);
  const token = Number(req.query.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminQuizRemove(token, quizId);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminQuizInfoV1
app.get('/v1/admin/quiz/:quizId', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const token = Number(req.query.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizInfo(token, quizId);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminNameUpdateV1
app.put('/v1/admin/quiz/:quizId/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const { name } = req.body;
  const token = Number(req.body.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizNameUpdate(token, quizId, name);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminDescriptionUpdateV1
app.put('/v1/admin/quiz/:quizId/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const { description } = req.body;
  const token = Number(req.body.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizDescriptionUpdate(token, quizId, description);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminQuizTrashViewV1
app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = Number(req.query.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminQuizTrashView(token);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminQuizRestoreV1
app.post('/v1/admin/quiz/:quizId/restore', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const token = Number(req.body.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminQuizRestore(token, quizId);
    return res.status(200).json(result);
  } catch (e) {
    try {
      checkBinOwnership(token, quizId);
      return res.status(400).json({ error: e.message });
    } catch (e) {
      return res.status(403).json({ error: e.message });
    }
  }
});

// trashempty
app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const { quizIds } = req.query;
  const token = Number(req.query.token);

  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  let parsedquizIds: number[] = [];

  if (Array.isArray(quizIds)) {
    parsedquizIds = (quizIds as string[]).map(id => Number(id)).filter(id => !isNaN(id));
  } else if (typeof quizIds === 'string') {
    try {
      parsedquizIds = JSON.parse(quizIds);
      if (!Array.isArray(parsedquizIds)) {
        throw new Error();
      }
    } catch (error) {
      return res.status(400).json({ error: 'Quiz IDs are not valid or not an array' });
    }
  } else {
    return res.status(400).json({ error: 'Quiz IDs are missing or invalid' });
  }

  try {
    const result = adminQuizTrashEmpty(token, parsedquizIds);
    return res.status(200).json(result);
  } catch (e) {
    try {
      checkQuizArray(token, parsedquizIds);
      return res.status(400).json({ error: e.message });
    } catch (e) {
      return res.status(403).json({ error: e.message });
    }
  }
});

// adminQuizTransferV1
app.post('/v1/admin/quiz/:quizId/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const token = Number(req.body.token);
  const { userEmail } = req.body;
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizTransfer(token, quizId, userEmail);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminQuizCreateQuestionV1
app.post('/v1/admin/quiz/:quizId/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const { questionBody } = req.body;
  const token = Number(req.body.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizCreateQuestionV1(token, quizId, questionBody);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminQuizUpdateQuestionV1
app.put('/v1/admin/quiz/:quizId/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionid);
  const { questionBody } = req.body;
  const token = Number(req.body.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizUpdateQuestionV1(token, quizId, questionId, questionBody);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// quizQuestionDeleteV1
app.delete('/v1/admin/quiz/:quizId/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionid);
  const token = Number(req.query.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = quizQuestionDelete(token, quizId, questionId);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// questionMoveV1
app.put('/v1/admin/quiz/:quizId/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionid);
  const { newPosition } = req.body;
  const token = Number(req.body.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuestionMove(token, quizId, questionId, newPosition);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// questionDuplicateV1
app.post('/v1/admin/quiz/:quizId/question/:questionid/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionid);
  const token = Number(req.body.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    console.log(questionId);
    const result = adminQuestionDuplicate(token, quizId, questionId);
    console.log(result);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// ====================================================================
// ======================== ITERATION 3 ===============================
// ====================================================================
// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const result = echo(req.query.echo as string);
  if ('error' in result) {
    res.status(400);
  }

  return res.json(result);
});

// adminAuthRegister
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  try {
    const result = adminAuthRegister(email, password, nameFirst, nameLast);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// playerJoin
app.post('/v1/player/join', (req: Request, res: Response) => {
  const { sessionId, playerName } = req.body;
  try {
    const result = playerJoin(sessionId, playerName);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// AnswerQuestion
app.post('/v1/player/:playerid/question/:questionposition/answer',
  (req: Request, res: Response) => {
    const { answerIds } = req.body;
    const playerId = parseInt(req.params.playerid as string);
    const questionPosition = parseInt(req.params.questionposition as string);

    let parsedAnswerIds: number[] = [];

    if (Array.isArray(answerIds)) {
      parsedAnswerIds = answerIds.map(id => Number(id)).filter(id => !isNaN(id));
    } else if (typeof answerIds === 'string') {
      try {
        const parsed = JSON.parse(answerIds);
        if (!Array.isArray(parsed)) throw new Error('Parsed answerId is not an array');
        parsedAnswerIds = parsed.map(id => Number(id)).filter(id => !isNaN(id));
      } catch (error) {
        console.error('Error parsing answerId:', error);
        return res.status(400).json({ error: 'answer IDs are not valid or not an array' });
      }
    } else if (typeof answerIds === 'number') {
      parsedAnswerIds = [answerIds];
    } else {
      return res.status(400).json({ error: 'answer IDs are missing or invalid' });
    }

    if (parsedAnswerIds.length === 0) {
      return res.status(400).json({ error: 'No valid answer IDs provided' });
    }

    try {
      const result = AnswerQuestion(playerId, questionPosition, parsedAnswerIds);
      return res.status(200).json(result);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  });

// playerStatus
app.get('/v1/player/:playerid', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  try {
    const result = playerStatus(playerId);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// playerQuestionInfo
app.get('/v1/player/:playerid/question/:questionposition', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const position = parseInt(req.params.questionposition);
  try {
    const result = playerQuestionInfo(playerId, position);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminAuthLogin
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = adminAuthLogin(email, password);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminUserDetails
app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = Number(req.header('token'));
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminUserDetails(token);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
});

// adminUserDetailUpdate
app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const { email, nameFirst, nameLast } = req.body;
  const token = Number(req.header('token'));
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminUserPasswordUpdate
app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const token = Number(req.header('token'));
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminUserPasswordUpdate(token, oldPassword, newPassword);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminQuizTrashView
// moved before the less parameterised one of adminquizinfo
app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token = Number(req.header('token'));
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminQuizTrashView(token);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminquizList
app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = Number(req.header('token'));
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminQuizList(token);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminQuizCreate
app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const { name, description } = req.body;
  const token = Number(req.header('token'));
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminQuizCreate(token, name, description);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminQuizRemove
app.delete('/v2/admin/quiz/:quizId', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId as string);
  const token = Number(req.header('token'));
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminQuizRemove(token, quizId);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminQuizInfo
app.get('/v2/admin/quiz/:quizId', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const token = Number(req.header('token'));
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizInfo(token, quizId);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminNameUpdate
app.put('/v2/admin/quiz/:quizId/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const { name } = req.body;
  const token = Number(req.header('token'));
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizNameUpdate(token, quizId, name);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminSessionStart
app.post('/v1/admin/quiz/:quizId/session/start', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const { autoStartNum } = req.body;
  const token = Number(req.header('token'));
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizExistOwner(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminSessionStart(token, quizId, autoStartNum);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminDescriptionUpdate
app.put('/v2/admin/quiz/:quizId/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const { description } = req.body;
  const token = Number(req.header('token'));
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizDescriptionUpdate(token, quizId, description);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminQuizTransfer
app.post('/v2/admin/quiz/:quizId/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const token = Number(req.header('token'));
  const { userEmail } = req.body;
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizTransfer(token, quizId, userEmail);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminQuizCreateQuestion
app.post('/v2/admin/quiz/:quizId/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const { questionBody } = req.body;
  const token = Number(req.headers.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizCreateQuestion(token, quizId, questionBody);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminQuizUpdateQuestion
app.put('/v2/admin/quiz/:quizId/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionid);
  const { questionBody } = req.body;
  const token = Number(req.headers.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizUpdateQuestion(token, quizId, questionId, questionBody);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// questionMove
app.put('/v2/admin/quiz/:quizId/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionid);
  const { newPosition } = req.body;
  const token = Number(req.headers.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuestionMove(token, quizId, questionId, newPosition);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// questionDuplicate
app.post('/v2/admin/quiz/:quizId/question/:questionid/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionid);
  const token = Number(req.headers.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    console.log(questionId);
    const result = adminQuestionDuplicate(token, quizId, questionId);
    console.log(result);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// quizQuestionDelete
app.delete('/v2/admin/quiz/:quizId/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionid);
  const token = Number(req.headers.token);
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = quizQuestionDelete(token, quizId, questionId);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// clear
app.delete('/v1/clear', (req: Request, res: Response) => {
  const result = clear();
  res.status(200).json(result);
});

// trashempty
app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const { quizIds } = req.query;
  const token = Number(req.header('token'));

  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  let parsedquizIds: number[] = [];

  if (Array.isArray(quizIds)) {
    parsedquizIds = (quizIds as string[]).map(id => Number(id)).filter(id => !isNaN(id));
  } else if (typeof quizIds === 'string') {
    try {
      parsedquizIds = JSON.parse(quizIds);
      if (!Array.isArray(parsedquizIds)) {
        throw new Error();
      }
    } catch (error) {
      return res.status(400).json({ error: 'Quiz IDs are not valid or not an array' });
    }
  } else {
    return res.status(400).json({ error: 'Quiz IDs are missing or invalid' });
  }

  try {
    const result = adminQuizTrashEmpty(token, parsedquizIds);
    return res.status(200).json(result);
  } catch (e) {
    try {
      checkQuizArray(token, parsedquizIds);
      return res.status(400).json({ error: e.message });
    } catch (e) {
      return res.status(403).json({ error: e.message });
    }
  }
});

// adminQuizRestore
app.post('/v2/admin/quiz/:quizId/restore', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const token = Number(req.header('token'));
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminQuizRestore(token, quizId);
    return res.status(200).json(result);
  } catch (e) {
    try {
      checkBinOwnership(token, quizId);
      return res.status(400).json({ error: e.message });
    } catch (e) {
      return res.status(403).json({ error: e.message });
    }
  }
});

// adminAuthLogout
app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = Number(req.header('token'));
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    const result = adminAuthLogout(token);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminquizSessions
app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = Number(req.header('token'));

  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizExistOwner(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizSessions(token, quizId);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// playerQuestionResults
app.get('/v1/player/:playerId/question/:questionposition/results',
  (req: Request, res: Response) => {
    const playerId = parseInt(req.params.playerId);
    const questionPosition = parseInt(req.params.questionposition);

    try {
      const result = playerQuestionResults(playerId, questionPosition);
      return res.status(200).json(result);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  });

// playerViewChat
app.get('/v1/player/:playerId/chat', (req: Request, res: Response) => {
  const playerId = Number(req.params.playerId);

  try {
    const result = playerViewChat(playerId);
    res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// playerSendChat
app.post('/v1/player/:playerId/chat', (req: Request, res: Response) => {
  const playerId = Number(req.params.playerId);
  const { message } = req.body;

  try {
    const result = playerSendChat(playerId, message);
    res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminQuizThumbnailUpdate
app.put('/v1/admin/quiz/:quizId/thumbnail', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const { thumbnailUrl } = req.body;
  const token = Number(req.header('token'));
  console.log('Received request:', { quizId, thumbnailUrl, token });
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }
  try {
    const result = adminQuizThumbnailUpdate(token, quizId, thumbnailUrl);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminQuizSessionUpdate
app.put('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = Number(req.header('token'));
  const { action } = req.body;

  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizExistOwner(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizSessionUpdate(token, quizId, sessionId, action);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid/results', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = Number(req.header('token'));

  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizExistOwner(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = quizSessionResults(token, quizId, sessionId);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid/results/csv', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = Number(req.header('token'));
  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizExistOwner(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = quizSessionResultsCSV(token, quizId, sessionId);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminQuizSessionStatus
app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = Number(req.header('token'));

  try {
    checkValidToken(token);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  try {
    checkQuizOwnership(token, quizId);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }

  try {
    const result = adminQuizSessionStatus(token, quizId, sessionId);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
