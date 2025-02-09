import os
import random
import json
import re
from dotenv import load_dotenv
import groq  # Make sure groq is installed in your environment
from fastapi import FastAPI, Query

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize Groq client
client = groq.Client(api_key=GROQ_API_KEY)

# Define static values for each difficulty level
STATIC_VALUES = {
    "easy": {
         "investment_amount": 50000,
         "investment_goal": "70000"
    },
    "medium": {
         "investment_amount": 75000,
         "investment_goal": "120000"
    },
    "hard": {
         "investment_amount": 90000,
         "investment_goal": "150000"
    }
}

def generate_client(difficulty: str, time_span: int):
    """
    Generates a client profile using Groq's AI for the fun parts (like personal_story)
    while overriding the numerical values with static ones based on the chosen difficulty.
    """
    # Pick a random name and age for some fun variability
    name = random.choice([
        "Janardhan Patel", "Keerthi Aluri", "Suresh Kumar", "Ananya Singh",
        "Rahul Sharma", "Priya Reddy", "Amit Verma", "Neha Iyer",
        "Rajesh Khanna", "Sneha Menon"
    ])
    age = random.randint(20, 65)
    
    # Create a prompt for the AI that asks for a fun personal story
    prompt = f"""
    You are a financial AI that creates unique client profiles. Given the following details:
    Name: {name}
    Age: {age}
    Difficulty: {difficulty}
    Investment Time Span: {time_span} months

    Create a detailed personal story that is funny and interesting, and includes:
    - The client's background and occupation
    - Their financial goals and motivations
    - How the investment time span relates to their objectives
    - Any challenges or opportunities they face

    **Return the response as a valid JSON object in the following format:**
    {{
        "client": {{
            "name": "{name}",
            "age": {age},
            "investment_goal": "{STATIC_VALUES[difficulty.lower()]['investment_goal']}",
            "investment_amount": {STATIC_VALUES[difficulty.lower()]['investment_amount']},
            "risk_tolerance": "TBD",
            "personal_story": "..." (limit to 100 words)
        }}
    }}
    """
    try:
        response = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.7
        )

        raw_text = response.choices[0].message.content.strip()
        # Use regex to extract only the JSON part from the response
        json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if json_match:
            json_text = json_match.group(0)
        else:
            return {"error": "No valid JSON detected in response", "response": raw_text}
        try:
            client_data = json.loads(json_text)
        except json.JSONDecodeError:
            return {"error": "Invalid JSON format received from Groq API", "response": json_text}
        if "client" not in client_data:
            return {"error": "Missing 'client' key in response", "response": client_data}
        
        # Override the AI-generated numerical values with static values
        difficulty_lower = difficulty.lower()
        static_info = STATIC_VALUES.get(difficulty_lower, STATIC_VALUES["easy"])
        client_data["client"]["investment_amount"] = static_info["investment_amount"]
        client_data["client"]["investment_goal"] = static_info["investment_goal"]
        
        # Optionally set risk tolerance based on difficulty
        if difficulty_lower == "easy":
            client_data["client"]["risk_tolerance"] = "low"
        elif difficulty_lower == "medium":
            client_data["client"]["risk_tolerance"] = "medium"
        elif difficulty_lower == "hard":
            client_data["client"]["risk_tolerance"] = "high"
        else:
            client_data["client"]["risk_tolerance"] = "low"
        
        return client_data["client"]

    except Exception as e:
        return {"error": f"Groq API Error: {str(e)}"}

app = FastAPI()

@app.get("/api/generate-client")
def get_client(difficulty: str = Query("easy"), time_span: int = Query(12)):
    """
    Endpoint to generate a client profile.
    The numerical values (investment_amount and investment_goal) are static,
    but the personal story and other fun details are generated dynamically.
    """
    client_profile = generate_client(difficulty, time_span)
    return client_profile
