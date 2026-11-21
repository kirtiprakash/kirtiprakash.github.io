---
layout: default
permalink: /publications/
title: publications
description: Publications by theme and year.
nav: true
nav_order: 1
---

<link rel="stylesheet" href="{{ '/assets/css/publication-metrics.css' | relative_url }}">

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
    <p class="publication-metrics-note">Live figures from <a href="https://www.altmetric.com/" target="_blank" rel="noopener noreferrer">Altmetric</a> and <a href="https://www.dimensions.ai/" target="_blank" rel="noopener noreferrer">Dimensions</a>. Select a badge for attention sources, available percentile rankings and citation details. A dash means no figure is reported, not zero. Publisher views and downloads are not consistently public; use HTML/PDF above for access.</p>
  </section>
</div>

<script>
  // External badges render asynchronously. Show a dash only until the
  // provider actually inserts a badge, not next to a real reported figure.
  document.querySelectorAll(".publication-metric").forEach(function (metric) {
    var badge = metric.querySelector(".altmetric-embed, .__dimensions_badge_embed__");
    if (!badge) return;
    var sync = function () {
      var rendered = badge.querySelector("a, img, iframe, svg") || badge.textContent.trim().length > 0;
      metric.classList.toggle("has-data", Boolean(rendered));
    };
    new MutationObserver(sync).observe(badge, { childList: true, subtree: true, characterData: true });
    badge.addEventListener("altmetric:show", function () { metric.classList.add("has-data"); });
    badge.addEventListener("altmetric:hide", function () { metric.classList.remove("has-data"); });
    sync();
  });
</script>
<script defer src="https://embed.altmetric.com/assets/embed.js"></script>
<script defer src="https://integration-badge.dimensions.ai/static/ai/badge.js"></script>
