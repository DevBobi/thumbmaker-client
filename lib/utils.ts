import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getDaysAgo = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export function absoluteUrl(path: string) {
  return `https://trykrillion.com${path}`;
}
