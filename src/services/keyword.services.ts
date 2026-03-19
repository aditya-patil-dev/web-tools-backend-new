import HttpException from "../exceptions/HttpException";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const GOOGLE_SUGGEST_URL = "https://suggestqueries.google.com/complete/search";

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

const QUESTION_WORDS = [
  "who",
  "what",
  "when",
  "where",
  "why",
  "how",
  "can",
  "is",
  "are",
  "does",
  "will",
  "which",
  "should",
  "do",
  "was",
  "has",
];

const INTENT_PATTERNS = {
  informational: [
    "what",
    "how",
    "why",
    "when",
    "where",
    "who",
    "which",
    "guide",
    "tutorial",
    "learn",
    "meaning",
    "definition",
    "explain",
    "introduction",
    "overview",
    "examples",
    "tips",
  ],
  navigational: [
    "login",
    "sign in",
    "sign up",
    "download",
    "install",
    "official",
    "website",
    "app",
    "portal",
    "account",
  ],
  transactional: [
    "buy",
    "price",
    "cheap",
    "deal",
    "discount",
    "coupon",
    "order",
    "purchase",
    "shop",
    "cost",
    "free",
    "trial",
    "subscription",
    "offer",
    "get",
    "hire",
    "rent",
  ],
  commercial: [
    "best",
    "top",
    "review",
    "vs",
    "compare",
    "comparison",
    "alternative",
    "recommended",
    "rated",
    "ranking",
    "pros cons",
  ],
};

const GROUP_PATTERNS: Record<string, string[]> = {
  free: ["free", "no cost", "gratis", "open source"],
  online: ["online", "web", "browser", "cloud"],
  platform: ["mac", "windows", "linux", "android", "ios", "mobile", "desktop"],
  action: [
    "how to",
    "convert",
    "compress",
    "edit",
    "merge",
    "split",
    "create",
    "generate",
    "make",
  ],
  comparison: [
    "vs",
    "versus",
    "compare",
    "alternative",
    "difference",
    "better",
  ],
  download: ["download", "install", "setup", "apk", "exe"],
  beginner: ["for beginners", "easy", "simple", "basic", "step by step"],
  advanced: ["advanced", "professional", "pro", "enterprise", "expert"],
  price: ["price", "cost", "cheap", "free", "premium", "paid", "subscription"],
};

// ─────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────

interface KeywordFilters {
  min_word_count?: number;
  max_word_count?: number;
  min_char_length?: number;
  exclude_keywords?: string[];
}

interface ResearchOptions {
  query: string;
  language: string;
  region: string;
  depth: 1 | 2;
  include_questions: boolean;
  export_csv: boolean;
  filters: KeywordFilters;
}

interface KeywordItem {
  keyword: string;
  word_count: number;
  char_length: number;
  intent: string;
  group: string;
  source: "seed" | "depth_1" | "depth_2" | "question";
}

interface GroupedKeywords {
  [group: string]: KeywordItem[];
}

interface ResearchResult {
  query: string;
  language: string;
  region: string;
  total: number;
  keywords: KeywordItem[];
  grouped: GroupedKeywords;
  intent_summary: Record<string, number>;
  csv?: string;
}

// ─────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────

class KeywordService {
  // ── Public Entry Point ────────────────────────────────────

  public async doKeywordResearch(
    options: ResearchOptions,
  ): Promise<ResearchResult> {
    const {
      query,
      language,
      region,
      depth,
      include_questions,
      export_csv,
      filters,
    } = options;

    const allRaw: { keyword: string; source: KeywordItem["source"] }[] = [];

    // 1. Seed suggestions (depth 1)
    const seedSuggestions = await this.fetchSuggestions(
      query,
      language,
      region,
    );
    seedSuggestions.forEach((kw) =>
      allRaw.push({ keyword: kw, source: "seed" }),
    );

    // 2. Depth crawl — level 2
    if (depth === 2) {
      const depth2Results = await this.crawlDepth2(
        seedSuggestions,
        language,
        region,
      );
      depth2Results.forEach((kw) =>
        allRaw.push({ keyword: kw, source: "depth_2" }),
      );
    }

    // 3. Question-based keywords
    if (include_questions) {
      const questionKeywords = await this.fetchQuestionKeywords(
        query,
        language,
        region,
      );
      questionKeywords.forEach((kw) =>
        allRaw.push({ keyword: kw, source: "question" }),
      );
    }

    // 4. Deduplicate
    const deduped = this.deduplicate(allRaw);

    // 5. Apply filters
    const filtered = this.applyFilters(deduped, filters);

    // 6. Enrich with intent + group
    const enriched: KeywordItem[] = filtered.map((item) => ({
      keyword: item.keyword,
      word_count: item.keyword.split(/\s+/).length,
      char_length: item.keyword.length,
      intent: this.detectIntent(item.keyword),
      group: this.detectGroup(item.keyword),
      source: item.source,
    }));

    // 7. Group keywords
    const grouped = this.groupKeywords(enriched);

    // 8. Intent summary
    const intent_summary = this.buildIntentSummary(enriched);

    // 9. Optional CSV
    const csv = export_csv ? this.generateCSV(enriched) : undefined;

    return {
      query,
      language,
      region,
      total: enriched.length,
      keywords: enriched,
      grouped,
      intent_summary,
      ...(csv !== undefined && { csv }),
    };
  }

  // ── Google Suggest Fetch ──────────────────────────────────

  private async fetchSuggestions(
    query: string,
    language: string,
    region: string,
  ): Promise<string[]> {
    try {
      const url = `${GOOGLE_SUGGEST_URL}?client=chrome&q=${encodeURIComponent(query)}&hl=${language}&gl=${region}`;

      const response = await fetch(url, { headers: DEFAULT_HEADERS });

      if (!response.ok) {
        // Non-fatal — return empty if Google fails for a sub-query
        return [];
      }

      const data = await response.json();
      return (data[1] as string[]) ?? [];
    } catch {
      return [];
    }
  }

  // ── Depth 2 Crawl ─────────────────────────────────────────

  private async crawlDepth2(
    seedSuggestions: string[],
    language: string,
    region: string,
  ): Promise<string[]> {
    // Limit to first 5 seed suggestions to avoid too many requests
    const targets = seedSuggestions.slice(0, 5);

    const results = await Promise.all(
      targets.map((kw) => this.fetchSuggestions(kw, language, region)),
    );

    return results.flat();
  }

  // ── Question Keywords ─────────────────────────────────────

  private async fetchQuestionKeywords(
    query: string,
    language: string,
    region: string,
  ): Promise<string[]> {
    // Fetch for each question word in parallel
    const results = await Promise.all(
      QUESTION_WORDS.map((word) =>
        this.fetchSuggestions(`${word} ${query}`, language, region),
      ),
    );

    return results.flat();
  }

  // ── Deduplication ─────────────────────────────────────────

  private deduplicate(
    items: { keyword: string; source: KeywordItem["source"] }[],
  ): { keyword: string; source: KeywordItem["source"] }[] {
    const seen = new Set<string>();
    return items.filter((item) => {
      const normalized = item.keyword.toLowerCase().trim();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  }

  // ── Filters ───────────────────────────────────────────────

  private applyFilters(
    items: { keyword: string; source: KeywordItem["source"] }[],
    filters: KeywordFilters,
  ): { keyword: string; source: KeywordItem["source"] }[] {
    const {
      min_word_count,
      max_word_count,
      min_char_length,
      exclude_keywords = [],
    } = filters;

    const excludeSet = new Set(
      exclude_keywords.map((kw) => kw.toLowerCase().trim()),
    );

    return items.filter(({ keyword }) => {
      const lower = keyword.toLowerCase().trim();
      const wordCount = lower.split(/\s+/).length;
      const charLength = lower.length;

      if (min_word_count !== undefined && wordCount < min_word_count)
        return false;
      if (max_word_count !== undefined && wordCount > max_word_count)
        return false;
      if (min_char_length !== undefined && charLength < min_char_length)
        return false;

      // Exclude exact matches OR if keyword contains an excluded term
      if (excludeSet.has(lower)) return false;
      for (const excl of excludeSet) {
        if (lower.includes(excl)) return false;
      }

      return true;
    });
  }

  // ── Intent Detection ──────────────────────────────────────

  private detectIntent(keyword: string): string {
    const lower = keyword.toLowerCase();

    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (lower.includes(pattern)) return intent;
      }
    }

    return "informational"; // default
  }

  // ── Group Detection ───────────────────────────────────────

  private detectGroup(keyword: string): string {
    const lower = keyword.toLowerCase();

    for (const [group, patterns] of Object.entries(GROUP_PATTERNS)) {
      for (const pattern of patterns) {
        if (lower.includes(pattern)) return group;
      }
    }

    return "general";
  }

  // ── Grouping ──────────────────────────────────────────────

  private groupKeywords(keywords: KeywordItem[]): GroupedKeywords {
    return keywords.reduce<GroupedKeywords>((acc, item) => {
      const group = item.group;
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {});
  }

  // ── Intent Summary ────────────────────────────────────────

  private buildIntentSummary(keywords: KeywordItem[]): Record<string, number> {
    return keywords.reduce<Record<string, number>>((acc, item) => {
      acc[item.intent] = (acc[item.intent] ?? 0) + 1;
      return acc;
    }, {});
  }

  // ── CSV Generator ─────────────────────────────────────────

  private generateCSV(keywords: KeywordItem[]): string {
    const header = "keyword,word_count,char_length,intent,group,source";

    const rows = keywords.map((item) =>
      [
        `"${item.keyword.replace(/"/g, '""')}"`,
        item.word_count,
        item.char_length,
        item.intent,
        item.group,
        item.source,
      ].join(","),
    );

    return [header, ...rows].join("\n");
  }
}

export default KeywordService;
