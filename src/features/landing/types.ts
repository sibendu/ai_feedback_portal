export type LandingLink = {
  label: string;
  href: string;
};

export type LandingMetric = {
  label: string;
  value: string;
};

export type LandingHero = {
  eyebrow: string;
  title: string;
  body: string;
  primaryAction: LandingLink;
  secondaryAction: LandingLink;
};

export type LandingPanel = {
  label: string;
  value: string;
  metrics: LandingMetric[];
};

export type LandingContentBlock = {
  eyebrow?: string;
  title: string;
  body: string;
};

export type LandingFeature = LandingContentBlock & {
  metric?: string;
};

export type LandingWorkflowStep = LandingContentBlock & {
  step: string;
};

export type LandingInsight = LandingContentBlock & {
  value: string;
};

export type LandingCta = LandingContentBlock & {
  primaryAction: LandingLink;
  secondaryAction: LandingLink;
};

export type LandingFooter = {
  productName: string;
  tagline: string;
  groups: {
    title: string;
    links: LandingLink[];
  }[];
  legalLinks: LandingLink[];
};

export type LandingPageContent = {
  productName: string;
  navigation: LandingLink[];
  hero: LandingHero;
  panel: LandingPanel;
  valueProposition: {
    eyebrow: string;
    title: string;
    body: string;
    features: LandingFeature[];
  };
  workflow: {
    eyebrow: string;
    title: string;
    steps: LandingWorkflowStep[];
  };
  insights: {
    eyebrow: string;
    title: string;
    body: string;
    items: LandingInsight[];
  };
  cta: LandingCta;
  footer: LandingFooter;
};

export type LandingPageContentResponse = {
  data: LandingPageContent;
};
