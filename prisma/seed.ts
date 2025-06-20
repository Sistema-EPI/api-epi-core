import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando seed do banco de dados...');

  // 1. Cadastrar roles
  console.log('📝 Criando roles...');
  await prisma.role.createMany({
    data: [
      {
        cargo: 'admin',
        permissao: { create: true, read: true, update: true, delete: true },
      },
      {
        cargo: 'gestor',
        permissao: { create: true, read: true, update: true, delete: true },
      },
      {
        cargo: 'estoque',
        permissao: { create: true, read: true, update: true, delete: false },
      },
      {
        cargo: 'viewer',
        permissao: { create: false, read: true, update: false, delete: false },
      },
    ],
    skipDuplicates: true,
  });

  // 2. Cadastrar 3 empresas
  console.log('🏢 Criando empresas...');
  const empresa1 = await prisma.company.create({
    data: {
      nomeFantasia: 'SafeTech Indústria',
      razaoSocial: 'SafeTech Indústria de Equipamentos LTDA',
      cnpj: '12345678000199',
      apiKey: 'safetech_api_key_2025_secure_token_123456789',
      uf: 'SP',
      cep: '01310100',
      logradouro: 'Av. Paulista, 1000',
      email: 'contato@safetech.com.br',
      telefone: '11987654321',
      statusEmpresa: true,
    },
  });

  const empresa2 = await prisma.company.create({
    data: {
      nomeFantasia: 'Construção Segura',
      razaoSocial: 'Construção Segura Engenharia LTDA',
      cnpj: '98765432000188',
      apiKey: 'construcao_api_key_2025_secure_token_987654321',
      uf: 'RJ',
      cep: '20040020',
      logradouro: 'Rua da Assembleia, 500',
      email: 'contato@construcaosegura.com.br',
      telefone: '21976543210',
      statusEmpresa: true,
    },
  });

  const empresa3 = await prisma.company.create({
    data: {
      nomeFantasia: 'Mineração Protegida',
      razaoSocial: 'Mineração Protegida S/A',
      cnpj: '45678901000123',
      apiKey: 'mineracao_api_key_2025_secure_token_456789123',
      uf: 'MG',
      cep: '30130110',
      logradouro: 'Av. Afonso Pena, 750',
      email: 'contato@mineracaoprotegida.com.br',
      telefone: '31965432109',
      statusEmpresa: true,
    },
  });

  // 3. Cadastrar 5 usuários (1 admin, 2 gestores, 1 estoquista, 1 viewer)
  console.log('👥 Criando usuários...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador Sistema',
      email: 'admin@sistema.com.br',
      senha: '$2b$12$M0MADXGOM.oVtwZHhmALeuSHH1JVG8FKxdnKkP9tacXi1X.w/acJ2', // "123456"
      statusUser: true,
    },
  });

  const gestorUser1 = await prisma.user.create({
    data: {
      name: 'Maria Silva',
      email: 'gestor1@empresa.com.br',
      senha: '$2b$12$M0MADXGOM.oVtwZHhmALeuSHH1JVG8FKxdnKkP9tacXi1X.w/acJ2', // "123456"
      statusUser: true,
    },
  });

  const gestorUser2 = await prisma.user.create({
    data: {
      name: 'João Santos',
      email: 'gestor2@empresa.com.br',
      senha: '$2b$12$M0MADXGOM.oVtwZHhmALeuSHH1JVG8FKxdnKkP9tacXi1X.w/acJ2', // "123456"
      statusUser: true,
    },
  });

  const estoqueUser = await prisma.user.create({
    data: {
      name: 'Carlos Estoque',
      email: 'estoque@empresa.com.br',
      senha: '$2b$12$M0MADXGOM.oVtwZHhmALeuSHH1JVG8FKxdnKkP9tacXi1X.w/acJ2', // "123456"
      statusUser: true,
    },
  });

  const viewerUser = await prisma.user.create({
    data: {
      name: 'Ana Visualizadora',
      email: 'viewer@empresa.com.br',
      senha: '$2b$12$M0MADXGOM.oVtwZHhmALeuSHH1JVG8FKxdnKkP9tacXi1X.w/acJ2', // "123456"
      statusUser: true,
    },
  });

  // 4. Vincular usuários às empresas (AuthCompany)
  console.log('🔗 Vinculando usuários às empresas...');
  await prisma.authCompany.createMany({
    data: [
      { idUser: adminUser.idUser, idEmpresa: empresa1.idEmpresa, cargo: 'admin' },
      { idUser: gestorUser1.idUser, idEmpresa: empresa2.idEmpresa, cargo: 'gestor' },
      { idUser: gestorUser2.idUser, idEmpresa: empresa3.idEmpresa, cargo: 'gestor' },
      { idUser: estoqueUser.idUser, idEmpresa: empresa1.idEmpresa, cargo: 'estoque' },
      { idUser: viewerUser.idUser, idEmpresa: empresa2.idEmpresa, cargo: 'viewer' },
    ],
  });

  // 5. Cadastrar 3 colaboradores para cada empresa (9 total)
  console.log('🧑‍💼 Criando colaboradores...');

  // Colaboradores Empresa 1
  const colab1_1 = await prisma.collaborator.create({
    data: {
      idEmpresa: empresa1.idEmpresa,
      nomeColaborador: 'Pedro Oliveira',
      cpf: '12345678901',
      status: true,
    },
  });

  const colab1_2 = await prisma.collaborator.create({
    data: {
      idEmpresa: empresa1.idEmpresa,
      nomeColaborador: 'Fernanda Costa',
      cpf: '23456789012',
      status: true,
    },
  });

  const colab1_3 = await prisma.collaborator.create({
    data: {
      idEmpresa: empresa1.idEmpresa,
      nomeColaborador: 'Roberto Almeida',
      cpf: '34567890123',
      status: true,
    },
  });

  // Colaboradores Empresa 2
  const colab2_1 = await prisma.collaborator.create({
    data: {
      idEmpresa: empresa2.idEmpresa,
      nomeColaborador: 'Carla Mendes',
      cpf: '45678901234',
      status: true,
    },
  });

  const colab2_2 = await prisma.collaborator.create({
    data: {
      idEmpresa: empresa2.idEmpresa,
      nomeColaborador: 'Lucas Ferreira',
      cpf: '56789012345',
      status: true,
    },
  });

  const colab2_3 = await prisma.collaborator.create({
    data: {
      idEmpresa: empresa2.idEmpresa,
      nomeColaborador: 'Juliana Rocha',
      cpf: '67890123456',
      status: false,
    },
  });

  // Colaboradores Empresa 3
  const colab3_1 = await prisma.collaborator.create({
    data: {
      idEmpresa: empresa3.idEmpresa,
      nomeColaborador: 'Ricardo Lima',
      cpf: '78901234567',
      status: true,
    },
  });

  const colab3_2 = await prisma.collaborator.create({
    data: {
      idEmpresa: empresa3.idEmpresa,
      nomeColaborador: 'Amanda Souza',
      cpf: '89012345678',
      status: true,
    },
  });

  const colab3_3 = await prisma.collaborator.create({
    data: {
      idEmpresa: empresa3.idEmpresa,
      nomeColaborador: 'Diego Martins',
      cpf: '90123456789',
      status: true,
    },
  });

  // 6. Cadastrar 4 EPIs para cada empresa com CAs específicos
  console.log('🦺 Criando EPIs...');

  // EPIs Empresa 1
  const epi1_1 = await prisma.epi.create({
    data: {
      ca: '15081',
      idEmpresa: empresa1.idEmpresa,
      nomeEpi: 'Capacete de Segurança Classe A',
      descricao: 'Capacete de segurança em polietileno de alta densidade',
      validade: new Date('2026-12-31'),
      vidaUtil: 1095, // 3 anos
      dataCompra: new Date('2024-01-15'),
      quantidade: 50,
      quantidadeMinima: 10,
      preco: 45.9,
      status: true,
    },
  });

  const epi1_2 = await prisma.epi.create({
    data: {
      ca: '34485',
      idEmpresa: empresa1.idEmpresa,
      nomeEpi: 'Luva de Látex Nitrílico',
      descricao: 'Luva de proteção contra agentes químicos e biológicos',
      validade: new Date('2025-08-20'),
      vidaUtil: 180, // 6 meses
      dataCompra: new Date('2024-02-10'),
      quantidade: 100,
      quantidadeMinima: 20,
      preco: 8.5,
      status: true,
    },
  });

  const epi1_3 = await prisma.epi.create({
    data: {
      ca: '41752',
      idEmpresa: empresa1.idEmpresa,
      nomeEpi: 'Óculos de Proteção Panorâmico',
      descricao: 'Óculos de proteção contra impactos e respingos',
      validade: new Date('2027-03-15'),
      vidaUtil: 365, // 1 ano
      dataCompra: new Date('2024-03-05'),
      quantidade: 75,
      quantidadeMinima: 15,
      preco: 25.3,
      status: true,
    },
  });

  const epi1_4 = await prisma.epi.create({
    data: {
      ca: '39240',
      idEmpresa: empresa1.idEmpresa,
      nomeEpi: 'Bota de Segurança PVC',
      descricao: 'Bota de segurança em PVC com biqueira de aço',
      validade: new Date('2026-11-30'),
      vidaUtil: 730, // 2 anos
      dataCompra: new Date('2024-01-20'),
      quantidade: 30,
      quantidadeMinima: 8,
      preco: 89.9,
      status: true,
    },
  });

  // EPIs Empresa 2
  const epi2_1 = await prisma.epi.create({
    data: {
      ca: '15081',
      idEmpresa: empresa2.idEmpresa,
      nomeEpi: 'Capacete de Segurança Classe B',
      descricao: 'Capacete de segurança para trabalhos com eletricidade',
      validade: new Date('2026-10-15'),
      vidaUtil: 1095, // 3 anos
      dataCompra: new Date('2024-02-01'),
      quantidade: 40,
      quantidadeMinima: 8,
      preco: 52.0,
      status: true,
    },
  });

  const epi2_2 = await prisma.epi.create({
    data: {
      ca: '34485',
      idEmpresa: empresa2.idEmpresa,
      nomeEpi: 'Luva Anticorte Nível 3',
      descricao: 'Luva de proteção contra cortes e perfurações',
      validade: new Date('2025-09-10'),
      vidaUtil: 240, // 8 meses
      dataCompra: new Date('2024-01-25'),
      quantidade: 60,
      quantidadeMinima: 12,
      preco: 15.75,
      status: true,
    },
  });

  const epi2_3 = await prisma.epi.create({
    data: {
      ca: '41752',
      idEmpresa: empresa2.idEmpresa,
      nomeEpi: 'Óculos de Segurança com Antiembaçante',
      descricao: 'Óculos com tratamento antiembaçante e proteção UV',
      validade: new Date('2026-07-25'),
      vidaUtil: 365, // 1 ano
      dataCompra: new Date('2024-02-15'),
      quantidade: 45,
      quantidadeMinima: 10,
      preco: 32.4,
      status: true,
    },
  });

  const epi2_4 = await prisma.epi.create({
    data: {
      ca: '39240',
      idEmpresa: empresa2.idEmpresa,
      nomeEpi: 'Bota de Segurança Couro',
      descricao: 'Bota de segurança em couro com palmilha antiperfuração',
      validade: new Date('2027-01-10'),
      vidaUtil: 730, // 2 anos
      dataCompra: new Date('2024-03-01'),
      quantidade: 25,
      quantidadeMinima: 6,
      preco: 125.5,
      status: true,
    },
  });

  // EPIs Empresa 3
  const epi3_1 = await prisma.epi.create({
    data: {
      ca: '15081',
      idEmpresa: empresa3.idEmpresa,
      nomeEpi: 'Capacete Mineração com Lanterna',
      descricao: 'Capacete específico para mineração com sistema de iluminação',
      validade: new Date('2026-09-20'),
      vidaUtil: 1095, // 3 anos
      dataCompra: new Date('2024-01-10'),
      quantidade: 35,
      quantidadeMinima: 7,
      preco: 78.9,
      status: true,
    },
  });

  const epi3_2 = await prisma.epi.create({
    data: {
      ca: '34485',
      idEmpresa: empresa3.idEmpresa,
      nomeEpi: 'Luva Térmica Resistente',
      descricao: 'Luva de proteção contra altas temperaturas',
      validade: new Date('2025-12-05'),
      vidaUtil: 300, // 10 meses
      dataCompra: new Date('2024-02-20'),
      quantidade: 80,
      quantidadeMinima: 16,
      preco: 22.8,
      status: true,
    },
  });

  const epi3_3 = await prisma.epi.create({
    data: {
      ca: '41752',
      idEmpresa: empresa3.idEmpresa,
      nomeEpi: 'Óculos Contra Poeira Mineral',
      descricao: 'Óculos especiais para proteção contra poeira de mineração',
      validade: new Date('2026-06-30'),
      vidaUtil: 365, // 1 ano
      dataCompra: new Date('2024-03-10'),
      quantidade: 55,
      quantidadeMinima: 12,
      preco: 38.6,
      status: true,
    },
  });

  const epi3_4 = await prisma.epi.create({
    data: {
      ca: '39240',
      idEmpresa: empresa3.idEmpresa,
      nomeEpi: 'Bota Mineração Antiderrapante',
      descricao: 'Bota específica para mineração com solado antiderrapante',
      validade: new Date('2027-02-15'),
      vidaUtil: 730, // 2 anos
      dataCompra: new Date('2024-02-28'),
      quantidade: 20,
      quantidadeMinima: 5,
      preco: 145.0,
      status: true,
    },
  });

  // 7. Cadastrar 3 processos para cada empresa (2 false, 1 true)
  console.log('📋 Criando processos...');

  // Processos Empresa 1
  const proc1_1 = await prisma.process.create({
    data: {
      idEmpresa: empresa1.idEmpresa,
      idColaborador: colab1_1.idColaborador,
      dataAgendada: new Date('2025-06-25'),
      statusEntrega: false,
      observacoes: 'Processo agendado - aguardando entrega de capacete',
    },
  });

  const proc1_2 = await prisma.process.create({
    data: {
      idEmpresa: empresa1.idEmpresa,
      idColaborador: colab1_2.idColaborador,
      dataAgendada: new Date('2025-06-28'),
      statusEntrega: false,
      observacoes: 'Processo agendado - kit completo de EPIs',
    },
  });

  const proc1_3 = await prisma.process.create({
    data: {
      idEmpresa: empresa1.idEmpresa,
      idColaborador: colab1_3.idColaborador,
      dataAgendada: new Date('2025-06-20'),
      dataEntrega: new Date('2025-06-20T14:30:00'),
      statusEntrega: true,
      pdfUrl: '/storage/termos/termo-entrega-roberto-empresa1.pdf',
      observacoes: 'Entrega realizada com sucesso - luvas e óculos',
    },
  });

  // Processos Empresa 2
  const proc2_1 = await prisma.process.create({
    data: {
      idEmpresa: empresa2.idEmpresa,
      idColaborador: colab2_1.idColaborador,
      dataAgendada: new Date('2025-06-26'),
      statusEntrega: false,
      observacoes: 'Processo agendado - capacete classe B',
    },
  });

  const proc2_2 = await prisma.process.create({
    data: {
      idEmpresa: empresa2.idEmpresa,
      idColaborador: colab2_2.idColaborador,
      dataAgendada: new Date('2025-06-30'),
      statusEntrega: false,
      observacoes: 'Processo agendado - bota de segurança em couro',
    },
  });

  const proc2_3 = await prisma.process.create({
    data: {
      idEmpresa: empresa2.idEmpresa,
      idColaborador: colab2_3.idColaborador,
      dataAgendada: new Date('2025-06-18'),
      dataEntrega: new Date('2025-06-18T09:15:00'),
      statusEntrega: true,
      pdfUrl: '/storage/termos/termo-entrega-juliana-empresa2.pdf',
      observacoes: 'Entrega concluída - luvas anticorte',
    },
  });

  // Processos Empresa 3
  const proc3_1 = await prisma.process.create({
    data: {
      idEmpresa: empresa3.idEmpresa,
      idColaborador: colab3_1.idColaborador,
      dataAgendada: new Date('2025-06-27'),
      statusEntrega: false,
      observacoes: 'Processo agendado - capacete com lanterna',
    },
  });

  const proc3_2 = await prisma.process.create({
    data: {
      idEmpresa: empresa3.idEmpresa,
      idColaborador: colab3_2.idColaborador,
      dataAgendada: new Date('2025-07-01'),
      statusEntrega: false,
      observacoes: 'Processo agendado - kit mineração completo',
    },
  });

  const proc3_3 = await prisma.process.create({
    data: {
      idEmpresa: empresa3.idEmpresa,
      idColaborador: colab3_3.idColaborador,
      dataAgendada: new Date('2025-06-19'),
      dataEntrega: new Date('2025-06-19T11:45:00'),
      statusEntrega: true,
      pdfUrl: '/storage/termos/termo-entrega-diego-empresa3.pdf',
      observacoes: 'Entrega finalizada - óculos contra poeira mineral',
    },
  });

  // 8. Criar relacionamentos ProcessEpi
  console.log('🔗 Criando relacionamentos processo-EPI...');
  await prisma.processEpi.createMany({
    data: [
      // Processos Empresa 1
      { idProcesso: proc1_1.idProcesso, idEpi: epi1_1.idEpi, quantidade: 1 },
      { idProcesso: proc1_2.idProcesso, idEpi: epi1_2.idEpi, quantidade: 2 },
      { idProcesso: proc1_2.idProcesso, idEpi: epi1_3.idEpi, quantidade: 1 },
      { idProcesso: proc1_3.idProcesso, idEpi: epi1_2.idEpi, quantidade: 3 },
      { idProcesso: proc1_3.idProcesso, idEpi: epi1_3.idEpi, quantidade: 1 },

      // Processos Empresa 2
      { idProcesso: proc2_1.idProcesso, idEpi: epi2_1.idEpi, quantidade: 1 },
      { idProcesso: proc2_2.idProcesso, idEpi: epi2_4.idEpi, quantidade: 1 },
      { idProcesso: proc2_3.idProcesso, idEpi: epi2_2.idEpi, quantidade: 2 },

      // Processos Empresa 3
      { idProcesso: proc3_1.idProcesso, idEpi: epi3_1.idEpi, quantidade: 1 },
      { idProcesso: proc3_2.idProcesso, idEpi: epi3_2.idEpi, quantidade: 2 },
      { idProcesso: proc3_2.idProcesso, idEpi: epi3_3.idEpi, quantidade: 1 },
      { idProcesso: proc3_2.idProcesso, idEpi: epi3_4.idEpi, quantidade: 1 },
      { idProcesso: proc3_3.idProcesso, idEpi: epi3_3.idEpi, quantidade: 1 },
    ],
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('📊 Dados criados:');
  console.log('   - 4 roles (admin, gestor, estoque, viewer)');
  console.log('   - 3 empresas');
  console.log('   - 5 usuários (1 admin, 2 gestores, 1 estoquista, 1 viewer)');
  console.log('   - 9 colaboradores (3 por empresa)');
  console.log('   - 12 EPIs (4 por empresa) com CAs: 15081, 34485, 41752, 39240');
  console.log('   - 9 processos (3 por empresa: 2 false, 1 true)');
  console.log('   - Relacionamentos processo-EPI configurados');
}

main()
  .catch(e => {
    console.error('Erro ao rodar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
