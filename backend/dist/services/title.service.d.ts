import { CreateTitleInput, ReviewSort } from "../types";
export declare const createTitle: (input: CreateTitleInput) => Promise<{
    id: string;
    createdAt: Date;
    name: string;
    description: string;
    image: string | null;
    type: string;
    genre: string;
    releaseYear: number;
    averageRating: number;
}>;
export declare const getAllTitles: (typeFilter?: string) => Promise<{
    id: string;
    createdAt: Date;
    name: string;
    description: string;
    image: string | null;
    type: string;
    genre: string;
    releaseYear: number;
    averageRating: number;
}[]>;
export declare const getTitleById: (id: string, reviewSort?: ReviewSort) => Promise<{
    reviews: ({
        user: {
            id: string;
            username: string;
        };
        replies: ({
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
        })[];
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
    })[];
} & {
    id: string;
    createdAt: Date;
    name: string;
    description: string;
    image: string | null;
    type: string;
    genre: string;
    releaseYear: number;
    averageRating: number;
}>;
export declare const getRecommendedTitlesForUser: (userId: string) => Promise<{
    id: string;
    createdAt: Date;
    name: string;
    description: string;
    image: string | null;
    type: string;
    genre: string;
    releaseYear: number;
    averageRating: number;
}[]>;
