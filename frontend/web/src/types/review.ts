export const ReviewType = {
    VIEWED: 'VIEWED',
    PURCHASED: 'PURCHASED',
    NOT_PURCHASED: 'NOT_PURCHASED'
} as const;

export type ReviewType = (typeof ReviewType)[keyof typeof ReviewType];

export interface ReviewResponseDTO {
    id: string;
    rating: number;
    customerId: string;
    customerName: string;
    comment: string;
    reviewType: ReviewType;
    pictures: string[];
    createdAt: string;
    status: string;
    movieId: string;
}

