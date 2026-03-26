// Auth service — handles registration and login logic
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { supabase, bucketName } from "@/lib/supabase";
import { deleteSupabaseImage } from "@/lib/supabase-utils";
import { getUserActivity } from "./activity.service";
import type {
  RegisterInput,
  LoginInput,
  UpdateUserRoleInput,
  UserProfileResponse,
  FileUpload,
} from "@/lib/types";

const SALT_ROUNDS = 10;

const validateAuthInput = (username?: string, email?: string, password?: string) => {
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
};

const issueAuthPayload = (user: {
  id: string;
  username: string;
  email: string;
  role: string;
  profileImage: string | null;
}) => {
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

export const register = async (input: RegisterInput) => {
  const { username, email, password } = input;

  validateAuthInput(username, email, password);

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

  return issueAuthPayload(user);
};

export const adminLogin = async (input: LoginInput) => {
  const result = await login(input);
  if (result.user.role !== "ADMIN") {
    throw new AppError("Admin account required", 403);
  }
  return result;
};

export const bootstrapAdmin = async (input: RegisterInput & { setupKey: string }) => {
  const { username, email, password, setupKey } = input;
  validateAuthInput(username, email, password);

  const expectedSetupKey = process.env.ADMIN_SETUP_KEY;
  if (!expectedSetupKey) {
    throw new AppError("ADMIN_SETUP_KEY is not configured on server", 500);
  }
  if (setupKey !== expectedSetupKey) {
    throw new AppError("Invalid admin setup key", 403);
  }

  const existingAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (existingAdmin) {
    throw new AppError("Admin account already exists", 409);
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existingUser) {
    throw new AppError("Username or email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const admin = await prisma.user.create({
    data: { username, email, password: hashedPassword, role: "ADMIN" },
    select: { id: true, username: true, email: true, role: true, profileImage: true },
  });

  return issueAuthPayload(admin);
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

export const getMyActivity = async (userId: string) => {
  return getUserActivity(userId, 100);
};

export const updateMyProfileImage = async (userId: string, file: FileUpload) => {
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

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      profileImage: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const deleteUserByAdmin = async (adminUserId: string, targetUserId: string) => {
  if (adminUserId === targetUserId) {
    throw new AppError("Admin cannot delete their own account", 400);
  }

  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  await prisma.user.delete({ where: { id: targetUserId } });
  return { message: "User deleted" };
};
