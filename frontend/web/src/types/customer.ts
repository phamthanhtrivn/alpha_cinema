export const CustomerType = {
  MEMBER: "MEMBER",
  SILVER: "SILVER",
  GOLD: "GOLD",
} as const;

export type CustomerType = (typeof CustomerType)[keyof typeof CustomerType];

export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export interface CustomerFilterParams {
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: Gender;
  status?: boolean;
  customerType?: CustomerType;
  minPoints?: number;
  maxPoints?: number;
  minTotalSpending?: number;
  maxTotalSpending?: number;
}
