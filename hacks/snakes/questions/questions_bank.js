/*
  questions_bank.js
  25 question sets for the second half of the board (squares 26–50)

  Mapping (5 rows × 5 questions per row):
    Row 6 (Squares 26–30) → Lesson 1 topic (Programming Basics)
    Row 7 (Squares 31–35) → Lesson 2 topic (Data Structures)
    Row 8 (Squares 36–40) → Lesson 3 topic (The Internet)
    Row 9 (Squares 41–45) → Lesson 4 topic (Cybersecurity)
    Row 10 (Squares 46–50) → Lesson 5 topic (Data & Ethics)

  Access:
    window.QUESTIONS_BANK[row][index]
      row: 1..5 (maps to lesson topics 1-5)
      index: 0..4 (5 questions per row)

  Question object:
    { prompt: string, options: string[], answer: number }
*/

(function () {
  const QUESTIONS = {
    // =========================================================
    // ROW 1 (Squares 26–30) – Programming Basics
    // Topic: Variables, Conditionals, Loops, Algorithms
    // =========================================================
    1: [
      {
        prompt: "Which keyword declares a constant in JavaScript?",
        options: ["var", "const", "let", "static"],
        answer: 1
      },
      {
        prompt: "What does an if statement do in a program?",
        options: ["Repeats code forever", "Makes a decision based on a condition", "Stores data in a list", "Runs only at the end"],
        answer: 1
      },
      {
        prompt: "Which loop is best when you don't know how many times you need to repeat?",
        options: ["for loop", "while loop", "print loop", "end loop"],
        answer: 1
      },
      {
        prompt: "What is the output type of the expression: 3 < 5?",
        options: ["Number", "String", "Boolean", "List"],
        answer: 2
      },
      {
        prompt: "In AP CSP, an algorithm is best described as:",
        options: ["A random guess", "A step-by-step process to solve a problem", "A type of computer", "A data file"],
        answer: 1
      }
    
    ],

    // =========================================================
    // ROW 2 (Squares 31–35) – Data Structures
    // Topic: Lists/Arrays, Objects, Indexing, JSON
    // =========================================================
    2: [
      {
        prompt: "In most programming languages, the first element of a list/array is at index:",
        options: ["0", "1", "-1", "10"],
        answer: 0
      },
      {
        prompt: "Which method adds an element to the end of a JavaScript array?",
        options: ["push()", "pop()", "shift()", "splice()"],
        answer: 0
      },
      {
        prompt: "What does array.length return?",
        options: ["The last value", "The first index", "The number of elements", "The sum of elements"],
        answer: 2
      },
      {
        prompt: "Objects (like JSON) store information as:",
        options: ["Key-value pairs", "Only numbers", "Only strings", "Index-only values"],
        answer: 0
      },
      {
        prompt: "Which is the best reason to use a list in a program?",
        options: ["To store many related items in one variable", "To avoid using variables", "To run code faster always", "To stop loops"],
        answer: 0
      }
    
    ],

    // =========================================================
    // ROW 3 (Squares 36–40) – The Internet
    // Topic: HTTP, DNS, IP Addresses, Routing, Protocols
    // =========================================================
    3: [
      {
        prompt: "Which protocol is used to request and deliver web pages?",
        options: ["HTTP", "SMTP", "FTP", "Bluetooth"],
        answer: 0
      },
      {
        prompt: "DNS is used to:",
        options: ["Encrypt data", "Translate domain names into IP addresses", "Store passwords", "Speed up RAM"],
        answer: 1
      },
      {
        prompt: "What does an IP address identify on a network?",
        options: ["A programming language", "A specific device/interface", "A search engine", "A password"],
        answer: 1
      },
      {
        prompt: "Which device forwards packets between networks (home → internet)?",
        options: ["Monitor", "Router", "Speaker", "Keyboard"],
        answer: 1
      },
      {
        prompt: "Which HTTP method is most commonly used to retrieve data from a server?",
        options: ["POST", "PUT", "GET", "PATCH"],
        answer: 2
      }
   
    ],

    // =========================================================
    // ROW 4 (Squares 41–45) – Cybersecurity
    // Topic: Encryption, Hashing, Passwords, Malware, CIA Triad
    // =========================================================
    4: [
      {
        prompt: "Which is a best practice for storing passwords?",
        options: ["Store in plain text", "Hash the password", "Email the password to yourself", "Use the same password everywhere"],
        answer: 1
      },
      {
        prompt: "HTTPS is primarily used to:",
        options: ["Make websites load slower", "Secure web traffic using encryption", "Disable cookies", "Replace IP addresses"],
        answer: 1
      },
      {
        prompt: "Which is a good defense against phishing?",
        options: ["Click all links", "Verify sender and avoid suspicious links", "Share passwords freely", "Respond immediately to demands"],
        answer: 1
      },
      {
        prompt: "Two-factor authentication improves security by:",
        options: ["Requiring two separate proofs of identity", "Using the same password twice", "Removing passwords", "Making devices faster"],
        answer: 0
      },
      {
        prompt: "Which one is an example of malware?",
        options: ["Antivirus", "Ransomware", "Firewall", "VPN"],
        answer: 1
      }
    
    ],

    // =========================================================
    // ROW 5 (Squares 46–50) – Data & Ethics
    // Topic: Big Data, Bias, Privacy, Ethics, Anonymization
    // =========================================================
    5: [
      {
        prompt: "A common benefit of big data is:",
        options: ["Less information", "Better pattern detection and predictions", "No privacy risks", "No need for computing power"],
        answer: 1
      },
      {
        prompt: "Algorithmic bias can happen when:",
        options: ["Training data reflects unfair patterns", "Computers run too fast", "You use a loop", "You encrypt data"],
        answer: 0
      },
      {
        prompt: "Which is a major risk of collecting personal data?",
        options: ["Stronger privacy automatically", "Data breaches and misuse", "Unlimited storage for free", "Always accurate decisions"],
        answer: 1
      },
      {
        prompt: "Ethical computing emphasizes:",
        options: ["Transparency, consent, and fairness", "Hiding how data is used", "Removing security controls", "Collecting data without limits"],
        answer: 0
      },
      {
        prompt: "Anonymization means:",
        options: ["Adding more personal details", "Removing personal identifiers from data", "Posting data publicly", "Deleting the internet"],
        answer: 1
      }
    ]
  };

  // Expose globally for question_template.html to consume
  window.QUESTIONS_BANK = QUESTIONS;
})();
