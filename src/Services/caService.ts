import { ENV } from '../server';
import logger from '../Helpers/Logger';
import { CAResponse } from '../Schemas/CASchema';

export class CAService {
  private apiUrl: string;
  private apiKey: string;
  private apiToken: string;

  constructor() {
    if (!ENV.API_CONSULTA_URL || !ENV.API_KEY || !ENV.API_TOKEN) {
      throw new Error('Variáveis de ambiente da API externa não configuradas: API_CONSULTA_URL, API_KEY, API_TOKEN');
    }
    
    this.apiUrl = ENV.API_CONSULTA_URL;
    this.apiKey = ENV.API_KEY;
    this.apiToken = ENV.API_TOKEN;
  }

  async consultarCA(ca: string): Promise<CAResponse> {
    try {
      const url = `${this.apiUrl}/ca/${ca}`;
      
      logger.info(`Consultando CA: ${ca} na URL: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'x-api-token': this.apiToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na API externa: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      logger.info(`Resposta recebida da API externa para CA: ${ca}`);
      
      return data;
    } catch (error) {
      logger.error(`Erro ao consultar CA ${ca}:`, error);
      throw new Error(`Falha na consulta do CA: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}

export default new CAService();