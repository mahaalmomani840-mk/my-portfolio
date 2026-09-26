import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import type { PortfolioProject } from "../../../drizzle/schema";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Download,
  ExternalLink,
  Film,
  Mail,
  Menu,
  Play,
  X,
} from "lucide-react";
import {
  getPosterStyle,
  getProjectLabel,
  hasValue,
  siteConfig,
  type ProjectRecord,
} from "@/lib/siteConfig";

function persistedProjectToRecord(project: PortfolioProject): ProjectRecord {
  return {
    id: `project-${project.id}`,
    title: project.title,
    category: project.category ?? "",
    context: project.context ?? "",
    objective: project.objective ?? "",
    audience: project.audience ?? "",
    role: project.role ?? "",
    tools: project.tools ?? "",
    aiContribution: project.aiContribution ?? "",
    editingDecisions: project.editingDecisions ?? "",
    outcome: project.outcome ?? "",
    videoUrl: project.videoUrl ?? "",
    posterUrl: project.posterUrl ?? "",
    aspectRatio: project.aspectRatio ?? "",
    duration: project.duration ?? "",
    captionUrl: project.captionUrl ?? "",
    transcript: project.transcript ?? "",
    featured: project.featured === 1,
    workType: (project.workType as ProjectRecord["workType"]) ?? "",
  };
}

function SectionLabel({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className={`section-label ${light ? "section-label-light" : ""}`}>
      <span className="section-label-line" />
      <span>{children}</span>
    </div>
  );
}

function PlayMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`play-mark ${small ? "play-mark-small" : ""}`} aria-hidden="true">
      <Play size={small ? 12 : 16} fill="currentColor" strokeWidth={1.5} />
    </span>
  );
}

function PlaceholderPoster({ project, index, featured = false }: { project: ProjectRecord; index: number; featured?: boolean }) {
  return (
    <div className={`poster ${getPosterStyle(index)} ${featured ? "poster-featured" : ""}`}>
      <div className="poster-grain" />
      <div className="poster-topline">
        <span>{project.id.replace("project-", "0")}</span>
        <span>{project.workType || "WORK SAMPLE"}</span>
      </div>
      <div className="poster-orbit poster-orbit-one" />
      <div className="poster-orbit poster-orbit-two" />
      <div className="poster-copy">
        <span className="poster-kicker">MA / SOCIAL REEL</span>
        <strong>{project.title}</strong>
        <span className="poster-status">Live social reel</span>
      </div>
      <div className="poster-footer">
        <span>Amman, JO</span>
        <span>{project.aspectRatio || (featured ? "16:9 VIDEO" : "9:16 REEL")}</span>
      </div>
    </div>
  );
}

function ProjectCard({ project, index, onOpen }: { project: ProjectRecord; index: number; onOpen: (project: ProjectRecord) => void }) {
  return (
    <article className={`project-card ${project.featured ? "project-card-featured" : ""}`}>
      <button className="project-poster-button" type="button" onClick={() => onOpen(project)} aria-label={`Open ${project.title}`}>
        {hasValue(project.videoUrl) ? (
          <>
            <PlaceholderPoster project={project} index={index} featured={project.featured} />
            <video
              className="project-poster-image project-poster-video"
              src={project.videoUrl}
              poster={hasValue(project.posterUrl) ? project.posterUrl : undefined}
              muted
              loop
              playsInline
              preload="none"
              aria-label={`${project.title} social reel`}
              onContextMenu={(event) => event.preventDefault()}
              onMouseEnter={(event) => { void event.currentTarget.play(); }}
              onMouseLeave={(event) => { event.currentTarget.pause(); event.currentTarget.currentTime = 0; }}
            />
          </>
        ) : hasValue(project.posterUrl) ? (
          <img className="project-poster-image" src={project.posterUrl} alt={`${project.title} poster`} />
        ) : (
          <PlaceholderPoster project={project} index={index} />
        )}
        <span className="poster-play"><PlayMark small /></span>
      </button>
      <div className="project-card-meta">
        <div>
          <span className="project-index">0{index + 1}</span>
          <h3>{project.title}</h3>
        </div>
        <button className="project-open" type="button" onClick={() => onOpen(project)}>
          View details <ArrowUpRight size={15} strokeWidth={1.8} />
        </button>
      </div>
      <p className="project-category">{getProjectLabel(project)}</p>
    </article>
  );
}

function ProjectDialog({ project, index, onClose }: { project: ProjectRecord | null; index: number; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!project) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  if (!project) return null;
  const details = [
    ["Context", project.context],
    ["Objective", project.objective],
    ["Audience", project.audience],
    ["My contribution", project.role],
    ["Editing decisions", project.editingDecisions],
    ["Tools", project.tools],
    ["AI contribution", project.aiContribution],
    ["Outcome", project.outcome],
  ].filter(([, value]) => hasValue(value));

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className="project-dialog" role="dialog" aria-modal="true" aria-labelledby="project-dialog-title">
        <div className="dialog-media">
          {hasValue(project.videoUrl) ? (
            <video
              src={project.videoUrl}
              poster={hasValue(project.posterUrl) ? project.posterUrl : undefined}
              controls
              autoPlay
              controlsList="nodownload noremoteplayback"
              disablePictureInPicture
              playsInline
              preload="none"
              onContextMenu={(event) => event.preventDefault()}
              onPlay={(event) => {
                document.querySelectorAll("video").forEach((video) => {
                  if (video !== event.currentTarget) video.pause();
                });
              }}
            >
              {hasValue(project.captionUrl) ? <track kind="captions" src={project.captionUrl} /> : null}
            </video>
          ) : hasValue(project.posterUrl) ? (
            <img src={project.posterUrl} alt={`${project.title} poster`} />
          ) : (
            <PlaceholderPoster project={project} index={index} featured />
          )}
          {!hasValue(project.videoUrl) && (
            <div className="dialog-media-note"><Film size={16} /> Video URL pending</div>
          )}
        </div>
        <div className="dialog-content">
          <div className="dialog-heading">
            <div>
              <span className="eyebrow">{project.workType || "Work sample"} / 0{index + 1}</span>
              <h2 id="project-dialog-title">{project.title}</h2>
            </div>
            <button ref={closeButtonRef} className="icon-button dialog-close" type="button" onClick={onClose} aria-label="Close project details">
              <X size={20} />
            </button>
          </div>
          {details.length > 0 ? (
            <div className="detail-list">
              {details.map(([label, value]) => (
                <div className="detail-row" key={label}>
                  <span>{label}</span>
                  <p>{value}</p>
                </div>
              ))}
            </div>
          ) : null}
          {hasValue(project.transcript) && <div className="transcript-block"><span>Transcript</span><p>{project.transcript}</p></div>}
          {hasValue(project.videoUrl) && (
            <a className="direct-video-link" href={project.videoUrl} target="_blank" rel="noreferrer">
              Open direct video link <ExternalLink size={15} />
            </a>
          )}
        </div>
      </section>
    </div>
  );
}

function Home() {
  const isStaticSite = import.meta.env.VITE_STATIC_SITE === "true";
  const publicData = trpc.portfolio.publicData.useQuery(undefined, {
    enabled: !isStaticSite,
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<ProjectRecord | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Keep public project content editable directly in siteConfig.ts.
  // Set to true only when the protected Studio/database workflow is ready to be used.
  const useDatabaseProjects = false;
  const projects = useDatabaseProjects && publicData.data?.projects?.length ? publicData.data.projects.map(persistedProjectToRecord) : siteConfig.projects;
  const cvUrl = isStaticSite
    ? siteConfig.person.cvUrl
    : publicData.data?.settings?.cvUrl ?? siteConfig.person.cvUrl;
  const navItems = [
    ["Work", "work"],
    ["Expertise", "expertise"],
    ["About", "about"],
    ["Contact", "contact"],
  ];

  const openProject = (project: ProjectRecord) => {
    setActiveProject(project);
    setActiveIndex(projects.findIndex((item) => item.id === project.id));
  };

  const closeProject = () => setActiveProject(null);

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Maha Almomani home">
          <span className="wordmark-mark"><span>MA</span><i aria-hidden="true">.</i></span>
          <span className="wordmark-name">Maha<br />Almomani</span>
        </a>
        <nav className={`desktop-nav ${menuOpen ? "nav-open" : ""}`} aria-label="Primary navigation">
          {navItems.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
          {hasValue(cvUrl) && <a className="nav-cv" href={cvUrl} target="_blank" rel="noreferrer">CV <Download size={13} /></a>}
        </nav>
        <a className="header-availability" href={`mailto:${siteConfig.person.email}`}>
          <span className="availability-dot" /> Available for opportunities
        </a>
        <button className="menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="primary-navigation" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>
      <nav id="primary-navigation" className={`mobile-nav ${menuOpen ? "mobile-nav-open" : ""}`} aria-label="Mobile navigation">
        {navItems.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}<ArrowUpRight size={16} /></a>)}
        {hasValue(cvUrl) && <a href={cvUrl} target="_blank" rel="noreferrer">Download CV <Download size={16} /></a>}
      </nav>

      <main id="top">
        <section className="hero section-pad">
          <div className="hero-copy">
            <div className="hero-kicker"><span className="kicker-dot" /> {siteConfig.hero.eyebrow}</div>
            <h1>I turn brand goals into<br /><span className="hero-script">social content.</span></h1>
            <p className="hero-intro">{siteConfig.hero.intro}</p>
            <div className="hero-actions">
              <a className="button button-lime" href="#work">View my work <ArrowDownRight size={18} /></a>
              <a className="text-link" href={`mailto:${siteConfig.person.email}`}>Let's talk <ArrowUpRight size={16} /></a>
              {hasValue(cvUrl) && <a className="cv-link" href={cvUrl} target="_blank" rel="noreferrer">CV <Download size={15} /></a>}
            </div>
            <div className="hero-footnote">
              <span>Based in {siteConfig.person.location}</span>
              <span className="hero-footnote-line" />
              <span>01 / 05 work slots ready</span>
            </div>
          </div>
          <div className="hero-poster-wrap">
            <div className="hero-poster-label">Featured work / 2026</div>
            <button className="hero-poster" type="button" onClick={() => openProject(projects[0])} aria-label="Open featured project">
              <div className="hero-poster-grid" />
              <div className="hero-poster-circle hero-poster-circle-one" />
              <div className="hero-poster-circle hero-poster-circle-two" />
              <div className="hero-poster-top"><span>MA</span><span>SELECTED</span></div>
              <div className="hero-poster-title"><span>VIDEO<br />WORK</span><i>—</i><span>01</span></div>
              <div className="hero-poster-bottom"><span>Poster to be supplied</span><span><PlayMark small /></span></div>
            </button>
            <div className="hero-poster-caption"><span>Static placeholder</span><span>Real media slot</span></div>
          </div>
        </section>

        <section className="marquee-band" aria-label="Specialisms">
          <div className="marquee-track"><div className="marquee-content">{[...siteConfig.expertise, { number: "05", title: "Product Photography", description: "" }, { number: "06", title: "Digital Marketing", description: "" }].map((item) => <span className="marquee-skill" key={item.number}><span>{item.title}</span><i>/</i></span>)}</div><div className="marquee-content" aria-hidden="true">{[...siteConfig.expertise, { number: "05", title: "Product Photography", description: "" }, { number: "06", title: "Digital Marketing", description: "" }].map((item) => <span className="marquee-skill" key={`duplicate-${item.number}`}><span>{item.title}</span><i>/</i></span>)}</div></div>
        </section>

        <section id="work" className="work-section section-pad">
          <div className="section-heading section-heading-work">
            <div><SectionLabel>Selected work</SectionLabel><h2>Five stories.<br /><em>Many ways in.</em></h2></div>
            <div className="section-heading-aside"><span>01—05</span><p>Video editing is the through-line — a practical showcase of how I think, shape, and deliver content.</p></div>
          </div>
          <div className="project-grid">
            {projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} onOpen={openProject} />)}
          </div>
        </section>

        <section id="expertise" className="expertise-section section-pad dark-section">
          <div className="section-heading section-heading-expertise"><div><SectionLabel light>What I bring</SectionLabel><h2>Useful at the<br /><em>intersection.</em></h2></div><p className="dark-intro">From a clean caption to a coordinated campaign, I like the parts of marketing that make ideas easier to understand — and easier to act on.</p></div>
          <div className="expertise-grid">
            {siteConfig.expertise.map((item) => <article className="expertise-item" key={item.number}><span className="expertise-number">{item.number}</span><h3>{item.title}</h3><p>{item.description}</p><ArrowUpRight className="expertise-arrow" size={19} /></article>)}
          </div>
        </section>

        <section id="about" className="about-section section-pad">
          <div className="section-heading"><div><SectionLabel>About / experience</SectionLabel><h2>A marketer who<br /><em>keeps it human.</em></h2></div><div className="about-stamp"><span>AMMAN</span><strong>MA</strong><span>JORDAN / 2026</span></div></div>
          <div className="about-grid">
            <div className="about-copy"><p className="about-lede">I’m Maha, a marketing and social media specialist based in Amman. My Business Administration and E-Commerce background gives me a practical lens for building content that is clear, considered, and connected to a real business goal.</p><p>I’ve worked across social content, copywriting, client accounts, creative coordination, visual campaigns, product photography, and AI-assisted workflows. I’m highly skilled in CapCut and currently developing my Adobe Premiere Pro skills.</p><div className="language-list">{siteConfig.languages.map((language) => <span key={language}>{language}</span>)}</div></div>
            <div className="timeline" aria-label="Work experience timeline">{siteConfig.experience.map((item) => <article className="timeline-item" key={`${item.company}-${item.role}`}><div className="timeline-date">{item.dates}</div><div className="timeline-marker" /><div className="timeline-content"><h3>{item.role}</h3><span>{item.company}</span><p>{item.details}</p></div></article>)}</div>
          </div>
          <div className="credentials-grid">
            <div className="credential-column">
              <span className="mini-heading">Education</span>
              {siteConfig.education.map((item) => <article className="credential-item" key={item.title}><span className="credential-date">{item.dates}</span><h3>{item.title}</h3><p>{item.institution}</p></article>)}
            </div>
            <div className="credential-column">
              <span className="mini-heading">Training & certifications</span>
              {siteConfig.training.map((item) => <article className="credential-item" key={item.title}><span className="credential-date">{item.dates}</span><h3>{item.title}</h3>{item.institution && <p>{item.institution}</p>}</article>)}
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section section-pad">
          <div className="contact-ghost">HELLO</div>
          <SectionLabel light>Start a conversation</SectionLabel>
          <div className="contact-layout"><div><h2>Have a role,<br /><span className="contact-accent">brief, or idea?</span></h2><p>I’d love to hear what you’re building and explore where thoughtful content can help.</p></div><div className="contact-links"><a className="contact-link" href={`mailto:${siteConfig.person.email}`}><span><Mail size={19} /> Email me</span><ArrowUpRight size={22} /></a><a className="contact-link" href={siteConfig.person.linkedin} target="_blank" rel="noreferrer"><span><ExternalLink size={19} /> LinkedIn</span><ArrowUpRight size={22} /></a></div></div>
          <div className="contact-footer"><span>{siteConfig.person.email}</span><span>Amman, Jordan</span><span>© {new Date().getFullYear()} Maha Almomani</span></div>
        </section>
      </main>

      <ProjectDialog project={activeProject} index={activeIndex} onClose={closeProject} />
    </div>
  );
}

export default Home;
