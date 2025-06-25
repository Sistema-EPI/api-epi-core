import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateToken } from '../Helpers/Jwt';
import { env } from '../Schemas/EnvSchema';

interface JWTPayload {
  userId: string;
  companyId: string;
  email: string;
  role: string;
  permissions: any;
}

const prisma = new PrismaClient();

export class AuthService {
  async authenticate(email: string, password: string, apiKey: string) {
    const company = await this.validateApiKey(apiKey);
    if (!company) {
      throw new Error('API Key inválida');
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.senha);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    if (!user.statusUser) {
      throw new Error('Usuário inativo');
    }

    const authCompany = await prisma.authCompany.findUnique({
      where: {
        idUser_idEmpresa: {
          idUser: user.idUser,
          idEmpresa: company.idEmpresa,
        },
      },
      include: {
        role: true,
      },
    });

    if (!authCompany) {
      throw new Error('Usuário não autorizado para esta empresa');
    }

    const token = this.generateJWT(user, company, authCompany.role);

    await this.updateLastLogin(user.idUser);

    return {
      token,
      user: {
        id: user.idUser,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        role: authCompany.cargo,
        permissions: authCompany.role.permissao,
      },
      apiToken: apiKey,
      company: {
        id: company.idEmpresa,
        razao_social: company.razaoSocial,
        cnpj: company.cnpj,
        status_empresa: company.statusEmpresa,
      },
    };
  }

  async refreshToken(token: string, apiKey: string) {
    const company = await this.validateApiKey(apiKey);
    if (!company) {
      throw new Error('API Key inválida');
    }

    const decoded = this.verifyJWT(token) as JWTPayload;
    if (decoded.companyId !== company.idEmpresa) {
      throw new Error('Token inválido para esta empresa');
    }

    const user = await prisma.user.findUnique({
      where: {
        idUser: decoded.userId,
        deletedAt: null,
      },
    });

    if (!user || !user.statusUser) {
      throw new Error('Usuário inválido ou inativo');
    }

    const authCompany = await prisma.authCompany.findUnique({
      where: {
        idUser_idEmpresa: {
          idUser: user.idUser,
          idEmpresa: company.idEmpresa,
        },
      },
      include: {
        role: true,
      },
    });

    if (!authCompany) {
      throw new Error('Usuário não autorizado para esta empresa');
    }

    const newToken = this.generateJWT(user, company, authCompany.role);

    return {
      token: newToken,
      user: {
        id: user.idUser,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        role: authCompany.cargo,
        permissions: authCompany.role.permissao,
      },
    };
  }

  private async validateApiKey(apiKey: string) {
    const company = await prisma.company.findFirst({
      where: {
        apiKey: apiKey,
        statusEmpresa: true,
      },
    });

    return company;
  }

  private generateJWT(user: any, company: any, role: any) {
    return generateToken(
      {
        userId: user.idUser,
        companyId: company.idEmpresa,
        email: user.email,
        role: role.cargo,
        permissions: role.permissao,
      },
      env.JWT_EXPIRATION,
    );
  }

  private verifyJWT(token: string) {
    try {
      return jwt.verify(token, env.JWT_SECRET);
    } catch {
      throw new Error('Token inválido ou expirado');
    }
  }

  private async updateLastLogin(userId: string) {
    await prisma.user.update({
      where: { idUser: userId },
      data: { lastLoginAt: new Date() },
    });
  }
}
