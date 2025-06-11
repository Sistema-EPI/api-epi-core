import { Request, Response, NextFunction } from 'express';
import { CreateCollaboratorSchema, DeleteCollaboratorSchema, GetCollaboratorByIdSchema, GetCollaboratorSchema, UpdateCollaboratorSchema } from "../Schemas/CollaboratorSchema";
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
                orderBy: { createdAt: 'desc' },
                include: {
                    empresa: {
                        select: {
                            idEmpresa: true,
                            nomeFantasia: true,
                            statusEmpresa: true
                        }
                    },
                    _count: {
                        select: {
                            processos: true,
                            biometrias: true,
                            logs: true
                        }
                    }
                }
            }),
        ]);


        const formattedData = data.map(collaborator => ({
            ...collaborator,
            empresa: collaborator.empresa,
            totalProcessos: collaborator._count.processos,
            totalBiometrias: collaborator._count.biometrias,
            totalLogs: collaborator._count.logs,
            _count: undefined
        }));

        const response = HttpResponse.Ok({
            message: 'Colaboradores recuperados com sucesso',
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            data: formattedData,
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

        const existingCollaborator = await prisma.collaborator.findUnique({
            where: { idColaborador: collaboratorId },
            include: {
                empresa: {
                    select: {
                        idEmpresa: true,
                        nomeFantasia: true,
                        razaoSocial: true,
                        cnpj: true,
                        statusEmpresa: true
                    }
                },
                processos: {
                    include: {
                        epi: {
                            select: {
                                ca: true,
                                nomeEpi: true,
                                validade: true
                            }
                        }
                    }
                },
                biometrias: {
                    select: {
                        idBiometria: true,
                        biometriaPath: true,
                        certificadoPath: true,
                        createdAt: true
                    }
                },
                _count: {
                    select: {
                        processos: true,
                        biometrias: true,
                        logs: true
                    }
                }
            }
        });

        if (!existingCollaborator) {
            throw HttpError.NotFound('Colaborador não encontrado');
        }

        const response = HttpResponse.Ok({
            message: 'Colaborador recuperado com sucesso',
            data: {
                ...existingCollaborator,
                totalProcessos: existingCollaborator._count.processos,
                totalBiometrias: existingCollaborator._count.biometrias,
                totalLogs: existingCollaborator._count.logs,
                _count: undefined
            },
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

        // Validar se a empresa existe
        const existingCompany = await prisma.company.findUnique({
            where: { idEmpresa: params.companyId }
        });

        if (!existingCompany) {
            throw HttpError.NotFound('Empresa não encontrada');
        }

        // Verificar se CPF já existe
        const existingCpf = await prisma.collaborator.findUnique({
            where: { cpf: body.cpf }
        });

        if (existingCpf) {
            throw HttpError.BadRequest('CPF já cadastrado');
        }

        const collaborator = await prisma.collaborator.create({
            data: {
                idEmpresa: params.companyId,
                nomeColaborador: body.nome_colaborador,
                cpf: body.cpf,
                statusColaborador: body.status_colaborador,
            },
            include: {
                empresa: {
                    select: {
                        idEmpresa: true,
                        nomeFantasia: true,
                        statusEmpresa: true
                    }
                }
            }
        });

        logger.info(`Novo colaborador criado (id: ${collaborator.idColaborador}) para empresa ${existingCompany.nomeFantasia}`);

        const response = HttpResponse.Created({
            message: 'Colaborador criado com sucesso',
            data: {
                id: collaborator.idColaborador,
                nome: collaborator.nomeColaborador,
                cpf: collaborator.cpf,
                status: collaborator.statusColaborador,
                empresa: collaborator.empresa.nomeFantasia
            }
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

        if (!existingCollaborator) {
            throw HttpError.NotFound('Colaborador não encontrado');
        }

        if (body.cpf && body.cpf !== existingCollaborator.cpf) {
            const cpfExists = await prisma.collaborator.findUnique({
                where: { cpf: body.cpf }
            });

            if (cpfExists) {
                throw HttpError.BadRequest('CPF já está cadastrado para outro colaborador');
            }
        }

        const dataToUpdate = {
            ...(body.nome_colaborador !== undefined && { nomeColaborador: body.nome_colaborador }),
            ...(body.cpf !== undefined && { cpf: body.cpf }),
            ...(body.status_colaborador !== undefined && { statusColaborador: body.status_colaborador }),
        };

        const updatedCollaborator = await prisma.collaborator.update({
            where: { idColaborador: collaboratorId },
            data: dataToUpdate,
        });


        const changes: Record<string, { before: any; after: any }> = {};
        for (const key in dataToUpdate) {
            if ((existingCollaborator as any)[key] !== (updatedCollaborator as any)[key]) {
                changes[key] = {
                    before: (existingCollaborator as any)[key],
                    after: (updatedCollaborator as any)[key],
                };
            }
        }

        if (Object.keys(changes).length > 0) {
            logger.info(`Colaborador atualizado (id: ${collaboratorId}) com as mudanças: ${JSON.stringify(changes)}`);
        }

        const response = HttpResponse.Ok({
            message: 'Colaborador atualizado com sucesso',
            data: {
                id: collaboratorId
            }
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

        const existingCollaborator = await prisma.collaborator.findUnique({
            where: { idColaborador: collaboratorId },
            include: {
                processos: true,
                biometrias: true,
                logs: true,
                empresa: {
                    select: {
                        nomeFantasia: true
                    }
                }
            }
        });

        if (!existingCollaborator) {
            throw HttpError.NotFound('Colaborador não encontrado');
        }

        if (existingCollaborator.processos.length > 0) {
            throw HttpError.BadRequest('Não é possível deletar colaborador com processos vinculados');
        }

        //Biometrias e Logs têm CASCADE, então serão deletados automaticamente
        await prisma.collaborator.delete({
            where: { idColaborador: collaboratorId },
        });

        logger.info(`Colaborador ${existingCollaborator.nomeColaborador} removido da empresa ${existingCollaborator.empresa.nomeFantasia} (id: ${collaboratorId})`);

        const response = HttpResponse.Ok({
            message: 'Colaborador deletado com sucesso',
            data: {
                id: collaboratorId,
                nome: existingCollaborator.nomeColaborador,
                empresa: existingCollaborator.empresa.nomeFantasia
            },
        });

        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        console.error('Error in deleteCollaborator:', err);
        next(err);
    }
}

