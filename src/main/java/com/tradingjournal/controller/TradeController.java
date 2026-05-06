package com.tradingjournal.controller;

import com.tradingjournal.model.Trade;
import com.tradingjournal.model.TradeStats;
import com.tradingjournal.service.TradeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trades")
public class TradeController {

    private final TradeService tradeService;

    public TradeController(TradeService tradeService) {
        this.tradeService = tradeService;
    }

    // GET /api/trades — all trades
    @GetMapping
    public List<Trade> getAllTrades() {
        return tradeService.getAllTrades();
    }

    // GET /api/trades/stats — statistics summary
    @GetMapping("/stats")
    public TradeStats getStats() {
        return tradeService.getStats();
    }

    // GET /api/trades/{id} — single trade
    @GetMapping("/{id}")
    public ResponseEntity<?> getTrade(@PathVariable String id) {
        return tradeService.getTradeById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Trade not found")));
    }

    // POST /api/trades — create trade
    @PostMapping
    public ResponseEntity<?> createTrade(@RequestBody Trade trade) {
        if (trade.getDate() == null || trade.getSymbol() == null || trade.getOutcome() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "date, symbol, and outcome are required"));
        }
        Trade saved = tradeService.createTrade(trade);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT /api/trades/{id} — update trade
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTrade(@PathVariable String id, @RequestBody Trade trade) {
        return tradeService.updateTrade(id, trade)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Trade not found")));
    }

    // DELETE /api/trades/{id} — delete trade
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrade(@PathVariable String id) {
        if (tradeService.deleteTrade(id)) {
            return ResponseEntity.ok(Map.of("success", true));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Trade not found"));
    }
}
