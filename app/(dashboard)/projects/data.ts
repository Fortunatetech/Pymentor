export type ProjectLevel = "fundamentals" | "beginner" | "intermediate" | "advanced";

export interface ProjectStep {
    title: string;
    instruction: string;
    starterCode: string;
    hint: string;
    expectedOutput?: string;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    level: ProjectLevel;
    difficulty: "beginner" | "intermediate" | "advanced";
    estimatedTime: string;
    xpReward: number;
    concepts: string[];
    isFree: boolean;
    steps: ProjectStep[];
}

export const projects: Record<string, Project> = {
    // --- FUNDAMENTALS ---
    "p1": {
        id: "p1",
        title: "Hello World Variations",
        description: "Master the print function and strings with creative output variations.",
        level: "fundamentals",
        difficulty: "beginner",
        estimatedTime: "15 min",
        xpReward: 30,
        isFree: true,
        concepts: ["print", "strings"],
        steps: [
            {
                title: "Basic Hello",
                instruction: "Use the print function to say 'Hello, Python!'",
                starterCode: "# Print the message\n",
                hint: "Use print(\"Your message here\")",
                expectedOutput: "Hello, Python!"
            },
            {
                title: "Multiple Lines",
                instruction: "Print three different lines of text to tell a mini story.",
                starterCode: "# Print 3 lines\nprint(\"Once upon a time...\")\n",
                hint: "Call print() three separate times.",
            },
            {
                title: "Drawing with Text",
                instruction: "Use print statements to draw a simple shape (like a square or triangle) using symbols.",
                starterCode: "# Draw a shape\nprint(\"  /\\  \")\nprint(\" /  \\ \")\nprint(\"/____\\\")",
                hint: "This is called ASCII art!",
            }
        ]
    },
    "p2": {
        id: "p2",
        title: "Simple Calculator",
        description: "Build a calculator that can perform basic arithmetic operations.",
        level: "fundamentals",
        difficulty: "beginner",
        estimatedTime: "20 min",
        xpReward: 40,
        isFree: true,
        concepts: ["variables", "math", "input"],
        steps: [
            {
                title: "Addition",
                instruction: "Create two variables, add them, and print the result.",
                starterCode: "a = 10\nb = 5\n# Add them and print\n",
                hint: "Use the + operator.",
                expectedOutput: "15"
            },
            {
                title: "Math Operations",
                instruction: "Calculate and print the product and difference of the numbers.",
                starterCode: "a = 10\nb = 5\n# Print product (multiplication) and difference (subtraction)\n",
                hint: "Use * for multiplication and - for subtraction.",
            }
        ]
    },
    "p3": {
        id: "p3",
        title: "Mad Libs Generator",
        description: "Create a funny story generator using user input and string formatting.",
        level: "fundamentals",
        difficulty: "beginner",
        estimatedTime: "25 min",
        xpReward: 45,
        isFree: true,
        concepts: ["input", "f-strings"],
        steps: [
            {
                title: "Getting Input",
                instruction: "Ask the user for their name and print a greeting.",
                starterCode: "# name = input(\"What is your name? \")\nname = \"Alex\" # Simulated input\nprint(f\"Hello, {name}!\")",
                hint: "Use f-strings: f\"Text {variable}\"",
            },
            {
                title: "The Story",
                instruction: "Fill in the blanks of a story using variables.",
                starterCode: "noun = \"dog\"\nverb = \"ran\"\nadjective = \"fast\"\n\n# proper_noun = input(\"Name a place: \")\nplace = \"park\"\n\nprint(f\"The {adjective} {noun} {verb} to the {place}.\")",
                hint: "Make sure your variables match the f-string placeholders.",
            }
        ]
    },
    "p4": {
        id: "p4",
        title: "Temperature Converter",
        description: "Convert temperatures between Celsius and Fahrenheit.",
        level: "fundamentals",
        difficulty: "beginner",
        estimatedTime: "30 min",
        xpReward: 50,
        isFree: true,
        concepts: ["functions", "math"],
        steps: [
            {
                title: "Celsius to Fahrenheit",
                instruction: "Convert 25 Celsius to Fahrenheit using the formula (C * 9/5) + 32.",
                starterCode: "celsius = 25\nfahrenheit = (celsius * 9/5) + 32\nprint(f\"{celsius}C is {fahrenheit}F\")",
                hint: "Order of operations matters!",
                expectedOutput: "25C is 77.0F"
            }
        ]
    },

    // --- BEGINNER ---
    "1": {
        id: "1",
        title: "Number Guessing Game",
        description: "Build a fun game where the computer picks a random number and you try to guess it with hints!",
        level: "beginner",
        difficulty: "beginner",
        estimatedTime: "30 min",
        xpReward: 50,
        isFree: true,
        concepts: ["variables", "if-statements", "while-loops", "input", "random"],
        steps: [
            {
                title: "Set Up the Game",
                instruction: "First, let's import the random module and generate a secret number between 1 and 100.",
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
                instruction: "Now let's ask the user for their guess and convert it to an integer.",
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
                instruction: "Add logic to check if the guess is too high, too low, or correct.",
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
                instruction: "Let the player keep guessing until they get it right. Count their attempts!",
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
                instruction: "Add a maximum of 7 attempts. If they run out, reveal the number!",
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
        print("Too high!")`,
                hint: "Add a condition to check if attempts >= max_attempts before asking for a new guess.",
            },
        ],
    },
    "2": {
        id: "2",
        title: "To-Do List App",
        description: "Create a command-line to-do list where you can add, view, and remove tasks.",
        level: "beginner",
        difficulty: "beginner",
        estimatedTime: "45 min",
        xpReward: 75,
        isFree: true,
        concepts: ["lists", "functions", "loops"],
        steps: [
            {
                title: "Create the Task List",
                instruction: "Start by creating an empty list to store tasks and a function to display them.",
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
            # Handle both string and dict tasks (for later steps)
            if isinstance(task, dict):
                name = task["name"]
                status = "done" if task.get("done") else "pending"
                print(f"  {i}. [{status}] {name}")
            else:
                print(f"  {i}. {task}")

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
                instruction: "Put it all together with add, remove, view, and mark-as-done functionality.",
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
        description: "Generate strong, random passwords with customizable length and characters.",
        level: "beginner",
        difficulty: "beginner",
        estimatedTime: "30 min",
        xpReward: 50,
        isFree: false,
        concepts: ["strings", "random", "functions"],
        steps: [
            {
                title: "Character Sets",
                instruction: "Learn about the different character sets available in Python's string module.",
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
                instruction: "Use random.choice() to pick random characters from our character set.",
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
                instruction: "Create a reusable function that generates passwords of any length.",
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
                instruction: "Add options to include/exclude character types and generate multiple passwords.",
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
    "p5": {
        id: "p5",
        title: "Countdown Timer",
        description: "Build a timer that counts down from a specified time.",
        level: "beginner",
        difficulty: "beginner",
        estimatedTime: "35 min",
        xpReward: 60,
        isFree: false,
        concepts: ["while-loops", "time", "input"],
        steps: [
            {
                title: "The Loop",
                instruction: "Print numbers starting from 5 down to 1 using a while loop.",
                starterCode: "count = 5\nwhile count > 0:\n    print(count)\n    count -= 1\nprint(\"Blastoff!\")",
                hint: "Decrease count in each iteration.",
            }
        ]
    },
    "p6": {
        id: "p6",
        title: "Contact Book",
        description: "Store and manage contact information using dictionaries.",
        level: "beginner",
        difficulty: "beginner",
        estimatedTime: "45 min",
        xpReward: 70,
        isFree: false,
        concepts: ["dictionaries", "CRUD", "functions"],
        steps: [
            {
                title: "Define Dictionary",
                instruction: "Create a dictionary to store a contact's info.",
                starterCode: "contact = {\n    \"name\": \"Alice\",\n    \"phone\": \"555-1234\"\n}\nprint(contact[\"name\"])",
                hint: "Keys are strings, values can be anything.",
            }
        ]
    },

    // --- INTERMEDIATE ---
    "4": {
        id: "4",
        title: "Quiz Game",
        description: "Build a multiple-choice quiz game with scoring and feedback.",
        level: "intermediate",
        difficulty: "intermediate",
        estimatedTime: "1 hour",
        xpReward: 100,
        isFree: false,
        concepts: ["dictionaries", "functions", "loops"],
        steps: [
            {
                title: "Question Data",
                instruction: "Create a structured data format for quiz questions using dictionaries.",
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
                instruction: "Create a function to display a question with numbered options.",
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
                instruction: "Add answer checking logic and score tracking.",
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
                instruction: "Put it all together with a full quiz flow, scoring, and results summary.",
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
        description: "Process weather data and display formatted summaries and statistics.",
        level: "intermediate",
        difficulty: "intermediate",
        estimatedTime: "1.5 hours",
        xpReward: 100,
        isFree: false,
        concepts: ["APIs", "JSON", "functions"],
        steps: [
            {
                title: "Weather Data",
                instruction: "Create a sample weather dataset using a list of dictionaries.",
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
                instruction: "Calculate average, min, and max temperatures from the data.",
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
                instruction: "Create a nicely formatted weather dashboard display.",
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
                instruction: "Add trend analysis to detect whether temperatures are rising or falling.",
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
        description: "Track expenses, categorize them, and see spending summaries.",
        level: "intermediate",
        difficulty: "intermediate",
        estimatedTime: "2 hours",
        xpReward: 125,
        isFree: false,
        concepts: ["file I/O", "dictionaries", "functions"],
        steps: [
            {
                title: "Expense Data Structure",
                instruction: "Set up the data structure to store expenses with amounts, categories, and descriptions.",
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
                instruction: "Create functions to view all expenses and calculate the total.",
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
                instruction: "Group expenses by category and show totals with percentages.",
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
                instruction: "Create a comprehensive expense report with statistics and insights.",
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
    "p7": {
        id: "p7",
        title: "Hangman Game",
        description: "The classic word guessing game with text-based graphics.",
        level: "intermediate",
        difficulty: "intermediate",
        estimatedTime: "1 hour",
        xpReward: 110,
        isFree: false,
        concepts: ["strings", "loops", "game logic"],
        steps: [
            {
                title: "Masking Word",
                instruction: "Display the word with underscores for unguessed letters.",
                starterCode: "word = \"PYTHON\"\nguessed = [\"P\", \"N\"]\n\ndisplay = \"\"\nfor letter in word:\n    if letter in guessed:\n        display += letter\n    else:\n        display += \"_\"\n\nprint(display)",
                hint: "Iterate through each letter of the secret word.",
                expectedOutput: "P____N"
            }
        ]
    },
    "p8": {
        id: "p8",
        title: "Mini Database",
        description: "Create a simple database system to store and retrieve data.",
        level: "intermediate",
        difficulty: "intermediate",
        estimatedTime: "1.5 hours",
        xpReward: 120,
        isFree: false,
        concepts: ["JSON", "file persistence"],
        steps: [
            {
                title: "JSON Storage",
                instruction: "Convert a dictionary to a JSON string.",
                starterCode: "import json\ndata = {\"users\": [{\"name\": \"Alice\"}]}\njson_str = json.dumps(data)\nprint(json_str)",
                hint: "json.dumps() creates a string.",
            }
        ]
    },

    // --- ADVANCED ---
    "p9": {
        id: "p9",
        title: "Web Scraper Basics",
        description: "Extract data from websites using requests and parsing.",
        level: "advanced",
        difficulty: "advanced",
        estimatedTime: "2 hours",
        xpReward: 150,
        isFree: false,
        concepts: ["requests", "parsing", "web"],
        steps: [
            {
                title: "Simulation",
                instruction: "Parse a simple HTML string to find links.",
                starterCode: "html = '<html><body><a href=\"https://example.com\">Link</a></body></html>'\nstart = html.find('href=\"') + 6\nend = html.find('\"', start)\nprint(html[start:end])",
                hint: "String slicing is powerful for basic parsing.",
                expectedOutput: "https://example.com"
            }
        ]
    },
    "p10": {
        id: "p10",
        title: "Data Visualizer",
        description: "Create charts and graphs from data sets.",
        level: "advanced",
        difficulty: "advanced",
        estimatedTime: "2 hours",
        xpReward: 150,
        isFree: false,
        concepts: ["visualization", "data analysis"],
        steps: [
            {
                title: "Text Bar Chart",
                instruction: "Create a simple bar chart using text characters.",
                starterCode: "value = 8\nprint(f\"Data: {'#' * value}\")",
                hint: "Multiply strings to repeat them.",
                expectedOutput: "Data: ########"
            }
        ]
    },
    "p11": {
        id: "p11",
        title: "CLI Task Manager",
        description: "Build a robust command-line interface tool with arguments.",
        level: "advanced",
        difficulty: "advanced",
        estimatedTime: "2.5 hours",
        xpReward: 175,
        isFree: false,
        concepts: ["argparse", "classes", "CLI"],
        steps: [
            {
                title: "Class Structure",
                instruction: "Define a Task class with a method to mark it done.",
                starterCode: "class Task:\n    def __init__(self, title):\n        self.title = title\n        self.done = False\n    \n    def complete(self):\n        self.done = True\n\nt = Task(\"Buy milk\")\nt.complete()\nprint(f\"{t.title}: {t.done}\")",
                hint: "Classes organize data and behavior.",
                expectedOutput: "Buy milk: True"
            }
        ]
    },
    "p12": {
        id: "p12",
        title: "REST API Client",
        description: "Build a client to interact with external REST APIs.",
        level: "advanced",
        difficulty: "advanced",
        estimatedTime: "2 hours",
        xpReward: 160,
        isFree: false,
        concepts: ["HTTP", "JSON", "error handling"],
        steps: [
            {
                title: "Mock Request",
                instruction: "Simulate an API response and parse the status code.",
                starterCode: "response = {\"status\": 200, \"data\": \"Success\"}\nif response[\"status\"] == 200:\n    print(response[\"data\"])",
                hint: "Check the status code before using data.",
                expectedOutput: "Success"
            }
        ]
    }
};
