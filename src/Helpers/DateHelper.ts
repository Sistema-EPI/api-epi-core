/**
 * Helper para manipulação e formatação de datas
 * Centraliza as funções utilitárias para parsing e formatação de datas
 */

/**
 * Converte uma string de data para objeto Date
 * Suporta formato brasileiro (DD/MM/AAAA) e formato ISO
 * @param dateString - String da data a ser convertida
 * @returns Date object ou undefined se não fornecida
 * @throws Error se a data for inválida
 */
export function parseDate(dateString?: string): Date | undefined {
    if (!dateString) return undefined;
    
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
        throw new Error(`Data inválida: ${dateString}`);
    }
    
    return date;
}

/**
 * Formata uma data para o formato brasileiro (DD/MM/AAAA)
 * @param date - Date object a ser formatado
 * @returns String no formato DD/MM/AAAA ou null se data não fornecida
 */
export function formatDateToBrazilian(date?: Date | null): string | null {
    if (!date) return null;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    
    return `${day}/${month}/${year}`;
}

/**
 * Formata uma data para o formato brasileiro com horário (DD/MM/AAAA HH:mm)
 * @param date - Date object a ser formatado
 * @returns String no formato DD/MM/AAAA HH:mm ou null se data não fornecida
 */
export function formatDateTimeToBrazilian(date?: Date | null): string | null {
    if (!date) return null;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Verifica se uma string está no formato de data brasileiro (DD/MM/AAAA)
 * @param dateString - String a ser verificada
 * @returns true se está no formato brasileiro, false caso contrário
 */
export function isBrazilianDateFormat(dateString: string): boolean {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(dateString);
}

/**
 * Converte uma data para o início do dia (00:00:00)
 * @param date - Date object
 * @returns Nova Date com horário zerado
 */
export function startOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
}

/**
 * Converte uma data para o final do dia (23:59:59.999)
 * @param date - Date object
 * @returns Nova Date com horário no final do dia
 */
export function endOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
}

/**
 * Adiciona dias a uma data
 * @param date - Date object base
 * @param days - Número de dias a adicionar (pode ser negativo)
 * @returns Nova Date com os dias adicionados
 */
export function addDays(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}

/**
 * Calcula a diferença em dias entre duas datas
 * @param date1 - Primeira data
 * @param date2 - Segunda data
 * @returns Número de dias de diferença (positivo se date1 > date2)
 */
export function differenceInDays(date1: Date, date2: Date): number {
    const diffTime = date1.getTime() - date2.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
