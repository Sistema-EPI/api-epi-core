import { PrismaClient } from '@prisma/client';
import {
  CreateBiometriaType,
  UpdateBiometriaType,
  VerifyBiometriaType,
  MatchBiometriaType,
} from '../Schemas/BiometriaSchema';
import HttpError from '../Helpers/HttpError';

const prisma = new PrismaClient();

export class BiometriaService {
  static async createBiometria(data: CreateBiometriaType, idEmpresa: string) {
    const colaborador = await prisma.collaborator.findFirst({
      where: {
        idColaborador: data.idColaborador,
        idEmpresa: idEmpresa,
        status: true,
      },
    });

    if (!colaborador) {
      throw new HttpError('Colaborador não encontrado ou inativo', 404);
    }

    const biometriasExistentes = await prisma.biometria.count({
      where: {
        idColaborador: data.idColaborador,
      },
    });

    if (biometriasExistentes >= 2) {
      throw new HttpError('Colaborador já possui o máximo de 2 biometrias cadastradas', 400);
    }

    const biometria = await prisma.biometria.create({
      data: {
        idColaborador: data.idColaborador,
        biometriaPath: data.biometriaPath,
        certificadoPath: data.certificadoPath,
      },
      include: {
        colaborador: {
          select: {
            idColaborador: true,
            nomeColaborador: true,
            cpf: true,
            status: true,
          },
        },
      },
    });

    return biometria;
  }

  static async updateBiometria(idBiometria: string, data: UpdateBiometriaType, idEmpresa: string) {
    const biometriaExistente = await prisma.biometria.findFirst({
      where: {
        idBiometria: idBiometria,
        colaborador: {
          idEmpresa: idEmpresa,
        },
      },
      include: {
        colaborador: true,
      },
    });

    if (!biometriaExistente) {
      throw new HttpError('Biometria não encontrada', 404);
    }

    const biometriaAtualizada = await prisma.biometria.update({
      where: {
        idBiometria: idBiometria,
      },
      data: {
        biometriaPath: data.biometriaPath,
        certificadoPath: data.certificadoPath,
      },
      include: {
        colaborador: {
          select: {
            idColaborador: true,
            nomeColaborador: true,
            cpf: true,
            status: true,
          },
        },
      },
    });

    return biometriaAtualizada;
  }

  static async deleteBiometria(idBiometria: string, idEmpresa: string) {
    const biometriaExistente = await prisma.biometria.findFirst({
      where: {
        idBiometria: idBiometria,
        colaborador: {
          idEmpresa: idEmpresa,
        },
      },
    });

    if (!biometriaExistente) {
      throw new HttpError('Biometria não encontrada', 404);
    }

    await prisma.biometria.delete({
      where: {
        idBiometria: idBiometria,
      },
    });

    return { message: 'Biometria deletada com sucesso' };
  }

  static async getBiometriasByColaborador(idColaborador: string, idEmpresa: string) {
    const colaborador = await prisma.collaborator.findFirst({
      where: {
        idColaborador: idColaborador,
        idEmpresa: idEmpresa,
      },
    });

    if (!colaborador) {
      throw new HttpError('Colaborador não encontrado', 404);
    }

    const biometrias = await prisma.biometria.findMany({
      where: {
        idColaborador: idColaborador,
      },
      include: {
        colaborador: {
          select: {
            idColaborador: true,
            nomeColaborador: true,
            cpf: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return biometrias;
  }

  static async hasBiometria(idColaborador: string, idEmpresa: string) {
    const colaborador = await prisma.collaborator.findFirst({
      where: {
        idColaborador: idColaborador,
        idEmpresa: idEmpresa,
        status: true,
      },
    });

    if (!colaborador) {
      throw new HttpError('Colaborador não encontrado ou inativo', 404);
    }

    const totalBiometrias = await prisma.biometria.count({
      where: {
        idColaborador: idColaborador,
      },
    });

    return {
      colaborador: {
        idColaborador: colaborador.idColaborador,
        nomeColaborador: colaborador.nomeColaborador,
        cpf: colaborador.cpf,
      },
      hasBiometria: totalBiometrias > 0,
      totalBiometrias: totalBiometrias,
      maxBiometrias: 2,
      canAddMore: totalBiometrias < 2,
    };
  }

  static async getBiometriaById(idBiometria: string, idEmpresa: string) {
    const biometria = await prisma.biometria.findFirst({
      where: {
        idBiometria: idBiometria,
        colaborador: {
          idEmpresa: idEmpresa,
        },
      },
      include: {
        colaborador: {
          select: {
            idColaborador: true,
            nomeColaborador: true,
            cpf: true,
            status: true,
            empresa: {
              select: {
                idEmpresa: true,
                nomeFantasia: true,
              },
            },
          },
        },
      },
    });

    if (!biometria) {
      throw new HttpError('Biometria não encontrada', 404);
    }

    return biometria;
  }

  static async verifyBiometria(data: VerifyBiometriaType, idEmpresa: string) {
    // Buscar biometrias do colaborador
    const biometrias = await this.getBiometriasByColaborador(data.idColaborador, idEmpresa);

    if (biometrias.length === 0) {
      throw new HttpError('Colaborador não possui biometrias cadastradas', 404);
    }

    // TODO: Implementar algoritmo de comparação biométrica
    // const matchResult = await BiometricAlgorithm.compare(
    //   data.biometriaData,
    //   biometrias.map(b => b.biometriaPath)
    // );

    // Por enquanto, simulando resultado
    const isMatch = false; // TODO: Implementar algoritmo real

    return {
      colaborador: biometrias[0].colaborador,
      isMatch: isMatch,
      confidence: 0, // TODO: Implementar confiança do match
      matchedBiometriaId: isMatch ? biometrias[0].idBiometria : null,
      timestamp: new Date(),
    };
  }

  static async matchBiometriaForProcess(data: MatchBiometriaType, idEmpresa: string) {
    const processo = await prisma.process.findFirst({
      where: {
        idProcesso: data.idProcesso,
        idEmpresa: idEmpresa,
        statusEntrega: false,
      },
      include: {
        colaborador: true,
      },
    });

    if (!processo) {
      throw new HttpError('Processo não encontrado ou já foi entregue', 404);
    }

    if (processo.idColaborador !== data.idColaborador) {
      throw new HttpError('Colaborador não corresponde ao processo', 400);
    }

    const verificationResult = await this.verifyBiometria(
      {
        idColaborador: data.idColaborador,
        biometriaData: data.biometriaData,
      },
      idEmpresa,
    );

    if (!verificationResult.isMatch) {
      throw new HttpError('Biometria não confere', 401);
    }

    // TODO: Integrar com ProcessService para confirmar entrega
    // await ProcessService.confirmDelivery(data.idProcesso, {
    //   dataEntrega: new Date(),
    //   biometriaConfirmada: true,
    //   biometriaId: verificationResult.matchedBiometriaId,
    // });

    return {
      message: 'Entrega confirmada via biometria',
      processo: {
        idProcesso: processo.idProcesso,
        colaborador: processo.colaborador,
      },
      biometriaMatch: verificationResult,
      confirmedAt: new Date(),
    };
  }

  static async getAllBiometriasByEmpresa(idEmpresa: string) {
    const biometrias = await prisma.biometria.findMany({
      where: {
        colaborador: {
          idEmpresa: idEmpresa,
        },
      },
      include: {
        colaborador: {
          select: {
            idColaborador: true,
            nomeColaborador: true,
            cpf: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return biometrias;
  }
}
