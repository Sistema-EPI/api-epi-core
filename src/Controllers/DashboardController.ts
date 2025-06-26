import { Request, Response, NextFunction } from 'express';
import HttpResponse from '../Helpers/HttpResponse';
import { DashboardService } from '../Services/dashboardService';
import { GetDashboardSchema } from '../Schemas/DashbordSchema';

const dashboardService = new DashboardService();

export async function getGeneralStats(req: Request, res: Response, next: NextFunction) {
  try {
    const { params } = GetDashboardSchema.parse(req);
    const companyId = params.companyId;

    const stats = await dashboardService.getGeneralStats(companyId);

    const response = HttpResponse.Ok({
      message: 'Estatísticas recuperadas com sucesso',
      data: stats,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getGeneralStats:', err);
    next(err);
  }
}

export async function getEpisByCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { params } = GetDashboardSchema.parse(req);
    const companyId = params.companyId;

    const episByCategory = await dashboardService.getEpisByCategory(companyId);

    const response = HttpResponse.Ok({
      message: 'EPIs por categoria recuperados com sucesso',
      data: episByCategory,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getEpisByCategory:', err);
    next(err);
  }
}

export async function getEpiDeliveryByMonth(req: Request, res: Response, next: NextFunction) {
  try {
    const { params } = GetDashboardSchema.parse(req);
    const companyId = params.companyId;

    const deliveryByMonth = await dashboardService.getEpiDeliveryByMonth(companyId);

    const response = HttpResponse.Ok({
      message: 'Entregas de EPIs por mês recuperadas com sucesso',
      data: deliveryByMonth,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getEpiDeliveryByMonth:', err);
    next(err);
  }
}

export async function getLowStockEpis(req: Request, res: Response, next: NextFunction) {
  try {
    const { params } = GetDashboardSchema.parse(req);
    const companyId = params.companyId;

    const lowStockEpis = await dashboardService.getLowStockEpis(companyId);

    const response = HttpResponse.Ok({
      message: 'EPIs com estoque baixo recuperados com sucesso',
      data: lowStockEpis,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getLowStockEpis:', err);
    next(err);
  }
}
