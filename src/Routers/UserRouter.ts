import { Router } from 'express';
import * as UserController from '../Controllers/UserController'
import RequestHandler from '../Helpers/RequestHandler';
// import { verifyToken, verifyPermission } from '../Middlewares/Auth'; // todo: add later
// import { createLog } from '../Middlewares/createLog'; // todo: add later

//v1/user 

const user = Router();

user.post(
  '/login',
  // verifyToken,
  // verifyPermission(['user:write']),
  RequestHandler(UserController.login),
);

user.post(
  '/select/company/:id_usuario/:id_empresa',
  // verifyToken,
  // verifyPermission(['user:write']),
  RequestHandler(UserController.selectCompany),
);

export default user;