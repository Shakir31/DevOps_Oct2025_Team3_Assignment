import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import {format,parseISO} from "date-fns"


export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {

  const dated = parseISO(date)
  return format(dated, "dd MMM yyyy, HH:mm")
}


