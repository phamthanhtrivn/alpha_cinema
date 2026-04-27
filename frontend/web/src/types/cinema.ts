export interface Cinema {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: boolean;
}

export interface CinemaFilterParams {
  name?: string;
  address?: string;
  phone?: string;
  status?: boolean;
  page?: number;
  size?: number;
}
