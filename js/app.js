const app = {
  // ==========================================
  // CONFIGURATION: PASTE YOUR API KEY HERE
  // ==========================================
  // If you want to hardcode your key instead of using the browser prompt, paste it inside the quotes below.
  GEMINI_API_KEY: "AIzaSyCaCfVLoOjGiP719TIg_JwV3O-VAbt9uuc", 

  currentMode: 'discovery',
  userData: {
    college: '',
    specialization: 'Software Engineering',
    cgpa: '',
    techStack: '',
    experience: '',
    analysisResults: null
  },
  
  init() {
    this.navigate('discovery');
  },

  navigate(mode) {
    this.currentMode = mode;
    
    // Hide all sections natively
    document.querySelectorAll('main section').forEach(el => {
      el.classList.add('hidden');
      el.classList.remove('flex');
    });
    
    // Show active section
    const activeSection = document.getElementById(`state-${mode}`);
    if (activeSection) {
      activeSection.classList.remove('hidden');
      activeSection.classList.add('flex');
    }
    
    // Update sidebar styling
    document.querySelectorAll('aside nav a').forEach(el => {
      el.classList.remove('bg-surface-container-low', 'text-secondary', 'font-bold');
      if (el.id !== `nav-${mode}`) {
        // Re-apply hover context
      }
    });
    const activeLink = document.getElementById(`nav-${mode}`);
    if (activeLink) {
      activeLink.classList.add('bg-surface-container-low', 'text-secondary', 'font-bold');
    }

    if(mode === 'analyzer') {
       this.updateAnalyzerView();
    }
    if(mode === 'projects') {
       this.renderProjects();
    }
  },

  async callGemini(promptText, strictJSON = true) {
    const apiKey = this.GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
    if (!apiKey) {
       throw new Error("Missing Gemini API Key");
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    const text = data.candidates[0].content.parts[0].text;
    if (strictJSON) {
       const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
       return JSON.parse(cleaned);
    }
    return text;
  },

  async saveInterview() {
    this.userData.college = document.getElementById('input-college').value || 'Unknown College';
    this.userData.specialization = document.getElementById('input-spec').value || 'Software Engineering';
    this.userData.cgpa = document.getElementById('input-cgpa').value || 'Unknown CGPA';
    this.userData.techStack = document.getElementById('input-stack').value || 'General CS Foundation';
    this.userData.experience = document.getElementById('input-experience').value || 'No detailed experience provided.';
    
    let apiKey = this.GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      apiKey = prompt("Please enter your Gemini API Key to activate the Agent (Stored locally):");
      if (!apiKey) return;
      localStorage.setItem('gemini_api_key', apiKey);
    }
    
    // Proceed to analyzer
    this.navigate('analyzer');
  },

  async updateAnalyzerView() {
    const analyzerSection = document.getElementById('state-analyzer');
    // Save inner HTML framework to restore after we inject data
    if (!this._originalAnalyzerHTML) {
       this._originalAnalyzerHTML = analyzerSection.innerHTML;
    }
    
    // Loading State
    analyzerSection.innerHTML = `
      <div class="flex-1 flex flex-col items-center justify-center py-20 fade-in w-full h-full">
         <div class="w-16 h-16 border-4 border-surface-container border-t-secondary-fixed rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(95,251,214,0.5)]"></div>
         <h3 class="text-xl font-headline font-bold mb-2 text-primary">Agentic Audit Initiated</h3>
         <p class="text-on-surface-variant text-sm">Evaluating structure and extracting impact metrics via Gemini...</p>
      </div>`;

    const promptText = `Act as an elite standard software engineering recruiter checking a resume specifically targeting higher Tier-1 MNCs (Google, MSFT, etc).
Profile Context:
College: ${this.userData.college}
CGPA: ${this.userData.cgpa}
Target Specialization: ${this.userData.specialization}
Tech Stack: ${this.userData.techStack}
Raw Experience:
${this.userData.experience}

Evaluate this text strictly in JSON format. Do not use markdown backticks.
Format required exactly:
{
  "atsScore": 75,
  "atsFeedback": "Short 1-sentence feedback about structure/skills",
  "primaryMatchName": "Software Development",
  "primaryMatchScore": 85,
  "secondaryMatchName": "Data Analyst",
  "secondaryMatchScore": 40,
  "keywords": ["REACT", "KUBERNETES", "AWS"], 
  "contentImpactGrade": "B+",
  "weakBullet": "Original weak bullet from the raw experience.",
  "weakIssue": "Passive, missing metrics",
  "fixedBullet": "The XYZ formulated optimized bullet",
  "fixedStrength": "Active Voice, +Quantifiable Metric"
}`;

    try {
        const result = await this.callGemini(promptText, true);
        this.userData.analysisResults = result;
        
        // Restore HTML
        analyzerSection.innerHTML = this._originalAnalyzerHTML;
        
        // Inject values
        document.getElementById('display-ats-score').innerText = result.atsScore;
        document.getElementById('display-ats-feedback').innerText = result.atsFeedback;
        
        document.getElementById('display-spec-1-name').innerText = result.primaryMatchName;
        document.getElementById('display-spec-1-score').innerText = result.primaryMatchScore + '% MATCH';
        document.getElementById('display-spec-1-bar').style.width = result.primaryMatchScore + '%';
        
        document.getElementById('display-spec-2-name').innerText = result.secondaryMatchName;
        document.getElementById('display-spec-2-score').innerText = result.secondaryMatchScore + '% MATCH';
        document.getElementById('display-spec-2-bar').style.width = result.secondaryMatchScore + '%';

        // ensure we only take top 4 keywords
        const keywords = Array.isArray(result.keywords) ? result.keywords.slice(0, 4) : [];
        const kbdHTML = keywords.map(k => `<span class="px-3 py-1 bg-secondary-fixed/20 text-secondary border border-secondary-fixed/50 text-[10px] font-bold rounded-full">${k}</span>`).join('');
        document.getElementById('keyword-badges').innerHTML = kbdHTML;

        document.getElementById('display-impact-grade').innerText = result.contentImpactGrade;
        document.getElementById('display-weak-bullet').innerText = `"${result.weakBullet || 'N/A'}"`;
        document.getElementById('display-weak-issue').innerText = "ISSUE: " + (result.weakIssue || 'Vague description');
        document.getElementById('display-fixed-bullet').innerText = `"${result.fixedBullet || 'N/A'}"`;
        document.getElementById('display-fixed-strength').innerText = "STRENGTH: " + (result.fixedStrength || 'Action-oriented');
        
    } catch (e) {
        console.error(e);
        analyzerSection.innerHTML = `<div class="p-8 text-red-500 font-bold border border-red-200 rounded-xl bg-red-50 text-sm mt-8 mx-auto w-full max-w-2xl">Error running Agentic Analysis: ${e.message}. Please verify your API Key and try again. <br><br> <button onclick="app.resetApiKey()" class="underline">Reset API Key</button></div>`;
    }
  },
  
  // Mock projects generator based on specialization
  async renderProjects() {
    const spec = (this.userData.specialization || '').toLowerCase();
    const displayEls = document.querySelectorAll('.display-spec-name');
    displayEls.forEach(el => {
       el.innerText = this.userData.specialization || "Software Engineering (SDE)";
    });

    let apiKey = this.GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      apiKey = prompt("Please enter your Gemini API Key to generate real-time projects (Stored locally):");
      if (!apiKey) {
        // Fallback to mock data if user cancels
        this.fallbackMockProjects(spec);
        return;
      }
      localStorage.setItem('gemini_api_key', apiKey);
    }
    
    document.getElementById('projects-container').innerHTML = `
      <div class="col-span-1 md:col-span-3 py-12 flex flex-col items-center justify-center opacity-70 fade-in">
         <span class="material-symbols-outlined text-4xl text-secondary animate-pulse mb-4">settings_suggest</span>
         <p class="text-sm font-semibold tracking-wider">Architecting AI Projects in Real-Time...</p>
      </div>`;
    
    let promptText = `You are a high-tier Indian CS Career Architect. Suggest 3 highly advanced projects for a "${spec}" student aiming for 50 LPA+ roles at Tier-1 MNCs.`;
    
    // Cross-State Intelligence Injection
    if (this.userData.analysisResults) {
       promptText += `\nYou just evaluated their resume and gave an ATS score of ${this.userData.analysisResults.atsScore}. Their current tech stack is: ${this.userData.techStack}. Give highly-specific projects that utilize their existing stack, but also introduce 1 or 2 new cutting-edge technologies to boost their score past 90+.`;
    }

    promptText += `\nReturn strictly in JSON format as an array of exactly 3 objects. Do not wrap in markdown blocks like \`\`\`json. Return the raw string array.
Format of each object:
{
  "title": "Project Title",
  "demand": "Target (e.g. Zomato / Google)",
  "description": "Short project description solving a real world Indian problem.",
  "stack": ["TECH", "TECH", "TECH"],
  "hook": "Unique hook",
  "lpaTip": "Pro Tip",
  "killerQuestion": "Difficult technical interview question"
}`;

     try {
       const projects = await this.callGemini(promptText, true);
       
       document.getElementById('projects-container').innerHTML = this.getProjectsHTML(projects);
     } catch (err) {
       console.error("Gemini API Error:", err);
       document.getElementById('projects-container').innerHTML = `<div class="col-span-1 md:col-span-3 text-red-500 p-8 border border-red-200 rounded-xl bg-red-50 text-sm"><b>Error generating projects via Gemini:</b> ${err.message}. <button onclick="app.resetApiKey()" class="underline ml-2">Reset API Key</button> <br><br>Showing mock data instead:</div>`;
       this.fallbackMockProjects(spec);
     }
  },

  fallbackMockProjects(spec) {
    let projectsHTML = '';
    if (spec.includes('aiml') || spec.includes('ai') || spec.includes('machine learning')) projectsHTML = this.getAIMLProjects();
    else if (spec.includes('cyber') || spec.includes('security')) projectsHTML = this.getCyberProjects();
    else projectsHTML = this.getSDEProjects();
    
    document.getElementById('projects-container').innerHTML += projectsHTML;
  },

  resetApiKey() {
    localStorage.removeItem('gemini_api_key');
    alert("API Key removed. It will be requested again upon generating new projects.");
  },

  getProjectsHTML(projects) {
    return projects.map((p, index) => {
      const isHero = index === 0;
      
      const tags = p.stack.map(tech => 
        `<span class="px-2 py-1 bg-surface-container-high text-[10px] font-bold rounded-full">${tech}</span>`
      ).join('');

      return `
      <div class="bg-surface-container-lowest rounded-2xl shadow-sm relative overflow-hidden group p-8 border border-outline-variant/10 flex flex-col justify-between hover:shadow-xl transition-all ${isHero ? 'md:col-span-2' : 'col-span-1'}">
        <!-- Glow Line -->
        <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary-fixed shadow-[0_0_15px_rgba(95,251,214,0.8)]"></div>
        
        <div>
          <div class="flex justify-between items-start mb-6 gap-4">
            <h3 class="text-2xl font-headline font-extrabold text-primary">${p.title}</h3>
            <span class="px-3 py-1 bg-surface-container-low rounded-lg text-[10px] font-bold whitespace-nowrap hidden sm:block">${p.demand}</span>
          </div>
          <p class="text-on-surface-variant text-sm mb-6 leading-relaxed">${p.description}</p>
          <div class="flex flex-wrap gap-2 mb-8">
            ${tags}
          </div>
        </div>

        <div class="space-y-4">
          <div class="pt-6 border-t border-surface-container-low flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <span class="text-[11px] font-bold text-secondary uppercase flex items-center gap-1"><span class="material-symbols-outlined text-sm">bolt</span> Hook: ${p.hook}</span>
            <span class="px-4 py-2 bg-primary-container text-secondary-fixed rounded-full text-[10px] font-bold whitespace-nowrap">LPA TIP: ${p.lpaTip}</span>
          </div>
          <!-- Killer Question Tooltip Area -->
          <div class="bg-surface-container-low p-4 rounded-xl mt-2 text-xs opacity-80 group-hover:opacity-100 transition-opacity">
            <span class="font-bold text-primary block mb-1">Killer Question:</span>
            <span class="text-on-surface-variant italic">${p.killerQuestion}</span>
          </div>
        </div>
      </div>
      `;
    }).join('');
  },

  getAIMLProjects() {
    const projects = [
      {
        title: "Agentic Supply Chain Orchestrator",
        demand: "Demand: Zomato/Google",
        description: "A decentralized multi-agent system built in <span class='text-primary font-bold'>Rust</span> using LLMs to autonomously negotiate vendor contracts and predict delivery latency with 98% accuracy for Indian logistics networks.",
        stack: ["AGENTIC AI", "RUST", "GRPC", "PINECONE"],
        hook: "Autonomous Vendor Negotiation Engine",
        lpaTip: "REAL-TIME WASM DASHBOARD",
        killerQuestion: "How do you handle deadlocks when two LLM agents bid against each other perpetually?"
      },
      {
        title: "Personalized RLHF Tutor",
        demand: "Target: Amazon/Unacademy",
        description: "Educational platform that uses Reinforcement Learning from Human Feedback (RLHF) to dynamically adjust curriculum difficulty based on Indian student biometric focus levels.",
        stack: ["PYTORCH", "FASTAPI", "WEBRTC"],
        hook: "Biometric Feedback Loop",
        lpaTip: "DISTRIBUTED MODEL TRAINING",
        killerQuestion: "Explain how you minimized inference latency for real-time video frame analysis."
      },
      {
        title: "Bharatiya Krishi Insights (Rag+Vision)",
        demand: "Target: Microsoft/AgriTech",
        description: "Multilingual Vision-Language Model interface processing unstructured localized crop images and govt. subsidy documents to give instant agrarian insights.",
        stack: ["LLAMA 3 (FINE-TUNED)", "FAISS", "NEXT.JS 15"],
        hook: "Multimodal Indian Context Reasoning",
        lpaTip: "EDGE DEPLOYMENT CAPABILITY",
        killerQuestion: "How did you manage embedding drift when introducing a new regional language?"
      }
    ];
    return this.getProjectsHTML(projects);
  },

  getCyberProjects() {
    const projects = [
      {
        title: "Zero-Trust UPI Sandbox",
        demand: "Demand: Cred/PhonePe",
        description: "A secure, simulated environment for testing UPI-based fintech microservices against automated penetration testing and runtime memory attacks using eBPF.",
        stack: ["GOLANG", "eBPF", "KUBERNETES", "VAULT"],
        hook: "Automated Attack Surface Mapping",
        lpaTip: "IMPLEMENT MUTUAL TLS",
        killerQuestion: "How does your eBPF program distinguish between legitimate API calls and polymorphic shellcode?"
      },
      {
        title: "AI-Powered Phishing Classifier",
        demand: "Target: CrowdStrike Labs",
        description: "Real-time edge network monitor that decodes TLS handshakes and uses lightweight ML models to detect spear-phishing domain permutations.",
        stack: ["RUST", "SURICATA", "TENSORFLOW LITE"],
        hook: "Sub-millisecond Packet Analysis",
        lpaTip: "KERNEL BYPASS (DPDK)",
        killerQuestion: "How do you mitigate adversarial inputs attempting to poison your local classifier?"
      },
      {
        title: "Decentralized Auth Gateway",
        demand: "Target: Auth0/Okta",
        description: "Identity and Access Management (IAM) framework using Zero Knowledge Proofs (ZK-SNARKs) ensuring complete privacy of end-user data on distributed nodes.",
        stack: ["NODE.JS", "ZK-SNARKS", "REDIS"],
        hook: "Cryptographic Privacy Preservation",
        lpaTip: "HIGH TPS SCALING",
        killerQuestion: "Walk me through the mathematical bottle-neck of verifying a ZK proof during a traffic spike."
      }
    ];
    return this.getProjectsHTML(projects);
  },

  getSDEProjects() {
    const projects = [
      {
        title: "High-Frequency Trading Matching Engine",
        demand: "Demand: HFTs / Zerodha",
        description: "An ultra-low latency order matching engine using LMAX Disruptor pattern and ring buffers, capable of handling 5M+ orders/sec in an Indian equities context.",
        stack: ["C++20", "VERILOG", "WEBSOCKETS", "REDIS"],
        hook: "Lock-free Concurrency Model",
        lpaTip: "MEMORY POOL ALLOCATORS",
        killerQuestion: "How did you prevent false sharing in CPU caches across your worker threads?"
      },
      {
        title: "SaralYojna Scheme Aggregator",
        demand: "Target: Govt Tech/Atlassian",
        description: "A geographically distributed microservices architecture scraping and standardizing hundreds of Indian state welfare schemes into a unified GraphQL API.",
        stack: ["GO", "GRAPHQL", "KAFKA", "POSTGRESQL"],
        hook: "Event-Driven Data Synchronization",
        lpaTip: "IMPLEMENT REDIS CACHING",
        killerQuestion: "Explain your Kafka consumer group strategy to ensure exactly-once processing during node failures."
      },
      {
        title: "Real-Time Video Sync Core",
        demand: "Target: Hotstar / Netflix",
        description: "A custom WebRTC signaling server and Selective Forwarding Unit (SFU) designed to seamlessly sync live sports feeds to hundreds of thousands of concurrent users.",
        stack: ["RUST", "WEBRTC", "DOCKER SWARM"],
        hook: "Adaptive Bitrate Orchestration",
        lpaTip: "MULTI-REGION LATENCY ROUTING",
        killerQuestion: "How do you handle NACK storms and packet loss recovery at scale?"
      }
    ];
    return this.getProjectsHTML(projects);
  }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
