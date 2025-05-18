import { Request, Response, NextFunction } from 'express';
import { CreateCollaboratorSchema, GetCollaboratorByIdSchema, GetCollaboratorSchema, UpdateCollaboratorSchema } from "../Schemas/CollaboratorSchema";
import { prisma } from "../server";
import HttpResponse from '../Helpers/HttpResponse';
import HttpError from '../Helpers/HttpError';
import logger from '../Helpers/Logger';

export async function getAllCollaborators(req: Request, res: Response, next: NextFunction) {
    try {
        const { query } = GetCollaboratorSchema.parse(req);

        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '10', 10);
        const skip = (page - 1) * limit;

        const [total, data] = await Promise.all([
            prisma.collaborator.count(),
            prisma.collaborator.findMany({
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
        ]);

        const response = HttpResponse.Ok({
            message: 'Colaboradores recuperados com sucesso',
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            data,
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

        console.log('collaboratorId:', collaboratorId);

        const existingCollaborator = await prisma.collaborator.findUnique({
            where: { idColaborador: collaboratorId },
        });

        if (!existingCollaborator) throw new HttpError('Colaborador não encontrado', 404);

        const response = HttpResponse.Ok({
            message: 'Colaborador recuperado com sucesso',
            data: existingCollaborator,
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

        console.log('body', body);

        const collaborator = await prisma.collaborator.create({
            data: {
                idEmpresa: params.companyId,
                nomeColaborador: body.nomeColaborador,
                cpf: body.cpf,
                statusColaborador: body.statusColaborador,
            },
        });

        const response = HttpResponse.Created({
            message: 'Collaborator created successfully',
            collaborator,
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

        const existingCollaborator = await prisma.collaborator.findUnique({
            where: { idColaborador: collaboratorId },
        });

        if (!existingCollaborator) throw new HttpError('Colaborador não encontrado', 404);

        const updatedCollaborator = await prisma.collaborator.update({
            where: { idColaborador: collaboratorId },
            data: body,
        });

        const changes: Record<string, { before: any; after: any }> = {};
        for (const key in body) {
            if ((existingCollaborator as any)[key] !== (updatedCollaborator as any)[key]) {
                changes[key] = {
                    before: (existingCollaborator as any)[key],
                    after: (updatedCollaborator as any)[key],
                };
            }
        }

        if (Object.keys(changes).length > 0) {
            logger.info(`Collaborator atualizado (id: ${collaboratorId}) com as mudanças: ${JSON.stringify(changes)}`);
        } else {
            logger.info(`Collaborator (id: ${collaboratorId}) recebeu uma requisição de update, mas nenhum dado foi alterado.`);
        }

        const response = HttpResponse.Created({
            message: 'Collaborator updated successfully',
            id: collaboratorId,
        });

        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        console.error('Error in updateCollaborator:', err);
        next(err);
    }
}

