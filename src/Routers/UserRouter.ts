import { Router } from 'express';
import RequestHandler from '../Helpers/RequestHandler';
import * as UserController from '../Controllers/UserController';
// import { verifyToken, verifyPermission } from '../Middlewares/Auth'; // todo: add later
// import { createLog } from '../Middlewares/createLog'; // todo: add later

//v1/user

const user = Router();

user.get(
    '/get/all',
    // verifyToken,
    // verifyPermission(['companies:read']),
    RequestHandler(UserController.getAllUsers),
);

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

user.put(
    '/:userId/update/password',
    // verifyToken,
    // verifyPermission(['user:write']),
    RequestHandler(UserController.updatePassword)
);

user.put(
    '/:userId/update/status',
    // verifyToken,
    // verifyPermission(['user:write']),
    RequestHandler(UserController.updateUserStatus)

);



export default user;