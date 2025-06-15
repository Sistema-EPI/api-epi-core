import { Request, Response, NextFunction } from 'express';
import {
    CreateCompanySchema,
    DeleteCompanySchema,
    GetCompaniesSchema,
    GetCompanyByIdSchema,
    UpdateCompanySchema,
} from '../Schemas/CompanySchema';
import HttpResponse from '../Helpers/HttpResponse';
import HttpError from '../Helpers/HttpError';
import logger from '../Helpers/Logger';
import crypto from 'crypto';
import { prisma } from '../server';

export async function getAllCompanies(req: Request, res: Response, next: NextFunction) {
    try {
        const { query } = GetCompaniesSchema.parse(req);

        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '10', 10);
        const skip = (page - 1) * limit;

        const [total, data] = await Promise.all([
            prisma.company.count(),
            prisma.company.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            colaboradores: true,
                            epis: true,
                            authCompanies: true
                        }
                    }
                }
            }),
        ]);


        const formattedData = data.map(company => ({
            ...company,
            totalColaboradores: company._count.colaboradores,
            totalEpis: company._count.epis,
            totalUsuarios: company._count.authCompanies,
            _count: undefined // Remove o _count do retorno
        }));

        const response = HttpResponse.Ok({
            message: 'Empresas recuperadas com sucesso',
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
        console.error('Error in getAllCompanies:', err);
        next(err);
    }
}

export async function getCompanyById(req: Request, res: Response, next: NextFunction) {
    try {
        const { params } = GetCompanyByIdSchema.parse(req);
        const companyId = params.id;

        const existingCompany = await prisma.company.findUnique({
            where: { idEmpresa: companyId },
            include: {
                colaboradores: {
                    select: {
                        idColaborador: true,
                        nomeColaborador: true,
                        cpf: true,
                        statusColaborador: true
                    }
                },
                epis: {
                    select: {
                        ca: true,
                        nomeEpi: true,
                        quantidade: true,
                        quantidadeMinima: true
                    }
                },
                authCompanies: {
                    include: {
                        user: {
                            select: {
                                idUser: true,
                                email: true,
                                statusUser: true
                            }
                        },
                        role: {
                            select: {
                                cargo: true,
                                permissao: true
                            }
                        }
                    }
                }
            }
        });

        if (!existingCompany) throw HttpError.NotFound('Empresa não encontrada');

        const response = HttpResponse.Ok({
            message: 'Empresa recuperada com sucesso',
            data: {
                ...existingCompany,
                usuarios: existingCompany.authCompanies.map(auth => ({
                    id: auth.user.idUser,
                    email: auth.user.email,
                    cargo: auth.cargo,
                    status: auth.user.statusUser
                })),
                totalColaboradores: existingCompany.colaboradores.length,
                totalEpis: existingCompany.epis.length,
                totalUsuarios: existingCompany.authCompanies.length
            },
        });

        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        console.error('Error in getCompanyById:', err);
        next(err);
    }
}

export async function createCompany(req: Request, res: Response, next: NextFunction) {
    try {
        const body = CreateCompanySchema.parse(req.body);

        logger.info(body);

        const existingCompany = await prisma.company.findUnique({
            where: { cnpj: body.cnpj }
        });

        if (existingCompany) {
            throw HttpError.BadRequest('CNPJ já cadastrado');
        }

        const company = await prisma.company.create({
            data: {
                nomeFantasia: body.nome_fantasia,
                razaoSocial: body.razao_social,
                cnpj: body.cnpj,
                cep: body.cep,
                email: body.email,
                uf: body.uf,
                logradouro: body.logradouro,
                telefone: body.telefone,
                statusEmpresa: body.status_empresa,
                apiKey: crypto.randomUUID(),
            },
        });

        logger.info(`Nova empresa criada (id: ${company.idEmpresa})`);

        const response = HttpResponse.Created({
            message: 'Empresa criada com sucesso',
            data: {
                id: company.idEmpresa,
                nomeFantasia: company.nomeFantasia,
                cnpj: company.cnpj,
                statusEmpresa: company.statusEmpresa
            }
        });

        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        console.error('Error in createCompany:', err);
        next(err);
    }
}

export async function updateCompany(req: Request, res: Response, next: NextFunction) {
    try {
        const { body, params } = UpdateCompanySchema.parse(req);
        const companyId = params.id;

        const existingCompany = await prisma.company.findUnique({
            where: { idEmpresa: companyId },
        });

        if (!existingCompany) throw HttpError.NotFound('Empresa não encontrada');

        // Verificar se o novo CNPJ já existe em outra empresa
        if (body.cnpj && body.cnpj !== existingCompany.cnpj) {
            const cnpjExists = await prisma.company.findUnique({
                where: { cnpj: body.cnpj }
            });

            if (cnpjExists) {
                throw HttpError.BadRequest('CNPJ já cadastrado em outra empresa');
            }
        }

        const dataToUpdate = {
            ...(body.nome_fantasia !== undefined && { nomeFantasia: body.nome_fantasia }),
            ...(body.razao_social !== undefined && { razaoSocial: body.razao_social }),
            ...(body.cnpj !== undefined && { cnpj: body.cnpj }),
            ...(body.cep !== undefined && { cep: body.cep }),
            ...(body.email !== undefined && { email: body.email }),
            ...(body.uf !== undefined && { uf: body.uf }),
            ...(body.logradouro !== undefined && { logradouro: body.logradouro }),
            ...(body.telefone !== undefined && { telefone: body.telefone }),
            ...(body.status_empresa !== undefined && {
                statusEmpresa: body.status_empresa
            }),
        };

        const updatedCompany = await prisma.company.update({
            where: { idEmpresa: companyId },
            data: dataToUpdate,
        });

        // Log das mudanças
        const changes: Record<string, { before: any; after: any }> = {};
        for (const key in dataToUpdate) {
            if ((existingCompany as any)[key] !== (updatedCompany as any)[key]) {
                changes[key] = {
                    before: (existingCompany as any)[key],
                    after: (updatedCompany as any)[key],
                };
            }
        }

        if (Object.keys(changes).length > 0) {
            logger.info(`Empresa atualizada (id: ${companyId}) com as mudanças: ${JSON.stringify(changes)}`);
        }

        const response = HttpResponse.Ok({
            message: 'Empresa atualizada com sucesso',
            data: {
                id: companyId,
            }
        });

        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        console.error('Error in updateCompany:', err);
        next(err);
    }
}

export async function deleteCompany(req: Request, res: Response, next: NextFunction) {
    try {
        const { params } = DeleteCompanySchema.parse(req);
        const companyId = params.id;

        const existingCompany = await prisma.company.findUnique({
            where: { idEmpresa: companyId },
            include: {
                colaboradores: true,
                epis: true,
                authCompanies: true
            }
        });

        if (!existingCompany) throw HttpError.NotFound('Empresa não encontrada');


        if (existingCompany.colaboradores.length > 0) {
            throw HttpError.BadRequest('Não é possível deletar empresa com colaboradores vinculados');
        }

        if (existingCompany.epis.length > 0) {
            throw HttpError.BadRequest('Não é possível deletar empresa com EPIs cadastrados');
        }

        if (existingCompany.authCompanies.length > 0) {
            throw HttpError.BadRequest('Não é possível deletar empresa com usuários vinculados');
        }

        await prisma.company.delete({
            where: { idEmpresa: companyId },
        });

        logger.info(`Empresa deletada com sucesso (id: ${companyId})`);

        const response = HttpResponse.Ok({
            message: 'Empresa deletada com sucesso',
            company: {
                id: existingCompany.idEmpresa,
                nomeFantasia: existingCompany.nomeFantasia,
                cnpj: existingCompany.cnpj
            },
        });

        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        console.error('Error in deleteCompany:', err);
        next(err);
    }
}