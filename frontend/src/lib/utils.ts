import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getApiErrorMessage(err: unknown, defaultMsg = 'Ha ocurrido un error inesperado'): string {
  if (err && typeof err === 'object') {
    const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
    const apiMessage = axiosErr.response?.data?.message;
    if (apiMessage) {
      if (Array.isArray(apiMessage)) {
        return apiMessage.join(' · ');
      }
      return String(apiMessage);
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return defaultMsg;
}
