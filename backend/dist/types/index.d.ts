export interface ApiResponse<T = any> {
    success: boolean;
    data: T | null;
    error: string | null;
}
export interface RegisterInput {
    username: string;
    email: string;
    password: string;
}
export interface LoginInput {
    email: string;
    password: string;
}
export interface UpdateUserRoleInput {
    role: "USER" | "ADMIN";
}
export interface UserProfileResponse {
    id: string;
    username: string;
    email: string;
    role: "USER" | "ADMIN";
    profileImage?: string | null;
    createdAt: Date;
    stats: {
        reviewsCount: number;
        likesReceived: number;
    };
}
export interface CreateTitleInput {
    name: string;
    description: string;
    releaseYear: number;
    type?: "ANIME" | "MANHWA" | "MOVIE";
    genre?: string;
    image?: string;
}
export interface CreateReviewInput {
    rating?: number;
    comment: string;
    titleId: string;
    parentId?: string;
}
export interface UpdateReviewInput {
    rating?: number;
    comment?: string;
}
export interface CreateReplyInput {
    comment: string;
}
export interface VoteReviewInput {
    vote: "helpful" | "not_helpful";
}
export type ReviewSort = "latest" | "top_rated" | "most_helpful";
export interface JwtPayload {
    userId: string;
    role: "USER" | "ADMIN";
}
