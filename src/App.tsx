import React, { useState, useEffect, useRef } from 'react';
import { PROFILE_PHOTO_BASE64 } from './profilePhoto';

interface FormStatus {
  show: boolean;
  type: 'success' | 'error';
  title: string;
  desc: string;
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') return stored;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // ignore storage errors
    }
    return 'light';
  });

  const [activeNavId, setActiveNavId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honey, setHoney] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>({
    show: false,
    type: 'success',
    title: '',
    desc: '',
  });
  const [imgError, setImgError] = useState(false);

  const statusBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      try {
        const userPref = localStorage.getItem('theme');
        if (!userPref) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      } catch {
        // ignore
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const sectionMap = [
      { id: 'experience', navId: 'nav-link-experience' },
      { id: 'skills', navId: 'nav-link-skills' },
      { id: 'certs', navId: 'nav-link-certs' },
      { id: 'education', navId: 'nav-link-education' },
      { id: 'contact', navId: 'nav-link-contact' },
    ];

    const onScrollSpy = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const topbar = document.getElementById('topbar');
      const topbarHeight = topbar ? topbar.offsetHeight : 60;
      const offsetThreshold = topbarHeight + 40;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollY < 160) {
        setActiveNavId(null);
        return;
      }

      if (scrollY + windowHeight >= documentHeight - 60) {
        setActiveNavId('nav-link-contact');
        return;
      }

      let foundNavId: string | null = null;

      for (let i = 0; i < sectionMap.length; i++) {
        const sec = document.getElementById(sectionMap[i].id);
        if (sec) {
          const secTop = sec.offsetTop - offsetThreshold;
          const secHeight = sec.offsetHeight;
          if (scrollY >= secTop && scrollY < secTop + secHeight) {
            foundNavId = sectionMap[i].navId;
            break;
          }
        }
      }

      if (!foundNavId) {
        for (let j = sectionMap.length - 1; j >= 0; j--) {
          const el = document.getElementById(sectionMap[j].id);
          if (el && scrollY >= el.offsetTop - offsetThreshold - 20) {
            foundNavId = sectionMap[j].navId;
            break;
          }
        }
      }

      setActiveNavId(foundNavId);
    };

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          onScrollSpy();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', onScrollSpy, { passive: true });
    onScrollSpy();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', onScrollSpy);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setFormStatus({
        show: true,
        type: 'error',
        title: 'Incomplete Form',
        desc: 'Please fill out your name, email, and message before sending.',
      });
      statusBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    setIsLoading(true);
    setFormStatus((prev) => ({ ...prev, show: false }));

    const formData = new FormData();
    formData.append('_subject', 'New Portfolio Contact Inquiry from impradeepkumargupta.github.io');
    formData.append('_captcha', 'false');
    formData.append('_template', 'table');
    formData.append('_honey', honey);
    formData.append('name', trimmedName);
    formData.append('email', trimmedEmail);
    formData.append('message', trimmedMessage);

    try {
      const response = await fetch('https://formsubmit.co/ajax/impradeepkumargupta@gmail.com', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Server returned error');
      }

      await response.json();
      setIsLoading(false);
      setFormStatus({
        show: true,
        type: 'success',
        title: 'Message Dispatched!',
        desc: `Thank you, ${trimmedName}. Your message has been sent directly to impradeepkumargupta@gmail.com. I will reply to you as soon as possible.`,
      });
      setName('');
      setEmail('');
      setMessage('');
      statusBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch {
      setIsLoading(false);
      setFormStatus({
        show: true,
        type: 'error',
        title: 'Submission Failed',
        desc: 'Could not deliver automatically via network. Please email me directly at impradeepkumargupta@gmail.com or reach out via LinkedIn.',
      });
      statusBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const isDark = theme === 'dark';

  return (
    <>
      <header className="topbar" id="topbar">
        <div className="topbar-inner" id="topbar-inner">
          <a href="#" className="brand" id="brand-header" onClick={() => setMobileMenuOpen(false)}>
            <span className="avatar" id="brand-avatar">PG</span>
            <span className="brand-text">Pradeep Kumar Gupta</span>
          </a>
          <nav className="tabs" id="nav-tabs">
            <a
              href="#experience"
              id="nav-link-experience"
              className={activeNavId === 'nav-link-experience' ? 'active' : ''}
            >
              Experience
            </a>
            <a
              href="#skills"
              id="nav-link-skills"
              className={activeNavId === 'nav-link-skills' ? 'active' : ''}
            >
              Skills
            </a>
            <a
              href="#certs"
              id="nav-link-certs"
              className={activeNavId === 'nav-link-certs' ? 'active' : ''}
            >
              Certifications
            </a>
            <a
              href="#education"
              id="nav-link-education"
              className={activeNavId === 'nav-link-education' ? 'active' : ''}
            >
              Education
            </a>
            <a
              href="#contact"
              id="nav-link-contact"
              className={activeNavId === 'nav-link-contact' ? 'active' : ''}
            >
              Contact
            </a>
          </nav>
          <div className="topbar-actions" id="topbar-actions">
            <button
              id="theme-toggle-btn"
              className="theme-toggle-btn"
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <svg
                className="sun-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              <svg
                className="moon-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </button>
            <a
              className="btn primary"
              id="resume-nav-btn"
              href="Pradeep_Kumar_Gupta_Resume.pdf"
              download="Pradeep_Kumar_Gupta_Resume.pdf"
            >
              Resume
            </a>
            <button
              id="mobile-menu-btn"
              className="mobile-menu-btn"
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>
        <nav
          id="mobile-nav-drawer"
          className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}
          aria-label="Mobile Navigation"
        >
          <a
            href="#experience"
            className={activeNavId === 'nav-link-experience' ? 'active' : ''}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>Experience</span>
            <span>→</span>
          </a>
          <a
            href="#skills"
            className={activeNavId === 'nav-link-skills' ? 'active' : ''}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>Skills</span>
            <span>→</span>
          </a>
          <a
            href="#certs"
            className={activeNavId === 'nav-link-certs' ? 'active' : ''}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>Certifications</span>
            <span>→</span>
          </a>
          <a
            href="#education"
            className={activeNavId === 'nav-link-education' ? 'active' : ''}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>Education</span>
            <span>→</span>
          </a>
          <a
            href="#availability"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>Availability</span>
            <span>→</span>
          </a>
          <a
            href="#contact"
            className={activeNavId === 'nav-link-contact' ? 'active' : ''}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>Contact</span>
            <span>→</span>
          </a>
        </nav>
      </header>

      <main className="wrap">
        {/* HERO */}
        <section className="hero" style={{ borderTop: 'none' }}>
          <div className="hero-grid">
            <div>
              <div className="eyebrow">Cloud DevOps and Platform Engineer</div>
              <h1>Pradeep Kumar Gupta</h1>
              <p className="summary">
                4+ years running production-grade Kubernetes on GKE for a platform serving around
                1,000 customer nodes across 25+ projects. I build the infrastructure layer — cloud,
                containers, CI/CD, and work with development and application teams. Google Cloud
                Certified Professional Cloud Architect.
              </p>
              <div className="cta-row">
                <a
                  className="btn primary"
                  href="Pradeep_Kumar_Gupta_Resume.pdf"
                  download="Pradeep_Kumar_Gupta_Resume.pdf"
                >
                  Download resume
                </a>
                <a
                  className="btn"
                  href="https://github.com/impradeepkumargupta"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <a
                  className="btn"
                  href="https://linkedin.com/in/impradeepkumargupta"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            <div className="photo-frame">
              {!imgError ? (
                <img
                  src={PROFILE_PHOTO_BASE64}
                  alt="Pradeep Kumar Gupta"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--blue-tint)',
                    color: 'var(--blue)',
                    fontSize: '48px',
                    fontWeight: 700,
                  }}
                >
                  PG
                </div>
              )}
            </div>
          </div>
        </section>

        {/* EXPERIENCE */}
        <section id="experience">
          <div className="sec-head">
            <div className="sec-label">Career &amp; Growth</div>
            <h2>Experience</h2>
          </div>

          <div className="job" id="job-ericsson">
            <div className="job-top">
              <div>
                <div className="job-title">DevOps &amp; Cloud Engineer</div>
                <div className="job-co">
                  <a
                    href="https://www.ericsson.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ericsson
                  </a>{' '}
                  — Gurugram, India · 4+ years experience
                </div>
              </div>
              <div className="job-time">Feb 2023 — Present</div>
            </div>
            <ul>
              <li>
                Designed, implemented, and maintained cloud automation across production-grade
                Kubernetes clusters on GKE, supporting 100+ microservices and 1,000+ customer nodes
                across development, staging, and production environments.
              </li>
              <li>
                Deployed and supported containerized applications with Kubernetes (GKE) and Docker
                across 100+ services in collaboration with development and architecture teams.
              </li>
              <li>
                Developed and managed CI/CD pipelines using GCP DevOps (Cloud Build, Artifact
                Registry / Artifactory, Cloud Deploy) and GitHub Actions workflows to automate
                build, test, and deployment for Java and Python applications.
              </li>
              <li>
                Automated infrastructure provisioning and configuration management using Terraform
                and Ansible across networking, compute, Kubernetes, databases, and storage.
              </li>
              <li>
                Built centralized monitoring, alerting, and logging using ELK Stack (Elasticsearch,
                Logstash, Kibana), Grafana, and Zabbix for platform reliability and performance
                optimization.
              </li>
              <li>
                Administered Linux (RHEL) systems and networking — process/package management,
                filesystem, permissions, and distributed-system troubleshooting.
              </li>
              <li>
                Applied DevSecOps practices — security validation and deployment standardization —
                across CI/CD workflows.
              </li>
              <li>
                Reduced cloud infrastructure costs by ~30% through rightsizing, resource
                optimization, autoscaling, and monitoring-driven improvements.
              </li>
              <li>
                Contributed to migrating 250+ virtual machines from Kyndryl infrastructure to GCP
                with minimal downtime.
              </li>
            </ul>
            <div className="job-stack">
              <span className="chip">Google Cloud Platform (GCP)</span>
              <span className="chip">AWS</span>
              <span className="chip">Terraform</span>
              <span className="chip">Docker &amp; Kubernetes (GKE)</span>
              <span className="chip">Cloud Build · Artifactory · Cloud Deploy</span>
              <span className="chip">Git &amp; GitHub Actions</span>
              <span className="chip">ELK Stack (Elastic, Logstash, Kibana)</span>
              <span className="chip">Grafana</span>
              <span className="chip">Zabbix</span>
              <span className="chip">Python &amp; Bash</span>
              <span className="chip">Linux Systems Administration (RHEL)</span>
              <span className="chip">Networking</span>
            </div>
          </div>
        </section>

        {/* SKILLS & ARCHITECTURE */}
        <section id="skills">
          <div className="sec-head">
            <div className="sec-label">Tech Stack</div>
            <h2>Cloud &amp; Platform Engineering</h2>
            <p className="sec-desc">
              Infrastructure, automation and platform technologies I use to build, deploy and
              operate cloud-native systems.
            </p>
          </div>

          <div className="pipeline-grid">
            <div className="pstep">
              <div className="num">01</div>
              <h4>Linux &amp; Networking</h4>
              <p>RHEL systems administration, TCP/IP, DNS, HTTP, routing, filesystems and troubleshooting.</p>
            </div>
            <div className="pstep">
              <div className="num">02</div>
              <h4>Google Cloud &amp; AWS</h4>
              <p>GCP (Compute Engine, GKE, Cloud SQL, IAM, Storage), cloud networking and AWS.</p>
            </div>
            <div className="pstep">
              <div className="num">03</div>
              <h4>Docker &amp; Containers</h4>
              <p>Containerization, images, Artifact Registry / Artifactory, Compose and Docker Swarm.</p>
            </div>
            <div className="pstep">
              <div className="num">04</div>
              <h4>Kubernetes / GKE</h4>
              <p>Production workloads, deployments, services, autoscaling and cluster reliability.</p>
            </div>
            <div className="pstep">
              <div className="num">05</div>
              <h4>Terraform (IaC)</h4>
              <p>Infrastructure as Code, reusable modules and version-controlled cloud provisioning.</p>
            </div>
            <div className="pstep">
              <div className="num">06</div>
              <h4>CI/CD &amp; GCP DevOps</h4>
              <p>Cloud Build, Artifactory, Cloud Deploy, GitHub Actions, and GitOps delivery pipelines.</p>
            </div>
            <div className="pstep">
              <div className="num">07</div>
              <h4>Automation &amp; Observability</h4>
              <p>Python, Bash, ELK (Elastic, Logstash, Kibana), Grafana, Zabbix and incident analysis.</p>
            </div>
            <div className="pstep">
              <div className="num">08</div>
              <h4>Platform Engineering</h4>
              <p>Scalable, reliable and self-service cloud infrastructure for engineering teams.</p>
            </div>
          </div>

          <div className="sec-head" style={{ marginTop: '48px' }}>
            <div className="sec-label">Technical Domains</div>
            <h2>Core Proficiencies</h2>
          </div>
          <div className="skill-grid">
            <div className="skill-card">
              <h3>Cloud &amp; Platform</h3>
              <ul className="skill-list">
                <li>Google Cloud Platform (GCP) — GKE, Compute Engine, Cloud SQL, Cloud Storage</li>
                <li>Pub/Sub, BigQuery, Cloud Functions</li>
                <li>Cloud Monitoring, Cloud Logging, IAM</li>
                <li>
                  AWS <span className="note">(EC2, S3, IAM)</span>
                </li>
              </ul>
            </div>
            <div className="skill-card">
              <h3>Containers &amp; Orchestration</h3>
              <ul className="skill-list">
                <li>Kubernetes (GKE Standard &amp; Autopilot)</li>
                <li>Docker, Docker Swarm, Docker Compose</li>
                <li>Helm Charts &amp; Release Packaging</li>
                <li>Containerd &amp; Ingress-NGINX Controllers</li>
              </ul>
            </div>
            <div className="skill-card">
              <h3>IaC &amp; Automation</h3>
              <ul className="skill-list">
                <li>Terraform (Modules &amp; Remote State)</li>
                <li>Ansible Configuration Management</li>
                <li>GitOps Architecture &amp; Workflows</li>
                <li>Python, Bash / Shell Scripting</li>
              </ul>
            </div>
            <div className="skill-card">
              <h3>CI / CD &amp; GCP DevOps</h3>
              <ul className="skill-list">
                <li>GCP DevOps — Cloud Build, Artifactory &amp; Cloud Deploy</li>
                <li>GitHub Actions &amp; Workflow Automation</li>
                <li>Git &amp; Trunk-Based Collaboration</li>
                <li>ArgoCD &amp; Automated Build, Test &amp; Deployment Pipelines</li>
              </ul>
            </div>
            <div className="skill-card">
              <h3>Observability &amp; Monitoring</h3>
              <ul className="skill-list">
                <li>ELK Stack (Elasticsearch / Elastic, Logstash, Kibana)</li>
                <li>Grafana Dashboards &amp; Alerting</li>
                <li>Zabbix Infrastructure Monitoring</li>
                <li>Google Cloud Operations Suite &amp; SLOs</li>
              </ul>
            </div>
            <div className="skill-card">
              <h3>Systems &amp; Security</h3>
              <ul className="skill-list">
                <li>Linux Systems Administration (RHEL / Ubuntu)</li>
                <li>Cloud Networking, VPC, DNS &amp; Load Balancing</li>
                <li>DevSecOps &amp; Least-Privilege IAM Policies</li>
                <li>MySQL &amp; PostgreSQL Operations</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CERTIFICATIONS */}
        <section id="certs">
          <div className="sec-head">
            <div className="sec-label">Credentials</div>
            <h2>Certifications &amp; Language Proficiency</h2>
          </div>
          <div className="cert-grid">
            <div className="cert">
              <div className="mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div>
                <h4>Google Cloud — Professional Cloud Architect</h4>
                <div className="issuer">Google · Issued Dec 2025 · Expires Dec 2027</div>
                <div className="link-row">
                  <a
                    href="https://www.credly.com/badges/7b92f87b-9654-437b-aee3-d9dad3865bf9"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Verify on Credly →
                  </a>
                </div>
              </div>
            </div>
            <div className="cert">
              <div className="mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div>
                <h4>Cloud Architecture: Design, Implement, and Manage</h4>
                <div className="issuer">Google Cloud Skill Badge · Issued Jul 2025</div>
                <div className="link-row">
                  <a
                    href="https://linkedin.com/in/impradeepkumargupta"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View credential on LinkedIn →
                  </a>
                </div>
              </div>
            </div>
            <div className="cert">
              <div className="mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div>
                <h4>Build Infrastructure with Terraform on Google Cloud</h4>
                <div className="issuer">Google Cloud Skill Badge · Issued Aug 2024</div>
                <div className="link-row">
                  <a
                    href="https://linkedin.com/in/impradeepkumargupta"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View credential on LinkedIn →
                  </a>
                </div>
              </div>
            </div>
            <div className="cert">
              <div className="mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div>
                <h4>Monitor and Log with Google Cloud Operations Suite</h4>
                <div className="issuer">Google Cloud Skill Badge · Issued Oct 2025</div>
                <div className="link-row">
                  <a
                    href="https://linkedin.com/in/impradeepkumargupta"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View credential on LinkedIn →
                  </a>
                </div>
              </div>
            </div>
            <div className="cert">
              <div className="mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div>
                <h4>LFS169: Introduction to GitOps</h4>
                <div className="issuer">The Linux Foundation · Issued May 2025</div>
                <div className="link-row">
                  <a
                    href="https://linkedin.com/in/impradeepkumargupta"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View credential on LinkedIn →
                  </a>
                </div>
              </div>
            </div>
            <div className="cert">
              <div className="mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div>
                <h4>BCSS Automation Fundamental Level</h4>
                <div className="issuer">Ericsson · Issued Sep 2024</div>
                <div className="link-row">
                  <a
                    href="https://linkedin.com/in/impradeepkumargupta"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View credential on LinkedIn →
                  </a>
                </div>
              </div>
            </div>
            <div className="cert">
              <div className="mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div>
                <h4>IELTS Academic — Overall Score: 7.0 (C1)</h4>
                <div className="issuer">IDP Education · Issued Sept 30, 2025</div>
              </div>
            </div>
          </div>
        </section>

        {/* EDUCATION */}
        <section id="education">
          <div className="sec-head">
            <div className="sec-label">Background</div>
            <h2>Education</h2>
          </div>
          <div className="two-col">
            <div className="edu-item">
              <h4>Bachelor of Technology (B.Tech) in Computer Science and Engineering</h4>
              <div className="school">
                <a
                  href="https://vit.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vellore Institute of Technology (VIT), Vellore, Tamil Nadu, India ↗
                </a>
              </div>
              <div className="meta">
                <span>
                  <strong>Duration:</strong> 2019 — 2023
                </span>
                <span>·</span>
                <span>
                  <strong>CGPA:</strong> 7.92 / 10
                </span>
              </div>
              <div className="meta">
                <span>
                  <strong>Scholarship:</strong> COMPEX Fully Funded Scholarship by EdCIL (Embassy of
                  India)
                </span>
              </div>
              <div className="meta">
                <span>
                  Cloud Computing · Distributed Systems · Operating Systems · Computer Networks ·
                  Databases · Algorithms
                </span>
              </div>
            </div>
            <div className="edu-item">
              <h4>Higher Secondary (+2, Science)</h4>
              <div className="school">
                <a
                  href="https://tilottama.edu.np"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tilottama Higher Secondary School, Butwal, Nepal ↗
                </a>
              </div>
              <div className="meta">
                <span>
                  <strong>Duration:</strong> 2017 — 2019
                </span>
                <span>·</span>
                <span>
                  <strong>CGPA:</strong> 3.61 / 4.00
                </span>
              </div>
              <div className="meta">
                <span>Physics · Chemistry · Mathematics · English</span>
              </div>
            </div>
          </div>
        </section>

        {/* ACHIEVEMENTS */}
        <section id="achievements">
          <div className="sec-head">
            <div className="sec-label">Track Record</div>
            <h2>Key Achievements</h2>
          </div>
          <ul className="ach-list">
            <li>
              <strong>Production Infrastructure at Scale:</strong> Supported and operated enterprise
              cloud infrastructure serving 1,000+ customer nodes, orchestrating 100+ containerized
              microservices across Kubernetes (GKE) and Docker cluster environments.
            </li>
            <li>
              <strong>Cloud Migration &amp; Cost Optimization:</strong> Contributed to migrating
              250+ virtual machines from legacy infrastructure to GCP with minimal downtime,
              achieving ~30% in infrastructure savings through autoscaling and resource
              optimization.
            </li>
            <li>
              <strong>Certified Cloud Architect:</strong> Google Cloud Certified Professional Cloud
              Architect (
              <a
                href="https://www.credly.com/badges/7b92f87b-9654-437b-aee3-d9dad3865bf9"
                target="_blank"
                rel="noopener noreferrer"
              >
                Verify Badge ↗
              </a>
              ), demonstrating architectural mastery in scalable, resilient, and secure enterprise
              GCP environments.
            </li>
            <li>
              <strong>COMPEX Merit Scholarship:</strong> Awarded a competitive, fully funded
              undergraduate engineering scholarship by EdCIL India and the Embassy of India
              (Ministry of External Affairs) for outstanding academic merit.
            </li>
          </ul>
        </section>

        {/* AVAILABILITY */}
        <section id="availability" className="availability-section">
          <div className="availability-card">
            <div className="availability-main">
              <div className="availability-badge">
                <span className="status-dot"></span>
                Open to opportunities &amp; Master’s programs
              </div>

              <h2>
                Ready to build reliable <span>cloud platforms</span> anywhere.
              </h2>

              <p className="availability-description">
                Open to sponsorship, relocation, and remote opportunities across Cloud Engineering,
                DevOps, Platform Engineering, and SRE — as well as Master’s in Computer Science /
                Information Technology programs.
              </p>

              <div className="availability-actions">
                <a href="#contact" className="availability-btn primary">
                  Let&apos;s connect
                  <span>↗</span>
                </a>

                <a href="#experience" className="availability-btn secondary">
                  View experience
                </a>
              </div>
            </div>

            <div className="availability-details">
              <div className="detail-item">
                <div className="detail-icon">4+</div>
                <div>
                  <strong>4+ years (Feb 2023 – Present)</strong>
                  <span>Production Cloud &amp; Kubernetes at Ericsson</span>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">GCP</div>
                <div>
                  <strong>Google Cloud Certified</strong>
                  <span>
                    <a
                      href="https://www.credly.com/badges/7b92f87b-9654-437b-aee3-d9dad3865bf9"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Professional Cloud Architect ↗
                    </a>
                  </span>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">EN</div>
                <div>
                  <strong>IELTS Overall 7.0 (Sept 30, 2025)</strong>
                  <span>C1 · Proficient English</span>
                </div>
              </div>

              <div className="locations">
                <span className="locations-label">Open to</span>

                <div className="location-list">
                  <span>United States</span>
                  <span>·</span>
                  <span>European Union</span>
                  <span>·</span>
                  <span>Australia</span>
                  <span>·</span>
                  <span>Remote Worldwide</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact">
          <div className="sec-head">
            <div className="sec-label">Get in Touch</div>
            <h2>Contact &amp; Verified Profiles</h2>
          </div>

          <div className="contact-layout">
            {/* Left side: Direct connections & quick details */}
            <div className="contact-info-col">
              <p>
                I am actively available for Platform Engineering, Cloud &amp; DevOps roles,
                Master’s in Computer Science / Information Technology admissions, and international
                sponsorship opportunities. All profile and credential links below are directly
                clickable and verifiable.
              </p>

              <div className="contact-grid">
                <a
                  className="contact-card"
                  href="mailto:impradeepkumargupta@gmail.com"
                  id="contact-card-email"
                >
                  <span className="label">Email</span>
                  <span className="val">impradeepkumargupta@gmail.com ↗</span>
                </a>
                <a
                  className="contact-card"
                  href="tel:+918604932809"
                  id="contact-card-phone"
                >
                  <span className="label">Mobile (India)</span>
                  <span className="val">+91 8604932809 ↗</span>
                </a>
                <a
                  className="contact-card"
                  href="https://linkedin.com/in/impradeepkumargupta"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="contact-card-linkedin"
                >
                  <span className="label">LinkedIn</span>
                  <span className="val">linkedin.com/in/impradeepkumargupta ↗</span>
                </a>
                <a
                  className="contact-card"
                  href="https://github.com/impradeepkumargupta"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="contact-card-github"
                >
                  <span className="label">GitHub</span>
                  <span className="val">github.com/impradeepkumargupta ↗</span>
                </a>
                <a
                  className="contact-card"
                  href="https://impradeepkumargupta.github.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="contact-card-portfolio"
                >
                  <span className="label">Portfolio</span>
                  <span className="val">impradeepkumargupta.github.io ↗</span>
                </a>
                <a
                  className="contact-card"
                  href="https://instagram.com/pradeepgupta____"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="contact-card-instagram"
                >
                  <span className="label">Instagram</span>
                  <span className="val">instagram.com/pradeepgupta____ ↗</span>
                </a>
              </div>

              <div className="response-badge">
                <span className="response-dot"></span>
                <span>Quick response time · Usually replies within hours</span>
              </div>
            </div>

            {/* Right side: Contact Form */}
            <div className="contact-form-card" id="contact-form-wrapper">
              <h3>Send a Message</h3>
              <p className="form-subtitle">
                Fill out the form below to send an inquiry directly to my inbox.
              </p>

              <div
                ref={statusBoxRef}
                id="form-status"
                className={`form-status ${formStatus.show ? `show ${formStatus.type}` : ''}`}
                role="alert"
              >
                {formStatus.type === 'success' ? (
                  <svg
                    className="status-icon-success"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg
                    className="status-icon-error"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                )}
                <div className="status-content">
                  <div className="status-title" style={{ fontWeight: 600 }}>
                    {formStatus.title}
                  </div>
                  <div className="status-desc" style={{ fontSize: '13px', marginTop: '2px' }}>
                    {formStatus.desc}
                  </div>
                </div>
              </div>

              <form
                id="portfolio-contact-form"
                action="https://formsubmit.co/ajax/impradeepkumargupta@gmail.com"
                method="POST"
                onSubmit={handleFormSubmit}
              >
                <input
                  type="text"
                  name="_honey"
                  value={honey}
                  onChange={(e) => setHoney(e.target.value)}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="form-group">
                  <label htmlFor="contact-name" className="form-label">
                    Your Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    className="form-control"
                    placeholder="e.g. Pradeep Gupta"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-email" className="form-label">
                    Email Address <span className="req">*</span>
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    className="form-control"
                    placeholder="impradeepkumargupta@gmail.com"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-message" className="form-label">
                    Message <span className="req">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    className="form-control"
                    rows={4}
                    placeholder="Hi Pradeep, I would like to discuss about an opportunity or project..."
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  id="contact-submit-btn"
                  className="btn primary submit-btn"
                  disabled={isLoading}
                >
                  {isLoading && <span className="spinner-icon" id="btn-spinner"></span>}
                  <span className="btn-text" id="btn-text">
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </span>
                  {!isLoading && (
                    <svg
                      id="btn-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

        <footer>
          <p>© 2026 Pradeep Kumar Gupta</p>
        </footer>
      </main>
    </>
  );
}
