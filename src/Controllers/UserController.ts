import { Request, Response, NextFunction } from 'express';
import { ChangePasswordSchema, ConnectUserToCompanyHandlerSchema, CreateUserSchema, DeleteUserSchema, GetUserByIdSchema, GetUsersSchema, UpdateUserStatusSchema } from '../Schemas/UserSchema';
import HttpError from '../Helpers/HttpError';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { prisma } from '../server';
import HttpResponse from '../Helpers/HttpResponse';

export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { query } = GetUsersSchema.parse(req);

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
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

    const response = HttpResponse.Ok({
      message: 'Usuários recuperados com sucesso',
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getAllUsers:', err);
    next(err);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { email, senha, cargo, status_user } = req.body;

    CreateUserSchema.parse({
      params: { id },
      body: { email, senha, cargo, status_user }
    });

    const idEmpresa = id;

    const empresa = await prisma.company.findUnique({
      where: { idEmpresa }
    });

    if (!empresa) throw HttpError.NotFound('Empresa não encontrada');

    const isEmailAlreadyInUse = await prisma.user.findUnique({
      where: { email }
    });

    if (isEmailAlreadyInUse) throw HttpError.BadRequest('Email inválido');

    console.log(`Criando usuário para a empresa com o ID: ${empresa.idEmpresa}`);

    const userId = await insertUserInTable(email, senha, status_user);

    console.log('Usuário criado, conectando à empresa...');

    await conectUserToCompany(userId, idEmpresa, cargo);

    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      data: {
        idUsuario: userId,
        email,
        statusUser: status_user,
        cargo,
      }
    });

  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}

export async function insertUserInTable(email: string, senha: string, statusUser: boolean) {
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
  console.log(JSON.stringify(newUser, null, 2));

  return newUser.idUser;
}

//auxiliary function 
export async function conectUserToCompany(userId: string, companyId: string, cargo: string) {
  const company = await prisma.company.findUnique({
    where: { idEmpresa: companyId }
  });

  if (!company) throw HttpError.NotFound(`Empresa com ID '${companyId}' não encontrada`);

  const role = await prisma.role.findUnique({
    where: { cargo }
  });

  if (!role) throw HttpError.BadRequest(`Cargo '${cargo}' não existe`);

  const user = await prisma.user.findUnique({
    where: { idUser: userId }
  });

  if (!user) throw HttpError.NotFound(`Usuário com ID '${userId}' não encontrado`);

  const authCompany = await prisma.authCompany.create({
    data: {
      idUser: userId,
      idEmpresa: companyId,
      cargo: cargo
    }
  });

  console.log(`Usuário com ID: ${userId} conectado à empresa com ID: ${companyId} com cargo ${cargo}`);
  console.log(JSON.stringify(authCompany, null, 2));

  return authCompany;
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const { params } = GetUserByIdSchema.parse(req);

    const user = await prisma.user.findUnique({
      where: {
        idUser: params.id,
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

    return res.status(200).json({
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
    });
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    next(err);
  }
}

export async function connectUserToCompanyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { params, body } = ConnectUserToCompanyHandlerSchema.parse(req);
    const { userId, companyId } = params;
    const { cargo } = body;

    const existing = await prisma.authCompany.findUnique({
      where: {
        idUser_idEmpresa: {
          idUser: userId,
          idEmpresa: companyId
        }
      }
    });

    if (existing) throw HttpError.BadRequest(`Usuário já está vinculado a esta empresa`);

    const result = await conectUserToCompany(userId, companyId, cargo);

    return res.status(201).json({
      message: 'Usuário vinculado com sucesso',
      data: result
    });

  } catch (err) {
    console.error('Erro ao conectar usuário à empresa:', err);
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}

export async function updatePassword(req: Request, res: Response) {
  try {
    const { params, body } = ChangePasswordSchema.parse(req);
    const { userId } = params;
    const { senhaAtual, novaSenha } = body;

    const user = await prisma.user.findUnique({ where: { idUser: userId } });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const senhaCorreta = await bcrypt.compare(senhaAtual, user.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    console.log('Nova senha hasheada:', novaSenhaHash);

    await prisma.user.update({
      where: { idUser: userId },
      data: { senha: novaSenhaHash }
    });

    return res.status(200).json({ message: 'Senha atualizada com sucesso' });

  } catch (err) {
    console.error('Erro ao atualizar senha:', err);
    return res.status(400).json({ error: 'Requisição inválida' });
  }
}

export async function updateUserStatus(req: Request, res: Response) {
  try {
    const { params, body } = UpdateUserStatusSchema.parse(req);
    const { userId } = params;

    console.log('Atualizando status do usuário:', userId);
    console.log('Dados recebidos:', body);

    const user = await prisma.user.findUnique({ where: { idUser: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const updated = await prisma.user.update({
      where: { idUser: userId },
      data: {
        email: body.email,
        statusUser: body.statusUser,
      }
    });

    return res.status(200).json({
      message: 'Usuário atualizado com sucesso',
      data: {
        idUser: updated.idUser,
        email: updated.email,
        statusUser: updated.statusUser,
      }
    });

  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    return res.status(400).json({ error: 'Requisição inválida' });
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { params } = DeleteUserSchema.parse(req);
    const userId = params.userId;

    const existingUser = await prisma.user.findUnique({
      where: { idUser: userId },
      include: {
        authCompanies: true,
        logs: true
      }
    });

    if (!existingUser) throw HttpError.NotFound('Usuário não encontrado');

    if (existingUser.deletedAt) throw HttpError.BadRequest('Usuário já foi deletado');

    // Soft delete - mantém relacionamentos para auditoria
    const updatedUser = await prisma.user.update({
      where: { idUser: userId },
      data: {
        deletedAt: new Date(),
        statusUser: false
      },
    });

    console.log('Usuário soft deletado com sucesso:', updatedUser.idUser);

    const response = HttpResponse.Ok({
      message: 'Usuário deletado com sucesso',
      user: {
        idUser: updatedUser.idUser,
        email: updatedUser.email,
        deletedAt: updatedUser.deletedAt
      },
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Erro ao deletar usuário:', err);
    next(err);
  }
}

