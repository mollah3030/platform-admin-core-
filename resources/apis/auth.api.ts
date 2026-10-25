import { apiClient } from "@/lib/axios";
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  JwtPayload,
  ChangePasswordRequest,
  MessageResponse,
} from "@/resources/interfaces";

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/admin/auth/login", payload);
    return response.data;
  },

  async logout(): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>("/admin/auth/logout");
    return response.data;
  },

  async refresh(payload: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(
      "/admin/auth/refresh",
      payload,
      { headers: { Authorization: `Bearer ${payload.refreshToken}` } },
    );
    return response.data;
  },

  async getMe(): Promise<JwtPayload> {
    const response = await apiClient.get<JwtPayload>("/admin/auth/me");
    return response.data;
  },

  async changePassword(payload: ChangePasswordRequest): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      "/admin/auth/change-password",
      payload,
    );
    return response.data;
  },
};
