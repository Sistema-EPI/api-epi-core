/**
 * Helper para gerenciar timezone brasileiro (UTC-3)
 */
export class TimezoneHelper {
  static getBrazilTimestamp(): Date {
    const now = new Date();
    // Ajusta para UTC-3 (horário de Brasília)
    const brazilTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    return brazilTime;
  }

  /**
   * Gera string de data/hora formatada para o Brasil
   */
  static getBrazilTimestampString(): string {
    return this.getBrazilTimestamp().toISOString().replace('Z', '-03:00');
  }

  /**
   * Formata data para padrão brasileiro (DD/MM/AAAA HH:mm:ss)
   */
  static formatToBrazilianDateTime(date?: Date): string {
    const targetDate = date || this.getBrazilTimestamp();
    return targetDate.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  /**
   * Formata apenas data para padrão brasileiro (DD/MM/AAAA)
   */
  static formatToBrazilianDate(date?: Date): string {
    const targetDate = date || this.getBrazilTimestamp();
    return targetDate.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  /**
   * Converte UTC para horário de Brasília
   */
  static convertUtcToBrazil(utcDate: Date): Date {
    return new Date(utcDate.getTime() - 3 * 60 * 60 * 1000);
  }

  /**
   * Converte horário de Brasília para UTC
   */
  static convertBrazilToUtc(brazilDate: Date): Date {
    return new Date(brazilDate.getTime() + 3 * 60 * 60 * 1000);
  }
}
