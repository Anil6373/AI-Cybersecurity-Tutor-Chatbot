/* ═══════════════════════════════════════════════════════════
   CYBER TUTOR AI — Roadmap JS
   All logic preserved. Updated to use new CSS class names.
   ═══════════════════════════════════════════════════════════ */

const ROADMAPS = {
  beginner: {
    icon: '🌱',
    title: 'Beginner Path',
    desc: 'Start your cybersecurity journey with core fundamentals.',
    tag: 'beginner',
    label: 'Beginner',
    steps: [
      { title: 'Computer & Networking Basics', duration: '2 weeks', desc: 'Understand how computers communicate. Learn IP addressing, OSI model, protocols (TCP/IP, UDP, HTTP).', skills: ['TCP/IP','OSI Model','DNS','HTTP/HTTPS','Subnetting'], done: true },
      { title: 'Linux Fundamentals', duration: '2 weeks', desc: 'Get comfortable with the Linux command line — the lingua franca of cybersecurity.', skills: ['bash','file permissions','process management','grep/awk/sed','SSH'], done: true },
      { title: 'Basic Security Concepts', duration: '1 week', desc: 'CIA Triad, threat models, authentication types, common attack categories.', skills: ['CIA Triad','Authentication','Threat modeling','Risk assessment'], done: false },
      { title: 'Setting Up Your Lab', duration: '1 week', desc: 'Install VirtualBox/VMware, set up Kali Linux and vulnerable VMs (Metasploitable, DVWA).', skills: ['VirtualBox','Kali Linux','DVWA','Metasploitable','Network isolation'], done: false },
      { title: 'CompTIA Security+ Prep', duration: '4 weeks', desc: 'Study for the industry-recognized Security+ certification covering essential security concepts.', skills: ['Cryptography','Identity','Threats','Architecture','Operations'], done: false },
    ]
  },
  intermediate: {
    icon: '⚡',
    title: 'Intermediate Path',
    desc: 'Deepen your skills in pentesting, web security, and defensive techniques.',
    tag: 'intermediate',
    label: 'Intermediate',
    steps: [
      { title: 'Web Application Security', duration: '3 weeks', desc: 'OWASP Top 10 in depth — XSS, SQL injection, CSRF, SSRF, XXE, Insecure deserialization and more.', skills: ['OWASP Top 10','Burp Suite','XSS','SQL Injection','CSRF'], done: false },
      { title: 'Network Penetration Testing', duration: '3 weeks', desc: 'Active scanning, service enumeration, exploitation with Nmap, Metasploit, and manual techniques.', skills: ['Nmap','Metasploit','Netcat','Wireshark','Enum4linux'], done: false },
      { title: 'Cryptography Applied', duration: '2 weeks', desc: 'AES, RSA, hashing algorithms, PKI, SSL/TLS internals, common crypto vulnerabilities.', skills: ['AES','RSA','SHA family','PKI','TLS/SSL'], done: false },
      { title: 'Active Directory Attacks', duration: '3 weeks', desc: 'AD enumeration, Kerberoasting, Pass-the-Hash, BloodHound, privilege escalation in Windows environments.', skills: ['AD','BloodHound','Kerberoasting','Pass-the-Hash','PowerShell'], done: false },
      { title: 'CTF Competitions', duration: 'Ongoing', desc: 'Solve Capture The Flag challenges on HackTheBox, TryHackMe, and PicoCTF to apply skills practically.', skills: ['HackTheBox','TryHackMe','Reversing','Forensics','OSINT'], done: false },
    ]
  },
  advanced: {
    icon: '🔥',
    title: 'Advanced Path',
    desc: 'Master exploitation, malware analysis, and red-team operations.',
    tag: 'advanced',
    label: 'Advanced',
    steps: [
      { title: 'Exploit Development', duration: '4 weeks', desc: 'Buffer overflows, format string bugs, heap exploitation, shellcode writing, return-oriented programming (ROP).', skills: ['Buffer Overflow','ROP chains','Shellcode','GDB/pwndbg','pwntools'], done: false },
      { title: 'Malware Analysis', duration: '3 weeks', desc: 'Static and dynamic analysis of malicious software, reverse engineering with IDA Pro / Ghidra.', skills: ['Ghidra','IDA Pro','YARA','Sandbox analysis','PE format'], done: false },
      { title: 'Red Team Operations', duration: '4 weeks', desc: 'Full kill-chain simulations, C2 frameworks (Cobalt Strike / Sliver), lateral movement, persistence.', skills: ['Cobalt Strike','C2 Frameworks','OPSEC','Lateral movement','Persistence'], done: false },
      { title: 'Cloud Security', duration: '3 weeks', desc: 'AWS/Azure/GCP security, IAM misconfigurations, S3 bucket attacks, cloud-native penetration testing.', skills: ['AWS IAM','CloudTrail','S3 attacks','pacu','ScoutSuite'], done: false },
      { title: 'OSCP Certification', duration: '3 months', desc: 'Offensive Security Certified Professional — the gold standard hands-on pentesting certification.', skills: ['24-hour exam','Full pentests','Report writing','Privilege escalation','Active Directory'], done: false },
    ]
  },
  jobready: {
    icon: '💼',
    title: 'Job-Ready Path',
    desc: 'Polish your resume, build your portfolio, and land your first security role.',
    tag: 'job-ready',
    label: 'Job Ready',
    steps: [
      { title: 'Build a Portfolio', duration: '2 weeks', desc: 'Write-ups for CTF challenges, bug bounty reports, GitHub security tools, a personal security blog.', skills: ['GitHub','Writeups','Bug Bounty','Technical writing','Personal branding'], done: false },
      { title: 'Bug Bounty Hunting', duration: 'Ongoing', desc: 'HackerOne, Bugcrowd — find and responsibly disclose real vulnerabilities for reputation and rewards.', skills: ['HackerOne','Bugcrowd','Recon','SSRF','Business logic bugs'], done: false },
      { title: 'Certifications Strategy', duration: 'Ongoing', desc: 'Target role-specific certs: SOC → CySA+, Pentester → OSCP, Cloud → AWS Security Specialty.', skills: ['Security+','CySA+','OSCP','AWS Security','CEH'], done: false },
      { title: 'Interview Preparation', duration: '2 weeks', desc: 'Common security interview questions, technical challenges, behavioral prep, and networking tips.', skills: ['Technical interviews','Behavioral questions','Networking','Salary negotiation','LinkedIn'], done: false },
      { title: 'First Security Role', duration: 'Goal 🎉', desc: 'Target entry-level roles: SOC Analyst, Junior Pentester, Security Analyst, GRC Analyst, or IT Security.', skills: ['SOC Analyst','Pentester','Security Analyst','GRC','AppSec'], done: false },
    ]
  },
};

let activeTab = 'beginner';

document.addEventListener('DOMContentLoaded', () => {
  renderRoadmap('beginner');

  document.querySelectorAll('.roadmap-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.roadmap-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      renderRoadmap(tab.dataset.level);
    });
  });
});

function renderRoadmap (level) {
  activeTab = level;
  const data = ROADMAPS[level];
  const container = document.getElementById('roadmapContent');

  let html = `
    <div class="level-header fade-in">
      <div class="level-icon" aria-hidden="true">${data.icon}</div>
      <div class="level-info">
        <h2>${data.title}</h2>
        <p>${data.desc}</p>
      </div>
      <span class="level-badge ${data.tag}" aria-label="Level: ${data.label}">${data.label}</span>
    </div>
    <div class="timeline" role="list" aria-label="${data.title} learning steps">`;

  data.steps.forEach((step, i) => {
    const dotClass = step.done ? 'done' : (i > 2 ? 'locked' : '');
    const donePrefix = step.done ? '✅ ' : '';
    const pillsHtml = step.skills
      .map(s => `<span class="skill-pill">${s}</span>`)
      .join('');

    html += `
      <div class="timeline-item" role="listitem">
        <div class="timeline-dot ${dotClass}" aria-hidden="true"></div>
        <div class="timeline-card" tabindex="0" aria-label="${step.title}, ${step.duration}">
          <div class="tc-header">
            <div class="tc-title">${donePrefix}${step.title}</div>
            <span class="tc-duration" aria-label="Duration: ${step.duration}">⏱ ${step.duration}</span>
          </div>
          <p class="tc-desc">${step.desc}</p>
          <div class="tc-skills" aria-label="Skills covered">${pillsHtml}</div>
        </div>
      </div>`;
  });

  html += `</div>`;
  container.innerHTML = html;

  // Stagger animation delays
  requestAnimationFrame(() => {
    container.querySelectorAll('.timeline-item').forEach((item, i) => {
      item.style.animationDelay = `${i * 0.07}s`;
    });
  });
}
