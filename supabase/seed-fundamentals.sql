-- ============================================
-- PyMentor AI: Complete Python Curriculum
-- Creates all 4 levels with comprehensive lessons
-- Run in Supabase SQL Editor
-- ============================================

-- First, clear existing seed data to avoid duplicates
DELETE FROM public.lessons WHERE module_id IN (
  SELECT id FROM public.modules WHERE path_id IN (
    SELECT id FROM public.learning_paths WHERE slug IN ('fundamentals', 'beginner', 'intermediate', 'advanced', 'automation', 'data-analysis')
  )
);
DELETE FROM public.modules WHERE path_id IN (
  SELECT id FROM public.learning_paths WHERE slug IN ('fundamentals', 'beginner', 'intermediate', 'advanced', 'automation', 'data-analysis')
);
DELETE FROM public.learning_paths WHERE slug IN ('fundamentals', 'beginner', 'intermediate', 'advanced', 'automation', 'data-analysis');

-- ============================================
-- LEVEL 1: FUNDAMENTALS (Absolute Beginners)
-- ============================================
INSERT INTO public.learning_paths (title, slug, description, difficulty, icon, estimated_hours, is_published, is_free, order_index)
VALUES (
  'Python Fundamentals',
  'fundamentals',
  'Your first steps into programming. Learn the absolute basics of Python with no prior experience needed.',
  'beginner',
  '🌱',
  15,
  true,
  true,
  1
);

DO $$
DECLARE
  fundamentals_path_id UUID;
  mod_getting_started UUID;
  mod_variables UUID;
  mod_basic_ops UUID;
  mod_control_flow UUID;
  mod_loops UUID;
  mod_functions_intro UUID;
BEGIN
  SELECT id INTO fundamentals_path_id FROM public.learning_paths WHERE slug = 'fundamentals';
  
  -- ============================================
  -- Module 1: Getting Started
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (fundamentals_path_id, 'Getting Started', 'Your first steps into the world of Python', 1, true)
  RETURNING id INTO mod_getting_started;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_getting_started, 'Welcome to Python', 'welcome', 'Why Python is the perfect first programming language',
   '{"sections":[
     {"type":"text","content":"🎉 **Welcome to PyMentor AI!** You''re about to learn one of the most popular programming languages in the world."},
     {"type":"text","content":"Python is used by millions of developers to build websites, analyze data, create AI, automate tasks, and so much more. Companies like Google, Netflix, and Spotify use Python daily!"},
     {"type":"callout","variant":"tip","content":"Don''t worry if you''ve never written a single line of code. Python is famous for being beginner-friendly, and Py (your AI tutor) is here to help every step of the way!"},
     {"type":"text","content":"## What You''ll Learn\n\nIn the Fundamentals level, you''ll master:\n- How to give instructions to a computer\n- Storing data in variables\n- Making decisions with if/else\n- Repeating actions with loops\n- Creating reusable code with functions"},
     {"type":"text","content":"## How Lessons Work\n\nEach lesson has:\n1. **Explanations** - Clear concepts with real-world examples\n2. **Code Examples** - See Python in action\n3. **Exercises** - Practice what you learned\n4. **Py''s Help** - Ask your AI tutor anytime!"},
     {"type":"callout","variant":"info","content":"Ready to write your first line of code? Let''s go! 🚀"}
   ]}',
   'lesson', 1, 5, 5, ARRAY['intro'], true),
  
  (mod_getting_started, 'Your First Python Code', 'first-code', 'Write and run your very first program',
   '{"sections":[
     {"type":"text","content":"Let''s write your first Python program! Programmers traditionally start with a program called ''Hello, World!'' — it simply displays a message on screen."},
     {"type":"text","content":"## The print() Function\n\nTo display text in Python, we use the `print()` function:"},
     {"type":"code","language":"python","code":"print(\"Hello, World!\")"},
     {"type":"text","content":"**What''s happening here?**\n- `print` is a built-in Python function that displays text\n- The parentheses `()` contain what we want to display\n- The quotes `\"\"` tell Python this is text (called a **string**)"},
     {"type":"callout","variant":"tip","content":"Functions are like little helpers that do specific jobs. The print() function''s job is to display things on screen."},
     {"type":"code","language":"python","code":"# You can print anything!\nprint(\"My name is Python\")\nprint(\"I can add numbers too:\")\nprint(2 + 2)"},
     {"type":"text","content":"Notice that `2 + 2` doesn''t need quotes because it''s a number, not text. Python calculates it first, then displays `4`."},
     {"type":"exercise","prompt":"Write code to print ''I am learning Python!'' (including the exclamation mark)","starter":"# Type your code below\n","solution":"print(\"I am learning Python!\")","expectedOutput":"I am learning Python!","hints":["Use the print() function","Put your text inside quotes","Make sure to include the exclamation mark!"]}
   ]}',
   'exercise', 2, 10, 10, ARRAY['print', 'strings', 'output'], true),
  
  (mod_getting_started, 'Understanding Errors', 'errors', 'Learn to read and fix common mistakes',
   '{"sections":[
     {"type":"text","content":"Making mistakes is a **normal** part of coding — even experts make errors daily! The key is learning to understand what Python tells you when something goes wrong."},
     {"type":"text","content":"## Common Error: Missing Quote\n\nLook at this broken code:"},
     {"type":"code","language":"python","code":"print(\"Hello World)  # Missing closing quote!"},
     {"type":"text","content":"Python will show: `SyntaxError: EOL while scanning string literal`\n\nThis means Python reached the **End Of Line** while still looking for the closing quote. The fix? Add the missing `\"`!"},
     {"type":"callout","variant":"warning","content":"Error messages are your friends! They tell you exactly what went wrong and where."},
     {"type":"text","content":"## Common Error: Typo in Function Name"},
     {"type":"code","language":"python","code":"Print(\"Hello\")  # Python is CASE-SENSITIVE!"},
     {"type":"text","content":"This gives: `NameError: name ''Print'' is not defined`\n\nPython doesn''t recognize `Print` (capital P). It only knows `print` (lowercase)."},
     {"type":"callout","variant":"tip","content":"Python is case-sensitive! ''print'' and ''Print'' are completely different to Python."},
     {"type":"exercise","prompt":"Fix this broken code so it prints ''Hello, Python!'' correctly:","starter":"print(Hello, Python!)","solution":"print(\"Hello, Python!\")","expectedOutput":"Hello, Python!","hints":["The text needs to be inside quotes","Strings must start and end with matching quotes"]}
   ]}',
   'exercise', 3, 10, 10, ARRAY['errors', 'debugging', 'syntax'], true);

  -- ============================================
  -- Module 2: Variables & Data Types
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (fundamentals_path_id, 'Variables & Data Types', 'Learn to store and work with different types of data', 2, true)
  RETURNING id INTO mod_variables;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_variables, 'Variables: Storing Data', 'variables', 'Learn how to store and reuse information',
   '{"sections":[
     {"type":"text","content":"Imagine you have labeled boxes where you can store things. In programming, these boxes are called **variables**."},
     {"type":"text","content":"## Creating Variables\n\nTo create a variable, pick a name and use `=` to assign a value:"},
     {"type":"code","language":"python","code":"name = \"Alice\"\nage = 25\nprint(name)\nprint(age)"},
     {"type":"text","content":"**What happened?**\n- `name` now holds the text \"Alice\"\n- `age` now holds the number 25\n- We can use these names anywhere to get the values back!"},
     {"type":"callout","variant":"tip","content":"The `=` sign in programming means ''assign this value to this variable'' — not ''equals'' like in math."},
     {"type":"text","content":"## Good Variable Names\n\nVariable names should be descriptive:"},
     {"type":"code","language":"python","code":"# Good names (clear meaning)\nuser_name = \"Bob\"\ntotal_price = 19.99\nis_logged_in = True\n\n# Bad names (unclear)\nx = \"Bob\"\na = 19.99\nflag = True"},
     {"type":"callout","variant":"info","content":"Variable names can''t start with numbers and can''t contain spaces. Use underscores instead: my_variable"},
     {"type":"exercise","prompt":"Create a variable called ''city'' with the value ''London'', then print it.","starter":"# Create your variable here\n\n# Print it here\n","solution":"city = \"London\"\nprint(city)","expectedOutput":"London","hints":["Use the = sign to assign a value","Text values need quotes around them","Use print() to display the variable"]}
   ]}',
   'exercise', 1, 15, 15, ARRAY['variables', 'assignment', 'naming'], true),
  
  (mod_variables, 'Numbers: Integers and Floats', 'numbers', 'Working with whole numbers and decimals',
   '{"sections":[
     {"type":"text","content":"Python works with two main types of numbers:\n- **Integers** (int): Whole numbers like 5, -3, 1000\n- **Floats**: Decimal numbers like 3.14, -0.5, 100.0"},
     {"type":"code","language":"python","code":"# Integers (whole numbers)\nage = 25\nyear = 2024\ntemperature = -5\n\n# Floats (decimals)\nprice = 19.99\npi = 3.14159\npercentage = 0.75"},
     {"type":"text","content":"## Math Operations\n\nPython is a powerful calculator:"},
     {"type":"code","language":"python","code":"# Basic math\nprint(10 + 5)   # Addition: 15\nprint(10 - 5)   # Subtraction: 5\nprint(10 * 5)   # Multiplication: 50\nprint(10 / 5)   # Division: 2.0 (always gives a float!)\nprint(10 ** 2)  # Power: 100 (10 squared)\nprint(10 % 3)   # Modulo: 1 (remainder of division)"},
     {"type":"callout","variant":"tip","content":"Division (/) always returns a float. Use // for integer division: 10 // 3 = 3"},
     {"type":"text","content":"## Combining Variables and Math"},
     {"type":"code","language":"python","code":"width = 10\nheight = 5\narea = width * height\nprint(area)  # Outputs: 50"},
     {"type":"exercise","prompt":"Calculate and print the area of a rectangle with width 8 and height 6.","starter":"width = 8\nheight = 6\n# Calculate area and print it\n","solution":"width = 8\nheight = 6\narea = width * height\nprint(area)","expectedOutput":"48","hints":["Area = width × height","Use * for multiplication","Store result in a variable, then print it"]}
   ]}',
   'exercise', 2, 15, 15, ARRAY['integers', 'floats', 'math', 'operators'], true),
  
  (mod_variables, 'Strings: Working with Text', 'strings', 'Manipulating text data in Python',
   '{"sections":[
     {"type":"text","content":"Text in programming is called a **string**. Strings can be created with single quotes, double quotes, or triple quotes:"},
     {"type":"code","language":"python","code":"name = \"Alice\"       # Double quotes\ngreeting = ''Hello''   # Single quotes\nstory = \"\"\"This is a\nmulti-line\nstring!\"\"\"           # Triple quotes for multiple lines"},
     {"type":"text","content":"## Combining Strings\n\nYou can join strings together using `+`:"},
     {"type":"code","language":"python","code":"first_name = \"John\"\nlast_name = \"Doe\"\nfull_name = first_name + \" \" + last_name\nprint(full_name)  # John Doe"},
     {"type":"text","content":"## F-Strings (Modern Python)\n\nThe easiest way to mix text and variables:"},
     {"type":"code","language":"python","code":"name = \"Alice\"\nage = 25\nmessage = f\"My name is {name} and I am {age} years old.\"\nprint(message)"},
     {"type":"callout","variant":"tip","content":"F-strings start with ''f'' before the quote. Put variables inside {curly braces} to include them!"},
     {"type":"text","content":"## Useful String Methods"},
     {"type":"code","language":"python","code":"text = \"Hello, World!\"\nprint(text.upper())       # HELLO, WORLD!\nprint(text.lower())       # hello, world!\nprint(text.replace(\"World\", \"Python\"))  # Hello, Python!\nprint(len(text))          # 13 (character count)"},
     {"type":"exercise","prompt":"Create variables for your favorite food and a number rating (1-10). Use an f-string to print: ''I rate [food] a [rating]/10!''","starter":"food = \"\"\nrating = 0\n# Use an f-string to print the message\n","solution":"food = \"pizza\"\nrating = 9\nprint(f\"I rate {food} a {rating}/10!\")","hints":["F-strings start with f\"...\"","Put variables inside {curly braces}","The output should include your food name and rating"]}
   ]}',
   'exercise', 3, 15, 15, ARRAY['strings', 'f-strings', 'concatenation', 'methods'], true),
  
  (mod_variables, 'Booleans: True or False', 'booleans', 'Understanding True and False values',
   '{"sections":[
     {"type":"text","content":"**Booleans** are the simplest data type — they can only be `True` or `False`. They''re essential for making decisions in code."},
     {"type":"code","language":"python","code":"is_sunny = True\nis_raining = False\nprint(is_sunny)   # True\nprint(is_raining) # False"},
     {"type":"callout","variant":"important","content":"True and False must be capitalized! ''true'' or ''TRUE'' won''t work."},
     {"type":"text","content":"## Comparison Operators\n\nComparisons produce boolean results:"},
     {"type":"code","language":"python","code":"age = 18\n\nprint(age == 18)  # Equal to: True\nprint(age != 18)  # Not equal: False\nprint(age > 17)   # Greater than: True\nprint(age < 21)   # Less than: True\nprint(age >= 18)  # Greater or equal: True\nprint(age <= 18)  # Less or equal: True"},
     {"type":"text","content":"## Logical Operators\n\nCombine multiple conditions:"},
     {"type":"code","language":"python","code":"age = 25\nhas_license = True\n\n# AND - both must be true\ncan_drive = age >= 18 and has_license\nprint(can_drive)  # True\n\n# OR - at least one must be true\nis_adult = age >= 21 or age >= 18\nprint(is_adult)   # True\n\n# NOT - reverses the value\nis_minor = not (age >= 18)\nprint(is_minor)   # False"},
     {"type":"exercise","prompt":"Create a variable ''score'' set to 85. Create a boolean ''passed'' that is True if score is 60 or higher. Print passed.","starter":"score = 85\n# Create the passed variable\n\n# Print it\n","solution":"score = 85\npassed = score >= 60\nprint(passed)","expectedOutput":"True","hints":["Use >= for \"greater than or equal\"","The comparison itself creates a boolean","Store the comparison result in ''passed''"]}
   ]}',
   'exercise', 4, 10, 10, ARRAY['booleans', 'comparison', 'logical-operators'], true),
  
  (mod_variables, 'Type Conversion', 'type-conversion', 'Converting between different data types',
   '{"sections":[
     {"type":"text","content":"Sometimes you need to convert data from one type to another. Python provides built-in functions for this:"},
     {"type":"code","language":"python","code":"# String to Integer\nage_str = \"25\"\nage_int = int(age_str)\nprint(age_int + 5)  # 30\n\n# Integer to String\nage = 25\nage_text = str(age)\nprint(\"I am \" + age_text + \" years old\")\n\n# String to Float\nprice_str = \"19.99\"\nprice = float(price_str)\nprint(price * 2)  # 39.98"},
     {"type":"callout","variant":"warning","content":"You can''t add a string to a number directly! ''25'' + 5 will cause an error. Convert first!"},
     {"type":"text","content":"## Getting User Input\n\nThe `input()` function always returns a string:"},
     {"type":"code","language":"python","code":"name = input(\"What is your name? \")\nprint(f\"Hello, {name}!\")\n\n# For numbers, you must convert!\nage = int(input(\"How old are you? \"))\nnext_year = age + 1\nprint(f\"Next year you''ll be {next_year}\")"},
     {"type":"text","content":"## Checking Types\n\nUse `type()` to see what type a value is:"},
     {"type":"code","language":"python","code":"print(type(42))       # <class ''int''>\nprint(type(3.14))     # <class ''float''>\nprint(type(\"hello\"))  # <class ''str''>\nprint(type(True))     # <class ''bool''>"},
     {"type":"exercise","prompt":"You have a string ''42''. Convert it to an integer, add 8, and print the result.","starter":"number_str = \"42\"\n# Convert to integer, add 8, and print\n","solution":"number_str = \"42\"\nnumber = int(number_str)\nresult = number + 8\nprint(result)","expectedOutput":"50","hints":["Use int() to convert a string to an integer","Store the converted value in a new variable","Add 8 to the integer, then print"]}
   ]}',
   'exercise', 5, 10, 10, ARRAY['type-conversion', 'int', 'str', 'float', 'input'], true);

  -- ============================================
  -- Module 3: Basic Operations
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (fundamentals_path_id, 'Basic Operations', 'Perform calculations and format output', 3, true)
  RETURNING id INTO mod_basic_ops;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_basic_ops, 'Math in Python', 'math-operations', 'Using Python as a powerful calculator',
   '{"sections":[
     {"type":"text","content":"Python can do much more than basic math. Let''s explore all the mathematical operations you can perform."},
     {"type":"text","content":"## Order of Operations\n\nPython follows standard math rules (PEMDAS):"},
     {"type":"code","language":"python","code":"# Parentheses first, then Exponents, then Multiply/Divide, then Add/Subtract\nresult = (2 + 3) * 4 ** 2 - 10 / 2\nprint(result)  # 5 * 16 - 5 = 75.0"},
     {"type":"text","content":"## Integer Division and Modulo\n\nTwo special operators:"},
     {"type":"code","language":"python","code":"# Floor division (rounds down)\nprint(17 // 5)  # 3 (not 3.4)\n\n# Modulo (remainder)\nprint(17 % 5)   # 2 (17 = 5*3 + 2)\n\n# Practical use: Is a number even?\nnumber = 42\nis_even = number % 2 == 0\nprint(is_even)  # True"},
     {"type":"callout","variant":"tip","content":"Modulo is great for checking divisibility. If number % 2 == 0, the number is even!"},
     {"type":"text","content":"## The Math Module\n\nFor advanced math, import the math module:"},
     {"type":"code","language":"python","code":"import math\n\nprint(math.sqrt(16))    # Square root: 4.0\nprint(math.pow(2, 10))  # Power: 1024.0\nprint(math.floor(3.7))  # Round down: 3\nprint(math.ceil(3.2))   # Round up: 4\nprint(math.pi)          # Pi: 3.14159..."},
     {"type":"exercise","prompt":"Calculate and print the remainder when 100 is divided by 7.","starter":"# Calculate 100 % 7 and print the result\n","solution":"remainder = 100 % 7\nprint(remainder)","expectedOutput":"2","hints":["Use the modulo operator %","100 % 7 gives the remainder","Store in a variable and print, or print directly"]}
   ]}',
   'exercise', 1, 10, 10, ARRAY['math', 'operators', 'modulo', 'floor-division'], true),
  
  (mod_basic_ops, 'String Operations', 'string-operations', 'Powerful text manipulation techniques',
   '{"sections":[
     {"type":"text","content":"Strings in Python are very flexible. Let''s learn some powerful operations."},
     {"type":"text","content":"## String Length and Indexing\n\nStrings are sequences of characters, each with a position (index):"},
     {"type":"code","language":"python","code":"word = \"Python\"\n\n# Length\nprint(len(word))  # 6\n\n# Indexing (starts at 0!)\nprint(word[0])    # P (first character)\nprint(word[1])    # y (second character)\nprint(word[-1])   # n (last character)\nprint(word[-2])   # o (second to last)"},
     {"type":"callout","variant":"important","content":"Python indexing starts at 0, not 1! The first character is at index [0]."},
     {"type":"text","content":"## Slicing\n\nExtract portions of a string:"},
     {"type":"code","language":"python","code":"text = \"Hello, World!\"\n\nprint(text[0:5])   # Hello (index 0 to 4)\nprint(text[7:])    # World! (index 7 to end)\nprint(text[:5])    # Hello (start to index 4)\nprint(text[::2])   # Hlo ol! (every 2nd character)"},
     {"type":"text","content":"## String Methods"},
     {"type":"code","language":"python","code":"text = \"  Hello, Python!  \"\n\nprint(text.strip())       # Remove whitespace: \"Hello, Python!\"\nprint(text.split(\",\"))    # Split: [\"  Hello\", \" Python!  \"]\nprint(\"py\" in text.lower())  # Check if contains: True\nprint(text.count(\"l\"))    # Count occurrences: 2"},
     {"type":"exercise","prompt":"Given the string ''Programming'', print just the first 4 characters (''Prog'').","starter":"word = \"Programming\"\n# Print the first 4 characters\n","solution":"word = \"Programming\"\nprint(word[0:4])","expectedOutput":"Prog","hints":["Use slicing with [start:end]","Remember: the end index is not included","[0:4] gets characters at indices 0, 1, 2, 3"]}
   ]}',
   'exercise', 2, 10, 10, ARRAY['strings', 'indexing', 'slicing', 'string-methods'], true),
  
  (mod_basic_ops, 'Print Formatting', 'print-formatting', 'Display professional-looking output',
   '{"sections":[
     {"type":"text","content":"Making your output look professional is important. Let''s explore different formatting techniques."},
     {"type":"text","content":"## F-String Formatting"},
     {"type":"code","language":"python","code":"name = \"Alice\"\nage = 25\nheight = 1.68\n\n# Basic f-string\nprint(f\"Name: {name}, Age: {age}\")\n\n# Number formatting\nprint(f\"Height: {height:.1f}m\")  # 1 decimal place\nprint(f\"Pi: {3.14159:.2f}\")      # 2 decimal places\n\n# Padding and alignment\nprint(f\"{name:>10}\")  # Right-align in 10 characters\nprint(f\"{name:<10}\")  # Left-align in 10 characters\nprint(f\"{name:^10}\")  # Center in 10 characters"},
     {"type":"text","content":"## Formatting Numbers"},
     {"type":"code","language":"python","code":"price = 1234567.89\n\nprint(f\"${price:,.2f}\")      # $1,234,567.89 (with commas)\nprint(f\"{price:.0f}\")        # 1234568 (no decimals, rounded)\n\npercentage = 0.756\nprint(f\"{percentage:.1%}\")   # 75.6% (as percentage)"},
     {"type":"text","content":"## Multiple print() Options"},
     {"type":"code","language":"python","code":"# Change separator\nprint(\"Apple\", \"Banana\", \"Cherry\", sep=\" | \")\n# Output: Apple | Banana | Cherry\n\n# Change ending\nprint(\"Loading\", end=\"...\")\nprint(\"Done!\")\n# Output: Loading...Done!"},
     {"type":"exercise","prompt":"Format and print the price 42.5 as a currency with 2 decimal places: $42.50","starter":"price = 42.5\n# Print formatted as $42.50\n","solution":"price = 42.5\nprint(f\"${price:.2f}\")","expectedOutput":"$42.50","hints":["Use an f-string",":.2f formats to 2 decimal places","Include the $ symbol before the curly braces"]}
   ]}',
   'exercise', 3, 10, 10, ARRAY['print', 'formatting', 'f-strings'], true);

  -- ============================================
  -- Module 4: Control Flow
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (fundamentals_path_id, 'Control Flow', 'Make your code smart with decisions', 4, true)
  RETURNING id INTO mod_control_flow;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_control_flow, 'If Statements', 'if-statements', 'Making decisions in your code',
   '{"sections":[
     {"type":"text","content":"Programs need to make decisions. **If statements** let your code choose different paths based on conditions."},
     {"type":"code","language":"python","code":"age = 18\n\nif age >= 18:\n    print(\"You can vote!\")\n    print(\"You are an adult.\")"},
     {"type":"callout","variant":"important","content":"Notice the colon (:) after the condition and the indentation (4 spaces) for the code inside. Python uses indentation to know what code belongs together!"},
     {"type":"text","content":"## If-Else\n\nProvide an alternative when the condition is False:"},
     {"type":"code","language":"python","code":"age = 15\n\nif age >= 18:\n    print(\"Welcome to the club!\")\nelse:\n    print(\"Sorry, come back when you''re older.\")"},
     {"type":"text","content":"## If-Elif-Else\n\nCheck multiple conditions:"},
     {"type":"code","language":"python","code":"score = 85\n\nif score >= 90:\n    grade = \"A\"\nelif score >= 80:\n    grade = \"B\"\nelif score >= 70:\n    grade = \"C\"\nelif score >= 60:\n    grade = \"D\"\nelse:\n    grade = \"F\"\n\nprint(f\"Your grade: {grade}\")  # B"},
     {"type":"callout","variant":"tip","content":"Python checks conditions from top to bottom and runs the FIRST one that''s True, then skips the rest."},
     {"type":"exercise","prompt":"Write code that checks if a number is positive, negative, or zero. Test with number = -5.","starter":"number = -5\n\n# Check if positive, negative, or zero\n","solution":"number = -5\n\nif number > 0:\n    print(\"Positive\")\nelif number < 0:\n    print(\"Negative\")\nelse:\n    print(\"Zero\")","expectedOutput":"Negative","hints":["Use if, elif, and else","Check > 0 for positive","Check < 0 for negative","Use else for zero"]}
   ]}',
   'exercise', 1, 15, 15, ARRAY['if', 'else', 'elif', 'conditions', 'indentation'], true),
  
  (mod_control_flow, 'Comparison & Logical Operators', 'comparison-logical', 'Combine conditions for complex decisions',
   '{"sections":[
     {"type":"text","content":"Let''s dive deeper into how to create complex conditions by combining comparisons."},
     {"type":"text","content":"## Comparison Operators Review"},
     {"type":"code","language":"python","code":"x = 10\n\nprint(x == 10)  # Equal: True\nprint(x != 5)   # Not equal: True\nprint(x > 5)    # Greater: True\nprint(x < 20)   # Less: True\nprint(x >= 10)  # Greater or equal: True\nprint(x <= 10)  # Less or equal: True"},
     {"type":"text","content":"## Logical Operators\n\nCombine multiple conditions:"},
     {"type":"code","language":"python","code":"age = 25\nhas_id = True\nhas_reservation = False\n\n# AND - BOTH must be true\ncan_enter = age >= 21 and has_id\nprint(can_enter)  # True\n\n# OR - at least ONE must be true\ncan_skip_line = has_id or has_reservation\nprint(can_skip_line)  # True\n\n# NOT - reverses the value\nis_blocked = not has_id\nprint(is_blocked)  # False"},
     {"type":"text","content":"## Combining in If Statements"},
     {"type":"code","language":"python","code":"temperature = 25\nis_sunny = True\n\nif temperature > 20 and is_sunny:\n    print(\"Perfect day for a picnic!\")\nelif temperature > 20 or is_sunny:\n    print(\"Decent weather outside.\")\nelse:\n    print(\"Maybe stay indoors.\")\n\n# Output: Perfect day for a picnic!"},
     {"type":"exercise","prompt":"Check if a person can rent a car: must be 21+ AND have a license. Test with age=22, has_license=True.","starter":"age = 22\nhas_license = True\n\n# Check if they can rent a car\n","solution":"age = 22\nhas_license = True\n\nif age >= 21 and has_license:\n    print(\"You can rent a car!\")\nelse:\n    print(\"Sorry, you cannot rent a car.\")","expectedOutput":"You can rent a car!","hints":["Use ''and'' to require both conditions","Both age >= 21 AND has_license must be True","Use if-else for the two outcomes"]}
   ]}',
   'exercise', 2, 10, 10, ARRAY['comparison', 'logical', 'and', 'or', 'not'], true),
  
  (mod_control_flow, 'Nested Conditions', 'nested-conditions', 'Decisions inside decisions',
   '{"sections":[
     {"type":"text","content":"Sometimes you need to check additional conditions only after an initial check passes. This is called **nesting**."},
     {"type":"code","language":"python","code":"is_member = True\nage = 25\n\nif is_member:\n    if age >= 18:\n        print(\"Full access granted!\")\n    else:\n        print(\"Teen member access.\")\nelse:\n    print(\"Please sign up first.\")"},
     {"type":"text","content":"## Simplifying with Logical Operators\n\nOften, nested conditions can be rewritten:"},
     {"type":"code","language":"python","code":"# Nested version\nif is_member:\n    if age >= 18:\n        print(\"Full access\")\n\n# Simplified version (same result)\nif is_member and age >= 18:\n    print(\"Full access\")"},
     {"type":"callout","variant":"tip","content":"If you have deeply nested conditions, consider if you can simplify with ''and''/''or''. But sometimes nesting is clearer!"},
     {"type":"text","content":"## Practical Example: Login Check"},
     {"type":"code","language":"python","code":"username = \"admin\"\npassword = \"secret123\"\nis_active = True\n\nif username == \"admin\":\n    if password == \"secret123\":\n        if is_active:\n            print(\"Login successful!\")\n        else:\n            print(\"Account is deactivated.\")\n    else:\n        print(\"Wrong password.\")\nelse:\n    print(\"User not found.\")"},
     {"type":"exercise","prompt":"Check a ticket: if has_ticket is True, check if is_vip. VIP gets ''VIP access'', regular gets ''General admission''. No ticket gets ''Please buy a ticket''.","starter":"has_ticket = True\nis_vip = True\n\n# Write nested conditions\n","solution":"has_ticket = True\nis_vip = True\n\nif has_ticket:\n    if is_vip:\n        print(\"VIP access\")\n    else:\n        print(\"General admission\")\nelse:\n    print(\"Please buy a ticket\")","expectedOutput":"VIP access","hints":["First check has_ticket","Inside that, check is_vip","Use proper indentation for each level"]}
   ]}',
   'exercise', 3, 10, 10, ARRAY['nested', 'conditions', 'if'], true);

  -- ============================================
  -- Module 5: Loops
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (fundamentals_path_id, 'Loops', 'Repeat actions efficiently', 5, true)
  RETURNING id INTO mod_loops;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_loops, 'For Loops', 'for-loops', 'Iterate over sequences automatically',
   '{"sections":[
     {"type":"text","content":"**For loops** let you repeat code for each item in a sequence. Think of it as: \"For each item, do this thing.\""},
     {"type":"code","language":"python","code":"fruits = [\"apple\", \"banana\", \"cherry\"]\n\nfor fruit in fruits:\n    print(fruit)\n\n# Output:\n# apple\n# banana\n# cherry"},
     {"type":"text","content":"## Using range()\n\nRepeat something a specific number of times:"},
     {"type":"code","language":"python","code":"# Print 0 to 4\nfor i in range(5):\n    print(i)\n\n# Print 1 to 5\nfor i in range(1, 6):\n    print(i)\n\n# Count by 2s: 0, 2, 4, 6, 8\nfor i in range(0, 10, 2):\n    print(i)"},
     {"type":"callout","variant":"tip","content":"range(5) gives 0,1,2,3,4 (starts at 0, stops BEFORE 5). range(1,6) gives 1,2,3,4,5."},
     {"type":"text","content":"## Looping Through Strings"},
     {"type":"code","language":"python","code":"word = \"Python\"\n\nfor letter in word:\n    print(letter)\n\n# Output: P y t h o n (each on new line)"},
     {"type":"exercise","prompt":"Print the numbers 1 through 5 using a for loop.","starter":"# Print numbers 1 to 5\n","solution":"for i in range(1, 6):\n    print(i)","expectedOutput":"1\n2\n3\n4\n5","hints":["Use range() with start and end","range(1, 6) gives 1, 2, 3, 4, 5","Remember: the end value is NOT included"]}
   ]}',
   'exercise', 1, 15, 15, ARRAY['for-loop', 'range', 'iteration'], true),
  
  (mod_loops, 'While Loops', 'while-loops', 'Repeat while a condition is true',
   '{"sections":[
     {"type":"text","content":"**While loops** keep running as long as a condition is True. They''re great when you don''t know exactly how many times to repeat."},
     {"type":"code","language":"python","code":"count = 0\n\nwhile count < 5:\n    print(count)\n    count = count + 1  # Also written as count += 1\n\n# Output: 0, 1, 2, 3, 4"},
     {"type":"callout","variant":"warning","content":"Always make sure your while loop can eventually stop! If the condition never becomes False, you get an infinite loop."},
     {"type":"text","content":"## Practical Example: Countdown"},
     {"type":"code","language":"python","code":"countdown = 5\n\nwhile countdown > 0:\n    print(countdown)\n    countdown -= 1\n\nprint(\"Liftoff! 🚀\")"},
     {"type":"text","content":"## While vs For\n\nUse **for** when you know how many times to loop.\nUse **while** when you loop until something happens."},
     {"type":"code","language":"python","code":"# FOR: Known iterations\nfor i in range(10):\n    print(i)\n\n# WHILE: Unknown iterations (e.g., until user says stop)\nuser_input = \"\"\nwhile user_input != \"quit\":\n    user_input = input(\"Type quit to exit: \")"},
     {"type":"exercise","prompt":"Write a while loop that prints 5, 4, 3, 2, 1, then ''Go!'' after the loop ends.","starter":"countdown = 5\n\n# Write your while loop\n\n# Print Go! after the loop\n","solution":"countdown = 5\n\nwhile countdown > 0:\n    print(countdown)\n    countdown -= 1\n\nprint(\"Go!\")","expectedOutput":"5\n4\n3\n2\n1\nGo!","hints":["Start with countdown = 5","Loop while countdown > 0","Decrease countdown by 1 each time","Print ''Go!'' AFTER the loop ends"]}
   ]}',
   'exercise', 2, 15, 15, ARRAY['while-loop', 'conditions', 'iteration'], true),
  
  (mod_loops, 'Break and Continue', 'break-continue', 'Control loop flow',
   '{"sections":[
     {"type":"text","content":"Sometimes you need more control over loops. **break** and **continue** help with this."},
     {"type":"text","content":"## Break: Exit the Loop Early"},
     {"type":"code","language":"python","code":"# Find the first even number\nnumbers = [1, 3, 5, 6, 7, 8]\n\nfor num in numbers:\n    if num % 2 == 0:\n        print(f\"Found even number: {num}\")\n        break  # Stop the loop\n    print(f\"Checked {num}\")\n\n# Output:\n# Checked 1\n# Checked 3\n# Checked 5\n# Found even number: 6"},
     {"type":"text","content":"## Continue: Skip to Next Iteration"},
     {"type":"code","language":"python","code":"# Print only odd numbers\nfor i in range(10):\n    if i % 2 == 0:\n        continue  # Skip even numbers\n    print(i)\n\n# Output: 1, 3, 5, 7, 9"},
     {"type":"callout","variant":"tip","content":"break = exit the loop completely. continue = skip rest of this iteration, go to next."},
     {"type":"text","content":"## While Loop with Break"},
     {"type":"code","language":"python","code":"# Keep asking until correct\nwhile True:  # Infinite loop!\n    answer = input(\"What is 2 + 2? \")\n    if answer == \"4\":\n        print(\"Correct!\")\n        break  # Exit the infinite loop\n    print(\"Try again!\")"},
     {"type":"exercise","prompt":"Print numbers 1-10, but skip the number 5 using continue.","starter":"for i in range(1, 11):\n    # Skip 5, print everything else\n    pass  # Remove this and add your code\n","solution":"for i in range(1, 11):\n    if i == 5:\n        continue\n    print(i)","expectedOutput":"1\n2\n3\n4\n6\n7\n8\n9\n10","hints":["Check if i equals 5","Use continue to skip when i is 5","Print i for all other values"]}
   ]}',
   'exercise', 3, 10, 10, ARRAY['break', 'continue', 'loop-control'], true),
  
  (mod_loops, 'Loop Exercises', 'loop-practice', 'Practice looping concepts',
   '{"sections":[
     {"type":"text","content":"Let''s practice various loop patterns with some classic exercises."},
     {"type":"text","content":"## Example 1: Sum of Numbers"},
     {"type":"code","language":"python","code":"# Calculate 1 + 2 + 3 + ... + 10\ntotal = 0\nfor i in range(1, 11):\n    total += i\nprint(total)  # 55"},
     {"type":"text","content":"## Example 2: Counting Pattern"},
     {"type":"code","language":"python","code":"# Count down from 10 to 1\nfor i in range(10, 0, -1):\n    print(i, end=\" \")\nprint(\"Blast off!\")\n# Output: 10 9 8 7 6 5 4 3 2 1 Blast off!"},
     {"type":"text","content":"## Example 3: Multiplication Table"},
     {"type":"code","language":"python","code":"# 5 times table\nnumber = 5\nfor i in range(1, 11):\n    print(f\"{number} x {i} = {number * i}\")"},
     {"type":"exercise","prompt":"Calculate and print the sum of numbers from 1 to 20.","starter":"total = 0\n# Loop through 1 to 20 and add each number to total\n\n# Print the total\n","solution":"total = 0\nfor i in range(1, 21):\n    total += i\nprint(total)","expectedOutput":"210","hints":["Use range(1, 21) for numbers 1-20","Add each number to total with total += i","Print total after the loop ends"]},
     {"type":"exercise","prompt":"Print each character in ''Python'' on a separate line.","starter":"word = \"Python\"\n# Loop through each character and print it\n","solution":"word = \"Python\"\nfor char in word:\n    print(char)","expectedOutput":"P\ny\nt\nh\no\nn","hints":["You can loop directly over a string","for char in word: gives each letter","print(char) outputs each letter"]}
   ]}',
   'exercise', 4, 15, 20, ARRAY['loops', 'practice', 'patterns'], true);

  -- ============================================
  -- Module 6: Functions Introduction
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (fundamentals_path_id, 'Functions Introduction', 'Create reusable blocks of code', 6, true)
  RETURNING id INTO mod_functions_intro;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_functions_intro, 'What are Functions?', 'what-are-functions', 'Introduction to reusable code blocks',
   '{"sections":[
     {"type":"text","content":"**Functions** are reusable blocks of code that perform a specific task. You''ve already used functions like `print()` and `len()`!"},
     {"type":"text","content":"## Creating Your Own Function\n\nUse the `def` keyword:"},
     {"type":"code","language":"python","code":"def say_hello():\n    print(\"Hello, World!\")\n\n# Call the function\nsay_hello()  # Output: Hello, World!\nsay_hello()  # You can call it multiple times!"},
     {"type":"callout","variant":"tip","content":"Think of functions as recipes: you define them once, then use them whenever you need that recipe."},
     {"type":"text","content":"## Functions with Parameters\n\nMake functions flexible by accepting inputs:"},
     {"type":"code","language":"python","code":"def greet(name):\n    print(f\"Hello, {name}!\")\n\ngreet(\"Alice\")  # Hello, Alice!\ngreet(\"Bob\")    # Hello, Bob!"},
     {"type":"text","content":"## Multiple Parameters"},
     {"type":"code","language":"python","code":"def add_numbers(a, b):\n    result = a + b\n    print(result)\n\nadd_numbers(5, 3)   # 8\nadd_numbers(10, 20) # 30"},
     {"type":"exercise","prompt":"Create a function called ''greet'' that takes a ''name'' parameter and prints ''Hi, [name]!''. Then call it with your name.","starter":"# Define your function\n\n\n# Call your function\n","solution":"def greet(name):\n    print(f\"Hi, {name}!\")\n\ngreet(\"Python\")","hints":["Use def greet(name): to define the function","Use print() inside the function","Call with greet(\"YourName\")"]}
   ]}',
   'exercise', 1, 15, 15, ARRAY['functions', 'def', 'parameters'], true),
  
  (mod_functions_intro, 'Return Values', 'return-values', 'Get results back from functions',
   '{"sections":[
     {"type":"text","content":"Functions can give back results using `return`. This is different from just printing!"},
     {"type":"code","language":"python","code":"def add(a, b):\n    return a + b  # Give back the result\n\nresult = add(5, 3)  # Store the returned value\nprint(result)       # 8\n\n# vs printing inside the function\ndef add_print(a, b):\n    print(a + b)  # Just displays, returns None\n\nresult2 = add_print(5, 3)  # result2 is None!\nprint(result2)  # None"},
     {"type":"callout","variant":"important","content":"print() displays to screen. return gives a value back that you can store and use later."},
     {"type":"text","content":"## Using Returned Values"},
     {"type":"code","language":"python","code":"def calculate_area(width, height):\n    return width * height\n\n# Store the result\nroom_area = calculate_area(10, 12)\nprint(f\"Room area: {room_area} square feet\")\n\n# Use directly in expressions\ntotal = calculate_area(5, 5) + calculate_area(3, 3)\nprint(f\"Total area: {total}\")"},
     {"type":"text","content":"## Multiple Return Points"},
     {"type":"code","language":"python","code":"def get_grade(score):\n    if score >= 90:\n        return \"A\"\n    elif score >= 80:\n        return \"B\"\n    elif score >= 70:\n        return \"C\"\n    else:\n        return \"F\"\n\ngrade = get_grade(85)\nprint(grade)  # B"},
     {"type":"exercise","prompt":"Create a function ''multiply'' that takes two numbers and returns their product. Test with multiply(4, 5).","starter":"# Define the multiply function\n\n\n# Test it and print the result\n","solution":"def multiply(a, b):\n    return a * b\n\nresult = multiply(4, 5)\nprint(result)","expectedOutput":"20","hints":["Use return a * b in the function","Store the result: result = multiply(4, 5)","Print the result"]}
   ]}',
   'exercise', 2, 15, 15, ARRAY['functions', 'return', 'values'], true),
  
  (mod_functions_intro, 'Function Practice', 'function-practice', 'Solidify your function skills',
   '{"sections":[
     {"type":"text","content":"Let''s practice writing functions with various patterns."},
     {"type":"text","content":"## Example: Temperature Converter"},
     {"type":"code","language":"python","code":"def celsius_to_fahrenheit(celsius):\n    return (celsius * 9/5) + 32\n\ntemp_f = celsius_to_fahrenheit(25)\nprint(f\"25°C = {temp_f}°F\")  # 77°F"},
     {"type":"text","content":"## Example: Greeting with Default"},
     {"type":"code","language":"python","code":"def greet(name, greeting=\"Hello\"):\n    return f\"{greeting}, {name}!\"\n\nprint(greet(\"Alice\"))           # Hello, Alice!\nprint(greet(\"Bob\", \"Hi there\")) # Hi there, Bob!"},
     {"type":"callout","variant":"tip","content":"Default parameters make some arguments optional. Define them as parameter=default_value."},
     {"type":"text","content":"## Example: Is Even Checker"},
     {"type":"code","language":"python","code":"def is_even(number):\n    return number % 2 == 0\n\nprint(is_even(4))  # True\nprint(is_even(7))  # False\n\n# Use in conditions\nif is_even(10):\n    print(\"10 is even!\")"},
     {"type":"exercise","prompt":"Create a function ''is_positive'' that returns True if a number is positive (> 0), False otherwise. Test with 5 and -3.","starter":"# Define is_positive function\n\n\n# Test with 5\nprint(is_positive(5))\n\n# Test with -3\nprint(is_positive(-3))","solution":"def is_positive(number):\n    return number > 0\n\nprint(is_positive(5))\nprint(is_positive(-3))","expectedOutput":"True\nFalse","hints":["Return number > 0","The comparison itself returns True or False","Call the function and print the result"]},
     {"type":"exercise","prompt":"Create a function ''double'' that returns a number multiplied by 2. Test with 7.","starter":"# Define the double function\n\n\n# Test it\n","solution":"def double(number):\n    return number * 2\n\nprint(double(7))","expectedOutput":"14","hints":["Multiply the parameter by 2","Return the result","Print double(7)"]}
   ]}',
   'exercise', 3, 15, 20, ARRAY['functions', 'practice', 'patterns'], true);

END $$;
