import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Cadastrar empresas
  const empresa1 = await prisma.companies.create({
    data: {
      id_empresa: 'empresa-1',
      nomeFantasia: 'Hamada Tecnologias',
      razao_social: 'Hamada Tecnologias LTDA',
      cnpj: '12345678000199',
      uf: 'RJ',
      cep: '28970000',
      logradouro: 'Av. Principal, 123',
      email: 'contato@hamada.com.br',
      telefone: '21999999999',
      status_empresa: true,
    },
  })

  const empresa2 = await prisma.companies.create({
    data: {
      id_empresa: 'empresa-2',
      nomeFantasia: 'Barcelos Engenharia',
      razao_social: 'Barcelos Engenharia de Segurança LTDA',
      cnpj: '98765432000188',
      uf: 'SP',
      cep: '01001000',
      logradouro: 'Rua Central, 456',
      email: 'contato@barcelos.com.br',
      telefone: '11988888888',
      status_empresa: true,
    },
  })

  // 2. Cadastrar colaboradores
  await prisma.collaborator.createMany({
    data: [
      {
        id_colaborador: 'colab-1',
        id_empresa: empresa1.id_empresa,
        nome_colaborador: 'João da Silva',
        cpf: '12345678901',
        status_colaborador: 'Ativo',
      },
      {
        id_colaborador: 'colab-2',
        id_empresa: empresa2.id_empresa,
        nome_colaborador: 'Maria Souza',
        cpf: '98765432100',
        status_colaborador: 'Ativo',
      },
    ],
  })

  // 3. Cadastrar EPIs
  await prisma.epi.createMany({
    data: [
      {
        ca: '12345',
        id_empresa: empresa1.id_empresa,
        nome_epi: 'Capacete de Segurança',
        validade: new Date('2026-12-31'),
        data_compra: new Date('2023-12-01'),
        quantidade: 20,
        quantidade_minima: 5,
      },
      {
        ca: '67890',
        id_empresa: empresa2.id_empresa,
        nome_epi: 'Luva de Proteção',
        validade: new Date('2025-06-15'),
        data_compra: new Date('2024-01-20'),
        quantidade: 50,
        quantidade_minima: 10,
      },
    ],
  })

  console.log('Seed realizado com sucesso!')
}

main()
  .catch((e) => {
    console.error('Erro ao rodar o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
