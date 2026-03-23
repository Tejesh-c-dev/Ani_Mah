import { RegisterInput, LoginInput, UpdateUserRoleInput, UserProfileResponse } from "../types";
export declare const register: (input: RegisterInput) => Promise<{
    id: string;
    username: string;
    email: string;
    role: string;
    profileImage: string | null;
    createdAt: Date;
}>;
export declare const login: (input: LoginInput) => Promise<{
    token: string;
    user: {
        id: string;
        username: string;
        email: string;
        role: string;
        profileImage: string | null;
    };
}>;
export declare const updateUserRole: (targetUserId: string, input: UpdateUserRoleInput) => Promise<{
    id: string;
    username: string;
    email: string;
    role: string;
    profileImage: string | null;
    createdAt: Date;
}>;
export declare const getMyProfile: (userId: string) => Promise<UserProfileResponse>;
export declare const updateMyProfileImage: (userId: string, file: Express.Multer.File) => Promise<{
    id: string;
    username: string;
    email: string;
    role: string;
    profileImage: string | null;
    createdAt: Date;
}>;
