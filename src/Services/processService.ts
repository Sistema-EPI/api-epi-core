import { PrismaClient } from '@prisma/client';
import {
  CreateProcessType,
  UpdateProcessType,
  GetProcessesByEmpresaType,
  GetProcessesByColaboradorType,
  ListProcessesType,
  ProcessEpiType,
} from '../Schemas/ProcessSchema';
import HttpError from '../Helpers/HttpError';

const prisma = new PrismaClient();

export class ProcessService {
  static async createProcess(data: CreateProcessType, idEmpresa: string) {
    const { idColaborador, dataAgendada, epis, observacoes } = data;

    const colaborador = await prisma.collaborator.findFirst({
      where: {
        idColaborador,
        idEmpresa,
        status: true,
      },
    });

    if (!colaborador) {
      throw new HttpError('Colaborador não encontrado ou inativo', 404);
    }

    const episData = await prisma.epi.findMany({
      where: {
        idEpi: { in: epis.map(e => e.idEpi) },
        idEmpresa,
      },
    });

    if (episData.length !== epis.length) {
      throw new HttpError('Um ou mais EPIs não foram encontrados', 404);
    }

    for (const epiRequest of epis) {
      const epiDB = episData.find(e => e.idEpi === epiRequest.idEpi);
      if (!epiDB) continue;

      if (epiDB.quantidade < epiRequest.quantidade) {
        throw new HttpError(
          `Estoque insuficiente para EPI ${epiDB.nomeEpi}. Disponível: ${epiDB.quantidade}, Solicitado: ${epiRequest.quantidade}`,
          400,
        );
      }
    }

    const processo = await prisma.$transaction(async tx => {
      const novoProcesso = await tx.process.create({
        data: {
          idEmpresa,
          idColaborador,
          dataAgendada,
          observacoes,
        },
      });

      for (const epiRequest of epis) {
        await tx.processEpi.create({
          data: {
            idProcesso: novoProcesso.idProcesso,
            idEpi: epiRequest.idEpi,
            quantidade: epiRequest.quantidade,
          },
        });

        await tx.epi.update({
          where: { idEpi: epiRequest.idEpi },
          data: {
            quantidade: {
              decrement: epiRequest.quantidade,
            },
          },
        });
      }

      return novoProcesso;
    });

    return await this.getProcessById(processo.idProcesso);
  }

  static async getProcessById(idProcesso: string) {
    const processo = await prisma.process.findUnique({
      where: { idProcesso },
      include: {
        empresa: {
          select: {
            idEmpresa: true,
            nomeFantasia: true,
            razaoSocial: true,
          },
        },
        colaborador: {
          select: {
            idColaborador: true,
            nomeColaborador: true,
            cpf: true,
          },
        },
        processEpis: {
          include: {
            epi: {
              select: {
                idEpi: true,
                nomeEpi: true,
                ca: true,
                descricao: true,
              },
            },
          },
        },
      },
    });

    if (!processo) {
      throw new HttpError('Processo não encontrado', 404);
    }

    return processo;
  }

  static async updateProcess(idProcesso: string, data: UpdateProcessType, idEmpresa: string) {
    const processoExistente = await prisma.process.findFirst({
      where: {
        idProcesso,
        idEmpresa,
      },
      include: {
        processEpis: true,
      },
    });

    if (!processoExistente) {
      throw new HttpError('Processo não encontrado', 404);
    }

    const { epis, ...dadosProcesso } = data;

    let novaListaEpis: ProcessEpiType[] | undefined;
    if (epis) {
      const episData = await prisma.epi.findMany({
        where: {
          idEpi: { in: epis.map(e => e.idEpi) },
          idEmpresa,
        },
      });

      if (episData.length !== epis.length) {
        throw new HttpError('Um ou mais EPIs não foram encontrados', 404);
      }

      const episAtuais = processoExistente.processEpis;

      for (const epiAtual of episAtuais) {
        await prisma.epi.update({
          where: { idEpi: epiAtual.idEpi },
          data: {
            quantidade: {
              increment: epiAtual.quantidade,
            },
          },
        });
      }

      const episAtualizados = await prisma.epi.findMany({
        where: {
          idEpi: { in: epis.map(e => e.idEpi) },
        },
      });

      for (const epiRequest of epis) {
        const epiDB = episAtualizados.find(e => e.idEpi === epiRequest.idEpi);
        if (!epiDB) continue;

        if (epiDB.quantidade < epiRequest.quantidade) {
          throw new HttpError(
            `Estoque insuficiente para EPI ${epiDB.nomeEpi}. Disponível: ${epiDB.quantidade}, Solicitado: ${epiRequest.quantidade}`,
            400,
          );
        }
      }

      novaListaEpis = epis;
    }

    const processoAtualizado = await prisma.$transaction(async tx => {
      const processo = await tx.process.update({
        where: { idProcesso },
        data: dadosProcesso,
      });

      if (novaListaEpis) {
        await tx.processEpi.deleteMany({
          where: { idProcesso },
        });

        for (const epiRequest of novaListaEpis) {
          await tx.processEpi.create({
            data: {
              idProcesso,
              idEpi: epiRequest.idEpi,
              quantidade: epiRequest.quantidade,
            },
          });

          await tx.epi.update({
            where: { idEpi: epiRequest.idEpi },
            data: {
              quantidade: {
                decrement: epiRequest.quantidade,
              },
            },
          });
        }
      }

      return processo;
    });

    return await this.getProcessById(idProcesso);
  }

  static async deleteProcess(idProcesso: string, idEmpresa: string) {
    const processo = await prisma.process.findFirst({
      where: {
        idProcesso,
        idEmpresa,
      },
      include: {
        processEpis: true,
      },
    });

    if (!processo) {
      throw new HttpError('Processo não encontrado', 404);
    }

    await prisma.$transaction(async tx => {
      for (const processEpi of processo.processEpis) {
        await tx.epi.update({
          where: { idEpi: processEpi.idEpi },
          data: {
            quantidade: {
              increment: processEpi.quantidade,
            },
          },
        });
      }

      await tx.process.delete({
        where: { idProcesso },
      });
    });

    return { message: 'Processo deletado com sucesso' };
  }

  static async getProcessesByEmpresa(params: GetProcessesByEmpresaType) {
    const { id_empresa, page, limit, status, dataInicio, dataFim } = params;

    const skip = (page - 1) * limit;

    const where: any = {
      idEmpresa: id_empresa,
    };

    if (status !== 'todos') {
      where.statusEntrega = status === 'entregues';
    }

    if (dataInicio || dataFim) {
      where.dataAgendada = {};
      if (dataInicio) where.dataAgendada.gte = dataInicio;
      if (dataFim) where.dataAgendada.lte = dataFim;
    }

    const [processos, total] = await Promise.all([
      prisma.process.findMany({
        where,
        include: {
          colaborador: {
            select: {
              idColaborador: true,
              nomeColaborador: true,
              cpf: true,
            },
          },
          processEpis: {
            include: {
              epi: {
                select: {
                  idEpi: true,
                  nomeEpi: true,
                  ca: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.process.count({ where }),
    ]);

    return {
      processos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProcessesByColaborador(params: GetProcessesByColaboradorType) {
    const { id_colaborador, page, limit, status } = params;

    const skip = (page - 1) * limit;

    const where: any = {
      idColaborador: id_colaborador,
    };

    if (status !== 'todos') {
      where.statusEntrega = status === 'entregues';
    }

    const [processos, total] = await Promise.all([
      prisma.process.findMany({
        where,
        include: {
          empresa: {
            select: {
              idEmpresa: true,
              nomeFantasia: true,
            },
          },
          processEpis: {
            include: {
              epi: {
                select: {
                  idEpi: true,
                  nomeEpi: true,
                  ca: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.process.count({ where }),
    ]);

    return {
      processos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async confirmDelivery(
    idProcesso: string,
    dataEntrega?: Date,
    pdfUrl?: string,
    idEmpresa?: string,
  ) {
    const where: any = { idProcesso };
    if (idEmpresa) {
      where.idEmpresa = idEmpresa;
    }

    const processo = await prisma.process.findFirst({ where });

    if (!processo) {
      throw new HttpError('Processo não encontrado', 404);
    }

    if (processo.statusEntrega) {
      throw new HttpError('Processo já foi entregue', 400);
    }

    const processoAtualizado = await prisma.process.update({
      where: { idProcesso },
      data: {
        statusEntrega: true,
        dataEntrega: dataEntrega || new Date(),
        pdfUrl,
      },
    });

    return await this.getProcessById(idProcesso);
  }

  static async registerReturn(
    idProcesso: string,
    dataDevolucao: Date,
    observacoes?: string,
    idEmpresa?: string,
  ) {
    const where: any = { idProcesso };
    if (idEmpresa) {
      where.idEmpresa = idEmpresa;
    }

    const processo = await prisma.process.findFirst({
      where,
      include: {
        processEpis: true,
      },
    });

    if (!processo) {
      throw new HttpError('Processo não encontrado', 404);
    }

    if (!processo.statusEntrega) {
      throw new HttpError('Processo ainda não foi entregue', 400);
    }

    if (processo.dataDevolucao) {
      throw new HttpError('Processo já foi devolvido', 400);
    }

    await prisma.$transaction(async tx => {
      await tx.process.update({
        where: { idProcesso },
        data: {
          dataDevolucao,
          observacoes: observacoes || processo.observacoes,
        },
      });

      for (const processEpi of processo.processEpis) {
        await tx.epi.update({
          where: { idEpi: processEpi.idEpi },
          data: {
            quantidade: {
              increment: processEpi.quantidade,
            },
          },
        });
      }
    });

    return await this.getProcessById(idProcesso);
  }

  static async listProcesses(params: ListProcessesType) {
    const { page, limit, search, status, dataInicio, dataFim } = params;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status !== 'todos') {
      where.statusEntrega = status === 'entregues';
    }

    if (dataInicio || dataFim) {
      where.dataAgendada = {};
      if (dataInicio) where.dataAgendada.gte = dataInicio;
      if (dataFim) where.dataAgendada.lte = dataFim;
    }

    if (search) {
      where.OR = [
        {
          colaborador: {
            nomeColaborador: {
              contains: search,
            },
          },
        },
        {
          colaborador: {
            cpf: {
              contains: search,
            },
          },
        },
        {
          empresa: {
            nomeFantasia: {
              contains: search,
            },
          },
        },
      ];
    }

    const [processos, total] = await Promise.all([
      prisma.process.findMany({
        where,
        include: {
          empresa: {
            select: {
              idEmpresa: true,
              nomeFantasia: true,
              razaoSocial: true,
            },
          },
          colaborador: {
            select: {
              idColaborador: true,
              nomeColaborador: true,
              cpf: true,
            },
          },
          processEpis: {
            include: {
              epi: {
                select: {
                  idEpi: true,
                  nomeEpi: true,
                  ca: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.process.count({ where }),
    ]);

    return {
      processos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async validateProcessOwnership(idProcesso: string, idEmpresa: string) {
    const processo = await prisma.process.findFirst({
      where: {
        idProcesso,
        idEmpresa,
      },
    });

    if (!processo) {
      throw new HttpError('Processo não encontrado', 404);
    }

    return processo;
  }
}
