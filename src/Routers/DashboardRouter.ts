import { Router } from 'express';
import { verifyToken } from '../Helpers/Jwt';
import { verifyPermission } from '../Middlewares/auth';
import RequestHandler from '../Helpers/RequestHandler';
import * as DashboardController from '../Controllers/DashboardController';

const dashboard = Router();

// v1/dashboard

dashboard.get(
  '/general/stats/:companyId',
  verifyToken,
  verifyPermission(['dashboard:read']),
  RequestHandler(DashboardController.getGeneralStats),
);

dashboard.get(
  '/epis-by-category/:companyId',
  verifyToken,
  verifyPermission(['dashboard:read']),
  RequestHandler(DashboardController.getEpisByCategory),
);

dashboard.get(
  '/delivery-by-month/:companyId',
  verifyToken,
  verifyPermission(['dashboard:read']),
  RequestHandler(DashboardController.getEpiDeliveryByMonth),
);

dashboard.get(
  '/low-stock/:companyId',
  verifyToken,
  verifyPermission(['dashboard:read']),
  RequestHandler(DashboardController.getLowStockEpis),
);

export default dashboard;
