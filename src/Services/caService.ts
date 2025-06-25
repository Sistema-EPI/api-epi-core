import { env } from '../Schemas/EnvSchema';
import logger from '../Helpers/Logger';
import { CAResponse } from '../Schemas/CASchema';

export class CAService {
  private apiUrl?: string;
  private apiKey?: string;
  private apiToken?: string;
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!(env.API_CONSULTA_URL && env.API_KEY && env.API_TOKEN);

    if (!this.isConfigured) {
      logger.warn(
        'Serviço de consulta CA não configurado - variáveis API_CONSULTA_URL, API_KEY ou API_TOKEN ausentes',
      );
      return;
    }

    this.apiUrl = env.API_CONSULTA_URL!;
    this.apiKey = env.API_KEY!;
    this.apiToken = env.API_TOKEN!;

    logger.info('Serviço de consulta CA configurado com sucesso');
  }

  async consultarCA(ca: string): Promise<CAResponse> {
    if (!this.isConfigured || !this.apiUrl || !this.apiKey || !this.apiToken) {
      throw new Error(
        'Serviço de consulta CA não está configurado. Verifique as variáveis de ambiente: API_CONSULTA_URL, API_KEY, API_TOKEN',
      );
    }

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

      const data = (await response.json()) as CAResponse;

      logger.info(`Resposta recebida da API externa para CA: ${ca}`);

      return data;
    } catch (error) {
      logger.error(`Erro ao consultar CA ${ca}:`, error);
      throw new Error(
        `Falha na consulta do CA: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }
}

export default new CAService();
