"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyProfileImage = exports.getMyProfile = exports.updateUserRole = exports.login = exports.register = void 0;
// Auth service — handles registration and login logic
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../prisma/client"));
const AppError_1 = require("../utils/AppError");
const supabase_1 = require("./supabase");
const supabase_utils_1 = require("./supabase-utils");
const SALT_ROUNDS = 10;
const register = async (input) => {
    const { username, email, password } = input;
    // Validate
    if (!username || !email || !password) {
        throw new AppError_1.AppError("Username, email, and password are required", 400);
    }
    if (password.length < 6) {
        throw new AppError_1.AppError("Password must be at least 6 characters", 400);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new AppError_1.AppError("Invalid email format", 400);
    }
    // Check existing
    const existingUser = await client_1.default.user.findFirst({
        where: { OR: [{ email }, { username }] },
    });
    if (existingUser) {
        throw new AppError_1.AppError("Username or email already exists", 409);
    }
    const hashedPassword = await bcrypt_1.default.hash(password, SALT_ROUNDS);
    const user = await client_1.default.user.create({
        data: { username, email, password: hashedPassword, role: "USER" },
        select: { id: true, username: true, email: true, role: true, profileImage: true, createdAt: true },
    });
    return user;
};
exports.register = register;
const login = async (input) => {
    const { email, password } = input;
    if (!email || !password) {
        throw new AppError_1.AppError("Email and password are required", 400);
    }
    const user = await client_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new AppError_1.AppError("Invalid credentials", 401);
    }
    const isValid = await bcrypt_1.default.compare(password, user.password);
    if (!isValid) {
        throw new AppError_1.AppError("Invalid credentials", 401);
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
        },
    };
};
exports.login = login;
const updateUserRole = async (targetUserId, input) => {
    if (!targetUserId) {
        throw new AppError_1.AppError("User ID is required", 400);
    }
    const { role } = input;
    if (!role || (role !== "USER" && role !== "ADMIN")) {
        throw new AppError_1.AppError("Role must be either USER or ADMIN", 400);
    }
    const user = await client_1.default.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
        throw new AppError_1.AppError("User not found", 404);
    }
    const updated = await client_1.default.user.update({
        where: { id: targetUserId },
        data: { role },
        select: { id: true, username: true, email: true, role: true, profileImage: true, createdAt: true },
    });
    return updated;
};
exports.updateUserRole = updateUserRole;
const getMyProfile = async (userId) => {
    const user = await client_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            profileImage: true,
            createdAt: true,
        },
    });
    if (!user) {
        throw new AppError_1.AppError("User not found", 404);
    }
    const [reviewsCount, likesAggregate] = await Promise.all([
        client_1.default.review.count({ where: { userId, parentId: null } }),
        client_1.default.review.aggregate({
            where: { userId },
            _sum: { helpfulCount: true },
        }),
    ]);
    return {
        ...user,
        role: user.role,
        stats: {
            reviewsCount,
            likesReceived: likesAggregate._sum.helpfulCount ?? 0,
        },
    };
};
exports.getMyProfile = getMyProfile;
const updateMyProfileImage = async (userId, file) => {
    if (!file) {
        throw new AppError_1.AppError("Profile image is required", 400);
    }
    const user = await client_1.default.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new AppError_1.AppError("User not found", 404);
    }
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    const path = `profiles/${userId}/${filename}`;
    const { error: uploadError } = await supabase_1.supabase.storage
        .from(supabase_1.bucketName)
        .upload(path, file.buffer, { contentType: file.mimetype });
    if (uploadError) {
        throw new AppError_1.AppError(`Profile image upload failed: ${uploadError.message}`, 500);
    }
    const { data } = supabase_1.supabase.storage.from(supabase_1.bucketName).getPublicUrl(path);
    const profileImage = data.publicUrl;
    const updated = await client_1.default.user.update({
        where: { id: userId },
        data: { profileImage },
        select: { id: true, username: true, email: true, role: true, profileImage: true, createdAt: true },
    });
    if (user.profileImage) {
        await (0, supabase_utils_1.deleteSupabaseImage)(user.profileImage);
    }
    return updated;
};
exports.updateMyProfileImage = updateMyProfileImage;
//# sourceMappingURL=auth.service.js.map