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
  adminUserPasswordUpdate, adminAuthLogout
} from './auth';
import {
  adminQuizList, adminQuizCreate, adminQuizDescriptionUpdate, adminQuizNameUpdate, adminQuizInfo,
  adminQuizRemove, adminQuizTransfer, adminQuizCreateQuestion, adminQuizUpdateQuestion,
  adminQuestionMove, adminQuestionDuplicate, adminQuizTrashEmpty, adminQuizTrashView,
  adminQuizRestore, quizQuestionDelete,
  adminSessionStart
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

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
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
  const { question, duration, points, answers } = req.body;
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
    const result = adminQuizCreateQuestion(token, quizId, question, duration, points, answers);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// adminQuizUpdateQuestion
app.put('/v2/admin/quiz/:quizId/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionid);
  const { question, duration, points, answers } = req.body;
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
    const result = adminQuizUpdateQuestion(token, quizId, questionId, question,
      duration, points, answers);
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
