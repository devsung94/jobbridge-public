package JobBridgeKo.com.JobBridge.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${spring.profiles.active:prod}")
    private String activeProfile;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadDir;

        if ("local".equalsIgnoreCase(activeProfile)) {
            // 로컬: backEnd/uploads 상대경로 기준
            uploadDir = Paths.get("uploads").toAbsolutePath().toUri().toString();
        } else {
            // Render: 컨테이너 내의 /app/backEnd/uploads 절대경로
            uploadDir = "file:/app/uploads/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadDir);
    }
}
