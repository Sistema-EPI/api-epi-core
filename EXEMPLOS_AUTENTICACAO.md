# Exemplos Práticos - Sistema de Autenticação

## 🔧 Exemplos de Implementação

### 1. Novo Controller com Autenticação

```typescript
// src/Controllers/RelatorioController.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import HttpError from '../Helpers/HttpError';

export async function gerarRelatorio(req: Request, res: Response, next: NextFunction) {
  try {
    // Dados do usuário autenticado disponíveis automaticamente
    const { userId, companyId, role, permissions } = req.user;
    
    // Verificar permissão específica
    if (!permissions.read) {
      throw HttpError.Forbidden('Sem permissão para visualizar relatórios');
    }
    
    // Filtrar dados pela empresa do usuário
    const dados = await prisma.process.findMany({
      where: {
        epi: {
          idEmpresa: companyId  // Sempre filtrar pela empresa
        }
      },
      include: {
        colaborador: true,
        epi: true
      }
    });
    
    // Log da operação
    console.log(`Usuário ${userId} gerou relatório para empresa ${companyId}`);
    
    res.json({
      success: true,
      data: dados,
      empresa: req.user.company.nomeFantasia,
      geradoPor: req.user.name
    });
    
  } catch (error) {
    next(error);
  }
}

export async function relatorioAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { role } = req.user;
    
    // Apenas admins podem acessar
    if (role !== 'admin') {
      throw HttpError.Forbidden('Apenas administradores podem acessar este relatório');
    }
    
    // Lógica específica para admin...
    
  } catch (error) {
    next(error);
  }
}
```

### 2. Router com Diferentes Níveis de Proteção

```typescript
// src/Routers/RelatorioRouter.ts
import { Router } from 'express';
import * as RelatorioController from '../Controllers/RelatorioController';
import RequestHandler from '../Helpers/RequestHandler';
import { authMiddleware } from '../Middlewares/auth';
import { rateLimitMiddleware } from '../Middlewares/rateLimit';

const relatorio = Router();

// Middleware de permissões customizado
const requireRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ 
        error: 'Insufficient role', 
        required: requiredRole,
        current: req.user.role 
      });
    }
    next();
  };
};

const requirePermission = (permission: 'create' | 'read' | 'update' | 'delete') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user.permissions[permission]) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission 
      });
    }
    next();
  };
};

// Rotas com diferentes proteções
relatorio.get(
  '/geral',
  authMiddleware,                    // ✅ Apenas autenticado
  requirePermission('read'),         // ✅ Precisa de permissão de leitura
  RequestHandler(RelatorioController.gerarRelatorio)
);

relatorio.get(
  '/admin',
  authMiddleware,                    // ✅ Apenas autenticado  
  requireRole('admin'),              // ✅ Apenas admin
  RequestHandler(RelatorioController.relatorioAdmin)
);

relatorio.post(
  '/exportar',
  rateLimitMiddleware,               // ✅ Rate limiting (5/min)
  authMiddleware,                    // ✅ Apenas autenticado
  requirePermission('read'),         // ✅ Precisa de permissão de leitura
  RequestHandler(RelatorioController.exportarRelatorio)
);

export default relatorio;
```

### 3. Frontend - Configuração Axios

```typescript
// utils/api.ts
import axios from 'axios';

// Configuração base
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/v1',
  timeout: 10000,
});

// Interceptor de requisição - adiciona headers automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    const apiKey = localStorage.getItem('api_key');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (apiKey) {
      config.headers['x-api-token'] = apiKey;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta - trata erros de autenticação
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Tentar refresh do token
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          const response = await api.post('/auth/refresh', {
            refreshToken: refreshToken
          });
          
          const { token } = response.data;
          localStorage.setItem('jwt_token', token);
          
          // Repetir requisição original
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh falhou - logout
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    
    // Rate limit
    if (error.response?.status === 429) {
      alert('Muitas tentativas. Aguarde alguns segundos.');
    }
    
    // Forbidden
    if (error.response?.status === 403) {
      alert('Você não tem permissão para esta ação.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### 4. Hook React para Autenticação

```typescript
// hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from 'react';
import api from '../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: {
    create: boolean;
    read: boolean;
    update: boolean;  
    delete: boolean;
  };
  department: string;
  position: string;
}

interface Company {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
}

interface AuthContextType {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, apiKey: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se já está logado ao inicializar
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const userData = localStorage.getItem('user_data');
    const companyData = localStorage.getItem('company_data');
    
    if (token && userData && companyData) {
      setUser(JSON.parse(userData));
      setCompany(JSON.parse(companyData));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string, apiKey: string) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      }, {
        headers: {
          'x-api-token': apiKey
        }
      });

      const { token, user, company } = response.data;
      
      // Salvar no localStorage
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('api_key', apiKey);
      localStorage.setItem('user_data', JSON.stringify(user));
      localStorage.setItem('company_data', JSON.stringify(company));
      
      // Atualizar estado
      setUser(user);
      setCompany(company);
      setIsAuthenticated(true);
      
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setCompany(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.[permission] || false;
  };

  const isRole = (role: string): boolean => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider value={{
      user,
      company,
      isAuthenticated,
      login,
      logout,
      hasPermission,
      isRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
```

### 5. Componente de Login

```typescript
// components/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password, apiKey);
      // Redirect será feito automaticamente
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label>Senha:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label>API Key:</label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Ex: hamada_api_key_2024..."
          required
        />
      </div>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
};

export default Login;
```

### 6. Componente Protegido

```typescript
// components/ProtectedRoute.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission,
  requiredRole 
}) => {
  const { isAuthenticated, hasPermission, isRole } = useAuth();

  if (!isAuthenticated) {
    return <div>Você precisa estar logado para acessar esta página.</div>;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <div>Você não tem permissão para acessar esta página.</div>;
  }

  if (requiredRole && !isRole(requiredRole)) {
    return <div>Apenas {requiredRole}s podem acessar esta página.</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

// Uso:
// <ProtectedRoute requiredPermission="create">
//   <CriarEpiComponent />
// </ProtectedRoute>
//
// <ProtectedRoute requiredRole="admin">
//   <AdminPanelComponent />
// </ProtectedRoute>
```

### 7. Service para Requisições

```typescript
// services/epiService.ts
import api from '../utils/api';

export const epiService = {
  // Listar EPIs (automaticamente filtrado pela empresa)
  async listar() {
    const response = await api.get('/epi/lista');
    return response.data;
  },

  // Criar EPI
  async criar(dados: any) {
    const response = await api.post('/epi/criar', dados);
    return response.data;
  },

  // Atualizar EPI
  async atualizar(id: string, dados: any) {
    const response = await api.put(`/epi/atualizar/${id}`, dados);
    return response.data;
  },

  // Deletar EPI
  async deletar(id: string) {
    const response = await api.delete(`/epi/deletar/${id}`);
    return response.data;
  }
};
```

## 🎯 Resumo de Uso

1. **Backend**: Aplicar `authMiddleware` nas rotas que precisam ser protegidas
2. **Frontend**: Usar `api` configurado que adiciona headers automaticamente
3. **Componentes**: Usar `ProtectedRoute` para proteger páginas
4. **Estado**: Usar `useAuth` hook para gerenciar autenticação
5. **Permissões**: Verificar com `hasPermission()` e `isRole()`

Todos os dados são automaticamente filtrados pela empresa do usuário logado! 🔒
