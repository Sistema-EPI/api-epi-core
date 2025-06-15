import { PrismaClient } from '@prisma/client';
import HttpError from '../Helpers/HttpError';
import logger from '../Helpers/Logger';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

interface CreateUserData {
  email: string;
  senha: string;
  cargo: string;
  status_user?: boolean;
}

interface UpdateUserStatusData {
  email?: string;
  statusUser: boolean;
}

interface ConnectUserToCompanyData {
  cargo: string;
}

interface GetUsersParams {
  page?: string;
  limit?: string;
}

export class UserService {
  async getAllUsers(params: GetUsersParams) {
    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '10', 10);
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      prisma.user.count({
        where: { deletedAt: null }
      }),
      prisma.user.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data
    };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        idUser: userId,
        deletedAt: null
      },
      include: {
        authCompanies: {
          include: {
            empresa: {
              select: {
                idEmpresa: true,
                razaoSocial: true,
                nomeFantasia: true,
                cnpj: true,
                statusEmpresa: true
              }
            },
            role: {
              select: {
                cargo: true,
                permissao: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw HttpError.NotFound('Usuário não encontrado');
    }

    return {
      idUser: user.idUser,
      email: user.email,
      statusUser: user.statusUser,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      empresas: user.authCompanies.map((auth) => ({
        idEmpresa: auth.idEmpresa,
        cargo: auth.cargo,
        permissoes: auth.role.permissao,
        empresa: {
          razaoSocial: auth.empresa.razaoSocial,
          nomeFantasia: auth.empresa.nomeFantasia,
          cnpj: auth.empresa.cnpj,
          status: auth.empresa.statusEmpresa
        }
      }))
    };
  }

  async createUser(companyId: string, data: CreateUserData) {
    // Verificar se a empresa existe
    const empresa = await prisma.company.findUnique({
      where: { idEmpresa: companyId }
    });

    if (!empresa) {
      throw HttpError.NotFound('Empresa não encontrada');
    }

    // Verificar se email já está em uso
    const isEmailAlreadyInUse = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (isEmailAlreadyInUse) {
      throw HttpError.BadRequest('Email já está em uso');
    }

    console.log(`Criando usuário para a empresa com o ID: ${empresa.idEmpresa}`);

    const userId = await this.insertUserInTable(data.email, data.senha, data.status_user || true);

    console.log('Usuário criado, conectando à empresa...');

    await this.connectUserToCompany(userId, companyId, data.cargo);

    return {
      idUsuario: userId,
      email: data.email,
      statusUser: data.status_user || true,
      cargo: data.cargo,
    };
  }

  async insertUserInTable(email: string, senha: string, statusUser: boolean) {
    const userId = randomUUID();
    const hashedPassword = await bcrypt.hash(senha, 10);

    const newUser = await prisma.user.create({
      data: {
        idUser: userId,
        email,
        senha: hashedPassword,
        statusUser
      }
    });

    console.log(`Usuário criado com sucesso com o ID: ${newUser.idUser}`);
    logger.info(`Novo usuário criado (id: ${newUser.idUser}, email: ${email})`);

    return newUser.idUser;
  }

  async connectUserToCompany(userId: string, companyId: string, cargo: string) {
    // Verificar se a empresa existe
    const company = await prisma.company.findUnique({
      where: { idEmpresa: companyId }
    });

    if (!company) {
      throw HttpError.NotFound(`Empresa com ID '${companyId}' não encontrada`);
    }

    // Verificar se o cargo existe
    const role = await prisma.role.findUnique({
      where: { cargo }
    });

    if (!role) {
      throw HttpError.BadRequest(`Cargo '${cargo}' não existe`);
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { idUser: userId }
    });

    if (!user) {
      throw HttpError.NotFound(`Usuário com ID '${userId}' não encontrado`);
    }

    // Verificar se já existe conexão
    const existingConnection = await prisma.authCompany.findUnique({
      where: {
        idUser_idEmpresa: {
          idUser: userId,
          idEmpresa: companyId
        }
      }
    });

    if (existingConnection) {
      throw HttpError.BadRequest(`Usuário já está vinculado a esta empresa`);
    }

    const authCompany = await prisma.authCompany.create({
      data: {
        idUser: userId,
        idEmpresa: companyId,
        cargo: cargo
      }
    });

    logger.info(`Usuário ${userId} conectado à empresa ${companyId} com cargo ${cargo}`);

    return authCompany;
  }

  async connectUserToCompanyHandler(userId: string, companyId: string, data: ConnectUserToCompanyData) {
    // Verificar se já existe conexão
    const existing = await prisma.authCompany.findUnique({
      where: {
        idUser_idEmpresa: {
          idUser: userId,
          idEmpresa: companyId
        }
      }
    });

    if (existing) {
      throw HttpError.BadRequest(`Usuário já está vinculado a esta empresa`);
    }

    const result = await this.connectUserToCompany(userId, companyId, data.cargo);

    return result;
  }

  async updatePassword(userId: string, senhaAtual: string, novaSenha: string) {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({ 
      where: { idUser: userId } 
    });

    if (!user) {
      throw HttpError.NotFound('Usuário não encontrado');
    }

    // Verificar se a senha atual está correta
    const senhaCorreta = await bcrypt.compare(senhaAtual, user.senha);

    if (!senhaCorreta) {
      throw HttpError.Unauthorized('Senha atual incorreta');
    }

    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    console.log('Nova senha hasheada:', novaSenhaHash);

    await prisma.user.update({
      where: { idUser: userId },
      data: { senha: novaSenhaHash }
    });

    logger.info(`Senha atualizada para usuário ${userId}`);

    return { message: 'Senha atualizada com sucesso' };
  }

  async updateUserStatus(userId: string, data: UpdateUserStatusData) {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({ 
      where: { idUser: userId } 
    });

    if (!user) {
      throw HttpError.NotFound('Usuário não encontrado');
    }

    console.log('Atualizando status do usuário:', userId);
    console.log('Dados recebidos:', data);

    const updated = await prisma.user.update({
      where: { idUser: userId },
      data: {
        ...(data.email !== undefined && { email: data.email }),
        statusUser: data.statusUser,
      }
    });

    logger.info(`Usuário atualizado (id: ${userId})`);

    return {
      idUser: updated.idUser,
      email: updated.email,
      statusUser: updated.statusUser,
    };
  }

  async deleteUser(userId: string) {
    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { idUser: userId },
      include: {
        authCompanies: true,
        logs: true
      }
    });

    if (!existingUser) {
      throw HttpError.NotFound('Usuário não encontrado');
    }

    if (existingUser.deletedAt) {
      throw HttpError.BadRequest('Usuário já foi deletado');
    }

    // Soft delete - mantém relacionamentos para auditoria
    const updatedUser = await prisma.user.update({
      where: { idUser: userId },
      data: {
        deletedAt: new Date(),
        statusUser: false
      },
    });

    logger.info(`Usuário soft deletado (id: ${updatedUser.idUser})`);

    return {
      idUser: updatedUser.idUser,
      email: updatedUser.email,
      deletedAt: updatedUser.deletedAt
    };
  }

  /**
   * Método auxiliar para verificar se uma empresa existe
   */
  async getCompanyById(companyId: string) {
    return await prisma.company.findUnique({
      where: { idEmpresa: companyId },
      select: {
        idEmpresa: true,
        nomeFantasia: true,
        razaoSocial: true,
        statusEmpresa: true
      }
    });
  }

  /**
   * Método auxiliar para verificar se um email já está em uso
   */
  async isEmailAvailable(email: string, excludeUserId?: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!existingUser) {
      return true; // Email disponível
    }

    // Se estamos excluindo um usuário específico (para update), verificar se é o mesmo
    if (excludeUserId && existingUser.idUser === excludeUserId) {
      return true; // Email pertence ao próprio usuário sendo atualizado
    }

    return false; // Email já está em uso por outro usuário
  }
}
