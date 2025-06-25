import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API EPI Core',
      version: '1.0.0',
      description: 'API para gerenciamento de EPIs (Equipamentos de Proteção Individual)',
      contact: {
        name: 'Equipe de Desenvolvimento',
        email: 'dev@epicore.com',
      },
    },
    servers: [
      {
        url: 'https://hml-service.barcelosengenharia.com/',
        description: 'Servidor de Desenvolvimento',
      },
    ],
    components: {
      schemas: {
        Company: {
          type: 'object',
          properties: {
            idEmpresa: {
              type: 'string',
              format: 'uuid',
              description: 'ID único da empresa',
            },
            nomeFantasia: {
              type: 'string',
              description: 'Nome fantasia da empresa',
            },
            razaoSocial: {
              type: 'string',
              description: 'Razão social da empresa',
            },
            cnpj: {
              type: 'string',
              pattern: '^[0-9]{14}$',
              description: 'CNPJ da empresa (14 dígitos)',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email da empresa',
            },
            telefone: {
              type: 'string',
              description: 'Telefone da empresa',
            },
            uf: {
              type: 'string',
              maxLength: 2,
              description: 'UF da empresa',
            },
            cep: {
              type: 'string',
              pattern: '^[0-9]{8}$',
              description: 'CEP da empresa (8 dígitos)',
            },
            logradouro: {
              type: 'string',
              description: 'Endereço da empresa',
            },
            statusEmpresa: {
              type: 'string',
              enum: ['ATIVO', 'INATIVO'],
              description: 'Status da empresa',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualização',
            },
          },
        },
        Epi: {
          type: 'object',
          properties: {
            ca: {
              type: 'string',
              maxLength: 5,
              description: 'Certificado de Aprovação do EPI (5 caracteres)',
            },
            idEmpresa: {
              type: 'string',
              format: 'uuid',
              description: 'ID da empresa proprietária do EPI',
            },
            nomeEpi: {
              type: 'string',
              description: 'Nome do EPI',
            },
            validade: {
              type: 'string',
              format: 'date',
              description: 'Data de validade do Certificado de Aprovação',
              nullable: true,
            },
            vidaUtil: {
              type: 'string',
              format: 'date',
              description: 'Data de vida útil do EPI para troca pelo colaborador',
              nullable: true,
            },
            quantidade: {
              type: 'integer',
              minimum: 0,
              description: 'Quantidade disponível',
            },
            quantidadeMinima: {
              type: 'integer',
              minimum: 0,
              description: 'Quantidade mínima em estoque',
            },
            dataCompra: {
              type: 'string',
              format: 'date',
              description: 'Data de compra do EPI',
              nullable: true,
            },
            preco: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              description: 'Preço de compra do EPI',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualização',
            },
            empresa: {
              $ref: '#/components/schemas/Company',
            },
          },
        },
        CreateEpiRequest: {
          type: 'object',
          required: ['ca', 'id_empresa', 'nome_epi', 'quantidade', 'quantidade_minima'],
          properties: {
            ca: {
              type: 'string',
              maxLength: 5,
              minLength: 5,
              description: 'Certificado de Aprovação do EPI (exatamente 5 caracteres)',
              example: '12345',
            },
            id_empresa: {
              type: 'string',
              format: 'uuid',
              description: 'ID da empresa proprietária do EPI',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            nome_epi: {
              type: 'string',
              minLength: 1,
              description: 'Nome do EPI',
              example: 'Capacete de Segurança',
            },
            validade: {
              type: 'string',
              format: 'date',
              description: 'Data de validade do Certificado de Aprovação (opcional)',
              example: '2025-12-31',
            },
            vida_util: {
              type: 'string',
              format: 'date',
              description: 'Data de vida útil do EPI para troca pelo colaborador (opcional)',
              example: '2024-12-31',
            },
            quantidade: {
              type: 'integer',
              minimum: 0,
              description: 'Quantidade disponível',
              example: 10,
            },
            quantidade_minima: {
              type: 'integer',
              minimum: 0,
              description: 'Quantidade mínima em estoque',
              example: 5,
            },
            data_compra: {
              type: 'string',
              format: 'date',
              description: 'Data de compra do EPI (opcional)',
              example: '2025-01-01',
            },
            preco: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              description: 'Preço de compra do EPI (opcional)',
              example: 22.8,
            },
          },
        },
        UpdateEpiRequest: {
          type: 'object',
          properties: {
            id_empresa: {
              type: 'string',
              format: 'uuid',
              description: 'ID da empresa proprietária do EPI',
            },
            nome_epi: {
              type: 'string',
              minLength: 1,
              description: 'Nome do EPI',
            },
            validade: {
              type: 'string',
              format: 'date',
              description: 'Data de validade do Certificado de Aprovação',
            },
            vida_util: {
              type: 'string',
              format: 'date',
              description: 'Data de vida útil do EPI para troca pelo colaborador',
            },
            quantidade: {
              type: 'integer',
              minimum: 0,
              description: 'Quantidade disponível',
            },
            quantidade_minima: {
              type: 'integer',
              minimum: 0,
              description: 'Quantidade mínima em estoque',
            },
            data_compra: {
              type: 'string',
              format: 'date',
              description: 'Data de compra do EPI',
            },
            preco: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              description: 'Preço de compra do EPI',
            },
          },
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Total de registros',
            },
            page: {
              type: 'integer',
              description: 'Página atual',
            },
            limit: {
              type: 'integer',
              description: 'Limite de registros por página',
            },
            totalPages: {
              type: 'integer',
              description: 'Total de páginas',
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica se a operação foi bem-sucedida',
            },
            message: {
              type: 'string',
              description: 'Mensagem de retorno',
            },
            data: {
              type: 'object',
              description: 'Dados retornados pela API',
            },
            pagination: {
              $ref: '#/components/schemas/PaginationResponse',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Mensagem de erro',
            },
            error: {
              type: 'object',
              description: 'Detalhes do erro',
            },
          },
        },
        Collaborator: {
          type: 'object',
          properties: {
            idColaborador: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do colaborador',
            },
            idEmpresa: {
              type: 'string',
              format: 'uuid',
              description: 'ID da empresa do colaborador',
            },
            nomeColaborador: {
              type: 'string',
              description: 'Nome completo do colaborador',
            },
            cpf: {
              type: 'string',
              pattern: '^[0-9]{11}$',
              description: 'CPF do colaborador (11 dígitos)',
            },
            status: {
              type: 'boolean',
              description: 'Status do colaborador (true=ativo, false=inativo)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualização',
            },
            empresa: {
              $ref: '#/components/schemas/Company',
            },
          },
        },
        Biometria: {
          type: 'object',
          properties: {
            idBiometria: {
              type: 'string',
              format: 'uuid',
              description: 'ID único da biometria',
            },
            idColaborador: {
              type: 'string',
              format: 'uuid',
              description: 'ID do colaborador proprietário da biometria',
            },
            biometriaPath: {
              type: 'string',
              description: 'Caminho do arquivo de biometria',
              nullable: true,
            },
            certificadoPath: {
              type: 'string',
              description: 'Caminho do certificado biométrico',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualização',
            },
            colaborador: {
              $ref: '#/components/schemas/Collaborator',
            },
          },
        },
        CreateBiometriaRequest: {
          type: 'object',
          required: ['idColaborador'],
          properties: {
            idColaborador: {
              type: 'string',
              format: 'uuid',
              description: 'ID do colaborador',
              example: 'd6931647-7d5e-46cf-81f7-e784aa6e1a7c',
            },
            biometriaPath: {
              type: 'string',
              description: 'Caminho do arquivo de biometria',
              example: '/storage/biometrias/colaborador-123-bio1.dat',
            },
            certificadoPath: {
              type: 'string',
              description: 'Caminho do certificado biométrico',
              example: '/storage/certificados/colaborador-123-cert1.pem',
            },
          },
        },
        UpdateBiometriaRequest: {
          type: 'object',
          properties: {
            biometriaPath: {
              type: 'string',
              description: 'Novo caminho do arquivo de biometria',
              example: '/storage/biometrias/colaborador-123-bio1-updated.dat',
            },
            certificadoPath: {
              type: 'string',
              description: 'Novo caminho do certificado biométrico',
              example: '/storage/certificados/colaborador-123-cert1-updated.pem',
            },
          },
        },
        BiometriaVerificationResponse: {
          type: 'object',
          properties: {
            colaborador: {
              type: 'object',
              properties: {
                idColaborador: {
                  type: 'string',
                  format: 'uuid',
                },
                nomeColaborador: {
                  type: 'string',
                },
                cpf: {
                  type: 'string',
                },
              },
            },
            hasBiometria: {
              type: 'boolean',
              description: 'Se possui biometria cadastrada',
            },
            totalBiometrias: {
              type: 'number',
              description: 'Quantidade de biometrias cadastradas',
            },
            maxBiometrias: {
              type: 'number',
              description: 'Máximo de biometrias permitidas',
              example: 2,
            },
            canAddMore: {
              type: 'boolean',
              description: 'Se pode adicionar mais biometrias',
            },
          },
        },
        CreateCollaboratorRequest: {
          type: 'object',
          required: ['nome_colaborador', 'cpf', 'status'],
          properties: {
            nome_colaborador: {
              type: 'string',
              minLength: 1,
              description: 'Nome completo do colaborador',
              example: 'João da Silva',
            },
            cpf: {
              type: 'string',
              pattern: '^[0-9]{11}$',
              minLength: 11,
              maxLength: 11,
              description: 'CPF do colaborador (exatamente 11 dígitos)',
              example: '12345678901',
            },
            status: {
              type: 'boolean',
              description: 'Status inicial do colaborador (true=ativo, false=inativo)',
              example: true,
            },
          },
        },
        UpdateCollaboratorRequest: {
          type: 'object',
          properties: {
            nome_colaborador: {
              type: 'string',
              minLength: 1,
              description: 'Nome completo do colaborador',
            },
            cpf: {
              type: 'string',
              pattern: '^[0-9]{11}$',
              minLength: 11,
              maxLength: 11,
              description: 'CPF do colaborador (exatamente 11 dígitos)',
            },
            status: {
              type: 'boolean',
              description: 'Status do colaborador (true=ativo, false=inativo)',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            idUser: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do usuário',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
            },
            statusUser: {
              type: 'boolean',
              description: 'Status ativo/inativo do usuário',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualização',
            },
            deletedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de exclusão (soft delete)',
              nullable: true,
            },
          },
        },
        CreateUserRequest: {
          type: 'object',
          required: ['email', 'senha', 'cargo'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
              example: 'usuario@empresa.com',
            },
            senha: {
              type: 'string',
              minLength: 6,
              description: 'Senha do usuário (mínimo 6 caracteres)',
              example: 'senha123',
            },
            cargo: {
              type: 'string',
              enum: ['ADMIN', 'GESTOR', 'OPERADOR'],
              description: 'Cargo do usuário na empresa',
              example: 'GESTOR',
            },
            status_user: {
              type: 'boolean',
              description: 'Status inicial do usuário (padrão: true)',
              default: true,
            },
          },
        },
        ConnectUserToCompanyRequest: {
          type: 'object',
          required: ['cargo'],
          properties: {
            cargo: {
              type: 'string',
              enum: ['ADMIN', 'GESTOR', 'OPERADOR'],
              description: 'Cargo do usuário na empresa',
              example: 'GESTOR',
            },
          },
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['senhaAtual', 'novaSenha'],
          properties: {
            senhaAtual: {
              type: 'string',
              minLength: 6,
              description: 'Senha atual do usuário',
              example: 'senhaAtual123',
            },
            novaSenha: {
              type: 'string',
              minLength: 6,
              description: 'Nova senha (mínimo 6 caracteres)',
              example: 'novaSenha123',
            },
          },
        },
        UpdateUserStatusRequest: {
          type: 'object',
          required: ['statusUser'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Novo email do usuário (opcional)',
            },
            statusUser: {
              type: 'boolean',
              description: 'Novo status do usuário',
              example: true,
            },
          },
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              description: 'Nome do usuário',
              example: 'João Silva',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
              example: 'joao.silva@empresa.com',
            },
            senha: {
              type: 'string',
              minLength: 6,
              description: 'Nova senha do usuário (mínimo 6 caracteres)',
              example: 'novaSenha123',
            },
          },
          description: 'Pelo menos um campo deve ser fornecido',
        },
        CreateAdminUserRequest: {
          type: 'object',
          required: ['email', 'senha'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário administrador',
              example: 'admin@sistema.com',
            },
            senha: {
              type: 'string',
              minLength: 6,
              description: 'Senha do usuário administrador (mínimo 6 caracteres)',
              example: 'adminPassword123',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'senha'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
              example: 'usuario@empresa.com',
            },
            senha: {
              type: 'string',
              minLength: 6,
              description: 'Senha do usuário',
              example: 'senha123',
            },
            status_user: {
              type: 'string',
              enum: ['ATIVO', 'INATIVO'],
              description: 'Status do usuário (padrão: ATIVO)',
              default: 'ATIVO',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica se o login foi bem-sucedido',
              example: true,
            },
            message: {
              type: 'string',
              description: 'Mensagem de retorno',
              example: 'Login realizado com sucesso',
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description: 'Token JWT de autenticação',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                user: {
                  $ref: '#/components/schemas/User',
                },
                companies: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      idEmpresa: {
                        type: 'string',
                        format: 'uuid',
                      },
                      nomeFantasia: {
                        type: 'string',
                      },
                      cargo: {
                        type: 'string',
                        enum: ['ADMIN', 'GESTOR', 'OPERADOR'],
                      },
                    },
                  },
                  description: 'Lista de empresas associadas ao usuário',
                },
              },
            },
          },
        },
        AuthCompany: {
          type: 'object',
          properties: {
            idUser: {
              type: 'string',
              format: 'uuid',
              description: 'ID do usuário',
            },
            idEmpresa: {
              type: 'string',
              format: 'uuid',
              description: 'ID da empresa',
            },
            cargo: {
              type: 'string',
              enum: ['admin', 'gestor', 'técnico', 'viewer'],
              description: 'Cargo do usuário na empresa',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
            empresa: {
              $ref: '#/components/schemas/Company',
            },
          },
        },
        CreateCollaboratorResponse: {
          type: 'object',
          description: 'Resposta da criação ou reativação de colaborador',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do colaborador',
              example: 'cb4a3087-114f-49be-abcf-ebed5f1f706c',
            },
            nome: {
              type: 'string',
              description: 'Nome completo do colaborador',
              example: 'João da Silva',
            },
            cpf: {
              type: 'string',
              description: 'CPF do colaborador',
              example: '12345678901',
            },
            status: {
              type: 'boolean',
              description: 'Status atual do colaborador',
              example: true,
            },
            empresa: {
              type: 'string',
              description: 'Nome fantasia da empresa',
              example: 'JG Tech',
            },
            reactivated: {
              type: 'boolean',
              description: 'Indica se o colaborador foi reativado (true) ou criado novo (false)',
              example: false,
            },
          },
          required: ['id', 'nome', 'cpf', 'status', 'empresa', 'reactivated'],
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      {
        name: 'Company',
        description: 'Operações relacionadas a empresas',
      },
      {
        name: 'EPI',
        description: 'Operações relacionadas a EPIs (Equipamentos de Proteção Individual)',
      },
      {
        name: 'Collaborator',
        description: 'Operações relacionadas a colaboradores',
      },
      {
        name: 'User',
        description: 'Operações relacionadas a usuários',
      },
      {
        name: 'Auth',
        description: 'Operações de autenticação',
      },
    ],
  },
  apis: ['./dist/Routers/*.js', './src/Routers/*.ts'],
  paths: {
    '/v1/user/get/all': {
      get: {
        summary: 'Buscar todos os usuários',
        description: 'Retorna uma lista paginada de todos os usuários do sistema',
        tags: ['User'],
        responses: {
          '200': {
            description: 'Lista de usuários retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/User' },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'API EPI Core - Documentação',
    }),
  );
};

export default specs;
