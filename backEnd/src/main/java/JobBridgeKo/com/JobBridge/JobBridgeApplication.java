package JobBridgeKo.com.JobBridge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "JobBridgeKo.com.JobBridge")
public class JobBridgeApplication {

	public static void main(String[] args) {
		SpringApplication.run(JobBridgeApplication.class, args);
	}

}
