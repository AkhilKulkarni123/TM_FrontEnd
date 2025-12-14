/*
  questions_bank.js
  50 question sets for the second half of the board (squares 6–55)

  Mapping:
    Row 1 -> Squares 6–15 (Lesson 1 topic)
    Row 2 -> Squares 16–25 (Lesson 2 topic)
    Row 3 -> Squares 26–35 (Lesson 3 topic)
    Row 4 -> Squares 36–45 (Lesson 4 topic)
    Row 5 -> Squares 46–55 (Lesson 5 topic)

  Access:
    window.QUESTIONS_BANK[row][index]
      row: 1..5
      index: 0..9

  Question object:
    { prompt: string, options: string[], answer: number }
*/

(function () {
  const QUESTIONS = {
    1: [
      { prompt: "Which variable declaration in JavaScript creates an immutable binding?", options: ["var", "let", "const", "static"], answer: 2 },
      { prompt: "What does an if statement do?", options: ["Repeats code", "Makes a decision", "Creates a function", "Declares a variable"], answer: 1 },
      { prompt: "Which loop continues until a condition is false?", options: ["for", "while", "repeat", "do-until"], answer: 1 },
      { prompt: "What type does the expression (3 < 5) evaluate to?", options: ["Number", "String", "Boolean", "Array"], answer: 2 },
      { prompt: "An algorithm is best described as:", options: ["A random guess", "A step-by-step procedure", "A file type", "A variable"], answer: 1 },
      { prompt: "Which data type stores true/false values?", options: ["String", "Boolean", "Number", "Object"], answer: 1 },
      { prompt: "Which statement exits a loop immediately?", options: ["break", "stop", "exit", "continue"], answer: 0 },
      { prompt: "Why are comments used in code?", options: ["To speed execution", "To document code", "To store values", "To encrypt code"], answer: 1 },
      { prompt: "Which operator checks equality of value and type in JavaScript?", options: ["==", "=", "===", "!=="], answer: 2 },
      { prompt: "Which function prints output to the JavaScript console?", options: ["console.log()", "print()", "echo()", "printf()"], answer: 0 }
    ],

    2: [
      { prompt: "In arrays, the first element index is", options: ["0", "1", "-1", "None"], answer: 0 },
      { prompt: "Which method adds an item to the end of an array?", options: ["push()", "pop()", "shift()", "unshift()"], answer: 0 },
      { prompt: "What does array.length return?", options: ["Last index", "Number of elements", "Sum", "First element"], answer: 1 },
      { prompt: "Objects store data as what?", options: ["Key-value pairs", "Indexed lists", "Plain text", "Binary"], answer: 0 },
      { prompt: "JSON is commonly used for", options: ["Styling webpages", "Data interchange", "Compiling code", "Running servers"], answer: 1 },
      { prompt: "Which method removes the first element from an array?", options: ["pop()", "push()", "shift()", "slice()"], answer: 2 },
      { prompt: "Accessing an array out of bounds returns", options: ["undefined", "0", "Error", "null"], answer: 0 },
      { prompt: "Which structure is good for name→value mapping?", options: ["Array", "Object", "String", "Number"], answer: 1 },
      { prompt: "What does JSON stand for?", options: ["Java Simple Object Notation", "JavaScript Object Notation", "Join Script Object Name", "Just Simple Object Notation"], answer: 1 },
      { prompt: "Which method returns a portion of an array without changing it?", options: ["slice()", "splice()", "shift()", "pop()"], answer: 0 }
    ],

    3: [
      { prompt: "Which protocol is most commonly used for web pages?", options: ["FTP", "SMTP", "HTTP", "SSH"], answer: 2 },
      { prompt: "DNS is used to:", options: ["Encrypt data", "Translate names to IPs", "Store passwords", "Send email"], answer: 1 },
      { prompt: "What identifies a device on a network?", options: ["Protocol", "IP address", "URL", "Service"], answer: 1 },
      { prompt: "Which device forwards packets between networks?", options: ["Switch", "Printer", "Router", "Monitor"], answer: 2 },
      { prompt: "Which HTTP method is used to retrieve data?", options: ["POST", "PUT", "GET", "DELETE"], answer: 2 },
      { prompt: "Common port for HTTP is", options: ["80", "443", "22", "21"], answer: 0 },
      { prompt: "Latency refers to", options: ["Data amount", "Delay in response", "Encryption", "Disk speed"], answer: 1 },
      { prompt: "A CDN helps by", options: ["Increasing latency", "Caching globally", "Encrypting traffic", "Replacing DNS"], answer: 1 },
      { prompt: "What does HTTPS provide?", options: ["No caching", "Encrypted transport", "Faster database", "File storage"], answer: 1 },
      { prompt: "Which part of URL identifies the resource?", options: ["Protocol", "Domain", "Path", "Port"], answer: 2 }
    ],

    4: [
      { prompt: "Which practice is best for storing passwords?", options: ["Plain text", "Hashing", "Emailing them", "Using same everywhere"], answer: 1 },
      { prompt: "HTTPS is primarily used to", options: ["Slow sites", "Encrypt web traffic", "Disable cookies", "Speed up DNS"], answer: 1 },
      { prompt: "Two-factor authentication provides", options: ["Single check", "Two proofs of identity", "Faster login", "No passwords"], answer: 1 },
      { prompt: "Which is an example of malware?", options: ["Antivirus", "Ransomware", "Firewall", "VPN"], answer: 1 },
      { prompt: "Phishing attacks often rely on", options: ["Suspicious links", "Strong passwords", "Encrypted mail", "Backups"], answer: 0 },
      { prompt: "Hashing is", options: ["Reversible encryption", "A one-way transformation", "A type of virus", "A database"], answer: 1 },
      { prompt: "Which improves security on logins?", options: ["Reusing passwords", "Short passwords", "2FA", "Sharing accounts"], answer: 2 },
      { prompt: "A good password policy includes", options: ["Only letters", "Length + complexity", "Using 'password'", "No backups"], answer: 1 },
      { prompt: "Which is a common sign of phishing?", options: ["Unexpected urgency", "Clear instructions", "Official emails always", "Secure links"], answer: 0 },
      { prompt: "Encryption helps by", options: ["Hiding data at rest/in transit", "Deleting data", "Making files smaller", "Speeding up code"], answer: 0 }
    ],

    5: [
      { prompt: "A benefit of analyzing big data is", options: ["Finding patterns and predictions", "Always lower cost", "No privacy concerns", "Less storage needed"], answer: 0 },
      { prompt: "Algorithmic bias can occur when", options: ["Training data reflects unfairness", "You use too many loops", "You encrypt data", "You normalize data"], answer: 0 },
      { prompt: "A major risk of collecting personal data is", options: ["Better privacy", "Data breaches", "Always accurate results", "Unlimited storage"], answer: 1 },
      { prompt: "Ethical computing emphasizes", options: ["Transparency and fairness", "Collecting everything", "Hiding algorithms", "Ignoring consent"], answer: 0 },
      { prompt: "Anonymization tries to", options: ["Add more details", "Remove identifiers", "Publish PII", "Share passwords"], answer: 1 },
      { prompt: "One way to reduce bias is", options: ["Use diverse data", "Use single source", "Ignore outliers", "Use old data"], answer: 0 },
      { prompt: "Transparency in algorithms helps", options: ["Hide decisions", "Explain decision-making", "Make models slower", "Reduce accuracy"], answer: 1 },
      { prompt: "A privacy-preserving practice is", options: ["Collect everything", "Minimize data collection", "Sell user data", "Store forever"], answer: 1 },
      { prompt: "Misused data can cause", options: ["Better UX", "Wrongful profiling", "Faster CPUs", "More disk space"], answer: 1 },
      { prompt: "Ethics in AI involves", options: ["Fairness", "Only performance", "Ignoring users", "Always collecting more"], answer: 0 }
    ]
  };

  // Expose globally for question_template.html to consume
  window.QUESTIONS_BANK = QUESTIONS;
})();
/*
  questions_bank.js
  25 unique question sets for the second half of the board (squares 26–50)

  Mapping:
    Row 1 -> Squares 26–30 (Lesson 1 topic)
    Row 2 -> Squares 31–35 (Lesson 2 topic)
    Row 3 -> Squares 36–40 (Lesson 3 topic)
    Row 4 -> Squares 41–45 (Lesson 4 topic)
    Row 5 -> Squares 46–50 (Lesson 5 topic)

  Access:
    window.QUESTIONS_BANK[row][index]
      row: 1..5
      index: 0..4

  Question object:
    { prompt: string, options: string[], answer: number }
*/

(function () {
  const QUESTIONS = {
    // =========================================================
    // ROW 1 (Squares 26–30) – Programming Basics (Variables, Conditionals, Loops)
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
        prompt: "What is the output type of the expression: 3 < 5 ?",
        options: ["Number", "String", "Boolean", "List"],
        answer: 2
      },
      {
        prompt: "In AP CSP, an algorithm is best described as:",
        options: ["A random guess", "A step-by-step process to solve a problem", "A type of computer", "A data file"],
        answer: 1
      }
      ,
      {
        prompt: "Which data type stores true/false values?",
        options: ["String", "Boolean", "Number", "Array"],
        answer: 1
      },
      {
        prompt: "Which statement exits a loop early in JavaScript?",
        options: ["break", "stop", "exit", "end"],
        answer: 0
      },
      {
        prompt: "What is the purpose of comments in code?",
        options: ["To execute code faster", "To document and explain code", "To hide errors", "To store data"],
        answer: 1
      },
      {
        prompt: "Which operator is used for equality comparison in JavaScript (value only)?",
        options: ["=", "===", "==", "!=="],
        answer: 2
      }
    ],

    // =========================================================
    // ROW 2 (Squares 31–35) – Data Structures (Lists/Arrays, Objects, Indexing)
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
      ,
      {
        prompt: "Which array method removes the first element?",
        options: ["push()", "shift()", "unshift()", "pop()"],
        answer: 1
      },
      {
        prompt: "What is JSON primarily used for?",
        options: ["Styling webpages", "Data interchange", "Compiling code", "Running servers"],
        answer: 1
      },
      {
        prompt: "Which is an example of an associative data structure in JavaScript?",
        options: ["Array", "Object", "String", "Number"],
        answer: 1
      },
      {
        prompt: "Accessing array[index] where index is out of range returns:",
        options: ["undefined", "0", "NaN", "Error"],
        answer: 0
      }
    ],

    // =========================================================
    // ROW 3 (Squares 36–40) – The Internet (HTTP, DNS, IP, Routing)
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
      ,
      {
        prompt: "What port is commonly used for HTTP?",
        options: ["21", "80", "443", "25"],
        answer: 1
      },
      {
        prompt: "Which of these is NOT an IP address format?",
        options: ["IPv4", "IPv6", "MAC", "Both IPv4 and IPv6"],
        answer: 2
      },
      {
        prompt: "What does latency refer to?",
        options: ["Amount of data", "Delay before data is transferred", "Encryption method", "IP address type"],
        answer: 1
      },
      {
        prompt: "A CDN (Content Delivery Network) helps by:",
        options: ["Hosting local servers worldwide to reduce latency", "Storing passwords", "Encrypting emails", "Blocking traffic"],
        answer: 0
      }
    ],

    // =========================================================
    // ROW 4 (Squares 41–45) – Cybersecurity (CIA, Encryption, Hashing, Malware)
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
      ,
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
      },
      {
        prompt: "A strong password should ideally include:",
        options: ["Only letters", "Short memorable words", "A mix of letters, numbers and symbols", "Easily guessable info"],
        answer: 2
      }
      },
      {
        prompt: "Malware that encrypts files and demands payment is called:",
        options: ["Adware", "Spyware", "Ransomware", "Cookie"],
        answer: 2
      },
      {
        prompt: "In the CIA Triad, 'Confidentiality' means:",
        options: ["Data is always available", "Only authorized users can access data", "Data is never changed", "Data is always public"],
        answer: 1
      },
      {
        prompt: "Hashing is different from encryption because hashing is:",
        options: ["Always reversible", "One-way (not designed to be reversed)", "Only used for images", "The same as compression"],
        answer: 1
      }
    ],

    // =========================================================
    // ROW 5 (Squares 46–50) – Data & Impacts (Big Data, Bias, Ethics)
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
        answer: 1

      ,
      {
        prompt: "What is one way to reduce bias in datasets?",
        options: ["Use diverse and representative training data", "Only use data from a single source", "Ignore edge cases", "Use outdated information"],
        answer: 0
      },
      {
        prompt: "Why is transparency important in algorithms?",
        options: ["So users can understand how decisions are made", "To hide workings", "To speed up processing", "To reduce memory"],
        answer: 0
      },
      {
        prompt: "Which principle helps protect user privacy?",
        options: ["Collecting unnecessary data", "Minimizing data collection", "Storing everything forever", "Selling personal data"],
        answer: 1
      },
      {
        prompt: "What is a potential harm of misused data?",
        options: ["Better customer experiences", "Wrongful profiling and discrimination", "Faster algorithms", "Higher uptime"],
        answer: 1
      }
  // Expose globally for question_template.html to consume
  window.QUESTIONS_BANK = QUESTIONS;
})();
