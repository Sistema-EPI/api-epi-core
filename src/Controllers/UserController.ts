import { Request, Response, NextFunction } from 'express';
import { CreateUserSchema } from '../Schemas/UserSchema';
import HttpError from '../Helpers/HttpError';
import bcrypt from 'bcrypt';
import HttpResponse from '../Helpers/HttpResponse';
import { randomUUID } from 'crypto';
import { prisma } from '../server';


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