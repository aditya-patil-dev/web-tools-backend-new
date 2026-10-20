export type ToolPageFormData = {
  tool_slug: string;
  page_title: string;
  page_intro?: string | null;
  long_content?: string | null;
  features?: { title: string; description: string }[] | string | null;
  faqs?: { question: string; answer: string }[] | string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string[] | string | null;
  canonical_url?: string | null;
  noindex?: boolean;
  schema_markup?: Record<string, unknown> | null;
  status?: "draft" | "active" | "archived";
};
