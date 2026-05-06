package com.tradingjournal.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "trades")
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String symbol;

    @Column(nullable = false)
    private String outcome; // "win", "loss", "breakeven"

    private Double pnl = 0.0;
    private Double riskReward = 0.0;
    private Double entryPrice = 0.0;
    private Double exitPrice = 0.0;
    private Double stopLoss = 0.0;
    private Double takeProfit = 0.0;
    private Double scale = 1.0;
    private Double positionSize = 0.0;

    @Column(length = 500)
    private String mentality = "";

    @Column(length = 2000)
    private String pros = "";

    @Column(length = 2000)
    private String cons = "";

    @Column(length = 2000)
    private String notes = "";

    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters & Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol != null ? symbol.toUpperCase() : null;
    }

    public String getOutcome() {
        return outcome;
    }

    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }

    public Double getPnl() {
        return pnl;
    }

    public void setPnl(Double pnl) {
        this.pnl = pnl != null ? pnl : 0.0;
    }

    public Double getRiskReward() {
        return riskReward;
    }

    public void setRiskReward(Double riskReward) {
        this.riskReward = riskReward != null ? riskReward : 0.0;
    }

    public Double getEntryPrice() {
        return entryPrice;
    }

    public void setEntryPrice(Double entryPrice) {
        this.entryPrice = entryPrice != null ? entryPrice : 0.0;
    }

    public Double getExitPrice() {
        return exitPrice;
    }

    public void setExitPrice(Double exitPrice) {
        this.exitPrice = exitPrice != null ? exitPrice : 0.0;
    }

    public Double getStopLoss() {
        return stopLoss;
    }

    public void setStopLoss(Double stopLoss) {
        this.stopLoss = stopLoss != null ? stopLoss : 0.0;
    }

    public Double getTakeProfit() {
        return takeProfit;
    }

    public void setTakeProfit(Double takeProfit) {
        this.takeProfit = takeProfit != null ? takeProfit : 0.0;
    }

    public Double getScale() {
        return scale;
    }

    public void setScale(Double scale) {
        this.scale = scale != null ? scale : 1.0;
    }

    public Double getPositionSize() {
        return positionSize;
    }

    public void setPositionSize(Double positionSize) {
        this.positionSize = positionSize != null ? positionSize : 0.0;
    }

    public String getMentality() {
        return mentality;
    }

    public void setMentality(String mentality) {
        this.mentality = mentality != null ? mentality : "";
    }

    public String getPros() {
        return pros;
    }

    public void setPros(String pros) {
        this.pros = pros != null ? pros : "";
    }

    public String getCons() {
        return cons;
    }

    public void setCons(String cons) {
        this.cons = cons != null ? cons : "";
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes != null ? notes : "";
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
