import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Cadastrar empresas com API Keys
  const empresa1 = await prisma.company.create({
    data: {
      nomeFantasia: 'Hamada Tecnologias',
      razaoSocial: 'Hamada Tecnologias LTDA',
      cnpj: '12345678000199',
      apiKey: 'hamada_api_key_2024_secure_token_123456789',
      uf: 'RJ',
      cep: '28970000',
      logradouro: 'Av. Principal, 123',
      email: 'contato@hamada.com.br',
      telefone: '21999999999',
      statusEmpresa: 'ATIVO',
      active: true,
    },
  })

  const empresa2 = await prisma.company.create({
    data: {
      nomeFantasia: 'Barcelos Engenharia',
      razaoSocial: 'Barcelos Engenharia de Segurança LTDA',
      cnpj: '98765432000188',
      apiKey: 'barcelos_api_key_2024_secure_token_987654321',
      uf: 'SP',
      cep: '01001000',
      logradouro: 'Rua Central, 456',
      email: 'contato@barcelos.com.br',
      telefone: '11988888888',
      statusEmpresa: 'ATIVO',
      active: true,
    },
  })

  const empresa3 = await prisma.company.create({
    data: {
      nomeFantasia: 'Construções Oliveira',
      razaoSocial: 'Oliveira Construções e Reformas LTDA',
      cnpj: '45678901000123',
      apiKey: 'oliveira_api_key_2024_secure_token_456789123',
      uf: 'MG',
      cep: '30130110',
      logradouro: 'Rua dos Construtores, 789',
      email: 'contato@oliveiraconstrucoes.com.br',
      telefone: '31977777777',
      statusEmpresa: 'ATIVO',
      active: true,
    },
  })

  const empresa4 = await prisma.company.create({
    data: {
      nomeFantasia: 'JG Tech',
      razaoSocial: 'JG Tech LTDA',
      cnpj: '87654321000177',
      apiKey: 'jgtech_api_key_2024_secure_token_876543210',
      uf: 'RS',
      cep: '90020150',
      logradouro: 'Av. Tecnológica, 1010',
      email: 'contato@techsafety.com.br',
      telefone: '51966666666',
      statusEmpresa: 'ATIVO',
      active: true,
    },
  })

  const empresa5 = await prisma.company.create({
    data: {
      nomeFantasia: 'Silva & Santos Metalúrgica',
      razaoSocial: 'Silva & Santos Metalúrgica LTDA',
      cnpj: '12387654000166',
      apiKey: 'silvasantos_api_key_2024_secure_token_123876540',
      uf: 'SC',
      cep: '88010400',
      logradouro: 'Rua dos Metais, 222',
      email: 'contato@silvasantos.com.br',
      telefone: '47955555555',
      statusEmpresa: 'INATIVO',
      active: false,
    },
  })

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
  })

  // 3. Cadastrar usuários com dados completos
  const user1 = await prisma.user.create({
    data: {
      idUser: 'user-1',
      name: 'João Silva',
      email: 'admin@hamada.com.br',
      senha: '$2b$12$M0MADXGOM.oVtwZHhmALeuSHH1JVG8FKxdnKkP9tacXi1X.w/acJ2', // "123456" hasheada com bcrypt
      statusUser: true,
      avatar: null,
      department: 'Administração',
      position: 'Administrador',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      idUser: 'user-2',
      name: 'Maria Santos',
      email: 'gestor@barcelos.com.br',
      senha: '$2b$12$M0MADXGOM.oVtwZHhmALeuSHH1JVG8FKxdnKkP9tacXi1X.w/acJ2', // "123456" hasheada com bcrypt
      statusUser: true,
      avatar: null,
      department: 'Gestão',
      position: 'Gestor de Segurança',
    },
  })

  const user3 = await prisma.user.create({
    data: {
      idUser: 'user-3',
      name: 'Carlos Pereira',
      email: 'tecnico@oliveira.com.br',
      senha: '$2b$12$M0MADXGOM.oVtwZHhmALeuSHH1JVG8FKxdnKkP9tacXi1X.w/acJ2', // "123456" hasheada com bcrypt
      statusUser: true,
      avatar: null,
      department: 'Técnico',
      position: 'Técnico de Segurança',
    },
  })

  const user4 = await prisma.user.create({
    data: {
      idUser: 'user-4',
      name: 'Ana Lima',
      email: 'viewer@techsafety.com.br',
      senha: '$2b$12$M0MADXGOM.oVtwZHhmALeuSHH1JVG8FKxdnKkP9tacXi1X.w/acJ2', // "123456" hasheada com bcrypt
      statusUser: true,
      avatar: null,
      department: 'Consulta',
      position: 'Visualizador',
    },
  })

  const user5 = await prisma.user.create({
    data: {
      idUser: 'user-5',
      name: 'Roberto Oliveira',
      email: 'inativo@silvasantos.com.br',
      senha: '$2b$12$M0MADXGOM.oVtwZHhmALeuSHH1JVG8FKxdnKkP9tacXi1X.w/acJ2', // "123456" hasheada com bcrypt
      statusUser: false,
      avatar: null,
      department: 'Administração',
      position: 'Administrador',
    },
  })

  // 4. Vincular usuários às empresas com cargos
  await prisma.authCompany.createMany({
    data: [
      {
        idUser: user1.idUser,
        idEmpresa: empresa1.idEmpresa,
        cargo: 'admin',
      },
      {
        idUser: user2.idUser,
        idEmpresa: empresa2.idEmpresa,
        cargo: 'gestor',
      },
      {
        idUser: user3.idUser,
        idEmpresa: empresa3.idEmpresa,
        cargo: 'técnico',
      },
      {
        idUser: user4.idUser,
        idEmpresa: empresa4.idEmpresa,
        cargo: 'viewer',
      },
      {
        idUser: user5.idUser,
        idEmpresa: empresa5.idEmpresa,
        cargo: 'admin',
      },
    ],
  })

  // 5. Cadastrar colaboradores
  const colab1 = await prisma.collaborator.create({
    data: {
      idColaborador: 'colab-1',
      idEmpresa: empresa1.idEmpresa,
      nomeColaborador: 'João da Silva',
      cpf: '12345678901',
      statusColaborador: 'Ativo',
    },
  })

  const colab2 = await prisma.collaborator.create({
    data: {
      idColaborador: 'colab-2',
      idEmpresa: empresa1.idEmpresa,
      nomeColaborador: 'Maria Souza',
      cpf: '98765432100',
      statusColaborador: 'Ativo',
    },
  })

  const colab3 = await prisma.collaborator.create({
    data: {
      idColaborador: 'colab-3',
      idEmpresa: empresa2.idEmpresa,
      nomeColaborador: 'Carlos Pereira',
      cpf: '45678912300',
      statusColaborador: 'Ativo',
    },
  })

  const colab4 = await prisma.collaborator.create({
    data: {
      idColaborador: 'colab-4',
      idEmpresa: empresa2.idEmpresa,
      nomeColaborador: 'Ana Lima',
      cpf: '78912345600',
      statusColaborador: 'Afastado',
    },
  })

  const colab5 = await prisma.collaborator.create({
    data: {
      idColaborador: 'colab-5',
      idEmpresa: empresa3.idEmpresa,
      nomeColaborador: 'Fernando Costa',
      cpf: '32165498700',
      statusColaborador: 'Ativo',
    },
  })

  const colab6 = await prisma.collaborator.create({
    data: {
      idColaborador: 'colab-6',
      idEmpresa: empresa3.idEmpresa,
      nomeColaborador: 'Roberta Alves',
      cpf: '65432198700',
      statusColaborador: 'Ativo',
    },
  })

  const colab7 = await prisma.collaborator.create({
    data: {
      idColaborador: 'colab-7',
      idEmpresa: empresa4.idEmpresa,
      nomeColaborador: 'Marcos Oliveira',
      cpf: '98765432101',
      statusColaborador: 'Ativo',
    },
  })

  const colab8 = await prisma.collaborator.create({
    data: {
      idColaborador: 'colab-8',
      idEmpresa: empresa4.idEmpresa,
      nomeColaborador: 'Juliana Santos',
      cpf: '12398745600',
      statusColaborador: 'Férias',
    },
  })

  const colab9 = await prisma.collaborator.create({
    data: {
      idColaborador: 'colab-9',
      idEmpresa: empresa5.idEmpresa,
      nomeColaborador: 'Ricardo Ferreira',
      cpf: '78945612300',
      statusColaborador: 'Inativo',
    },
  })

  const colab10 = await prisma.collaborator.create({
    data: {
      idColaborador: 'colab-10',
      idEmpresa: empresa5.idEmpresa,
      nomeColaborador: 'Paula Martins',
      cpf: '32178945600',
      statusColaborador: 'Ativo',
    },
  })

  // 6. Cadastrar biometrias para alguns colaboradores
  await prisma.biometria.createMany({
    data: [
      {
        idBiometria: 'bio-1',
        idColaborador: colab1.idColaborador,
        biometriaPath: '/storage/biometrias/bio-joao-silva.dat',
        certificadoPath: '/storage/certificados/cert-joao-silva.pdf',
      },
      {
        idBiometria: 'bio-2',
        idColaborador: colab2.idColaborador,
        biometriaPath: '/storage/biometrias/bio-maria-souza.dat',
        certificadoPath: '/storage/certificados/cert-maria-souza.pdf',
      },
      {
        idBiometria: 'bio-3',
        idColaborador: colab3.idColaborador,
        biometriaPath: '/storage/biometrias/bio-carlos-pereira.dat',
        certificadoPath: '/storage/certificados/cert-carlos-pereira.pdf',
      },
      {
        idBiometria: 'bio-5',
        idColaborador: colab5.idColaborador,
        biometriaPath: '/storage/biometrias/bio-fernando-costa.dat',
        certificadoPath: '/storage/certificados/cert-fernando-costa.pdf',
      },
      {
        idBiometria: 'bio-7',
        idColaborador: colab7.idColaborador,
        biometriaPath: '/storage/biometrias/bio-marcos-oliveira.dat',
        certificadoPath: '/storage/certificados/cert-marcos-oliveira.pdf',
      },
    ],
  })

  // 7. Cadastrar EPIs
  const epi1 = await prisma.epi.create({
    data: {
      ca: '12345',
      idEmpresa: empresa1.idEmpresa,
      nomeEpi: 'Capacete de Segurança',
      descricao: 'Capacete de segurança classe A, resistente a impactos',
      validade: new Date('2026-12-31'),
      vidaUtil: new Date('2026-12-01'), // Capacete dura 2 anos
      dataCompra: new Date('2023-12-01'),
      quantidade: 20,
      quantidadeMinima: 5,
    },
  })

  const epi2 = await prisma.epi.create({
    data: {
      ca: '67890',
      idEmpresa: empresa1.idEmpresa,
      nomeEpi: 'Luva de Proteção Química',
      descricao: 'Luva resistente a produtos químicos e solventes',
      validade: new Date('2025-06-15'),
      vidaUtil: new Date('2024-12-20'), // Luva dura 1 ano
      dataCompra: new Date('2024-01-20'),
      quantidade: 50,
      quantidadeMinima: 10,
    },
  })

  const epi3 = await prisma.epi.create({
    data: {
      ca: '23456',
      idEmpresa: empresa2.idEmpresa,
      nomeEpi: 'Óculos de Proteção',
      descricao: 'Óculos de proteção contra respingos e partículas',
      validade: new Date('2026-03-10'),
      vidaUtil: new Date('2025-09-15'), // Óculos dura 1.5 anos
      dataCompra: new Date('2023-09-15'),
      quantidade: 30,
      quantidadeMinima: 8,
    },
  })

  const epi4 = await prisma.epi.create({
    data: {
      ca: '78901',
      idEmpresa: empresa2.idEmpresa,
      nomeEpi: 'Protetor Auricular',
      descricao: 'Protetor auricular tipo plugue, atenuação 25dB',
      validade: new Date('2025-11-22'),
      vidaUtil: new Date('2025-05-10'), // Protetor auricular dura 1.5 anos
      dataCompra: new Date('2023-11-10'),
      quantidade: 100,
      quantidadeMinima: 20,
    },
  })

  const epi5 = await prisma.epi.create({
    data: {
      ca: '34567',
      idEmpresa: empresa3.idEmpresa,
      nomeEpi: 'Bota de Segurança',
      descricao: 'Bota de segurança com biqueira de aço e solado antiderrapante',
      validade: new Date('2026-08-05'),
      vidaUtil: new Date('2026-02-12'), // Bota dura 2 anos
      dataCompra: new Date('2024-02-12'),
      quantidade: 25,
      quantidadeMinima: 5,
    },
  })

  const epi6 = await prisma.epi.create({
    data: {
      ca: '89012',
      idEmpresa: empresa3.idEmpresa,
      nomeEpi: 'Máscara Respiratória',
      descricao: 'Máscara respiratória semifacial com filtro P2',
      validade: new Date('2026-01-30'),
      vidaUtil: new Date('2024-07-18'), // Máscara dura 1 ano
      dataCompra: new Date('2023-07-18'),
      quantidade: 40,
      quantidadeMinima: 15,
    },
  })

  const epi7 = await prisma.epi.create({
    data: {
      ca: '45678',
      idEmpresa: empresa4.idEmpresa,
      nomeEpi: 'Cinto de Segurança',
      descricao: 'Cinto de segurança para trabalho em altura com duas argolas',
      validade: new Date('2027-05-20'),
      vidaUtil: new Date('2029-01-15'), // Cinto dura 5 anos
      dataCompra: new Date('2024-01-15'),
      quantidade: 10,
      quantidadeMinima: 3,
    },
  })

  const epi8 = await prisma.epi.create({
    data: {
      ca: '90123',
      idEmpresa: empresa4.idEmpresa,
      nomeEpi: 'Luva Anti-Corte',
      descricao: 'Luva de proteção contra cortes, nível 5',
      validade: new Date('2025-09-18'),
      vidaUtil: new Date('2024-08-10'), // Luva dura 1 ano
      dataCompra: new Date('2023-08-10'),
      quantidade: 60,
      quantidadeMinima: 12,
    },
  })

  const epi9 = await prisma.epi.create({
    data: {
      ca: '56789',
      idEmpresa: empresa5.idEmpresa,
      nomeEpi: 'Avental de Proteção',
      descricao: 'Avental de proteção contra respingos químicos',
      validade: new Date('2026-04-12'),
      vidaUtil: new Date('2025-10-22'), // Avental dura 2 anos
      dataCompra: new Date('2023-10-22'),
      quantidade: 15,
      quantidadeMinima: 4,
    },
  })

  const epi10 = await prisma.epi.create({
    data: {
      ca: '01234',
      idEmpresa: empresa5.idEmpresa,
      nomeEpi: 'Mangote de Segurança',
      descricao: 'Mangote de proteção para braços e antebraços',
      validade: new Date('2025-12-05'),
      vidaUtil: new Date('2027-03-01'), // Mangote dura 3 anos
      dataCompra: new Date('2024-03-01'),
      quantidade: 12,
      quantidadeMinima: 3,
    },
  })

  // 8. Cadastrar processos de entrega de EPIs
  const process1 = await prisma.process.create({
    data: {
      idProcesso: 'proc-1',
      idColaborador: colab1.idColaborador,
      idEpi: epi1.idEpi,
      dataAgendada: new Date('2024-05-15'),
      dataEntrega: new Date('2024-05-15T10:30:00'),
      statusEntrega: true,
      pdfUrl: '/storage/termos/termo-entrega-capacete-joao.pdf',
      vidaUtil: new Date('2025-05-15'),
    },
  })

  const process2 = await prisma.process.create({
    data: {
      idProcesso: 'proc-2',
      idColaborador: colab1.idColaborador,
      idEpi: epi2.idEpi,
      dataAgendada: new Date('2024-05-15'),
      dataEntrega: new Date('2024-05-15T10:35:00'),
      statusEntrega: true,
      pdfUrl: '/storage/termos/termo-entrega-luva-joao.pdf',
      vidaUtil: new Date('2024-11-15'),
    },
  })

  const process3 = await prisma.process.create({
    data: {
      idProcesso: 'proc-3',
      idColaborador: colab2.idColaborador,
      idEpi: epi1.idEpi,
      dataAgendada: new Date('2024-05-16'),
      dataEntrega: new Date('2024-05-16T14:20:00'),
      statusEntrega: true,
      pdfUrl: '/storage/termos/termo-entrega-capacete-maria.pdf',
      vidaUtil: new Date('2025-05-16'),
    },
  })

  const process4 = await prisma.process.create({
    data: {
      idProcesso: 'proc-4',
      idColaborador: colab3.idColaborador,
      idEpi: epi3.idEpi,
      dataAgendada: new Date('2024-05-20'),
      dataEntrega: new Date('2024-05-20T09:15:00'),
      statusEntrega: true,
      pdfUrl: '/storage/termos/termo-entrega-oculos-carlos.pdf',
      vidaUtil: new Date('2025-05-20'),
      dataDevolucao: new Date('2024-08-15T11:20:00'),
    },
  })

  const process5 = await prisma.process.create({
    data: {
      idProcesso: 'proc-5',
      idColaborador: colab4.idColaborador,
      idEpi: epi4.idEpi,
      dataAgendada: new Date('2024-05-22'),
      dataEntrega: new Date('2024-05-22T16:45:00'),
      statusEntrega: true,
      pdfUrl: '/storage/termos/termo-entrega-protetor-ana.pdf',
      vidaUtil: new Date('2025-05-22'),
    },
  })

  const process6 = await prisma.process.create({
    data: {
      idProcesso: 'proc-6',
      idColaborador: colab5.idColaborador,
      idEpi: epi5.idEpi,
      dataAgendada: new Date('2024-06-05'),
      dataEntrega: new Date('2024-06-05T11:10:00'),
      statusEntrega: true,
      pdfUrl: '/storage/termos/termo-entrega-bota-fernando.pdf',
      vidaUtil: new Date('2025-06-05'),
    },
  })

  const process7 = await prisma.process.create({
    data: {
      idProcesso: 'proc-7',
      idColaborador: colab6.idColaborador,
      idEpi: epi6.idEpi,
      dataAgendada: new Date('2024-06-05'),
      dataEntrega: new Date('2024-06-05T14:30:00'),
      statusEntrega: true,
      pdfUrl: '/storage/termos/termo-entrega-mascara-roberta.pdf',
      vidaUtil: new Date('2025-01-05'),
    },
  })

  const process8 = await prisma.process.create({
    data: {
      idProcesso: 'proc-8',
      idColaborador: colab7.idColaborador,
      idEpi: epi7.idEpi,
      dataAgendada: new Date('2024-06-10'),
      statusEntrega: false,
      vidaUtil: new Date('2025-06-10'),
    },
  })

  const process9 = await prisma.process.create({
    data: {
      idProcesso: 'proc-9',
      idColaborador: colab8.idColaborador,
      idEpi: epi8.idEpi,
      dataAgendada: new Date('2024-06-12'),
      statusEntrega: false,
      vidaUtil: new Date('2025-01-12'),
    },
  })

  const process10 = await prisma.process.create({
    data: {
      idProcesso: 'proc-10',
      idColaborador: colab9.idColaborador,
      idEpi: epi9.idEpi,
      dataAgendada: new Date('2024-06-15'),
      statusEntrega: false,
      vidaUtil: new Date('2025-06-15'),
    },
  })

  // 9. Registrar alguns logs
  await prisma.log.createMany({
    data: [
      {
        idLog: 'log-1',
        idUser: user1.idUser,
        idColaborador: colab1.idColaborador,
        idProcesso: process1.idProcesso,
        idEpi: epi1.idEpi,
        body: { 
          acao: "entrega", 
          detalhes: "Entrega de EPI realizada com sucesso" 
        },
        tipo: "ENTREGA",
        timestamp: new Date('2024-05-15T10:30:00'),
      },
      {
        idLog: 'log-2',
        idUser: user1.idUser,
        idColaborador: colab1.idColaborador,
        idProcesso: process2.idProcesso,
        idEpi: epi2.idEpi,
        body: { 
          acao: "entrega", 
          detalhes: "Entrega de EPI realizada com sucesso" 
        },
        tipo: "ENTREGA",
        timestamp: new Date('2024-05-15T10:35:00'),
      },
      {
        idLog: 'log-3',
        idUser: user1.idUser,
        idColaborador: colab2.idColaborador,
        idProcesso: process3.idProcesso,
        idEpi: epi1.idEpi,
        body: { 
          acao: "entrega", 
          detalhes: "Entrega de EPI realizada com sucesso" 
        },
        tipo: "ENTREGA",
        timestamp: new Date('2024-05-16T14:20:00'),
      },
      {
        idLog: 'log-4',
        idUser: user2.idUser,
        idColaborador: colab3.idColaborador,
        idProcesso: process4.idProcesso,
        idEpi: epi3.idEpi,
        body: { 
          acao: "entrega", 
          detalhes: "Entrega de EPI realizada com sucesso" 
        },
        tipo: "ENTREGA",
        timestamp: new Date('2024-05-20T09:15:00'),
      },
      {
        idLog: 'log-5',
        idUser: user2.idUser,
        idColaborador: colab3.idColaborador,
        idProcesso: process4.idProcesso,
        idEpi: epi3.idEpi,
        body: { 
          acao: "devolução", 
          detalhes: "Devolução de EPI por danificação" 
        },
        tipo: "DEVOLUCAO",
        timestamp: new Date('2024-08-15T11:20:00'),
      },
      {
        idLog: 'log-6',
        idUser: user3.idUser,
        idColaborador: colab5.idColaborador,
        idEpi: epi5.idEpi,
        body: { 
          acao: "estoque", 
          detalhes: "Atualização de estoque: +10 unidades" 
        },
        tipo: "ESTOQUE",
        timestamp: new Date('2024-04-10T09:25:00'),
      },
      {
        idLog: 'log-7',
        idUser: user4.idUser,
        body: { 
          acao: "login", 
          detalhes: "Login no sistema" 
        },
        tipo: "SISTEMA",
        timestamp: new Date('2024-05-10T08:30:00'),
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