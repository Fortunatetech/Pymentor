"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CodePlayground } from "@/components/editor/code-playground";
import { useSubscription } from "@/hooks";

interface ProjectStep {
  title: string;
  instruction: string;
  starterCode: string;
  hint: string;
  expectedOutput?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  xpReward: number;
  concepts: string[];
  isFree: boolean;
  steps: ProjectStep[];
}

const projects: Record<string, Project> = {
  "1": {
    id: "1",
    title: "Number Guessing Game",
    description:
      "Build a fun game where the computer picks a random number and you try to guess it with hints!",
    difficulty: "beginner",
    estimatedTime: "30 min",
    xpReward: 50,
    isFree: true,
    concepts: ["variables", "if-statements", "while-loops", "input", "random"],
    steps: [
      {
        title: "Set Up the Game",
        instruction:
          "First, let's import the random module and generate a secret number between 1 and 100.",
        starterCode: `# Step 1: Import random and generate secret number
import random

# Generate a random number between 1 and 100
secret_number = random.randint(1, 100)

print("I'm thinking of a number between 1 and 100!")
print(f"(Psst, for testing, the number is {secret_number})")`,
        hint: "random.randint(a, b) returns a random integer between a and b (inclusive).",
      },
      {
        title: "Get User's Guess",
        instruction:
          "Now let's ask the user for their guess and convert it to an integer.",
        starterCode: `import random
secret_number = random.randint(1, 100)
print("I'm thinking of a number between 1 and 100!")

# Step 2: Get the user's guess
# In the browser, we'll simulate input with a variable
guess = 42
print(f"You guessed: {guess}")`,
        hint: "input() returns a string, so we need int() to convert it to a number.",
      },
      {
        title: "Check the Guess",
        instruction:
          "Add logic to check if the guess is too high, too low, or correct.",
        starterCode: `import random
secret_number = 42  # Fixed for testing
print("I'm thinking of a number between 1 and 100!")

guess = 42

# Step 3: Check if guess is correct, too high, or too low
if guess == secret_number:
    print("Congratulations! You got it!")
elif guess < secret_number:
    print("Too low! Try higher.")
else:
    print("Too high! Try lower.")`,
        hint: "Use if/elif/else to check the three possible cases.",
      },
      {
        title: "Add a Loop",
        instruction:
          "Let the player keep guessing until they get it right. Count their attempts!",
        starterCode: `import random
secret_number = 42  # Fixed for testing
print("I'm thinking of a number between 1 and 100!")

attempts = 0
guesses = [30, 50, 42]  # Simulated guesses

# Step 4: Loop through guesses
for guess in guesses:
    attempts += 1
    print(f"Guess #{attempts}: {guess}")

    if guess == secret_number:
        print(f"Congratulations! You got it in {attempts} attempts!")
        break
    elif guess < secret_number:
        print("Too low! Try higher.")
    else:
        print("Too high! Try lower.")`,
        hint: "Use 'while True' with 'break' to exit when they win.",
      },
      {
        title: "Final Challenge",
        instruction:
          "Add a maximum of 7 attempts. If they run out, reveal the number!",
        starterCode: `import random
secret_number = 42  # Fixed for testing
max_attempts = 7
attempts = 0

print(f"I'm thinking of a number between 1 and 100!")
print(f"You have {max_attempts} attempts. Good luck!\\n")

# Your challenge: Complete the game!
# - Track attempts
# - End game if attempts >= max_attempts
# - Show remaining attempts each turn

guesses = [20, 35, 45, 40, 42]  # Simulated guesses

for guess in guesses:
    attempts += 1
    remaining = max_attempts - attempts
    print(f"Guess #{attempts}: {guess} ({remaining} left)")

    if guess == secret_number:
        print(f"You got it in {attempts} attempts!")
        break
    elif attempts >= max_attempts:
        print(f"Out of attempts! The number was {secret_number}")
        break
    elif guess < secret_number:
        print("Too low!")
    else:
        print("Too high!")
`,
        hint: "Add a condition to check if attempts >= max_attempts before asking for a new guess.",
      },
    ],
  },
  "2": {
    id: "2",
    title: "To-Do List App",
    description:
      "Create a command-line to-do list where you can add, view, and remove tasks.",
    difficulty: "beginner",
    estimatedTime: "45 min",
    xpReward: 75,
    isFree: true,
    concepts: ["lists", "functions", "loops"],
    steps: [
      {
        title: "Create the Task List",
        instruction:
          "Start by creating an empty list to store tasks and a function to display them.",
        starterCode: `# Step 1: Create a list and display function
tasks = []

def show_tasks():
    if not tasks:
        print("No tasks yet!")
    else:
        print("Your Tasks:")
        for i, task in enumerate(tasks, 1):
            print(f"  {i}. {task}")

# Test it
show_tasks()
tasks.append("Learn Python")
tasks.append("Build projects")
show_tasks()`,
        hint: "enumerate(list, 1) starts counting from 1 instead of 0.",
      },
      {
        title: "Add Tasks Function",
        instruction: "Create a function to add new tasks to the list.",
        starterCode: `tasks = []

def show_tasks():
    if not tasks:
        print("No tasks yet!")
    else:
        print("Your Tasks:")
        for i, task in enumerate(tasks, 1):
            print(f"  {i}. {task}")

# Step 2: Add task function
def add_task(task_name):
    tasks.append(task_name)
    print(f"Added: {task_name}")

# Test
add_task("Learn Python")
add_task("Build a project")
add_task("Practice daily")
show_tasks()`,
        hint: "Use a parameter to accept the task name, then append() to add it.",
      },
      {
        title: "Remove Tasks",
        instruction: "Create a function to remove tasks by their number.",
        starterCode: `tasks = ["Learn Python", "Build projects", "Get job"]

def show_tasks():
    if not tasks:
        print("No tasks yet!")
    else:
        print("Your Tasks:")
        for i, task in enumerate(tasks, 1):
            status = "done" if isinstance(task, dict) and task.get("done") else "pending"
            name = task if isinstance(task, str) else task["name"]
            print(f"  {i}. [{status}] {name}")

# Step 3: Remove task function
def remove_task(num):
    if 1 <= num <= len(tasks):
        removed = tasks.pop(num - 1)
        print(f"Removed: {removed}")
    else:
        print("Invalid number!")

# Test
show_tasks()
remove_task(2)
show_tasks()`,
        hint: "Use pop(index) to remove by position. Remember lists are 0-indexed!",
      },
      {
        title: "Complete the App",
        instruction:
          "Put it all together with add, remove, view, and mark-as-done functionality.",
        starterCode: `tasks = []

def add_task(name):
    tasks.append({"name": name, "done": False})
    print(f"Added: {name}")

def show_tasks():
    if not tasks:
        print("No tasks yet!")
        return
    print("\\nYour Tasks:")
    for i, task in enumerate(tasks, 1):
        status = "[x]" if task["done"] else "[ ]"
        print(f"  {i}. {status} {task['name']}")

def complete_task(num):
    if 1 <= num <= len(tasks):
        tasks[num - 1]["done"] = True
        print(f"Completed: {tasks[num - 1]['name']}")
    else:
        print("Invalid number!")

def remove_task(num):
    if 1 <= num <= len(tasks):
        removed = tasks.pop(num - 1)
        print(f"Removed: {removed['name']}")
    else:
        print("Invalid number!")

# Test the complete app
add_task("Learn Python basics")
add_task("Build a project")
add_task("Practice every day")
show_tasks()
complete_task(1)
show_tasks()
remove_task(2)
show_tasks()`,
        hint: "Use a dictionary for each task with 'name' and 'done' keys.",
      },
    ],
  },
  "3": {
    id: "3",
    title: "Password Generator",
    description:
      "Generate strong, random passwords with customizable length and characters.",
    difficulty: "beginner",
    estimatedTime: "30 min",
    xpReward: 50,
    isFree: false,
    concepts: ["strings", "random", "functions"],
    steps: [
      {
        title: "Character Sets",
        instruction:
          "Learn about the different character sets available in Python's string module.",
        starterCode: `import string

# Explore the character sets
print("Letters:", string.ascii_letters[:10], "...")
print("Digits:", string.digits)
print("Punctuation:", string.punctuation)

# Combine them all
all_chars = string.ascii_letters + string.digits + string.punctuation
print(f"\\nTotal characters available: {len(all_chars)}")`,
        hint: "string.ascii_letters includes both uppercase and lowercase letters.",
      },
      {
        title: "Random Selection",
        instruction:
          "Use random.choice() to pick random characters from our character set.",
        starterCode: `import random
import string

all_chars = string.ascii_letters + string.digits + string.punctuation

# Pick 5 random characters
for i in range(5):
    char = random.choice(all_chars)
    print(f"Random char {i+1}: {char}")

# Build a string from random characters
password_chars = [random.choice(all_chars) for _ in range(12)]
password = "".join(password_chars)
print(f"\\nPassword: {password}")`,
        hint: "random.choice(sequence) picks one random element from the sequence.",
      },
      {
        title: "Password Function",
        instruction:
          "Create a reusable function that generates passwords of any length.",
        starterCode: `import random
import string

def generate_password(length=12):
    chars = string.ascii_letters + string.digits + string.punctuation
    password = "".join(random.choice(chars) for _ in range(length))
    return password

# Generate passwords of different lengths
print("8 chars: ", generate_password(8))
print("12 chars:", generate_password(12))
print("20 chars:", generate_password(20))`,
        hint: "Use a default parameter value so length is optional.",
      },
      {
        title: "Advanced Generator",
        instruction:
          "Add options to include/exclude character types and generate multiple passwords.",
        starterCode: `import random
import string

def generate_password(length=12, use_upper=True, use_lower=True, use_digits=True, use_symbols=True):
    chars = ""
    if use_upper:
        chars += string.ascii_uppercase
    if use_lower:
        chars += string.ascii_lowercase
    if use_digits:
        chars += string.digits
    if use_symbols:
        chars += string.punctuation

    if not chars:
        return "Error: Select at least one character type!"

    password = "".join(random.choice(chars) for _ in range(length))
    return password

# Test different configurations
print("Full:", generate_password(16))
print("No symbols:", generate_password(16, use_symbols=False))
print("Numbers only:", generate_password(8, use_upper=False, use_lower=False, use_symbols=False))
print("Letters only:", generate_password(12, use_digits=False, use_symbols=False))

# Generate 5 passwords
print("\\nBatch generation:")
for i in range(5):
    print(f"  {i+1}. {generate_password(14)}")`,
        hint: "Use boolean parameters with default values of True for each character type.",
      },
    ],
  },
  "4": {
    id: "4",
    title: "Quiz Game",
    description:
      "Build a multiple-choice quiz game with scoring and feedback.",
    difficulty: "intermediate",
    estimatedTime: "1 hour",
    xpReward: 100,
    isFree: false,
    concepts: ["dictionaries", "functions", "loops"],
    steps: [
      {
        title: "Question Data",
        instruction:
          "Create a structured data format for quiz questions using dictionaries.",
        starterCode: `# Step 1: Define questions as a list of dictionaries
questions = [
    {
        "question": "What is the output of print(2 ** 3)?",
        "options": ["6", "8", "9", "5"],
        "answer": "8"
    },
    {
        "question": "Which keyword defines a function in Python?",
        "options": ["func", "define", "def", "function"],
        "answer": "def"
    },
    {
        "question": "What data type is the result of: 10 / 3?",
        "options": ["int", "float", "str", "bool"],
        "answer": "float"
    }
]

print(f"Quiz has {len(questions)} questions")
print(f"First question: {questions[0]['question']}")`,
        hint: "Each question is a dictionary with 'question', 'options', and 'answer' keys.",
      },
      {
        title: "Display Questions",
        instruction:
          "Create a function to display a question with numbered options.",
        starterCode: `questions = [
    {
        "question": "What is the output of print(2 ** 3)?",
        "options": ["6", "8", "9", "5"],
        "answer": "8"
    },
    {
        "question": "Which keyword defines a function in Python?",
        "options": ["func", "define", "def", "function"],
        "answer": "def"
    },
]

def display_question(q, number):
    print(f"\\nQuestion {number}: {q['question']}")
    for i, option in enumerate(q['options'], 1):
        print(f"  {i}. {option}")

# Display all questions
for i, q in enumerate(questions, 1):
    display_question(q, i)`,
        hint: "Use enumerate() to add numbers to the options.",
      },
      {
        title: "Check Answers",
        instruction:
          "Add answer checking logic and score tracking.",
        starterCode: `questions = [
    {"question": "What is 2 ** 3?", "options": ["6", "8", "9", "5"], "answer": "8"},
    {"question": "Which keyword defines a function?", "options": ["func", "define", "def", "function"], "answer": "def"},
    {"question": "What type is 10 / 3?", "options": ["int", "float", "str", "bool"], "answer": "float"},
]

def check_answer(question, user_answer_index):
    """Check if the user's answer is correct"""
    correct_answer = question["answer"]
    user_answer = question["options"][user_answer_index]

    if user_answer == correct_answer:
        print(f"  Correct!")
        return True
    else:
        print(f"  Wrong! The answer was: {correct_answer}")
        return False

# Simulate a quiz with pre-set answers
answers = [1, 2, 1]  # indices (0-based): "8", "def", "float"
score = 0

for i, q in enumerate(questions):
    print(f"\\nQ{i+1}: {q['question']}")
    if check_answer(q, answers[i]):
        score += 1

print(f"\\nFinal Score: {score}/{len(questions)} ({score/len(questions)*100:.0f}%)") `,
        hint: "Compare the user's selected option against the correct answer string.",
      },
      {
        title: "Complete Quiz Game",
        instruction:
          "Put it all together with a full quiz flow, scoring, and results summary.",
        starterCode: `questions = [
    {"question": "What is 2 ** 3?", "options": ["6", "8", "9", "5"], "answer": "8"},
    {"question": "Which keyword defines a function?", "options": ["func", "define", "def", "function"], "answer": "def"},
    {"question": "What type is 10 / 3?", "options": ["int", "float", "str", "bool"], "answer": "float"},
    {"question": "What does len([1,2,3]) return?", "options": ["1", "2", "3", "4"], "answer": "3"},
    {"question": "Which is a mutable data type?", "options": ["tuple", "str", "list", "int"], "answer": "list"},
]

def run_quiz(questions):
    score = 0
    results = []

    print("=== PYTHON QUIZ ===")
    print(f"{len(questions)} questions\\n")

    # Simulated answers for browser execution
    simulated_answers = [1, 2, 1, 2, 2]

    for i, q in enumerate(questions):
        print(f"Q{i+1}: {q['question']}")
        for j, opt in enumerate(q['options'], 1):
            print(f"  {j}. {opt}")

        answer_idx = simulated_answers[i]
        user_answer = q['options'][answer_idx]
        correct = user_answer == q['answer']

        if correct:
            score += 1
            print(f"  >> {user_answer} - Correct!")
        else:
            print(f"  >> {user_answer} - Wrong! Answer: {q['answer']}")

        results.append({"question": q['question'], "correct": correct})

    # Summary
    pct = (score / len(questions)) * 100
    print(f"\\n=== RESULTS ===")
    print(f"Score: {score}/{len(questions)} ({pct:.0f}%)")

    if pct == 100:
        print("Perfect score!")
    elif pct >= 80:
        print("Great job!")
    elif pct >= 60:
        print("Good effort, keep practicing!")
    else:
        print("Keep studying, you'll get there!")

run_quiz(questions)`,
        hint: "Calculate the percentage score and give feedback based on ranges.",
      },
    ],
  },
  "5": {
    id: "5",
    title: "Weather Dashboard",
    description:
      "Process weather data and display formatted summaries and statistics.",
    difficulty: "intermediate",
    estimatedTime: "1.5 hours",
    xpReward: 100,
    isFree: false,
    concepts: ["APIs", "JSON", "functions"],
    steps: [
      {
        title: "Weather Data",
        instruction:
          "Create a sample weather dataset using a list of dictionaries.",
        starterCode: `# Step 1: Define weather data
weather_data = [
    {"day": "Monday", "temp": 72, "humidity": 45, "condition": "Sunny"},
    {"day": "Tuesday", "temp": 68, "humidity": 60, "condition": "Cloudy"},
    {"day": "Wednesday", "temp": 75, "humidity": 55, "condition": "Sunny"},
    {"day": "Thursday", "temp": 65, "humidity": 70, "condition": "Rainy"},
    {"day": "Friday", "temp": 70, "humidity": 50, "condition": "Partly Cloudy"},
    {"day": "Saturday", "temp": 78, "humidity": 40, "condition": "Sunny"},
    {"day": "Sunday", "temp": 73, "humidity": 48, "condition": "Cloudy"},
]

# Display raw data
for day in weather_data:
    print(f"{day['day']}: {day['temp']}F, {day['humidity']}% humidity, {day['condition']}")`,
        hint: "Each day is a dictionary with keys for temperature, humidity, and condition.",
      },
      {
        title: "Temperature Statistics",
        instruction:
          "Calculate average, min, and max temperatures from the data.",
        starterCode: `weather_data = [
    {"day": "Monday", "temp": 72, "humidity": 45, "condition": "Sunny"},
    {"day": "Tuesday", "temp": 68, "humidity": 60, "condition": "Cloudy"},
    {"day": "Wednesday", "temp": 75, "humidity": 55, "condition": "Sunny"},
    {"day": "Thursday", "temp": 65, "humidity": 70, "condition": "Rainy"},
    {"day": "Friday", "temp": 70, "humidity": 50, "condition": "Partly Cloudy"},
    {"day": "Saturday", "temp": 78, "humidity": 40, "condition": "Sunny"},
    {"day": "Sunday", "temp": 73, "humidity": 48, "condition": "Cloudy"},
]

# Step 2: Calculate statistics
temps = [d["temp"] for d in weather_data]
avg_temp = sum(temps) / len(temps)
min_temp = min(temps)
max_temp = max(temps)

min_day = next(d["day"] for d in weather_data if d["temp"] == min_temp)
max_day = next(d["day"] for d in weather_data if d["temp"] == max_temp)

print(f"Average Temperature: {avg_temp:.1f}F")
print(f"Lowest: {min_temp}F ({min_day})")
print(f"Highest: {max_temp}F ({max_day})")`,
        hint: "Use list comprehension to extract temperatures, then min(), max(), and sum()/len().",
      },
      {
        title: "Formatted Dashboard",
        instruction:
          "Create a nicely formatted weather dashboard display.",
        starterCode: `weather_data = [
    {"day": "Monday", "temp": 72, "humidity": 45, "condition": "Sunny"},
    {"day": "Tuesday", "temp": 68, "humidity": 60, "condition": "Cloudy"},
    {"day": "Wednesday", "temp": 75, "humidity": 55, "condition": "Sunny"},
    {"day": "Thursday", "temp": 65, "humidity": 70, "condition": "Rainy"},
    {"day": "Friday", "temp": 70, "humidity": 50, "condition": "Partly Cloudy"},
    {"day": "Saturday", "temp": 78, "humidity": 40, "condition": "Sunny"},
    {"day": "Sunday", "temp": 73, "humidity": 48, "condition": "Cloudy"},
]

def weather_icon(condition):
    icons = {"Sunny": "*", "Cloudy": "~", "Rainy": "#", "Partly Cloudy": "/"}
    return icons.get(condition, "?")

def display_dashboard(data):
    temps = [d["temp"] for d in data]

    print("=" * 45)
    print("        WEEKLY WEATHER DASHBOARD")
    print("=" * 45)

    for d in data:
        icon = weather_icon(d["condition"])
        bar = "|" * (d["temp"] - 60)
        print(f" {d['day']:<12} {icon} {d['temp']}F  {bar}")

    print("-" * 45)
    print(f" Average: {sum(temps)/len(temps):.1f}F")
    print(f" Range:   {min(temps)}F - {max(temps)}F")
    print("=" * 45)

display_dashboard(weather_data)`,
        hint: "Use f-strings with alignment specifiers like :<12 for consistent formatting.",
      },
      {
        title: "Trend Analysis",
        instruction:
          "Add trend analysis to detect whether temperatures are rising or falling.",
        starterCode: `weather_data = [
    {"day": "Monday", "temp": 72, "humidity": 45, "condition": "Sunny"},
    {"day": "Tuesday", "temp": 68, "humidity": 60, "condition": "Cloudy"},
    {"day": "Wednesday", "temp": 75, "humidity": 55, "condition": "Sunny"},
    {"day": "Thursday", "temp": 65, "humidity": 70, "condition": "Rainy"},
    {"day": "Friday", "temp": 70, "humidity": 50, "condition": "Partly Cloudy"},
    {"day": "Saturday", "temp": 78, "humidity": 40, "condition": "Sunny"},
    {"day": "Sunday", "temp": 73, "humidity": 48, "condition": "Cloudy"},
]

def analyze_trends(data):
    temps = [d["temp"] for d in data]

    # Calculate day-to-day changes
    changes = [temps[i+1] - temps[i] for i in range(len(temps)-1)]

    rising = sum(1 for c in changes if c > 0)
    falling = sum(1 for c in changes if c < 0)

    print("Temperature Trends:")
    for i, change in enumerate(changes):
        direction = "^" if change > 0 else "v" if change < 0 else "="
        print(f"  {data[i]['day']} -> {data[i+1]['day']}: {direction} {abs(change)}F")

    if rising > falling:
        print(f"\\nOverall: Warming trend ({rising} rises, {falling} drops)")
    elif falling > rising:
        print(f"\\nOverall: Cooling trend ({falling} drops, {rising} rises)")
    else:
        print(f"\\nOverall: Stable ({rising} rises, {falling} drops)")

    # Humidity analysis
    humids = [d["humidity"] for d in data]
    print(f"\\nHumidity: avg {sum(humids)/len(humids):.0f}%, range {min(humids)}-{max(humids)}%")

analyze_trends(weather_data)`,
        hint: "Compare consecutive temperatures to determine if the trend is rising or falling.",
      },
    ],
  },
  "6": {
    id: "6",
    title: "Expense Tracker",
    description:
      "Track expenses, categorize them, and see spending summaries.",
    difficulty: "intermediate",
    estimatedTime: "2 hours",
    xpReward: 125,
    isFree: false,
    concepts: ["file I/O", "dictionaries", "functions"],
    steps: [
      {
        title: "Expense Data Structure",
        instruction:
          "Set up the data structure to store expenses with amounts, categories, and descriptions.",
        starterCode: `# Step 1: Create expense storage and add function
expenses = []

def add_expense(amount, category, description=""):
    expense = {
        "amount": amount,
        "category": category,
        "description": description,
    }
    expenses.append(expense)
    print(f"Added: \${amount:.2f} - {category} ({description})")

# Add some expenses
add_expense(50.00, "Food", "Groceries")
add_expense(30.00, "Transport", "Gas")
add_expense(15.00, "Food", "Coffee shop")
add_expense(100.00, "Bills", "Electric bill")
add_expense(25.00, "Transport", "Parking")

print(f"\\nTotal expenses recorded: {len(expenses)}")`,
        hint: "Store each expense as a dictionary with 'amount', 'category', and 'description' keys.",
      },
      {
        title: "View & Total",
        instruction:
          "Create functions to view all expenses and calculate the total.",
        starterCode: `expenses = [
    {"amount": 50.00, "category": "Food", "description": "Groceries"},
    {"amount": 30.00, "category": "Transport", "description": "Gas"},
    {"amount": 15.00, "category": "Food", "description": "Coffee shop"},
    {"amount": 100.00, "category": "Bills", "description": "Electric bill"},
    {"amount": 25.00, "category": "Transport", "description": "Parking"},
    {"amount": 60.00, "category": "Entertainment", "description": "Movie tickets"},
]

def view_expenses():
    print("\\n--- All Expenses ---")
    for i, e in enumerate(expenses, 1):
        print(f"  {i}. \${e['amount']:.2f} | {e['category']:<14} | {e['description']}")

def get_total():
    return sum(e["amount"] for e in expenses)

view_expenses()
print(f"\\nTotal: \${get_total():.2f}")`,
        hint: "Use sum() with a generator expression to calculate the total.",
      },
      {
        title: "Category Breakdown",
        instruction:
          "Group expenses by category and show totals with percentages.",
        starterCode: `expenses = [
    {"amount": 50.00, "category": "Food", "description": "Groceries"},
    {"amount": 30.00, "category": "Transport", "description": "Gas"},
    {"amount": 15.00, "category": "Food", "description": "Coffee shop"},
    {"amount": 100.00, "category": "Bills", "description": "Electric bill"},
    {"amount": 25.00, "category": "Transport", "description": "Parking"},
    {"amount": 60.00, "category": "Entertainment", "description": "Movie tickets"},
]

def category_breakdown():
    categories = {}
    for e in expenses:
        cat = e["category"]
        categories[cat] = categories.get(cat, 0) + e["amount"]

    total = sum(e["amount"] for e in expenses)

    print("\\n--- Spending by Category ---")
    for cat, amount in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        pct = (amount / total) * 100
        bar = "#" * int(pct / 5)
        print(f"  {cat:<14} \${amount:>7.2f}  ({pct:>5.1f}%)  {bar}")

    print(f"  {'TOTAL':<14} \${total:>7.2f}")

category_breakdown()`,
        hint: "Use dict.get(key, 0) to safely accumulate totals per category.",
      },
      {
        title: "Full Expense Report",
        instruction:
          "Create a comprehensive expense report with statistics and insights.",
        starterCode: `expenses = [
    {"amount": 50.00, "category": "Food", "description": "Groceries"},
    {"amount": 30.00, "category": "Transport", "description": "Gas"},
    {"amount": 15.00, "category": "Food", "description": "Coffee shop"},
    {"amount": 100.00, "category": "Bills", "description": "Electric bill"},
    {"amount": 25.00, "category": "Transport", "description": "Parking"},
    {"amount": 60.00, "category": "Entertainment", "description": "Movie tickets"},
    {"amount": 12.00, "category": "Food", "description": "Lunch"},
    {"amount": 45.00, "category": "Bills", "description": "Internet"},
]

def expense_report():
    total = sum(e["amount"] for e in expenses)
    amounts = [e["amount"] for e in expenses]

    # Group by category
    categories = {}
    for e in expenses:
        cat = e["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(e)

    print("=" * 50)
    print("          EXPENSE REPORT")
    print("=" * 50)

    # Overview
    print(f"\\n  Total Expenses:  \${total:.2f}")
    print(f"  Transactions:    {len(expenses)}")
    print(f"  Average:         \${total/len(expenses):.2f}")
    print(f"  Highest:         \${max(amounts):.2f}")
    print(f"  Lowest:          \${min(amounts):.2f}")

    # By category
    print(f"\\n  --- By Category ---")
    for cat in sorted(categories, key=lambda c: sum(e["amount"] for e in categories[c]), reverse=True):
        items = categories[cat]
        cat_total = sum(e["amount"] for e in items)
        pct = (cat_total / total) * 100
        print(f"  {cat}")
        for e in items:
            print(f"    - \${e['amount']:.2f} {e['description']}")
        print(f"    Subtotal: \${cat_total:.2f} ({pct:.1f}%)")

    print("\\n" + "=" * 50)

expense_report()`,
        hint: "Use sorted() with a key function to sort categories by total spending.",
      },
    ],
  },
};

export default function ProjectPage() {
  const params = useParams();
  const { isPro } = useSubscription();
  const projectId = params.id as string;
  const project = projects[projectId];

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-900 mb-2">
            Project not found
          </h1>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!project.isFree && !isPro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <span className="text-5xl mb-4">🔒</span>
        <h1 className="text-2xl font-bold text-dark-900 mb-2">Pro Project</h1>
        <p className="text-dark-500 mb-4">
          Upgrade to Pro to access this project and all others.
        </p>
        <div className="flex gap-3">
          <Link href="/projects">
            <Button variant="secondary">Back to Projects</Button>
          </Link>
          <Link href="/pricing">
            <Button>Upgrade to Pro</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = project.steps.length > 0
    ? (completedSteps.length / project.steps.length) * 100
    : 0;
  const step = project.steps[currentStep];

  const handleStepComplete = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < project.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="-m-8 min-h-screen flex">
      {/* Left Sidebar - Steps */}
      <div className="w-72 bg-white border-r border-dark-200 p-4 overflow-auto shrink-0">
        <Link
          href="/projects"
          className="text-sm text-dark-500 hover:text-dark-700 mb-4 block"
        >
          &larr; Back to Projects
        </Link>

        <h2 className="font-bold text-lg text-dark-900 mb-2">
          {project.title}
        </h2>
        <div className="flex items-center gap-2 mb-4">
          <Badge
            variant={
              project.difficulty === "beginner" ? "primary" : "accent"
            }
          >
            {project.difficulty}
          </Badge>
          <span className="text-sm text-dark-500">
            {project.estimatedTime}
          </span>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-dark-600">Progress</span>
            <span className="text-dark-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="space-y-2">
          {project.steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                currentStep === i
                  ? "bg-primary-100 border-l-4 border-primary-500"
                  : "hover:bg-dark-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    completedSteps.includes(i)
                      ? "bg-green-500 text-white"
                      : currentStep === i
                      ? "bg-primary-500 text-white"
                      : "bg-dark-200 text-dark-500"
                  }`}
                >
                  {completedSteps.includes(i) ? "✓" : i + 1}
                </span>
                <span
                  className={`text-sm ${
                    currentStep === i ? "font-medium" : ""
                  }`}
                >
                  {s.title}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Concepts */}
        <div className="mt-6 pt-4 border-t border-dark-200">
          <h3 className="text-xs font-semibold text-dark-500 uppercase mb-2">
            Concepts
          </h3>
          <div className="flex flex-wrap gap-1">
            {project.concepts.map((concept) => (
              <span
                key={concept}
                className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto bg-dark-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-dark-900 mb-2">
              Step {currentStep + 1}: {step.title}
            </h1>
            <p className="text-dark-600">{step.instruction}</p>
          </div>

          {step.hint && (
            <details className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
              <summary className="cursor-pointer text-sm font-medium text-primary-700">
                Show Hint
              </summary>
              <p className="text-dark-700 text-sm mt-2">{step.hint}</p>
            </details>
          )}

          <CodePlayground
            initialCode={step.starterCode}
            expectedOutput={step.expectedOutput}
            onSuccess={handleStepComplete}
          />

          <div className="flex justify-between mt-6">
            <Button
              variant="secondary"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              &larr; Previous
            </Button>

            {currentStep === project.steps.length - 1 ? (
              completedSteps.length === project.steps.length ? (
                <Link href="/projects">
                  <Button>Complete Project</Button>
                </Link>
              ) : (
                <Button onClick={handleStepComplete}>Mark Complete</Button>
              )
            ) : (
              <Button onClick={handleStepComplete}>Next Step &rarr;</Button>
            )}
          </div>

          {/* All steps completed */}
          {completedSteps.length === project.steps.length && (
            <div className="mt-8 bg-primary-50 border border-primary-200 rounded-xl p-6 text-center">
              <span className="text-4xl block mb-2">🎉</span>
              <h3 className="text-lg font-bold text-dark-900 mb-1">
                Project Completed!
              </h3>
              <p className="text-dark-500 mb-4">
                You earned {project.xpReward} XP. Great work building the{" "}
                {project.title}!
              </p>
              <Link href="/projects">
                <Button>Back to Projects</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
