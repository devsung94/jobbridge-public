import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const publicPaths = [
  /^\/jobs(\/.*)?$/,             // 예: /api/jobs, /api/jobs/123 등
  /^\/auth\/.*$/,               // 로그인/회원가입 관련 API
  /^\/resume\/preview\/.*$/,   // 이력서 미리보기 API
  /^\/search\/.*$/,               // 검색 API
  // 필요시 더 추가 가능
];


const isPublicPath = (url: string): boolean => {
  return publicPaths.some((pattern) => pattern.test(url));
};

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // 점검 모드 감지 (백엔드에서 503 또는 message 포함 시)
    if (
      error.response?.status === 503 &&
      error.response?.data?.message?.includes("점검 중")
    ) {
      if (typeof window !== "undefined") {
        // role 정보를 메모리에서 직접 가져올 수 없으므로,
        // 서버로 로그인 상태 재확인
        try {
          const res = await apiClient.get("/auth/loginCheck");
          const role = res.data?.data?.role;
          const maintenance = res.data?.data?.maintenanceMode;

          if (maintenance && role !== "admin") {
            window.location.href = "/maintenance";
          }
        } catch {
          window.location.href = "/maintenance";
        }
      }
      return Promise.reject(error);
    }

    // 요청 URL 추출
    const requestUrl = originalRequest.url?.replace(apiClient.defaults.baseURL || "", "");

    // 401 오류이고 public 경로가 아니면 refresh 로직 실행
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      requestUrl &&
      !isPublicPath(requestUrl)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/auth/refresh");
        processQueue(null);
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
