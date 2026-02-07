-- ============================================
-- PyMentor AI: ADVANCED LEVEL (Level 4)
-- Professional Python Development
-- Run in Supabase SQL Editor after seed-intermediate.sql
-- ============================================

INSERT INTO public.learning_paths (title, slug, description, difficulty, icon, estimated_hours, is_published, is_free, order_index)
VALUES (
  'Python Advanced',
  'advanced',
  'Master professional Python development! Async programming, concurrency, design patterns, and real-world applications.',
  'advanced',
  '⚡',
  45,
  true,
  false,
  4
);

DO $$
DECLARE
  advanced_path_id UUID;
  mod_iterators UUID;
  mod_context_managers UUID;
  mod_async UUID;
  mod_concurrency UUID;
  mod_design_patterns UUID;
  mod_packaging UUID;
  mod_performance UUID;
BEGIN
  SELECT id INTO advanced_path_id FROM public.learning_paths WHERE slug = 'advanced';
  
  -- ============================================
  -- Module 1: Iterators & Generators
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (advanced_path_id, 'Iterators & Generators', 'Efficient iteration patterns', 1, false)
  RETURNING id INTO mod_iterators;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_iterators, 'Custom Iterators', 'custom-iterators', 'Build your own iterable objects',
   '{"sections":[
     {"type":"text","content":"**Iterators** are objects that can be iterated over. Every `for` loop uses iterators behind the scenes."},
     {"type":"text","content":"## The Iterator Protocol\n\nTo be iterable, an object needs:\n- `__iter__()` - returns the iterator object\n- `__next__()` - returns the next value"},
     {"type":"code","language":"python","code":"class Countdown:\n    def __init__(self, start):\n        self.start = start\n    \n    def __iter__(self):\n        return self  # Return self as iterator\n    \n    def __next__(self):\n        if self.start <= 0:\n            raise StopIteration  # Signal end\n        current = self.start\n        self.start -= 1\n        return current\n\nfor num in Countdown(5):\n    print(num)  # 5, 4, 3, 2, 1"},
     {"type":"callout","variant":"important","content":"StopIteration tells Python the iteration is complete. The for loop catches this automatically."},
     {"type":"text","content":"## Built-in Iterator Functions"},
     {"type":"code","language":"python","code":"# iter() and next()\nnumbers = [1, 2, 3]\nit = iter(numbers)\n\nprint(next(it))  # 1\nprint(next(it))  # 2\nprint(next(it))  # 3\n# next(it)  # Raises StopIteration"},
     {"type":"exercise","prompt":"Create a simple iterator that yields values 1, 2, 3 when iterated.","starter":"class OneToThree:\n    def __init__(self):\n        self.current = 0\n    \n    def __iter__(self):\n        return self\n    \n    def __next__(self):\n        # Return 1, 2, 3 then stop\n        pass\n\nfor num in OneToThree():\n    print(num)","solution":"class OneToThree:\n    def __init__(self):\n        self.current = 0\n    \n    def __iter__(self):\n        return self\n    \n    def __next__(self):\n        self.current += 1\n        if self.current > 3:\n            raise StopIteration\n        return self.current\n\nfor num in OneToThree():\n    print(num)","expectedOutput":"1\n2\n3","hints":["Increment current each time","Check if current > 3","Raise StopIteration to stop"]}
   ]}',
   'exercise', 1, 20, 20, ARRAY['iterators', 'iter', 'next', 'protocol'], false),
  
  (mod_iterators, 'Generators', 'generators', 'Memory-efficient iteration with yield',
   '{"sections":[
     {"type":"text","content":"**Generators** are iterators written as functions using `yield`. They''re more concise and memory-efficient."},
     {"type":"code","language":"python","code":"def countdown(n):\n    while n > 0:\n        yield n  # Pause and return value\n        n -= 1\n\n# Use like any iterator\nfor num in countdown(5):\n    print(num)  # 5, 4, 3, 2, 1\n\n# Or convert to list\nnumbers = list(countdown(3))  # [3, 2, 1]"},
     {"type":"callout","variant":"tip","content":"yield pauses the function and returns a value. The function resumes from where it left off on next iteration."},
     {"type":"text","content":"## Generator Expressions\n\nLike list comprehensions, but lazy (evaluated on demand):"},
     {"type":"code","language":"python","code":"# List comprehension - creates all values now\nsquares_list = [x**2 for x in range(1000000)]  # Uses lots of memory!\n\n# Generator expression - creates values on demand\nsquares_gen = (x**2 for x in range(1000000))  # Uses almost no memory!\n\nprint(next(squares_gen))  # 0\nprint(next(squares_gen))  # 1"},
     {"type":"text","content":"## Memory Efficiency"},
     {"type":"code","language":"python","code":"import sys\n\nlist_comp = [x for x in range(10000)]\ngen_exp = (x for x in range(10000))\n\nprint(f\"List: {sys.getsizeof(list_comp)} bytes\")  # ~85,000 bytes\nprint(f\"Generator: {sys.getsizeof(gen_exp)} bytes\")  # ~112 bytes!"},
     {"type":"exercise","prompt":"Create a generator function''even_numbers'' that yields even numbers from 0 up to n.","starter":"def even_numbers(n):\n    # Yield even numbers from 0 to n\n    pass\n\nfor num in even_numbers(10):\n    print(num)","solution":"def even_numbers(n):\n    for i in range(0, n + 1, 2):\n        yield i\n\nfor num in even_numbers(10):\n    print(num)","expectedOutput":"0\n2\n4\n6\n8\n10","hints":["Use range(0, n+1, 2) for evens","yield each value","Or use i % 2 == 0 check"]}
   ]}',
   'exercise', 2, 20, 20, ARRAY['generators', 'yield', 'lazy-evaluation'], false);

  -- ============================================
  -- Module 2: Context Managers
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (advanced_path_id, 'Context Managers', 'Resource management with ''with''', 2, false)
  RETURNING id INTO mod_context_managers;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_context_managers, 'Creating Context Managers', 'context-managers', 'Build custom resource managers',
   '{"sections":[
     {"type":"text","content":"**Context managers** handle setup and cleanup automatically. The `with` statement uses them."},
     {"type":"text","content":"## Class-Based Context Manager"},
     {"type":"code","language":"python","code":"class DatabaseConnection:\n    def __init__(self, host):\n        self.host = host\n    \n    def __enter__(self):\n        print(f\"Connecting to {self.host}...\")\n        return self  # This is what ''as'' gets\n    \n    def __exit__(self, exc_type, exc_val, exc_tb):\n        print(\"Closing connection\")\n        return False  # Don''t suppress exceptions\n\nwith DatabaseConnection(\"localhost\") as db:\n    print(\"Doing database work...\")\n# Output:\n# Connecting to localhost...\n# Doing database work...\n# Closing connection"},
     {"type":"text","content":"## Using contextlib\n\nSimpler way using decorators:"},
     {"type":"code","language":"python","code":"from contextlib import contextmanager\n\n@contextmanager\ndef timer():\n    import time\n    start = time.time()\n    yield  # Code in ''with'' block runs here\n    end = time.time()\n    print(f\"Elapsed: {end - start:.2f}s\")\n\nwith timer():\n    import time\n    time.sleep(1)\n# Elapsed: 1.00s"},
     {"type":"callout","variant":"tip","content":"Use @contextmanager for simple cases. Use classes when you need more control."},
     {"type":"exercise","prompt":"Create a context manager that prints ''Starting'' on enter and ''Finished'' on exit.","starter":"from contextlib import contextmanager\n\n@contextmanager\ndef my_context():\n    # Enter: print Starting\n    # Exit: print Finished\n    pass\n\nwith my_context():\n    print(\"Working...\")","solution":"from contextlib import contextmanager\n\n@contextmanager\ndef my_context():\n    print(\"Starting\")\n    yield\n    print(\"Finished\")\n\nwith my_context():\n    print(\"Working...\")","expectedOutput":"Starting\nWorking...\nFinished","hints":["Print before yield","yield pauses for with block","Print after yield"]}
   ]}',
   'exercise', 1, 20, 20, ARRAY['context-manager', 'with', 'contextlib'], false);

  -- ============================================
  -- Module 3: Async Programming
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (advanced_path_id, 'Async Programming', 'Non-blocking concurrent code', 3, false)
  RETURNING id INTO mod_async;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_async, 'Understanding async/await', 'async-await', 'Write non-blocking code with coroutines',
   '{"sections":[
     {"type":"text","content":"**Async programming** lets you handle many operations concurrently without threads. Perfect for I/O-bound tasks."},
     {"type":"code","language":"python","code":"import asyncio\n\nasync def say_hello():\n    print(\"Hello...\")\n    await asyncio.sleep(1)  # Non-blocking pause\n    print(\"...World!\")\n\n# Run the coroutine\nasyncio.run(say_hello())"},
     {"type":"text","content":"## Running Multiple Coroutines"},
     {"type":"code","language":"python","code":"import asyncio\n\nasync def fetch_data(name, delay):\n    print(f\"Fetching {name}...\")\n    await asyncio.sleep(delay)\n    print(f\"{name} complete!\")\n    return f\"{name} data\"\n\nasync def main():\n    # Run concurrently with gather\n    results = await asyncio.gather(\n        fetch_data(\"users\", 2),\n        fetch_data(\"posts\", 1),\n        fetch_data(\"comments\", 3)\n    )\n    print(results)\n\nasyncio.run(main())\n# All three start immediately, complete in ~3 seconds total"},
     {"type":"callout","variant":"important","content":"await can only be used inside async functions. async def creates a coroutine function."},
     {"type":"text","content":"## When to Use Async\n\n✅ **Good for**: Network requests, file I/O, database queries, web servers\n\n❌ **Not for**: CPU-intensive tasks (use multiprocessing instead)"},
     {"type":"exercise","prompt":"Create an async function that awaits for 1 second then returns ''Done!''.","starter":"import asyncio\n\nasync def delayed_response():\n    # Wait 1 second, return ''Done!''\n    pass\n\n# Run it\nresult = asyncio.run(delayed_response())\nprint(result)","solution":"import asyncio\n\nasync def delayed_response():\n    await asyncio.sleep(1)\n    return \"Done!\"\n\nresult = asyncio.run(delayed_response())\nprint(result)","expectedOutput":"Done!","hints":["Use await asyncio.sleep(1)","Return the string","asyncio.run() executes it"]}
   ]}',
   'exercise', 1, 25, 25, ARRAY['async', 'await', 'coroutines', 'asyncio'], false),
  
  (mod_async, 'Async Patterns', 'async-patterns', 'Common async programming patterns',
   '{"sections":[
     {"type":"text","content":"Let''s explore common patterns for async programming."},
     {"type":"text","content":"## Task Creation"},
     {"type":"code","language":"python","code":"import asyncio\n\nasync def background_task():\n    while True:\n        print(\"Background work...\")\n        await asyncio.sleep(2)\n\nasync def main():\n    # Create task (runs in background)\n    task = asyncio.create_task(background_task())\n    \n    # Do other work\n    await asyncio.sleep(5)\n    \n    # Cancel task\n    task.cancel()\n\nasyncio.run(main())"},
     {"type":"text","content":"## Timeouts"},
     {"type":"code","language":"python","code":"import asyncio\n\nasync def slow_operation():\n    await asyncio.sleep(10)\n    return \"Finally done!\"\n\nasync def main():\n    try:\n        result = await asyncio.wait_for(slow_operation(), timeout=2.0)\n    except asyncio.TimeoutError:\n        print(\"Operation timed out!\")\n\nasyncio.run(main())"},
     {"type":"text","content":"## Async HTTP with aiohttp"},
     {"type":"code","language":"python","code":"import aiohttp\nimport asyncio\n\nasync def fetch_url(url):\n    async with aiohttp.ClientSession() as session:\n        async with session.get(url) as response:\n            return await response.text()\n\nasync def main():\n    urls = [\"https://example.com\", \"https://python.org\"]\n    tasks = [fetch_url(url) for url in urls]\n    results = await asyncio.gather(*tasks)\n    print(f\"Fetched {len(results)} pages\")\n\n# asyncio.run(main())"},
     {"type":"callout","variant":"tip","content":"aiohttp is the async equivalent of requests. Use asyncio.gather() to run multiple requests concurrently."}
   ]}',
   'lesson', 2, 20, 20, ARRAY['async-patterns', 'tasks', 'timeout'], false);

  -- ============================================
  -- Module 4: Concurrency
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (advanced_path_id, 'Concurrency & Parallelism', 'Threading, multiprocessing, and when to use each', 4, false)
  RETURNING id INTO mod_concurrency;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_concurrency, 'Threading', 'threading', 'Concurrent execution with threads',
   '{"sections":[
     {"type":"text","content":"**Threading** runs multiple tasks concurrently in the same process. Good for I/O-bound tasks."},
     {"type":"code","language":"python","code":"import threading\nimport time\n\ndef worker(name):\n    print(f\"{name} starting\")\n    time.sleep(2)\n    print(f\"{name} finished\")\n\n# Create threads\nt1 = threading.Thread(target=worker, args=(\"Thread-1\",))\nt2 = threading.Thread(target=worker, args=(\"Thread-2\",))\n\nt1.start()  # Start threads\nt2.start()\n\nt1.join()   # Wait for completion\nt2.join()\n\nprint(\"All done!\")"},
     {"type":"callout","variant":"warning","content":"Python has a GIL (Global Interpreter Lock) that prevents true parallel execution in threads. Use multiprocessing for CPU-bound tasks."},
     {"type":"text","content":"## ThreadPoolExecutor"},
     {"type":"code","language":"python","code":"from concurrent.futures import ThreadPoolExecutor\nimport time\n\ndef download(url):\n    time.sleep(1)  # Simulate download\n    return f\"Downloaded {url}\"\n\nurls = [\"url1\", \"url2\", \"url3\", \"url4\"]\n\nwith ThreadPoolExecutor(max_workers=4) as executor:\n    results = list(executor.map(download, urls))\n\nprint(results)  # Completed in ~1 second instead of 4!"},
     {"type":"exercise","prompt":"Create a thread pool that processes numbers 1-4 through a square function.","starter":"from concurrent.futures import ThreadPoolExecutor\n\ndef square(n):\n    return n ** 2\n\nnumbers = [1, 2, 3, 4]\n\n# Use ThreadPoolExecutor\n","solution":"from concurrent.futures import ThreadPoolExecutor\n\ndef square(n):\n    return n ** 2\n\nnumbers = [1, 2, 3, 4]\n\nwith ThreadPoolExecutor() as executor:\n    results = list(executor.map(square, numbers))\n\nprint(results)","expectedOutput":"[1, 4, 9, 16]","hints":["Use with ThreadPoolExecutor()","executor.map(func, iterable)","Convert to list to get results"]}
   ]}',
   'exercise', 1, 20, 20, ARRAY['threading', 'concurrency', 'threadpool'], false),
  
  (mod_concurrency, 'Multiprocessing', 'multiprocessing', 'True parallelism for CPU-bound tasks',
   '{"sections":[
     {"type":"text","content":"**Multiprocessing** creates separate Python processes, bypassing the GIL for true parallelism."},
     {"type":"code","language":"python","code":"from multiprocessing import Pool\nimport os\n\ndef cpu_intensive(n):\n    result = sum(i * i for i in range(n))\n    print(f\"Process {os.getpid()}: {result}\")\n    return result\n\nif __name__ == \"__main__\":\n    with Pool(4) as pool:  # 4 parallel processes\n        results = pool.map(cpu_intensive, [1000000, 2000000, 3000000])\n    print(f\"Results: {results}\")"},
     {"type":"callout","variant":"important","content":"Always use if __name__ == ''__main__'' with multiprocessing on Windows to prevent infinite spawning!"},
     {"type":"text","content":"## ProcessPoolExecutor"},
     {"type":"code","language":"python","code":"from concurrent.futures import ProcessPoolExecutor\n\ndef heavy_compute(n):\n    return sum(i ** 2 for i in range(n))\n\nif __name__ == \"__main__\":\n    numbers = [10000, 20000, 30000, 40000]\n    \n    with ProcessPoolExecutor(max_workers=4) as executor:\n        results = list(executor.map(heavy_compute, numbers))\n    \n    print(results)"},
     {"type":"text","content":"## When to Use What\n\n| Type | Best For | GIL Affected? |\n|------|----------|---------------|\n| Threading | I/O-bound (network, files) | Yes |\n| Multiprocessing | CPU-bound (calculations) | No |\n| Async | Many I/O operations | Yes (but efficient) |"}
   ]}',
   'lesson', 2, 20, 20, ARRAY['multiprocessing', 'parallelism', 'pool'], false);

  -- ============================================
  -- Module 5: Design Patterns
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (advanced_path_id, 'Design Patterns', 'Write maintainable, scalable code', 5, false)
  RETURNING id INTO mod_design_patterns;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_design_patterns, 'Common Design Patterns', 'design-patterns', 'Solve common problems elegantly',
   '{"sections":[
     {"type":"text","content":"**Design patterns** are proven solutions to common programming problems."},
     {"type":"text","content":"## Singleton Pattern\n\nEnsure only one instance exists:"},
     {"type":"code","language":"python","code":"class DatabaseConnection:\n    _instance = None\n    \n    def __new__(cls):\n        if cls._instance is None:\n            cls._instance = super().__new__(cls)\n            cls._instance.connected = False\n        return cls._instance\n    \n    def connect(self):\n        self.connected = True\n\ndb1 = DatabaseConnection()\ndb2 = DatabaseConnection()\nprint(db1 is db2)  # True - same instance!"},
     {"type":"text","content":"## Factory Pattern\n\nCreate objects without specifying the exact class:"},
     {"type":"code","language":"python","code":"class Dog:\n    def speak(self): return \"Woof!\"\n\nclass Cat:\n    def speak(self): return \"Meow!\"\n\ndef animal_factory(animal_type):\n    animals = {\"dog\": Dog, \"cat\": Cat}\n    return animals.get(animal_type, Dog)()\n\npet = animal_factory(\"cat\")\nprint(pet.speak())  # Meow!"},
     {"type":"text","content":"## Observer Pattern\n\nNotify multiple objects when something changes:"},
     {"type":"code","language":"python","code":"class Newsletter:\n    def __init__(self):\n        self.subscribers = []\n    \n    def subscribe(self, callback):\n        self.subscribers.append(callback)\n    \n    def publish(self, message):\n        for callback in self.subscribers:\n            callback(message)\n\n# Usage\nnews = Newsletter()\nnews.subscribe(lambda msg: print(f\"Email: {msg}\"))\nnews.subscribe(lambda msg: print(f\"SMS: {msg}\"))\n\nnews.publish(\"Breaking news!\")\n# Email: Breaking news!\n# SMS: Breaking news!"},
     {"type":"callout","variant":"tip","content":"Design patterns are guidelines, not rules. Use them when they solve your specific problem."}
   ]}',
   'lesson', 1, 25, 25, ARRAY['design-patterns', 'singleton', 'factory', 'observer'], false);

  -- ============================================
  -- Module 6: Packaging
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (advanced_path_id, 'Packaging & Distribution', 'Share your code professionally', 6, false)
  RETURNING id INTO mod_packaging;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_packaging, 'Creating Python Packages', 'packages', 'Structure and distribute your code',
   '{"sections":[
     {"type":"text","content":"Learn to create professional Python packages that can be shared and installed."},
     {"type":"text","content":"## Package Structure"},
     {"type":"code","language":"text","code":"my_package/\n├── pyproject.toml\n├── README.md\n├── LICENSE\n├── src/\n│   └── my_package/\n│       ├── __init__.py\n│       ├── core.py\n│       └── utils.py\n└── tests/\n    ├── __init__.py\n    └── test_core.py"},
     {"type":"text","content":"## pyproject.toml"},
     {"type":"code","language":"toml","code":"[project]\nname = \"my-package\"\nversion = \"1.0.0\"\ndescription = \"A helpful description\"\nreadme = \"README.md\"\nrequires-python = \">=3.8\"\ndependencies = [\n    \"requests>=2.28.0\",\n]\n\n[build-system]\nrequires = [\"setuptools>=61.0\"]\nbuild-backend = \"setuptools.build_meta\"\n\n[project.scripts]\nmycli = \"my_package.cli:main\""},
     {"type":"text","content":"## Building and Publishing"},
     {"type":"code","language":"bash","code":"# Install build tools\npip install build twine\n\n# Build package\npython -m build\n\n# Upload to PyPI\ntwine upload dist/*"},
     {"type":"callout","variant":"tip","content":"Use a .pypirc file to store your PyPI credentials securely."}
   ]}',
   'lesson', 1, 20, 20, ARRAY['packaging', 'pypi', 'distribution'], false);

  -- ============================================
  -- Module 7: Performance
  -- ============================================
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (advanced_path_id, 'Performance Optimization', 'Write fast, efficient Python', 7, false)
  RETURNING id INTO mod_performance;
  
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod_performance, 'Profiling and Optimization', 'profiling', 'Find and fix performance bottlenecks',
   '{"sections":[
     {"type":"text","content":"**Profiling** helps you find where your code spends the most time so you can optimize effectively."},
     {"type":"text","content":"## Using cProfile"},
     {"type":"code","language":"python","code":"import cProfile\nimport pstats\n\ndef slow_function():\n    total = 0\n    for i in range(1000000):\n        total += i\n    return total\n\n# Profile the function\nwith cProfile.Profile() as pr:\n    slow_function()\n\nstats = pstats.Stats(pr)\nstats.sort_stats(''time'')\nstats.print_stats(10)  # Top 10 time consumers"},
     {"type":"text","content":"## timeit for Quick Benchmarks"},
     {"type":"code","language":"python","code":"import timeit\n\n# Compare two approaches\nlist_comp = timeit.timeit(\n    ''[x**2 for x in range(1000)]'',\n    number=10000\n)\n\nmap_version = timeit.timeit(\n    ''list(map(lambda x: x**2, range(1000)))'',\n    number=10000\n)\n\nprint(f\"List comp: {list_comp:.3f}s\")\nprint(f\"Map: {map_version:.3f}s\")"},
     {"type":"text","content":"## Common Optimizations\n\n1. Use list comprehensions over loops\n2. Avoid global variables\n3. Use generators for large data\n4. Cache results with `functools.lru_cache`\n5. Use built-in functions when possible"},
     {"type":"code","language":"python","code":"from functools import lru_cache\n\n@lru_cache(maxsize=128)\ndef fibonacci(n):\n    if n < 2:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint(fibonacci(100))  # Instant! Without cache: very slow"},
     {"type":"callout","variant":"important","content":"Profile first, optimize second! Don''t optimize code that isn''t a bottleneck."},
     {"type":"exercise","prompt":"Use lru_cache to memoize a factorial function.","starter":"from functools import lru_cache\n\n# Add caching\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(100))","solution":"from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(100))","hints":["Add @lru_cache decorator","Put it above def","maxsize=None for unlimited cache"]}
   ]}',
   'exercise', 1, 20, 20, ARRAY['profiling', 'optimization', 'caching'], false);

END $$;
