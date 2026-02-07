-- ============================================
-- PyMentor AI: BEGINNER LEVEL (Level 2)
-- Building on fundamentals with practical skills
-- Run in Supabase SQL Editor after seed-fundamentals.sql
-- ============================================

-- ============================================
-- LEVEL 2: BEGINNER (Building on Basics)
-- ============================================
INSERT INTO public.learning_paths (title, slug, description, difficulty, icon, estimated_hours, is_published, is_free, order_index)
VALUES (
  'Python Beginner',
  'beginner',
  'Level up your Python skills! Learn data structures, file handling, error handling, and build mini projects.',
  'beginner',
  '📘',
  25,
  true,
  false,
  2
);

DO $$
DECLARE
  beginner_path_id UUID;
  mod_data_structures UUID;
  mod_string_mastery UUID;
  mod_functions_deep UUID;
  mod_file_handling UUID;
  mod_error_handling UUID;
  mod_modules UUID;
  mod_mini_projects UUID;
BEGIN
  SELECT id INTO beginner_path_id FROM public.learning_paths WHERE slug = 'beginner';
  
  -- ============================================
  -- Module 1: Data Structures
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (beginner_path_id, 'Data Structures', 'Master lists, tuples, dictionaries, and sets', 1, false)
  RETURNING id INTO mod_data_structures;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_data_structures, 'Lists: Dynamic Collections', 'lists', 'Store and manipulate ordered collections',
   '{"sections":[
     {"type":"text","content":"**Lists** are ordered collections that can hold multiple items. They''re incredibly versatile and one of Python''s most-used data types."},
     {"type":"code","language":"python","code":"# Creating lists\nfruits = [\"apple\", \"banana\", \"cherry\"]\nnumbers = [1, 2, 3, 4, 5]\nmixed = [\"hello\", 42, True, 3.14]\nempty = []\n\nprint(fruits)   # [''apple'', ''banana'', ''cherry'']\nprint(len(fruits))  # 3"},
     {"type":"text","content":"## Accessing Elements\n\nLists are zero-indexed (first item is at index 0):"},
     {"type":"code","language":"python","code":"fruits = [\"apple\", \"banana\", \"cherry\"]\n\nprint(fruits[0])   # apple (first)\nprint(fruits[-1])  # cherry (last)\nprint(fruits[1:3]) # [''banana'', ''cherry''] (slice)"},
     {"type":"text","content":"## Modifying Lists"},
     {"type":"code","language":"python","code":"fruits = [\"apple\", \"banana\"]\n\n# Add items\nfruits.append(\"cherry\")        # Add to end\nfruits.insert(1, \"blueberry\")  # Insert at position\n\n# Remove items\nfruits.remove(\"banana\")         # Remove by value\nlast = fruits.pop()             # Remove and return last\ndel fruits[0]                   # Remove by index\n\nprint(fruits)"},
     {"type":"callout","variant":"tip","content":"Lists are mutable - you can change them after creation! Unlike strings which are immutable."},
     {"type":"exercise","prompt":"Create a list of 3 colors, append a 4th color, and print the list.","starter":"colors = []\n# Add 3 colors, then append a 4th\n","solution":"colors = [\"red\", \"green\", \"blue\"]\ncolors.append(\"yellow\")\nprint(colors)","hints":["Create list with square brackets","Use append() to add the 4th item","Print the entire list"]}
   ]}',
   'exercise', 1, 15, 15, ARRAY['lists', 'append', 'indexing', 'slicing'], false),
  
  (mod_data_structures, 'List Operations', 'list-operations', 'Advanced list manipulation',
   '{"sections":[
     {"type":"text","content":"Let''s explore more powerful list operations."},
     {"type":"text","content":"## List Methods"},
     {"type":"code","language":"python","code":"numbers = [3, 1, 4, 1, 5, 9, 2, 6]\n\nnumbers.sort()           # Sort in place: [1, 1, 2, 3, 4, 5, 6, 9]\nnumbers.reverse()        # Reverse in place\nprint(numbers.count(1))  # Count occurrences: 2\nprint(numbers.index(5))  # Find index: 5\nnumbers.clear()          # Empty the list"},
     {"type":"text","content":"## List Comprehensions\n\nA concise way to create lists:"},
     {"type":"code","language":"python","code":"# Traditional way\nsquares = []\nfor x in range(5):\n    squares.append(x ** 2)\n\n# List comprehension way (same result!)\nsquares = [x ** 2 for x in range(5)]\nprint(squares)  # [0, 1, 4, 9, 16]\n\n# With condition\nevens = [x for x in range(10) if x % 2 == 0]\nprint(evens)  # [0, 2, 4, 6, 8]"},
     {"type":"callout","variant":"tip","content":"List comprehensions are Pythonic and efficient. Master them to write cleaner code!"},
     {"type":"exercise","prompt":"Create a list of squares of numbers 1-5 using a list comprehension.","starter":"# Use list comprehension: [x**2 for x in range(1, 6)]\n","solution":"squares = [x**2 for x in range(1, 6)]\nprint(squares)","expectedOutput":"[1, 4, 9, 16, 25]","hints":["Format: [expression for item in iterable]","Use x**2 for squaring","range(1, 6) gives 1,2,3,4,5"]}
   ]}',
   'exercise', 2, 15, 15, ARRAY['list-methods', 'comprehensions', 'sort'], false),
  
  (mod_data_structures, 'Tuples: Immutable Sequences', 'tuples', 'Fixed collections of data',
   '{"sections":[
     {"type":"text","content":"**Tuples** are like lists, but immutable (cannot be changed). Use them when data shouldn''t be modified."},
     {"type":"code","language":"python","code":"# Creating tuples\ncoordinates = (10, 20)\nrgb = (255, 128, 0)\nsingleton = (42,)  # Note the comma for single item!\n\nprint(coordinates[0])  # 10\nprint(len(rgb))        # 3"},
     {"type":"text","content":"## Why Use Tuples?\n\n1. **Safety**: Data can''t be accidentally modified\n2. **Performance**: Slightly faster than lists\n3. **Dictionary keys**: Tuples can be dict keys, lists cannot"},
     {"type":"code","language":"python","code":"# Tuple unpacking\npoint = (3, 4)\nx, y = point  # Unpack into variables\nprint(f\"x={x}, y={y}\")\n\n# Swapping values (Python trick!)\na = 1\nb = 2\na, b = b, a  # Now a=2, b=1"},
     {"type":"callout","variant":"warning","content":"Tuples are immutable! my_tuple[0] = 5 will cause an error."},
     {"type":"exercise","prompt":"Create a tuple with (name, age, city). Unpack it into 3 variables and print each.","starter":"# Create the tuple\nperson = ()\n\n# Unpack into name, age, city\n\n# Print each variable\n","solution":"person = (\"Alice\", 25, \"London\")\nname, age, city = person\nprint(name)\nprint(age)\nprint(city)","hints":["Create tuple with parentheses","Use a, b, c = tuple to unpack","Print each unpacked variable"]}
   ]}',
   'exercise', 3, 10, 10, ARRAY['tuples', 'immutable', 'unpacking'], false),
  
  (mod_data_structures, 'Dictionaries: Key-Value Pairs', 'dictionaries', 'Store data with meaningful keys',
   '{"sections":[
     {"type":"text","content":"**Dictionaries** store data as key-value pairs. Think of them like a real dictionary: you look up a word (key) to find its definition (value)."},
     {"type":"code","language":"python","code":"# Creating dictionaries\nperson = {\n    \"name\": \"Alice\",\n    \"age\": 25,\n    \"city\": \"London\"\n}\n\n# Accessing values\nprint(person[\"name\"])      # Alice\nprint(person.get(\"age\"))   # 25\nprint(person.get(\"job\", \"Unknown\"))  # Unknown (default)"},
     {"type":"text","content":"## Modifying Dictionaries"},
     {"type":"code","language":"python","code":"person = {\"name\": \"Bob\"}\n\n# Add/Update\nperson[\"age\"] = 30          # Add new key\nperson[\"name\"] = \"Robert\"   # Update existing\n\n# Remove\ndel person[\"age\"]           # Delete key\njob = person.pop(\"job\", None)  # Remove and return\n\nprint(person)"},
     {"type":"text","content":"## Iterating Over Dictionaries"},
     {"type":"code","language":"python","code":"person = {\"name\": \"Alice\", \"age\": 25}\n\n# Keys\nfor key in person:\n    print(key)\n\n# Values\nfor value in person.values():\n    print(value)\n\n# Both\nfor key, value in person.items():\n    print(f\"{key}: {value}\")"},
     {"type":"exercise","prompt":"Create a dict for a book with ''title'', ''author'', ''year''. Print the title.","starter":"book = {}\n# Add title, author, year\n","solution":"book = {\n    \"title\": \"Python Guide\",\n    \"author\": \"John Doe\",\n    \"year\": 2024\n}\nprint(book[\"title\"])","hints":["Use curly braces with key: value pairs","Keys should be strings in quotes","Access with dict[\"key\"]"]}
   ]}',
   'exercise', 4, 15, 15, ARRAY['dictionaries', 'key-value', 'iteration'], false),
  
  (mod_data_structures, 'Sets: Unique Collections', 'sets', 'Collections without duplicates',
   '{"sections":[
     {"type":"text","content":"**Sets** are unordered collections of unique elements. Perfect for removing duplicates and set operations."},
     {"type":"code","language":"python","code":"# Creating sets\nfruits = {\"apple\", \"banana\", \"cherry\"}\nnumbers = set([1, 2, 2, 3, 3, 3])  # {1, 2, 3}\nempty_set = set()  # Not {} (that''s an empty dict!)\n\nprint(numbers)  # {1, 2, 3} - duplicates removed!"},
     {"type":"text","content":"## Set Operations"},
     {"type":"code","language":"python","code":"a = {1, 2, 3, 4}\nb = {3, 4, 5, 6}\n\nprint(a | b)  # Union: {1, 2, 3, 4, 5, 6}\nprint(a & b)  # Intersection: {3, 4}\nprint(a - b)  # Difference: {1, 2}\nprint(a ^ b)  # Symmetric diff: {1, 2, 5, 6}"},
     {"type":"text","content":"## Practical Use: Remove Duplicates"},
     {"type":"code","language":"python","code":"emails = [\"a@x.com\", \"b@x.com\", \"a@x.com\", \"c@x.com\"]\nunique_emails = list(set(emails))\nprint(unique_emails)  # [''a@x.com'', ''b@x.com'', ''c@x.com'']"},
     {"type":"exercise","prompt":"Given a list with duplicates [1, 2, 2, 3, 3, 3], convert to set and print the length.","starter":"numbers = [1, 2, 2, 3, 3, 3]\n# Convert to set and print length\n","solution":"numbers = [1, 2, 2, 3, 3, 3]\nunique = set(numbers)\nprint(len(unique))","expectedOutput":"3","hints":["Use set() to convert list to set","Sets automatically remove duplicates","Use len() to count unique items"]}
   ]}',
   'exercise', 5, 10, 10, ARRAY['sets', 'unique', 'union', 'intersection'], false);

  -- ============================================
  -- Module 2: String Mastery
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (beginner_path_id, 'String Mastery', 'Advanced text manipulation techniques', 2, false)
  RETURNING id INTO mod_string_mastery;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_string_mastery, 'String Methods Deep Dive', 'string-methods-deep', 'Master all essential string methods',
   '{"sections":[
     {"type":"text","content":"Strings have many powerful built-in methods. Let''s explore the most useful ones."},
     {"type":"text","content":"## Case Manipulation"},
     {"type":"code","language":"python","code":"text = \"Hello World\"\n\nprint(text.upper())      # HELLO WORLD\nprint(text.lower())      # hello world\nprint(text.title())      # Hello World\nprint(text.capitalize()) # Hello world\nprint(text.swapcase())   # hELLO wORLD"},
     {"type":"text","content":"## Searching and Checking"},
     {"type":"code","language":"python","code":"text = \"Python is awesome!\"\n\nprint(text.find(\"is\"))      # 7 (index where found)\nprint(text.find(\"java\"))    # -1 (not found)\nprint(text.count(\"o\"))      # 2\nprint(text.startswith(\"Py\")) # True\nprint(text.endswith(\"!\"))    # True\nprint(\"is\" in text)          # True"},
     {"type":"text","content":"## Cleaning and Modifying"},
     {"type":"code","language":"python","code":"text = \"  Hello World  \"\n\nprint(text.strip())         # \"Hello World\" (trim both sides)\nprint(text.lstrip())        # \"Hello World  \" (trim left)\nprint(text.rstrip())        # \"  Hello World\" (trim right)\nprint(text.replace(\"World\", \"Python\"))  # \"  Hello Python  \""},
     {"type":"exercise","prompt":"Clean the string ''  HELLO  '' by stripping whitespace and converting to lowercase.","starter":"text = \"  HELLO  \"\n# Clean and print\n","solution":"text = \"  HELLO  \"\ncleaned = text.strip().lower()\nprint(cleaned)","expectedOutput":"hello","hints":["Use strip() to remove whitespace","Use lower() to lowercase","Chain methods: text.strip().lower()"]}
   ]}',
   'exercise', 1, 10, 10, ARRAY['string-methods', 'strip', 'case'], false),
  
  (mod_string_mastery, 'Split and Join', 'split-join', 'Breaking apart and combining strings',
   '{"sections":[
     {"type":"text","content":"**split()** breaks strings into lists. **join()** combines lists into strings."},
     {"type":"code","language":"python","code":"# Split a sentence into words\nsentence = \"Hello World Python\"\nwords = sentence.split()  # Split by whitespace\nprint(words)  # [''Hello'', ''World'', ''Python'']\n\n# Split by custom separator\ndata = \"apple,banana,cherry\"\nfruits = data.split(\",\")\nprint(fruits)  # [''apple'', ''banana'', ''cherry'']"},
     {"type":"text","content":"## Joining Strings"},
     {"type":"code","language":"python","code":"words = [\"Hello\", \"World\"]\n\n# Join with space\nsentence = \" \".join(words)\nprint(sentence)  # \"Hello World\"\n\n# Join with different separators\nprint(\"-\".join(words))   # \"Hello-World\"\nprint(\"\".join(words))    # \"HelloWorld\"\nprint(\", \".join(words))  # \"Hello, World\""},
     {"type":"callout","variant":"tip","content":"Remember: separator.join(list) - the separator goes BEFORE .join()"},
     {"type":"exercise","prompt":"Split ''one,two,three'' by comma and join with '' - '' (space-dash-space).","starter":"text = \"one,two,three\"\n# Split, then join with \" - \"\n","solution":"text = \"one,two,three\"\nparts = text.split(\",\")\nresult = \" - \".join(parts)\nprint(result)","expectedOutput":"one - two - three","hints":["Use split(\",\") to break by comma","Use \" - \".join(list) to rejoin","Print the result"]}
   ]}',
   'exercise', 2, 10, 10, ARRAY['split', 'join', 'strings'], false);

  -- ============================================
  -- Module 3: Functions Deep Dive
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (beginner_path_id, 'Functions Deep Dive', 'Advanced function concepts', 3, false)
  RETURNING id INTO mod_functions_deep;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_functions_deep, 'Default and Keyword Arguments', 'default-keyword-args', 'Flexible function parameters',
   '{"sections":[
     {"type":"text","content":"Make your functions more flexible with default values and keyword arguments."},
     {"type":"text","content":"## Default Parameters"},
     {"type":"code","language":"python","code":"def greet(name, greeting=\"Hello\"):\n    print(f\"{greeting}, {name}!\")\n\ngreet(\"Alice\")              # Hello, Alice!\ngreet(\"Bob\", \"Hi\")          # Hi, Bob!\ngreet(\"Charlie\", \"Welcome\") # Welcome, Charlie!"},
     {"type":"text","content":"## Keyword Arguments"},
     {"type":"code","language":"python","code":"def create_profile(name, age, city=\"Unknown\", job=\"Student\"):\n    print(f\"{name}, {age}, from {city}, works as {job}\")\n\n# Positional arguments\ncreate_profile(\"Alice\", 25)\n\n# Keyword arguments (any order!)\ncreate_profile(name=\"Bob\", job=\"Developer\", age=30, city=\"NYC\")"},
     {"type":"callout","variant":"important","content":"Default parameters must come AFTER required parameters in the function definition."},
     {"type":"exercise","prompt":"Create a function ''power'' that takes base and exponent (default 2). Test with power(3) and power(2, 4).","starter":"def power(base, exponent=2):\n    # Return base raised to exponent\n    pass\n\nprint(power(3))\nprint(power(2, 4))","solution":"def power(base, exponent=2):\n    return base ** exponent\n\nprint(power(3))\nprint(power(2, 4))","expectedOutput":"9\n16","hints":["Use ** for exponentiation","Default exponent=2","Return base ** exponent"]}
   ]}',
   'exercise', 1, 10, 10, ARRAY['default-params', 'keyword-args', 'functions'], false),
  
  (mod_functions_deep, '*args and **kwargs', 'args-kwargs', 'Variable number of arguments',
   '{"sections":[
     {"type":"text","content":"Sometimes you don''t know how many arguments a function will receive. Use `*args` and `**kwargs`."},
     {"type":"text","content":"## *args: Variable Positional Arguments"},
     {"type":"code","language":"python","code":"def add_all(*numbers):\n    total = 0\n    for num in numbers:\n        total += num\n    return total\n\nprint(add_all(1, 2))           # 3\nprint(add_all(1, 2, 3, 4, 5))  # 15"},
     {"type":"text","content":"## **kwargs: Variable Keyword Arguments"},
     {"type":"code","language":"python","code":"def print_info(**info):\n    for key, value in info.items():\n        print(f\"{key}: {value}\")\n\nprint_info(name=\"Alice\", age=25, city=\"NYC\")\n# name: Alice\n# age: 25\n# city: NYC"},
     {"type":"text","content":"## Combining All Types"},
     {"type":"code","language":"python","code":"def example(required, default=10, *args, **kwargs):\n    print(f\"Required: {required}\")\n    print(f\"Default: {default}\")\n    print(f\"Args: {args}\")\n    print(f\"Kwargs: {kwargs}\")\n\nexample(1, 2, 3, 4, name=\"test\")"},
     {"type":"exercise","prompt":"Create a function ''multiply_all'' that multiplies any number of arguments together.","starter":"def multiply_all(*numbers):\n    # Multiply all numbers together\n    pass\n\nprint(multiply_all(2, 3, 4))","solution":"def multiply_all(*numbers):\n    result = 1\n    for num in numbers:\n        result *= num\n    return result\n\nprint(multiply_all(2, 3, 4))","expectedOutput":"24","hints":["Start result at 1 (not 0!)","Loop through numbers","Multiply result by each number"]}
   ]}',
   'exercise', 2, 15, 15, ARRAY['args', 'kwargs', 'variadic'], false),
  
  (mod_functions_deep, 'Lambda Functions', 'lambda', 'Quick anonymous functions',
   '{"sections":[
     {"type":"text","content":"**Lambda functions** are small, anonymous functions defined in a single line."},
     {"type":"code","language":"python","code":"# Regular function\ndef double(x):\n    return x * 2\n\n# Lambda equivalent\ndouble = lambda x: x * 2\n\nprint(double(5))  # 10"},
     {"type":"text","content":"## Common Use Cases"},
     {"type":"code","language":"python","code":"# Sorting with custom key\npeople = [(\"Alice\", 25), (\"Bob\", 30), (\"Charlie\", 20)]\npeople.sort(key=lambda x: x[1])  # Sort by age\nprint(people)  # [(''Charlie'', 20), (''Alice'', 25), (''Bob'', 30)]\n\n# Filter with lambda\nnumbers = [1, 2, 3, 4, 5, 6]\nevens = list(filter(lambda x: x % 2 == 0, numbers))\nprint(evens)  # [2, 4, 6]\n\n# Map with lambda\nsquares = list(map(lambda x: x**2, numbers))\nprint(squares) # [1, 4, 9, 16, 25, 36]"},
     {"type":"callout","variant":"tip","content":"Use lambda for simple, one-time operations. For complex logic, use regular functions."},
     {"type":"exercise","prompt":"Use sorted() with a lambda to sort words by length: [''python'', ''is'', ''awesome''].","starter":"words = [\"python\", \"is\", \"awesome\"]\n# Sort by length using lambda\n","solution":"words = [\"python\", \"is\", \"awesome\"]\nsorted_words = sorted(words, key=lambda x: len(x))\nprint(sorted_words)","expectedOutput":"[''is'', ''python'', ''awesome'']","hints":["Use sorted(list, key=lambda)","len(x) gives the length","Lambda extracts the sort key"]}
   ]}',
   'exercise', 3, 10, 10, ARRAY['lambda', 'anonymous', 'functional'], false);

  -- ============================================
  -- Module 4: File Handling
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (beginner_path_id, 'File Handling', 'Read and write files', 4, false)
  RETURNING id INTO mod_file_handling;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_file_handling, 'Reading Files', 'reading-files', 'Load data from text files',
   '{"sections":[
     {"type":"text","content":"Python makes it easy to read data from files."},
     {"type":"text","content":"## Basic File Reading"},
     {"type":"code","language":"python","code":"# Method 1: Read entire file\nwith open(\"data.txt\", \"r\") as file:\n    content = file.read()\n    print(content)\n\n# Method 2: Read line by line\nwith open(\"data.txt\", \"r\") as file:\n    for line in file:\n        print(line.strip())  # strip() removes newlines\n\n# Method 3: Read all lines into list\nwith open(\"data.txt\", \"r\") as file:\n    lines = file.readlines()"},
     {"type":"callout","variant":"important","content":"Always use ''with open(...)'' - it automatically closes the file even if an error occurs!"},
     {"type":"text","content":"## File Modes\n\n- `\"r\"` - Read (default)\n- `\"w\"` - Write (overwrites!)\n- `\"a\"` - Append\n- `\"r+\"` - Read and write"},
     {"type":"code","language":"python","code":"# Check if file exists before reading\nimport os\n\nif os.path.exists(\"data.txt\"):\n    with open(\"data.txt\") as file:\n        print(file.read())\nelse:\n    print(\"File not found!\")"},
     {"type":"exercise","prompt":"This is a conceptual exercise. Write code that would read a file called ''notes.txt'' and print each line.","starter":"# Write code to read notes.txt line by line\n","solution":"with open(\"notes.txt\", \"r\") as file:\n    for line in file:\n        print(line.strip())","hints":["Use with open(filename, ''r'') as file","Loop through file directly","Use strip() to remove extra whitespace"]}
   ]}',
   'lesson', 1, 10, 10, ARRAY['file-io', 'reading', 'with'], false),
  
  (mod_file_handling, 'Writing Files', 'writing-files', 'Save data to text files',
   '{"sections":[
     {"type":"text","content":"Writing files is just as easy as reading them."},
     {"type":"code","language":"python","code":"# Write mode (overwrites existing file!)\nwith open(\"output.txt\", \"w\") as file:\n    file.write(\"Hello, World!\\n\")\n    file.write(\"This is line 2\\n\")\n\n# Append mode (adds to existing file)\nwith open(\"output.txt\", \"a\") as file:\n    file.write(\"This is appended\\n\")"},
     {"type":"callout","variant":"warning","content":"Be careful with ''w'' mode - it completely overwrites the file! Use ''a'' to add to existing content."},
     {"type":"text","content":"## Writing Multiple Lines"},
     {"type":"code","language":"python","code":"lines = [\"Line 1\", \"Line 2\", \"Line 3\"]\n\nwith open(\"output.txt\", \"w\") as file:\n    for line in lines:\n        file.write(line + \"\\n\")\n    \n    # Or use writelines (note: no automatic newlines)\n    file.writelines([l + \"\\n\" for l in lines])"},
     {"type":"text","content":"## Practical Example: Logging"},
     {"type":"code","language":"python","code":"from datetime import datetime\n\ndef log_message(message):\n    timestamp = datetime.now().strftime(\"%Y-%m-%d %H:%M:%S\")\n    with open(\"app.log\", \"a\") as file:\n        file.write(f\"[{timestamp}] {message}\\n\")\n\nlog_message(\"Application started\")\nlog_message(\"User logged in\")"},
     {"type":"exercise","prompt":"Write code that creates a file ''greeting.txt'' with ''Hello!'' on line 1 and ''Goodbye!'' on line 2.","starter":"# Create greeting.txt with two lines\n","solution":"with open(\"greeting.txt\", \"w\") as file:\n    file.write(\"Hello!\\n\")\n    file.write(\"Goodbye!\\n\")","hints":["Use ''w'' mode for writing","Don''t forget \\n for newlines","Use with statement"]}
   ]}',
   'lesson', 2, 10, 10, ARRAY['file-io', 'writing', 'append'], false),
  
  (mod_file_handling, 'Working with CSV Files', 'csv-files', 'Handle structured data files',
   '{"sections":[
     {"type":"text","content":"CSV (Comma-Separated Values) files are a common format for data. Python has a built-in `csv` module."},
     {"type":"code","language":"python","code":"import csv\n\n# Reading CSV\nwith open(\"data.csv\", \"r\") as file:\n    reader = csv.reader(file)\n    for row in reader:\n        print(row)  # Each row is a list\n\n# Reading as dictionary (with headers)\nwith open(\"data.csv\", \"r\") as file:\n    reader = csv.DictReader(file)\n    for row in reader:\n        print(row[\"name\"], row[\"age\"])"},
     {"type":"text","content":"## Writing CSV"},
     {"type":"code","language":"python","code":"import csv\n\ndata = [\n    [\"name\", \"age\", \"city\"],\n    [\"Alice\", 25, \"NYC\"],\n    [\"Bob\", 30, \"LA\"]\n]\n\nwith open(\"output.csv\", \"w\", newline=\"\") as file:\n    writer = csv.writer(file)\n    writer.writerows(data)"},
     {"type":"callout","variant":"tip","content":"Always use newline='''' when opening CSV files on Windows to avoid extra blank rows."},
     {"type":"exercise","prompt":"Given data = [[''A'', 1], [''B'', 2]], write the CSV logic concept to save it.","starter":"import csv\n\ndata = [[\"A\", 1], [\"B\", 2]]\n\n# Write to data.csv\n","solution":"import csv\n\ndata = [[\"A\", 1], [\"B\", 2]]\n\nwith open(\"data.csv\", \"w\", newline=\"\") as file:\n    writer = csv.writer(file)\n    writer.writerows(data)","hints":["Import csv module","Use csv.writer()","Use writerows() for multiple rows"]}
   ]}',
   'lesson', 3, 15, 15, ARRAY['csv', 'data', 'tables'], false);

  -- ============================================
  -- Module 5: Error Handling
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (beginner_path_id, 'Error Handling', 'Gracefully handle errors', 5, false)
  RETURNING id INTO mod_error_handling;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_error_handling, 'Try-Except Basics', 'try-except', 'Catch and handle errors gracefully',
   '{"sections":[
     {"type":"text","content":"Errors happen! Instead of crashing, we can catch them and respond appropriately."},
     {"type":"code","language":"python","code":"# Without error handling - crashes!\nnumber = int(input(\"Enter a number: \"))  # User types \"hello\" = CRASH!\n\n# With error handling - graceful\ntry:\n    number = int(input(\"Enter a number: \"))\n    print(f\"You entered: {number}\")\nexcept ValueError:\n    print(\"That''s not a valid number!\")"},
     {"type":"text","content":"## Multiple Exception Types"},
     {"type":"code","language":"python","code":"try:\n    x = int(input(\"Enter x: \"))\n    y = int(input(\"Enter y: \"))\n    result = x / y\n    print(f\"Result: {result}\")\nexcept ValueError:\n    print(\"Please enter valid numbers!\")\nexcept ZeroDivisionError:\n    print(\"Cannot divide by zero!\")\nexcept Exception as e:\n    print(f\"Unexpected error: {e}\")"},
     {"type":"callout","variant":"tip","content":"Catch specific exceptions first, then use a general Exception as a fallback."},
     {"type":"exercise","prompt":"Write code that tries to convert ''abc'' to int and catches the ValueError.","starter":"text = \"abc\"\n\ntry:\n    # Convert text to int\n    pass\nexcept:\n    # Handle the error\n    pass","solution":"text = \"abc\"\n\ntry:\n    number = int(text)\n    print(number)\nexcept ValueError:\n    print(\"Cannot convert to number\")","expectedOutput":"Cannot convert to number","hints":["Use int(text) to convert","Catch ValueError specifically","Print an error message"]}
   ]}',
   'exercise', 1, 15, 15, ARRAY['try', 'except', 'errors'], false),
  
  (mod_error_handling, 'Finally and Else', 'finally-else', 'Complete error handling patterns',
   '{"sections":[
     {"type":"text","content":"The full try-except pattern includes `else` and `finally` clauses."},
     {"type":"code","language":"python","code":"try:\n    file = open(\"data.txt\", \"r\")\n    content = file.read()\nexcept FileNotFoundError:\n    print(\"File not found!\")\nelse:\n    # Runs only if NO exception occurred\n    print(f\"File contents: {content}\")\nfinally:\n    # ALWAYS runs, even if exception occurred\n    print(\"Cleanup complete\")"},
     {"type":"text","content":"## When to Use Each\n\n- **try**: Code that might fail\n- **except**: Handle specific errors\n- **else**: Code to run if NO error\n- **finally**: Cleanup that always runs"},
     {"type":"code","language":"python","code":"def divide(a, b):\n    try:\n        result = a / b\n    except ZeroDivisionError:\n        return None\n    else:\n        return result\n    finally:\n        print(\"Division attempted\")\n\nprint(divide(10, 2))  # 5.0\nprint(divide(10, 0))  # None"},
     {"type":"exercise","prompt":"Write a try-except-finally that prints ''Done'' in finally regardless of errors.","starter":"try:\n    result = 10 / 0\n    print(result)\nexcept:\n    pass\n# Add finally\n","solution":"try:\n    result = 10 / 0\n    print(result)\nexcept ZeroDivisionError:\n    print(\"Error: division by zero\")\nfinally:\n    print(\"Done\")","expectedOutput":"Error: division by zero\nDone","hints":["finally: block runs no matter what","Catch ZeroDivisionError","Print ''Done'' in finally"]}
   ]}',
   'exercise', 2, 10, 10, ARRAY['finally', 'else', 'cleanup'], false);

  -- ============================================
  -- Module 6: Modules and Packages
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (beginner_path_id, 'Modules and Packages', 'Organize and reuse code', 6, false)
  RETURNING id INTO mod_modules;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_modules, 'Importing Modules', 'importing', 'Use Python''s standard library and more',
   '{"sections":[
     {"type":"text","content":"Python has thousands of pre-built modules you can import and use."},
     {"type":"text","content":"## Different Import Styles"},
     {"type":"code","language":"python","code":"# Import entire module\nimport math\nprint(math.sqrt(16))  # 4.0\n\n# Import specific functions\nfrom math import sqrt, pi\nprint(sqrt(16))  # 4.0\nprint(pi)        # 3.14159...\n\n# Import with alias\nimport math as m\nprint(m.sqrt(16))  # 4.0\n\n# Import everything (not recommended)\nfrom math import *"},
     {"type":"callout","variant":"warning","content":"Avoid ''from module import *'' - it clutters your namespace and can cause conflicts."},
     {"type":"text","content":"## Useful Standard Library Modules"},
     {"type":"code","language":"python","code":"import random\nprint(random.randint(1, 10))  # Random number 1-10\nprint(random.choice([\"a\", \"b\", \"c\"]))  # Random pick\n\nimport datetime\ntoday = datetime.date.today()\nprint(today)  # 2024-01-15\n\nimport os\nprint(os.getcwd())  # Current directory"},
     {"type":"exercise","prompt":"Import random and print a random number between 1 and 100.","starter":"# Import random module\n\n# Print random number 1-100\n","solution":"import random\nprint(random.randint(1, 100))","hints":["import random","Use random.randint(min, max)","Range is 1 to 100 inclusive"]}
   ]}',
   'exercise', 1, 10, 10, ARRAY['import', 'modules', 'stdlib'], false);

  -- ============================================
  -- Module 7: Mini Projects
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (beginner_path_id, 'Mini Projects', 'Apply your skills with fun projects', 7, false)
  RETURNING id INTO mod_mini_projects;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_mini_projects, 'Number Guessing Game', 'number-guess', 'Build an interactive guessing game',
   '{"sections":[
     {"type":"text","content":"Let''s build a number guessing game! The computer picks a random number, and you have to guess it."},
     {"type":"text","content":"## Game Logic"},
     {"type":"code","language":"python","code":"import random\n\nsecret = random.randint(1, 100)\nattempts = 0\n\nprint(\"I''m thinking of a number between 1 and 100...\")\n\nwhile True:\n    guess = int(input(\"Your guess: \"))\n    attempts += 1\n    \n    if guess < secret:\n        print(\"Too low!\")\n    elif guess > secret:\n        print(\"Too high!\")\n    else:\n        print(f\"Correct! You got it in {attempts} attempts!\")\n        break"},
     {"type":"text","content":"## Breaking It Down\n\n1. Generate random number\n2. Keep asking for guesses\n3. Give hints (too high/low)\n4. Celebrate when correct\n5. Track attempt count"},
     {"type":"exercise","prompt":"Create a simplified version: generate random number 1-10, and check if a single guess (5) is correct.","starter":"import random\n\nsecret = random.randint(1, 10)\nguess = 5\n\n# Check if guess matches and print result\n","solution":"import random\n\nsecret = random.randint(1, 10)\nguess = 5\n\nif guess == secret:\n    print(\"Correct!\")\nelse:\n    print(f\"Wrong! It was {secret}\")","hints":["Compare guess to secret","Use if/else","Print the secret if wrong"]}
   ]}',
   'project', 1, 20, 25, ARRAY['project', 'game', 'random'], false),
  
  (mod_mini_projects, 'Simple Calculator', 'calculator', 'Build a command-line calculator',
   '{"sections":[
     {"type":"text","content":"Let''s build a calculator that can add, subtract, multiply, and divide!"},
     {"type":"code","language":"python","code":"def add(a, b):\n    return a + b\n\ndef subtract(a, b):\n    return a - b\n\ndef multiply(a, b):\n    return a * b\n\ndef divide(a, b):\n    if b == 0:\n        return \"Error: Division by zero\"\n    return a / b\n\n# Main calculator\nprint(\"Simple Calculator\")\nprint(\"Operations: +, -, *, /\")\n\nnum1 = float(input(\"First number: \"))\nop = input(\"Operation: \")\nnum2 = float(input(\"Second number: \"))\n\nif op == \"+\":\n    result = add(num1, num2)\nelif op == \"-\":\n    result = subtract(num1, num2)\nelif op == \"*\":\n    result = multiply(num1, num2)\nelif op == \"/\":\n    result = divide(num1, num2)\nelse:\n    result = \"Invalid operation\"\n\nprint(f\"Result: {result}\")"},
     {"type":"callout","variant":"tip","content":"Using functions makes the code organized and each operation easy to test!"},
     {"type":"exercise","prompt":"Create a function ''calculate'' that takes num1, op, num2 and returns the result. Test with 10, ''+'', 5.","starter":"def calculate(num1, op, num2):\n    # Return result based on operation\n    pass\n\nprint(calculate(10, \"+\", 5))","solution":"def calculate(num1, op, num2):\n    if op == \"+\":\n        return num1 + num2\n    elif op == \"-\":\n        return num1 - num2\n    elif op == \"*\":\n        return num1 * num2\n    elif op == \"/\":\n        return num1 / num2\n\nprint(calculate(10, \"+\", 5))","expectedOutput":"15","hints":["Use if/elif for each operation","Return the calculation result","Match the operator string"]}
   ]}',
   'project', 2, 20, 25, ARRAY['project', 'calculator', 'functions'], false);

END $$;
