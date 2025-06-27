import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // IDs fixos para ambiente de produção
  const empresaId = '6d49d965-7dfa-4bb1-826d-6bf38cbae097';
  const userId = 'eec364b6-5a61-4265-86cc-2311fca6074f';

  // 1. Criar empresa Barcelos Engenharia de Segurança
  const empresa = await prisma.company.create({
    data: {
      idEmpresa: empresaId,
      nomeFantasia: 'Barcelos Engenharia',
      razaoSocial: 'Barcelos Engenharia de Segurança LTDA',
      cnpj: '98765432000188',
      apiKey: 'barcelos_api_key_2025',
      uf: 'SP',
      cep: '01001000',
      logradouro: 'Rua Central, 456',
      email: 'contato@barcelos.com.br',
      telefone: '11988888888',
      statusEmpresa: true,
    },
  });

  // 2. Criar roles (igual seed.ts)
  await prisma.role.createMany({
    data: [
      {
        cargo: 'master',
        permissao: { create: true, read: true, update: true, delete: true },
      },
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

  // 3. Criar usuário Adriano Barcelos
  const user = await prisma.user.create({
    data: {
      idUser: userId,
      name: 'Adriano Barcelos',
      email: 'admin@barcelosengenharia.com',
      senha: '$2b$10$QMYztL9C5YMuYDvl17iAP.dSUtCRB/uLerl58bQgT.NGQeG96Fl2W', // "Barcelos1"
      statusUser: true,
    },
  });

  // 4. Vincular usuário à empresa como master
  await prisma.authCompany.create({
    data: {
      idUser: user.idUser,
      idEmpresa: empresa.idEmpresa,
      cargo: 'master',
    },
  });

  console.log('Seed PRD realizado com sucesso!');
}

main()
  .catch(e => {
    console.error('Erro ao rodar o seed PRD:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
