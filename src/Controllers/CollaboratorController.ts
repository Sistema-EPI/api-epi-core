import { Request, Response, NextFunction } from 'express';
import { CreateCollaboratorSchema } from "../Schemas/CollaboratorSchema";
import { prisma } from "../server";
import HttpResponse from '../Helpers/HttpResponse';

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

