package JobBridgeKo.com.JobBridge.util;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

// 공통 응답 유틸 클래스
public class ResponseUtil {

    // 공통 응답 데이터 (data가 null이면 자동 제거)
    public static Map<String, Object> responseData(String result, String code, String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("result", result);
        response.put("code", code);
        response.put("message", message);

        if (data != null) {
            response.put("data", data);
        }

        return response;
    }

    // 200 OK 응답
    public static ResponseEntity<Map<String, Object>> ok(String result, String message, Object data) {
        return ResponseEntity.ok(responseData(result, "S200", message, data));
    }

    // 400 Bad Request 응답 (잘못된 요청)
    public static ResponseEntity<Map<String, Object>> badRequest(String message) {
        return ResponseEntity.badRequest().body(responseData("N", "E400", message, null));
    }

    // 401 Unauthorized 응답 (로그인이 필요함)
    public static ResponseEntity<Map<String, Object>> unauthorized(String message) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(responseData("N", "E401", message, null));
    }

    // 403 Forbidden 응답 (권한 없음)
    public static ResponseEntity<Map<String, Object>> forbidden(String message) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(responseData("N", "E403", message, null));
    }

    // 404 Not Found 응답 (데이터 없음)
    public static ResponseEntity<Map<String, Object>> notFound(String message) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseData("N", "E404", message, null));
    }

    // 500 Internal Server Error 응답 (서버 오류)
    public static ResponseEntity<Map<String, Object>> serverError(String message) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseData("N", "E500", message, null));
    }
    // 409 Conflict 응답 (이미 처리된 요청 등 충돌)
    public static ResponseEntity<Map<String, Object>> conflict(String message) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(responseData("N", "E409", message, null));
    }

}
