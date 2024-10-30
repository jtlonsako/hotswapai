import { clsx, type ClassValue } from "clsx"
import { or } from "drizzle-orm";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTimeDiff(messageDate: string): string {
  let originalDate = new Date(messageDate);
  let currentDate = new Date();


  if(messageDate){
    const dateDiffInDays = ((currentDate - originalDate) / (1000 * 60 * 60 * 24));
  
    const yesterday = new Date();
    yesterday.setDate(currentDate.getDate() - 1);
  
    const startOfWeek = new Date();
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  
    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(startOfWeek.getDate() - 7);
  
    const lastWeekEnd = new Date(startOfWeek);
    lastWeekEnd.setDate(startOfWeek.getDate() - 1);
  
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
    if (currentDate.toDateString() === originalDate.toDateString()) {
      return 'Today';
  } else if (originalDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
  } else if (originalDate >= startOfWeek) {
      return 'This Week';
  } else if (originalDate >= lastWeekStart && originalDate <= lastWeekEnd) {
      return 'Last week';
  } else if (dateDiffInDays <= 14) {
      return '2 Weeks';
  } else if (dateDiffInDays <= 21) {
      return '3 Weeks';
  } else if (originalDate >= startOfMonth) {
      return 'This Month';
  } else {
      const monthsDiff = (currentDate.getFullYear() - originalDate.getFullYear()) * 12 + (currentDate.getMonth() - originalDate.getMonth());
      if (monthsDiff === 1) {
          return '1 Month';
      } else {
          return `${monthsDiff} Months`;
      }
  }
  } else return '';

}