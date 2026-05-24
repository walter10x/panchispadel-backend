export interface ListMatchesFilters {
  status?: string | undefined;
  clubId?: string | undefined;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
}

export interface ListMatchesDTO {
  page: number;
  limit: number;
  filters?: ListMatchesFilters;
}
