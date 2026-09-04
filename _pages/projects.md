---
layout: default
title: research
permalink: /projects/
description: Research programmes connecting artificial intelligence, quantitative imaging, and genome biology.
nav: true
nav_order: 2
display_categories: [research]
horizontal: false
---

<style>
  .research-page {
    padding: 3.25rem 0 5rem;
  }

  .research-hero {
    padding: clamp(2rem, 5vw, 4.4rem);
    border: 1px solid rgba(223, 211, 194, 0.9);
    border-radius: 30px;
    background:
      linear-gradient(135deg, rgba(255, 253, 248, 0.98), rgba(255, 253, 248, 0.86)),
      var(--kp-surface, #fffdf8);
    box-shadow: var(--kp-shadow, 0 24px 70px rgba(16, 42, 67, 0.12));
  }

  html[data-theme="dark"] .research-hero {
    border-color: rgba(43, 66, 84, 0.95);
    background: linear-gradient(135deg, rgba(13, 32, 48, 0.98), rgba(13, 32, 48, 0.84));
  }

  .research-hero h1 {
    max-width: 780px;
    margin: 0;
    color: var(--kp-ink, #102a43);
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(3.2rem, 7.2vw, 6.4rem);
    font-weight: 430;
    letter-spacing: -0.065em;
    line-height: 0.95;
  }

  .research-hero .hero-intro {
    max-width: 820px;
  }

  .programme-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
  }

  .programme-card {
    display: flex;
    min-height: 235px;
    flex-direction: column;
    padding: 1.2rem;
    border: 1px solid var(--kp-line, #dfd3c2);
    border-radius: 18px;
    background: var(--kp-surface, #fffdf8);
    color: inherit !important;
    text-decoration: none !important;
    transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
  }

  .programme-card:hover {
    transform: translateY(-2px);
    border-color: rgba(22, 124, 128, 0.45);
    box-shadow: 0 18px 46px rgba(16, 42, 67, 0.1);
  }

  .programme-card span {
    display: block;
    margin-bottom: 0.55rem;
    color: var(--kp-accent, #167c80);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  .programme-card h3 {
    margin: 0 0 0.65rem;
    color: var(--kp-ink, #102a43);
    font-size: 1.18rem;
    font-weight: 560;
    letter-spacing: -0.025em;
    line-height: 1.18;
  }

  .programme-card p {
    margin: 0;
    color: var(--kp-ink-soft, #526877);
    font-size: 0.96rem;
    line-height: 1.58;
  }

  .research-methods {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: clamp(1.2rem, 4vw, 2.2rem);
  }

  .method-panel {
    padding: 1.2rem;
    border: 1px solid var(--kp-line, #dfd3c2);
    border-radius: 18px;
    background: var(--kp-surface, #fffdf8);
  }

  .method-panel h3 {
    margin: 0 0 0.75rem;
    color: var(--kp-ink, #102a43);
    font-size: 1.12rem;
  }

  .method-panel p {
    margin: 0;
    color: var(--kp-ink-soft, #526877);
  }

  .project-list-section .projects {
    margin-top: 1.2rem;
  }

  .project-list-section .card {
    border: 1px solid var(--kp-line, #dfd3c2) !important;
    border-radius: 18px !important;
    background: var(--kp-surface, #fffdf8) !important;
    box-shadow: 0 10px 26px rgba(16, 42, 67, 0.055) !important;
    transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
  }

  .project-list-section .card:hover {
    transform: translateY(-2px);
    border-color: rgba(22, 124, 128, 0.45) !important;
    box-shadow: 0 18px 46px rgba(16, 42, 67, 0.1) !important;
  }

  html[data-theme="dark"] .programme-card,
  html[data-theme="dark"] .method-panel,
  html[data-theme="dark"] .project-list-section .card {
    border-color: rgba(43, 66, 84, 0.95) !important;
    background: rgba(13, 32, 48, 0.88) !important;
  }

  @media (max-width: 980px) {
    .programme-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .research-methods {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .research-page {
      padding-top: 2rem;
    }

    .programme-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

<div class="research-page">
  <section class="research-hero" aria-labelledby="research-title">
    <p class="hero-eyebrow">Research programmes</p>
    <h1 id="research-title">Research</h1>
    <p class="hero-role">AI for Science & Society</p>
    <p class="hero-intro">
      My research connects artificial intelligence, mathematical modelling, quantitative microscopy,
      biomedical image analysis and genome biology to make complex scientific data interpretable.
    </p>

    <div class="hero-actions">
      <a class="button button-primary" href="{{ '/publications/' | relative_url }}">Publications <span aria-hidden="true">→</span></a>
      <a class="button button-secondary" href="{{ '/teaching/' | relative_url }}">Teaching <span aria-hidden="true">→</span></a>
      <a class="button button-secondary" href="{{ '/assets/pdf/kirti_prakash_cv.pdf' | relative_url }}">Download CV <span aria-hidden="true">↓</span></a>
    </div>
  </section>

  <section class="profile-section" aria-labelledby="programme-heading">
    <div class="section-header">
      <p class="section-kicker">Core themes</p>
      <h2 id="programme-heading">Four connected directions.</h2>
    </div>

    <div class="programme-grid">
      <a class="programme-card" href="#nanoscale-bioimaging">
        <span>01</span>
        <h3>Nanoscale Bioimaging</h3>
        <p>Super-resolution microscopy for visualising cellular architecture, structural biomarkers, cancer biology and neurodegeneration.</p>
      </a>
      <a class="programme-card" href="#ai-modelling">
        <span>02</span>
        <h3>AI-Driven Mathematical Modelling</h3>
        <p>Interpretable AI, causal inference and mathematical models for biological, biomedical and regulatory systems.</p>
      </a>
      <a class="programme-card" href="#agency-education">
        <span>03</span>
        <h3>Agency & Education Systems</h3>
        <p>Human agency, free will, university rankings and mathematics education improvement.</p>
      </a>
      <a class="programme-card" href="#chromatin-architecture">
        <span>04</span>
        <h3>DNA & Chromatin Architecture</h3>
        <p>Genome folding, epigenetics, chromatin structure, ageing, cancer and neurodegenerative disease.</p>
      </a>
    </div>
  </section>

  <section class="profile-section" aria-labelledby="approach-heading">
    <div class="section-header">
      <p class="section-kicker">Approach</p>
      <h2 id="approach-heading">From pixels and molecules to models and decisions.</h2>
    </div>

    <div class="research-methods">
      <div class="method-panel" id="nanoscale-bioimaging">
        <h3>Quantitative imaging</h3>
        <p>
          Developing and applying advanced microscopy, image analysis and spatial measurement methods
          to study biological organisation below conventional resolution limits.
        </p>
      </div>
      <div class="method-panel" id="ai-modelling">
        <h3>AI and modelling</h3>
        <p>
          Building interpretable computational models for high-dimensional biological and biomedical data,
          including imaging, digital pathology, spatial transcriptomics and medicine-safety questions.
        </p>
      </div>
      <div class="method-panel" id="chromatin-architecture">
        <h3>Genome structure</h3>
        <p>
          Investigating how DNA folds, how chromatin is organised and how genome structure changes across
          development, ageing, cancer and neurodegeneration.
        </p>
      </div>
      <div class="method-panel" id="agency-education">
        <h3>Science and society</h3>
        <p>
          Exploring human agency, education systems, ranking incentives and mathematical culture as systems
          that can be analysed, improved and made more humane.
        </p>
      </div>
    </div>
  </section>

  <section class="profile-section project-list-section" aria-labelledby="project-list-heading">
    <div class="section-header">
      <p class="section-kicker">Projects</p>
      <h2 id="project-list-heading">Current and selected research projects</h2>
    </div>

    <div class="projects">
    {% if site.enable_project_categories and page.display_categories %}
      {% for category in page.display_categories %}
      <a id="{{ category }}" href=".#{{ category }}">
        <h2 class="category">{{ category }}</h2>
      </a>
      {% assign categorized_projects = site.projects | where: "category", category %}
      {% assign sorted_projects = categorized_projects | sort: "importance" %}
      {% if page.horizontal %}
      <div class="container">
        <div class="row row-cols-1 row-cols-md-2">
        {% for project in sorted_projects %}
          {% include projects_horizontal.liquid %}
        {% endfor %}
        </div>
      </div>
      {% else %}
      <div class="row row-cols-1 row-cols-md-3">
        {% for project in sorted_projects %}
          {% include projects.liquid %}
        {% endfor %}
      </div>
      {% endif %}
      {% endfor %}

    {% else %}

    {% assign sorted_projects = site.projects | sort: "importance" %}

    {% if page.horizontal %}
      <div class="container">
        <div class="row row-cols-1 row-cols-md-2">
        {% for project in sorted_projects %}
          {% include projects_horizontal.liquid %}
        {% endfor %}
        </div>
      </div>
      {% else %}
      <div class="row row-cols-1 row-cols-md-3">
        {% for project in sorted_projects %}
          {% include projects.liquid %}
        {% endfor %}
      </div>
      {% endif %}
    {% endif %}
    </div>
  </section>
</div>
