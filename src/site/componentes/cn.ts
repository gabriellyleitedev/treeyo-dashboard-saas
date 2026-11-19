import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Junta classes do Tailwind, deixando a última vencer em caso de conflito
export const cn = (...classes: ClassValue[]) => twMerge(clsx(classes));
