package com.tradingjournal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TradingJournalApplication {

    public static void main(String[] args) {
        SpringApplication.run(TradingJournalApplication.class, args);
        System.out.println("📈 Trading Journal running at http://localhost:8080");
    }
}
