export interface PaginationInput {
  page?: string;
  limit?: string;
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
}

export const parsePagination = (input: PaginationInput): PaginationResult => {
  const page = Math.max(1, Number(input.page ?? 1));
  const limit = Math.min(50, Math.max(1, Number(input.limit ?? 10)));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};
