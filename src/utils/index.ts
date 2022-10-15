export * from './utils';
export * from './db';
export * from './decode';

export const getSuffix = (date: Date): string => {
  const year = `${date.getFullYear()}`.slice(-4);
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  return `${year}${month}${day}`;
};

export const getShortSuffix = (date: Date): string => {
  const year = `${date.getFullYear()}`.slice(-4);
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  return `${year}${month}${day}`;
};

export const fromShortSuffix = (suffix: string): Date => {
  const month = Number(suffix.slice(0, 2));
  const day = Number(suffix.slice(2, 4));
  // console.log(`month:${month}, day:${day}`);
  let date = new Date();
  date.setMonth(month - 1);
  date.setFullYear(2022);
  date.setDate(day);
  date.setHours(0, 1, 0);
  return date;
};

export const fromSuffix = (suffix: string): Date => {
  const year = Number(suffix.slice(0, 4));
  const month = Number(suffix.slice(4, 6));
  const day = Number(suffix.slice(6, 8));
  // console.log(`year: ${year}, month:${month}, day:${day}`);
  let date = new Date();
  date.setMonth(month - 1);
  date.setFullYear(year);
  date.setDate(day);
  date.setHours(0, 1, 0);
  return date;
};

export const calcEnd = (start, end, step: number) => {
  if (start > end) {
    return start;
  }
  const actualEnd = end > start + step ? start + step - 1 : end;
  return actualEnd;
};
