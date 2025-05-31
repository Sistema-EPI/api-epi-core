import { Request, Response, NextFunction } from 'express';
import { ConnectUserToCompanyHandlerSchema, CreateUserSchema, GetUserByIdSchema, GetUsersSchema } from '../Schemas/UserSchema';
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
      prisma.user.count(),
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const response = HttpResponse.Ok({
      message: 'Usuários recuperadas com sucesso',
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

    console.log(req.params);

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

    console.log(`Criando usuário para a empresa ${empresa.idEmpresa}`);

    const userId = await insertUserInTable(email, senha, status_user);

    console.log('Usuário criado, conectando à empresa...');
    await conectUserToCompany(userId, idEmpresa, cargo);
    console.log('Finalizado com sucesso!');

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

  console.log(`Usuário criado com sucesso: ${newUser.idUser}`);
  console.log(JSON.stringify(newUser, null, 2));

  return newUser.idUser;
}

//auxiliary function 
export async function conectUserToCompany(userId: string, companyId: string, cargo: string) {

  const authCompany = await prisma.authCompany.create({
    data: {
      idUser: userId,
      idEmpresa: companyId,
      cargo,
    }
  });

  console.log(`Usuário ${userId} conectado à empresa ${companyId} com cargo ${cargo}`);
  console.log(JSON.stringify(authCompany, null, 2));

  return authCompany;
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const { params } = GetUserByIdSchema.parse(req);

    const user = await prisma.user.findUnique({
      where: { idUser: params.id },
      include: {
        authCompanies: {
          select: {
            idEmpresa: true,
            cargo: true,
            empresa: {
              select: {
                razaoSocial: true,
                cnpj: true
              }
            }
          }
        }
      }
    });

    console.log(user);

    if (!user) {
      throw HttpError.NotFound('Usuário não encontrado');
    }

    return res.status(200).json({
      idUser: user.idUser,
      email: user.email,
      statusUser: user.statusUser,
      empresas: user.authCompanies.map((auth: { idEmpresa: any; cargo: any; empresa: { razaoSocial: any; cnpj: any; }; }) => ({
        idEmpresa: auth.idEmpresa,
        cargo: auth.cargo,
        razaoSocial: auth.empresa?.razaoSocial,
        cnpj: auth.empresa?.cnpj
      }))

    });
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    return res.status(400).json({ error: err });
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

    if (existing) {
      return res.status(400).json({ error: 'Usuário já está vinculado a esta empresa' });
    }

    const result = await conectUserToCompany(userId, companyId, cargo);

    return res.status(201).json({
      message: 'Usuário vinculado com sucesso',
      data: result
    });

  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
