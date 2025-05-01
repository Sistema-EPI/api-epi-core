import { Router } from 'express';
import * as CompanyController from '../Controllers/CompanyController';
import RequestHandler from '../Helpers/RequestHandler';
// import { verifyToken, verifyPermission } from '../Middlewares/Auth'; // todo: add later
// import { createLog } from '../Middlewares/createLog'; // todo: add later

const router = Router();

// POST /v1/companies
router.post(
  '/',
  // verifyToken,
  // verifyPermission(['companies:write']),
  RequestHandler(CompanyController.createCompany),
);

export default router;
