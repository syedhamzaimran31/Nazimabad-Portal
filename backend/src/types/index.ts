export const dateFormat = 'YYYY-MM-DD';

export interface ApiMessage {
  message: string;
}

export interface ApiMessageData extends ApiMessage {
  data: object;
}

export interface ApiMessageDataPagination extends ApiMessageData {
  page: number;
  lastPage: number;
  total: number;
  limit: number;
}

export enum sortEnum {
  Ascending = 'ASC',
  Descending = 'DESC',
}

export interface SortBy {
  field: string;
  order: sortEnum;
}