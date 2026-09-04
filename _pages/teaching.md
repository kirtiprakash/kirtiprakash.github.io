---
layout: default
permalink: /teaching/
title: teaching
description: Teaching, training, supervision, and public engagement across AI, data science, modelling, and quantitative imaging.
nav: true
nav_order: 3
---

<style>
  .teaching-page {
    padding: 3.25rem 0 5rem;
  }

  .teaching-hero {
    padding: clamp(2rem, 5vw, 4.4rem);
    border: 1px solid rgba(223, 211, 194, 0.9);
    border-radius: 30px;
    background:
      linear-gradient(135deg, rgba(255, 253, 248, 0.98), rgba(255, 253, 248, 0.86)),
      var(--kp-surface, #fffdf8);
    box-shadow: var(--kp-shadow, 0 24px 70px rgba(16, 42, 67, 0.12));
  }

  html[data-theme="dark"] .teaching-hero {
    border-color: rgba(43, 66, 84, 0.95);
    background: linear-gradient(135deg, rgba(13, 32, 48, 0.98), rgba(13, 32, 48, 0.84));
  }

  .teaching-hero h1 {
    max-width: 780px;
    margin: 0;
    color: var(--kp-ink, #102a43);
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(3.2rem, 7.2vw, 6.4rem);
    font-weight: 430;
    letter-spacing: -0.065em;
    line-height: 0.95;
  }

  .teaching-hero .hero-intro {
    max-width: 830px;
  }

  .teaching-grid,
  .training-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  .teaching-card,
  .training-card {
    padding: 1.2rem;
    border: 1px solid var(--kp-line, #dfd3c2);
    border-radius: 18px;
    background: var(--kp-surface, #fffdf8);
    transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
  }

  .teaching-card:hover,
  .training-card:hover {
    transform: translateY(-2px);
    border-color: rgba(22, 124, 128, 0.45);
    box-shadow: 0 18px 46px rgba(16, 42, 67, 0.1);
  }

  html[data-theme="dark"] .teaching-card,
  html[data-theme="dark"] .training-card {
    border-color: rgba(43, 66, 84, 0.95);
    background: rgba(13, 32, 48, 0.88);
  }

  .teaching-card span,
  .training-card span {
    display: block;
    margin-bottom: 0.55rem;
    color: var(--kp-accent, #167c80);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  .teaching-card h3,
  .training-card h3 {
    margin: 0 0 0.65rem;
    color: var(--kp-ink, #102a43);
    font-size: 1.16rem;
    font-weight: 560;
    letter-spacing: -0.025em;
    line-height: 1.18;
  }

  .teaching-card p,
  .training-card p {
    margin: 0;
    color: var(--kp-ink-soft, #526877);
    font-size: 0.96rem;
    line-height: 1.58;
  }

  .teaching-timeline {
    display: grid;
    gap: 0.9rem;
  }

  .timeline-item {
    display: grid;
    grid-template-columns: 8.5rem 1fr;
    gap: 1rem;
    padding: 1rem 1.1rem;
    border: 1px solid var(--kp-line, #dfd3c2);
    border-radius: 18px;
    background: var(--kp-surface, #fffdf8);
  }

  html[data-theme="dark"] .timeline-item {
    border-color: rgba(43, 66, 84, 0.95);
    background: rgba(13, 32, 48, 0.88);
  }

  .timeline-year {
    color: var(--kp-accent, #167c80);
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .timeline-item strong {
    display: block;
    margin-bottom: 0.25rem;
    color: var(--kp-ink, #102a43);
  }

  .timeline-item p {
    margin: 0;
    color: var(--kp-ink-soft, #526877);
  }

  @media (max-width: 980px) {
    .teaching-grid,
    .training-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .teaching-page {
      padding-top: 2rem;
    }

    .teaching-grid,
    .training-grid {
      grid-template-columns: 1fr;
    }

    .timeline-item {
      grid-template-columns: 1fr;
      gap: 0.35rem;
    }
  }
</style>

<div class="teaching-page">
  <section class="teaching-hero" aria-labelledby="teaching-title">
    <p class="hero-eyebrow">Teaching and training</p>
    <h1 id="teaching-title">Teaching</h1>
    <p class="hero-role">Example-driven learning across AI, data and scientific modelling.</p>
    <p class="hero-intro">
      My teaching connects programming, statistics, machine learning, mathematical modelling,
      semantic technologies and image analysis to real scientific and biomedical problems.
    </p>

    <div class="hero-actions">
      <a class="button button-primary" href="{{ '/projects/' | relative_url }}">Research <span aria-hidden="true">→</span></a>
      <a class="button button-secondary" href="{{ '/publications/' | relative_url }}">Publications <span aria-hidden="true">→</span></a>
      <a class="button button-secondary" href="{{ '/assets/pdf/kirti_prakash_cv.pdf' | relative_url }}">Download CV <span aria-hidden="true">↓</span></a>
    </div>
  </section>

  <section class="profile-section" aria-labelledby="teaching-areas-heading">
    <div class="section-header">
      <p class="section-kicker">Teaching areas</p>
      <h2 id="teaching-areas-heading">Core areas I teach and supervise.</h2>
    </div>

    <div class="teaching-grid">
      <div class="teaching-card">
        <span>01</span>
        <h3>Artificial Intelligence</h3>
        <p>Machine learning, deep learning, generative AI, trustworthy AI and applied AI for scientific and biomedical settings.</p>
      </div>
      <div class="teaching-card">
        <span>02</span>
        <h3>Programming and Data</h3>
        <p>Python, R and MATLAB for data analysis, scientific computing, modelling and reproducible research workflows.</p>
      </div>
      <div class="teaching-card">
        <span>03</span>
        <h3>Semantic Technologies</h3>
        <p>Knowledge representation, graph-based thinking, formal logic and structured data for modern AI systems.</p>
      </div>
      <div class="teaching-card">
        <span>04</span>
        <h3>Mathematical Modelling</h3>
        <p>Using probability, statistics, dynamical systems and causal reasoning to understand complex scientific systems.</p>
      </div>
      <div class="teaching-card">
        <span>05</span>
        <h3>Biomedical Imaging</h3>
        <p>Image analysis, digital pathology, microscopy, spatial biology and quantitative interpretation of high-dimensional images.</p>
      </div>
      <div class="teaching-card">
        <span>06</span>
        <h3>Research Supervision</h3>
        <p>Supervision across AI, microscopy, digital pathology, genome biology and interdisciplinary biomedical data science.</p>
      </div>
    </div>
  </section>

  <section class="profile-section" aria-labelledby="teaching-philosophy-heading">
    <div class="section-header">
      <p class="section-kicker">Teaching style</p>
      <h2 id="teaching-philosophy-heading">From first principles to real examples.</h2>
    </div>

    <div class="two-column-copy">
      <p>
        I use a top-down and example-driven approach: start with the problem, show why it matters,
        then introduce the computational and mathematical tools needed to solve it.
      </p>
      <p>
        In practical sessions, I emphasise small working examples, live coding, visual intuition,
        research papers and case studies that help students connect theory to scientific practice.
      </p>
    </div>
  </section>

  <section class="profile-section" aria-labelledby="selected-teaching-heading">
    <div class="section-header">
      <p class="section-kicker">Selected teaching</p>
      <h2 id="selected-teaching-heading">Lectures, workshops and courses.</h2>
    </div>

    <div class="teaching-timeline">
      <div class="timeline-item">
        <div class="timeline-year">2024</div>
        <div>
          <strong>ESRIC Summer School</strong>
          <p>Invited lecture and hands-on practical workshop.</p>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-year">2024</div>
        <div>
          <strong>Hands-on Super-resolution Workshop, University of Leicester</strong>
          <p>Invited lecturer for practical advanced microscopy training.</p>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-year">2023</div>
        <div>
          <strong>Transforming Health Services with AI, Coventry University London</strong>
          <p>Invited lecturer on artificial intelligence in health contexts.</p>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-year">2017</div>
        <div>
          <strong>Modelling of Biological Systems, Johannes Gutenberg University Mainz</strong>
          <p>Lecturer for computational and mathematical modelling in biology.</p>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-year">2015</div>
        <div>
          <strong>Advanced Seminar: Biophysics of Genome Structure</strong>
          <p>Lecturer on genome structure, chromatin architecture and biological physics.</p>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-year">2014-15</div>
        <div>
          <strong>Biomedical Optics and Medical Physics</strong>
          <p>Lecturer and teaching assistant in Mainz and Heidelberg.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="profile-section" aria-labelledby="mentoring-heading">
    <div class="section-header">
      <p class="section-kicker">Mentoring and leadership</p>
      <h2 id="mentoring-heading">Supporting students and early-career researchers.</h2>
    </div>

    <div class="training-grid">
      <div class="training-card">
        <span>Supervision</span>
        <h3>Research mentoring</h3>
        <p>I have supervised MSc, PhD, summer and undergraduate researchers in machine learning, microscopy, digital pathology and genome biology.</p>
      </div>
      <div class="training-card">
        <span>Leadership</span>
        <h3>AI/ML team development</h3>
        <p>At the Institute of Cancer Research, I led an AI/ML team developing digital pathology pipelines.</p>
      </div>
      <div class="training-card">
        <span>Training</span>
        <h3>Advanced microscopy</h3>
        <p>At TU Delft, I supported MSc and PhD researchers working across microscopy, modelling and quantitative imaging.</p>
      </div>
    </div>
  </section>

  <section class="profile-section" aria-labelledby="engagement-heading">
    <div class="section-header">
      <p class="section-kicker">Public engagement</p>
      <h2 id="engagement-heading">Making microscopy and AI accessible.</h2>
    </div>

    <p class="lead-text">
      Through the Microscopy Wonderland programme at the National Physical Laboratory, I delivered ten talks
      to 60 schools in five days, reaching approximately 4,500 pupils. I have also contributed to international
      summer schools, open-science initiatives and training for researchers adapting advanced microscopy in
      lower-resource settings.
    </p>
  </section>
</div>
