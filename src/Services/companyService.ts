import { PrismaClient } from '@prisma/client';
import HttpError from '../Helpers/HttpError';
import logger from '../Helpers/Logger';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface CreateCompanyData {
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  cep: string;
  email: string;
  uf?: string;
  logradouro?: string;
  telefone?: string;
  status_empresa: boolean;
}

interface UpdateCompanyData {
  nome_fantasia?: string;
  razao_social?: string;
  cnpj?: string;
  cep?: string;
  email?: string;
  uf?: string;
  logradouro?: string;
  telefone?: string;
  status_empresa?: boolean;
}

interface GetCompaniesParams {
  page?: string;
  limit?: string;
}

export class CompanyService {
  async getAllCompanies(params: GetCompaniesParams) {
    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '10', 10);
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

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: formattedData
    };
  }

  async getCompanyById(companyId: string) {
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

    if (!existingCompany) {
      throw HttpError.NotFound('Empresa não encontrada');
    }

    return {
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
    };
  }

  async createCompany(data: CreateCompanyData) {
    // Verificar se CNPJ já existe
    const existingCompany = await prisma.company.findUnique({
      where: { cnpj: data.cnpj }
    });

    if (existingCompany) {
      throw HttpError.BadRequest('CNPJ já cadastrado');
    }

    const company = await prisma.company.create({
      data: {
        nomeFantasia: data.nome_fantasia,
        razaoSocial: data.razao_social,
        cnpj: data.cnpj,
        cep: data.cep,
        email: data.email,
        uf: data.uf,
        logradouro: data.logradouro,
        telefone: data.telefone,
        statusEmpresa: data.status_empresa,
        apiKey: crypto.randomUUID(),
      },
    });

    logger.info(`Nova empresa criada (id: ${company.idEmpresa})`);

    return {
      id: company.idEmpresa,
      nomeFantasia: company.nomeFantasia,
      cnpj: company.cnpj,
      statusEmpresa: company.statusEmpresa
    };
  }

  async updateCompany(companyId: string, data: UpdateCompanyData) {
    // Verificar se empresa existe
    const existingCompany = await prisma.company.findUnique({
      where: { idEmpresa: companyId },
    });

    if (!existingCompany) {
      throw HttpError.NotFound('Empresa não encontrada');
    }

    // Verificar se o novo CNPJ já existe em outra empresa
    if (data.cnpj && data.cnpj !== existingCompany.cnpj) {
      const cnpjExists = await prisma.company.findUnique({
        where: { cnpj: data.cnpj }
      });

      if (cnpjExists) {
        throw HttpError.BadRequest('CNPJ já cadastrado em outra empresa');
      }
    }

    const dataToUpdate = {
      ...(data.nome_fantasia !== undefined && { nomeFantasia: data.nome_fantasia }),
      ...(data.razao_social !== undefined && { razaoSocial: data.razao_social }),
      ...(data.cnpj !== undefined && { cnpj: data.cnpj }),
      ...(data.cep !== undefined && { cep: data.cep }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.uf !== undefined && { uf: data.uf }),
      ...(data.logradouro !== undefined && { logradouro: data.logradouro }),
      ...(data.telefone !== undefined && { telefone: data.telefone }),
      ...(data.status_empresa !== undefined && {
        statusEmpresa: data.status_empresa
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

    return {
      id: companyId
    };
  }

  async deleteCompany(companyId: string) {
    // Verificar se empresa existe
    const existingCompany = await prisma.company.findUnique({
      where: { idEmpresa: companyId },
      include: {
        colaboradores: true,
        epis: true,
        authCompanies: true
      }
    });

    if (!existingCompany) {
      throw HttpError.NotFound('Empresa não encontrada');
    }

    // Verificar dependências
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

    return {
      id: existingCompany.idEmpresa,
      nomeFantasia: existingCompany.nomeFantasia,
      cnpj: existingCompany.cnpj
    };
  }

  async getCompanyInfo(companyId: string) {
    const company = await prisma.company.findUnique({
      where: {
        idEmpresa: companyId,
        statusEmpresa: true
      },
      select: {
        idEmpresa: true,
        razaoSocial: true,
        nomeFantasia: true,
        cnpj: true,
        statusEmpresa: true,
        email: true,
        telefone: true,
        logradouro: true,
        cep: true,
        uf: true
      }
    });

    if (!company) {
      throw new Error('Empresa não encontrada');
    }

    return {
      id: company.idEmpresa,
      razao_social: company.razaoSocial,
      nome_fantasia: company.nomeFantasia,
      cnpj: company.cnpj,
      status_empresa: company.statusEmpresa,
      email: company.email,
      telefone: company.telefone,
      logradouro: company.logradouro,
      cep: company.cep,
      uf: company.uf
    };
  }

  async updateCompanyStatus(companyId: string, status: boolean) {
    // Verificar se empresa existe
    const existingCompany = await prisma.company.findUnique({
      where: { idEmpresa: companyId },
      select: {
        idEmpresa: true,
        nomeFantasia: true,
        cnpj: true,
        statusEmpresa: true
      }
    });

    if (!existingCompany) {
      throw HttpError.NotFound('Empresa não encontrada');
    }

    // Verificar se o status já é o mesmo
    if (existingCompany.statusEmpresa === status) {
      throw HttpError.BadRequest(`Empresa já está ${status ? 'ativa' : 'inativa'}`);
    }

    // Atualizar apenas o status
    const updatedCompany = await prisma.company.update({
      where: { idEmpresa: companyId },
      data: { statusEmpresa: status },
      select: {
        idEmpresa: true,
        nomeFantasia: true,
        cnpj: true,
        statusEmpresa: true
      }
    });

    logger.info(`Status da empresa alterado (id: ${companyId}) de ${existingCompany.statusEmpresa} para ${status}`);

    return {
      id: updatedCompany.idEmpresa,
      nomeFantasia: updatedCompany.nomeFantasia,
      cnpj: updatedCompany.cnpj,
      statusEmpresa: updatedCompany.statusEmpresa,
      statusAnterior: existingCompany.statusEmpresa
    };
  }
}
