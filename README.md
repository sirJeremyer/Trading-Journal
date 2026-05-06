# Trading Journal — Spring Boot

A restructured version of the original Node.js/Express Trading Journal, rebuilt with:

- **Backend:** Java 17 + Spring Boot 3 + Spring Data JPA
- **Database:** SQLite (file `trading_journal.db`, created automatically)
- **Frontend:** Same HTML/CSS/JS from the original project (unchanged)

---

## Project Structure

```
trading-journal-springboot/
├── pom.xml
└── src/main/
    ├── java/com/tradingjournal/
    │   ├── TradingJournalApplication.java   ← Entry point
    │   ├── controller/
    │   │   └── TradeController.java          ← REST API (/api/trades)
    │   ├── model/
    │   │   ├── Trade.java                    ← JPA Entity
    │   │   └── TradeStats.java               ← Stats response DTO
    │   ├── repository/
    │   │   └── TradeRepository.java          ← Spring Data JPA
    │   └── service/
    │       └── TradeService.java             ← Business logic
    └── resources/
        ├── application.properties            ← SQLite config
        └── static/                           ← Frontend (HTML/CSS/JS)
            ├── index.html
            ├── css/style.css
            └── js/app.js, methods.js
```

---

## API Endpoints (same as original)

| Method | URL                   | Description        |
|--------|-----------------------|--------------------|
| GET    | /api/trades           | Get all trades     |
| GET    | /api/trades/stats     | Get statistics     |
| GET    | /api/trades/{id}      | Get single trade   |
| POST   | /api/trades           | Create trade       |
| PUT    | /api/trades/{id}      | Update trade       |
| DELETE | /api/trades/{id}      | Delete trade       |

---

## How to Run

#Backend start:

mvn spring-boot:run 

#Frontend

(cd frontend)
npm run dev
