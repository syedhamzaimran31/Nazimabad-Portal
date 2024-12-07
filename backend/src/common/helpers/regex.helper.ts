import { Injectable } from '@nestjs/common';

@Injectable()
export class RegexHelper {
  constructor() {}

  escapeRegex(text: string): string {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  formatVisitDate(visitDate: string): string {
    // Check if the date is already in the format yyyy/MM/dd
    const regex = /^\d{4}\/\d{2}\/\d{2}$/;
    if (regex.test(visitDate)) {
      return visitDate;
    }

    // If the date is in another format, parse and reformat it
    const date = new Date(visitDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}/${month}/${day}`;
  }
  formatCheckInTime(checkInTime: string): string {
    const date = new Date(checkInTime);
    // const year = date.getFullYear();
    // const month = String(date.getMonth() + 1).padStart(2, '0');
    // const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  formatCheckInDate(checkInTime: string): string {
    const date = new Date(checkInTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}/${month}/${day}`;
  }
}
