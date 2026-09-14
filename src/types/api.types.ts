/**
 * API 공통 응답 타입
 * - 모든 API 응답은 success / message 필드를 기본으로 가진다.
 */
export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

// GET /api/health 응답 타입
export interface HealthResponse extends ApiResponse {
  timestamp: string;
}
