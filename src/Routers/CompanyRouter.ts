import { Router } from 'express';
import * as CompanyController from '../Controllers/CompanyController';
import RequestHandler from '../Helpers/RequestHandler';
// import { verifyToken, verifyPermission } from '../Middlewares/Auth'; // todo: add later
// import { createLog } from '../Middlewares/createLog'; // todo: add later

const router = Router();

/// v1/company

router.post(
  '/',
  // verifyToken,
  // verifyPermission(['companies:create']),
  RequestHandler(CompanyController.createCompany),
);

router.put(
  '/update/:id',
  // verifyToken,
  // verifyPermission(['companies:update']),
  RequestHandler(CompanyController.updateCompany),
)

router.delete(
  '/delete/:id',
  // verifyToken,
  // verifyPermission(['companies:delete']),
  RequestHandler(CompanyController.deleteCompany),
)

export default router;
