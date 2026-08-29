/* ═══════════════════════════════════════════════════════════
   CYBER TUTOR AI — Quiz JS
   All logic preserved. Paths updated for Frontend/ structure.
   ═══════════════════════════════════════════════════════════ */

// ── Quiz data bank ──
const QUIZ_DATA = {
  networking: [
    {
      q: 'What does OSI stand for in networking?',
      options: ['Open Systems Interconnection','Open Source Interface','Operational System Integration','Online Security Infrastructure'],
      answer: 0,
      explanation: 'OSI stands for <strong>Open Systems Interconnection</strong>. It is a conceptual model that characterizes communication functions of a network into 7 abstraction layers.'
    },
    {
      q: 'Which port does HTTPS use by default?',
      options: ['80','8080','443','21'],
      answer: 2,
      explanation: '<strong>Port 443</strong> is the default port for HTTPS (HTTP Secure). Port 80 is used for plain HTTP.'
    },
    {
      q: 'What does a firewall primarily do?',
      options: ['Encrypts all traffic','Monitors and controls incoming/outgoing network traffic','Speeds up internet connection','Stores network logs'],
      answer: 1,
      explanation: 'A <strong>firewall</strong> monitors and controls incoming/outgoing network traffic based on predetermined security rules.'
    },
    {
      q: 'Which protocol is used to resolve domain names to IP addresses?',
      options: ['DHCP','ARP','DNS','FTP'],
      answer: 2,
      explanation: '<strong>DNS (Domain Name System)</strong> translates human-readable domain names (like example.com) into IP addresses.'
    },
    {
      q: 'What is the purpose of a VPN?',
      options: ['Speed up browsing','Create a secure, encrypted connection over the internet','Block ads','Manage passwords'],
      answer: 1,
      explanation: 'A <strong>VPN (Virtual Private Network)</strong> creates an encrypted tunnel for your internet traffic, protecting privacy and security.'
    },
  ],
  websec: [
    {
      q: 'What is XSS in web security?',
      options: ['Extreme Security System','Cross-Site Scripting','Cross-Site Request Forgery','XML Security Scheme'],
      answer: 1,
      explanation: '<strong>XSS (Cross-Site Scripting)</strong> is an attack where malicious scripts are injected into web pages viewed by other users.'
    },
    {
      q: 'What does SQL Injection exploit?',
      options: ['Weak passwords','Unsanitized user inputs in SQL queries','Outdated SSL certificates','Misconfigured firewalls'],
      answer: 1,
      explanation: '<strong>SQL Injection</strong> exploits improperly validated inputs to inject malicious SQL code into database queries.'
    },
    {
      q: 'What is CSRF?',
      options: ['Cross-Site Request Forgery','Content Security Response Format','Cryptographic Session Request File','Cross-Site Resource Filter'],
      answer: 0,
      explanation: '<strong>CSRF (Cross-Site Request Forgery)</strong> tricks users into performing unwanted actions on authenticated web applications.'
    },
    {
      q: 'Which OWASP risk involves broken authentication?',
      options: ['A1','A2','A5','A10'],
      answer: 1,
      explanation: '<strong>A2 in OWASP Top 10</strong> covers broken authentication vulnerabilities — weak session management, credential exposure, etc.'
    },
    {
      q: 'What does a Content Security Policy (CSP) help prevent?',
      options: ['DDoS attacks','XSS attacks','Brute force attacks','SQL injection'],
      answer: 1,
      explanation: '<strong>CSP (Content Security Policy)</strong> is a security header that helps prevent XSS attacks by whitelisting content sources.'
    },
  ],
  crypto: [
    {
      q: 'Which algorithm is asymmetric (public-key) encryption?',
      options: ['AES','DES','RSA','3DES'],
      answer: 2,
      explanation: '<strong>RSA</strong> is an asymmetric algorithm using a public key to encrypt and a private key to decrypt.'
    },
    {
      q: 'What is a hash function used for?',
      options: ['Encrypting messages','Creating a fixed-length fingerprint of data','Key exchange','Password generation'],
      answer: 1,
      explanation: 'A <strong>hash function</strong> produces a fixed-size output (digest) from any input. It is one-way and used for data integrity verification.'
    },
    {
      q: 'What is the key length of AES-256?',
      options: ['128 bits','192 bits','256 bits','512 bits'],
      answer: 2,
      explanation: '<strong>AES-256</strong> uses a 256-bit key length, making it extremely secure for symmetric encryption.'
    },
    {
      q: 'What does TLS stand for?',
      options: ['Trusted Link Security','Transport Layer Security','Transmission Lock Standard','Terminal Level Sync'],
      answer: 1,
      explanation: '<strong>TLS (Transport Layer Security)</strong> is the cryptographic protocol that provides security over a computer network (the successor to SSL).'
    },
    {
      q: 'What is a digital signature used for?',
      options: ['Encrypting files','Verifying authenticity and integrity of data','Creating secure passwords','Compressing data'],
      answer: 1,
      explanation: 'A <strong>digital signature</strong> uses asymmetric cryptography to verify that data came from a specific sender and was not tampered with.'
    },
  ],
  linux: [
    {
      q: 'Which command lists files and directories in Linux?',
      options: ['dir','list','ls','show'],
      answer: 2,
      explanation: '`<strong>ls</strong>` lists files. Common flags: `ls -la` shows all files including hidden ones with detailed info.'
    },
    {
      q: 'What permission does `chmod 755` grant?',
      options: ['rwxr-xr-x','rwxrwxrwx','r--r--r--','rw-rw-rw-'],
      answer: 0,
      explanation: '<strong>755</strong> = owner: rwx (7), group: r-x (5), others: r-x (5). The owner can read/write/execute; others can read/execute.'
    },
    {
      q: 'Which command shows running processes?',
      options: ['proc','run','ps','task'],
      answer: 2,
      explanation: '`<strong>ps aux</strong>` shows all running processes. You can also use `top` or `htop` for an interactive view.'
    },
    {
      q: 'What does `sudo` do in Linux?',
      options: ['Shuts down the system','Runs a command as superuser/root','Lists directories','Copies files'],
      answer: 1,
      explanation: '`<strong>sudo</strong>` (Superuser Do) allows running commands with elevated privileges, typically as the root user.'
    },
    {
      q: 'Which file contains user account information in Linux?',
      options: ['/etc/shadow','/etc/passwd','/etc/users','/home/users'],
      answer: 1,
      explanation: '<strong>/etc/passwd</strong> stores basic user info. <strong>/etc/shadow</strong> stores encrypted passwords (only readable by root).'
    },
  ],
  ethical: [
    {
      q: 'What is the first phase of a penetration test?',
      options: ['Exploitation','Scanning','Reconnaissance','Reporting'],
      answer: 2,
      explanation: '<strong>Reconnaissance</strong> (recon) is the first phase — gathering information about the target before any active testing.'
    },
    {
      q: 'What tool is commonly used for network scanning?',
      options: ['Wireshark','Nmap','Metasploit','Burp Suite'],
      answer: 1,
      explanation: '<strong>Nmap</strong> (Network Mapper) is the industry-standard tool for network discovery and security auditing.'
    },
    {
      q: 'What is a zero-day vulnerability?',
      options: ['A vulnerability that lasts 0 days','An unknown vulnerability with no patch available','A vulnerability in zero-trust systems','A new vulnerability database entry'],
      answer: 1,
      explanation: 'A <strong>zero-day</strong> is a previously unknown vulnerability that has no official patch — attackers exploit it before developers can fix it.'
    },
    {
      q: 'Which framework is widely used for developing exploits?',
      options: ['Burp Suite','Nmap','Metasploit','Aircrack-ng'],
      answer: 2,
      explanation: '<strong>Metasploit Framework</strong> is the most widely used open-source penetration testing framework for developing and executing exploits.'
    },
    {
      q: 'What does CVE stand for?',
      options: ['Common Vulnerabilities and Exposures','Cyber Vulnerability Engine','Critical Vulnerability Entry','Common Virus Exposure'],
      answer: 0,
      explanation: '<strong>CVE (Common Vulnerabilities and Exposures)</strong> is a dictionary of publicly disclosed cybersecurity vulnerabilities, each with a unique ID.'
    },
  ],
};

// ── State ──
let selectedTopic = null;
let questions = [];
let currentQ = 0;
let score = 0;
let answered = false;

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  renderTopicSelector();
});

function renderTopicSelector () {
  const topicBtns = document.querySelectorAll('.topic-btn');
  topicBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      topicBtns.forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');
      selectedTopic = btn.dataset.topic;
    });
  });
}

window.startQuiz = function () {
  if (!selectedTopic) {
    showToast('Please select a topic first!', 'error');
    return;
  }
  questions = [...QUIZ_DATA[selectedTopic]].sort(() => Math.random() - 0.5);
  currentQ = 0; score = 0; answered = false;

  document.getElementById('topicSelect').style.display = 'none';
  document.getElementById('quizArea').style.display = 'block';
  document.getElementById('resultScreen').style.display = 'none';
  renderQuestion();
};

function renderQuestion () {
  const q = questions[currentQ];
  const total = questions.length;

  // Progress
  const pct = (currentQ / total) * 100;
  document.getElementById('progressFill').style.width = `${pct}%`;
  document.getElementById('quizArea').querySelector('[role="progressbar"]')
    ?.setAttribute('aria-valuenow', Math.round(pct));
  document.getElementById('qNum').textContent = `Question ${currentQ + 1} of ${total}`;
  document.getElementById('scoreDisplay').textContent = `Score: ${score}/${total}`;

  // Question
  document.getElementById('questionText').textContent = q.q;

  // Options
  const optContainer = document.getElementById('optionsContainer');
  optContainer.innerHTML = '';
  const letters = ['A','B','C','D'];
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.setAttribute('aria-label', `Option ${letters[i]}: ${opt}`);
    btn.innerHTML = `<span class="opt-letter" aria-hidden="true">${letters[i]}</span><span>${opt}</span>`;
    btn.addEventListener('click', () => selectAnswer(i, btn));
    optContainer.appendChild(btn);
  });

  // Hide explanation + next
  const expl = document.getElementById('explanation');
  expl.classList.remove('visible');
  expl.innerHTML = '';
  document.getElementById('nextBtn').style.display = 'none';
  answered = false;
}

function selectAnswer (index, clickedBtn) {
  if (answered) return;
  answered = true;

  const q = questions[currentQ];
  const allBtns = document.querySelectorAll('.quiz-option');
  allBtns.forEach(b => b.disabled = true);

  if (index === q.answer) {
    clickedBtn.classList.add('correct');
    clickedBtn.setAttribute('aria-label', clickedBtn.getAttribute('aria-label') + ' — Correct!');
    score++;
    showToast('✅ Correct!');
  } else {
    clickedBtn.classList.add('wrong');
    clickedBtn.setAttribute('aria-label', clickedBtn.getAttribute('aria-label') + ' — Incorrect');
    allBtns[q.answer].classList.add('correct');
    showToast('❌ Incorrect', 'error');
  }

  // Show explanation
  const expl = document.getElementById('explanation');
  expl.innerHTML = `<strong>Explanation:</strong> ${q.explanation}`;
  expl.classList.add('visible');

  // Update score
  document.getElementById('scoreDisplay').textContent = `Score: ${score}/${questions.length}`;

  // Show next button
  const nextBtn = document.getElementById('nextBtn');
  nextBtn.style.display = 'inline-flex';
  const isLast = currentQ === questions.length - 1;
  nextBtn.innerHTML = isLast
    ? 'See Results <span class="btn-arrow" aria-hidden="true">→</span>'
    : 'Next Question <span class="btn-arrow" aria-hidden="true">→</span>';
}

window.nextQuestion = function () {
  currentQ++;
  if (currentQ >= questions.length) {
    showResult();
  } else {
    renderQuestion();
  }
};

function showResult () {
  document.getElementById('quizArea').style.display = 'none';
  document.getElementById('resultScreen').style.display = 'block';

  const pct = Math.round((score / questions.length) * 100);
  document.getElementById('resultScoreNum').textContent = score;
  document.getElementById('resultPct').textContent = `${pct}% Correct`;

  let msg, icon;
  if (pct >= 90)      { msg = 'Outstanding! You\'re a cybersecurity expert! 🏆'; icon = '🏆'; }
  else if (pct >= 70) { msg = 'Great work! Keep sharpening your skills. 💪'; icon = '🎯'; }
  else if (pct >= 50) { msg = 'Good effort! Review the explanations and try again. 📚'; icon = '📚'; }
  else                { msg = 'Keep studying — every expert was once a beginner! 🚀'; icon = '🚀'; }

  document.getElementById('resultIcon').textContent = icon;
  document.getElementById('resultMsg').textContent = msg;
}

window.restartQuiz = function () {
  document.getElementById('topicSelect').style.display = 'block';
  document.getElementById('quizArea').style.display = 'none';
  document.getElementById('resultScreen').style.display = 'none';
  document.querySelectorAll('.topic-btn').forEach(b => {
    b.classList.remove('selected');
    b.setAttribute('aria-pressed', 'false');
  });
  selectedTopic = null;
};
