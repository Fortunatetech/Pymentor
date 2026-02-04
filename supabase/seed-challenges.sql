-- Seed data for daily challenges
-- Run this in Supabase SQL Editor after schema.sql and functions.sql

INSERT INTO public.daily_challenges (title, description, difficulty, prompt, starter_code, solution_code, test_cases, hints, xp_reward, date)
VALUES
-- Week 1
('Reverse a String', 'Write a function that reverses a string without using the built-in reverse method.', 'easy',
 'Write a function called reverse_string that takes a string and returns it reversed.',
 'def reverse_string(text):
    # Your code here
    pass

print(reverse_string("hello"))
print(reverse_string("Python"))',
 'def reverse_string(text):
    return text[::-1]',
 '[{"input": "hello", "expected_output": "olleh"}, {"input": "Python", "expected_output": "nohtyP"}]',
 ARRAY['Think about string slicing with a negative step', 'text[::-1] reverses a string'],
 5, CURRENT_DATE),

('FizzBuzz', 'Print numbers 1-20. For multiples of 3 print "Fizz", for 5 print "Buzz", for both print "FizzBuzz".', 'easy',
 'Write a loop that prints numbers 1 to 20 with FizzBuzz rules.',
 'for i in range(1, 21):
    # Your code here
    pass',
 'for i in range(1, 21):
    if i % 3 == 0 and i % 5 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)',
 '[]',
 ARRAY['Use the modulo operator (%) to check divisibility', 'Check for both 3 AND 5 first, then each separately'],
 5, CURRENT_DATE + INTERVAL '1 day'),

('Count Vowels', 'Write a function that counts the number of vowels in a string.', 'easy',
 'Write a function called count_vowels that returns the number of vowels (a, e, i, o, u) in a string.',
 'def count_vowels(text):
    # Your code here
    pass

print(count_vowels("hello world"))
print(count_vowels("Python"))',
 'def count_vowels(text):
    return sum(1 for c in text.lower() if c in "aeiou")',
 '[{"input": "hello world", "expected_output": "3"}, {"input": "Python", "expected_output": "1"}]',
 ARRAY['Convert to lowercase first for easier comparison', 'Loop through each character and check if it is in "aeiou"'],
 5, CURRENT_DATE + INTERVAL '2 days'),

('Sum of Digits', 'Write a function that calculates the sum of all digits in a number.', 'easy',
 'Write a function called digit_sum that takes an integer and returns the sum of its digits.',
 'def digit_sum(n):
    # Your code here
    pass

print(digit_sum(123))
print(digit_sum(9999))',
 'def digit_sum(n):
    return sum(int(d) for d in str(abs(n)))',
 '[{"input": "123", "expected_output": "6"}, {"input": "9999", "expected_output": "36"}]',
 ARRAY['Convert the number to a string to iterate over each digit', 'Use int() to convert each character back to a number'],
 5, CURRENT_DATE + INTERVAL '3 days'),

('Find the Maximum', 'Write a function that finds the maximum value in a list without using the built-in max().', 'easy',
 'Write a function called find_max that returns the largest number in a list.',
 'def find_max(numbers):
    # Your code here (don''t use max()!)
    pass

print(find_max([3, 7, 2, 8, 1]))
print(find_max([-5, -1, -10]))',
 'def find_max(numbers):
    largest = numbers[0]
    for n in numbers[1:]:
        if n > largest:
            largest = n
    return largest',
 '[{"input": "[3, 7, 2, 8, 1]", "expected_output": "8"}, {"input": "[-5, -1, -10]", "expected_output": "-1"}]',
 ARRAY['Start by assuming the first element is the largest', 'Loop through the rest and update if you find something bigger'],
 5, CURRENT_DATE + INTERVAL '4 days'),

('Palindrome Check', 'Write a function that checks if a string is a palindrome (reads the same forwards and backwards).', 'medium',
 'Write a function called is_palindrome that returns True if the string is a palindrome (ignoring case and spaces).',
 'def is_palindrome(text):
    # Your code here
    pass

print(is_palindrome("racecar"))
print(is_palindrome("hello"))
print(is_palindrome("A man a plan a canal Panama"))',
 'def is_palindrome(text):
    cleaned = text.lower().replace(" ", "")
    return cleaned == cleaned[::-1]',
 '[{"input": "racecar", "expected_output": "True"}, {"input": "hello", "expected_output": "False"}]',
 ARRAY['Clean the string first: remove spaces and convert to lowercase', 'Compare the cleaned string with its reverse'],
 10, CURRENT_DATE + INTERVAL '5 days'),

('Word Frequency', 'Write a function that counts how many times each word appears in a sentence.', 'medium',
 'Write a function called word_count that returns a dictionary with words as keys and counts as values.',
 'def word_count(sentence):
    # Your code here
    pass

result = word_count("the cat sat on the mat the cat")
for word, count in sorted(result.items()):
    print(f"{word}: {count}")',
 'def word_count(sentence):
    counts = {}
    for word in sentence.lower().split():
        counts[word] = counts.get(word, 0) + 1
    return counts',
 '[]',
 ARRAY['Use split() to break the sentence into words', 'Use a dictionary and dict.get(key, 0) to count occurrences'],
 10, CURRENT_DATE + INTERVAL '6 days'),

-- Week 2
('List Comprehension', 'Use a list comprehension to filter even numbers and square them.', 'medium',
 'Write a function that takes a list of numbers and returns a new list with only even numbers, squared.',
 'def even_squares(numbers):
    # Use a list comprehension!
    pass

print(even_squares([1, 2, 3, 4, 5, 6]))
print(even_squares([10, 15, 20, 25]))',
 'def even_squares(numbers):
    return [n**2 for n in numbers if n % 2 == 0]',
 '[{"input": "[1, 2, 3, 4, 5, 6]", "expected_output": "[4, 16, 36]"}, {"input": "[10, 15, 20, 25]", "expected_output": "[100, 400]"}]',
 ARRAY['List comprehension syntax: [expression for item in list if condition]', 'Use n % 2 == 0 to check if a number is even'],
 10, CURRENT_DATE + INTERVAL '7 days'),

('Remove Duplicates', 'Write a function that removes duplicates from a list while preserving order.', 'medium',
 'Write a function called remove_duplicates that returns a list with duplicates removed, keeping the first occurrence.',
 'def remove_duplicates(items):
    # Your code here
    pass

print(remove_duplicates([1, 2, 2, 3, 4, 4, 5]))
print(remove_duplicates(["a", "b", "a", "c", "b"]))',
 'def remove_duplicates(items):
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result',
 '[{"input": "[1, 2, 2, 3, 4, 4, 5]", "expected_output": "[1, 2, 3, 4, 5]"}]',
 ARRAY['Use a set to track what you have already seen', 'Loop through and only add items not in the set'],
 10, CURRENT_DATE + INTERVAL '8 days'),

('Caesar Cipher', 'Implement a Caesar cipher that shifts each letter by a given number.', 'hard',
 'Write a function that encrypts text by shifting each letter by a number of positions in the alphabet.',
 'def caesar_cipher(text, shift):
    # Your code here
    pass

print(caesar_cipher("hello", 3))
print(caesar_cipher("xyz", 3))',
 'def caesar_cipher(text, shift):
    result = ""
    for char in text:
        if char.isalpha():
            base = ord("a") if char.islower() else ord("A")
            result += chr((ord(char) - base + shift) % 26 + base)
        else:
            result += char
    return result',
 '[{"input": "hello,3", "expected_output": "khoor"}, {"input": "xyz,3", "expected_output": "abc"}]',
 ARRAY['Use ord() to get the ASCII value and chr() to convert back', 'Use modulo 26 to wrap around the alphabet', 'Handle uppercase and lowercase separately'],
 15, CURRENT_DATE + INTERVAL '9 days'),

('Matrix Transpose', 'Write a function that transposes a matrix (swap rows and columns).', 'hard',
 'Write a function called transpose that takes a 2D list (matrix) and returns its transpose.',
 'def transpose(matrix):
    # Your code here
    pass

matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
result = transpose(matrix)
for row in result:
    print(row)',
 'def transpose(matrix):
    return [[row[i] for row in matrix] for i in range(len(matrix[0]))]',
 '[]',
 ARRAY['The element at [i][j] in the original becomes [j][i] in the transpose', 'Use nested list comprehension'],
 15, CURRENT_DATE + INTERVAL '10 days'),

('Flatten Nested List', 'Write a function that flattens a nested list into a single flat list.', 'hard',
 'Write a function called flatten that takes a nested list and returns a flat list.',
 'def flatten(nested):
    # Your code here
    pass

print(flatten([1, [2, 3], [4, [5, 6]]]))
print(flatten([[1, 2], [3, [4, [5]]]]))',
 'def flatten(nested):
    result = []
    for item in nested:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result',
 '[{"input": "[1, [2, 3], [4, [5, 6]]]", "expected_output": "[1, 2, 3, 4, 5, 6]"}]',
 ARRAY['Use recursion: if an item is a list, flatten it recursively', 'Use isinstance(item, list) to check if an item is a list'],
 15, CURRENT_DATE + INTERVAL '11 days'),

('Binary Search', 'Implement binary search on a sorted list.', 'hard',
 'Write a function called binary_search that returns the index of a target in a sorted list, or -1 if not found.',
 'def binary_search(arr, target):
    # Your code here
    pass

print(binary_search([1, 3, 5, 7, 9, 11, 13], 7))
print(binary_search([1, 3, 5, 7, 9, 11, 13], 6))',
 'def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1',
 '[{"input": "[1,3,5,7,9,11,13],7", "expected_output": "3"}, {"input": "[1,3,5,7,9,11,13],6", "expected_output": "-1"}]',
 ARRAY['Use two pointers: low and high', 'Calculate mid = (low + high) // 2 and compare', 'Narrow the search range based on comparison'],
 15, CURRENT_DATE + INTERVAL '12 days');
