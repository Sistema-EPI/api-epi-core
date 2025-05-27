import { Router } from 'express';
import * as LoginController from '../Controllers/LoginController'
import RequestHandler from '../Helpers/RequestHandler';
// import { verifyToken, verifyPermission } from '../Middlewares/Auth'; // todo: add later
// import { createLog } from '../Middlewares/createLog'; // todo: add later

//v1/login

const login = Router();

login.post(
  '/attempt',
  // verifyToken,
  // verifyPermission(['user:write']),
  RequestHandler(LoginController.login),
);

login.post(
  '/select/company/:id_usuario/:id_empresa',
  // verifyToken,
  // verifyPermission(['user:write']),
  RequestHandler(LoginController.selectCompany),
);

export default login;