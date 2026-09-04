---
layout: default
title: research
permalink: /projects/
description: Research programmes connecting artificial intelligence, quantitative imaging, and genome biology.
nav: false
nav_order: 2
published: false
display_categories: [research]
horizontal: false
---

<div class="home-page research-page">
  <section class="home-hero no-portrait" aria-labelledby="research-title">
    <div class="hero-copy">
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
    </div>
  </section>

  <section class="profile-section" aria-labelledby="programme-heading">
    <div class="section-header">
      <p class="section-kicker">Core themes</p>
      <h2 id="programme-heading">Four connected directions.</h2>
    </div>

    <div class="research-grid">
      <a class="research-card" href="#nanoscale-bioimaging">
        <span class="card-number">01</span>
        <h3>Nanoscale Bioimaging</h3>
        <p>Super-resolution microscopy for visualising cellular architecture, structural biomarkers, cancer biology and neurodegeneration.</p>
      </a>
      <a class="research-card" href="#ai-modelling">
        <span class="card-number">02</span>
        <h3>AI-Driven Mathematical Modelling</h3>
        <p>Interpretable AI, causal inference and mathematical models for biological, biomedical and regulatory systems.</p>
      </a>
      <a class="research-card" href="#agency-education">
        <span class="card-number">03</span>
        <h3>Agency & Education Systems</h3>
        <p>Human agency, free will, university rankings and mathematics education improvement.</p>
      </a>
      <a class="research-card" href="#chromatin-architecture">
        <span class="card-number">04</span>
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

    <div class="split-section research-methods">
      <div id="nanoscale-bioimaging">
        <h3>Quantitative imaging</h3>
        <p>
          Developing and applying advanced microscopy, image analysis and spatial measurement methods
          to study biological organisation below conventional resolution limits.
        </p>
      </div>
      <div id="ai-modelling">
        <h3>AI and modelling</h3>
        <p>
          Building interpretable computational models for high-dimensional biological and biomedical data,
          including imaging, digital pathology, spatial transcriptomics and medicine-safety questions.
        </p>
      </div>
      <div id="chromatin-architecture">
        <h3>Genome structure</h3>
        <p>
          Investigating how DNA folds, how chromatin is organised and how genome structure changes across
          development, ageing, cancer and neurodegeneration.
        </p>
      </div>
      <div id="agency-education">
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
