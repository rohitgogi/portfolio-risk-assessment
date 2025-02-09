from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler
from game_logic import generate_client
import time
from stock_analysis import fetch_stock_data, calculate_daily_returns, calculate_volatility, calculate_sharpe_ratio
import random
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend requests from localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Only allow requests from frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Annualized returns (approximate past performance)
ANNUALIZED_RETURNS = {
    "AAPL": 0.18, "MSFT": 0.21, "GOOGL": 0.16, "AMZN": 0.19, "META": 0.23,
    "TSLA": 0.29, "NVDA": 0.30, "JPM": 0.12, "V": 0.14, "JNJ": 0.10,
    "NFLX": 0.17, "PYPL": 0.15, "DIS": 0.08, "KO": 0.07, "PEP": 0.09,
    "MCD": 0.12, "INTC": 0.05, "IBM": 0.04, "CSCO": 0.06, "ORCL": 0.10,
    "QCOM": 0.11, "BA": 0.09, "GE": 0.08, "XOM": 0.12, "CVX": 0.11,
    "PFE": 0.10, "MRNA": 0.18, "GILD": 0.09, "ABT": 0.11, "T": 0.04,
    "VZ": 0.05, "NKE": 0.13, "ADBE": 0.20, "CRM": 0.19, "WMT": 0.07,
    "TGT": 0.08, "LOW": 0.12, "HD": 0.13, "GS": 0.11, "MS": 0.12,
    "C": 0.08, "BAC": 0.10, "PLTR": 0.22, "AMD": 0.25, "SHOP": 0.24,
    "SNAP": 0.16, "ROKU": 0.20, "DDOG": 0.18, "SQ": 0.19, "TWLO": 0.17,
    "DOCU": 0.12, "ZM": 0.14, "PANW": 0.22, "NET": 0.20, "MDB": 0.23,
    "CRWD": 0.21, "ZS": 0.19, "F": 0.07, "GM": 0.08, "UBER": 0.15,
    "LYFT": 0.12, "RBLX": 0.18, "COIN": 0.25, "SOFI": 0.22, "DKNG": 0.20,
    "PTON": 0.10, "BABA": 0.09, "TCEHY": 0.10, "NIO": 0.21, "XPEV": 0.20,
    "LI": 0.19, "JD": 0.11, "BIDU": 0.10, "BYND": 0.07, "RIVN": 0.18,
    "LCID": 0.17, "FSLY": 0.14, "W": 0.13, "DASH": 0.15, "GME": 0.12,
    "AMC": 0.09, "BBBY": 0.06, "SPCE": 0.14, "ARKK": 0.19, "SPY": 0.08,
    "QQQ": 0.10, "DIA": 0.07, "IWM": 0.11, "VTI": 0.09, "ARKG": 0.17,
    "ARKF": 0.18, "BITO": 0.23
}


@app.get("/generate_client/{difficulty}/{time_span}")
async def get_client(difficulty: str, time_span: int):
    client_profile = generate_client(difficulty, time_span)
    return client_profile

class StockRequest(BaseModel):
    tickers: list[str]

def fetch_multiple_stocks(tickers, period="1y"):
    data = {}
    for ticker in tickers:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        if not hist.empty:
            data[ticker] = hist['Close']
    return pd.DataFrame(data)

def preprocess_data(data):
    returns = data.pct_change().dropna()
    return returns

def classify_stocks(returns, n_clusters=3):
    volatilities = returns.std()
    sharpe_ratios = returns.mean() / volatilities
    var_95 = np.percentile(returns, 5, axis=0)

    features = np.column_stack((volatilities, sharpe_ratios, var_95))
    scaler = MinMaxScaler()
    scaled_features = scaler.fit_transform(features)

    if len(returns.columns) == 1:
        return np.array([0])

    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    labels = kmeans.fit_predict(scaled_features)

    return labels

def calculate_risk_score(returns, labels):
    volatilities = returns.std()
    sharpe_ratios = returns.mean() / volatilities
    var_95 = np.percentile(returns, 5)

    scaler = MinMaxScaler(feature_range=(0, 100))
    normalized_volatility = scaler.fit_transform(volatilities.values.reshape(-1, 1)).flatten()
    normalized_sharpe = scaler.fit_transform(sharpe_ratios.values.reshape(-1, 1)).flatten()
    normalized_var = scaler.fit_transform(var_95.reshape(-1, 1)).flatten()

    risk_scores = (normalized_volatility * 0.5) - (normalized_sharpe * 0.3) + (normalized_var * 0.2) + (labels * 10)
    
    return risk_scores

def calculate_portfolio_risk(returns, weights):
    cov_matrix = returns.cov()
    weights = np.array(weights)
    portfolio_variance = np.dot(weights.T, np.dot(cov_matrix, weights))
    return np.sqrt(portfolio_variance)

@app.post("/analyze_portfolio")
async def analyze_portfolio(request: StockRequest):
    tickers = request.tickers
    if len(tickers) < 3:
        return {"error": "Please enter at least 3 stock tickers for clustering."}

    data = fetch_multiple_stocks(tickers)
    if data.empty:
        return {"error": "No stock data found for the provided tickers."}

    returns = preprocess_data(data)
    if returns.empty:
        return {"error": "Insufficient stock data to compute risk."}

    labels = classify_stocks(returns)
    risk_scores = calculate_risk_score(returns, labels)

    weights = [1/len(tickers)] * len(tickers)
    portfolio_risk = calculate_portfolio_risk(returns, weights)

    results = []
    for ticker, label, risk_score in zip(tickers, labels, risk_scores):
        results.append({
            "ticker": ticker,
            "risk_category": int(label),
            "risk_score": float(risk_score)
        })

    return {
        "stocks": results,
        "portfolio_risk": float(portfolio_risk)
    }

STOCK_PRICES = {
    "AAPL": { "name": "Apple Inc.", "price": 227.63, "risk": "medium" },
    "MSFT": { "name": "Microsoft Corp.", "price": 409.75, "risk": "medium" },
    "GOOGL": { "name": "Alphabet Inc.", "price": 185.34, "risk": "medium" },
    "AMZN": { "name": "Amazon.com Inc.", "price": 229.15, "risk": "medium" },
    "META": { "name": "Meta Platforms Inc.", "price": 714.52, "risk": "medium" },
    "TSLA": { "name": "Tesla Inc.", "price": 361.62, "risk": "medium" },
    "NVDA": { "name": "NVIDIA Corp.", "price": 129.84, "risk": "medium" },
    "JPM": { "name": "JP Morgan Chase & Co.", "price": 275.80, "risk": "medium" },
    "V": { "name": "Visa Inc.", "price": 348.02, "risk": "medium" },
    "JNJ": { "name": "Johnson & Johnson", "price": 153.12, "risk": "medium" },
    "NFLX": { "name": "Netflix Inc.", "price": 1013.93, "risk": "medium" },
    "PYPL": { "name": "PayPal Holdings Inc.", "price": 77.31, "risk": "medium" },
    "DIS": { "name": "Walt Disney Co.", "price": 110.86, "risk": "medium" },
    "KO": { "name": "Coca-Cola Co.", "price": 63.84, "risk": "medium" },
    "PEP": { "name": "PepsiCo Inc.", "price": 144.58, "risk": "medium" },
    "MCD": { "name": "McDonald's Corp.", "price": 294.30, "risk": "medium" },
    "INTC": { "name": "Intel Corp.", "price": 19.10, "risk": "medium" },
    "IBM": { "name": "IBM Corp.", "price": 252.34, "risk": "medium" },
    "CSCO": { "name": "Cisco Systems Inc.", "price": 62.27, "risk": "medium" },
    "ORCL": { "name": "Oracle Corp.", "price": 174.46, "risk": "medium" },
    "QCOM": { "name": "Qualcomm Inc.", "price": 167.96, "risk": "medium" },
    "BA": { "name": "Boeing Co.", "price": 181.49, "risk": "medium" },
    "GE": { "name": "General Electric Co.", "price": 205.28, "risk": "medium" },
    "XOM": { "name": "Exxon Mobil Corp.", "price": 108.89, "risk": "medium" },
    "CVX": { "name": "Chevron Corp.", "price": 152.62, "risk": "medium" },
    "PFE": { "name": "Pfizer Inc.", "price": 25.74, "risk": "medium" },
    "MRNA": { "name": "Moderna Inc.", "price": 32.60, "risk": "medium" },
    "GILD": { "name": "Gilead Sciences Inc.", "price": 96.04, "risk": "medium" },
    "ABT": { "name": "Abbott Laboratories", "price": 129.07, "risk": "medium" },
    "T": { "name": "AT&T Inc.", "price": 24.54, "risk": "medium" },
    "VZ": { "name": "Verizon Communications Inc.", "price": 39.88, "risk": "medium" },
    "NKE": { "name": "Nike Inc.", "price": 68.68, "risk": "medium" },
    "ADBE": { "name": "Adobe Inc.", "price": 433.07, "risk": "medium" },
    "CRM": { "name": "Salesforce Inc.", "price": 325.83, "risk": "medium" },
    "WMT": { "name": "Walmart Inc.", "price": 101.15, "risk": "medium" },
    "TGT": { "name": "Target Corp.", "price": 131.35, "risk": "medium" }
}

@app.get("/stock_prices")
async def get_stock_prices():
    return STOCK_PRICES

class PortfolioResultRequest(BaseModel):
    tickers: list[str]
    weights: list[float]  # Percentage allocation per stock
    initial_amount: float
    goal_amount: float
    time_span: int  # Simulation time in months

@app.post("/get_result")
async def get_result(request: PortfolioResultRequest):
    tickers = request.tickers
    weights = request.weights
    initial_amount = request.initial_amount
    goal_amount = request.goal_amount
    time_span = request.time_span

    if len(tickers) < 3 or len(weights) != len(tickers):
        return {"error": "Invalid input: Ensure at least 3 stocks and correct weights."}

    # Fetch stock data
    data = fetch_multiple_stocks(tickers, period=f"{time_span}mo")
    if data.empty:
        return {"error": "No stock data available for simulation."}

    returns = preprocess_data(data)
    portfolio_risk = calculate_portfolio_risk(returns, weights)
    
    # Calculate final portfolio value (assume simple compounding returns)
    final_returns = (returns.mean() * (time_span / 12))  # Annualized return converted to given time span
    portfolio_growth = np.dot(weights, final_returns) * initial_amount
    final_value = initial_amount + portfolio_growth

    # Compute risk metrics
    sharpe_ratio = calculate_sharpe_ratio(returns)
    volatility = calculate_volatility(returns)
    
    sharpe_ratio = np.mean(sharpe_ratio)  # Take mean if it's a Series
    volatility = np.mean(volatility)      # Take mean if it's a Series

    # Ensure they are scalars, not Series
    sharpe_ratio = float(sharpe_ratio)
    volatility = float(volatility)

    # **Determine Outcome**
    if final_value >= goal_amount or (sharpe_ratio > 1.5 and volatility < 0.2):
        message = random.choice([
            "🚀 You won! Quit your day job and become a full-time trader!",
            "💰 Genius move! You're on track to be the next Warren Buffett!",
            "📈 Congrats! The stock gods are smiling upon you."
        ])
        status = "Win"
    else:
        message = random.choice([
            "📉 You lost! Maybe stick to index funds, champ.",
            "💸 Oof, that was rough. Consider a new career path.",
            "🤡 You just outperformed 2008. Time to reflect."
        ])
        status = "Loss"

    return {
        "final_value": round(final_value, 2),
        "goal_amount": goal_amount,
        "sharpe_ratio": round(sharpe_ratio, 2),
        "volatility": round(volatility, 2),
        "status": status,
        "message": message
    }

def get_annualized_return(ticker: str):
    """
    Returns the hardcoded annualized return for the given stock ticker.
    If the stock is not in our predefined list, defaults to 10% (0.10).
    """
    return ANNUALIZED_RETURNS.get(ticker, 0.10)  # Default 10% return if not found
