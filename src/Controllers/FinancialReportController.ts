import { Request, Response, NextFunction } from 'express';
import HttpResponse from '../Helpers/HttpResponse';
import { FinancialReportService } from '../Services/financialReportService';
import {
  GetFinancialReportSchema,
  GetTopExpensiveEpisSchema,
} from '../Schemas/FinancialReportSchema';

const financialReportService = new FinancialReportService();

export async function getAnnualCostsByEpi(req: Request, res: Response, next: NextFunction) {
  try {
    const { params, query } = GetFinancialReportSchema.parse(req);
    const companyId = params.companyId;
    const year = query.year ? parseInt(query.year) : undefined;

    const annualCosts = await financialReportService.getAnnualCostsByEpi(companyId, year);

    const response = HttpResponse.Ok({
      message: 'Custos anuais por EPI recuperados com sucesso',
      data: annualCosts,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getAnnualCostsByEpi:', err);
    next(err);
  }
}

export async function getAnnualFinancialSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const { params } = GetFinancialReportSchema.parse(req);
    const companyId = params.companyId;

    const financialSummary = await financialReportService.getAnnualFinancialSummary(companyId);

    const response = HttpResponse.Ok({
      message: 'Resumo financeiro anual recuperado com sucesso',
      data: financialSummary,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getAnnualFinancialSummary:', err);
    next(err);
  }
}

export async function getMonthlyFinancialData(req: Request, res: Response, next: NextFunction) {
  try {
    const { params, query } = GetFinancialReportSchema.parse(req);
    const companyId = params.companyId;
    const year = query.year ? parseInt(query.year) : new Date().getFullYear();

    const monthlyData = await financialReportService.getMonthlyFinancialData(companyId, year);

    const response = HttpResponse.Ok({
      message: `Dados financeiros mensais de ${year} recuperados com sucesso`,
      data: monthlyData,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getMonthlyFinancialData:', err);
    next(err);
  }
}

export async function getTopExpensiveEpis(req: Request, res: Response, next: NextFunction) {
  try {
    const { params, query } = GetTopExpensiveEpisSchema.parse(req);
    const companyId = params.companyId;
    const year = query.year ? parseInt(query.year) : new Date().getFullYear();
    const limit = query.limit ? parseInt(query.limit) : 5;

    const topExpensiveEpis = await financialReportService.getTopExpensiveEpis(
      companyId,
      year,
      limit,
    );

    const response = HttpResponse.Ok({
      message: `Top ${limit} EPIs mais caros de ${year} recuperados com sucesso`,
      data: topExpensiveEpis,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getTopExpensiveEpis:', err);
    next(err);
  }
}
