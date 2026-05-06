package com.tradingjournal.service;

import com.tradingjournal.model.Trade;
import com.tradingjournal.model.TradeStats;
import com.tradingjournal.repository.TradeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TradeService {

    private final TradeRepository tradeRepository;

    public TradeService(TradeRepository tradeRepository) {
        this.tradeRepository = tradeRepository;
    }

    // Get all trades ordered by date desc
    public List<Trade> getAllTrades() {
        return tradeRepository.findAllByOrderByDateDescCreatedAtDesc();
    }

    // Get single trade by id
    public Optional<Trade> getTradeById(String id) {
        return tradeRepository.findById(id);
    }

    // Create a new trade
    public Trade createTrade(Trade trade) {
        return tradeRepository.save(trade);
    }

    // Update existing trade
    public Optional<Trade> updateTrade(String id, Trade updated) {
        return tradeRepository.findById(id).map(existing -> {
            existing.setDate(updated.getDate());
            existing.setSymbol(updated.getSymbol());
            existing.setOutcome(updated.getOutcome());
            existing.setPnl(updated.getPnl());
            existing.setRiskReward(updated.getRiskReward());
            existing.setEntryPrice(updated.getEntryPrice());
            existing.setExitPrice(updated.getExitPrice());
            existing.setStopLoss(updated.getStopLoss());
            existing.setTakeProfit(updated.getTakeProfit());
            existing.setScale(updated.getScale());
            existing.setPositionSize(updated.getPositionSize());
            existing.setMentality(updated.getMentality());
            existing.setPros(updated.getPros());
            existing.setCons(updated.getCons());
            existing.setNotes(updated.getNotes());
            return tradeRepository.save(existing);
        });
    }

    // Delete trade
    public boolean deleteTrade(String id) {
        if (tradeRepository.existsById(id)) {
            tradeRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Calculate stats — same logic as original routes/trades.js
    public TradeStats getStats() {
        List<Trade> trades = tradeRepository.findAll();

        if (trades.isEmpty()) {
            return new TradeStats(0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.0, "0");
        }

        List<Trade> wins   = trades.stream().filter(t -> "win".equals(t.getOutcome())).toList();
        List<Trade> losses = trades.stream().filter(t -> "loss".equals(t.getOutcome())).toList();

        double winRate = Math.round((wins.size() / (double) trades.size()) * 1000.0) / 10.0;

        double totalPnL = trades.stream().mapToDouble(t -> t.getPnl() != null ? t.getPnl() : 0.0).sum();
        totalPnL = Math.round(totalPnL * 100.0) / 100.0;

        double avgRR = trades.stream().mapToDouble(t -> t.getRiskReward() != null ? t.getRiskReward() : 0.0).average().orElse(0.0);
        avgRR = Math.round(avgRR * 100.0) / 100.0;

        double avgWin = wins.stream().mapToDouble(t -> t.getPnl() != null ? t.getPnl() : 0.0).average().orElse(0.0);
        avgWin = Math.round(avgWin * 100.0) / 100.0;

        double avgLoss = losses.stream().mapToDouble(t -> t.getPnl() != null ? t.getPnl() : 0.0).average().orElse(0.0);
        avgLoss = Math.round(avgLoss * 100.0) / 100.0;

        double grossWins   = wins.stream().mapToDouble(t -> t.getPnl() != null ? t.getPnl() : 0.0).sum();
        double grossLosses = Math.abs(losses.stream().mapToDouble(t -> t.getPnl() != null ? t.getPnl() : 0.0).sum());

        String profitFactor;
        if (grossLosses > 0) {
            profitFactor = String.valueOf(Math.round((grossWins / grossLosses) * 100.0) / 100.0);
        } else if (grossWins > 0) {
            profitFactor = "∞";
        } else {
            profitFactor = "0";
        }

        return new TradeStats(
                trades.size(), wins.size(), losses.size(),
                winRate, avgRR, totalPnL, avgWin, avgLoss, profitFactor
        );
    }
}
