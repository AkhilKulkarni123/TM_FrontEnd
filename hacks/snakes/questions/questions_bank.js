
(function () {
  const QUESTIONS = {
    // =====================================================
    // ROW 1 (Squares 6-15) – Lesson 1: Algorithms & Programming Basics
    // =====================================================
    1: [
      {
        prompt: "Which statement best describes an algorithm?",
        options: ["A random guess", "A finite set of steps to solve a problem", "A type of hardware", "A programming language"],
        answer: 1
      },
      {
        prompt: "A loop that repeats until a condition becomes true is an example of:",
        options: ["Sequencing", "Iteration", "Abstraction", "Parallelism"],
        answer: 1
      },
      {
        prompt: "Selection in a program is used to:",
        options: ["Run statements in order", "Choose a path based on a condition", "Repeat code a fixed number of times", "Store data"],
        answer: 1
      },
      {
        prompt: "Which operator tests equality in AP CSP pseudocode?",
        options: ["=", "==", "<-", "!="],
        answer: 1
      },
      {
        prompt: "A Boolean expression evaluates to:",
        options: ["Any number", "true or false", "A list", "A string"],
        answer: 1
      },
      {
        prompt: "A procedure with parameters is most useful for:",
        options: ["Duplicating code", "Reusing a task with different inputs", "Hiding output", "Storing images"],
        answer: 1
      },
      {
        prompt: "Which change most improves a program's readability?",
        options: ["Remove all comments", "Use meaningful variable names", "Shorten all identifiers", "Remove whitespace"],
        answer: 1
      },
      {
        prompt: "If x starts at 0 and the loop repeats while (x < 4) and x increases by 1 each time, how many times does the loop run?",
        options: ["3", "4", "5", "Depends on input"],
        answer: 1
      },
      {
        prompt: "Which is an example of abstraction?",
        options: ["Using a function without knowing its inner details", "Tracing every line of code manually", "Writing the same code twice", "Removing variables"],
        answer: 0
      },
      {
        prompt: "In a conditional statement, the condition is typically:",
        options: ["A loop", "A Boolean expression", "A list", "A comment"],
        answer: 1
      }
    ],

    // =====================================================
    // ROW 2 (Squares 16-25) – Lesson 2: Data Structures
    // =====================================================
    2: [
      {
        prompt: "Which statement about data abstraction is true?",
        options: ["It hides complexity and shows essential features", "It removes the need for algorithms", "It only applies to hardware", "It makes data less useful"],
        answer: 0
      },
      {
        prompt: "A list is most helpful when you need to:",
        options: ["Store a single value", "Store many related values", "Encrypt text", "Control program flow"],
        answer: 1
      },
      {
        prompt: "A list has 8 items. In AP CSP pseudocode, the last valid index is:",
        options: ["7", "8", "0", "9"],
        answer: 0
      },
      {
        prompt: "Which is an example of metadata?",
        options: ["The text of a post", "The time a post was created", "A video itself", "A list of images"],
        answer: 1
      },
      {
        prompt: "Which task is best answered by analyzing data instead of metadata?",
        options: ["Finding which users post most often", "Finding the most active time of day", "Finding common topics in messages", "Counting how many comments a post has"],
        answer: 2
      },
      {
        prompt: "Which is a common data-cleaning step?",
        options: ["Removing duplicates", "Adding randomness", "Encrypting the screen", "Changing the font"],
        answer: 0
      },
      {
        prompt: "Why are lists often better than many separate variables?",
        options: ["Lists are private", "Lists allow iteration over many items", "Lists only store numbers", "Lists remove the need for procedures"],
        answer: 1
      },
      {
        prompt: "A program averages values in a list. This is an example of:",
        options: ["Data abstraction and algorithmic processing", "Physical computing", "Network routing", "Cybersecurity"],
        answer: 0
      },
      {
        prompt: "Which data type is most appropriate for storing a student's age?",
        options: ["String", "Number", "Boolean", "List"],
        answer: 1
      },
      {
        prompt: "Large data sets are useful because they can:",
        options: ["Guarantee accuracy", "Reveal patterns not visible in small samples", "Remove bias", "Avoid storage needs"],
        answer: 1
      }
    ],

    // =====================================================
    // ROW 3 (Squares 26-35) – Lesson 3: Internet & Networking
    // =====================================================
    3: [
      {
        prompt: "Which protocol is commonly used to access Web pages?",
        options: ["HTTP", "SMTP", "FTP", "GPS"],
        answer: 0
      },
      {
        prompt: "DNS is used to:",
        options: ["Translate domain names to IP addresses", "Encrypt data", "Store passwords", "Block ads"],
        answer: 0
      },
      {
        prompt: "On the Internet, data is typically transmitted as:",
        options: ["A single stream", "Packets that may take different paths", "One file per router", "Only over cables"],
        answer: 1
      },
      {
        prompt: "Which device forwards packets between networks?",
        options: ["Router", "Monitor", "Printer", "Keyboard"],
        answer: 0
      },
      {
        prompt: "Latency refers to:",
        options: ["The amount of data", "The delay before data transfer begins", "Encryption strength", "Storage capacity"],
        answer: 1
      },
      {
        prompt: "Which improves availability if one network path fails?",
        options: ["Redundancy", "Compression", "Caching", "Looping"],
        answer: 0
      },
      {
        prompt: "HTTPS provides:",
        options: ["Encrypted communication", "Faster storage", "Shorter URLs", "Free hosting"],
        answer: 0
      },
      {
        prompt: "Which is a subdomain of example.com?",
        options: ["about.example.com", "example.co.uk", "example.com.org", "example.org"],
        answer: 0
      },
      {
        prompt: "A CDN helps Web performance by:",
        options: ["Serving content from locations closer to users", "Encrypting passwords", "Blocking malware", "Replacing DNS"],
        answer: 0
      },
      {
        prompt: "Which HTTP method is primarily used to request data?",
        options: ["GET", "POST", "PUT", "PATCH"],
        answer: 0
      }
    ],

    // =====================================================
    // ROW 4 (Squares 36-45) – Lesson 4: Cybersecurity & Encryption
    // =====================================================
    4: [
      {
        prompt: "Storing passwords securely usually involves:",
        options: ["Plain text", "Hashing", "Emailing them", "Reusing them"],
        answer: 1
      },
      {
        prompt: "Which practice best protects data in transit?",
        options: ["Encryption", "Compression", "Caching", "Duplication"],
        answer: 0
      },
      {
        prompt: "A common defense against phishing is to:",
        options: ["Verify the sender and URL", "Click links quickly", "Share passwords", "Disable updates"],
        answer: 0
      },
      {
        prompt: "Two-factor authentication requires:",
        options: ["Two different forms of verification", "Two passwords only", "No password", "A faster device"],
        answer: 0
      },
      {
        prompt: "Which is an example of malware?",
        options: ["Firewall", "Ransomware", "Password manager", "Proxy"],
        answer: 1
      },
      {
        prompt: "A strong password should:",
        options: ["Be short and simple", "Use only letters", "Combine letters, numbers, and symbols", "Be reused"],
        answer: 2
      },
      {
        prompt: "Digital certificates in browsers are used to:",
        options: ["Verify site identity and encryption keys", "Speed up downloads", "Store cookies", "Block ads"],
        answer: 0
      },
      {
        prompt: "In the CIA triad, confidentiality means:",
        options: ["Data is accessible only to authorized users", "Data is always available", "Data is never changed", "Data is public"],
        answer: 0
      },
      {
        prompt: "Hashing is best described as:",
        options: ["A reversible encryption method", "A one-way transformation", "Image compression", "Network routing"],
        answer: 1
      },
      {
        prompt: "Which action most improves account security?",
        options: ["Reuse passwords", "Enable 2FA", "Share accounts", "Shorten passwords"],
        answer: 1
      }
    ],

    // =====================================================
    // ROW 5 (Squares 46-55) – Lesson 5: Computing Impacts & Data Analysis
    // =====================================================
    5: [
      {
        prompt: "A benefit of large data sets is that they can:",
        options: ["Eliminate bias", "Reveal patterns and trends", "Guarantee privacy", "Remove the need for algorithms"],
        answer: 1
      },
      {
        prompt: "Algorithmic bias is most likely when:",
        options: ["Training data is unrepresentative", "Programs run quickly", "Data is encrypted", "The UI is colorful"],
        answer: 0
      },
      {
        prompt: "A major risk of collecting personal data is:",
        options: ["Data breaches", "Faster computation", "Guaranteed security", "Less storage"],
        answer: 0
      },
      {
        prompt: "Ethical computing practices emphasize:",
        options: ["Transparency and informed consent", "Unlimited data collection", "Hiding data use", "Ignoring user impact"],
        answer: 0
      },
      {
        prompt: "Anonymization is the process of:",
        options: ["Removing identifying information", "Adding personal details", "Posting data publicly", "Deleting all records"],
        answer: 0
      },
      {
        prompt: "Which question can NOT be answered using only time, date, and location data from animal trackers?",
        options: ["How far the animal traveled in a week", "Whether animals travel together", "How movement changes with weather", "Where the animal usually travels"],
        answer: 2
      },
      {
        prompt: "A key trade-off of data compression is:",
        options: ["It always increases file size", "Some techniques reduce quality to save space", "It prevents interception", "It requires the Internet"],
        answer: 1
      },
      {
        prompt: "A simulation is limited because it:",
        options: ["Cannot be changed", "Always needs real-world data", "Uses simplifying assumptions", "Only runs on supercomputers"],
        answer: 2
      },
      {
        prompt: "Which is an example of a positive impact of computing?",
        options: ["Easier access to information", "Guaranteed privacy", "No bias", "No energy use"],
        answer: 0
      },
      {
        prompt: "Which statement about data use is most accurate?",
        options: ["More data always means better decisions", "Data can be misused and cause harm", "Data is always objective", "Data never contains errors"],
        answer: 1
      }
    ]
  };

  // =====================================================
  // VALIDATION & LOGGING
  // =====================================================

  console.log('%c=== Questions Bank Loaded ===', 'color: green; font-weight: bold; font-size: 14px');

  let totalQuestions = 0;
  let isValid = true;

  Object.keys(QUESTIONS).forEach(row => {
    const rowNum = parseInt(row);
    const questions = QUESTIONS[row];
    const count = questions.length;
    totalQuestions += count;

    if (count !== 10) {
      console.error(`❌ Row ${row} has ${count} questions (expected 10)`);
      isValid = false;
    } else {
      console.log(`✅ Row ${row}: ${count} questions`);
    }

    // Validate each question structure
    questions.forEach((q, idx) => {
      if (!q.prompt || !q.options || q.answer === undefined) {
        console.error(`❌ Row ${row}, Index ${idx}: Invalid question structure`, q);
        isValid = false;
      }
      if (q.options.length !== 4) {
        console.error(`❌ Row ${row}, Index ${idx}: Expected 4 options, got ${q.options.length}`);
        isValid = false;
      }
      if (q.answer < 0 || q.answer > 3) {
        console.error(`❌ Row ${row}, Index ${idx}: Invalid answer index ${q.answer}`);
        isValid = false;
      }
    });
  });

  if (isValid) {
    console.log(`%c✅ All questions valid!`, 'color: green; font-weight: bold');
    console.log(`📊 Total: ${totalQuestions} questions`);
    console.log(`📐 Coverage: Squares 6-55 (${totalQuestions} squares)`);
  } else {
    console.error('❌ Questions bank has validation errors!');
  }

  // Test the mapping formula
  console.log('%c=== Testing Square Mapping ===', 'color: blue; font-weight: bold');
  const testSquares = [6, 15, 16, 25, 26, 35, 36, 45, 46, 55];
  testSquares.forEach(square => {
    const row = Math.floor((square - 6) / 10) + 1;
    const index = (square - 6) % 10;
    console.log(`Square ${square} → Row ${row}, Index ${index}`);
  });

  // Make available globally
  window.QUESTIONS_BANK = QUESTIONS;

  console.log('%c=== Ready to use! ===', 'color: green; font-weight: bold; font-size: 14px');
})();
