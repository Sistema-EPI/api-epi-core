import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Cadastrar empresas
  const empresa1 = await prisma.company.create({
    data: {
      idEmpresa: 'empresa-1',
      nomeFantasia: 'Barcelos Engenharia',
      razaoSocial: 'Barcelos Engenharia de Segurança LTDA',
      cnpj: '98765432000188',
      uf: 'SP',
      cep: '01001000',
      logradouro: 'Rua Central, 456',
      email: 'contato@barcelos.com.br',
      telefone: '11988888888',
      statusEmpresa: 'ATIVO',
    },
  });

  // 2. Cadastrar cargos e permissões
  await prisma.role.createMany({
    data: [
      {
        cargo: 'admin',
        permissao: { create: true, read: true, update: true, delete: true },
      },
      {
        cargo: 'gestor',
        permissao: { create: true, read: true, update: true, delete: false },
      },
      {
        cargo: 'técnico',
        permissao: { create: false, read: true, update: true, delete: false },
      },
      {
        cargo: 'viewer',
        permissao: { create: false, read: true, update: false, delete: false },
      },
    ],
    skipDuplicates: true,
  });

  // 3. Cadastrar usuários
  const user1 = await prisma.user.create({
    data: {
      idUser: 'user-1',
      email: 'admin@barcelosengenharia.com',
      senha: '$2a$10$mX0Qg4UxrN.TJLARVGxZQOWvY1e/i6FA5hsqLFtEEOcdUfFUH6i22', // "senha123" hasheada
      statusUser: true,
    },
  });

  // 4. Vincular usuários às empresas com cargos
  await prisma.authCompany.createMany({
    data: [
      {
        idUser: user1.idUser,
        idEmpresa: empresa1.idEmpresa,
        cargo: 'admin',
      },
    ],
  });

  console.log('Seed realizado com sucesso!');
}

main()
  .catch(e => {
    console.error('Erro ao rodar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
