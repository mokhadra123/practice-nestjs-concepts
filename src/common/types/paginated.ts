export interface Paginated<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    page: number;
    pages: number;
  };
}
