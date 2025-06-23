import { Request, Response, NextFunction } from 'express';
import {
  CreateCollaboratorSchema,
  DeleteCollaboratorSchema,
  GetCollaboratorByIdSchema,
  GetCollaboratorSchema,
  GetCollaboratorsByCompanySchema,
  UpdateCollaboratorSchema,
} from '../Schemas/CollaboratorSchema';
import HttpResponse from '../Helpers/HttpResponse';
import { CollaboratorService } from '../Services/collaboratorService';
import { formatCollaboratorForFrontend, formatListForFrontend } from '../Helpers/EntityFormatter';

const collaboratorService = new CollaboratorService();

export async function getAllCollaborators(req: Request, res: Response, next: NextFunction) {
  try {
    const { query } = GetCollaboratorSchema.parse(req);

    const result = await collaboratorService.getAllCollaborators(query);

    const response = HttpResponse.Ok({
      message: 'Colaboradores recuperados com sucesso',
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      data: formatListForFrontend(result.data, formatCollaboratorForFrontend),
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getAllCollaborator:', err);
    next(err);
  }
}

export async function getCollaboratorById(req: Request, res: Response, next: NextFunction) {
  try {
    const { params } = GetCollaboratorByIdSchema.parse(req);
    const collaboratorId = params.id;

    const collaboratorData = await collaboratorService.getCollaboratorById(collaboratorId);

    const response = HttpResponse.Ok({
      message: 'Colaborador recuperado com sucesso',
      data: formatCollaboratorForFrontend(collaboratorData),
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getCollaboratorById:', err);
    next(err);
  }
}

export async function createCollaborator(req: Request, res: Response, next: NextFunction) {
  try {
    const { body, params } = CreateCollaboratorSchema.parse(req);

    console.log('Creating new collaborator for company with companyId:', params.companyId);

    const collaboratorData = await collaboratorService.createCollaborator(params.companyId, body);

    const response = HttpResponse.Created({
      message: 'Colaborador criado com sucesso',
      data: collaboratorData,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in createCollaborator:', err);
    next(err);
  }
}

export async function updateCollaborator(req: Request, res: Response, next: NextFunction) {
  try {
    const { body, params } = UpdateCollaboratorSchema.parse(req);
    const collaboratorId = params.id;

    console.log('Updating collaborator with ID:', collaboratorId);

    const result = await collaboratorService.updateCollaborator(collaboratorId, body);

    const response = HttpResponse.Ok({
      message: 'Colaborador atualizado com sucesso',
      data: result,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in updateCollaborator:', err);
    next(err);
  }
}

export async function deleteCollaborator(req: Request, res: Response, next: NextFunction) {
  try {
    const { params } = DeleteCollaboratorSchema.parse(req);
    const collaboratorId = params.id;

    console.log('Deleting collaborator with ID:', collaboratorId);

    const result = await collaboratorService.deleteCollaborator(collaboratorId);

    const response = HttpResponse.Ok({
      message: 'Colaborador removido com sucesso',
      data: result,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in deleteCollaborator:', err);
    next(err);
  }
}

export async function getCollaboratorsByCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const { params, query } = GetCollaboratorsByCompanySchema.parse(req);
    const companyId = params.companyId;

    const result = await collaboratorService.getCollaboratorsByCompany(companyId, query);

    const response = HttpResponse.Ok({
      message: `Colaboradores da empresa ${result.company.nomeFantasia} recuperados com sucesso`,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      data: formatListForFrontend(result.data, formatCollaboratorForFrontend),
      company: result.company,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getCollaboratorsByCompany:', err);
    next(err);
  }
}
