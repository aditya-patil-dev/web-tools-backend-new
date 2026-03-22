import DB, { T } from "../database/index.schema";
import axios from "axios";
import HttpException from "../exceptions/HttpException";

type TrackEventPayload = {
  tool_id: number;
  event_type: "PAGE_VIEW" | "TOOL_RUN" | "RECOMMENDATION_CLICK";
  session_id: string;
  ref_tool_id?: number | null;
  user_id?: number | null;
  meta?: any;
};

interface ProtectPdfOptions {
  buffer: Buffer;
  originalName: string;
  password: string;
  ownerPassword: string;
  allowPrint: boolean;
  allowCopy: boolean;
  allowModify: boolean;
}

interface UnlockPdfOptions {
  buffer: Buffer;
  originalName: string;
  password: string;
}

class ToolsService {
  /**
   * ALL tools across every category
   * Used by GET /tools/all
   */
  public async getAllTools(): Promise<any> {
    const [tools, categories] = await Promise.all([
      DB(T.TOOLS)
        .select(
          "id",
          "title",
          "slug",
          "short_description",
          "category_slug",
          "tool_type",
          "tags",
          "badge",
          "rating",
          "views",
          "users_count",
          "tool_url",
        )
        .where({ status: "active" })
        .orderBy([
          { column: "is_featured", order: "desc" },
          { column: "sort_order", order: "asc" },
          { column: "created_at", order: "desc" },
        ]),

      DB("tools_category_pages")
        .select("category_slug as slug", "page_title", "page_description")
        .where({ status: "active" }),
    ]);

    return { categories, tools };
  }

  /**
   * Tools listing (cards)
   * Reads ONLY `tools`
   */
  public async getToolsByCategory(categorySlug: string): Promise<any[]> {
    return DB(T.TOOLS)
      .select(
        "id",
        "title",
        "slug",
        "short_description",
        "category_slug",
        "tool_type",
        "tags",
        "badge",
        "rating",
        "views",
        "users_count",
        "tool_url",
      )
      .where({
        category_slug: categorySlug,
        status: "active",
      })
      .orderBy([
        { column: "is_featured", order: "desc" },
        { column: "sort_order", order: "asc" },
        { column: "created_at", order: "desc" },
      ]);
  }

  /**
   * Tool detail page
   * JOIN tools + tool_pages
   */
  public async getToolPage(
    categorySlug: string,
    toolSlug: string,
    sessionId?: string,
  ) {
    const tool = await DB("tools")
      .leftJoin("tool_pages", "tools.slug", "tool_pages.tool_slug")
      .select(
        "tools.id",
        "tools.title",
        "tools.slug",
        "tools.category_slug",
        "tools.tool_type",
        "tools.tags",
        "tools.short_description",
        "tools.badge",
        "tools.rating",
        "tools.views",
        "tools.users_count",
        "tools.last_used_at",
        "tools.access_level",
        "tools.daily_limit",
        "tools.monthly_limit",
        "tools.tool_url",

        "tool_pages.page_title",
        "tool_pages.page_intro",
        "tool_pages.long_content",
        "tool_pages.features",
        "tool_pages.faqs",
        "tool_pages.meta_title",
        "tool_pages.meta_description",
        "tool_pages.meta_keywords",
        "tool_pages.canonical_url",
        "tool_pages.schema_markup",
        "tool_pages.noindex",
      )
      .where({
        "tools.slug": toolSlug,
        "tools.category_slug": categorySlug,
        "tools.status": "active",
      })
      .andWhere("tool_pages.status", "active")
      .first();

    if (!tool) return null;

    /*
        AUTO TRACK PAGE VIEW
        */

    if (sessionId) {
      await Promise.all([
        DB("tools")
          .where({ id: tool.id })
          .update({
            views: DB.raw("views + 1"),
          }),

        this.trackToolEvent({
          tool_id: tool.id,
          event_type: "PAGE_VIEW",
          session_id: sessionId,
          meta: { page: "tool_detail" },
        }),
      ]);
    }

    /*
        GET RECOMMENDATIONS
        */

    const recommendations = await this.getRecommendations(tool.id);

    return {
      ...tool,
      recommendations,
    };
  }

  public async getCategoryPage(categorySlug: string) {
    const categoryPage = await DB("tools_category_pages")
      .select(
        "page_title",
        "page_description",
        "page_intro",
        "meta_title",
        "meta_description",
        "meta_keywords",
        "canonical_url",
        "noindex",
      )
      .where({
        category_slug: categorySlug,
        status: "active",
      })
      .first();

    return categoryPage || null;
  }

  private GOOGLE_API =
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

  // DROP-IN REPLACEMENT for the testWebsiteSpeed method
  public async testWebsiteSpeed(url: string) {
    try {
      const response = await axios.get(this.GOOGLE_API, {
        params: {
          url,
          key: process.env.GOOGLE_PAGESPEED_API_KEY,
          category: ["performance"],
          strategy: "mobile",
        },
      });

      const lighthouse = response.data.lighthouseResult;
      const audits = lighthouse.audits;
      const categories = lighthouse.categories;

      /* ── Overall score & grade ─────────────────────────── */
      const score = Math.round(categories.performance.score * 100);
      const grade =
        score >= 90
          ? "A"
          : score >= 80
            ? "B"
            : score >= 70
              ? "C"
              : score >= 60
                ? "D"
                : "F";

      /* ── Resource sizes ────────────────────────────────── */
      const totalBytes = audits["total-byte-weight"]?.numericValue || 0;
      const requests = audits["network-requests"]?.details?.items?.length || 0;

      /* ── Core timing metrics ───────────────────────────── */
      const metrics = {
        loadTime: audits["interactive"]?.numericValue || 0,
        domContentLoaded: audits["dom-content-loaded"]?.numericValue || 0,
        firstContentfulPaint:
          audits["first-contentful-paint"]?.numericValue || 0,
        timeToInteractive: audits["interactive"]?.numericValue || 0,
        totalSize: totalBytes / 1024,
        requests,
        imageSize: this.getResourceSize(audits, "image"),
        scriptSize: this.getResourceSize(audits, "script"),
        styleSize: this.getResourceSize(audits, "stylesheet"),
        score,
        grade,

        /* ── Core Web Vitals ─────────────────────────────── */
        coreWebVitals: {
          lcp: {
            value: audits["largest-contentful-paint"]?.numericValue || 0,
            display: audits["largest-contentful-paint"]?.displayValue || "N/A",
            score: audits["largest-contentful-paint"]?.score ?? null,
          },
          cls: {
            value: audits["cumulative-layout-shift"]?.numericValue || 0,
            display: audits["cumulative-layout-shift"]?.displayValue || "N/A",
            score: audits["cumulative-layout-shift"]?.score ?? null,
          },
          tbt: {
            value: audits["total-blocking-time"]?.numericValue || 0,
            display: audits["total-blocking-time"]?.displayValue || "N/A",
            score: audits["total-blocking-time"]?.score ?? null,
          },
          fcp: {
            value: audits["first-contentful-paint"]?.numericValue || 0,
            display: audits["first-contentful-paint"]?.displayValue || "N/A",
            score: audits["first-contentful-paint"]?.score ?? null,
          },
          speedIndex: {
            value: audits["speed-index"]?.numericValue || 0,
            display: audits["speed-index"]?.displayValue || "N/A",
            score: audits["speed-index"]?.score ?? null,
          },
        },

        /* ── Diagnostics ─────────────────────────────────── */
        diagnostics: {
          ttfb: {
            value: audits["server-response-time"]?.numericValue || 0,
            display: audits["server-response-time"]?.displayValue || "N/A",
            score: audits["server-response-time"]?.score ?? null,
          },
          domSize: {
            value: audits["dom-size"]?.numericValue || 0,
            display: audits["dom-size"]?.displayValue || "N/A",
            score: audits["dom-size"]?.score ?? null,
          },
          bootupTime: {
            value: audits["bootup-time"]?.numericValue || 0,
            display: audits["bootup-time"]?.displayValue || "N/A",
            score: audits["bootup-time"]?.score ?? null,
          },
          mainThreadWork: {
            value: audits["mainthread-work-breakdown"]?.numericValue || 0,
            display: audits["mainthread-work-breakdown"]?.displayValue || "N/A",
            score: audits["mainthread-work-breakdown"]?.score ?? null,
          },
          thirdPartyBytes: {
            value: audits["third-party-summary"]?.numericValue || 0,
            display: audits["third-party-summary"]?.displayValue || "N/A",
            score: audits["third-party-summary"]?.score ?? null,
          },
        },

        /* ── Recommendations & passed audits ─────────────── */
        recommendations: this.extractRecommendations(audits),
        passedAuditsCount: this.countPassedAudits(audits),
      };

      return metrics;
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new HttpException(400, error.response.data.error.message);
      }
      throw new HttpException(500, "Failed to analyze website speed");
    }
  }

  // PRIVATE HELPERS — replace existing versions
  private getResourceSize(audits: any, type: string): number {
    const items = audits["network-requests"]?.details?.items || [];
    return (
      items
        .filter((item: any) => item.resourceType === type)
        .reduce((sum: number, item: any) => sum + (item.transferSize || 0), 0) /
      1024
    );
  }

  private extractRecommendations(audits: any) {
    const recommendations: Array<{
      severity: "critical" | "warning" | "info";
      title: string;
      description: string;
      savingsMs?: number;
      savingsBytes?: number;
      savingsDisplay?: string;
    }> = [];

    // Audit key → minimum score to include, category tag
    const targets = [
      // Critical — direct timing impact
      { key: "render-blocking-resources", threshold: 0.9 },
      { key: "server-response-time", threshold: 0.9 },
      { key: "bootup-time", threshold: 0.9 },
      { key: "mainthread-work-breakdown", threshold: 0.9 },
      // Warnings — size / transfer impact
      { key: "unused-javascript", threshold: 1.0 },
      { key: "unused-css-rules", threshold: 1.0 },
      { key: "uses-optimized-images", threshold: 1.0 },
      { key: "modern-image-formats", threshold: 1.0 },
      { key: "efficiently-encode-images", threshold: 1.0 },
      { key: "uses-text-compression", threshold: 1.0 },
      { key: "uses-long-cache-ttl", threshold: 0.9 },
      { key: "uses-responsive-images", threshold: 1.0 },
      // Info — best practice hints
      { key: "dom-size", threshold: 0.9 },
      { key: "third-party-summary", threshold: 0.9 },
      { key: "font-display", threshold: 1.0 },
      { key: "uses-passive-event-listeners", threshold: 1.0 },
      { key: "no-document-write", threshold: 1.0 },
      { key: "uses-http2", threshold: 0.9 },
    ];

    for (const { key, threshold } of targets) {
      const audit = audits[key];
      if (!audit || audit.score === null || audit.score >= threshold) continue;

      // Severity bucket
      let severity: "critical" | "warning" | "info";
      if (audit.score < 0.5) severity = "critical";
      else if (audit.score < 0.9) severity = "warning";
      else severity = "info";

      // Pull savings if available
      const savingsMs =
        audit.details?.overallSavingsMs ||
        (audit.numericValue && key === "server-response-time")
          ? audit.numericValue
          : undefined;
      const savingsBytes = audit.details?.overallSavingsBytes || undefined;

      let savingsDisplay: string | undefined;
      if (savingsMs && savingsMs > 0) {
        savingsDisplay = `~${(savingsMs / 1000).toFixed(1)}s`;
      } else if (savingsBytes && savingsBytes > 0) {
        savingsDisplay =
          savingsBytes < 1024 * 1024
            ? `~${(savingsBytes / 1024).toFixed(0)} KB`
            : `~${(savingsBytes / (1024 * 1024)).toFixed(1)} MB`;
      }

      recommendations.push({
        severity,
        title: audit.title || key,
        description: audit.description || "",
        ...(savingsMs ? { savingsMs } : {}),
        ...(savingsBytes ? { savingsBytes } : {}),
        ...(savingsDisplay ? { savingsDisplay } : {}),
      });
    }

    // Sort: critical first, then warning, then info
    const order = { critical: 0, warning: 1, info: 2 };
    recommendations.sort((a, b) => order[a.severity] - order[b.severity]);

    return recommendations;
  }

  private countPassedAudits(audits: any): number {
    return Object.values(audits).filter(
      (a: any) => a?.score !== null && a?.score === 1,
    ).length;
  }

  /*
  ========================================
  TRACK EVENT
  ========================================
  */

  public async trackToolEvent(payload: TrackEventPayload) {
    await DB("tool_events").insert({
      tool_id: payload.tool_id,

      event_type: payload.event_type,

      session_id: payload.session_id,

      ref_tool_id: payload.ref_tool_id || null,

      user_id: payload.user_id || null,

      meta: DB.raw("?::jsonb", [JSON.stringify(payload.meta || {})]),
    });

    /*
        TOOL RUN UPDATE
        */

    if (payload.event_type === "TOOL_RUN") {
      await DB("tools")
        .where({
          id: payload.tool_id,
        })
        .update({
          users_count: DB.raw("users_count + 1"),

          last_used_at: DB.fn.now(),
        });
    }
  }

  /*
    ========================================
    RECOMMENDATIONS MASTER
    ========================================
    */

  private async getRecommendations(toolId: number) {
    const [related, popular, alsoUsed] = await Promise.all([
      this.getRelatedTools(toolId),

      this.getPopularTools(toolId),

      this.getAlsoUsedTools(toolId),
    ]);

    return {
      related,
      popular,
      alsoUsed,
    };
  }

  /*
    ========================================
    RELATED TOOLS
    ========================================
    */

  private async getRelatedTools(toolId: number, limit = 6) {
    const base = await DB("tools")
      .select("category_slug", "tool_type", "tags")
      .where({ id: toolId })
      .first();

    if (!base) return [];

    return DB("tools")
      .select(
        "id",
        "title",
        "slug",
        "short_description",
        "category_slug",
        "tool_type",
        "badge",
        "rating",
        "views",
        "users_count",
        "tool_url",
      )

      .where("status", "active")

      .whereNot("id", toolId)

      .andWhere((qb) => {
        qb.where("category_slug", base.category_slug)
          .orWhere("tool_type", base.tool_type)
          .orWhereRaw("tags && ?::text[]", [base.tags || []]);
      })

      .orderBy("is_featured", "desc")

      .orderBy("views", "desc")

      .limit(limit);
  }

  /*
    ========================================
    POPULAR TOOLS
    ========================================
    */

  private async getPopularTools(toolId: number, limit = 8) {
    const popular = await DB("tool_events as e")
      .join("tools as t", "t.id", "e.tool_id")

      .select(
        "t.id",
        "t.title",
        "t.slug",
        "t.short_description",
        "t.category_slug",
        "t.tool_type",
        "t.badge",
        "t.rating",
        "t.views",
        "t.users_count",
        "t.tool_url",

        DB.raw("COUNT(*)::int as runs"),
      )

      .where("e.event_type", "TOOL_RUN")

      .where("e.created_at", ">=", DB.raw("now() - interval '7 days'"))

      .whereNot("t.id", toolId)

      .groupBy("t.id")

      .orderBy("runs", "desc")

      .limit(limit);

    if (popular.length) return popular;

    /*
        FALLBACK
        */

    return DB("tools")
      .select(
        "id",
        "title",
        "slug",
        "short_description",
        "category_slug",
        "tool_type",
        "badge",
        "rating",
        "views",
        "users_count",
        "tool_url",
      )

      .where("status", "active")

      .whereNot("id", toolId)

      .orderBy("views", "desc")

      .limit(limit);
  }

  /*
    ========================================
    ALSO USED
    ========================================
    */

  private async getAlsoUsedTools(toolId: number, limit = 6) {
    const sessions = await DB("tool_events")
      .distinct("session_id")

      .where({
        tool_id: toolId,
        event_type: "TOOL_RUN",
      })

      .limit(500);

    const ids = sessions.map((s) => s.session_id);

    if (!ids.length) return [];

    return DB("tool_events as e")
      .join("tools as t", "t.id", "e.tool_id")

      .select(
        "t.id",
        "t.title",
        "t.slug",
        "t.short_description",
        "t.category_slug",
        "t.tool_type",
        "t.badge",
        "t.rating",
        "t.views",
        "t.users_count",
        "t.tool_url",

        DB.raw("COUNT(*)::int as hits"),
      )

      .whereIn("e.session_id", ids)

      .whereNot("t.id", toolId)

      .groupBy("t.id")

      .orderBy("hits", "desc")

      .limit(limit);
  }

  public async checkOpenGraph(url: string) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; OGChecker/1.0)",
          Accept: "text/html",
        },
        maxRedirects: 5,
      });

      const html: string = response.data;

      const getMeta = (property: string): string | null => {
        const match =
          html.match(
            new RegExp(
              `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
              "i",
            ),
          ) ||
          html.match(
            new RegExp(
              `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
              "i",
            ),
          );
        return match ? match[1] : null;
      };

      const getMetaName = (name: string): string | null => {
        const match =
          html.match(
            new RegExp(
              `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`,
              "i",
            ),
          ) ||
          html.match(
            new RegExp(
              `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`,
              "i",
            ),
          );
        return match ? match[1] : null;
      };

      const getTitleTag = (): string => {
        const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        return match ? match[1].trim() : "";
      };

      const getFavicon = (): string => {
        const match =
          html.match(
            /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i,
          ) ||
          html.match(
            /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i,
          );
        if (!match) return `${new URL(url).origin}/favicon.ico`;
        const href = match[1];
        return href.startsWith("http") ? href : `${new URL(url).origin}${href}`;
      };

      // Extract all tags
      const ogTitle = getMeta("og:title");
      const ogDescription = getMeta("og:description");
      const ogImage = getMeta("og:image");
      const ogUrl = getMeta("og:url");
      const ogType = getMeta("og:type");
      const ogSiteName = getMeta("og:site_name");
      const ogLocale = getMeta("og:locale");
      const twCard = getMetaName("twitter:card");
      const twTitle = getMetaName("twitter:title");
      const twDescription = getMetaName("twitter:description");
      const twImage = getMetaName("twitter:image");
      const twSite = getMetaName("twitter:site");
      const metaDesc = getMetaName("description");
      const titleTag = getTitleTag();

      const tag = (
        property: string,
        content: string | null,
        required = false,
      ) => {
        if (!content)
          return {
            property,
            content: "",
            status: required ? "missing" : "missing",
          };
        return { property, content, status: "found" };
      };

      // Score calculation
      const requiredTags = [ogTitle, ogDescription, ogImage, ogUrl];
      const recommendedTags = [
        ogType,
        ogSiteName,
        twCard,
        twTitle,
        twDescription,
      ];
      const foundRequired = requiredTags.filter(Boolean).length;
      const foundRecommended = recommendedTags.filter(Boolean).length;
      const score = Math.round(
        (foundRequired / 4) * 60 + (foundRecommended / 5) * 40,
      );

      // Issues, warnings, suggestions
      const issues: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      if (!ogTitle)
        issues.push("og:title is missing — required for all social shares");
      if (!ogDescription)
        issues.push("og:description is missing — required for rich previews");
      if (!ogImage)
        issues.push(
          "og:image is missing — your link will show no image when shared",
        );
      if (!ogUrl)
        issues.push("og:url is missing — canonical URL for the shared page");

      if (!ogType)
        warnings.push(
          "og:type not set — defaults to 'website' but should be explicit",
        );
      if (!ogSiteName)
        warnings.push(
          "og:site_name not set — recommended for brand recognition",
        );
      if (!ogLocale)
        warnings.push("og:locale not set — recommended (e.g. en_US)");
      if (ogImage && !getMeta("og:image:width"))
        warnings.push(
          "og:image dimensions not specified — add og:image:width and og:image:height for faster rendering",
        );
      if (ogImage && !getMeta("og:image:alt"))
        warnings.push("og:image:alt missing — important for accessibility");

      if (!twCard)
        suggestions.push(
          "Add twitter:card for better Twitter/X share appearance",
        );
      if (!twTitle)
        suggestions.push("Add twitter:title — fallback to og:title otherwise");
      if (!twDescription)
        suggestions.push("Add twitter:description for Twitter/X previews");
      if (!twImage)
        suggestions.push(
          "Add twitter:image for a dedicated Twitter/X card image",
        );
      if (!twSite)
        suggestions.push(
          "Add twitter:site with your @handle to credit your brand",
        );

      return {
        url,
        metaTitle: titleTag,
        metaDescription: metaDesc || "",
        faviconUrl: getFavicon(),
        score,
        issues,
        warnings,
        suggestions,
        validationResult: {
          title: tag("og:title", ogTitle),
          description: tag("og:description", ogDescription),
          image: tag("og:image", ogImage),
          url: tag("og:url", ogUrl),
          type: tag("og:type", ogType),
          siteName: tag("og:site_name", ogSiteName),
          locale: tag("og:locale", ogLocale),
          twitterCard: tag("twitter:card", twCard),
          twitterTitle: tag("twitter:title", twTitle),
          twitterDescription: tag("twitter:description", twDescription),
          twitterImage: tag("twitter:image", twImage),
          twitterSite: tag("twitter:site", twSite),
        },
      };
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNREFUSED")
          throw new HttpException(400, "Could not connect to the URL");
        if (error.code === "ETIMEDOUT")
          throw new HttpException(
            400,
            "Request timed out — site took too long to respond",
          );
        if (error.response?.status === 403)
          throw new HttpException(
            400,
            "Site blocked the request (403 Forbidden)",
          );
        if (error.response?.status === 404)
          throw new HttpException(400, "Page not found (404)");
      }
      throw new HttpException(500, "Failed to fetch OG tags from the URL");
    }
  }

  public async protectPdf(
    opts: ProtectPdfOptions,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const fs = await import("fs");
    const path = await import("path");
    const os = await import("os");
    const { execFile } = await import("child_process");
    const { promisify } = await import("util");
    const execFileAsync = promisify(execFile);

    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `pdfprotect-in-${Date.now()}.pdf`);
    const outputPath = path.join(tmpDir, `pdfprotect-out-${Date.now()}.pdf`);

    fs.writeFileSync(inputPath, opts.buffer);

    try {
      const args = [
        "--encrypt",
        opts.password, // user password
        opts.ownerPassword, // owner password
        "256", // AES-256
        "--", // end of encrypt options
        ...(opts.allowPrint ? [] : ["--print=none"]),
        ...(opts.allowCopy ? [] : ["--extract=n"]),
        ...(opts.allowModify ? [] : ["--modify=none"]),
        inputPath,
        outputPath,
      ];

      await execFileAsync("qpdf", args);

      const encryptedBuffer = fs.readFileSync(outputPath);
      const fileName = opts.originalName.replace(/\.pdf$/i, "_protected.pdf");
      return { buffer: encryptedBuffer, fileName };
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        500,
        "Failed to encrypt PDF: " + (err.stderr || err.message),
      );
    } finally {
      try {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      } catch {}
      try {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      } catch {}
    }
  }

  public async unlockPdf(
    opts: UnlockPdfOptions,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const fs = await import("fs");
    const path = await import("path");
    const os = await import("os");
    const { execFile } = await import("child_process");
    const { promisify } = await import("util");
    const execFileAsync = promisify(execFile);

    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `pdfunlock-in-${Date.now()}.pdf`);
    const outputPath = path.join(tmpDir, `pdfunlock-out-${Date.now()}.pdf`);

    fs.writeFileSync(inputPath, opts.buffer);

    try {
      // Call qpdf binary directly — full control over args and exit codes
      await execFileAsync("qpdf", [
        `--password=${opts.password}`,
        "--decrypt",
        inputPath,
        outputPath,
      ]);

      if (!fs.existsSync(outputPath)) {
        throw new HttpException(
          400,
          "Decryption failed — output file not created",
        );
      }

      const decryptedBuffer = fs.readFileSync(outputPath);
      const fileName = opts.originalName.replace(/\.pdf$/i, "_unlocked.pdf");
      return { buffer: decryptedBuffer, fileName };
    } catch (err: any) {
      // Re-throw HttpException cleanly
      if (err instanceof HttpException) throw err;

      const msg = (err.message || "").toLowerCase();
      const stderr = (err.stderr || "").toLowerCase();
      const combined = msg + " " + stderr;

      if (
        combined.includes("invalid password") ||
        combined.includes("password incorrect") ||
        combined.includes("exit code 2") ||
        err.code === 2
      ) {
        throw new HttpException(
          400,
          "Incorrect password — please check and try again",
        );
      }

      if (combined.includes("not encrypted")) {
        throw new HttpException(400, "This PDF is not password protected");
      }

      throw new HttpException(
        500,
        "Failed to unlock PDF: " + (err.stderr || err.message),
      );
    } finally {
      try {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      } catch {}
      try {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      } catch {}
    }
  }

  private readonly TOOL_SELECT_FIELDS = [
    "id",
    "title as name",
    "slug",
    "short_description as description",
    "category_slug",
    "category_slug as category",
    "tool_type",
    "badge",
    "rating",
    "views",
    "users_count as usageCount",
    "tool_url",
  ] as const;

  // ── Private helper: most-viewed tools excluding given ids ────────
  private async getFallbackTools(
    excludeIds: number[] | null,
    limit: number,
  ): Promise<any[]> {
    const query = DB(T.TOOLS)
      .select(...this.TOOL_SELECT_FIELDS)
      .where("status", "active")
      .orderBy("is_featured", "desc")
      .orderBy("views", "desc")
      .limit(limit);

    if (excludeIds && excludeIds.length > 0) {
      query.whereNotIn("id", excludeIds);
    }

    return query;
  }

  // ── Related Tools ────────────────────────────────────────────────
  public async getRelatedToolsBySlug(slug: string, limit = 6): Promise<any[]> {
    const tool = await DB(T.TOOLS)
      .select("id", "category_slug", "tool_type", "tags")
      .where({ slug, status: "active" })
      .first();

    // Tool not found — show globally popular tools as fallback
    if (!tool) return this.getFallbackTools(null, limit);

    // Smart match: same category / tool_type / overlapping tags
    const related = await DB(T.TOOLS)
      .select(...this.TOOL_SELECT_FIELDS)
      .where("status", "active")
      .whereNot("id", tool.id)
      .andWhere((qb) => {
        qb.where("category_slug", tool.category_slug)
          .orWhere("tool_type", tool.tool_type)
          .orWhereRaw("tags && ?::text[]", [tool.tags || []]);
      })
      .orderBy("is_featured", "desc")
      .orderBy("views", "desc")
      .limit(limit);

    // Enough results — return as-is
    if (related.length >= 3) return related;

    // Not enough — top up with most-viewed tools
    // (exclude current tool + already found tools)
    const existingIds = [tool.id, ...related.map((t: any) => t.id)];
    const topUp = await this.getFallbackTools(
      existingIds,
      limit - related.length,
    );

    return [...related, ...topUp];
  }

  // ── Popular Tools ────────────────────────────────────────────────
  public async getPopularToolsPublic(limit = 8): Promise<any[]> {
    // Try event-based popularity first (last 7 days)
    const popular = await DB("tool_events as e")
      .join("tools as t", "t.id", "e.tool_id")
      .select(
        "t.id",
        "t.title as name",
        "t.slug",
        "t.short_description as description",
        "t.category_slug",
        "t.category_slug as category",
        "t.tool_type",
        "t.badge",
        "t.rating",
        "t.views",
        "t.users_count as usageCount",
        "t.tool_url",
        DB.raw("COUNT(*)::int as runs"),
      )
      .where("e.event_type", "TOOL_RUN")
      .where("e.created_at", ">=", DB.raw("now() - interval '7 days'"))
      .where("t.status", "active")
      .groupBy("t.id")
      .orderBy("runs", "desc")
      .limit(limit);

    // Enough event data — return it
    if (popular.length >= 3) return popular;

    // New site / no recent events — fall back to most viewed
    return this.getFallbackTools(null, limit);
  }

  // ── Also Used Tools ──────────────────────────────────────────────
  public async getAlsoUsedToolsBySlug(slug: string, limit = 5): Promise<any[]> {
    const tool = await DB(T.TOOLS)
      .select("id", "category_slug")
      .where({ slug, status: "active" })
      .first();

    // Tool not found — show globally popular tools
    if (!tool) return this.getFallbackTools(null, limit);

    // Find sessions that ran this tool
    const sessions = await DB("tool_events")
      .distinct("session_id")
      .where({ tool_id: tool.id, event_type: "TOOL_RUN" })
      .limit(500);

    const sessionIds = sessions.map((s: any) => s.session_id);

    if (sessionIds.length > 0) {
      // Real co-usage data exists — use it
      const coUsed = await DB("tool_events as e")
        .join("tools as t", "t.id", "e.tool_id")
        .select(
          "t.id",
          "t.title as name",
          "t.slug",
          "t.short_description as description",
          "t.category_slug",
          "t.category_slug as category",
          "t.tool_type",
          "t.badge",
          "t.rating",
          "t.views",
          "t.users_count as usageCount",
          "t.tool_url",
          DB.raw("COUNT(*)::int as hits"),
        )
        .whereIn("e.session_id", sessionIds)
        .whereNot("t.id", tool.id)
        .where("t.status", "active")
        .groupBy("t.id")
        .orderBy("hits", "desc")
        .limit(limit);

      if (coUsed.length >= 2) return coUsed;

      // Some co-usage but not enough — top up with same-category tools
      const existingIds = [tool.id, ...coUsed.map((t: any) => t.id)];
      const topUp = await DB(T.TOOLS)
        .select(...this.TOOL_SELECT_FIELDS)
        .where("status", "active")
        .where("category_slug", tool.category_slug)
        .whereNotIn("id", existingIds)
        .orderBy("views", "desc")
        .limit(limit - coUsed.length);

      return [...coUsed, ...topUp];
    }

    // No event data at all (new tool) — show same-category tools as default
    const sameCategory = await DB(T.TOOLS)
      .select(...this.TOOL_SELECT_FIELDS)
      .where("status", "active")
      .where("category_slug", tool.category_slug)
      .whereNot("id", tool.id)
      .orderBy("is_featured", "desc")
      .orderBy("views", "desc")
      .limit(limit);

    if (sameCategory.length >= 2) return sameCategory;

    // Not even enough same-category tools — top up with global popular
    const existingIds = [tool.id, ...sameCategory.map((t: any) => t.id)];
    const topUp = await this.getFallbackTools(
      existingIds,
      limit - sameCategory.length,
    );

    return [...sameCategory, ...topUp];
  }
}

export default ToolsService;
