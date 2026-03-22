package cz.projektant_pata.tda26;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class Tda26Application {

	public static void main(String[] args) {
		SpringApplication.run(Tda26Application.class, args);
	}

}
