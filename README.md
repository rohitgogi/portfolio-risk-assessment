# RiskEdge - AI-Powered Trading Risk Assessment Minigame

## 🏦 Overview
**RiskEdge** is an AI-powered minigame designed to help beginners in trading understand investment risks and potential returns. Players take on the role of a **broker**, advising clients on stock portfolios based on real market risk metrics. The game simulates a real-world investment experience, providing insights into risk assessment and portfolio optimization.

## 🎮 How It Works
1. **Customize Game Settings:** Choose a difficulty level and investment duration.
2. **Find a Client:** The AI generates a client with an investment goal, risk tolerance, and a personal backstory for engagement.
3. **Select Stocks & Allocate Funds:** Choose stocks and decide how much to allocate based on real-time stock data.
4. **AI Risk Analysis:** The backend assesses portfolio risk using financial metrics such as **Sharpe Ratio, Volatility, and Value at Risk (VaR)**.
5. **View Results & Feedback:** See final returns, risk level, and receive tips to optimize future investment strategies.

## 🛠️ Tech Stack
### **Frontend (React + Next.js)**
- **Next.js** – Server-side rendering & optimized performance.
- **Tailwind CSS** – Modern, responsive UI.
- **Recharts** – Data visualization for portfolio insights.
- **Aceternity UI** – Clean and modern UI components.

### **Backend (FastAPI)**
- **FastAPI** – Handles API requests for stock data, risk calculations, and client generation.
- **Yahoo Finance API (`yfinance`)** – Fetches real-time stock prices.
- **Scikit-learn** – Used for **K-Means Clustering** to categorize stocks into risk levels.
- **NumPy & Pandas** – For data preprocessing and risk calculations.

### **AI-Powered Features**
- **Dynamic Client Generation:** AI creates unique client profiles based on difficulty and investment timeline.
- **Risk Classification:** Uses **K-Means Clustering** to classify stocks into **low, medium, and high-risk categories**.
- **Portfolio Risk Analysis:** Evaluates risk using:
  - **Volatility** – Measures price fluctuations.
  - **Sharpe Ratio** – Assesses risk-adjusted returns.
  - **Value at Risk (VaR)** – Estimates potential losses in extreme cases.
