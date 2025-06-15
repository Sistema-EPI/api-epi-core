import { Request, Response, NextFunction } from 'express';
import { ChangePasswordSchema, ConnectUserToCompanyHandlerSchema, CreateUserSchema, DeleteUserSchema, GetUserByIdSchema, GetUsersSchema, UpdateUserStatusSchema } from '../Schemas/UserSchema';
import HttpResponse from '../Helpers/HttpResponse';
import { UserService } from '../Services/userService';

const userService = new UserService();

export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { query } = GetUsersSchema.parse(req);

    const result = await userService.getAllUsers(query);

    const response = HttpResponse.Ok({
      message: 'Usuários recuperados com sucesso',
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      data: result.data,
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

    const userData = await userService.createUser(id, { email, senha, cargo, status_user });

    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      data: userData
    });

  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const { params } = GetUserByIdSchema.parse(req);

    const userData = await userService.getUserById(params.id);

    return res.status(200).json(userData);
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

    const result = await userService.connectUserToCompanyHandler(userId, companyId, { cargo });

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

    const result = await userService.updatePassword(userId, senhaAtual, novaSenha);

    return res.status(200).json(result);

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

    const result = await userService.updateUserStatus(userId, body);

    return res.status(200).json({
      message: 'Usuário atualizado com sucesso',
      data: result
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

    const result = await userService.deleteUser(userId);

    const response = HttpResponse.Ok({
      message: 'Usuário deletado com sucesso',
      user: result,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Erro ao deletar usuário:', err);
    next(err);
  }
}

