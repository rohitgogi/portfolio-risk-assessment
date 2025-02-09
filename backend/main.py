from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler
from game_logic import generate_client  # Import AI-powered function

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =================== AI-POWERED CLIENT GENERATION ===================

@app.get("/generate_client/{difficulty}/{time_span}")
async def get_client(difficulty: str, time_span: int):
    client_profile = generate_client(difficulty, time_span)
    return client_profile  # ✅ Now returns JSON properly

# =================== STOCK ANALYSIS & RISK ASSESSMENT ===================

class StockRequest(BaseModel):
    tickers: list[str]

def fetch_multiple_stocks(tickers, period="1y"):
    """Fetch historical stock data."""
    data = {}
    for ticker in tickers:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        if not hist.empty:
            data[ticker] = hist['Close']
    return pd.DataFrame(data)

def preprocess_data(data):
    """Calculate stock returns."""
    returns = data.pct_change().dropna()
    return returns

def classify_stocks(returns, n_clusters=3):
    """Cluster stocks based on risk factors."""
    volatilities = returns.std()
    sharpe_ratios = returns.mean() / volatilities
    var_95 = np.percentile(returns, 5, axis=0)

    features = np.column_stack((volatilities, sharpe_ratios, var_95))
    scaler = MinMaxScaler()
    scaled_features = scaler.fit_transform(features)

    if len(returns.columns) == 1:
        return np.array([0])  # Default Low Risk (category 0)

    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    labels = kmeans.fit_predict(scaled_features)

    return labels

def calculate_risk_score(returns, labels):
    """Compute risk score for each stock."""
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
    """Calculate overall portfolio risk."""
    cov_matrix = returns.cov()
    weights = np.array(weights)
    portfolio_variance = np.dot(weights.T, np.dot(cov_matrix, weights))
    return np.sqrt(portfolio_variance)

@app.post("/analyze_portfolio")
async def analyze_portfolio(request: StockRequest):
    """Analyze the risk of a given portfolio."""
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

    weights = [1/len(tickers)] * len(tickers)  # Equal weights
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
