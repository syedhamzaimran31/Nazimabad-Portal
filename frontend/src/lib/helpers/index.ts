import { useState } from 'react';
import * as XLSX from 'xlsx';

export function useImagePreview() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
  };

  const handleCloseImagePreview = () => {
    setSelectedImage(null);
  };

  return {
    selectedImage,
    handleImageClick,
    handleCloseImagePreview,
  };
}

export function sortDataByDate<T extends Record<string, any>>(
  data: T[],
  dateKey: keyof T = 'createdAt',
  order: 'asc' | 'desc' = 'desc',
): T[] {
  return data.sort((a, b) => {
    const dateA = new Date(a[dateKey] || 0);
    const dateB = new Date(b[dateKey] || 0);

    console.log(a[dateKey], b[dateKey], dateA.getTime(), dateB.getTime());

    if (order === 'asc') {
      console.log(dateA.getTime() - dateB.getTime());
      return dateA.getTime() - dateB.getTime();
    }
    console.log(dateB.getTime() - dateA.getTime());

    return dateB.getTime() - dateA.getTime();
  });
}

export function validateEqualNumbers(
  expected: number,
  actual: number,
  errorMessage: string = 'Numbers do not match',
): void {
  if (expected !== actual) {
    throw new Error(errorMessage);
  }
}

// Ensures that CNIC is shown as 13-digit number with dashes
export function formatCnic(cnic: string): string {
  if (!cnic) return '';
  const formatted = `${cnic.slice(0, 5)}-${cnic.slice(5, 12)}-${cnic.slice(12)}`;
  return formatted;
}

// helpers.ts

export function handleImageChange(
  index: number,
  file: File | null,
  setImagePreviews: React.Dispatch<React.SetStateAction<Record<number, string | null>>>,
) {
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePreviews((prev) => ({
          ...prev,
          [index]: e.target?.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  } else {
    // Remove the preview if no file is selected
    setImagePreviews((prev) => ({
      ...prev,
      [index]: null,
    }));
  }
}

// Function to get unique months from the visitors' data
export function getUniqueMonths<T extends Record<string, any>>(
  data: T[],
  dateKey: keyof T,
): string[] {
  const monthsSet = new Set<string>();

  data?.forEach((item) => {
    const dateStr = item[dateKey];
    if (dateStr === '0000-00-00' || !dateStr || isNaN(Date.parse(dateStr))) {
      console.log(`Skipping invalid date string: ${dateStr}`);
      return;
    }
    const date = new Date(dateStr);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    console.log(`Date string: ${dateStr}, Month/Year: ${monthYear}`);
    monthsSet.add(monthYear);
  });
  // Convert the Set to an array, sort it in descending order
  return [...monthsSet].sort((a, b) => {
    const [monthA, yearA] = a.split(' ');
    const [monthB, yearB] = b.split(' ');

    // Compare years first (descending order)
    if (yearA !== yearB) return parseInt(yearB) - parseInt(yearA);

    // If years are the same, compare months using their index (also descending)
    const monthIndexA = new Date(`${monthA} 1, ${yearA}`).getMonth();
    const monthIndexB = new Date(`${monthB} 1, ${yearB}`).getMonth();
    return monthIndexB - monthIndexA;
  });
  // return [...monthsSet];
}

// Function to filter data by month
export function filterDataByMonth<T extends Record<string, any>>(
  data: T[],
  selectedMonth: string,
  dateKey: keyof T,
): T[] {
  return data?.filter((item) => {
    const dateStr = item[dateKey];

    if (dateStr === '0000-00-00' || !dateStr || isNaN(Date.parse(dateStr))) {
      console.log(`Filtering out invalid date string: ${dateStr}`);
      return false;
    }

    const date = new Date(dateStr);
    const visitorMonth = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    console.log(
      `Date string: ${dateStr}, Visitor Month: ${visitorMonth}, Selected Month: ${selectedMonth}`,
    );
    return visitorMonth === selectedMonth;
  });
}

// Group data by day
export function groupDataByDay<T extends Record<string, any>>(
  data: T[],
  dateKey: keyof T,
): { date: string; visitors: number; complaints: number }[] {
  // debugger;
  const dayCount: Record<string, number> = {}; // Change to Record<string, number> for formattedDate to work

  data?.forEach((item) => {
    const dateStr = item[dateKey];

    if (!dateStr || isNaN(Date.parse(dateStr))) {
      console.log(`Skipping invalid date string: ${dateStr}`);
      return;
    }

    const date = new Date(dateStr);
    if (!isNaN(date.getTime()) && dateStr && dateStr !== '000000') {
      const formattedDate = date.toISOString().split('T')[0]; // Format as yyyy-mm-dd
      console.log(`Date string: ${dateStr}, Formatted Date: ${formattedDate}`);
      dayCount[formattedDate] = (dayCount[formattedDate] || 0) + 1;
    } else {
      console.log(`Grouping out invalid date: ${dateStr}`);
    }
  });
  return Object.keys(dayCount).map((date) => ({
    date,
    visitors: dayCount[date],
    complaints: dayCount[date],
  }));
}

// Function to generate an array of all dates in a given month
export function generateFullMonthDates(monthYear: string): string[] {
  const [month, year] = monthYear.split(' '); // Split the selectedMonth into month and year
  const monthIndex = new Date(`${month} 1, ${year}`).getMonth(); // Convert month name to index (0-based)
  const numDays = new Date(Number(year), monthIndex + 1, 0).getDate(); // Get total days in the month

  const fullMonthDates: string[] = [];
  for (let day = 1; day <= numDays; day++) {
    const date = new Date(Number(year), monthIndex, day);
    // Format as 'yyyy/mm/dd' or whatever format your data uses
    const formattedDate = date.toISOString().split('T')[0]; // Format as yyyy-mm-dd
    fullMonthDates.push(formattedDate);
  }

  return fullMonthDates;
}

export const exportToExcel = (data: any[], sheetName: string, fileName: string) => {
  // Create a workbook and a worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Write the workbook as an Excel file
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// export function handleImageChange(
//   index: number,
//   file: File | null,
//   setImagePreviews: React.Dispatch<
//     React.SetStateAction<Record<number, string | null>>
//   >
// ) {
//   if (file) {
//     const previewUrl = URL.createObjectURL(file);
//     setImagePreviews((prev) => ({
//       ...prev,
//       [index]: previewUrl,
//     }));
//   } else {
//     setImagePreviews((prev) => ({
//       ...prev,
//       [index]: null,
//     }));
//   }
// }
