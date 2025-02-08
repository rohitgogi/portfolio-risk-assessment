from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


# Add CORS middleware (keep your existing configuration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # This allows all methods, including OPTIONS
    allow_headers=["*"],
)

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

    # If there’s only 1 stock, assign it a default risk category
    if len(returns.columns) == 1:
        return np.array([0])  # Default to Low Risk (category 0)

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
    if data.empty:  # Check if stock data is missing
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

