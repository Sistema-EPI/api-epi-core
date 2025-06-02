import { Request, Response, NextFunction } from 'express';
import { LoginSchema, SelectCompanySchema } from "../Schemas/LoginSchema";
import { prisma } from '../server';
import HttpError from '../Helpers/HttpError';
import bcrypt from 'bcrypt';
import { generateToken } from '../Helpers/Jwt';


export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const body = LoginSchema.parse(req.body);
        const { email, senha } = body;

        const user = await prisma.user.findUnique({
            where: {
                email,
                deletedAt: null
            }
        });

        if (!user) throw HttpError.Unauthorized('Usuário não encontrado');

        if (!user.statusUser) throw HttpError.Unauthorized('Usuário inativo');

        const isPasswordValid = await bcrypt.compare(senha, user.senha);
        if (!isPasswordValid) throw HttpError.Unauthorized('Credenciais inválidas');

        const empresas = await prisma.authCompany.findMany({
            where: { idUser: user.idUser },
            include: {
                empresa: {
                    select: {
                        idEmpresa: true,
                        nomeFantasia: true,
                        statusEmpresa: true,
                    }
                },
                role: {
                    select: {
                        cargo: true,
                        permissao: true
                    }
                }
            }
        });

        if (empresas.length === 0) throw HttpError.Unauthorized('Usuário não possui empresas vinculadas');

        const empresasAtivas = empresas.filter(auth => auth.empresa.statusEmpresa === 'ATIVO');

        if (empresasAtivas.length === 0) throw HttpError.Unauthorized('Nenhuma empresa ativa encontrada');

        return res.status(200).json({
            message: 'Login realizado com sucesso',
            user: {
                idUsuario: user.idUser,
                email: user.email,
                statusUser: user.statusUser,
                empresas: empresasAtivas.map((auth) => ({
                    idEmpresa: auth.idEmpresa,
                    nomeFantasia: auth.empresa.nomeFantasia,
                    cargo: auth.cargo,
                    permissoes: auth.role.permissao
                })),
            },
        });
    } catch (error) {
        console.error('Erro no login:', error);
        next(error);
    }
}

export async function selectCompany(req: Request, res: Response, next: NextFunction) {
    try {
        const { params } = SelectCompanySchema.parse(req);

        const user = await prisma.user.findUnique({
            where: {
                idUser: params.id_usuario,
                deletedAt: null
            }
        });

        if (!user) throw HttpError.Unauthorized('Usuário não encontrado');
        if (!user.statusUser) throw HttpError.Unauthorized('Usuário inativo');

        const company = await prisma.company.findUnique({
            where: { idEmpresa: params.id_empresa }
        });

        if (!company) throw HttpError.NotFound('Empresa não encontrada');
        if (company.statusEmpresa !== 'ATIVO') throw HttpError.Unauthorized('Empresa inativa');

        const auth = await prisma.authCompany.findUnique({
            where: {
                idUser_idEmpresa: {
                    idUser: params.id_usuario,
                    idEmpresa: params.id_empresa
                }
            },
            include: {
                empresa: {
                    select: {
                        idEmpresa: true,
                        nomeFantasia: true,
                        razaoSocial: true,
                        statusEmpresa: true
                    }
                },
                role: {
                    select: {
                        cargo: true,
                        permissao: true
                    }
                },
                user: {
                    select: {
                        idUser: true,
                        email: true,
                        statusUser: true
                    }
                }
            }
        });

        if (!auth) throw HttpError.Unauthorized('Usuário não autorizado a acessar esta empresa');

        const token = generateToken({
            sub: params.id_usuario,
            empresaId: params.id_empresa,
            cargo: auth.role.cargo,
            permissoes: auth.role.permissao
        }, '1h');

        console.log('Token gerado:', token);

        return res.status(200).json({
            message: 'Empresa selecionada com sucesso',
            auth: {
                idEmpresa: auth.idEmpresa,
                nomeFantasia: auth.empresa.nomeFantasia,
                idUsuario: auth.idUser,
                cargo: auth.cargo,
                permissoes: auth.role.permissao,
                token,
            }
        });
    } catch (error) {
        console.error(error);
        if (error instanceof HttpError) {
            return next(error);
        }
        return next(HttpError.InternalServerError('Erro ao selecionar empresa'));
    }
}

