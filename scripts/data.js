/**
 * Portfolio Data Source of Truth
 * Derived strictly from resume.pdf with no alterations or invented details.
 */
const PORTFOLIO_DATA = {
  profile: {
    fullName: "Abhiram Reddy Enukonda",
    title: "Data Science & Software Engineering Professional",
    location: "Queensland, Australia",
    email: "abhiramreddye@outlook.com",
    phone: "+61 481 449 515",
    github: {
      url: "https://github.com/abhiramreddy59",
      display: "github.com/abhiramreddy59"
    },
    linkedin: {
      url: "https://linkedin.com/in/abhiramreddye",
      display: "linkedin.com/in/abhiramreddye"
    },
    summary:
      "Analytical, hands-on Data Science and Software Engineering professional with a B.Tech in Computer Science Engineering (CGPA 8.6), currently completing a Master of Data Science (Specialisation in Artificial Intelligence) at the University of Southern Queensland (USQ). Brings 1 year of software engineering experience at Jellyspace, with practical backend, AI and data projects, including sensor-driven and geospatial analytics. Also has proven reliability in customer-facing, inventory-intensive fuel and retail operations, working rotating shifts in fast-paced, safety-compliant environments. Physically active and comfortable working on the floor as well as at the keyboard.",
    heroVideo: "intro.mp4",
    resumePdf: "resume.pdf"
  },

  // Technical Experience - Primary Visual Emphasis
  technicalExperience: [
    {
      id: "jellyspace",
      role: "Software Engineer",
      company: "Jellyspace",
      location: "Remote",
      period: "Jun 2025 – Jun 2026",
      badge: "Software Engineering",
      highlights: [
        "Engineered blockchain-based data integrity pipelines that strengthened platform security and decentralization across core components.",
        "Built a geospatial intelligence widget that processes satellite data to predict safe and danger zones for PEZ/WEZ exclusion events, giving users faster situational awareness.",
        "Resolved production issues in a distributed platform by leading debugging and testing, improving system stability and reliability."
      ]
    },
    {
      id: "jpmorgan",
      role: "Software Engineering Virtual Experience",
      company: "JPMorgan Chase & Co. (Forage)",
      location: "Virtual",
      period: "Apr 2025 – Jun 2025",
      badge: "Virtual Experience",
      highlights: [
        "Delivered a backend data-processing system across 5 simulation tasks using Spring Boot, Kafka listeners, REST APIs, JPA and an H2 database, and integrated an external Incentive API."
      ]
    },
    {
      id: "elevatebox",
      role: "SDE Intern",
      company: "Elevatebox",
      location: "Internship",
      period: "Jul 2024 – Dec 2024",
      badge: "Internship",
      highlights: [
        "Improved data-processing efficiency and system performance by developing scalable Java backend services and RESTful APIs.",
        "Optimized SQL and NoSQL database operations supporting React and Node.js applications, collaborating with cross-functional Agile teams to accelerate feature delivery."
      ]
    }
  ],

  // Operations & Customer Service Experience - Current Australian Employment (Separately positioned)
  operationsExperience: [
    {
      id: "liberty-fuel",
      role: "Customer Service & Operations Attendant (Part-Time)",
      company: "Liberty Fuel Station",
      location: "Dalby, QLD",
      period: "Mar 2026 – Present",
      badge: "Current Australian Employment",
      highlights: [
        "Delivered fast, accurate customer service by operating POS registers in a high-volume, fast-paced environment.",
        "Maintained stock accuracy by conducting inventory audits, receiving deliveries and replenishing fuel-station and food lines, reducing shortages and wastage.",
        "Upheld safety, food handling and compliance standards on rotating shifts while managing competing priorities during peak periods."
      ]
    }
  ],

  // Education
  education: [
    {
      id: "usq",
      degree: "Master of Data Science (Specialisation in Artificial Intelligence)",
      institution: "University of Southern Queensland (USQ)",
      location: "Australia",
      period: "2026 – Present",
      notes: "Currently completing"
    },
    {
      id: "nnrg",
      degree: "Bachelor of Technology, Computer Science and Engineering",
      institution: "NNRG College of Engineering",
      location: "India",
      period: "2021 – 2025",
      score: "CGPA: 8.6",
      leadership: "Led student initiatives as Events Head, coordinating technical and cultural events."
    }
  ],

  // Projects - Titles and descriptions verbatim from resume (No invented links)
  projects: [
    {
      id: "smart-irrigation",
      title: "AI-Driven Smart Irrigation System",
      category: "Data Science & AI",
      description:
        "Designed an AI-powered system that analyzes real-time sensor and weather data to optimize irrigation scheduling, conserving water and improving crop yield.",
      technologies: ["AI", "Sensor Data", "Weather Data Analytics", "IoT"]
    },
    {
      id: "k8s-load-balancing",
      title: "Bidirectional Load Balancing in Kubernetes (Research Paper, ICCIML)",
      category: "Cloud & Distributed Systems",
      type: "Research Paper (ICCIML)",
      description:
        "Researched and proposed load-balancing strategies that improve resource allocation and reduce latency in distributed environments.",
      technologies: ["Kubernetes", "Distributed Systems", "Load Balancing", "Cloud Computing"]
    },
    {
      id: "smart-summarizer",
      title: "Smart Summarizer: AI for YouTube Videos",
      category: "Generative AI & NLP",
      description:
        "Built an LLM-based summarizer using Groq AI, Ollama and LangChain for accurate, concise content extraction.",
      technologies: ["Groq AI", "Ollama", "LangChain", "LLM", "NLP"]
    },
    {
      id: "qr-attendance",
      title: "QR Code Automated Attendance & Tracking System",
      category: "Software & Systems",
      description:
        "Developed a QR-based system with secure database integration enabling real-time check-ins and replacing manual tracking.",
      technologies: ["QR Systems", "Database Integration", "Real-Time Tracking", "Security"]
    }
  ],

  // Technical & Operational Skills - Exact groupings from resume
  skills: {
    dataScienceAI: {
      category: "Data Science & AI",
      icon: "brain-circuit",
      items: [
        "Python",
        "Machine Learning",
        "Predictive Modeling",
        "NLP",
        "Generative AI",
        "LangChain",
        "Groq AI",
        "Ollama"
      ]
    },
    softwareBackend: {
      category: "Software & Backend",
      icon: "server",
      items: [
        "Java",
        "C++",
        "Spring Boot",
        "REST APIs",
        "Kafka",
        "Microservices"
      ]
    },
    databasesCloud: {
      category: "Databases & Cloud",
      icon: "cloud",
      items: [
        "PostgreSQL",
        "MongoDB",
        "MySQL",
        "AWS (EC2, S3, RDS, Lambda)",
        "Docker",
        "Kubernetes"
      ]
    },
    operationalSystems: {
      category: "Operational & Systems",
      icon: "cpu",
      items: [
        "Real-time Inventory Reconciliation",
        "Stock Replenishment",
        "Automated Reporting",
        "Sensor/IoT Systems",
        "Quality Compliance",
        "Process Optimization"
      ]
    }
  },

  // Certifications - Exact from resume
  certifications: [
    { name: "AWS Solutions Architect", type: "Cloud Architecture" },
    { name: "Full Stack Web Development", issuer: "Pantech Solutions" },
    { name: "Java Development Intern", issuer: "Cognifyz Technologies" },
    { name: "Haptic Control of Robotic Devices", type: "Robotics & Hardware" },
    { name: "GEN-AI Hackathon", type: "Hackathon" },
    { name: "Smart India Hackathon", type: "Hackathon" }
  ],

  // Achievements
  achievements: [
    {
      title: "Research Publication at ICCIML",
      description: "Authored research paper on Bidirectional Load Balancing in Kubernetes."
    },
    {
      title: "Academic Excellence (CGPA 8.6)",
      description: "Graduated with 8.6 CGPA in Bachelor of Technology, Computer Science and Engineering."
    },
    {
      title: "Events Head Leadership",
      description: "Led student initiatives and coordinated technical and cultural events at NNRG College of Engineering."
    },
    {
      title: "National & AI Hackathon Competitions",
      description: "Participant and achiever in Smart India Hackathon and GEN-AI Hackathon."
    }
  ]
};

// Freeze data to prevent runtime mutation
if (typeof Object.freeze === "function") {
  Object.freeze(PORTFOLIO_DATA);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = PORTFOLIO_DATA;
}
