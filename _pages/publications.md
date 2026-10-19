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
      <p class="hero-role">Selected papers, reviews and scholarly outputs.</p>
      <p class="hero-intro">
        Publications across super-resolution microscopy, computational imaging, mathematical modelling,
        genome biology, chromatin architecture and AI-enabled biomedical science.
      </p>

      <div class="hero-actions">
        <a class="button button-primary" href="https://scholar.google.de/citations?user=rHTbFIoAAAAJ&hl=en">Google Scholar <span aria-hidden="true">→</span></a>
        <a class="button button-secondary" href="{{ '/projects/' | relative_url }}">Research <span aria-hidden="true">→</span></a>
        <a class="button button-secondary" href="{{ '/assets/pdf/kirti_prakash_cv.pdf' | relative_url }}">Download CV <span aria-hidden="true">↓</span></a>
      </div>
    </div>
  </section>

  <section class="profile-section publication-list-section" aria-labelledby="publication-list-heading">
    <div class="section-header">
      <p class="section-kicker">Bibliography</p>
      <h2 id="publication-list-heading">Publications</h2>
    </div>

    <div class="publication-search-wrap">
      {% include bib_search.liquid %}
    </div>

    <div class="publications clean-publications">
      {% bibliography %}
    </div>
  </section>
</div>
