import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EpiService {
    /**
     * Busca um EPI pelo ID (apenas ativos)
     * @param id - UUID do EPI
     * @returns EPI encontrado ou null
     */
    static async getEpiById(id: string) {
        return await prisma.epi.findUnique({
            where: { 
                idEpi: id,
                status: true // Apenas EPIs ativos
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

    /**
     * Lista todos os EPIs de uma empresa específica (apenas ativos)
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
                where: { 
                    idEmpresa: idEmpresa,
                    status: true // Apenas EPIs ativos
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
                    status: true // Apenas EPIs ativos
                }
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
     * Lista todos os EPIs com paginação opcional (apenas ativos)
     * @param page - Número da página (opcional)
     * @param limit - Limite de registros por página (opcional)
     * @param idEmpresa - UUID da empresa para filtrar (opcional)
     * @returns Lista de EPIs com metadados de paginação
     */
    static async getAllEpis(page?: number, limit?: number, idEmpresa?: string) {
        const skip = page && limit ? (page - 1) * limit : undefined;
        const take = limit;

        const where = idEmpresa ? { 
            idEmpresa: idEmpresa,
            status: true // Apenas EPIs ativos
        } : { 
            status: true // Apenas EPIs ativos
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
     * Cria um novo EPI ou reativa um EPI existente com o mesmo CA
     * @param epiData - Dados do EPI a ser criado
     * @returns EPI criado ou reativado
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
        // Verificar se já existe um EPI com o mesmo CA na empresa
        const existingEpi = await prisma.epi.findFirst({
            where: {
                ca: epiData.ca,
                idEmpresa: epiData.idEmpresa
            }
        });

        if (existingEpi) {
            if (existingEpi.status === true) {
                // EPI já existe e está ativo - erro
                throw new Error('EPI com este CA já está cadastrado e ativo');
            } else {
                // EPI existe mas está inativo - reativar e atualizar dados
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
                        vidaUtil: epiData.vidaUtil,
                        updatedAt: new Date()
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

        // EPI não existe - criar novo
        return await prisma.epi.create({
            data: {
                ...epiData,
                status: true // Por padrão, novos EPIs são criados como ativos
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

    /**
     * Atualiza um EPI existente (apenas ativos)
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
        // Verificar se o EPI existe e está ativo
        const existingEpi = await prisma.epi.findUnique({
            where: { idEpi: id },
            select: { idEpi: true, status: true, ca: true, idEmpresa: true }
        });

        if (!existingEpi || !existingEpi.status) {
            throw new Error('EPI não encontrado ou está inativo');
        }

        // Se está alterando o CA, verificar se não conflita com outro EPI ativo
        if (epiData.ca && epiData.ca !== existingEpi.ca) {
            const conflictingEpi = await prisma.epi.findFirst({
                where: {
                    ca: epiData.ca,
                    idEmpresa: existingEpi.idEmpresa,
                    status: true,
                    idEpi: { not: id }
                }
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

    /**
     * Soft delete - desativa um EPI ao invés de deletar
     * @param id - UUID do EPI
     * @returns EPI desativado ou null se não encontrado
     */
    static async deleteEpi(id: string) {
        // Verificar se o EPI existe e está ativo
        const existingEpi = await prisma.epi.findUnique({
            where: { idEpi: id },
            select: { idEpi: true, status: true, nomeEpi: true, ca: true }
        });

        if (!existingEpi) {
            throw new Error('EPI não encontrado');
        }

        if (!existingEpi.status) {
            throw new Error('EPI já está inativo');
        }

        // Verificar se há processos ativos usando este EPI
        const activeProcesses = await prisma.processEpi.findFirst({
            where: {
                idEpi: id,
                processo: {
                    statusEntrega: false // Processos ainda não entregues
                }
            }
        });

        if (activeProcesses) {
            throw new Error('Não é possível inativar EPI que possui processos de entrega pendentes');
        }

        // Soft delete - apenas desativa o EPI
        return await prisma.epi.update({
            where: { idEpi: id },
            data: { 
                status: false,
                updatedAt: new Date()
            },
            select: {
                idEpi: true,
                nomeEpi: true,
                ca: true,
                status: true
            }
        });
    }

    /**
     * Verifica se um EPI existe pelo ID (apenas ativos)
     * @param id - UUID do EPI
     * @returns true se existe e está ativo, false caso contrário
     */
    static async epiExists(id: string): Promise<boolean> {
        const epi = await prisma.epi.findUnique({
            where: { idEpi: id },
            select: { idEpi: true, status: true }
        });
        return !!(epi && epi.status);
    }

    /**
     * Verifica se um CA já está em uso por outra empresa (apenas EPIs ativos)
     * @param ca - Número do CA
     * @param idEmpresa - UUID da empresa
     * @param excludeEpiId - UUID do EPI a ser excluído da verificação (para updates)
     * @returns true se CA está disponível, false se já está em uso
     */
    static async isCaAvailable(ca: string, idEmpresa: string, excludeEpiId?: string): Promise<boolean> {
        const where: any = {
            ca,
            idEmpresa: idEmpresa,
            status: true // Apenas EPIs ativos
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

    /**
     * Reativa um EPI inativo
     * @param id - UUID do EPI
     * @returns EPI reativado ou null se não encontrado
     */
    static async reactivateEpi(id: string) {
        // Verificar se o EPI existe e está inativo
        const existingEpi = await prisma.epi.findUnique({
            where: { idEpi: id },
            select: { idEpi: true, status: true, nomeEpi: true, ca: true }
        });

        if (!existingEpi) {
            throw new Error('EPI não encontrado');
        }

        if (existingEpi.status) {
            throw new Error('EPI já está ativo');
        }

        // Reativar o EPI
        return await prisma.epi.update({
            where: { idEpi: id },
            data: { 
                status: true,
                updatedAt: new Date()
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