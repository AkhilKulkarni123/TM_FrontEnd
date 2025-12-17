

(function () {
  const QUESTIONS = {
    // =====================================================
    // ROW 1 (Squares 6-15) – Programming Basics
    // =====================================================
    1: [
      { 
        prompt: "Which keyword declares a constant in JavaScript?", 
        options: ["var", "const", "let", "static"], 
        answer: 1 
      },
      { 
        prompt: "What does an if statement do?", 
        options: ["Repeats code", "Makes a decision", "Stores data", "Runs at end"], 
        answer: 1 
      },
      { 
        prompt: "Which loop is best when count is unknown?", 
        options: ["for", "while", "print", "end"], 
        answer: 1 
      },
      { 
        prompt: "What type is: 3 < 5?", 
        options: ["Number", "String", "Boolean", "List"], 
        answer: 2 
      },
      { 
        prompt: "An algorithm is:", 
        options: ["Random guess", "Step-by-step process", "Computer type", "Data file"], 
        answer: 1 
      },
      { 
        prompt: "Which type stores true/false?", 
        options: ["String", "Boolean", "Number", "Array"], 
        answer: 1 
      },
      { 
        prompt: "Exit a loop early with:", 
        options: ["break", "stop", "exit", "end"], 
        answer: 0 
      },
      { 
        prompt: "Comments are for:", 
        options: ["Speed", "Documentation", "Hiding errors", "Storage"], 
        answer: 1 
      },
      { 
        prompt: "Equality (value only):", 
        options: ["=", "===", "==", "!=="], 
        answer: 2 
      },
      { 
        prompt: "console.log() does what?", 
        options: ["Stores vars", "Prints to console", "Creates loops", "Deletes"], 
        answer: 1 
      }
    
    ],

    // =====================================================
    // ROW 2 (Squares 16-25) – Data Structures
    // =====================================================
    2: [
      { 
        prompt: "First array element index:", 
        options: ["0", "1", "-1", "10"], 
        answer: 0 
      },
      { 
        prompt: "Add to array end:", 
        options: ["push()", "pop()", "shift()", "splice()"], 
        answer: 0 
      },
      { 
        prompt: "array.length returns:", 
        options: ["Last value", "First index", "Element count", "Sum"], 
        answer: 2 
      },
      { 
        prompt: "Objects store as:", 
        options: ["Key-value pairs", "Numbers only", "Strings only", "Indexes only"], 
        answer: 0 
      },
      { 
        prompt: "Why use lists?", 
        options: ["Store many items", "Avoid variables", "Run faster", "Stop loops"], 
        answer: 0 
      },
      { 
        prompt: "Remove first element:", 
        options: ["push()", "shift()", "unshift()", "pop()"], 
        answer: 1 
      },
      { 
        prompt: "JSON is for:", 
        options: ["Styling", "Data interchange", "Compiling", "Servers"], 
        answer: 1 
      },
      { 
        prompt: "Associative structure:", 
        options: ["Array", "Object", "String", "Number"], 
        answer: 1 
      },
      { 
        prompt: "Out-of-bounds returns:", 
        options: ["undefined", "0", "NaN", "Error"], 
        answer: 0 
      },
      { 
        prompt: "Get array portion:", 
        options: ["slice()", "splice()", "shift()", "pop()"], 
        answer: 0 
      }
    
    ],

    // =====================================================
    // ROW 3 (Squares 26-35) – Internet
    // =====================================================
    3: [
      { 
        prompt: "Web page protocol:", 
        options: ["HTTP", "SMTP", "FTP", "Bluetooth"], 
        answer: 0 
      },
      { 
        prompt: "DNS does what:", 
        options: ["Encrypt", "Translate domains to IP", "Store passwords", "Speed RAM"], 
        answer: 1 
      },
      { 
        prompt: "IP address identifies:", 
        options: ["Language", "Device", "Search engine", "Password"], 
        answer: 1 
      },
      { 
        prompt: "Forwards packets:", 
        options: ["Monitor", "Router", "Speaker", "Keyboard"], 
        answer: 1 
      },
      { 
        prompt: "Retrieve data method:", 
        options: ["POST", "PUT", "GET", "PATCH"], 
        answer: 2 
      },
      { 
        prompt: "HTTP port:", 
        options: ["21", "80", "443", "25"], 
        answer: 1 
      },
      { 
        prompt: "Latency is:", 
        options: ["Data amount", "Delay", "Encryption", "Disk speed"], 
        answer: 1 
      },
      { 
        prompt: "CDN helps by:", 
        options: ["Global hosting", "Storing passwords", "Encrypting", "Blocking"], 
        answer: 0 
      },
      { 
        prompt: "HTTPS provides:", 
        options: ["No caching", "Encrypted transport", "Faster DB", "File storage"], 
        answer: 1 
      },
      { 
        prompt: "URL resource part:", 
        options: ["Protocol", "Domain", "Path", "Port"], 
        answer: 2 
      }
    ],

    // =====================================================
    // ROW 4 (Squares 36-45) – Cybersecurity
    // =====================================================
    4: [
      { 
        prompt: "Store passwords as:", 
        options: ["Plain text", "Hash", "Email", "Same everywhere"], 
        answer: 1 
      },
      { 
        prompt: "HTTPS does:", 
        options: ["Slows sites", "Secures traffic", "Disables cookies", "Speeds DNS"], 
        answer: 1 
      },
      { 
        prompt: "Phishing defense:", 
        options: ["Click all", "Verify sender", "Share passwords", "Respond fast"], 
        answer: 1 
      },
      { 
        prompt: "2FA improves security by:", 
        options: ["Two proofs", "Same password twice", "No passwords", "Faster"], 
        answer: 0 
      },
      { 
        prompt: "Malware example:", 
        options: ["Antivirus", "Ransomware", "Firewall", "VPN"], 
        answer: 1 
      },
      { 
        prompt: "Strong password has:", 
        options: ["Letters only", "Short words", "Letters+numbers+symbols", "Guessable"], 
        answer: 2 
      },
      { 
        prompt: "Ransomware does:", 
        options: ["Speeds PC", "Encrypts for payment", "Cleans viruses", "Updates"], 
        answer: 1 
      },
      { 
        prompt: "Confidentiality means:", 
        options: ["Always available", "Authorized access only", "Never changed", "Public"], 
        answer: 1 
      },
      { 
        prompt: "Hashing is:", 
        options: ["Reversible", "One-way", "For images", "Compression"], 
        answer: 1 
      },
      { 
        prompt: "Secure login:", 
        options: ["Reuse passwords", "Short passwords", "2FA", "Share accounts"], 
        answer: 2 
      }
    ],

    // =====================================================
    // ROW 5 (Squares 46-55) – Data & Ethics
    // =====================================================
    5: [
      { 
        prompt: "Big data benefit:", 
        options: ["Less info", "Pattern detection", "No privacy risk", "No power"], 
        answer: 1 
      },
      { 
        prompt: "Bias happens when:", 
        options: ["Unfair training data", "Fast computers", "Loops used", "Encryption"], 
        answer: 0 
      },
      { 
        prompt: "Data risk:", 
        options: ["Strong privacy", "Breaches", "Unlimited storage", "Accuracy"], 
        answer: 1 
      },
      { 
        prompt: "Ethics emphasizes:", 
        options: ["Transparency", "Hiding use", "No security", "Unlimited collection"], 
        answer: 0 
      },
      { 
        prompt: "Anonymization means:", 
        options: ["Add details", "Remove identifiers", "Post publicly", "Delete internet"], 
        answer: 1 
      },
      { 
        prompt: "Reduce bias:", 
        options: ["Diverse data", "Single source", "Ignore outliers", "Old data"], 
        answer: 0 
      },
      { 
        prompt: "Transparency for:", 
        options: ["Understanding decisions", "Hiding", "Speed", "Less memory"], 
        answer: 0 
      },
      { 
        prompt: "Privacy practice:", 
        options: ["Collect all", "Minimize collection", "Sell data", "Store forever"], 
        answer: 1 
      },
      { 
        prompt: "Misused data causes:", 
        options: ["Better UX", "Wrongful profiling", "Faster CPU", "More disk"], 
        answer: 1 
      },
      { 
        prompt: "AI ethics involves:", 
        options: ["Fairness", "Performance only", "Ignoring users", "More collection"], 
        answer: 0 
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
