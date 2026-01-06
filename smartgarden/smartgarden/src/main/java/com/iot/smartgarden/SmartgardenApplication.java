package com.iot.smartgarden;

import com.iot.smartgarden.entity.User;
import com.iot.smartgarden.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class SmartgardenApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartgardenApplication.class, args);
	}

	// Tự động tạo Admin
	@Bean
	CommandLineRunner run(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			if (!userRepository.existsByUsername("admin")) {
				User admin = new User();
				admin.setUsername("admin");
				admin.setPassword(passwordEncoder.encode("123")); // Mật khẩu là 123
				admin.setFullName("Administrator");
				admin.setRole("ADMIN");
				admin.setEmail("admin@local.com");

				userRepository.save(admin);
				System.out.println(">>> Đã tạo tài khoản ADMIN mặc định: admin / 123");
			}
		};
	}
}