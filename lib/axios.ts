import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { apiConfig } from "@/config/api.config";
import { authStorage } from "@/lib/auth/auth-storage";

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp?: string;
  path?: string;
}

export class AppApiError extends Error {
  statusCode: number;
  errors: string[];

  constructor(message: string, statusCode: number, errors: string[] = []) {
    super(message);
    this.name = "AppApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.requestTimeout,
  headers: apiConfig.defaultHeaders,
});

// Request Interceptor: Attach JWT Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Normalized Error Handling & 401 Handling
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;
    const responseData = error.response?.data;

    // Handle 401 Unauthorized
    if (status === 401 && originalRequest && !originalRequest._retry) {
      // Don't retry for login or refresh itself
      if (
        originalRequest.url?.includes("/admin/auth/login") ||
        originalRequest.url?.includes("/admin/auth/refresh")
      ) {
        return Promise.reject(normalizeError(error));
      }

      const refreshToken = authStorage.getRefreshToken();
      if (!refreshToken) {
        authStorage.clearAuthData();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/admin/login")) {
          window.location.href = "/admin/login?expired=1";
        }
        return Promise.reject(normalizeError(error));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${apiConfig.baseURL}/admin/auth/refresh`,
          { refreshToken },
          { headers: { Authorization: `Bearer ${refreshToken}` } },
        );

        const newAccessToken = refreshResponse.data.accessToken;
        const newRefreshToken = refreshResponse.data.refreshToken || refreshToken;

        authStorage.setAuthData({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });

        processQueue(null, newAccessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        authStorage.clearAuthData();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/admin/login")) {
          window.location.href = "/admin/login?expired=1";
        }
        return Promise.reject(normalizeError(error));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

function normalizeError(error: AxiosError<ApiErrorResponse>): AppApiError {
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return new AppApiError("Request timeout. The server took too long to respond.", 408);
    }
    return new AppApiError(
      "Network error. Please check that the backend server is running.",
      0,
    );
  }

  const statusCode = error.response.status;
  const data = error.response.data;

  let message = "An unexpected error occurred.";
  let errors: string[] = [];

  if (data?.message) {
    if (Array.isArray(data.message)) {
      errors = data.message;
      message = data.message.join(", ");
    } else if (typeof data.message === "string") {
      message = data.message;
    }
  } else if (statusCode === 400) {
    message = "Invalid request data. Please check your inputs.";
  } else if (statusCode === 401) {
    message = "Invalid credentials or session expired.";
  } else if (statusCode === 403) {
    message = "Access denied. You do not have permission to perform this action.";
  } else if (statusCode === 404) {
    message = "Requested resource was not found.";
  } else if (statusCode === 409) {
    message = "A conflict occurred. The resource already exists.";
  } else if (statusCode === 429) {
    message = "Too many requests. Please slow down.";
  } else if (statusCode >= 500) {
    message = "Server error. Please try again later.";
  }

  return new AppApiError(message, statusCode, errors);
}
