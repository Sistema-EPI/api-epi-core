import { Request, Response, NextFunction } from 'express';
import { CreateCollaboratorSchema, GetCollaboratorSchema } from "../Schemas/CollaboratorSchema";
import { prisma } from "../server";
import HttpResponse from '../Helpers/HttpResponse';

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

export async function createCollaborator(req: Request, res: Response, next: NextFunction) {
    try {
        const { body, params } = CreateCollaboratorSchema.parse(req);

        console.log('companyId:', params.companyId);

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

