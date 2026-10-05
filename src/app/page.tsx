import Link from "next/link";

import { fetchLandingPageContent } from "@/features/landing/client";

export default async function Home() {
  const content = await fetchLandingPageContent();

  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Customer Feedback Portal home">
          <span className="brand-mark" aria-hidden="true">
            CF
          </span>
          <span>{content.productName}</span>
        </Link>
        <nav className="top-nav" aria-label="Primary navigation">
          {content.navigation.map((item) => (
            <a href={item.href} key={`${item.label}-${item.href}`}>
              {item.label}
            </a>
          ))}
        </nav>
        <Link className="header-action" href="/sign-in">
          Sign in
        </Link>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">{content.hero.eyebrow}</p>
            <h1 id="hero-title">{content.hero.title}</h1>
            <p className="hero-text">
              {content.hero.body}
            </p>
            <div className="hero-actions">
              <Link className="primary-action" href="/sign-in">
                Create your account
              </Link>
              <a className="secondary-action" href={content.hero.secondaryAction.href}>
                {content.hero.secondaryAction.label}
              </a>
            </div>
          </div>
          <div className="hero-panel" aria-label="Feedback review preview">
            <div className="panel-header">
              <div>
                <span>{content.panel.label}</span>
                <p>Validated feedback moving through review</p>
              </div>
              <strong>{content.panel.value}</strong>
            </div>
            <div className="signal-list">
              {content.panel.metrics.map((metric) => (
                <div key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-band" id="product" aria-labelledby="product-title">
          <div className="section-heading">
            <p className="eyebrow">{content.valueProposition.eyebrow}</p>
            <h2 id="product-title">{content.valueProposition.title}</h2>
            <p>{content.valueProposition.body}</p>
          </div>
          <div className="feature-grid">
            {content.valueProposition.features.map((feature) => (
              <article className="feature-card" key={feature.title}>
                {feature.metric ? <span>{feature.metric}</span> : null}
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="workflow-section" id="workflows" aria-labelledby="workflow-title">
          <div className="section-heading compact">
            <p className="eyebrow">{content.workflow.eyebrow}</p>
            <h2 id="workflow-title">{content.workflow.title}</h2>
          </div>
          <div className="workflow-list">
            {content.workflow.steps.map((step) => (
              <article className="workflow-step" key={`${step.step}-${step.title}`}>
                <span>{step.step}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="insights-section" id="insights" aria-labelledby="insights-title">
          <div className="insights-copy">
            <p className="eyebrow">{content.insights.eyebrow}</p>
            <h2 id="insights-title">{content.insights.title}</h2>
            <p>{content.insights.body}</p>
          </div>
          <div className="insight-grid">
            {content.insights.items.map((item) => (
              <article className="insight-card" key={item.title}>
                <strong>{item.value}</strong>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-section" id="demo" aria-labelledby="cta-title">
          <p className="eyebrow">{content.cta.eyebrow}</p>
          <h2 id="cta-title">{content.cta.title}</h2>
          <p>{content.cta.body}</p>
          <div className="hero-actions">
            <a className="primary-action" href={content.cta.primaryAction.href}>
              {content.cta.primaryAction.label}
            </a>
            <a className="secondary-action on-dark" href={content.cta.secondaryAction.href}>
              {content.cta.secondaryAction.label}
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-primary">
          <div className="footer-brand">
            <Link className="brand footer-logo" href="/" aria-label="Customer Feedback Portal home">
              <span className="brand-mark" aria-hidden="true">
                CF
              </span>
              <span>{content.footer.productName}</span>
            </Link>
            <p>{content.footer.tagline}</p>
          </div>
          <nav className="footer-groups" aria-label="Footer navigation">
            {content.footer.groups.map((group) => (
              <div className="footer-group" key={group.title}>
                <h2>{group.title}</h2>
                <ul>
                  {group.links.map((item) => (
                    <li key={`${group.title}-${item.label}-${item.href}`}>
                      <a href={item.href}>{item.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="footer-secondary" id="resources">
          <span>POC content for planning and review.</span>
          <nav aria-label="Legal navigation">
            {content.footer.legalLinks.map((item) => (
              <a href={item.href} key={`${item.label}-${item.href}`}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}
