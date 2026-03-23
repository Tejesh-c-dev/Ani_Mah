// Auth service — handles registration and login logic
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client";
import { AppError } from "../utils/AppError";
import { RegisterInput, LoginInput, UpdateUserRoleInput, UserProfileResponse } from "../types";
import { bucketName, supabase } from "./supabase";
import { deleteSupabaseImage } from "./supabase-utils";

const SALT_ROUNDS = 10;

export const register = async (input: RegisterInput) => {
  const { username, email, password } = input;

  // Validate
  if (!username || !email || !password) {
    throw new AppError("Username, email, and password are required", 400);
  }
  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Invalid email format", 400);
  }

  // Check existing
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existingUser) {
    throw new AppError("Username or email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword, role: "USER" },
    select: { id: true, username: true, email: true, role: true, profileImage: true, createdAt: true },
  });

  return user;
};

export const login = async (input: LoginInput) => {
  const { email, password } = input;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role as "USER" | "ADMIN" },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

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

export const updateUserRole = async (targetUserId: string, input: UpdateUserRoleInput) => {
  if (!targetUserId) {
    throw new AppError("User ID is required", 400);
  }

  const { role } = input;
  if (!role || (role !== "USER" && role !== "ADMIN")) {
    throw new AppError("Role must be either USER or ADMIN", 400);
  }

  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { role },
    select: { id: true, username: true, email: true, role: true, profileImage: true, createdAt: true },
  });

  return updated;
};

export const getMyProfile = async (userId: string): Promise<UserProfileResponse> => {
  const user = await prisma.user.findUnique({
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
    throw new AppError("User not found", 404);
  }

  const [reviewsCount, likesAggregate] = await Promise.all([
    prisma.review.count({ where: { userId, parentId: null } }),
    prisma.review.aggregate({
      where: { userId },
      _sum: { helpfulCount: true },
    }),
  ]);

  return {
    ...user,
    role: user.role as "USER" | "ADMIN",
    stats: {
      reviewsCount,
      likesReceived: likesAggregate._sum.helpfulCount ?? 0,
    },
  };
};

export const updateMyProfileImage = async (userId: string, file: Express.Multer.File) => {
  if (!file) {
    throw new AppError("Profile image is required", 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
  const path = `profiles/${userId}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(path, file.buffer, { contentType: file.mimetype });

  if (uploadError) {
    throw new AppError(`Profile image upload failed: ${uploadError.message}`, 500);
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  const profileImage = data.publicUrl;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { profileImage },
    select: { id: true, username: true, email: true, role: true, profileImage: true, createdAt: true },
  });

  if (user.profileImage) {
    await deleteSupabaseImage(user.profileImage);
  }

  return updated;
};
