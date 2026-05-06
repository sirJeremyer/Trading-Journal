package com.tradingjournal.model;

public class TradeStats {

    private int totalTrades;
    private int wins;
    private int losses;
    private double winRate;
    private double avgRR;
    private double totalPnL;
    private double avgWin;
    private double avgLoss;
    private String profitFactor;

    public TradeStats() {}

    public TradeStats(int totalTrades, int wins, int losses, double winRate,
                      double avgRR, double totalPnL, double avgWin,
                      double avgLoss, String profitFactor) {
        this.totalTrades = totalTrades;
        this.wins = wins;
        this.losses = losses;
        this.winRate = winRate;
        this.avgRR = avgRR;
        this.totalPnL = totalPnL;
        this.avgWin = avgWin;
        this.avgLoss = avgLoss;
        this.profitFactor = profitFactor;
    }

    // Getters & Setters
    public int getTotalTrades() { return totalTrades; }
    public void setTotalTrades(int totalTrades) { this.totalTrades = totalTrades; }

    public int getWins() { return wins; }
    public void setWins(int wins) { this.wins = wins; }

    public int getLosses() { return losses; }
    public void setLosses(int losses) { this.losses = losses; }

    public double getWinRate() { return winRate; }
    public void setWinRate(double winRate) { this.winRate = winRate; }

    public double getAvgRR() { return avgRR; }
    public void setAvgRR(double avgRR) { this.avgRR = avgRR; }

    public double getTotalPnL() { return totalPnL; }
    public void setTotalPnL(double totalPnL) { this.totalPnL = totalPnL; }

    public double getAvgWin() { return avgWin; }
    public void setAvgWin(double avgWin) { this.avgWin = avgWin; }

    public double getAvgLoss() { return avgLoss; }
    public void setAvgLoss(double avgLoss) { this.avgLoss = avgLoss; }

    public String getProfitFactor() { return profitFactor; }
    public void setProfitFactor(String profitFactor) { this.profitFactor = profitFactor; }
}
