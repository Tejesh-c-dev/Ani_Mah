import { CreateReplyInput, CreateReviewInput, UpdateReviewInput, VoteReviewInput } from "../types";
export declare const createReview: (userId: string, input: CreateReviewInput) => Promise<{
    user: {
        id: string;
        username: string;
    };
} & {
    id: string;
    createdAt: Date;
    userId: string;
    parentId: string | null;
    helpfulCount: number;
    rating: number | null;
    notHelpfulCount: number;
    comment: string;
    titleId: string;
}>;
export declare const updateReview: (userId: string, reviewId: string, input: UpdateReviewInput) => Promise<{
    user: {
        id: string;
        username: string;
    };
} & {
    id: string;
    createdAt: Date;
    userId: string;
    parentId: string | null;
    helpfulCount: number;
    rating: number | null;
    notHelpfulCount: number;
    comment: string;
    titleId: string;
}>;
export declare const deleteReview: (userId: string, reviewId: string, userRole?: "USER" | "ADMIN") => Promise<void>;
export declare const createReply: (userId: string, reviewId: string, input: CreateReplyInput) => Promise<{
    user: {
        id: string;
        username: string;
    };
} & {
    id: string;
    createdAt: Date;
    userId: string;
    parentId: string | null;
    helpfulCount: number;
    rating: number | null;
    notHelpfulCount: number;
    comment: string;
    titleId: string;
}>;
export declare const voteReview: (userId: string, reviewId: string, input: VoteReviewInput) => Promise<{
    id: string;
    helpfulCount: number;
    notHelpfulCount: number;
} | null>;
