/**
 * Strictly Verified Portfolio Data Source of Truth
 * Sourced directly from resume.pdf. No fabricated URLs, metrics, or details.
 */

export interface Profile {
  fullName: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  github: {
    url: string;
    display: string;
  };
  linkedin: {
    url: string;
    display: string;
  };
  summary: string;
  heroVideo: string;
  resumePdf: string;
}

export interface NavItem {
  name: string;
  href: string;
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  isTechnical: boolean;
  category: "Technical Experience" | "Current Australian Employment";
  highlights: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  period: string;
  cgpa?: string;
  leadership?: string;
  notes?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  type?: string;
  description: string;
  technologies: string[];
}

export interface CertificationItem {
  name: string;
  issuer?: string;
  type?: string;
}

export interface AchievementItem {
  title: string;
  description: string;
}

export const PROFILE: Profile = {
  fullName: "Abhiram Reddy Enukonda",
  title: "Data Science & Software Engineering Professional",
  location: "Queensland, Australia",
  email: "abhiramreddye@outlook.com",
  phone: "+61 481 449 515",
  github: {
    url: "https://github.com/abhiramreddy59",
    display: "github.com/abhiramreddy59",
  },
  linkedin: {
    url: "https://linkedin.com/in/abhiramreddye",
    display: "linkedin.com/in/abhiramreddye",
  },
  summary:
    "Analytical, hands-on Data Science and Software Engineering professional with a B.Tech in Computer Science Engineering (CGPA 8.6), currently completing a Master of Data Science (Specialisation in Artificial Intelligence) at the University of Southern Queensland (USQ). Brings 1 year of software engineering experience at Jellyspace, with practical backend, AI and data projects, including sensor-driven and geospatial analytics. Also has proven reliability in customer-facing, inventory-intensive fuel and retail operations, working rotating shifts in fast-paced, safety-compliant environments. Physically active and comfortable working on the floor as well as at the keyboard.",
  heroVideo: "/hero/intro.mp4",
  resumePdf: "/resume.pdf",
};

export const NAV: NavItem[] = [
  { name: "About", href: "#about" },
  { name: "Experience", href: "#experience" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Education", href: "#education" },
  { name: "Certifications", href: "#certifications" },
  { name: "Contact", href: "#contact" },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    category: "Data Science & AI",
    skills: [
      "Python",
      "Machine Learning",
      "Predictive Modeling",
      "NLP",
      "Generative AI",
      "LangChain",
      "Groq AI",
      "Ollama",
    ],
  },
  {
    category: "Software & Backend",
    skills: [
      "Java",
      "C++",
      "Spring Boot",
      "REST APIs",
      "Kafka",
      "Microservices",
    ],
  },
  {
    category: "Databases & Cloud",
    skills: [
      "PostgreSQL",
      "MongoDB",
      "MySQL",
      "AWS (EC2, S3, RDS, Lambda)",
      "Docker",
      "Kubernetes",
    ],
  },
  {
    category: "Operational & Systems",
    skills: [
      "Real-time Inventory Reconciliation",
      "Stock Replenishment",
      "Automated Reporting",
      "Sensor/IoT Systems",
      "Quality Compliance",
      "Process Optimization",
    ],
  },
];

/**
 * Experience in strictly required order:
 * Technical experience receives strongest visual emphasis (1 - 3).
 * Current Australian employment displayed separately (4).
 */
export const EXPERIENCE: ExperienceItem[] = [
  {
    id: "jellyspace",
    role: "Software Engineer",
    company: "Jellyspace",
    location: "Remote",
    period: "Jun 2025 – Jun 2026",
    isTechnical: true,
    category: "Technical Experience",
    highlights: [
      "Engineered blockchain-based data integrity pipelines that strengthened platform security and decentralization across core components.",
      "Built a geospatial intelligence widget that processes satellite data to predict safe and danger zones for PEZ/WEZ exclusion events, giving users faster situational awareness.",
      "Resolved production issues in a distributed platform by leading debugging and testing, improving system stability and reliability.",
    ],
  },
  {
    id: "jpmorgan",
    role: "Software Engineering Virtual Experience",
    company: "JPMorgan Chase & Co. (Forage)",
    location: "Virtual",
    period: "Apr 2025 – Jun 2025",
    isTechnical: true,
    category: "Technical Experience",
    highlights: [
      "Delivered a backend data-processing system across 5 simulation tasks using Spring Boot, Kafka listeners, REST APIs, JPA and an H2 database, and integrated an external Incentive API.",
    ],
  },
  {
    id: "elevatebox",
    role: "SDE Intern",
    company: "Elevatebox",
    location: "Internship",
    period: "Jul 2024 – Dec 2024",
    isTechnical: true,
    category: "Technical Experience",
    highlights: [
      "Improved data-processing efficiency and system performance by developing scalable Java backend services and RESTful APIs.",
      "Optimized SQL and NoSQL database operations supporting React and Node.js applications, collaborating with cross-functional Agile teams to accelerate feature delivery.",
    ],
  },
  {
    id: "liberty-fuel",
    role: "Customer Service & Operations Attendant (Part-Time)",
    company: "Liberty Fuel Station",
    location: "Dalby, QLD",
    period: "Mar 2026 – Present",
    isTechnical: false,
    category: "Current Australian Employment",
    highlights: [
      "Delivered fast, accurate customer service by operating POS registers in a high-volume, fast-paced environment.",
      "Maintained stock accuracy by conducting inventory audits, receiving deliveries and replenishing fuel-station and food lines, reducing shortages and wastage.",
      "Upheld safety, food handling and compliance standards on rotating shifts while managing competing priorities during peak periods.",
    ],
  },
];

export const EDUCATION: EducationItem[] = [
  {
    id: "usq",
    degree: "Master of Data Science (Specialisation in Artificial Intelligence)",
    institution: "University of Southern Queensland (USQ)",
    location: "Australia",
    period: "2026 – Present",
    notes: "Currently completing",
  },
  {
    id: "nnrg",
    degree: "Bachelor of Technology, Computer Science and Engineering",
    institution: "NNRG College of Engineering",
    location: "India",
    period: "2021 – 2025",
    cgpa: "8.6",
    leadership:
      "Led student initiatives as Events Head, coordinating technical and cultural events.",
  },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: "smart-irrigation",
    title: "AI-Driven Smart Irrigation System",
    description:
      "Designed an AI-powered system that analyzes real-time sensor and weather data to optimize irrigation scheduling, conserving water and improving crop yield.",
    technologies: ["AI", "Sensor Data", "Weather Data Analytics", "IoT"],
  },
  {
    id: "k8s-load-balancing",
    title: "Bidirectional Load Balancing in Kubernetes (Research Paper, ICCIML)",
    type: "Research Paper (ICCIML)",
    description:
      "Researched and proposed load-balancing strategies that improve resource allocation and reduce latency in distributed environments.",
    technologies: [
      "Kubernetes",
      "Distributed Systems",
      "Load Balancing",
      "Cloud Computing",
    ],
  },
  {
    id: "smart-summarizer",
    title: "Smart Summarizer: AI for YouTube Videos",
    description:
      "Built an LLM-based summarizer using Groq AI, Ollama and LangChain for accurate, concise content extraction.",
    technologies: ["Groq AI", "Ollama", "LangChain", "LLM", "NLP"],
  },
  {
    id: "qr-attendance",
    title: "QR Code Automated Attendance & Tracking System",
    description:
      "Developed a QR-based system with secure database integration enabling real-time check-ins and replacing manual tracking.",
    technologies: [
      "QR Systems",
      "Database Integration",
      "Real-Time Tracking",
      "Security",
    ],
  },
];

export const CERTIFICATIONS: CertificationItem[] = [
  { name: "AWS Solutions Architect", type: "Cloud Architecture" },
  { name: "Full Stack Web Development", issuer: "Pantech Solutions" },
  { name: "Java Development Intern", issuer: "Cognifyz Technologies" },
  { name: "Haptic Control of Robotic Devices", type: "Robotics" },
  { name: "GEN-AI Hackathon", type: "Hackathon" },
  { name: "Smart India Hackathon", type: "Hackathon" },
];

export const ACHIEVEMENTS: AchievementItem[] = [
  {
    title: "Research Paper: ICCIML",
    description:
      "Researched and proposed load-balancing strategies in 'Bidirectional Load Balancing in Kubernetes' presented/published at ICCIML.",
  },
  {
    title: "Academic Excellence (CGPA 8.6)",
    description:
      "Achieved 8.6 CGPA in Bachelor of Technology, Computer Science and Engineering at NNRG College of Engineering.",
  },
  {
    title: "Student Leadership: Events Head",
    description:
      "Led student initiatives as Events Head, coordinating technical and cultural events at NNRG College of Engineering.",
  },
  {
    title: "National & AI Hackathon Competitor",
    description:
      "Participant and competitor in Smart India Hackathon and GEN-AI Hackathon.",
  },
];
