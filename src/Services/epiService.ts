import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EpiService {
    /**
     * Busca um EPI pelo ID
     * @param id - UUID do EPI
     * @returns EPI encontrado ou null
     */
    static async getEpiById(id: string) {
        return await prisma.epi.findUnique({
            where: { idEpi: id },
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

    /**
     * Lista todos os EPIs de uma empresa específica
     * @param idEmpresa - UUID da empresa
     * @param page - Número da página (opcional)
     * @param limit - Limite de registros por página (opcional)
     * @returns Lista de EPIs da empresa com metadados de paginação
     */
    static async getEpisByEmpresa(idEmpresa: string, page?: number, limit?: number) {
        const skip = page && limit ? (page - 1) * limit : undefined;
        const take = limit;

        const [epis, total] = await Promise.all([
            prisma.epi.findMany({
                where: { idEmpresa: idEmpresa },
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
                where: { idEmpresa: idEmpresa }
            })
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
                hasPrev: currentPage > 1
            }
        };
    }

    /**
     * Lista todos os EPIs com paginação opcional
     * @param page - Número da página (opcional)
     * @param limit - Limite de registros por página (opcional)
     * @param idEmpresa - UUID da empresa para filtrar (opcional)
     * @returns Lista de EPIs com metadados de paginação
     */
    static async getAllEpis(page?: number, limit?: number, idEmpresa?: string) {
        const skip = page && limit ? (page - 1) * limit : undefined;
        const take = limit;

        const where = idEmpresa ? { idEmpresa: idEmpresa } : {};

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
            prisma.epi.count({ where })
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
                hasPrev: currentPage > 1
            }
        };
    }

    /**
     * Cria um novo EPI
     * @param epiData - Dados do EPI a ser criado
     * @returns EPI criado
     */
    static async createEpi(epiData: {
        ca: string;
        idEmpresa: string;
        nomeEpi: string;
        validade?: Date;
        descricao?: string;
        quantidade: number;
        quantidadeMinima: number;
        dataCompra?: Date;
        vidaUtil?: Date;
    }) {
        return await prisma.epi.create({
            data: epiData,
        });
    }

    /**
     * Atualiza um EPI existente
     * @param id - UUID do EPI
     * @param epiData - Dados do EPI a serem atualizados
     * @returns EPI atualizado ou null se não encontrado
     */
    static async updateEpi(id: string, epiData: {
        ca?: string;
        idEmpresa?: string;
        nomeEpi?: string;
        validade?: Date;
        descricao?: string;
        quantidade?: number;
        quantidadeMinima?: number;
        dataCompra?: Date;
        vidaUtil?: Date;
    }) {
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

    /**
     * Deleta um EPI
     * @param id - UUID do EPI
     * @returns EPI deletado ou null se não encontrado
     */
    static async deleteEpi(id: string) {
        return await prisma.epi.delete({
            where: { idEpi: id },
        });
    }

    /**
     * Verifica se um EPI existe pelo ID
     * @param id - UUID do EPI
     * @returns true se existe, false caso contrário
     */
    static async epiExists(id: string): Promise<boolean> {
        const epi = await prisma.epi.findUnique({
            where: { idEpi: id },
            select: { idEpi: true }
        });
        return !!epi;
    }

    /**
     * Verifica se um CA já está em uso por outra empresa
     * @param ca - Número do CA
     * @param idEmpresa - UUID da empresa
     * @param excludeEpiId - UUID do EPI a ser excluído da verificação (para updates)
     * @returns true se CA está disponível, false se já está em uso
     */
    static async isCaAvailable(ca: string, idEmpresa: string, excludeEpiId?: string): Promise<boolean> {
        const where: any = {
            ca,
            idEmpresa: idEmpresa
        };

        if (excludeEpiId) {
            where.idEpi = { not: excludeEpiId };
        }

        const existingEpi = await prisma.epi.findFirst({
            where,
            select: { idEpi: true }
        });

        return !existingEpi;
    }

    /**
     * Verifica se uma empresa existe
     * @param idEmpresa - UUID da empresa
     * @returns Empresa encontrada ou null
     */
    static async getCompanyById(idEmpresa: string) {
        return await prisma.company.findUnique({
            where: { idEmpresa },
            select: { 
                idEmpresa: true, 
                nomeFantasia: true,
                razaoSocial: true 
            }
        });
    }
}