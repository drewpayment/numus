

export interface Paginator<T> {
  data: T;
  page: number;
  take: number;
}