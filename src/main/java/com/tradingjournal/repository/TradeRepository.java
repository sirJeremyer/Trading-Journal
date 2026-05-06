package com.tradingjournal.repository;

import com.tradingjournal.model.Trade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradeRepository extends JpaRepository<Trade, String> {

    // Find all trades ordered by date descending (most recent first)
    List<Trade> findAllByOrderByDateDescCreatedAtDesc();

    // Find trades by outcome
    List<Trade> findByOutcome(String outcome);
}
