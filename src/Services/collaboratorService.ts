import { PrismaClient } from '@prisma/client';
import HttpError from '../Helpers/HttpError';
import logger from '../Helpers/Logger';

const prisma = new PrismaClient();

interface CreateCollaboratorData {
  nome_colaborador: string;
  cpf: string;
  status_colaborador: boolean;
}

interface UpdateCollaboratorData {
  nome_colaborador?: string;
  cpf?: string;
  status_colaborador?: boolean;
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

    return {
      ...existingCollaborator,
      totalProcessos: existingCollaborator._count.processos,
      totalBiometrias: existingCollaborator._count.biometrias,
      totalLogs: existingCollaborator._count.logs,
      _count: undefined
    };
  }

  async createCollaborator(companyId: string, data: CreateCollaboratorData) {
    // Validar se a empresa existe
    const existingCompany = await prisma.company.findUnique({
      where: { idEmpresa: companyId }
    });

    if (!existingCompany) {
      throw HttpError.NotFound('Empresa não encontrada');
    }

    // Verificar se CPF já existe
    const existingCpf = await prisma.collaborator.findUnique({
      where: { cpf: data.cpf }
    });

    if (existingCpf) {
      throw HttpError.BadRequest('CPF já cadastrado');
    }

    const collaborator = await prisma.collaborator.create({
      data: {
        idEmpresa: companyId,
        nomeColaborador: data.nome_colaborador,
        cpf: data.cpf,
        statusColaborador: data.status_colaborador,
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
      status: collaborator.statusColaborador,
      empresa: collaborator.empresa.nomeFantasia
    };
  }

  async updateCollaborator(collaboratorId: string, data: UpdateCollaboratorData) {
    // Verificar se colaborador existe
    const existingCollaborator = await prisma.collaborator.findUnique({
      where: { idColaborador: collaboratorId },
    });

    if (!existingCollaborator) {
      throw HttpError.NotFound('Colaborador não encontrado');
    }

    // Verificar se o novo CPF já existe em outro colaborador
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
      ...(data.status_colaborador !== undefined && { statusColaborador: data.status_colaborador }),
    };

    const updatedCollaborator = await prisma.collaborator.update({
      where: { idColaborador: collaboratorId },
      data: dataToUpdate,
    });

    // Log das mudanças
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
    // Verificar se colaborador existe
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

    // Verificar dependências
    if (existingCollaborator.processos.length > 0) {
      throw HttpError.BadRequest('Não é possível deletar colaborador com processos vinculados');
    }

    // Biometrias e Logs têm CASCADE, então serão deletados automaticamente
    await prisma.collaborator.delete({
      where: { idColaborador: collaboratorId },
    });

    logger.info(`Colaborador ${existingCollaborator.nomeColaborador} removido da empresa ${existingCollaborator.empresa.nomeFantasia} (id: ${collaboratorId})`);

    return {
      id: collaboratorId,
      nome: existingCollaborator.nomeColaborador,
      empresa: existingCollaborator.empresa.nomeFantasia
    };
  }

  /**
   * Método auxiliar para verificar se uma empresa existe
   */
  async getCompanyById(companyId: string) {
    return await prisma.company.findUnique({
      where: { idEmpresa: companyId },
      select: {
        idEmpresa: true,
        nomeFantasia: true,
        razaoSocial: true,
        statusEmpresa: true
      }
    });
  }

  /**
   * Método auxiliar para verificar se um CPF já está em uso
   */
  async isCpfAvailable(cpf: string, excludeCollaboratorId?: string) {
    const existingCollaborator = await prisma.collaborator.findUnique({
      where: { cpf }
    });

    if (!existingCollaborator) {
      return true; // CPF disponível
    }

    // Se estamos excluindo um colaborador específico (para update), verificar se é o mesmo
    if (excludeCollaboratorId && existingCollaborator.idColaborador === excludeCollaboratorId) {
      return true; // CPF pertence ao próprio colaborador sendo atualizado
    }

    return false; // CPF já está em uso por outro colaborador
  }
}
