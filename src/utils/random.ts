export const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

export const randomItem = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
