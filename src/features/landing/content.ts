import type { LandingPageContent, LandingPageContentResponse } from "./types";

export const fallbackLandingContent: LandingPageContent = {
  productName: "Customer Feedback Portal",
  navigation: [
    { label: "Product", href: "#product" },
    { label: "Workflows", href: "#workflows" },
    { label: "Insights", href: "#insights" },
    { label: "Resources", href: "#resources" }
  ],
  hero: {
    eyebrow: "Feedback operations for growing teams",
    title: "Turn every customer signal into a clearer next move.",
    body:
      "Customer Feedback Portal is a SaaS foundation for collecting feedback, validating submissions, and giving review teams a focused place to understand what customers need next.",
    primaryAction: { label: "Start collecting feedback", href: "#demo" },
    secondaryAction: { label: "Explore the platform", href: "#product" }
  },
  panel: {
    label: "Live intake",
    value: "94%",
    metrics: [
      { label: "Validated responses", value: "1,248" },
      { label: "Review queue", value: "38" },
      { label: "New themes", value: "12" }
    ]
  },
  valueProposition: {
    eyebrow: "Why teams use it",
    title: "A calm system of record for every feedback channel.",
    body:
      "Use these placeholder sections to shape the future portal narrative: intake coverage, validation controls, review context, and action tracking can all be swapped for production copy later.",
    features: [
      {
        title: "Capture structured submissions",
        body:
          "Prepare forms and intake paths that preserve customer language while keeping required fields consistent.",
        metric: "Multi-channel ready"
      },
      {
        title: "Validate before review",
        body:
          "Flag incomplete, duplicate, or low-context feedback before it reaches the administrative queue.",
        metric: "Quality gates"
      },
      {
        title: "Prioritize what matters",
        body:
          "Group customer signals by theme, account impact, urgency, and follow-up ownership.",
        metric: "Theme scoring"
      }
    ]
  },
  workflow: {
    eyebrow: "Workflow highlights",
    title: "From raw feedback to reviewed insight in one guided path.",
    steps: [
      {
        step: "01",
        title: "Collect",
        body:
          "Receive product ideas, service notes, and support context through a clean customer-facing intake."
      },
      {
        step: "02",
        title: "Validate",
        body:
          "Normalize categories, check required context, and keep review teams focused on usable submissions."
      },
      {
        step: "03",
        title: "Review",
        body:
          "Give admins a future-ready workspace for triage, theme discovery, and response planning."
      }
    ]
  },
  insights: {
    eyebrow: "Insights and admin review",
    title: "Designed for the people who turn customer voice into operating rhythm.",
    body:
      "Placeholder dashboards show how this POC can evolve into actionable reporting for product, support, and customer success teams.",
    items: [
      {
        title: "Theme velocity",
        body: "Track fast-rising feedback categories before they become escalations.",
        value: "+18%"
      },
      {
        title: "Review health",
        body: "Understand queue age, owner coverage, and submissions awaiting validation.",
        value: "2.4 days"
      },
      {
        title: "Customer impact",
        body: "Connect themes to account segments and product areas for cleaner prioritization.",
        value: "7 segments"
      }
    ]
  },
  cta: {
    eyebrow: "Ready for the next slice",
    title: "Start with the landing page, then grow into intake and review workflows.",
    body:
      "This SaaS POC leaves room for final content, authentication, submission forms, persistence, and a full admin dashboard in later stories.",
    primaryAction: { label: "Map the intake flow", href: "#workflows" },
    secondaryAction: { label: "Review placeholders", href: "#insights" }
  },
  footer: {
    productName: "Customer Feedback Portal",
    tagline:
      "A placeholder-safe SaaS foundation for feedback intake, validation, and administrative review.",
    groups: [
      {
        title: "Product",
        links: [
          { label: "Platform", href: "#product" },
          { label: "Workflows", href: "#workflows" },
          { label: "Insights", href: "#insights" },
          { label: "Demo path", href: "#demo" }
        ]
      },
      {
        title: "Resources",
        links: [
          { label: "Implementation guide", href: "#resources" },
          { label: "Feedback templates", href: "#resources" },
          { label: "Release notes", href: "#resources" }
        ]
      },
      {
        title: "Company",
        links: [
          { label: "About the portal", href: "#resources" },
          { label: "Contact", href: "#demo" },
          { label: "Security overview", href: "#resources" }
        ]
      }
    ],
    legalLinks: [
      { label: "Privacy", href: "#resources" },
      { label: "Terms", href: "#resources" }
    ]
  }
};

export function getLandingContentResponse(): LandingPageContentResponse {
  return {
    data: fallbackLandingContent
  };
}
