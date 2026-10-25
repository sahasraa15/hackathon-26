/** Sample community for HackOHI/O Bridge Builder demo */

export type Role = "student" | "faculty" | "industry";

export type Affiliation = "student" | "alumni" | "faculty" | "industry";

export type Person = {
  id: string;
  name: string;
  handle: string;
  role: Role;
  major?: string;
  company?: string;
  department?: string;
  college: string;
  affiliation: Affiliation;
  researchTags?: string[];
  workforceRole?: string;
  avatar: string;
  bio: string;
  skills: string[];
  githubRating: number; // 1–100, meet-you-where-you-are
  githubLabel: string;
  pointsEarned: number;
  helpTopics: string[];
};

export type TierId = "bronze" | "silver" | "gold" | "platinum";

export type Tier = {
  id: TierId;
  name: string;
  minPoints: number;
  color: string;
  benefits: string[];
};

export type SponsorProject = {
  id: string;
  company: string;
  brandBlurb: string;
  title: string;
  problem: string;
  tags: string[];
  minTier: TierId;
  credit: string;
};

export type ResearchOpp = {
  id: string;
  lab: string;
  college: string;
  title: string;
  lookingFor: string[];
  contactId: string;
};

export type Project = {
  id: string;
  title: string;
  blurb: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  minRating: number;
  maxRating: number;
  duration: string;
  tags: string[];
  mentorIds: string[];
  pointsOnComplete: number;
  company?: string;
};

export type ReelVisual =
  | "cs-hook"
  | "cs-live"
  | "cs-code"
  | "cs-ship";

export type Demo = {
  id: string;
  authorId: string;
  title: string;
  caption: string;
  tags: string[];
  likes: number;
  remixCount: number;
  gradient: string;
  mediaLabel: string;
  projectId?: string;
  /** Animated in-reel demo canvas (CS product walkthrough) */
  visual?: ReelVisual;
};

export type Story = {
  id: string;
  authorId: string;
  text: string;
  status: "building" | "stuck" | "shipped";
  hoursAgo: number;
  image?: string;
};

export type ProjectUpdate = {
  id: string;
  authorId: string;
  projectTitle: string;
  kind: "milestone" | "blocker" | "ship" | "ask" | "win";
  body: string;
  hoursAgo: number;
  tags: string[];
  image?: string;
  reelHref?: string;
  posterTone?: string;
};

export type ProjectHotspot = {
  id: string;
  label: string;
  /** percent from left / top of thumbnail */
  x: number;
  y: number;
  tip: string;
  dmPrompt?: string;
};

export type Comment = {
  id: string;
  demoId: string;
  authorId: string;
  text: string;
  isFeedback: boolean;
};

export type ShopItem = {
  id: string;
  title: string;
  description: string;
  points: number;
  minutes: number;
  kind: "coffee" | "resume" | "office" | "custom";
};

export type MatchCard = {
  id: string;
  personId: string;
  headline: string;
  why: string;
  sharedSkills: string[];
  projectImage?: string;
  hotspots?: ProjectHotspot[];
};

export const YOU_ID = "you";
export const PRO_YOU_ID = "pro-you";

export const colleges = [
  "Ohio State",
  "Michigan",
  "Purdue",
  "CMU",
  "UIUC",
] as const;

export const majors = [
  "Biology",
  "Nursing",
  "Public Health",
  "English",
  "Journalism",
  "Music",
  "Business",
  "Design",
  "Microbiology",
  "CSE",
  "Psychology",
  "Education",
] as const;

/** Close majors shown together when “my major” filter is on */
export const majorFamily: Record<string, string[]> = {
  Biology: ["Biology", "Microbiology"],
  Microbiology: ["Biology", "Microbiology"],
  Nursing: ["Nursing", "Public Health"],
  "Public Health": ["Nursing", "Public Health"],
  English: ["English", "Journalism"],
  Journalism: ["English", "Journalism"],
  Design: ["Design", "Business"],
  Business: ["Business", "Design"],
  Music: ["Music"],
  CSE: ["CSE"],
  Psychology: ["Psychology", "Education"],
  Education: ["Education", "Psychology"],
};

export function majorsForFilter(major: string) {
  return majorFamily[major] ?? [major];
}

export const people: Person[] = [
  {
    id: YOU_ID,
    name: "Alex Kim",
    handle: "alexkim",
    role: "student",
    major: "Biology",
    college: "Ohio State",
    affiliation: "student",
    researchTags: ["cell biology", "writing"],
    avatar: "AK",
    bio: "First-year researcher. Learning to write papers.",
    skills: ["Lab notes", "Writing", "R basics"],
    githubRating: 42,
    githubLabel: "Getting started",
    pointsEarned: 28,
    helpTopics: ["lab reports", "lit reviews"],
  },
  {
    id: PRO_YOU_ID,
    name: "Jordan Hale",
    handle: "jhale",
    role: "industry",
    company: "Google",
    college: "Ohio State",
    affiliation: "alumni",
    workforceRole: "People ops · L5",
    avatar: "JH",
    bio: "OSU alum. 30 min/day feedback → company bonus.",
    skills: ["Hiring", "Mentorship", "Comms"],
    githubRating: 94,
    githubLabel: "Industry mentor",
    pointsEarned: 0,
    helpTopics: ["careers", "resumes", "sponsor briefs"],
  },
  {
    id: "maya",
    name: "Maya Patel",
    handle: "mayabio",
    role: "student",
    major: "Microbiology",
    college: "Ohio State",
    affiliation: "student",
    researchTags: ["microbiology", "papers"],
    avatar: "MP",
    bio: "Drafting a methods section. Happy to swap paper edits.",
    skills: ["PCR", "Writing", "Figures"],
    githubRating: 71,
    githubLabel: "Publishing steadily",
    pointsEarned: 96,
    helpTopics: ["methods", "figures", "posters"],
  },
  {
    id: "jordan",
    name: "Jordan Lee",
    handle: "jlee_art",
    role: "student",
    major: "Design",
    college: "Michigan",
    affiliation: "student",
    researchTags: ["visual design", "story"],
    avatar: "JL",
    bio: "Design major. Critiques > compliments.",
    skills: ["Poster design", "Figma", "Story"],
    githubRating: 55,
    githubLabel: "Design + story",
    pointsEarned: 64,
    helpTopics: ["critique", "posters", "pitch"],
  },
  {
    id: "sam",
    name: "Sam Okonkwo",
    handle: "samok",
    role: "student",
    major: "Nursing",
    college: "Ohio State",
    affiliation: "student",
    researchTags: ["public health", "care"],
    avatar: "SO",
    bio: "First community health project. Be patient with me.",
    skills: ["Patient notes", "Excel", "Outreach"],
    githubRating: 22,
    githubLabel: "Just starting",
    pointsEarned: 12,
    helpTopics: ["care plans", "surveys"],
  },
  {
    id: "drchen",
    name: "Dr. Priya Chen",
    handle: "profchen",
    role: "faculty",
    department: "Biology · undergrad research",
    college: "Ohio State",
    affiliation: "faculty",
    researchTags: ["cell biology", "writing"],
    avatar: "PC",
    bio: "Helps students finish papers in a semester.",
    skills: ["Mentorship", "Writing", "Ethics"],
    githubRating: 88,
    githubLabel: "Faculty guide",
    pointsEarned: 0,
    helpTopics: ["paper scope", "IRB", "posters"],
  },
  {
    id: "riya",
    name: "Riya Shah",
    handle: "riyashah",
    role: "industry",
    company: "Abbott",
    college: "Purdue",
    affiliation: "alumni",
    workforceRole: "Clinical scientist",
    avatar: "RS",
    bio: "One hour max. Bring a real question.",
    skills: ["Clinical trials", "Careers"],
    githubRating: 90,
    githubLabel: "Industry mentor",
    pointsEarned: 0,
    helpTopics: ["labs → industry", "resumes"],
  },
  {
    id: "marcus",
    name: "Marcus Webb",
    handle: "mwebb",
    role: "industry",
    company: "Honda",
    college: "Ohio State",
    affiliation: "alumni",
    workforceRole: "Community partnerships",
    avatar: "MW",
    bio: "Resume chats + sponsor briefs.",
    skills: ["Partnerships", "Hiring"],
    githubRating: 92,
    githubLabel: "Industry mentor",
    pointsEarned: 0,
    helpTopics: ["resume", "campus briefs"],
  },
  {
    id: "nina",
    name: "Nina Alvarez",
    handle: "ninawrites",
    role: "student",
    major: "English",
    college: "Ohio State",
    affiliation: "student",
    researchTags: ["writing", "editing"],
    avatar: "NA",
    bio: "Edits papers so they actually get read.",
    skills: ["Editing", "Structure", "Clarity"],
    githubRating: 48,
    githubLabel: "Writing partner",
    pointsEarned: 51,
    helpTopics: ["outlines", "clarity"],
  },
  {
    id: "aisha",
    name: "Aisha Rahman",
    handle: "aishar",
    role: "student",
    major: "Public Health",
    college: "Ohio State",
    affiliation: "student",
    researchTags: ["epidemiology", "surveys"],
    avatar: "AR",
    bio: "Survey design for a campus wellness study.",
    skills: ["Surveys", "Stats", "Canva"],
    githubRating: 58,
    githubLabel: "Fieldwork ready",
    pointsEarned: 70,
    helpTopics: ["surveys", "consent forms"],
  },
  {
    id: "diego",
    name: "Diego Morales",
    handle: "diegom",
    role: "student",
    major: "Music",
    college: "Michigan",
    affiliation: "student",
    researchTags: ["performance", "media"],
    avatar: "DM",
    bio: "Recording senior recital clips for feedback.",
    skills: ["Performance", "Audio", "Staging"],
    githubRating: 45,
    githubLabel: "Creative practice",
    pointsEarned: 40,
    helpTopics: ["recital", "recording"],
  },
  {
    id: "lena",
    name: "Lena Brooks",
    handle: "lenab",
    role: "student",
    major: "Journalism",
    college: "UIUC",
    affiliation: "student",
    researchTags: ["investigative", "writing"],
    avatar: "LB",
    bio: "Longform draft on campus housing. Need sources.",
    skills: ["Reporting", "Interviewing", "Editing"],
    githubRating: 62,
    githubLabel: "Story in progress",
    pointsEarned: 55,
    helpTopics: ["leads", "structure"],
  },
  {
    id: "omar",
    name: "Omar Hassan",
    handle: "omarh",
    role: "student",
    major: "Business",
    college: "Purdue",
    affiliation: "student",
    researchTags: ["case study", "strategy"],
    avatar: "OH",
    bio: "Case competition team looking for a designer.",
    skills: ["Strategy", "Excel", "Pitch"],
    githubRating: 50,
    githubLabel: "Case grind",
    pointsEarned: 44,
    helpTopics: ["cases", "pitch decks"],
  },
  {
    id: "kai",
    name: "Kai Nakamura",
    handle: "kainak",
    role: "student",
    major: "CSE",
    college: "Ohio State",
    affiliation: "student",
    researchTags: ["fullstack", "realtime"],
    avatar: "KN",
    bio: "Building QueueLess — live dining wait times. Want code review.",
    skills: ["TypeScript", "React", "WebSockets", "Postgres"],
    githubRating: 68,
    githubLabel: "Shipping demos",
    pointsEarned: 82,
    helpTopics: ["APIs", "system design", "demo day"],
  },
  {
    id: "priya",
    name: "Priya Nair",
    handle: "priyacode",
    role: "student",
    major: "CSE",
    college: "Michigan",
    affiliation: "student",
    researchTags: ["ml", "vision"],
    avatar: "PN",
    bio: "Campus navigation ML demo. Looking for a frontend partner.",
    skills: ["Python", "PyTorch", "UI"],
    githubRating: 74,
    githubLabel: "ML builder",
    pointsEarned: 90,
    helpTopics: ["models", "datasets"],
  },
  {
    id: "evan",
    name: "Evan Brooks",
    handle: "evanb",
    role: "student",
    major: "CSE",
    college: "Purdue",
    affiliation: "student",
    researchTags: ["security", "systems"],
    avatar: "EB",
    bio: "CTF writeups + a tiny auth library. Want design feedback.",
    skills: ["Go", "Security", "Docs"],
    githubRating: 61,
    githubLabel: "Systems tinkerer",
    pointsEarned: 58,
    helpTopics: ["security", "README"],
  },
  {
    id: "zoe",
    name: "Zoe Park",
    handle: "zoepark",
    role: "student",
    major: "Psychology",
    college: "Ohio State",
    affiliation: "student",
    researchTags: ["behavior", "surveys"],
    avatar: "ZP",
    bio: "Habit study survey — need stats eyes and a clean figure.",
    skills: ["SPSS", "Surveys", "Writing"],
    githubRating: 44,
    githubLabel: "Study design",
    pointsEarned: 39,
    helpTopics: ["surveys", "figures"],
  },
  {
    id: "chris",
    name: "Chris Delgado",
    handle: "cdelgado",
    role: "student",
    major: "Education",
    college: "Ohio State",
    affiliation: "student",
    researchTags: ["curriculum", "tutoring"],
    avatar: "CD",
    bio: "Building a peer-tutoring schedule app for first-years.",
    skills: ["Lesson plans", "Canva", "Outreach"],
    githubRating: 38,
    githubLabel: "Ed tech curious",
    pointsEarned: 33,
    helpTopics: ["tutoring", "lesson scope"],
  },
  {
    id: "hana",
    name: "Hana Yusuf",
    handle: "hanay",
    role: "student",
    major: "Biology",
    college: "UIUC",
    affiliation: "student",
    researchTags: ["genetics", "lab"],
    avatar: "HY",
    bio: "CRISPR lit review partner wanted. Figures welcome.",
    skills: ["Lab", "Lit review", "R"],
    githubRating: 57,
    githubLabel: "Lab + writing",
    pointsEarned: 66,
    helpTopics: ["lit review", "R plots"],
  },
  {
    id: "tyler",
    name: "Tyler Grant",
    handle: "tgrant",
    role: "student",
    major: "Business",
    college: "Ohio State",
    affiliation: "student",
    researchTags: ["product", "pitch"],
    avatar: "TG",
    bio: "Product case team — need a CSE teammate for the prototype.",
    skills: ["Pitch", "Roadmaps", "Excel"],
    githubRating: 49,
    githubLabel: "Product case",
    pointsEarned: 47,
    helpTopics: ["pitch", "MVP scope"],
  },
  {
    id: "sofia",
    name: "Sofia Reyes",
    handle: "sofiar",
    role: "student",
    major: "Design",
    college: "CMU",
    affiliation: "student",
    researchTags: ["ux", "research"],
    avatar: "SR",
    bio: "UX critique swaps. Bring a flow, leave with notes.",
    skills: ["Figma", "User tests", "Critique"],
    githubRating: 66,
    githubLabel: "UX partner",
    pointsEarned: 72,
    helpTopics: ["flows", "critique"],
  },
  {
    id: "amit",
    name: "Amit Rao",
    handle: "amitr",
    role: "industry",
    company: "Honda",
    college: "Ohio State",
    affiliation: "alumni",
    workforceRole: "Software engineer",
    avatar: "AR2",
    bio: "OSU CSE alum. 20 min resume + system-design chats.",
    skills: ["System design", "Resumes", "Mentorship"],
    githubRating: 91,
    githubLabel: "Industry mentor",
    pointsEarned: 0,
    helpTopics: ["interviews", "resume"],
  },
  {
    id: "jade",
    name: "Jade Nguyen",
    handle: "jadeng",
    role: "student",
    major: "Public Health",
    college: "Michigan",
    affiliation: "student",
    researchTags: ["community", "data"],
    avatar: "JN",
    bio: "Neighborhood wellness map. Need a CSE viz buddy.",
    skills: ["GIS basics", "Surveys", "Writing"],
    githubRating: 53,
    githubLabel: "Field + data",
    pointsEarned: 61,
    helpTopics: ["maps", "consent"],
  },
  {
    id: "noah",
    name: "Noah Kim",
    handle: "noahk",
    role: "student",
    major: "Microbiology",
    college: "Purdue",
    affiliation: "student",
    researchTags: ["microbes", "figures"],
    avatar: "NK",
    bio: "Poster draft for conference — roast the story arc.",
    skills: ["Figures", "Posters", "Lab"],
    githubRating: 59,
    githubLabel: "Conference bound",
    pointsEarned: 70,
    helpTopics: ["posters", "story"],
  },
];

export const projects: Project[] = [
  {
    id: "p-queueless",
    title: "QueueLess campus waits",
    blurb:
      "Realtime dining ETAs from phone pings. Demo day stack: Next, WebSockets, Postgres.",
    difficulty: 3,
    minRating: 40,
    maxRating: 85,
    duration: "2 weeks",
    tags: ["CSE", "Realtime", "Fullstack"],
    mentorIds: ["kai", "marcus"],
    pointsOnComplete: 28,
  },
  {
    id: "p-first-pr",
    title: "First short write-up",
    blurb: "Post a 1-page summary of something you learned this week.",
    difficulty: 1,
    minRating: 1,
    maxRating: 35,
    duration: "1 day",
    tags: ["Writing", "Any major"],
    mentorIds: ["sam", "nina"],
    pointsOnComplete: 8,
  },
  {
    id: "p-feedback-lab",
    title: "Feedback lab",
    blurb: "Leave helpful notes on 3 reels from any major.",
    difficulty: 1,
    minRating: 1,
    maxRating: 50,
    duration: "1 day",
    tags: ["Feedback"],
    mentorIds: ["jordan", "drchen"],
    pointsOnComplete: 10,
  },
  {
    id: "p-sensor-dash",
    title: "Lit review sprint",
    blurb: "4 weeks: gather 8 papers, write a short review with figures.",
    difficulty: 3,
    minRating: 35,
    maxRating: 70,
    duration: "4 weeks",
    tags: ["Biology", "Writing"],
    mentorIds: ["maya", "drchen"],
    pointsOnComplete: 40,
  },
  {
    id: "p-demo-story",
    title: "Poster story sprint",
    blurb: "Turn a messy draft into a clear poster or 60s talk.",
    difficulty: 2,
    minRating: 25,
    maxRating: 60,
    duration: "3 days",
    tags: ["Design", "Comms"],
    mentorIds: ["jordan", "nina"],
    pointsOnComplete: 15,
  },
  {
    id: "p-ros-lite",
    title: "Community health brief",
    blurb: "6-week partner project with a clinic or nonprofit.",
    difficulty: 4,
    minRating: 55,
    maxRating: 90,
    duration: "6 weeks",
    tags: ["Nursing", "Public Health"],
    mentorIds: ["sam", "riya"],
    pointsOnComplete: 70,
    company: "Abbott sample brief",
  },
  {
    id: "p-mentor-hours",
    title: "Peer edit hours",
    blurb: "Host two 30-min edit sessions for newer students.",
    difficulty: 2,
    minRating: 40,
    maxRating: 100,
    duration: "1 week",
    tags: ["Mentorship", "Writing"],
    mentorIds: ["drchen"],
    pointsOnComplete: 25,
  },
];

export const demos: Demo[] = [
  {
    id: "d-cs1",
    authorId: "kai",
    title: "QueueLess · the problem",
    caption:
      "12 min in line at Scott. Demo: predict wait from phone pings. Roast the pitch.",
    tags: ["CSE", "hackathon", "demo"],
    likes: 214,
    remixCount: 19,
    gradient: "from-[#0f172a] via-[#1e1b4b] to-[#312e81]",
    mediaLabel: "Reel · 0:12",
    visual: "cs-hook",
    projectId: "p-queueless",
  },
  {
    id: "d-cs2",
    authorId: "kai",
    title: "QueueLess · live map",
    caption:
      "Halls update every 8s. Tap a building → ETA. Is the UI too busy?",
    tags: ["CSE", "UI", "realtime"],
    likes: 189,
    remixCount: 27,
    gradient: "from-[#0c1222] via-[#132033] to-[#1a2744]",
    mediaLabel: "Reel · 0:15",
    visual: "cs-live",
    projectId: "p-queueless",
  },
  {
    id: "d-cs3",
    authorId: "kai",
    title: "QueueLess · the stack",
    caption:
      "Next + WS ingest + rolling avg. Where would you cache? Be mean.",
    tags: ["CSE", "backend", "code"],
    likes: 156,
    remixCount: 33,
    gradient: "from-[#020617] via-[#0f172a] to-[#14532d]",
    mediaLabel: "Reel · 0:18",
    visual: "cs-code",
    projectId: "p-queueless",
  },
  {
    id: "d-cs4",
    authorId: "kai",
    title: "QueueLess · shipped",
    caption:
      "Pilot: 3 halls, −4.2 min avg wait. Remix the model or the UX.",
    tags: ["CSE", "ship", "metrics"],
    likes: 241,
    remixCount: 41,
    gradient: "from-[#1a1030] via-[#2d1b4e] to-[#4c1d95]",
    mediaLabel: "Reel · 0:14",
    visual: "cs-ship",
    projectId: "p-queueless",
  },
  {
    id: "d1",
    authorId: "maya",
    title: "Methods draft v2",
    caption: "PCR steps + figure. Roast the clarity, not the science.",
    tags: ["biology", "paper"],
    likes: 128,
    remixCount: 14,
    gradient: "from-[#ffffc5] via-[#f6efff] to-[#e5ccff]",
    mediaLabel: "Paper · 2p",
    projectId: "p-sensor-dash",
  },
  {
    id: "d2",
    authorId: "jordan",
    title: "Poster in 60s",
    caption: "Remixed Sam’s outline into a cleaner story board.",
    tags: ["design", "story"],
    likes: 86,
    remixCount: 9,
    gradient: "from-[#f0e0ff] via-[#fffcf5] to-[#ffffc5]",
    mediaLabel: "Talk · 1:05",
    projectId: "p-demo-story",
  },
  {
    id: "d3",
    authorId: "sam",
    title: "Care plan draft",
    caption: "First community visit notes. What should I cut?",
    tags: ["nursing", "beginner"],
    likes: 54,
    remixCount: 6,
    gradient: "from-[#f6efff] via-[#e5ccff] to-[#f0e0ff]",
    mediaLabel: "Notes",
    projectId: "p-first-pr",
  },
  {
    id: "d4",
    authorId: "aisha",
    title: "Survey pilot results",
    caption: "n=40 wellness survey. Remix the question set if you want.",
    tags: ["public health"],
    likes: 201,
    remixCount: 41,
    gradient: "from-[#ffffc5] to-[#f0e0ff]",
    mediaLabel: "Results",
  },
  {
    id: "d5",
    authorId: "lena",
    title: "Housing story cut",
    caption: "First 45 seconds of the piece. Need sharper lede.",
    tags: ["journalism"],
    likes: 97,
    remixCount: 3,
    gradient: "from-[#f6efff] via-[#f0e0ff] to-[#f6efff]",
    mediaLabel: "Reel · 0:45",
    projectId: "p-demo-story",
  },
  {
    id: "d6",
    authorId: "diego",
    title: "Recital run-through",
    caption: "Audio only. Tempo feel off in bar 12?",
    tags: ["music"],
    likes: 73,
    remixCount: 5,
    gradient: "from-[#e5ccff] via-[#ffffc5] to-[#f0e0ff]",
    mediaLabel: "Audio · 0:50",
  },
  {
    id: "d7",
    authorId: "priya",
    title: "Indoor nav model",
    caption: "Vision demo clip — hallway → room label. Where’s the lag?",
    tags: ["CSE", "ML"],
    likes: 112,
    remixCount: 8,
    gradient: "from-[#0f172a] via-[#1e3a5f] to-[#e5ccff]",
    mediaLabel: "Reel · 0:22",
  },
  {
    id: "d8",
    authorId: "evan",
    title: "Auth lib README",
    caption: "60s walkthrough of the API. Too jargon-y?",
    tags: ["CSE", "docs"],
    likes: 67,
    remixCount: 11,
    gradient: "from-[#14532d] via-[#052e16] to-[#ffffc5]",
    mediaLabel: "Reel · 0:28",
  },
  {
    id: "d9",
    authorId: "maya",
    title: "Figure caption pass",
    caption: "Before/after captions on the gel. Remix if you write tighter.",
    tags: ["biology", "figures"],
    likes: 91,
    remixCount: 7,
    gradient: "from-[#f0e0ff] via-[#ffffc5] to-[#f6efff]",
    mediaLabel: "Reel · 0:18",
  },
  {
    id: "d10",
    authorId: "hana",
    title: "CRISPR lit map",
    caption: "How I clustered 12 papers. Need a co-reader.",
    tags: ["biology", "lit review"],
    likes: 58,
    remixCount: 4,
    gradient: "from-[#f6efff] via-[#e5ccff] to-[#ffffc5]",
    mediaLabel: "Talk · 0:35",
  },
  {
    id: "d11",
    authorId: "sofia",
    title: "UX flow critique",
    caption: "Onboarding wire — 4 screens. Be mean about drop-off.",
    tags: ["design", "UX"],
    likes: 134,
    remixCount: 22,
    gradient: "from-[#fffcf5] via-[#f0e0ff] to-[#e5ccff]",
    mediaLabel: "Reel · 0:40",
  },
  {
    id: "d12",
    authorId: "chris",
    title: "Tutor scheduler MVP",
    caption: "First-year matching prototype. Who wants to stress-test?",
    tags: ["education", "build"],
    likes: 49,
    remixCount: 6,
    gradient: "from-[#ffffc5] via-[#f0e0ff] to-[#f6efff]",
    mediaLabel: "Demo · 0:25",
  },
];

export const projectUpdates: ProjectUpdate[] = [
  {
    id: "u0",
    authorId: "kai",
    projectTitle: "QueueLess",
    kind: "ship",
    body: "Live dining ETAs on 3 halls. Tap the screenshot — then try the demo on Reels.",
    hoursAgo: 1,
    tags: ["CSE"],
    image: "/images/feed/queueless.jpg",
    reelHref: "/reels",
  },
  {
    id: "u0b",
    authorId: "priya",
    projectTitle: "Campus nav ML",
    kind: "ask",
    body: "Vision model for indoor wayfinding. Need a frontend partner for the map UI.",
    hoursAgo: 2,
    tags: ["CSE"],
    posterTone: "from-[#e5ccff] to-[#f6efff]",
    reelHref: "/reels",
  },
  {
    id: "u0c",
    authorId: "evan",
    projectTitle: "Auth lib writeup",
    kind: "milestone",
    body: "CTF notes → tiny auth library README. Roast the docs before I ship.",
    hoursAgo: 3,
    tags: ["CSE"],
    posterTone: "from-[#ffffc5] to-[#e5ccff]",
  },
  {
    id: "u0d",
    authorId: "kai",
    projectTitle: "QueueLess",
    kind: "ask",
    body: "Should ETA cache live at the edge or in-memory? Drop a take on the reel.",
    hoursAgo: 4,
    tags: ["CSE"],
    posterTone: "from-[#e5ccff] to-[#f0e0ff]",
    reelHref: "/reels",
  },
  {
    id: "u0e",
    authorId: "tyler",
    projectTitle: "Case + prototype",
    kind: "ask",
    body: "Business case team still needs a CSE teammate for the MVP this weekend.",
    hoursAgo: 5,
    tags: ["Business"],
    posterTone: "from-[#ffffc5] to-[#f0e0ff]",
  },
  {
    id: "u1",
    authorId: "maya",
    projectTitle: "Cell paper",
    kind: "blocker",
    body: "Stuck on the methods section. Anyone good at figure captions?",
    hoursAgo: 1,
    tags: ["Biology"],
    image: "/images/feed/methods.jpg",
  },
  {
    id: "u2",
    authorId: "sam",
    projectTitle: "Clinic visit notes",
    kind: "ship",
    body: "Finished first draft of my care plan. Open to edits.",
    hoursAgo: 2,
    tags: ["Nursing"],
    image: "/images/feed/careplan.jpg",
  },
  {
    id: "u2b",
    authorId: "jordan",
    projectTitle: "Housing poster",
    kind: "milestone",
    body: "Poster layout v3. Tap to zoom — roast hierarchy, not the typeface.",
    hoursAgo: 2,
    tags: ["Design"],
    image: "/images/feed/poster.jpg",
  },
  {
    id: "u3",
    authorId: "aisha",
    projectTitle: "Wellness survey",
    kind: "milestone",
    body: "Hit 40 responses. Cleaning data next.",
    hoursAgo: 3,
    tags: ["Public Health"],
    posterTone: "from-[#f0e0ff] to-[#ffffc5]",
  },
  {
    id: "u4",
    authorId: "lena",
    projectTitle: "Housing story",
    kind: "ask",
    body: "Need 2 sources who lived in dorm overflow. DM me.",
    hoursAgo: 4,
    tags: ["Journalism"],
    image: "/images/feed/poster.jpg",
  },
  {
    id: "u5",
    authorId: "diego",
    projectTitle: "Senior recital",
    kind: "win",
    body: "Got the hall booked. Posting a practice reel tonight.",
    hoursAgo: 5,
    tags: ["Music"],
    posterTone: "from-[#e5ccff] to-[#f6efff]",
  },
  {
    id: "u6",
    authorId: "omar",
    projectTitle: "Case competition",
    kind: "ask",
    body: "Looking for a design major for our pitch deck.",
    hoursAgo: 6,
    tags: ["Business"],
    posterTone: "from-[#ffffc5] to-[#f0e0ff]",
  },
  {
    id: "u7",
    authorId: "nina",
    projectTitle: "Peer edits",
    kind: "milestone",
    body: "Office hours tonight 7–8 for paper clarity.",
    hoursAgo: 7,
    tags: ["English"],
    posterTone: "from-[#f6efff] to-[#e5ccff]",
  },
];

export const stories: Story[] = [
  {
    id: "s0",
    authorId: "kai",
    text: "QueueLess demo reels up — roast my stack",
    status: "shipped",
    hoursAgo: 1,
    image: "/images/stories/queue.jpg",
  },
  {
    id: "s0b",
    authorId: "priya",
    text: "Indoor nav model training overnight",
    status: "building",
    hoursAgo: 2,
    image: "/images/stories/code.jpg",
  },
  {
    id: "s0c",
    authorId: "evan",
    text: "Auth lib README draft — feedback?",
    status: "stuck",
    hoursAgo: 3,
    image: "/images/stories/queueless.jpg",
  },
  {
    id: "s1",
    authorId: "maya",
    text: "Lab until 6 — bring figure drafts",
    status: "stuck",
    hoursAgo: 1,
    image: "/images/stories/lab.jpg",
  },
  {
    id: "s2",
    authorId: "jordan",
    text: "Poster critiques in the studio",
    status: "building",
    hoursAgo: 2,
    image: "/images/stories/poster.jpg",
  },
  {
    id: "s3",
    authorId: "sam",
    text: "Care plan draft is up",
    status: "shipped",
    hoursAgo: 3,
    image: "/images/stories/careplan.jpg",
  },
  {
    id: "s4",
    authorId: "diego",
    text: "Recital practice · room 214",
    status: "building",
    hoursAgo: 2,
    image: "/images/stories/code.jpg",
  },
  {
    id: "s5",
    authorId: "drchen",
    text: "Paper clinic Friday 2pm",
    status: "building",
    hoursAgo: 4,
    image: "/images/stories/lab.jpg",
  },
];

export const comments: Comment[] = [
  {
    id: "c-cs1",
    demoId: "d-cs1",
    authorId: "marcus",
    text: "Strong hook. Lead with the 12-min number even harder.",
    isFeedback: true,
  },
  {
    id: "c-cs2",
    demoId: "d-cs2",
    authorId: "jordan",
    text: "Map pins are clear. Truncate hall names less on mobile.",
    isFeedback: true,
  },
  {
    id: "c-cs3",
    demoId: "d-cs3",
    authorId: "riya",
    text: "I’d cache hall ETAs at the edge, not only in-memory.",
    isFeedback: true,
  },
  {
    id: "c-cs4",
    demoId: "d-cs4",
    authorId: "omar",
    text: "−4.2m is a great demo metric. Put it on slide 1.",
    isFeedback: true,
  },
  {
    id: "c1",
    demoId: "d1",
    authorId: "nina",
    text: "Cut the second paragraph — lead with the figure.",
    isFeedback: true,
  },
  {
    id: "c2",
    demoId: "d1",
    authorId: "drchen",
    text: "Add one sentence on why this protocol.",
    isFeedback: true,
  },
  {
    id: "c3",
    demoId: "d3",
    authorId: "aisha",
    text: "Consent language looks solid. Tighten the goals.",
    isFeedback: true,
  },
  {
    id: "c4",
    demoId: "d5",
    authorId: "jordan",
    text: "Lede is soft — start with the conflict.",
    isFeedback: true,
  },
  {
    id: "c5",
    demoId: "d2",
    authorId: "omar",
    text: "Story board is clear. I’d hire this deck energy.",
    isFeedback: true,
  },
];

export const shopItems: ShopItem[] = [
  {
    id: "shop-coffee",
    title: "Coffee chat",
    description: "15 min with a mentor. Bring one question.",
    points: 15,
    minutes: 15,
    kind: "coffee",
  },
  {
    id: "shop-resume",
    title: "Resume review",
    description: "30 min on real work, not AI polish.",
    points: 20,
    minutes: 30,
    kind: "resume",
  },
  {
    id: "shop-office",
    title: "Office hours",
    description: "~1 point ≈ 1 minute.",
    points: 10,
    minutes: 10,
    kind: "office",
  },
  {
    id: "shop-deep",
    title: "Deep dive",
    description: "45 min on a paper, case, or portfolio.",
    points: 35,
    minutes: 45,
    kind: "custom",
  },
];

export const matchCards: MatchCard[] = [
  {
    id: "m0",
    personId: "kai",
    headline: "Demo day buddy",
    why: "CSE · shipping QueueLess. Tap the hotspots on their project.",
    sharedSkills: ["TypeScript", "Realtime"],
    projectImage: "/images/match/queueless.jpg",
    hotspots: [
      {
        id: "h-demo",
        label: "Demo",
        x: 28,
        y: 42,
        tip: "Live wait map for 3 dining halls.",
        dmPrompt: "Loved the QueueLess demo — can I remix the ETA model?",
      },
      {
        id: "h-repo",
        label: "Repo",
        x: 72,
        y: 38,
        tip: "Next + WebSockets + Postgres.",
        dmPrompt: "Mind if I peek at how you do the rolling average?",
      },
      {
        id: "h-ask",
        label: "Ask",
        x: 50,
        y: 72,
        tip: "Wants brutal feedback on caching.",
        dmPrompt: "Where would you cache hall ETAs — edge or in-memory?",
      },
    ],
  },
  {
    id: "m1",
    personId: "maya",
    headline: "Paper swap",
    why: "Same college · bio writing level matches yours.",
    sharedSkills: ["Writing", "Lab notes"],
    projectImage: "/images/match/bio.jpg",
    hotspots: [
      {
        id: "h-fig",
        label: "Figure",
        x: 35,
        y: 48,
        tip: "Gel draft — captions still rough.",
        dmPrompt: "Want a second pair of eyes on your figure captions?",
      },
      {
        id: "h-methods",
        label: "Methods",
        x: 68,
        y: 58,
        tip: "Stuck on PCR write-up clarity.",
        dmPrompt: "I can trade a methods edit for a lit-review pass.",
      },
    ],
  },
  {
    id: "m2",
    personId: "jordan",
    headline: "Poster help",
    why: "Design major who loves clear stories.",
    sharedSkills: ["Story"],
    projectImage: "/images/match/poster.jpg",
    hotspots: [
      {
        id: "h-layout",
        label: "Layout",
        x: 40,
        y: 40,
        tip: "Hierarchy pass needed before critique night.",
        dmPrompt: "Can you critique my poster hierarchy this week?",
      },
      {
        id: "h-type",
        label: "Type",
        x: 65,
        y: 70,
        tip: "Open to type pairing suggestions.",
        dmPrompt: "Thoughts on a tighter type pairing for the lede?",
      },
    ],
  },
  {
    id: "m3",
    personId: "sam",
    headline: "Peer mentee",
    why: "Newer nursing student — guiding them earns points.",
    sharedSkills: ["Outreach"],
  },
  {
    id: "m4",
    personId: "drchen",
    headline: "Faculty check-in",
    why: "10 min to cut paper scope before it balloons.",
    sharedSkills: ["Writing"],
  },
  {
    id: "m5",
    personId: "nina",
    headline: "Edit buddy",
    why: "English major · clarity edits for any field.",
    sharedSkills: ["Editing"],
  },
  {
    id: "m6",
    personId: "priya",
    headline: "ML frontend swap",
    why: "Needs a UI partner for campus nav demo.",
    sharedSkills: ["Python", "UI"],
  },
  {
    id: "m7",
    personId: "evan",
    headline: "Docs + security",
    why: "Wants someone to roast the README before demo day.",
    sharedSkills: ["Go", "Docs"],
  },
  {
    id: "m8",
    personId: "zoe",
    headline: "Stats buddy",
    why: "Habit study needs a cleaner figure + survey check.",
    sharedSkills: ["Surveys", "Writing"],
  },
  {
    id: "m9",
    personId: "chris",
    headline: "Ed-tech build",
    why: "Tutoring scheduler — open to CSE help on the prototype.",
    sharedSkills: ["Outreach", "Canva"],
  },
  {
    id: "m10",
    personId: "hana",
    headline: "Lit review pair",
    why: "Biology · CRISPR review. Figures + R plots welcome.",
    sharedSkills: ["Lit review", "Lab"],
  },
  {
    id: "m11",
    personId: "tyler",
    headline: "Case + prototype",
    why: "Business case team hunting a CSE teammate.",
    sharedSkills: ["Pitch", "MVP"],
  },
  {
    id: "m12",
    personId: "sofia",
    headline: "UX critique",
    why: "Bring a flow — leave with sharp notes.",
    sharedSkills: ["Figma", "Critique"],
  },
  {
    id: "m13",
    personId: "amit",
    headline: "Industry chat",
    why: "Honda SWE alum · resume + system-design office hours.",
    sharedSkills: ["Interviews", "Mentorship"],
  },
  {
    id: "m14",
    personId: "jade",
    headline: "Viz collaborator",
    why: "Wellness map needs a CSE visualization buddy.",
    sharedSkills: ["Surveys", "Maps"],
  },
  {
    id: "m15",
    personId: "noah",
    headline: "Poster roast",
    why: "Conference poster — wants story-arc feedback.",
    sharedSkills: ["Figures", "Posters"],
  },
  {
    id: "m16",
    personId: "aisha",
    headline: "Survey pilot",
    why: "Wellness survey at 40 responses — cleaning + viz next.",
    sharedSkills: ["Surveys", "Stats"],
  },
  {
    id: "m17",
    personId: "lena",
    headline: "Source hunt",
    why: "Housing story needs interview leads on campus.",
    sharedSkills: ["Reporting", "Writing"],
  },
  {
    id: "m18",
    personId: "diego",
    headline: "Recital clip",
    why: "Wants staging notes on a 50s practice reel.",
    sharedSkills: ["Performance", "Audio"],
  },
  {
    id: "m19",
    personId: "omar",
    headline: "Deck designer",
    why: "Case team still needs a design major for slides.",
    sharedSkills: ["Strategy", "Pitch"],
  },
  {
    id: "m20",
    personId: "riya",
    headline: "Lab → industry",
    why: "Abbott alum · short chats on clinical research careers.",
    sharedSkills: ["Careers", "Resumes"],
  },
  {
    id: "m21",
    personId: "marcus",
    headline: "Sponsor brief",
    why: "Honda partnerships — resume + campus brief tips.",
    sharedSkills: ["Hiring", "Partnerships"],
  },
];

/** True when a person's major matches the profile major (incl. close family). */
export function sameMajorFamily(
  personMajor: string | undefined,
  myMajor: string,
) {
  if (!personMajor) return false;
  return majorsForFilter(myMajor).includes(personMajor);
}

/** Feed / reels / stories filter from Settings “What I see”. */
export function passesViewerFilter(
  person: { major?: string; college?: string },
  opts: {
    contentScope: "major" | "campus" | "all";
    myMajor: string;
    myCollege: string;
  },
) {
  if (opts.contentScope === "all") return true;
  if (opts.contentScope === "campus") {
    return person.college === opts.myCollege;
  }
  return sameMajorFamily(person.major, opts.myMajor);
}

/** Match deck: only people in the selected major (no other majors mixed in). */
export function buildMatchDeck(
  myMajor: string,
  excludePersonIds: string[] = [],
  opts: { allMajors?: boolean } = {},
): MatchCard[] {
  const excluded = new Set(excludePersonIds);
  const open = matchCards.filter((c) => !excluded.has(c.personId));
  if (opts.allMajors) return open;
  return open.filter((c) =>
    sameMajorFamily(personById(c.personId).major, myMajor),
  );
}

export function personById(id: string) {
  return people.find((p) => p.id === id)!;
}

export function projectsForRating(rating: number) {
  return projects
    .filter((p) => rating >= p.minRating && rating <= p.maxRating + 15)
    .sort(
      (a, b) =>
        Math.abs((a.minRating + a.maxRating) / 2 - rating) -
        Math.abs((b.minRating + b.maxRating) / 2 - rating),
    );
}

export function mentorsForQuestion(topic: string) {
  const q = topic.toLowerCase();
  return people
    .filter((p) => p.id !== YOU_ID && p.id !== PRO_YOU_ID)
    .map((p) => ({
      person: p,
      score: p.helpTopics.reduce(
        (s, t) => s + (q.includes(t.toLowerCase()) || t.toLowerCase().includes(q) ? 3 : 0),
        0,
      ) +
        p.skills.reduce(
          (s, sk) => s + (q.includes(sk.toLowerCase()) ? 2 : 0),
          0,
        ) +
        (p.role === "faculty" || p.role === "industry" ? 1 : 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function ratingTone(rating: number) {
  if (rating < 30) return { label: "Just starting", tip: "Small posts and feedback count." };
  if (rating < 50) return { label: "Building", tip: "Try a short project matched to you." };
  if (rating < 70) return { label: "Going strong", tip: "Ready for longer team work." };
  return { label: "Leading", tip: "Help newer students next." };
}

export const tiers: Tier[] = [
  {
    id: "bronze",
    name: "Bronze",
    minPoints: 0,
    color: "#c4a574",
    benefits: [
      "Browse demos & stories",
      "Match with peers on your campus",
      "Leave feedback (+pts)",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    minPoints: 40,
    color: "#9aa0a6",
    benefits: [
      "Everything in Bronze",
      "Peer mentor matching",
      "Faculty office-hour drops",
      "College research browse",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    minPoints: 90,
    color: "#d4a017",
    benefits: [
      "Everything in Silver",
      "Professor mentor video library",
      "Priority mentor shop slots",
      "Alumni badge network",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    minPoints: 160,
    color: "#7b4fd4",
    benefits: [
      "Everything in Gold",
      "Sponsor projects (Google, Honda, …)",
      "Company problem briefs for credit",
      "Intro to industry mentors above your rating",
    ],
  },
];

export const sponsorProjects: SponsorProject[] = [
  {
    id: "sp-google",
    company: "Google",
    brandBlurb: "Brand on feed",
    title: "Highlight every major",
    problem: "Fair way to feature student work across fields.",
    tags: ["Any major"],
    minTier: "platinum",
    credit: "Mentor chat",
  },
  {
    id: "sp-honda",
    company: "Honda",
    brandBlurb: "Campus brief",
    title: "Teamwork stories",
    problem: "5 short stories about finishing under a deadline.",
    tags: ["Writing"],
    minTier: "platinum",
    credit: "Showcase",
  },
  {
    id: "sp-abbott",
    company: "Abbott",
    brandBlurb: "Health brief",
    title: "Clearer intake sheet",
    problem: "Rewrite a handout for first-year nursing students.",
    tags: ["Nursing"],
    minTier: "platinum",
    credit: "Coffee chat",
  },
];

export const researchOpps: ResearchOpp[] = [
  {
    id: "r1",
    lab: "Cell Biology Lab",
    college: "Ohio State",
    title: "Undergrad paper assistants",
    lookingFor: ["cell biology", "writing", "figures"],
    contactId: "drchen",
  },
  {
    id: "r2",
    lab: "Campus Wellness Study",
    college: "Ohio State",
    title: "Survey + outreach help",
    lookingFor: ["surveys", "public health", "outreach"],
    contactId: "aisha",
  },
  {
    id: "r3",
    lab: "Design Studio",
    college: "Michigan",
    title: "Poster & talk coaching",
    lookingFor: ["visual design", "story", "posters"],
    contactId: "jordan",
  },
];

export const profVideos = [
  {
    id: "v1",
    title: "Cut your paper scope",
    prof: "Dr. Priya Chen",
    mins: 8,
  },
  {
    id: "v2",
    title: "Feedback that helps",
    prof: "Dr. Priya Chen",
    mins: 6,
  },
  {
    id: "v3",
    title: "Empty portfolio? Start here",
    prof: "Faculty panel",
    mins: 11,
  },
];

export function tierForPoints(points: number): Tier {
  let current = tiers[0];
  for (const t of tiers) {
    if (points >= t.minPoints) current = t;
  }
  return current;
}

export function peopleYouMightKnow(college: string, selfId: string) {
  return people.filter(
    (p) =>
      p.id !== selfId &&
      p.id !== YOU_ID &&
      p.id !== PRO_YOU_ID &&
      p.college === college,
  );
}

export function filterPeopleByCollege(college: string | "all") {
  if (college === "all") return people.filter((p) => p.id !== YOU_ID && p.id !== PRO_YOU_ID);
  return people.filter(
    (p) => p.college === college && p.id !== YOU_ID && p.id !== PRO_YOU_ID,
  );
}
