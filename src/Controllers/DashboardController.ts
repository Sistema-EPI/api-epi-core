import { Request, Response, NextFunction } from 'express';
import HttpResponse from '../Helpers/HttpResponse';
import { DashboardService } from '../Services/dashboardService';

const dashboardService = new DashboardService();

export async function getGeneralStats(req: Request, res: Response, next: NextFunction) {
  return null;
}
