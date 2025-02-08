import yfinance as yf
import pandas as pd
import numpy as np

def fetch_stock_data(ticker, period="1y"):
    stock = yf.Ticker(ticker)
    hist = stock.history(period=period)
    return hist

def calculate_daily_returns(data):
    return data['Close'].pct_change().dropna() # pct change is percent change between current value and previous (current - previous)/previous

def calculate_volatility(returns):
    return returns.std() * np.sqrt(252)  # daily returns standard deviation multiplied by 252 trading days in a year

def calculate_sharpe_ratio(returns, risk_free_rate=0.01): # risk_free_rate is the % return we expect on even risky investments
    volatility = calculate_volatility(returns)
    annual_return = returns.mean() * 252  # gets the annualized return by taking the average of the daily returns
    return (annual_return - risk_free_rate) / volatility

def analyze_stock(ticker):
    data = fetch_stock_data(ticker)
    returns = calculate_daily_returns(data)
    volatility = calculate_volatility(returns)
    sharpe_ratio = calculate_sharpe_ratio(returns)
    
    return {
        "ticker": ticker,
        "volatility": volatility,
        "sharpe_ratio": sharpe_ratio,
        "current_price": data['Close'].iloc[-1]
    }
