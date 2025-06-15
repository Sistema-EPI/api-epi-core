import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../Helpers/Jwt';
import EnvSchema from '../Schemas/EnvSchema';

const prisma = new PrismaClient();
const ENV = EnvSchema.parse(process.env);

export class AuthService {
  async authenticate(email: string, password: string, apiKey: string) {
    // 1. Validar API Key e obter company
    const company = await this.validateApiKey(apiKey);
    if (!company) {
      throw new Error('API Key inválida');
    }

    // 2. Buscar usuário
    const user = await prisma.user.findUnique({
      where: {
        email,
        deletedAt: null
      }
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // 3. Validar senha
    const isPasswordValid = await bcrypt.compare(password, user.senha);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // 4. Verificar se usuário está ativo
    if (!user.statusUser) {
      throw new Error('Usuário inativo');
    }

    // 5. Verificar se usuário pertence à empresa da API Key
    const authCompany = await prisma.authCompany.findUnique({
      where: {
        idUser_idEmpresa: {
          idUser: user.idUser,
          idEmpresa: company.idEmpresa
        }
      },
      include: {
        role: true
      }
    });

    if (!authCompany) {
      throw new Error('Usuário não autorizado para esta empresa');
    }

    // 6. Gerar JWT
    const token = this.generateJWT(user, company, authCompany.role);

    // 7. Atualizar último login
    await this.updateLastLogin(user.idUser);

    // 8. Retornar dados
    return {
      token,
      user: {
        id: user.idUser,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        role: authCompany.cargo,
        permissions: authCompany.role.permissao,
        avatar: user.avatar || null,
        department: user.department || null,
        position: user.position || null
      },
      apiToken: apiKey,
      company: {
        id: company.idEmpresa,
        razao_social: company.razaoSocial,
        cnpj: company.cnpj,
        status_empresa: company.statusEmpresa
      }
    };
  }

  async refreshToken(token: string, apiKey: string) {
    // 1. Validar API Key
    const company = await this.validateApiKey(apiKey);
    if (!company) {
      throw new Error('API Key inválida');
    }

    // 2. Verificar JWT
    const decoded = this.verifyJWT(token);
    if (decoded.companyId !== company.idEmpresa) {
      throw new Error('Token inválido para esta empresa');
    }

    // 3. Buscar usuário atualizado
    const user = await prisma.user.findUnique({
      where: {
        idUser: decoded.userId,
        deletedAt: null
      }
    });

    if (!user || !user.statusUser) {
      throw new Error('Usuário inválido ou inativo');
    }

    // 4. Buscar role atualizada
    const authCompany = await prisma.authCompany.findUnique({
      where: {
        idUser_idEmpresa: {
          idUser: user.idUser,
          idEmpresa: company.idEmpresa
        }
      },
      include: {
        role: true
      }
    });

    if (!authCompany) {
      throw new Error('Usuário não autorizado para esta empresa');
    }

    // 5. Gerar novo token
    const newToken = this.generateJWT(user, company, authCompany.role);

    return {
      token: newToken,
      user: {
        id: user.idUser,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        role: authCompany.cargo,
        permissions: authCompany.role.permissao,
        avatar: user.avatar || null,
        department: user.department || null,
        position: user.position || null
      }
    };
  }

  private async validateApiKey(apiKey: string) {
    const company = await prisma.company.findFirst({
      where: {
        apiKey: apiKey,
        statusEmpresa: true
      }
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
        permissions: role.permissao
      },
      ENV.JWT_EXPIRATION
    );
  }

  private verifyJWT(token: string) {
    try {
      const jwt = require('jsonwebtoken');
      return jwt.verify(token, ENV.JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  private async updateLastLogin(userId: string) {
    await prisma.user.update({
      where: { idUser: userId },
      data: { lastLoginAt: new Date() }
    });
  }
}
