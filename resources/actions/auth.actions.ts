import { authApi } from "@/resources/apis/auth.api";
import { authStorage } from "@/lib/auth/auth-storage";
import type {
  LoginRequest,
  LoginResponse,
  JwtPayload,
  ChangePasswordRequest,
  MessageResponse,
} from "@/resources/interfaces";

export async function loginAction(payload: LoginRequest): Promise<LoginResponse> {
  const result = await authApi.login(payload);
  authStorage.setAuthData({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: result.user,
  });
  return result;
}

export async function logoutAction(): Promise<MessageResponse> {
  try {
    const result = await authApi.logout();
    authStorage.clearAuthData();
    return result;
  } catch (error) {
    authStorage.clearAuthData();
    throw error;
  }
}

export async function getMeAction(): Promise<JwtPayload> {
  const result = await authApi.getMe();
  authStorage.setAuthData({
    accessToken: authStorage.getAccessToken() || "",
    refreshToken: authStorage.getRefreshToken() || "",
    payload: result,
  });
  return result;
}

export async function changePasswordAction(
  payload: ChangePasswordRequest,
): Promise<MessageResponse> {
  return authApi.changePassword(payload);
}
