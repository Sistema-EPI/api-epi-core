import { PrismaClient } from '@prisma/client';
import HttpError from '../Helpers/HttpError';
import logger from '../Helpers/Logger';
import { CompanyService } from './companyService';

const prisma = new PrismaClient();
const companyService = new CompanyService();

interface CreateCollaboratorData {
  nome_colaborador: string;
  cpf: string;
  status: boolean;
}

interface UpdateCollaboratorData {
  nome_colaborador?: string;
  cpf?: string;
  status?: boolean;
}

interface GetCollaboratorsParams {
  page?: string;
  limit?: string;
}

export class CollaboratorService {
  async getAllCollaborators(params: GetCollaboratorsParams) {
    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '10', 10);
    const skip = (page - 1) * limit;

    const where = {
      status: true 
    };

    const [total, data] = await Promise.all([
      prisma.collaborator.count({ where }),
      prisma.collaborator.findMany({
        where,
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

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: formattedData
    };
  }

  async getCollaboratorById(collaboratorId: string) {
    const existingCollaborator = await prisma.collaborator.findUnique({
      where: { 
        idColaborador: collaboratorId,
        status: true 
      },
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
            processEpis: {
              include: {
                epi: {
                  select: {
                    ca: true,
                    nomeEpi: true,
                    validade: true
                  }
                }
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
        }
      }
    });

    if (!existingCollaborator) {
      throw HttpError.NotFound('Colaborador não encontrado');
    }

    const [processosCount, biometriasCount, logsCount] = await Promise.all([
      prisma.process.count({ where: { idColaborador: collaboratorId } }),
      prisma.biometria.count({ where: { idColaborador: collaboratorId } }),
      prisma.log.count({ where: { idColaborador: collaboratorId } })
    ]);

    return {
      ...existingCollaborator,
      totalProcessos: processosCount,
      totalBiometrias: biometriasCount,
      totalLogs: logsCount
    };
  }

  async createCollaborator(companyId: string, data: CreateCollaboratorData) {

    const existingCompany = await prisma.company.findUnique({
      where: { idEmpresa: companyId }
    });

    if (!existingCompany) {
      throw HttpError.NotFound('Empresa não encontrada');
    }

    const existingCollaborator = await prisma.collaborator.findFirst({
      where: {
        cpf: data.cpf,
        idEmpresa: companyId
      }
    });

    if (existingCollaborator) {
      if (existingCollaborator.status === true) {

        throw HttpError.BadRequest('Colaborador com este CPF já está cadastrado e ativo nesta empresa');
      } else {

        const reactivatedCollaborator = await prisma.collaborator.update({
          where: { idColaborador: existingCollaborator.idColaborador },
          data: {
            status: true,
            nomeColaborador: data.nome_colaborador,
            updatedAt: new Date()
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

        logger.info(`Colaborador reativado (id: ${reactivatedCollaborator.idColaborador}) para empresa ${existingCompany.nomeFantasia}`);

        return {
          id: reactivatedCollaborator.idColaborador,
          nome: reactivatedCollaborator.nomeColaborador,
          cpf: reactivatedCollaborator.cpf,
          status: reactivatedCollaborator.status,
          empresa: reactivatedCollaborator.empresa.nomeFantasia,
          reactivated: true 
        };
      }
    }

    const existingCpfOtherCompany = await prisma.collaborator.findFirst({
      where: { 
        cpf: data.cpf,
        idEmpresa: { not: companyId }
      }
    });

    if (existingCpfOtherCompany) {
      throw HttpError.BadRequest('CPF já cadastrado em outra empresa');
    }

    const collaborator = await prisma.collaborator.create({
      data: {
        idEmpresa: companyId,
        nomeColaborador: data.nome_colaborador,
        cpf: data.cpf,
        status: data.status,
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

    return {
      id: collaborator.idColaborador,
      nome: collaborator.nomeColaborador,
      cpf: collaborator.cpf,
      status: collaborator.status,
      empresa: collaborator.empresa.nomeFantasia,
      reactivated: false 
    };
  }

  async updateCollaborator(collaboratorId: string, data: UpdateCollaboratorData) {

    const existingCollaborator = await prisma.collaborator.findUnique({
      where: { idColaborador: collaboratorId },
    });

    if (!existingCollaborator) {
      throw HttpError.NotFound('Colaborador não encontrado');
    }

 
    if (data.cpf && data.cpf !== existingCollaborator.cpf) {
      const cpfExists = await prisma.collaborator.findUnique({
        where: { cpf: data.cpf }
      });

      if (cpfExists) {
        throw HttpError.BadRequest('CPF já está cadastrado para outro colaborador');
      }
    }

    const dataToUpdate = {
      ...(data.nome_colaborador !== undefined && { nomeColaborador: data.nome_colaborador }),
      ...(data.cpf !== undefined && { cpf: data.cpf }),
      ...(data.status !== undefined && { status: data.status }),
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

    return {
      id: collaboratorId
    };
  }

  async deleteCollaborator(collaboratorId: string) {
    const existingCollaborator = await prisma.collaborator.findUnique({
      where: { 
        idColaborador: collaboratorId,
        status: true 
      },
      include: {
        processos: {
          where: {
            statusEntrega: false 
          }
        },
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
      throw HttpError.BadRequest('Não é possível remover colaborador com processos de entrega pendentes');
    }


    const deletedCollaborator = await prisma.collaborator.update({
      where: { idColaborador: collaboratorId },
      data: { 
        status: false,
        updatedAt: new Date()
      },
      select: {
        idColaborador: true,
        nomeColaborador: true,
        status: true,
        empresa: {
          select: {
            nomeFantasia: true
          }
        }
      }
    });

    logger.info(`Colaborador ${existingCollaborator.nomeColaborador} removido da empresa ${existingCollaborator.empresa.nomeFantasia} (id: ${collaboratorId})`);

    return {
      idColaborador: deletedCollaborator.idColaborador,
      nome: deletedCollaborator.nomeColaborador,
      status: deletedCollaborator.status,
      empresa: deletedCollaborator.empresa.nomeFantasia
    };
  }


  async isCpfAvailable(cpf: string, excludeCollaboratorId?: string) {
    const existingCollaborator = await prisma.collaborator.findUnique({
      where: { cpf }
    });

    if (!existingCollaborator) {
      return true; 
    }

   
    if (excludeCollaboratorId && existingCollaborator.idColaborador === excludeCollaboratorId) {
      return true; 
    }

    return false; 
  }

  /**
   * Busca todos os colaboradores de uma empresa específica
   * @param companyId - UUID da empresa
   * @param params - Parâmetros de paginação
   * @returns Lista paginada de colaboradores da empresa
   */
  async getCollaboratorsByCompany(companyId: string, params: GetCollaboratorsParams) {

    const existingCompany = await companyService.getCompanyByIdSimple(companyId);
    if (!existingCompany) {
      throw HttpError.NotFound('Empresa não encontrada');
    }

    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '10', 10);
    const skip = (page - 1) * limit;

    const where = {
      idEmpresa: companyId,
      status: true 
    };

    const [total, data] = await Promise.all([
      prisma.collaborator.count({ where }),
      prisma.collaborator.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          empresa: {
            select: {
              idEmpresa: true,
              nomeFantasia: true,
              razaoSocial: true,
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

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: formattedData,
      company: {
        idEmpresa: existingCompany.idEmpresa,
        nomeFantasia: existingCompany.nomeFantasia,
        razaoSocial: existingCompany.razaoSocial
      }
    };
  }
}
