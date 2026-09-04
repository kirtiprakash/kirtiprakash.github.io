---
layout: default
permalink: /publications/
title: publications
description: Publications by theme and year.
nav: true
nav_order: 1
---

<style>
  .publications-page {
    padding: 3.25rem 0 5rem;
  }

  .publications-hero {
    padding: clamp(2rem, 5vw, 4.4rem);
    border: 1px solid rgba(223, 211, 194, 0.9);
    border-radius: 30px;
    background:
      linear-gradient(135deg, rgba(255, 253, 248, 0.98), rgba(255, 253, 248, 0.86)),
      var(--kp-surface, #fffdf8);
    box-shadow: var(--kp-shadow, 0 24px 70px rgba(16, 42, 67, 0.12));
  }

  html[data-theme="dark"] .publications-hero {
    border-color: rgba(43, 66, 84, 0.95);
    background: linear-gradient(135deg, rgba(13, 32, 48, 0.98), rgba(13, 32, 48, 0.84));
  }

  .publications-hero h1 {
    max-width: 760px;
    margin: 0;
    color: var(--kp-ink, #102a43);
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(3.2rem, 7.2vw, 6.4rem);
    font-weight: 430;
    letter-spacing: -0.065em;
    line-height: 0.95;
  }

  .publications-hero .hero-intro {
    max-width: 760px;
  }

  .publication-focus-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
    margin-top: 1.8rem;
  }

  .publication-focus-card {
    min-height: 150px;
    padding: 1.15rem;
    border: 1px solid var(--kp-line, #dfd3c2);
    border-radius: 18px;
    background: var(--kp-surface, #fffdf8);
  }

  .publication-focus-card span {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--kp-accent, #167c80);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  .publication-focus-card strong {
    display: block;
    margin-bottom: 0.45rem;
    color: var(--kp-ink, #102a43);
    font-size: 1.02rem;
    line-height: 1.2;
  }

  .publication-focus-card p {
    margin: 0;
    color: var(--kp-ink-soft, #526877);
    font-size: 0.94rem;
    line-height: 1.5;
  }

  .publication-search-wrap {
    margin-top: 1rem;
  }

  .publication-list-section .publications {
    margin-top: 1.2rem;
  }

  .publication-list-section .bibliography {
    margin-bottom: 0;
  }

  .publication-list-section ol.bibliography li {
    margin-bottom: 1.2rem !important;
    padding: 1.15rem 1.2rem !important;
    border: 1px solid var(--kp-line, #dfd3c2) !important;
    border-radius: 18px !important;
    background: var(--kp-surface, #fffdf8) !important;
    box-shadow: 0 10px 26px rgba(16, 42, 67, 0.055) !important;
  }

  html[data-theme="dark"] .publication-list-section ol.bibliography li {
    border-color: rgba(43, 66, 84, 0.95) !important;
    background: rgba(13, 32, 48, 0.88) !important;
  }

  .publication-list-section .title {
    color: var(--kp-ink, #102a43) !important;
    font-weight: 700;
  }

  .publication-list-section .author,
  .publication-list-section .periodical {
    color: var(--kp-ink-soft, #526877) !important;
  }

  @media (max-width: 980px) {
    .publication-focus-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .publications-page {
      padding-top: 2rem;
    }

    .publication-focus-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

<div class="publications-page">
  <section class="publications-hero" aria-labelledby="publications-title">
    <p class="hero-eyebrow">Research outputs</p>
    <h1 id="publications-title">Publications</h1>
    <p class="hero-role">AI for Science & Society</p>
    <p class="hero-intro">
      Selected papers and scholarly outputs across artificial intelligence, quantitative microscopy,
      computational imaging, super-resolution methods, genome biology and chromatin architecture.
    </p>

    <div class="hero-actions">
      <a class="button button-primary" href="https://scholar.google.de/citations?user=rHTbFIoAAAAJ&hl=en">Google Scholar <span aria-hidden="true">→</span></a>
      <a class="button button-secondary" href="{{ '/projects/' | relative_url }}">Research themes <span aria-hidden="true">→</span></a>
      <a class="button button-secondary" href="{{ '/assets/pdf/kirti_prakash_cv.pdf' | relative_url }}">Download CV <span aria-hidden="true">↓</span></a>
    </div>
  </section>

  <section class="profile-section" aria-labelledby="publication-focus-heading">
    <div class="section-header">
      <p class="section-kicker">Publication themes</p>
      <h2 id="publication-focus-heading">Work spanning methods, models and biological structure.</h2>
    </div>

    <div class="publication-focus-grid">
      <div class="publication-focus-card">
        <span>01</span>
        <strong>Nanoscale bioimaging</strong>
        <p>Super-resolution microscopy, MINFLUX, localisation precision and quantitative structural biology.</p>
      </div>
      <div class="publication-focus-card">
        <span>02</span>
        <strong>Computational imaging</strong>
        <p>Machine learning, digital pathology, spatial transcriptomics and high-dimensional image analysis.</p>
      </div>
      <div class="publication-focus-card">
        <span>03</span>
        <strong>Genome architecture</strong>
        <p>DNA folding, chromatin organisation, epigenetics and spatial genome biology.</p>
      </div>
      <div class="publication-focus-card">
        <span>04</span>
        <strong>Open science</strong>
        <p>Microscopy standards, community resources, reviews and international collaborative outputs.</p>
      </div>
    </div>
  </section>

  <section class="profile-section publication-list-section" aria-labelledby="publication-list-heading">
    <div class="section-header">
      <p class="section-kicker">Bibliography</p>
      <h2 id="publication-list-heading">Publications by year</h2>
    </div>

    <div class="publication-search-wrap">
      {% include bib_search.liquid %}
    </div>

    <div class="publications">
      {% bibliography %}
    </div>
  </section>
</div>
