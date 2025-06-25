import { Request, Response, NextFunction } from 'express';
import {
  ChangePasswordSchema,
  ConnectUserToCompanySchema,
  CreateUserSchema,
  DeleteUserSchema,
  GetUserByIdSchema,
  GetUsersSchema,
  GetUsersByCompanySchema,
  UpdateUserStatusSchema,
  CreateAdminUserSchema,
} from '../Schemas/UserSchema';
import HttpResponse from '../Helpers/HttpResponse';
import { UserService } from '../Services/userService';

const userService = new UserService();

export async function getAllUsers(req: Request, res: Response, _next: NextFunction) {
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
    _next(err);
  }
}

export async function createUser(req: Request, res: Response, _next: NextFunction) {
  try {
    const { body } = CreateUserSchema.parse(req);
    const userData = await userService.createUser(body);

    const response = HttpResponse.Created({
      message: 'Usuário criado com sucesso',
      data: userData,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in createUser:', err);
    _next(err);
  }
}

export async function updateUserPassword(req: Request, res: Response, _next: NextFunction) {
  try {
    const { params, body } = ChangePasswordSchema.parse(req);
    const result = await userService.updateUserPassword(params.userId, body);

    const response = HttpResponse.Ok({
      message: result.message,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in updateUserPassword:', err);
    _next(err);
  }
}

export async function updateUserStatus(req: Request, res: Response, _next: NextFunction) {
  try {
    const { params, body } = UpdateUserStatusSchema.parse(req);
    const result = await userService.updateUserStatus(params.userId, body);

    const response = HttpResponse.Ok({
      message: 'Status do usuário atualizado com sucesso',
      data: result,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in updateUserStatus:', err);
    _next(err);
  }
}

export async function deleteUser(req: Request, res: Response, _next: NextFunction) {
  try {
    const { params } = DeleteUserSchema.parse(req);
    const result = await userService.deleteUser(params.userId);

    const response = HttpResponse.Ok({
      message: result.message,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in deleteUser:', err);
    _next(err);
  }
}

export async function getUserById(req: Request, res: Response, _next: NextFunction) {
  try {
    const { params } = GetUserByIdSchema.parse(req);
    const userData = await userService.getUserById(params.userId);

    const response = HttpResponse.Ok({
      message: 'Usuário encontrado com sucesso',
      data: userData,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getUserById:', err);
    _next(err);
  }
}

export async function connectUserToCompany(req: Request, res: Response, _next: NextFunction) {
  try {
    const { params, body } = ConnectUserToCompanySchema.parse(req);
    const result = await userService.connectUserToCompany(params.userId, params.companyId, body);

    const response = HttpResponse.Ok({
      message: result.message,
      data: {
        idUser: result.idUser,
        idEmpresa: result.idEmpresa,
        cargo: result.cargo,
      },
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in connectUserToCompany:', err);
    _next(err);
  }
}

export async function getUsersByCompany(req: Request, res: Response, _next: NextFunction) {
  try {
    const { params, query } = GetUsersByCompanySchema.parse(req);
    const result = await userService.getUsersByCompany(params.companyId, query);

    const response = HttpResponse.Ok({
      message: 'Usuários da empresa recuperados com sucesso',
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
    console.error('Error in getUsersByCompany:', err);
    _next(err);
  }
}

export async function createAdminUser(req: Request, res: Response, _next: NextFunction) {
  try {
    const { body } = CreateAdminUserSchema.parse(req);
    const userData = await userService.createAdminUser(body);

    const response = HttpResponse.Created({
      message: 'Usuário admin criado com sucesso',
      data: userData,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in createAdminUser:', err);
    _next(err);
  }
}
