import os
import random
from dotenv import load_dotenv
import groq

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize Groq client
client = groq.Client(api_key=GROQ_API_KEY)

NAMES = ["Janardhan Patel", "Keerthi Gupta", "Suresh Kumar", "Ananya Singh", "Rahul Sharma", "Priya Reddy", "Amit Verma", "Neha Iyer", "Rajesh Khanna", "Sneha Menon"]
AGES = list(range(20, 65))

import json

import json
import re

def generate_client(difficulty: str, time_span: int):
    """Generate a unique client profile using Groq's LLM API"""

    prompt = f"""
    You are a financial AI that creates unique client profiles based on difficulty and investment duration.

    **Return the response as pure JSON ONLY. Do NOT include Markdown formatting, explanations, or extra text.**

    Example format:
    {{
        "client": {{
            "name": "Priya Reddy",
            "age": 34,
            "investment_goal": "Saving for her children's education",
            "investment_amount": 20000,
            "risk_tolerance": "medium",
            "personal_story": "Priya Reddy is a 34-year-old mother of two young children. She works as a software engineer..."
        }}
    }}
    """

    try:
        response = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.8
        )

        # 🔍 Debugging: Print API response
        raw_text = response.choices[0].message.content.strip()
        print("🚀 Raw API Response:", raw_text)  # Debugging Step ✅

        # Remove any Markdown JSON formatting (```json ... ```)
        cleaned_text = re.sub(r"```json\n(.*?)\n```", r"\1", raw_text, flags=re.DOTALL).strip()

        # Ensure response is valid JSON
        try:
            client_data = json.loads(cleaned_text)
        except json.JSONDecodeError:
            return {"error": "Invalid JSON format received from Groq API", "response": cleaned_text}

        # Ensure client key exists in JSON
        if "client" not in client_data:
            return {"error": "Missing 'client' key in response", "response": cleaned_text}

        return client_data["client"]

    except Exception as e:
        return {"error": f"Groq API Error: {str(e)}"}
