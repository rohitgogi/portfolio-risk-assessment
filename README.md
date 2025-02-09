RiskEdge - AI-Powered Investment Minigame

Introduction

RiskEdge is an AI-powered minigame designed to help beginners understand the risks and potential returns of their investments. In this game, players take on the role of a broker advising clients on stock portfolios based on real market risk metrics. The backend utilizes financial calculations and predictive AI to provide an engaging and educational experience.

Features

Client Profile Generation: Dynamically creates unique clients with different risk preferences and investment goals.

Stock Data Retrieval & Risk Assessment:

Volatility: Measures price fluctuations over time.

Sharpe Ratio: Assesses risk-adjusted returns.

Value at Risk (VaR): Estimates potential loss.

Predictive AI for Portfolio Returns: Uses historical stock data to estimate expected returns.

Portfolio Risk Calculation: Computes overall risk based on user allocations and market trends.

Interactive Frontend: Users can search for stocks, allocate funds, and receive real-time feedback on their portfolio choices.

Tech Stack

Frontend

React (Next.js) + Tailwind CSS

Dynamic UI elements including:

Search bar with intelligent stock suggestions.

Interactive stock allocation components.

Risk visualization charts.

Backend

FastAPI (Python) for API handling

Machine Learning Models for Risk Classification (K-Means Clustering)

Financial Data Processing (NumPy, pandas, yfinance)

Portfolio Analysis Metrics (Sharpe Ratio, Volatility, Variance-Covariance Matrix)

Installation & Setup

Prerequisites

Node.js (for frontend)

Python (for backend)

Setup Backend

Clone the repository:

git clone https://github.com/your-repo/RiskEdge.git
cd RiskEdge/backend

Create a virtual environment:

python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

Install dependencies:

pip install -r requirements.txt

Run the backend server:

uvicorn main:app --reload

Setup Frontend

Navigate to the frontend folder:

cd ../frontend

Install dependencies:

npm install

Start the frontend server:

npm run dev

Usage

Open the frontend in a browser (http://localhost:3000).

Choose a difficulty level and investment duration.

Get assigned a client and analyze their profile.

Search for stocks and allocate funds based on the client’s needs.

Confirm your portfolio and review the results.

Learn from feedback and improve your next strategy!

API Endpoints

Method

Endpoint

Description

GET

/generate_client/{difficulty}/{time_span}

Generates a unique client profile

GET

/stock_prices

Retrieves stock prices and risk metrics

POST

/analyze_portfolio

Evaluates portfolio risk and expected returns

Future Improvements

Real-time stock price integration

More sophisticated AI for portfolio optimization

Enhanced visual analytics

License

MIT License

Contact

For any inquiries or contributions, feel free to reach out!

This README provides an overview of RiskEdge, its functionality, and how to set it up and use it.

