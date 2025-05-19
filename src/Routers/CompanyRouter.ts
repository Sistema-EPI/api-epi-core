import { Router } from 'express';
import * as CompanyController from '../Controllers/CompanyController';
import RequestHandler from '../Helpers/RequestHandler';
// import { verifyToken, verifyPermission } from '../Middlewares/Auth'; // todo: add later
// import { createLog } from '../Middlewares/createLog'; // todo: add later

const company = Router();

/// v1/company

company.get(
  '/get/all',
  // verifyToken,
  // verifyPermission(['companies:read']),
  RequestHandler(CompanyController.getAllCompanies),
)

company.get(
  '/get/:id',
  // verifyToken,
  // verifyPermission(['companies:read']),
  RequestHandler(CompanyController.getCompanyById),
)

company.post(
  '/create',
  // verifyToken,
  // verifyPermission(['companies:create']),
  RequestHandler(CompanyController.createCompany),
);

company.put(
  '/update/:id',
  // verifyToken,
  // verifyPermission(['companies:update']),
  RequestHandler(CompanyController.updateCompany),
)

company.delete(
  '/delete/:id',
  // verifyToken,
  // verifyPermission(['companies:delete']),
  RequestHandler(CompanyController.deleteCompany),
)

export default company;
