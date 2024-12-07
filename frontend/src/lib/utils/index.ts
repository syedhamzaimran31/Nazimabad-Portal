import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const colors = ['#fdba74', '#f87171', '#86efac', '#fecaca']; // Your chosen colors

export function assignEventColor(index: number) {
  return colors[index % colors.length]; // Assign colors in a round-robin manner
}
