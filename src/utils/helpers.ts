import { SERVER_PREFIXES, SERVER_SUFFIXES } from './constants';

export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateServerName(): string {
  const prefix = SERVER_PREFIXES[Math.floor(Math.random() * SERVER_PREFIXES.length)];
  const suffix = SERVER_SUFFIXES[Math.floor(Math.random() * SERVER_SUFFIXES.length)];
  const num = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  return `${prefix}-${suffix}-${num}`;
}

export function generateIpAddress(): string {
  return `10.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function getTodayDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
