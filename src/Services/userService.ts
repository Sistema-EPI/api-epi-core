import { PrismaClient } from '@prisma/client';
import HttpError from '../Helpers/HttpError';
import logger from '../Helpers/Logger';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

interface CreateUserData {
  email: string;
  senha: string;
  name?: string;
  status_user?: boolean;
}

interface CreateAdminUserData {
  email: string;
  senha: string;
  name?: string;
  companyId: string;
}

interface UpdateUserStatusData {
  statusUser: boolean;
}

interface ConnectUserToCompanyData {
  cargo: string;
}

interface GetUsersParams {
  page?: string;
  limit?: string;
  companyId?: string;
}

interface UpdatePasswordData {
  senhaAtual: string;
  novaSenha: string;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  senha?: string;
}

export class UserService {
  async getAllUsers(params: GetUsersParams) {
    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '10', 10);
    const skip = (page - 1) * limit;

    const whereClause = {
      deletedAt: null,
      ...(params.companyId && {
        authCompanies: {
          some: {
            idEmpresa: params.companyId,
          },
        },
      }),
    };

    const [total, data] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          authCompanies: {
            include: {
              empresa: {
                select: {
                  idEmpresa: true,
                  razaoSocial: true,
                  cnpj: true,
                },
              },
              role: {
                select: {
                  cargo: true,
                  permissao: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map(user => ({
        idUser: user.idUser,
        email: user.email,
        name: user.name,
        statusUser: user.statusUser,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        companies: user.authCompanies.map(auth => ({
          idEmpresa: auth.empresa.idEmpresa,
          razaoSocial: auth.empresa.razaoSocial,
          cnpj: auth.empresa.cnpj,
          cargo: auth.cargo,
          permissoes: auth.role?.permissao,
        })),
      })),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async createUser(data: CreateUserData) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw HttpError.BadRequest('Email já está em uso');
    }

    const hashedPassword = await bcrypt.hash(data.senha, 10);

    const user = await prisma.user.create({
      data: {
        idUser: randomUUID(),
        email: data.email,
        senha: hashedPassword,
        name: data.name || data.email.split('@')[0],
        statusUser: data.status_user ?? true,
        createdAt: new Date(),
      },
    });

    logger.info(`Usuário criado: ${user.email}`, { userId: user.idUser });

    return {
      idUser: user.idUser,
      email: user.email,
      name: user.name,
      statusUser: user.statusUser,
      createdAt: user.createdAt,
    };
  }

  async updateUserPassword(userId: string, data: UpdatePasswordData) {
    const user = await prisma.user.findUnique({
      where: { idUser: userId, deletedAt: null },
    });

    if (!user) {
      throw HttpError.NotFound('Usuário não encontrado');
    }

    const isCurrentPasswordValid = await bcrypt.compare(data.senhaAtual, user.senha);
    if (!isCurrentPasswordValid) {
      throw HttpError.BadRequest('Senha atual incorreta');
    }

    const hashedNewPassword = await bcrypt.hash(data.novaSenha, 10);

    await prisma.user.update({
      where: { idUser: userId },
      data: { senha: hashedNewPassword },
    });

    logger.info(`Senha alterada para usuário: ${user.email}`, { userId });

    return { message: 'Senha alterada com sucesso' };
  }

  async updateUserStatus(userId: string, data: UpdateUserStatusData) {
    const user = await prisma.user.findUnique({
      where: { idUser: userId, deletedAt: null },
    });

    if (!user) {
      throw HttpError.NotFound('Usuário não encontrado');
    }

    const updatedUser = await prisma.user.update({
      where: { idUser: userId },
      data: { statusUser: data.statusUser },
    });

    logger.info(
      `Status do usuário alterado: ${user.email} - ${data.statusUser ? 'ativado' : 'desativado'}`,
      { userId },
    );

    return {
      idUser: updatedUser.idUser,
      email: updatedUser.email,
      name: updatedUser.name,
      statusUser: updatedUser.statusUser,
    };
  }

  async updateUser(userId: string, data: UpdateUserData) {
    const user = await prisma.user.findUnique({
      where: { idUser: userId, deletedAt: null },
    });

    if (!user) {
      throw HttpError.NotFound('Usuário não encontrado');
    }

    // Verificar se o email já existe (se estiver sendo alterado)
    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email, deletedAt: null },
      });

      if (existingUser) {
        throw HttpError.BadRequest('Email já está em uso por outro usuário');
      }
    }

    // Preparar dados para atualização
    const updateData: {
      name?: string;
      email?: string;
      senha?: string;
    } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.email !== undefined) {
      updateData.email = data.email;
    }

    if (data.senha !== undefined) {
      updateData.senha = await bcrypt.hash(data.senha, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { idUser: userId },
      data: updateData,
    });

    logger.info(`Usuário atualizado: ${updatedUser.email}`, {
      userId,
      updatedFields: Object.keys(updateData),
    });

    return {
      idUser: updatedUser.idUser,
      email: updatedUser.email,
      name: updatedUser.name,
      statusUser: updatedUser.statusUser,
    };
  }

  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { idUser: userId, deletedAt: null },
    });

    if (!user) {
      throw HttpError.NotFound('Usuário não encontrado');
    }

    await prisma.user.update({
      where: { idUser: userId },
      data: { deletedAt: new Date() },
    });

    logger.info(`Usuário excluído: ${user.email}`, { userId });

    return { message: 'Usuário excluído com sucesso' };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { idUser: userId, deletedAt: null },
      include: {
        authCompanies: {
          include: {
            empresa: {
              select: {
                idEmpresa: true,
                razaoSocial: true,
                cnpj: true,
              },
            },
            role: {
              select: {
                cargo: true,
                permissao: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw HttpError.NotFound('Usuário não encontrado');
    }

    return {
      idUser: user.idUser,
      email: user.email,
      name: user.name,
      statusUser: user.statusUser,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      companies: user.authCompanies.map(auth => ({
        idEmpresa: auth.empresa.idEmpresa,
        razaoSocial: auth.empresa.razaoSocial,
        cnpj: auth.empresa.cnpj,
        cargo: auth.cargo,
        permissoes: auth.role?.permissao,
      })),
    };
  }

  async connectUserToCompany(userId: string, companyId: string, data: ConnectUserToCompanyData) {
    const user = await prisma.user.findUnique({
      where: { idUser: userId, deletedAt: null },
    });

    if (!user) {
      throw HttpError.NotFound('Usuário não encontrado');
    }

    const company = await prisma.company.findUnique({
      where: { idEmpresa: companyId },
    });

    if (!company) {
      throw HttpError.NotFound('Empresa não encontrada');
    }

    const role = await prisma.role.findUnique({
      where: { cargo: data.cargo },
    });

    if (!role) {
      throw HttpError.NotFound(`Role '${data.cargo}' não encontrada`);
    }

    const existingConnection = await prisma.authCompany.findUnique({
      where: {
        idUser_idEmpresa: {
          idUser: userId,
          idEmpresa: companyId,
        },
      },
    });

    if (existingConnection) {
      throw HttpError.BadRequest('Usuário já está conectado a esta empresa');
    }

    await prisma.authCompany.create({
      data: {
        idUser: userId,
        idEmpresa: companyId,
        cargo: data.cargo,
      },
    });

    logger.info(`Usuário conectado à empresa: ${user.email} -> ${company.razaoSocial}`, {
      userId,
      companyId,
      cargo: data.cargo,
    });

    return {
      idUser: userId,
      idEmpresa: companyId,
      cargo: data.cargo,
      message: 'Usuário conectado à empresa com sucesso',
    };
  }

  async getUsersByCompany(companyId: string, params: GetUsersParams) {
    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '10', 10);
    const skip = (page - 1) * limit;

    const [total, authCompanies] = await Promise.all([
      prisma.authCompany.count({
        where: {
          idEmpresa: companyId,
          user: { deletedAt: null },
        },
      }),
      prisma.authCompany.findMany({
        where: {
          idEmpresa: companyId,
          user: { deletedAt: null },
        },
        skip,
        take: limit,
        include: {
          user: true,
          role: {
            select: {
              cargo: true,
              permissao: true,
            },
          },
        },
        orderBy: {
          user: { createdAt: 'desc' },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: authCompanies.map(auth => ({
        idUser: auth.user.idUser,
        email: auth.user.email,
        name: auth.user.name,
        statusUser: auth.user.statusUser,
        cargo: auth.cargo,
        permissoes: auth.role?.permissao,
        createdAt: auth.user.createdAt,
        lastLoginAt: auth.user.lastLoginAt,
      })),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async createAdminUser(data: CreateAdminUserData) {
    const company = await prisma.company.findUnique({
      where: { idEmpresa: data.companyId },
    });

    if (!company) {
      throw HttpError.NotFound('Empresa não encontrada');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw HttpError.BadRequest('Email já está em uso');
    }

    const adminRole = await prisma.role.findUnique({
      where: { cargo: 'admin' },
    });

    if (!adminRole) {
      throw HttpError.NotFound('Role admin não encontrada');
    }

    const hashedPassword = await bcrypt.hash(data.senha, 10);

    const user = await prisma.user.create({
      data: {
        idUser: randomUUID(),
        email: data.email,
        senha: hashedPassword,
        name: data.name || data.email.split('@')[0],
        statusUser: true,
        createdAt: new Date(),
      },
    });

    await prisma.authCompany.create({
      data: {
        idUser: user.idUser,
        idEmpresa: data.companyId,
        cargo: 'admin',
      },
    });

    logger.info(`Admin criado: ${user.email} para empresa ${company.razaoSocial}`, {
      userId: user.idUser,
      companyId: data.companyId,
    });

    return {
      idUser: user.idUser,
      email: user.email,
      name: user.name,
      statusUser: user.statusUser,
      cargo: 'admin',
      company: {
        idEmpresa: company.idEmpresa,
        razaoSocial: company.razaoSocial,
      },
    };
  }
}
