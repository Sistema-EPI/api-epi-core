import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Cadastrar empresas
  const empresa1 = await prisma.companies.create({
    data: {
      idEmpresa: 'empresa-1',
      nomeFantasia: 'Hamada Tecnologias',
      razaoSocial: 'Hamada Tecnologias LTDA',
      cnpj: '12345678000199',
      uf: 'RJ',
      cep: '28970000',
      logradouro: 'Av. Principal, 123',
      email: 'contato@hamada.com.br',
      telefone: '21999999999'
     },
  })

  const empresa2 = await prisma.companies.create({
    data: {
      idEmpresa: 'empresa-2',
      nomeFantasia: 'Barcelos Engenharia',
      razaoSocial: 'Barcelos Engenharia de Segurança LTDA',
      cnpj: '98765432000188',
      uf: 'SP',
      cep: '01001000',
      logradouro: 'Rua Central, 456',
      email: 'contato@barcelos.com.br',
      telefone: '11988888888',
    },
  })

  // 2. Cadastrar colaboradores
  await prisma.collaborator.createMany({
    data: [
      {
        idColaborador: 'colab-1',
        idEmpresa: empresa1.idEmpresa,
        nomeColaborador: 'João da Silva',
        cpf: '12345678901',
        statusColaborador: 'Ativo',
      },
      {
        idColaborador: 'colab-2',
        idEmpresa: empresa2.idEmpresa,
        nomeColaborador: 'Maria Souza',
        cpf: '98765432100',
        statusColaborador: 'Ativo',
      },
    ],
  })

  // 3. Cadastrar EPIs
  await prisma.epi.createMany({
    data: [
      {
        ca: '12345',
        idEmpresa: empresa1.idEmpresa,
        nomeEpi: 'Capacete de Segurança',
        validade: new Date('2026-12-31'),
        data_compra: new Date('2023-12-01'),
        quantidade: 20,
        quantidadeMinima: 5,
      },
      {
        ca: '67890',
        idEmpresa: empresa2.idEmpresa,
        nomeEpi: 'Luva de Proteção',
        validade: new Date('2025-06-15'),
        data_compra: new Date('2024-01-20'),
        quantidade: 50,
        quantidadeMinima: 10,
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
