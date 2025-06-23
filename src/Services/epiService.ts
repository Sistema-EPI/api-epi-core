import { PrismaClient } from '@prisma/client';
import { CompanyService } from './companyService';

const prisma = new PrismaClient();
const companyService = new CompanyService();

export class EpiService {
  static async getEpiById(id: string) {
    return await prisma.epi.findUnique({
      where: {
        idEpi: id,
        status: true,
      },
      include: {
        empresa: {
          select: {
            idEmpresa: true,
            nomeFantasia: true,
            razaoSocial: true,
          },
        },
      },
    });
  }

  static async getEpisByEmpresa(idEmpresa: string, page?: number, limit?: number) {
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit;

    const [epis, total] = await Promise.all([
      prisma.epi.findMany({
        where: {
          idEmpresa: idEmpresa,
          status: true,
        },
        skip,
        take,
        orderBy: { nomeEpi: 'asc' },
        include: {
          empresa: {
            select: {
              idEmpresa: true,
              nomeFantasia: true,
              razaoSocial: true,
            },
          },
        },
      }),
      prisma.epi.count({
        where: {
          idEmpresa: idEmpresa,
          status: true,
        },
      }),
    ]);

    const totalPages = limit ? Math.ceil(total / limit) : 1;
    const currentPage = page || 1;

    return {
      data: epis,
      meta: {
        total,
        page: currentPage,
        limit: limit || total,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
      },
    };
  }

  static async getAllEpis(page?: number, limit?: number, idEmpresa?: string) {
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit;

    const where = idEmpresa
      ? {
          idEmpresa: idEmpresa,
          status: true,
        }
      : {
          status: true,
        };

    const [epis, total] = await Promise.all([
      prisma.epi.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          empresa: {
            select: {
              idEmpresa: true,
              nomeFantasia: true,
              razaoSocial: true,
            },
          },
        },
      }),
      prisma.epi.count({ where }),
    ]);

    const totalPages = limit ? Math.ceil(total / limit) : 1;
    const currentPage = page || 1;

    return {
      data: epis,
      meta: {
        total,
        page: currentPage,
        limit: limit || total,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
      },
    };
  }

  static async createEpi(epiData: {
    ca: string;
    idEmpresa: string;
    nomeEpi: string;
    validade?: Date;
    descricao?: string;
    quantidade: number;
    quantidadeMinima: number;
    dataCompra?: Date;
    preco?: number;
    vidaUtil?: number;
  }) {
    const existingEpi = await prisma.epi.findFirst({
      where: {
        ca: epiData.ca,
        idEmpresa: epiData.idEmpresa,
      },
    });

    if (existingEpi) {
      if (existingEpi.status === true) {
        throw new Error('EPI com este CA já está cadastrado e ativo');
      } else {
        return await prisma.epi.update({
          where: { idEpi: existingEpi.idEpi },
          data: {
            status: true,
            nomeEpi: epiData.nomeEpi,
            validade: epiData.validade,
            descricao: epiData.descricao,
            quantidade: epiData.quantidade,
            quantidadeMinima: epiData.quantidadeMinima,
            dataCompra: epiData.dataCompra,
            preco: epiData.preco,
            vidaUtil: epiData.vidaUtil,
            updatedAt: new Date(),
          },
          include: {
            empresa: {
              select: {
                idEmpresa: true,
                nomeFantasia: true,
                razaoSocial: true,
              },
            },
          },
        });
      }
    }

    return await prisma.epi.create({
      data: {
        ...epiData,
        status: true,
      },
      include: {
        empresa: {
          select: {
            idEmpresa: true,
            nomeFantasia: true,
            razaoSocial: true,
          },
        },
      },
    });
  }

  static async updateEpi(
    id: string,
    epiData: {
      ca?: string;
      idEmpresa?: string;
      nomeEpi?: string;
      validade?: Date;
      descricao?: string;
      quantidade?: number;
      quantidadeMinima?: number;
      dataCompra?: Date;
      preco?: number;
      vidaUtil?: number;
    },
  ) {
    const existingEpi = await prisma.epi.findUnique({
      where: { idEpi: id },
      select: { idEpi: true, status: true, ca: true, idEmpresa: true },
    });

    if (!existingEpi || !existingEpi.status) {
      throw new Error('EPI não encontrado ou está inativo');
    }

    if (epiData.ca && epiData.ca !== existingEpi.ca) {
      const conflictingEpi = await prisma.epi.findFirst({
        where: {
          ca: epiData.ca,
          idEmpresa: existingEpi.idEmpresa,
          status: true,
          idEpi: { not: id },
        },
      });

      if (conflictingEpi) {
        throw new Error('Já existe outro EPI ativo com este CA');
      }
    }

    return await prisma.epi.update({
      where: { idEpi: id },
      data: epiData,
      include: {
        empresa: {
          select: {
            idEmpresa: true,
            nomeFantasia: true,
            razaoSocial: true,
          },
        },
      },
    });
  }

  static async deleteEpi(id: string) {
    const existingEpi = await prisma.epi.findUnique({
      where: { idEpi: id },
      select: { idEpi: true, status: true, nomeEpi: true, ca: true },
    });

    if (!existingEpi) {
      throw new Error('EPI não encontrado');
    }

    if (!existingEpi.status) {
      throw new Error('EPI já está inativo');
    }

    const activeProcesses = await prisma.processEpi.findFirst({
      where: {
        idEpi: id,
        processo: {
          statusEntrega: false,
        },
      },
    });

    if (activeProcesses) {
      throw new Error('Não é possível inativar EPI que possui processos de entrega pendentes');
    }

    return await prisma.epi.update({
      where: { idEpi: id },
      data: {
        status: false,
        updatedAt: new Date(),
      },
      select: {
        idEpi: true,
        nomeEpi: true,
        ca: true,
        status: true,
      },
    });
  }

  static async epiExists(id: string): Promise<boolean> {
    const epi = await prisma.epi.findUnique({
      where: { idEpi: id },
      select: { idEpi: true, status: true },
    });
    return !!(epi && epi.status);
  }

  static async isCaAvailable(
    ca: string,
    idEmpresa: string,
    excludeEpiId?: string,
  ): Promise<boolean> {
    const where: any = {
      ca,
      idEmpresa: idEmpresa,
      status: true,
    };

    if (excludeEpiId) {
      where.idEpi = { not: excludeEpiId };
    }

    const existingEpi = await prisma.epi.findFirst({
      where,
      select: { idEpi: true },
    });

    return !existingEpi;
  }

  static async reactivateEpi(id: string) {
    const existingEpi = await prisma.epi.findUnique({
      where: { idEpi: id },
      select: { idEpi: true, status: true, nomeEpi: true, ca: true },
    });

    if (!existingEpi) {
      throw new Error('EPI não encontrado');
    }

    if (existingEpi.status) {
      throw new Error('EPI já está ativo');
    }

    return await prisma.epi.update({
      where: { idEpi: id },
      data: {
        status: true,
        updatedAt: new Date(),
      },
      include: {
        empresa: {
          select: {
            idEmpresa: true,
            nomeFantasia: true,
            razaoSocial: true,
          },
        },
      },
    });
  }
}
