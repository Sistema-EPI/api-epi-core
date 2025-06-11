import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CompanyService {
  async getCompanyInfo(companyId: string) {
    const company = await prisma.company.findUnique({
      where: {
        idEmpresa: companyId,
        active: true,
        statusEmpresa: 'ATIVO'
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
}
