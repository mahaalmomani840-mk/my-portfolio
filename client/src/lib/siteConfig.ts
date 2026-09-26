export type WorkType = "client" | "training" | "self-initiated" | "";

export interface ProjectRecord {
  id: string;
  title: string;
  category: string;
  context: string;
  objective: string;
  audience: string;
  role: string;
  tools: string;
  aiContribution: string;
  editingDecisions: string;
  outcome: string;
  videoUrl: string;
  posterUrl: string;
  aspectRatio: string;
  duration: string;
  captionUrl: string;
  transcript: string;
  featured: boolean;
  workType: WorkType;
}

export const siteConfig = {
  person: {
    name: "Maha Almomani",
    monogram: "MA",
    title: "Marketing & Social Media Specialist",
    location: "Amman, Jordan",
    email: "mahaalmomani840@gmail.com",
    linkedin: "https://www.linkedin.com/in/maha-almomani-a02b69266/",
    cvUrl: "/MahaAlmomani_CV.pdf",
    socialImageUrl: "",
  },
  hero: {
    eyebrow: "Marketing / Content / Amman",
    headline: "I turn brand goals into social content.",
    intro:
      "I build clear, useful content systems across strategy, copy, accounts, visual storytelling, and AI-assisted production.",
  },
  projects: [
    {
      id: "project-01",
      title: "Project 01",
      category: "",
      context: "",
      objective: "",
      audience: "",
      role: "",
      tools: "",
      aiContribution: "",
      editingDecisions: "",
      outcome: "",
      videoUrl: "https://res.cloudinary.com/dlcznjfy2/video/upload/v1790253897/icgzsqmohv5odhkqs8an.mp4",
      posterUrl: "",
      aspectRatio: "",
      duration: "",
      captionUrl: "",
      transcript: "",
      featured: true,
      workType: "",
    },
    {
      id: "project-02",
      title: "Project 02",
      category: "",
      context: "",
      objective: "",
      audience: "",
      role: "",
      tools: "",
      aiContribution: "",
      editingDecisions: "",
      outcome: "",
      videoUrl: "https://res.cloudinary.com/dlcznjfy2/video/upload/f_mp4/v1790253982/fe2v7ghlhto65afh1aas.mp4",
      posterUrl: "",
      aspectRatio: "",
      duration: "",
      captionUrl: "",
      transcript: "",
      featured: false,
      workType: "",
    },
    {
      id: "project-03",
      title: "Project 03",
      category: "",
      context: "",
      objective: "",
      audience: "",
      role: "",
      tools: "",
      aiContribution: "",
      editingDecisions: "",
      outcome: "",
      videoUrl: "https://res.cloudinary.com/dlcznjfy2/video/upload/f_mp4/v1790254064/j6pucsl8jnq51rklsija.mp4",
      posterUrl: "",
      aspectRatio: "",
      duration: "",
      captionUrl: "",
      transcript: "",
      featured: false,
      workType: "",
    },
    {
      id: "project-04",
      title: "Project 04",
      category: "",
      context: "",
      objective: "",
      audience: "",
      role: "",
      tools: "",
      aiContribution: "",
      editingDecisions: "",
      outcome: "",
      videoUrl: "https://res.cloudinary.com/dlcznjfy2/video/upload/f_mp4/v1790254306/z6twobkxu4j4ucn4row7.mp4",
      posterUrl: "",
      aspectRatio: "",
      duration: "",
      captionUrl: "",
      transcript: "",
      featured: false,
      workType: "",
    },
    {
      id: "project-05",
      title: "Project 05",
      category: "",
      context: "",
      objective: "",
      audience: "",
      role: "",
      tools: "",
      aiContribution: "",
      editingDecisions: "",
      outcome: "",
      videoUrl: "https://res.cloudinary.com/dlcznjfy2/video/upload/v1790254747/pz3ih1mzakhct8eatxce.mp4",
      posterUrl: "",
      aspectRatio: "",
      duration: "",
      captionUrl: "",
      transcript: "",
      featured: false,
      workType: "",
    },
  ] satisfies ProjectRecord[],
  expertise: [
    {
      number: "01",
      title: "Content Strategy & Campaigns",
      description:
        "Social content production, content calendars, visual campaigns, product photography, and retail-promotion coordination.",
    },
    {
      number: "02",
      title: "Copywriting & Scripting",
      description:
        "Promotional copy, captions, and coordinated written content shaped for clear, purposeful communication.",
    },
    {
      number: "03",
      title: "Visual Content, Video & AI",
      description:
        "CapCut-led editing, AI-assisted content workflows, visual storytelling, and five edited AI-incorporating videos ready to be added here.",
    },
    {
      number: "04",
      title: "Account Management & Coordination",
      description:
        "Client communication, creative-team coordination, deliverables, timelines, and campaign execution oversight.",
    },
  ],
  experience: [
    {
      dates: "September 2024 — Present",
      role: "Marketing Admin Assistant",
      company: "Abdeen Grand Stores",
      details:
        "Social content production, AI-assisted content workflows, visual campaigns, product photography, and coordination of retail promotions.",
    },
    {
      dates: "April 2024 — September 2024",
      role: "Account Manager",
      company: "Refresh Agency",
      details:
        "Client communication, coordinating creative teams, managing deliverables and timelines, and overseeing content and campaign execution.",
    },
    {
      dates: "March 2023 — March 2024",
      role: "Social Media Specialist & Content Writer",
      company: "Almomyaz",
      details:
        "Promotional copy, captions, content calendars, and coordinated written and visual content.",
    },
  ],
  education: [
    { dates: "2019 - 2023", title: "Bachelor of Business Administration", institution: "University of Jordan" },
    { dates: "2015 - 2018", title: "Diploma in E-Commerce", institution: "Al-Balqa Applied University" },
  ],
  training: [
    { dates: "January - April 2026", title: "Motion Graphics & Video Editing", institution: "31 Agency" },
    { dates: "January - April 2026", title: "Creative Branding & Graphic Design with AI", institution: "31 Agency" },
    { dates: "February - March 2023", title: "Social Media Management Certificate", institution: "" },
    { dates: "September - December 2022", title: "Digital Marketing and Design", institution: "PSUT" },
  ],
  languages: ["Arabic — native", "English — advanced"],
} as const;

export type SiteConfig = typeof siteConfig;

export function hasValue(value: string) {
  return Boolean(value && value.trim());
}

export function getProjectLabel(project: ProjectRecord) {
  if (hasValue(project.category)) return project.category;
  if (project.featured) return "Featured work slot";
  return "Video work slot";
}

export function getPosterStyle(index: number) {
  const palettes = [
    "poster-lime",
    "poster-coral",
    "poster-petrol",
    "poster-ivory",
    "poster-split",
  ];
  return palettes[index % palettes.length];
}
