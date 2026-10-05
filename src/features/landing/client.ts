import { getLandingContentResponse, fallbackLandingContent } from "./content";
import type { LandingPageContent, LandingPageContentResponse } from "./types";

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function safeLink(
  candidate: Partial<LandingPageContent["hero"]["primaryAction"]> | undefined,
  fallback: LandingPageContent["hero"]["primaryAction"]
) {
  return {
    label: hasText(candidate?.label) ? candidate.label : fallback.label,
    href: hasText(candidate?.href) ? candidate.href : fallback.href
  };
}

function textOrFallback(value: unknown, fallback: string) {
  return hasText(value) ? value : fallback;
}

function normalizeFeatures(
  items: Partial<LandingPageContent["valueProposition"]["features"][number]>[] | undefined,
  fallback: LandingPageContent["valueProposition"]["features"]
) {
  return Array.isArray(items) && items.length > 0
    ? items
        .map((item, index) => {
          const fallbackItem = fallback[index] ?? fallback[0];

          return {
            eyebrow: textOrFallback(item.eyebrow, fallbackItem.eyebrow ?? ""),
            title: textOrFallback(item.title, fallbackItem.title),
            body: textOrFallback(item.body, fallbackItem.body),
            metric: textOrFallback(item.metric, fallbackItem.metric ?? "")
          };
        })
        .filter((item) => hasText(item.title) && hasText(item.body))
    : fallback;
}

function normalizeWorkflowSteps(
  items: Partial<LandingPageContent["workflow"]["steps"][number]>[] | undefined,
  fallback: LandingPageContent["workflow"]["steps"]
) {
  return Array.isArray(items) && items.length > 0
    ? items
        .map((item, index) => {
          const fallbackItem = fallback[index] ?? fallback[0];

          return {
            step: textOrFallback(item.step, fallbackItem.step),
            eyebrow: textOrFallback(item.eyebrow, fallbackItem.eyebrow ?? ""),
            title: textOrFallback(item.title, fallbackItem.title),
            body: textOrFallback(item.body, fallbackItem.body)
          };
        })
        .filter((item) => hasText(item.step) && hasText(item.title) && hasText(item.body))
    : fallback;
}

function normalizeInsights(
  items: Partial<LandingPageContent["insights"]["items"][number]>[] | undefined,
  fallback: LandingPageContent["insights"]["items"]
) {
  return Array.isArray(items) && items.length > 0
    ? items
        .map((item, index) => {
          const fallbackItem = fallback[index] ?? fallback[0];

          return {
            eyebrow: textOrFallback(item.eyebrow, fallbackItem.eyebrow ?? ""),
            title: textOrFallback(item.title, fallbackItem.title),
            body: textOrFallback(item.body, fallbackItem.body),
            value: textOrFallback(item.value, fallbackItem.value)
          };
        })
        .filter((item) => hasText(item.title) && hasText(item.body) && hasText(item.value))
    : fallback;
}

function normalizeFooterGroups(
  groups: Partial<LandingPageContent["footer"]["groups"][number]>[] | undefined,
  fallback: LandingPageContent["footer"]["groups"]
) {
  return Array.isArray(groups) && groups.length > 0
    ? groups
        .map((group, groupIndex) => {
          const fallbackGroup = fallback[groupIndex] ?? fallback[0];

          return {
            title: textOrFallback(group.title, fallbackGroup.title),
            links:
              Array.isArray(group.links) && group.links.length > 0
                ? group.links
                    .map((item, itemIndex) =>
                      safeLink(item, fallbackGroup.links[itemIndex] ?? fallbackGroup.links[0])
                    )
                    .filter((item) => hasText(item.label) && hasText(item.href))
                : fallbackGroup.links
          };
        })
        .filter((group) => hasText(group.title) && group.links.length > 0)
    : fallback;
}

function normalizeLandingContent(content: Partial<LandingPageContent>): LandingPageContent {
  return {
    productName: hasText(content.productName)
      ? content.productName
      : fallbackLandingContent.productName,
    navigation:
      Array.isArray(content.navigation) && content.navigation.length > 0
        ? content.navigation
            .map((item, index) => safeLink(item, fallbackLandingContent.navigation[index] ?? fallbackLandingContent.navigation[0]))
            .filter((item) => hasText(item.label) && hasText(item.href))
        : fallbackLandingContent.navigation,
    hero: {
      eyebrow: hasText(content.hero?.eyebrow)
        ? content.hero.eyebrow
        : fallbackLandingContent.hero.eyebrow,
      title: hasText(content.hero?.title)
        ? content.hero.title
        : fallbackLandingContent.hero.title,
      body: hasText(content.hero?.body) ? content.hero.body : fallbackLandingContent.hero.body,
      primaryAction: safeLink(content.hero?.primaryAction, fallbackLandingContent.hero.primaryAction),
      secondaryAction: safeLink(
        content.hero?.secondaryAction,
        fallbackLandingContent.hero.secondaryAction
      )
    },
    panel: {
      label: hasText(content.panel?.label)
        ? content.panel.label
        : fallbackLandingContent.panel.label,
      value: hasText(content.panel?.value)
        ? content.panel.value
        : fallbackLandingContent.panel.value,
      metrics:
        Array.isArray(content.panel?.metrics) && content.panel.metrics.length > 0
          ? content.panel.metrics
              .map((metric, index) => ({
                label: hasText(metric.label)
                  ? metric.label
                  : fallbackLandingContent.panel.metrics[index]?.label ?? "Feedback metric",
                value: hasText(metric.value)
                  ? metric.value
                  : fallbackLandingContent.panel.metrics[index]?.value ?? "0"
              }))
              .filter((metric) => hasText(metric.label) && hasText(metric.value))
          : fallbackLandingContent.panel.metrics
    },
    valueProposition: {
      eyebrow: hasText(content.valueProposition?.eyebrow)
        ? content.valueProposition.eyebrow
        : fallbackLandingContent.valueProposition.eyebrow,
      title: hasText(content.valueProposition?.title)
        ? content.valueProposition.title
        : fallbackLandingContent.valueProposition.title,
      body: hasText(content.valueProposition?.body)
        ? content.valueProposition.body
        : fallbackLandingContent.valueProposition.body,
      features: normalizeFeatures(
        content.valueProposition?.features,
        fallbackLandingContent.valueProposition.features
      )
    },
    workflow: {
      eyebrow: hasText(content.workflow?.eyebrow)
        ? content.workflow.eyebrow
        : fallbackLandingContent.workflow.eyebrow,
      title: hasText(content.workflow?.title)
        ? content.workflow.title
        : fallbackLandingContent.workflow.title,
      steps: normalizeWorkflowSteps(content.workflow?.steps, fallbackLandingContent.workflow.steps)
    },
    insights: {
      eyebrow: hasText(content.insights?.eyebrow)
        ? content.insights.eyebrow
        : fallbackLandingContent.insights.eyebrow,
      title: hasText(content.insights?.title)
        ? content.insights.title
        : fallbackLandingContent.insights.title,
      body: hasText(content.insights?.body)
        ? content.insights.body
        : fallbackLandingContent.insights.body,
      items: normalizeInsights(content.insights?.items, fallbackLandingContent.insights.items)
    },
    cta: {
      eyebrow: hasText(content.cta?.eyebrow)
        ? content.cta.eyebrow
        : fallbackLandingContent.cta.eyebrow,
      title: hasText(content.cta?.title) ? content.cta.title : fallbackLandingContent.cta.title,
      body: hasText(content.cta?.body) ? content.cta.body : fallbackLandingContent.cta.body,
      primaryAction: safeLink(content.cta?.primaryAction, fallbackLandingContent.cta.primaryAction),
      secondaryAction: safeLink(
        content.cta?.secondaryAction,
        fallbackLandingContent.cta.secondaryAction
      )
    },
    footer: {
      productName: hasText(content.footer?.productName)
        ? content.footer.productName
        : fallbackLandingContent.footer.productName,
      tagline: hasText(content.footer?.tagline)
        ? content.footer.tagline
        : fallbackLandingContent.footer.tagline,
      groups: normalizeFooterGroups(content.footer?.groups, fallbackLandingContent.footer.groups),
      legalLinks:
        Array.isArray(content.footer?.legalLinks) && content.footer.legalLinks.length > 0
          ? content.footer.legalLinks
              .map((item, index) =>
                safeLink(
                  item,
                  fallbackLandingContent.footer.legalLinks[index] ??
                    fallbackLandingContent.footer.legalLinks[0]
                )
              )
              .filter((item) => hasText(item.label) && hasText(item.href))
          : fallbackLandingContent.footer.legalLinks
    }
  };
}

function parseLandingResponse(response: LandingPageContentResponse): LandingPageContent {
  return normalizeLandingContent(response.data);
}

export async function fetchLandingPageContent(): Promise<LandingPageContent> {
  try {
    return parseLandingResponse(getLandingContentResponse());
  } catch {
    return fallbackLandingContent;
  }
}
