interface PaginationResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
  
  export const paginate = <T>(
    data: T[],
    total: number,
    page: number,
    pageSize: number
  ): PaginationResult<T> => {
    const totalPages = Math.ceil(total / pageSize);
    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
    };
  };
  