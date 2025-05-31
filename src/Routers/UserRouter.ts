import { Router } from 'express';
import RequestHandler from '../Helpers/RequestHandler';
import * as UserController from '../Controllers/UserController';
// import { verifyToken, verifyPermission } from '../Middlewares/Auth'; // todo: add later
// import { createLog } from '../Middlewares/createLog'; // todo: add later

//v1/user

const user = Router();

user.post(
    '/create/:id',
    // verifyToken,
    // verifyPermission(['user:write']),
    RequestHandler(UserController.createUser),
);

user.get(
    '/get/:id',
    // verifyToken,
    // verifyPermission(['user:read']),
    RequestHandler(UserController.getUserById),
)

user.post(
    '/:userId/connect/:companyId',
    // verifyToken,
    // verifyPermission(['user:write']),
    RequestHandler(UserController.connectUserToCompanyHandler),
);


export default user;