import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (apenas das tabelas que existem)
  console.log('🧹 Limpando dados existentes...');

  // Verifica se as tabelas existem antes de tentar deletar
  try {
    await prisma.processEpi.deleteMany();
    console.log('✅ ProcessEpi limpo');
  } catch {
    console.log('⚠️  Tabela ProcessEpi não existe, pulando limpeza');
  }

  try {
    await prisma.biometria.deleteMany();
    console.log('✅ Biometria limpo');
  } catch {
    console.log('⚠️  Tabela Biometria não existe, pulando limpeza');
  }

  try {
    await prisma.process.deleteMany();
    console.log('✅ Process limpo');
  } catch {
    console.log('⚠️  Tabela Process não existe, pulando limpeza');
  }

  try {
    await prisma.epi.deleteMany();
    console.log('✅ Epi limpo');
  } catch {
    console.log('⚠️  Tabela Epi não existe, pulando limpeza');
  }

  try {
    await prisma.collaborator.deleteMany();
    console.log('✅ Collaborator limpo');
  } catch {
    console.log('⚠️  Tabela Collaborator não existe, pulando limpeza');
  }

  try {
    await prisma.authCompany.deleteMany();
    console.log('✅ AuthCompany limpo');
  } catch {
    console.log('⚠️  Tabela AuthCompany não existe, pulando limpeza');
  }

  try {
    await prisma.user.deleteMany();
    console.log('✅ User limpo');
  } catch {
    console.log('⚠️  Tabela User não existe, pulando limpeza');
  }

  try {
    await prisma.company.deleteMany();
    console.log('✅ Company limpo');
  } catch {
    console.log('⚠️  Tabela Company não existe, pulando limpeza');
  }

  try {
    await prisma.role.deleteMany();
    console.log('✅ Role limpo');
  } catch {
    console.log('⚠️  Tabela Role não existe, pulando limpeza');
  }

  try {
    await prisma.log.deleteMany();
    console.log('✅ Log limpo');
  } catch {
    console.log('⚠️  Tabela Log não existe, pulando limpeza');
  }

  // Criar roles
  console.log('👥 Criando roles...');
  const roles = [
    {
      cargo: 'master',
      permissao: {
        read: true,
        create: true,
        delete: true,
        update: true,
        admin: true,
        company: true,
        system: true,
      },
    },
    {
      cargo: 'admin',
      permissao: {
        read: true,
        create: true,
        delete: true,
        update: true,
      },
    },
    {
      cargo: 'gestor',
      permissao: {
        read: true,
        create: true,
        delete: true,
        update: true,
      },
    },
    {
      cargo: 'viewer',
      permissao: {
        read: true,
        create: false,
        delete: false,
        update: false,
      },
    },
  ];

  for (const role of roles) {
    await prisma.role.create({
      data: role,
    });
  }

  // Criar empresas
  console.log('🏢 Criando empresas...');
  const empresas = [
    {
      nomeFantasia: 'TechSafe Solutions',
      razaoSocial: 'TechSafe Solutions Ltda',
      cnpj: '12345678000195',
      apiKey: 'techsafe_api_key_2024_secure',
      uf: 'SP',
      cep: '01310100',
      logradouro: 'Av. Paulista, 1000',
      email: 'contato@techsafe.com.br',
      telefone: '11987654321',
    },
    {
      nomeFantasia: 'Construção Segura',
      razaoSocial: 'Construção Segura Engenharia Ltda',
      cnpj: '98765432000187',
      apiKey: 'construcao_api_key_2024_secure',
      uf: 'RJ',
      cep: '20040020',
      logradouro: 'Rua da Assembleia, 500',
      email: 'contato@construcaosegura.com.br',
      telefone: '21987654321',
    },
    {
      nomeFantasia: 'Industrial Prime',
      razaoSocial: 'Industrial Prime Manufatura S.A.',
      cnpj: '11223344000166',
      apiKey: 'industrial_api_key_2024_secure',
      uf: 'MG',
      cep: '30112000',
      logradouro: 'Av. Afonso Pena, 1500',
      email: 'contato@industrialprime.com.br',
      telefone: '31987654321',
    },
  ];

  const empresasCriadas: any[] = [];
  for (const empresa of empresas) {
    const empresaCriada = await prisma.company.create({
      data: empresa,
    });
    empresasCriadas.push(empresaCriada);
  }

  // Criar usuários (3 por empresa + 1 master)
  console.log('👤 Criando usuários...');
  const senhaHash = await bcrypt.hash('123456', 10);

  // Criar usuário master primeiro
  const masterUser = await prisma.user.create({
    data: {
      name: 'Administrador Master',
      email: 'master@system.admin',
      senha: senhaHash,
      statusUser: true,
    },
  });

  console.log('👑 Usuário master criado:', masterUser.email);

  const usuariosData = [
    // TechSafe Solutions
    { name: 'Carlos Silva', email: 'carlos.silva@techsafe.com.br', cargo: 'admin' },
    { name: 'Ana Santos', email: 'ana.santos@techsafe.com.br', cargo: 'gestor' },
    { name: 'Pedro Costa', email: 'pedro.costa@techsafe.com.br', cargo: 'viewer' },

    // Construção Segura
    { name: 'Maria Oliveira', email: 'maria.oliveira@construcaosegura.com.br', cargo: 'admin' },
    { name: 'João Ferreira', email: 'joao.ferreira@construcaosegura.com.br', cargo: 'gestor' },
    { name: 'Lucia Mendes', email: 'lucia.mendes@construcaosegura.com.br', cargo: 'viewer' },

    // Industrial Prime
    { name: 'Roberto Lima', email: 'roberto.lima@industrialprime.com.br', cargo: 'admin' },
    { name: 'Fernanda Souza', email: 'fernanda.souza@industrialprime.com.br', cargo: 'gestor' },
    { name: 'Diego Alves', email: 'diego.alves@industrialprime.com.br', cargo: 'viewer' },
  ];

  const usuariosCriados: any[] = [];
  for (let i = 0; i < usuariosData.length; i++) {
    const userData = usuariosData[i];

    const usuario = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        senha: senhaHash,
        statusUser: true,
      },
    });

    usuariosCriados.push(usuario);
  }

  // Criar relacionamentos AuthCompany (linkando usuários às empresas)
  console.log('🔗 Criando relacionamentos usuário-empresa...');
  for (let i = 0; i < usuariosCriados.length; i++) {
    const usuario = usuariosCriados[i];
    const userData = usuariosData[i];
    const empresaIndex = Math.floor(i / 3); // 3 usuários por empresa

    await prisma.authCompany.create({
      data: {
        idUser: usuario.idUser,
        idEmpresa: empresasCriadas[empresaIndex].idEmpresa,
        cargo: userData.cargo,
      },
    });
  }

  // Criar relacionamentos master (acesso a todas as empresas)
  console.log('👑 Criando relacionamentos master...');
  for (const empresa of empresasCriadas) {
    await prisma.authCompany.create({
      data: {
        idUser: masterUser.idUser,
        idEmpresa: empresa.idEmpresa,
        cargo: 'master',
      },
    });
  }

  // Criar colaboradores (3 por empresa)
  console.log('👷 Criando colaboradores...');
  const colaboradoresData = [
    // TechSafe Solutions
    { nome: 'Lucas Ferreira', cpf: '12345678901' },
    { nome: 'Carla Rodrigues', cpf: '23456789012' },
    { nome: 'Paulo Henrique', cpf: '34567890123' },

    // Construção Segura
    { nome: 'Sandra Martins', cpf: '45678901234' },
    { nome: 'Ricardo Pereira', cpf: '56789012345' },
    { nome: 'Juliana Silva', cpf: '67890123456' },

    // Industrial Prime
    { nome: 'Marcos Antonio', cpf: '78901234567' },
    { nome: 'Patricia Gomes', cpf: '89012345678' },
    { nome: 'Alexandre Dias', cpf: '90123456789' },
  ];

  const colaboradoresCriados: any[] = [];
  for (let i = 0; i < colaboradoresData.length; i++) {
    const colaboradorData = colaboradoresData[i];
    const empresaIndex = Math.floor(i / 3);

    const colaborador = await prisma.collaborator.create({
      data: {
        nomeColaborador: colaboradorData.nome,
        cpf: colaboradorData.cpf,
        idEmpresa: empresasCriadas[empresaIndex].idEmpresa,
      },
    });

    colaboradoresCriados.push(colaborador);
  }

  // Criar EPIs (4 por empresa com CAs específicos)
  console.log('🦺 Criando EPIs...');
  const casEspecificos = ['15081', '39240', '41752', '20594'];
  const episData = [
    {
      nome: 'Capacete de Segurança',
      descricao: 'Capacete de proteção individual classe A',
      quantidade: 50,
      quantidadeMinima: 10,
      preco: 45.9,
      vidaUtil: 60,
    },
    {
      nome: 'Luvas de Proteção',
      descricao: 'Luvas de segurança em vaqueta',
      quantidade: 100,
      quantidadeMinima: 20,
      preco: 25.5,
      vidaUtil: 30,
    },
    {
      nome: 'Óculos de Proteção',
      descricao: 'Óculos de segurança anti-embaçante',
      quantidade: 75,
      quantidadeMinima: 15,
      preco: 18.9,
      vidaUtil: 24,
    },
    {
      nome: 'Calçado de Segurança',
      descricao: 'Botina de segurança com bico de aço',
      quantidade: 30,
      quantidadeMinima: 5,
      preco: 89.9,
      vidaUtil: 90,
    },
  ];

  const episCriados: any[] = [];
  for (const empresa of empresasCriadas) {
    for (let i = 0; i < episData.length; i++) {
      const epiData = episData[i];
      const epi = await prisma.epi.create({
        data: {
          ca: casEspecificos[i],
          nomeEpi: epiData.nome,
          descricao: epiData.descricao,
          quantidade: epiData.quantidade,
          quantidadeMinima: epiData.quantidadeMinima,
          preco: epiData.preco,
          vidaUtil: epiData.vidaUtil,
          validade: new Date('2025-12-31'),
          dataCompra: new Date('2024-01-15'),
          idEmpresa: empresa.idEmpresa,
        },
      });
      episCriados.push(epi);
    }
  }

  // Criar processos (4 por empresa: 2 entregues, 2 pendentes, 1 com devolução)
  console.log('📋 Criando processos...');
  const processosCriados: any[] = [];

  for (let empresaIndex = 0; empresaIndex < empresasCriadas.length; empresaIndex++) {
    const empresa = empresasCriadas[empresaIndex];
    const colaboradoresEmpresa = colaboradoresCriados.slice(
      empresaIndex * 3,
      (empresaIndex + 1) * 3,
    );
    const episEmpresa = episCriados.slice(empresaIndex * 4, (empresaIndex + 1) * 4);

    // Processo 1 - Entregue
    const processo1 = await prisma.process.create({
      data: {
        idEmpresa: empresa.idEmpresa,
        idColaborador: colaboradoresEmpresa[0].idColaborador,
        dataAgendada: new Date('2024-01-10'),
        dataEntrega: new Date('2024-01-10T09:30:00'),
        statusEntrega: true,
        observacoes: 'Entrega realizada conforme agendamento',
      },
    });

    // Adicionar EPIs ao processo 1
    await prisma.processEpi.create({
      data: {
        idProcesso: processo1.idProcesso,
        idEpi: episEmpresa[0].idEpi,
        quantidade: 1,
      },
    });

    await prisma.processEpi.create({
      data: {
        idProcesso: processo1.idProcesso,
        idEpi: episEmpresa[1].idEpi,
        quantidade: 2,
      },
    });

    // Processo 2 - Entregue
    const processo2 = await prisma.process.create({
      data: {
        idEmpresa: empresa.idEmpresa,
        idColaborador: colaboradoresEmpresa[1].idColaborador,
        dataAgendada: new Date('2024-01-15'),
        dataEntrega: new Date('2024-01-15T14:20:00'),
        statusEntrega: true,
        observacoes: 'Colaborador recebeu todos os EPIs',
      },
    });

    // Adicionar EPIs ao processo 2
    await prisma.processEpi.create({
      data: {
        idProcesso: processo2.idProcesso,
        idEpi: episEmpresa[2].idEpi,
        quantidade: 1,
      },
    });

    // Processo 3 - Pendente
    const processo3 = await prisma.process.create({
      data: {
        idEmpresa: empresa.idEmpresa,
        idColaborador: colaboradoresEmpresa[2].idColaborador,
        dataAgendada: new Date('2024-02-01'),
        statusEntrega: false,
        observacoes: 'Aguardando chegada do colaborador',
      },
    });

    // Adicionar EPIs ao processo 3
    await prisma.processEpi.create({
      data: {
        idProcesso: processo3.idProcesso,
        idEpi: episEmpresa[3].idEpi,
        quantidade: 1,
      },
    });

    // Processo 4 - Pendente com devolução
    const processo4 = await prisma.process.create({
      data: {
        idEmpresa: empresa.idEmpresa,
        idColaborador: colaboradoresEmpresa[0].idColaborador,
        dataAgendada: new Date('2024-01-20'),
        statusEntrega: false,
        dataDevolucao: new Date('2024-01-25T16:00:00'),
        observacoes: 'EPIs devolvidos - substituição necessária',
      },
    });

    // Adicionar EPIs ao processo 4
    await prisma.processEpi.create({
      data: {
        idProcesso: processo4.idProcesso,
        idEpi: episEmpresa[0].idEpi,
        quantidade: 1,
      },
    });

    await prisma.processEpi.create({
      data: {
        idProcesso: processo4.idProcesso,
        idEpi: episEmpresa[1].idEpi,
        quantidade: 1,
      },
    });

    processosCriados.push(processo1, processo2, processo3, processo4);
  }

  // Criar biometrias (1 por empresa)
  console.log('👆 Criando biometrias...');
  for (let empresaIndex = 0; empresaIndex < empresasCriadas.length; empresaIndex++) {
    const colaboradoresEmpresa = colaboradoresCriados.slice(
      empresaIndex * 3,
      (empresaIndex + 1) * 3,
    );

    await prisma.biometria.create({
      data: {
        idColaborador: colaboradoresEmpresa[0].idColaborador, // Primeiro colaborador de cada empresa
        biometriaPath: `/uploads/biometria_${colaboradoresEmpresa[0].idColaborador}.dat`,
        certificadoPath: `/uploads/certificado_${colaboradoresEmpresa[0].idColaborador}.pdf`,
      },
    });
  }

  console.log('✅ Seed concluído com sucesso!');
  console.log(`📊 Dados criados:`);
  console.log(`   • ${roles.length} roles`);
  console.log(`   • ${empresasCriadas.length} empresas`);
  console.log(`   • ${usuariosCriados.length} usuários`);
  console.log(`   • ${colaboradoresCriados.length} colaboradores`);
  console.log(`   • ${episCriados.length} EPIs`);
  console.log(`   • ${processosCriados.length} processos`);
  console.log(`   • ${empresasCriadas.length} biometrias`);
}

main()
  .catch(e => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
