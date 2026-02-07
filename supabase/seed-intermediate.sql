-- ============================================
-- PyMentor AI: INTERMEDIATE LEVEL (Level 3)
-- Object-Oriented Programming & API Integration
-- Run in Supabase SQL Editor after seed-beginner.sql
-- ============================================

INSERT INTO public.learning_paths (title, slug, description, difficulty, icon, estimated_hours, is_published, is_free, order_index)
VALUES (
  'Python Intermediate',
  'intermediate',
  'Take your Python skills to the next level! Master OOP, work with APIs, and handle complex data.',
  'intermediate',
  '🚀',
  35,
  true,
  false,
  3
);

DO $$
DECLARE
  intermediate_path_id UUID;
  mod_oop_basics UUID;
  mod_oop_advanced UUID;
  mod_decorators UUID;
  mod_regex UUID;
  mod_json_api UUID;
  mod_databases UUID;
  mod_testing UUID;
BEGIN
  SELECT id INTO intermediate_path_id FROM public.learning_paths WHERE slug = 'intermediate';
  
  -- ============================================
  -- Module 1: OOP Basics
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (intermediate_path_id, 'Object-Oriented Programming Basics', 'Learn classes, objects, and methods', 1, false)
  RETURNING id INTO mod_oop_basics;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_oop_basics, 'Introduction to Classes', 'intro-classes', 'Creating your first class',
   '{"sections":[
     {"type":"text","content":"**Classes** are blueprints for creating objects. Objects bundle data (attributes) and behavior (methods) together."},
     {"type":"text","content":"## Creating a Class"},
     {"type":"code","language":"python","code":"class Dog:\n    def __init__(self, name, breed):\n        self.name = name      # Instance attribute\n        self.breed = breed\n    \n    def bark(self):\n        print(f\"{self.name} says Woof!\")\n\n# Create objects (instances)\nmy_dog = Dog(\"Max\", \"Labrador\")\nprint(my_dog.name)    # Max\nmy_dog.bark()         # Max says Woof!"},
     {"type":"callout","variant":"important","content":"__init__ is the constructor - it runs when you create a new object. ''self'' refers to the instance being created."},
     {"type":"text","content":"## Multiple Objects"},
     {"type":"code","language":"python","code":"dog1 = Dog(\"Max\", \"Labrador\")\ndog2 = Dog(\"Bella\", \"Poodle\")\n\nprint(dog1.name)  # Max\nprint(dog2.name)  # Bella\n\n# Each object is independent!\ndog1.bark()  # Max says Woof!\ndog2.bark()  # Bella says Woof!"},
     {"type":"exercise","prompt":"Create a class ''Person'' with name and age attributes. Add a method ''greet'' that prints a greeting.","starter":"class Person:\n    # Define __init__ and greet method\n    pass\n\n# Create a person and call greet\n","solution":"class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n    \n    def greet(self):\n        print(f\"Hi, I''m {self.name}!\")\n\np = Person(\"Alice\", 25)\np.greet()","expectedOutput":"Hi, I''m Alice!","hints":["Use def __init__(self, name, age)","Store as self.name and self.age","greet() should use self.name"]}
   ]}',
   'exercise', 1, 20, 20, ARRAY['class', 'init', 'self', 'methods'], false),
  
  (mod_oop_basics, 'Instance vs Class Attributes', 'instance-class-attrs', 'Understanding attribute scopes',
   '{"sections":[
     {"type":"text","content":"Attributes can belong to individual instances or be shared across all instances of a class."},
     {"type":"code","language":"python","code":"class Dog:\n    species = \"Canis familiaris\"  # Class attribute (shared)\n    \n    def __init__(self, name):\n        self.name = name  # Instance attribute (unique)\n\ndog1 = Dog(\"Max\")\ndog2 = Dog(\"Bella\")\n\nprint(dog1.species)  # Canis familiaris\nprint(dog2.species)  # Canis familiaris (same!)\n\nprint(dog1.name)     # Max\nprint(dog2.name)     # Bella (different!)"},
     {"type":"text","content":"## Class Attribute Use Cases"},
     {"type":"code","language":"python","code":"class Counter:\n    count = 0  # Tracks total instances\n    \n    def __init__(self):\n        Counter.count += 1\n\nc1 = Counter()\nc2 = Counter()\nc3 = Counter()\nprint(Counter.count)  # 3"},
     {"type":"callout","variant":"tip","content":"Use class attributes for data shared by all instances. Use instance attributes for unique per-object data."},
     {"type":"exercise","prompt":"Create a class ''Car'' with class attribute ''wheels = 4'' and instance attributes ''make'' and ''model''.","starter":"class Car:\n    # Add class attribute and __init__\n    pass\n\ncar = Car(\"Toyota\", \"Camry\")\nprint(f\"{car.make} {car.model} has {car.wheels} wheels\")","solution":"class Car:\n    wheels = 4\n    \n    def __init__(self, make, model):\n        self.make = make\n        self.model = model\n\ncar = Car(\"Toyota\", \"Camry\")\nprint(f\"{car.make} {car.model} has {car.wheels} wheels\")","expectedOutput":"Toyota Camry has 4 wheels","hints":["Class attributes are defined outside __init__","Instance attributes use self.","Access both with car.attribute"]}
   ]}',
   'exercise', 2, 15, 15, ARRAY['class-attrs', 'instance-attrs'], false),
  
  (mod_oop_basics, 'Properties and Encapsulation', 'properties', 'Controlling attribute access',
   '{"sections":[
     {"type":"text","content":"**Encapsulation** means controlling access to object data. Use **properties** to add validation and computed attributes."},
     {"type":"code","language":"python","code":"class BankAccount:\n    def __init__(self, balance):\n        self._balance = balance  # Convention: _ means \"private\"\n    \n    @property\n    def balance(self):\n        return self._balance\n    \n    @balance.setter\n    def balance(self, value):\n        if value < 0:\n            raise ValueError(\"Balance cannot be negative!\")\n        self._balance = value\n\naccount = BankAccount(100)\nprint(account.balance)  # 100\naccount.balance = 50    # Uses setter\n# account.balance = -10  # Raises error!"},
     {"type":"callout","variant":"tip","content":"The underscore _ prefix is a naming convention meaning ''this is internal, don''t access directly''."},
     {"type":"text","content":"## Computed Properties"},
     {"type":"code","language":"python","code":"class Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n    \n    @property\n    def area(self):\n        return self.width * self.height\n\nrect = Rectangle(10, 5)\nprint(rect.area)  # 50 (computed on access)"},
     {"type":"exercise","prompt":"Create a class ''Circle'' with radius. Add a property ''area'' that returns π * r².","starter":"import math\n\nclass Circle:\n    def __init__(self, radius):\n        self.radius = radius\n    \n    # Add area property\n\ncircle = Circle(5)\nprint(round(circle.area, 2))","solution":"import math\n\nclass Circle:\n    def __init__(self, radius):\n        self.radius = radius\n    \n    @property\n    def area(self):\n        return math.pi * self.radius ** 2\n\ncircle = Circle(5)\nprint(round(circle.area, 2))","expectedOutput":"78.54","hints":["Use @property decorator","Return math.pi * self.radius ** 2","Access as circle.area (no parentheses)"]}
   ]}',
   'exercise', 3, 15, 15, ARRAY['properties', 'encapsulation', 'getters-setters'], false);

  -- ============================================
  -- Module 2: OOP Advanced
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (intermediate_path_id, 'Advanced OOP', 'Inheritance, polymorphism, and magic methods', 2, false)
  RETURNING id INTO mod_oop_advanced;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_oop_advanced, 'Inheritance', 'inheritance', 'Creating class hierarchies',
   '{"sections":[
     {"type":"text","content":"**Inheritance** lets you create a new class based on an existing one, inheriting its attributes and methods."},
     {"type":"code","language":"python","code":"class Animal:\n    def __init__(self, name):\n        self.name = name\n    \n    def speak(self):\n        print(\"Some sound\")\n\nclass Dog(Animal):  # Dog inherits from Animal\n    def speak(self):  # Override parent method\n        print(f\"{self.name} says Woof!\")\n\nclass Cat(Animal):\n    def speak(self):\n        print(f\"{self.name} says Meow!\")\n\ndog = Dog(\"Max\")\ndog.speak()  # Max says Woof!"},
     {"type":"text","content":"## Using super()"},
     {"type":"code","language":"python","code":"class Animal:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\nclass Dog(Animal):\n    def __init__(self, name, age, breed):\n        super().__init__(name, age)  # Call parent constructor\n        self.breed = breed\n\ndog = Dog(\"Max\", 3, \"Labrador\")\nprint(f\"{dog.name}, {dog.age} years, {dog.breed}\")"},
     {"type":"callout","variant":"important","content":"super() calls the parent class''s method. Essential when extending parent functionality."},
     {"type":"exercise","prompt":"Create Vehicle with make/model, then Car that adds num_doors. Use super() properly.","starter":"class Vehicle:\n    def __init__(self, make, model):\n        self.make = make\n        self.model = model\n\nclass Car(Vehicle):\n    # Add num_doors via super()\n    pass\n\ncar = Car(\"Toyota\", \"Camry\", 4)\nprint(f\"{car.make} {car.model}, {car.num_doors} doors\")","solution":"class Vehicle:\n    def __init__(self, make, model):\n        self.make = make\n        self.model = model\n\nclass Car(Vehicle):\n    def __init__(self, make, model, num_doors):\n        super().__init__(make, model)\n        self.num_doors = num_doors\n\ncar = Car(\"Toyota\", \"Camry\", 4)\nprint(f\"{car.make} {car.model}, {car.num_doors} doors\")","expectedOutput":"Toyota Camry, 4 doors","hints":["Car inherits from Vehicle","Use super().__init__(make, model)","Add self.num_doors after super call"]}
   ]}',
   'exercise', 1, 20, 20, ARRAY['inheritance', 'super', 'override'], false),
  
  (mod_oop_advanced, 'Magic Methods', 'magic-methods', 'Customize object behavior with dunder methods',
   '{"sections":[
     {"type":"text","content":"**Magic methods** (dunder methods) let you customize how objects behave with operators and built-in functions."},
     {"type":"code","language":"python","code":"class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    \n    def __str__(self):\n        return f\"Point({self.x}, {self.y})\"\n    \n    def __repr__(self):\n        return f\"Point({self.x}, {self.y})\"\n    \n    def __add__(self, other):\n        return Point(self.x + other.x, self.y + other.y)\n\np1 = Point(1, 2)\np2 = Point(3, 4)\n\nprint(p1)       # Point(1, 2) - uses __str__\nprint(p1 + p2)  # Point(4, 6) - uses __add__"},
     {"type":"text","content":"## Common Magic Methods\n\n- `__str__`: String for users (print)\n- `__repr__`: String for developers\n- `__len__`: Length (len(obj))\n- `__eq__`: Equality (==)\n- `__lt__`: Less than (<)\n- `__add__`: Addition (+)"},
     {"type":"code","language":"python","code":"class Playlist:\n    def __init__(self, name):\n        self.name = name\n        self.songs = []\n    \n    def __len__(self):\n        return len(self.songs)\n    \n    def __contains__(self, song):\n        return song in self.songs\n\nplaylist = Playlist(\"Favorites\")\nplaylist.songs = [\"Song A\", \"Song B\"]\nprint(len(playlist))      # 2\nprint(\"Song A\" in playlist)  # True"},
     {"type":"exercise","prompt":"Add __len__ to a class Bag that returns the count of its items list.","starter":"class Bag:\n    def __init__(self):\n        self.items = []\n    \n    # Add __len__ method\n\nbag = Bag()\nbag.items = [\"wallet\", \"keys\", \"phone\"]\nprint(len(bag))","solution":"class Bag:\n    def __init__(self):\n        self.items = []\n    \n    def __len__(self):\n        return len(self.items)\n\nbag = Bag()\nbag.items = [\"wallet\", \"keys\", \"phone\"]\nprint(len(bag))","expectedOutput":"3","hints":["Define def __len__(self):","Return len(self.items)","len(bag) now works!"]}
   ]}',
   'exercise', 2, 15, 15, ARRAY['magic-methods', 'dunder', 'operators'], false),
  
  (mod_oop_advanced, 'Polymorphism', 'polymorphism', 'Same interface, different implementations',
   '{"sections":[
     {"type":"text","content":"**Polymorphism** means \"many forms\" — different classes can have methods with the same name but different implementations."},
     {"type":"code","language":"python","code":"class Dog:\n    def speak(self):\n        return \"Woof!\"\n\nclass Cat:\n    def speak(self):\n        return \"Meow!\"\n\nclass Duck:\n    def speak(self):\n        return \"Quack!\"\n\n# Polymorphism in action\nanimals = [Dog(), Cat(), Duck()]\n\nfor animal in animals:\n    print(animal.speak())  # Different output, same method name!"},
     {"type":"text","content":"## Duck Typing\n\nPython uses \"duck typing\": if it walks like a duck and quacks like a duck, it''s a duck!"},
     {"type":"code","language":"python","code":"def make_it_speak(thing):\n    # Works with ANY object that has speak() method\n    print(thing.speak())\n\nmake_it_speak(Dog())   # Woof!\nmake_it_speak(Cat())   # Meow!\n\n# Even works with custom classes!\nclass Robot:\n    def speak(self):\n        return \"Beep boop!\"\n\nmake_it_speak(Robot())  # Beep boop!"},
     {"type":"callout","variant":"tip","content":"Duck typing is Pythonic! Focus on behavior (methods) rather than type checking."},
     {"type":"exercise","prompt":"Create 2 classes (Square, Circle) with same method ''area()''. Call area() on both.","starter":"class Square:\n    def __init__(self, side):\n        self.side = side\n    # Add area method\n\nclass Circle:\n    def __init__(self, radius):\n        self.radius = radius\n    # Add area method\n\nshapes = [Square(4), Circle(3)]\nfor shape in shapes:\n    print(shape.area())","solution":"import math\n\nclass Square:\n    def __init__(self, side):\n        self.side = side\n    def area(self):\n        return self.side ** 2\n\nclass Circle:\n    def __init__(self, radius):\n        self.radius = radius\n    def area(self):\n        return math.pi * self.radius ** 2\n\nshapes = [Square(4), Circle(3)]\nfor shape in shapes:\n    print(round(shape.area(), 2))","expectedOutput":"16\n28.27","hints":["Square area = side ** 2","Circle area = pi * radius ** 2","Both methods named area()"]}
   ]}',
   'exercise', 3, 15, 15, ARRAY['polymorphism', 'duck-typing', 'interfaces'], false);

  -- ============================================
  -- Module 3: Decorators
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (intermediate_path_id, 'Decorators', 'Modify function behavior elegantly', 3, false)
  RETURNING id INTO mod_decorators;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_decorators, 'Understanding Decorators', 'understanding-decorators', 'What decorators are and how they work',
   '{"sections":[
     {"type":"text","content":"**Decorators** are functions that modify or enhance other functions without changing their code."},
     {"type":"text","content":"## Basic Decorator Pattern"},
     {"type":"code","language":"python","code":"def my_decorator(func):\n    def wrapper():\n        print(\"Before function call\")\n        func()\n        print(\"After function call\")\n    return wrapper\n\n@my_decorator\ndef say_hello():\n    print(\"Hello!\")\n\nsay_hello()\n# Output:\n# Before function call\n# Hello!\n# After function call"},
     {"type":"callout","variant":"tip","content":"@decorator_name is syntactic sugar for: function = decorator_name(function)"},
     {"type":"text","content":"## Decorators with Arguments"},
     {"type":"code","language":"python","code":"def my_decorator(func):\n    def wrapper(*args, **kwargs):  # Accept any arguments\n        print(f\"Calling {func.__name__}\")\n        result = func(*args, **kwargs)\n        print(f\"Finished {func.__name__}\")\n        return result\n    return wrapper\n\n@my_decorator\ndef greet(name):\n    return f\"Hello, {name}!\"\n\nprint(greet(\"Alice\"))"},
     {"type":"exercise","prompt":"Create a decorator ''uppercase'' that converts a function''s return value to uppercase.","starter":"def uppercase(func):\n    def wrapper():\n        # Get result and convert to upper\n        pass\n    return wrapper\n\n@uppercase\ndef greet():\n    return \"hello world\"\n\nprint(greet())","solution":"def uppercase(func):\n    def wrapper():\n        result = func()\n        return result.upper()\n    return wrapper\n\n@uppercase\ndef greet():\n    return \"hello world\"\n\nprint(greet())","expectedOutput":"HELLO WORLD","hints":["Call func() to get result","Use .upper() to convert","Return the uppercase result"]}
   ]}',
   'exercise', 1, 20, 20, ARRAY['decorators', 'wrapper', 'functions'], false),
  
  (mod_decorators, 'Practical Decorators', 'practical-decorators', 'Real-world decorator examples',
   '{"sections":[
     {"type":"text","content":"Let''s look at practical decorators you''ll use in real projects."},
     {"type":"text","content":"## Timing Decorator"},
     {"type":"code","language":"python","code":"import time\n\ndef timer(func):\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = func(*args, **kwargs)\n        end = time.time()\n        print(f\"{func.__name__} took {end - start:.4f} seconds\")\n        return result\n    return wrapper\n\n@timer\ndef slow_function():\n    time.sleep(1)\n    return \"Done!\"\n\nslow_function()  # slow_function took 1.0012 seconds"},
     {"type":"text","content":"## Logging Decorator"},
     {"type":"code","language":"python","code":"def log_call(func):\n    def wrapper(*args, **kwargs):\n        print(f\"Called {func.__name__} with args={args}, kwargs={kwargs}\")\n        result = func(*args, **kwargs)\n        print(f\"{func.__name__} returned {result}\")\n        return result\n    return wrapper\n\n@log_call\ndef add(a, b):\n    return a + b\n\nadd(3, 5)"},
     {"type":"text","content":"## Built-in Decorators\n\nPython has several useful built-in decorators:"},
     {"type":"code","language":"python","code":"class MyClass:\n    @staticmethod\n    def static_method():  # No self needed\n        return \"I don''t need an instance\"\n    \n    @classmethod\n    def class_method(cls):  # Gets class, not instance\n        return f\"I know my class: {cls.__name__}\"\n    \n    @property\n    def computed(self):  # Access like attribute\n        return \"Computed value\"\n\nprint(MyClass.static_method())\nprint(MyClass.class_method())"}
   ]}',
   'lesson', 2, 15, 15, ARRAY['decorators', 'timing', 'logging'], false);

  -- ============================================
  -- Module 4: Regular Expressions
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (intermediate_path_id, 'Regular Expressions', 'Pattern matching with regex', 4, false)
  RETURNING id INTO mod_regex;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_regex, 'Regex Basics', 'regex-basics', 'Introduction to pattern matching',
   '{"sections":[
     {"type":"text","content":"**Regular expressions** (regex) are powerful patterns for matching, finding, and replacing text."},
     {"type":"code","language":"python","code":"import re\n\ntext = \"Hello, World! Contact us at hello@example.com\"\n\n# Find a pattern\nmatch = re.search(r\"World\", text)\nif match:\n    print(f\"Found: {match.group()}\")  # Found: World\n\n# Find all occurrences\nwords = re.findall(r\"\\w+\", text)  # \\w+ = one or more word characters\nprint(words)  # [''Hello'', ''World'', ''Contact'', ...]"},
     {"type":"text","content":"## Common Patterns\n\n- `\\d` - digit (0-9)\n- `\\w` - word character (a-z, A-Z, 0-9, _)\n- `\\s` - whitespace\n- `.` - any character\n- `+` - one or more\n- `*` - zero or more\n- `?` - zero or one"},
     {"type":"code","language":"python","code":"import re\n\n# Email pattern\nemail_pattern = r\"[\\w.+-]+@[\\w-]+\\.[\\w.-]+\"\ntext = \"Contact me at john@example.com or jane@test.org\"\n\nemails = re.findall(email_pattern, text)\nprint(emails)  # [''john@example.com'', ''jane@test.org'']"},
     {"type":"callout","variant":"tip","content":"Use raw strings (r\"...\") for regex to avoid escaping backslashes."},
     {"type":"exercise","prompt":"Find all numbers in the text ''I have 3 cats and 12 dogs'' using regex.","starter":"import re\n\ntext = \"I have 3 cats and 12 dogs\"\n# Find all numbers\n","solution":"import re\n\ntext = \"I have 3 cats and 12 dogs\"\nnumbers = re.findall(r\"\\d+\", text)\nprint(numbers)","expectedOutput":"[''3'', ''12'']","hints":["Use re.findall()","\\d+ matches one or more digits","Returns a list of matches"]}
   ]}',
   'exercise', 1, 15, 15, ARRAY['regex', 'patterns', 're'], false);

  -- ============================================
  -- Module 5: JSON and API
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (intermediate_path_id, 'JSON and APIs', 'Work with web data', 5, false)
  RETURNING id INTO mod_json_api;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_json_api, 'Working with JSON', 'json', 'Parse and create JSON data',
   '{"sections":[
     {"type":"text","content":"**JSON** (JavaScript Object Notation) is the standard format for data exchange. Python''s `json` module makes it easy to work with."},
     {"type":"code","language":"python","code":"import json\n\n# Python dict to JSON string\ndata = {\"name\": \"Alice\", \"age\": 25, \"city\": \"NYC\"}\njson_string = json.dumps(data, indent=2)\nprint(json_string)\n\n# JSON string to Python dict\njson_text = ''{\"name\": \"Bob\", \"score\": 95}''\nparsed = json.loads(json_text)\nprint(parsed[\"name\"])  # Bob"},
     {"type":"text","content":"## File Operations"},
     {"type":"code","language":"python","code":"import json\n\ndata = {\"users\": [\"Alice\", \"Bob\"], \"count\": 2}\n\n# Write to file\nwith open(\"data.json\", \"w\") as f:\n    json.dump(data, f, indent=2)\n\n# Read from file\nwith open(\"data.json\", \"r\") as f:\n    loaded = json.load(f)\nprint(loaded)"},
     {"type":"callout","variant":"tip","content":"dumps/loads = strings. dump/load = files. The ''s'' stands for string!"},
     {"type":"exercise","prompt":"Convert the dict {''name'': ''Python'', ''version'': 3.12} to a JSON string and print it.","starter":"import json\n\ndata = {\"name\": \"Python\", \"version\": 3.12}\n# Convert to JSON and print\n","solution":"import json\n\ndata = {\"name\": \"Python\", \"version\": 3.12}\njson_string = json.dumps(data)\nprint(json_string)","expectedOutput":"{\"name\": \"Python\", \"version\": 3.12}","hints":["Use json.dumps() for string","Pass the dict to dumps()","Print the result"]}
   ]}',
   'exercise', 1, 10, 10, ARRAY['json', 'dumps', 'loads'], false),
  
  (mod_json_api, 'Making API Requests', 'api-requests', 'Fetch data from web APIs',
   '{"sections":[
     {"type":"text","content":"Use the `requests` library to interact with web APIs."},
     {"type":"code","language":"python","code":"import requests\n\n# GET request\nresponse = requests.get(\"https://api.example.com/data\")\n\nif response.status_code == 200:\n    data = response.json()  # Parse JSON response\n    print(data)\nelse:\n    print(f\"Error: {response.status_code}\")"},
     {"type":"text","content":"## Real API Example"},
     {"type":"code","language":"python","code":"import requests\n\n# Free public API example\nresponse = requests.get(\"https://api.github.com/users/python\")\nuser = response.json()\n\nprint(f\"Name: {user[''name'']}\")\nprint(f\"Followers: {user[''followers'']}\")"},
     {"type":"text","content":"## POST Request"},
     {"type":"code","language":"python","code":"import requests\n\nurl = \"https://api.example.com/login\"\ndata = {\"username\": \"user\", \"password\": \"pass\"}\n\nresponse = requests.post(url, json=data)\nprint(response.json())"},
     {"type":"callout","variant":"important","content":"Always check status_code before using the response. 200 = success, 4xx = client error, 5xx = server error."},
     {"type":"exercise","prompt":"This is conceptual: Write code to GET data from a URL and print the status code.","starter":"import requests\n\nurl = \"https://httpbin.org/get\"\n# Make GET request and print status code\n","solution":"import requests\n\nurl = \"https://httpbin.org/get\"\nresponse = requests.get(url)\nprint(response.status_code)","hints":["Use requests.get(url)","Access response.status_code","Print the status code"]}
   ]}',
   'lesson', 2, 15, 15, ARRAY['api', 'requests', 'http'], false);

  -- ============================================
  -- Module 6: Databases
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (intermediate_path_id, 'Working with Databases', 'Store and query data with SQL', 6, false)
  RETURNING id INTO mod_databases;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_databases, 'SQLite Basics', 'sqlite', 'Local database with Python',
   '{"sections":[
     {"type":"text","content":"**SQLite** is a lightweight database that comes built-in with Python."},
     {"type":"code","language":"python","code":"import sqlite3\n\n# Connect (creates file if not exists)\nconn = sqlite3.connect(\"my_database.db\")\ncursor = conn.cursor()\n\n# Create table\ncursor.execute(\"\"\"\n    CREATE TABLE IF NOT EXISTS users (\n        id INTEGER PRIMARY KEY,\n        name TEXT NOT NULL,\n        email TEXT UNIQUE\n    )\n\"\"\")\n\n# Insert data\ncursor.execute(\"INSERT INTO users (name, email) VALUES (?, ?)\", \n               (\"Alice\", \"alice@example.com\"))\n\nconn.commit()  # Save changes\nconn.close()   # Close connection"},
     {"type":"text","content":"## Querying Data"},
     {"type":"code","language":"python","code":"import sqlite3\n\nconn = sqlite3.connect(\"my_database.db\")\ncursor = conn.cursor()\n\n# Select all users\ncursor.execute(\"SELECT * FROM users\")\nusers = cursor.fetchall()\n\nfor user in users:\n    print(f\"ID: {user[0]}, Name: {user[1]}, Email: {user[2]}\")\n\nconn.close()"},
     {"type":"callout","variant":"important","content":"Always use ? placeholders for user input to prevent SQL injection attacks!"},
     {"type":"exercise","prompt":"Create an in-memory SQLite database and create a table called ''products'' with id and name columns.","starter":"import sqlite3\n\nconn = sqlite3.connect(\":memory:\")  # In-memory database\ncursor = conn.cursor()\n\n# Create products table\n\nprint(\"Table created!\")","solution":"import sqlite3\n\nconn = sqlite3.connect(\":memory:\")\ncursor = conn.cursor()\n\ncursor.execute(\"\"\"\n    CREATE TABLE products (\n        id INTEGER PRIMARY KEY,\n        name TEXT NOT NULL\n    )\n\"\"\")\n\nprint(\"Table created!\")","expectedOutput":"Table created!","hints":["Use cursor.execute() with SQL","CREATE TABLE with column definitions",":memory: creates temp database"]}
   ]}',
   'exercise', 1, 20, 20, ARRAY['sqlite', 'database', 'sql'], false);

  -- ============================================
  -- Module 7: Testing
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (intermediate_path_id, 'Testing Your Code', 'Write reliable code with tests', 7, false)
  RETURNING id INTO mod_testing;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_testing, 'Unit Testing with pytest', 'pytest', 'Test your functions automatically',
   '{"sections":[
     {"type":"text","content":"**Testing** ensures your code works correctly. `pytest` is Python''s most popular testing framework."},
     {"type":"code","language":"python","code":"# calculator.py\ndef add(a, b):\n    return a + b\n\ndef divide(a, b):\n    if b == 0:\n        raise ValueError(\"Cannot divide by zero\")\n    return a / b\n\n# test_calculator.py\nimport pytest\nfrom calculator import add, divide\n\ndef test_add():\n    assert add(2, 3) == 5\n    assert add(-1, 1) == 0\n\ndef test_divide():\n    assert divide(10, 2) == 5\n    with pytest.raises(ValueError):\n        divide(10, 0)"},
     {"type":"text","content":"## Running Tests\n\nRun `pytest` in your terminal:\n\n```bash\npytest test_calculator.py\n```\n\nOutput: `2 passed in 0.01s`"},
     {"type":"callout","variant":"tip","content":"Name test files with test_ prefix and test functions with test_ prefix so pytest can find them."},
     {"type":"text","content":"## Test-Driven Development (TDD)\n\n1. Write a failing test\n2. Write code to make it pass\n3. Refactor if needed\n4. Repeat"},
     {"type":"exercise","prompt":"Write a test function for is_even(n) that checks if 4 is even and 5 is not.","starter":"def is_even(n):\n    return n % 2 == 0\n\ndef test_is_even():\n    # Test that 4 is even and 5 is not\n    pass\n\n# Run test\ntest_is_even()\nprint(\"All tests passed!\")","solution":"def is_even(n):\n    return n % 2 == 0\n\ndef test_is_even():\n    assert is_even(4) == True\n    assert is_even(5) == False\n\ntest_is_even()\nprint(\"All tests passed!\")","expectedOutput":"All tests passed!","hints":["Use assert statements","is_even(4) should be True","is_even(5) should be False"]}
   ]}',
   'exercise', 1, 15, 15, ARRAY['testing', 'pytest', 'tdd'], false);

END $$;
