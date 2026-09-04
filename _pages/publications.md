---
layout: default
permalink: /publications/
title: publications
description: Publications by theme and year.
nav: true
nav_order: 1
---

<div class="home-page publications-page">
  <section class="home-hero no-portrait" aria-labelledby="publications-title">
    <div class="hero-copy">
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
    </div>
  </section>

  <section class="profile-section" aria-labelledby="publication-focus-heading">
    <div class="section-header">
      <p class="section-kicker">Publication themes</p>
      <h2 id="publication-focus-heading">Work spanning methods, models and biological structure.</h2>
    </div>

    <div class="research-grid">
      <div class="research-card">
        <span class="card-number">01</span>
        <h3>Nanoscale bioimaging</h3>
        <p>Super-resolution microscopy, MINFLUX, localisation precision and quantitative structural biology.</p>
      </div>
      <div class="research-card">
        <span class="card-number">02</span>
        <h3>Computational imaging</h3>
        <p>Machine learning, digital pathology, spatial transcriptomics and high-dimensional image analysis.</p>
      </div>
      <div class="research-card">
        <span class="card-number">03</span>
        <h3>Genome architecture</h3>
        <p>DNA folding, chromatin organisation, epigenetics and spatial genome biology.</p>
      </div>
      <div class="research-card">
        <span class="card-number">04</span>
        <h3>Open science</h3>
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
