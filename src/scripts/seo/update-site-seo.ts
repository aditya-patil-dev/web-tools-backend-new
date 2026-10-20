import DB, { T } from "../../database/index.schema";

/* =========================================================================
   1. Category Pages SEO Data (tools_category_pages)
========================================================================= */
const categoryPagesData = [
  {
    category_slug: "image-tools",
    page_title: "Free Online Image Tools – Convert, Compress, Resize & Edit Photos",
    page_description:
      "10+ free online image tools. Convert formats (JPG, PNG, WebP, HEIC), compress file size without quality loss, remove backgrounds with AI, and resize photos instantly.",
    page_intro:
      "Optimize, convert, and edit your digital visuals with FusionTools' comprehensive image suite. Whether you need to compress photos for web performance, remove backgrounds with AI, or convert between JPG, PNG, and next-gen WebP formats, all processing happens locally inside your browser with 100% privacy and zero file size caps.",
    meta_title: "Free Online Image Tools | Convert, Compress & Resize Photos",
    meta_description:
      "Free online image tools to convert, compress, crop, and resize photos. Fast in-browser processing for JPG, PNG, WebP & HEIC with 100% privacy and no limits.",
    meta_keywords:
      "image tools, online image converter, free image compressor, resize photos online, convert webp to jpg, png converter, ai background remover, heic to jpg, image to base64, free image editing suite",
    canonical_url: "https://fusiontools.in/tools/image-tools",
    noindex: false,
    status: "active",
  },
  {
    category_slug: "pdf-tools",
    page_title: "Free Online PDF Tools – Merge, Convert, Protect & Edit PDF Files",
    page_description:
      "8+ free online PDF tools. Merge multiple PDFs, convert to Word & Excel, extract high-res JPG images, add password encryption, or unlock secured PDF files.",
    page_intro:
      "Take full command of your PDF workflow with FusionTools' fast, secure document utilities. Merge multi-page contracts, convert PDFs into editable Microsoft Word or Excel spreadsheets, encrypt confidential records with AES-256 passwords, or remove restrictions. Engineered with client-side WebAssembly, your sensitive documents never touch any server.",
    meta_title: "Free Online PDF Tools | Merge, Convert, Protect & Edit PDFs",
    meta_description:
      "Manage, merge, and convert PDF documents online for free. Convert PDF to Word, Excel, and JPG, or encrypt with passwords. 100% private client-side processing.",
    meta_keywords:
      "pdf tools, online pdf converter, merge pdf files, pdf to word converter, pdf to excel, protect pdf password, unlock pdf, pdf to jpg, free pdf editor, client-side pdf utilities",
    canonical_url: "https://fusiontools.in/tools/pdf-tools",
    noindex: false,
    status: "active",
  },
  {
    category_slug: "developer-tools",
    page_title: "Free Online Developer Tools – Format, Decode, Hash & Convert Data",
    page_description:
      "Free online developer tools for software engineers. Format JSON, decode JWT tokens, calculate SHA-256 hashes, convert Base64 strings, and parse Epoch timestamps.",
    page_intro:
      "Accelerate your software engineering workflow with essential, zero-latency developer utilities. Format and validate JSON payloads against RFC standards, decode and inspect JWT tokens, calculate cryptographic hashes (SHA-256, MD5), and convert Unix Epoch timestamps. Built strictly with client-side JavaScript, your proprietary code, API secrets, and tokens remain completely private.",
    meta_title: "Free Online Developer Tools | JSON, JWT, Hash & Base64",
    meta_description:
      "Essential free developer utilities. Beautify JSON, decode JWTs, generate cryptographic hashes, and convert Unix timestamps. 100% secure in-browser tools.",
    meta_keywords:
      "developer tools, json formatter, jwt decoder, base64 encoder decoder, sha256 hash generator, md5 generator, unix timestamp converter, json to csv, online developer utilities, web developer tools",
    canonical_url: "https://fusiontools.in/tools/developer-tools",
    noindex: false,
    status: "active",
  },
  {
    category_slug: "seo-tools",
    page_title: "Free Online SEO Tools – Audit, Optimize & Boost Search Rankings",
    page_description:
      "Free online SEO and webmaster tools. Create meta tags, generate XML sitemaps, inspect Open Graph cards, trace URL redirects, and benchmark site speed.",
    page_intro:
      "Maximize organic search traffic and technical performance with FusionTools' SEO suite. Generate standard XML sitemaps, audit Open Graph social previews, build crawler directives in robots.txt, trace 301/302 redirect chains, and test page load speed. Fast, accurate, and completely free for webmasters and digital marketing agencies.",
    meta_title: "Free Online SEO Tools | Meta Tags, Sitemaps & Redirects",
    meta_description:
      "Optimize your website for search engines with free SEO tools. Generate XML sitemaps, create meta tags, test Open Graph previews, and trace URL redirect chains.",
    meta_keywords:
      "seo tools, free seo analyzer, meta tag generator, xml sitemap generator, robots txt generator, redirect checker, open graph checker, website speed test, technical seo tools, search engine optimization",
    canonical_url: "https://fusiontools.in/tools/seo-tools",
    noindex: false,
    status: "active",
  },
  {
    category_slug: "text-tools",
    page_title: "Free Online Text Tools – Count Words, Convert Case & Format Text",
    page_description:
      "Free online text formatting utilities. Count words and characters, convert between sentence, title, upper, lower, and camel case, and export to PDF.",
    page_intro:
      "Clean, analyze, and format written copy in seconds. Count words, characters, sentences, and estimated reading times while instantly converting text between UPPERCASE, lowercase, Title Case, camelCase, snake_case, and kebab-case. 100% browser-based and secure—your writing and notes never touch external servers.",
    meta_title: "Free Online Text Tools | Word Counter & Case Converter",
    meta_description:
      "Format written copy instantly with free online text tools. Accurate word and character counter, case converter (Title, Upper, Lower, camelCase), and text to PDF.",
    meta_keywords:
      "text tools, word counter online, case converter, text case changer, character counter, text to pdf converter, title case converter, sentence case maker, free text formatter",
    canonical_url: "https://fusiontools.in/tools/text-tools",
    noindex: false,
    status: "active",
  },
];

/* =========================================================================
   2. Static Pages SEO Data (seo_static_pages)
========================================================================= */
const staticPagesData = [
  {
    page_key: "home",
    meta_title: "FusionTools – 100% Free Online Image, PDF & Developer Tools",
    meta_description:
      "Discover 30+ free, secure online web tools. Compress images, merge PDFs, format JSON, decode JWTs, and generate SEO tags with zero server uploads and 100% privacy.",
    meta_keywords: [
      "free online tools",
      "web tools",
      "image converter",
      "pdf tools",
      "developer tools",
      "seo tools",
      "privacy tools",
      "in browser tools",
      "fusiontools",
    ],
    canonical_url: "https://fusiontools.in",
    priority: "1.0",
    changefreq: "daily",
    noindex: false,
    nofollow: false,
    status: "active",
  },
  {
    page_key: "tools",
    meta_title: "All Web Tools Directory | Free Image, PDF, Dev & SEO Utilities",
    meta_description:
      "Explore our complete catalog of 34+ free online web tools. Fast, secure utilities for image processing, PDF management, code formatting, and search engine optimization.",
    meta_keywords: [
      "all web tools",
      "free online tools directory",
      "developer utilities",
      "pdf editor online",
      "image tools suite",
      "seo tag generators",
      "free utility toolbox",
    ],
    canonical_url: "https://fusiontools.in/tools",
    priority: "0.9",
    changefreq: "daily",
    noindex: false,
    nofollow: false,
    status: "active",
  },
  {
    page_key: "about",
    meta_title: "About FusionTools – Our Mission for Private & Free Web Tools",
    meta_description:
      "Learn how FusionTools provides fast, zero-upload, client-side web tools for developers, designers, and creators worldwide. 100% privacy and zero paywalls.",
    meta_keywords: [
      "about fusiontools",
      "private online tools",
      "client-side web tools",
      "free tools mission",
      "safe web utilities",
    ],
    canonical_url: "https://fusiontools.in/about",
    priority: "0.6",
    changefreq: "monthly",
    noindex: false,
    nofollow: false,
    status: "active",
  },
];

/* =========================================================================
   3. Homepage SEO Content Component (page_components)
========================================================================= */
const homeSeoComponentData = {
  title: "Free <span>Online Web Tools</span> for Everyday Digital Productivity",
  intro:
    "FusionTools is an all-in-one platform providing over 30+ high-performance web utilities designed to make digital workflows seamless, fast, and completely confidential.",
  expandedContent: [
    {
      heading: "High-Performance Web Utilities Without Software Bloat",
      content:
        "Forget purchasing bulky, expensive desktop licenses just to perform quick everyday edits. Modern web standards now make it possible to resize photos, merge legal contracts, and validate code directly in your browser. Whether you are working on Windows, macOS, Linux, iPhone, or Android, FusionTools gives you immediate access to enterprise-grade tools with zero installation.",
    },
    {
      heading: "Image, PDF, Developer & SEO Suites Under One Roof",
      content:
        "Jumping across multiple fragmented websites to complete a single project is slow and inefficient. We have unified the most crucial digital utilities: convert and compress next-gen images, manipulate multi-page PDFs, decode JSON and JWTs, and audit technical SEO meta tags and sitemaps—all from a single, cohesive dashboard.",
    },
    {
      heading: "100% Client-Side Privacy: Your Files Never Leave Your Device",
      content:
        "Most free online converters quietly upload your sensitive contracts, company finances, and personal photos to third-party cloud servers. FusionTools is built fundamentally on client-side WebAssembly and modern JavaScript APIs. Your documents and files are decoded and processed locally in your browser sandbox, guaranteeing absolute privacy and eliminating server upload wait times.",
    },
    {
      heading: "Enterprise Precision with Zero Subscriptions or Watermarks",
      content:
        "We believe essential digital tools should be accessible to everyone—from solo developers and students to growing marketing agencies. Enjoy unlimited conversions, full-resolution downloads, and zero branded watermarks on every file you produce.",
    },
  ],
};

/* =========================================================================
   Execution Logic
========================================================================= */
async function run() {
  console.log("\n======================================================");
  console.log("🚀 Starting Site-Wide SEO Update (Categories & Static)");
  console.log("======================================================\n");

  // 1. Update Category Pages (tools_category_pages)
  console.log("📂 Updating 5 Category Hub Pages in `tools_category_pages`...");
  for (const cat of categoryPagesData) {
    const existing = await DB(T.TOOLs_CATEGORY_PAGES)
      .where("category_slug", cat.category_slug)
      .first();

    const payload = {
      page_title: cat.page_title,
      page_description: cat.page_description,
      page_intro: cat.page_intro,
      meta_title: cat.meta_title,
      meta_description: cat.meta_description,
      meta_keywords: cat.meta_keywords,
      canonical_url: cat.canonical_url,
      noindex: cat.noindex,
      status: cat.status,
      updated_at: DB.fn.now(),
    };

    if (existing) {
      await DB(T.TOOLs_CATEGORY_PAGES)
        .where("category_slug", cat.category_slug)
        .update(payload);
      console.log(`  ✅ [UPDATED] Category: ${cat.category_slug}`);
    } else {
      await DB(T.TOOLs_CATEGORY_PAGES).insert({
        category_slug: cat.category_slug,
        ...payload,
        created_at: DB.fn.now(),
      });
      console.log(`  ✨ [INSERTED] Category: ${cat.category_slug}`);
    }
  }

  // 2. Update Static Pages (seo_static_pages)
  console.log("\n🌐 Updating Static Pages in `seo_static_pages`...");
  for (const page of staticPagesData) {
    const existing = await DB(T.SEO_STATIC_PAGES)
      .where("page_key", page.page_key)
      .first();

    const payload = {
      meta_title: page.meta_title,
      meta_description: page.meta_description,
      meta_keywords: page.meta_keywords, // native text[] in postgres
      canonical_url: page.canonical_url,
      priority: page.priority,
      changefreq: page.changefreq,
      noindex: page.noindex,
      nofollow: page.nofollow,
      status: page.status,
      updated_at: DB.fn.now(),
    };

    if (existing) {
      await DB(T.SEO_STATIC_PAGES)
        .where("page_key", page.page_key)
        .update(payload);
      console.log(`  ✅ [UPDATED] Static Page: ${page.page_key}`);
    } else {
      await DB(T.SEO_STATIC_PAGES).insert({
        page_key: page.page_key,
        ...payload,
        created_at: DB.fn.now(),
      });
      console.log(`  ✨ [INSERTED] Static Page: ${page.page_key}`);
    }
  }

  // 3. Update Homepage SEO Component (page_components)
  console.log("\n📄 Updating Homepage `seo-content` Component in `page_components`...");
  const existingComponent = await DB(T.PAGE_COMPONENTS)
    .where("page_key", "home")
    .where("component_type", "seo-content")
    .first();

  if (existingComponent) {
    await DB(T.PAGE_COMPONENTS)
      .where("page_key", "home")
      .where("component_type", "seo-content")
      .update({
        component_data: JSON.stringify(homeSeoComponentData),
        updated_at: DB.fn.now(),
      });
    console.log("  ✅ [UPDATED] Homepage `seo-content` component");
  } else {
    await DB(T.PAGE_COMPONENTS).insert({
      page_key: "home",
      component_type: "seo-content",
      component_data: JSON.stringify(homeSeoComponentData),
      created_at: DB.fn.now(),
      updated_at: DB.fn.now(),
    });
    console.log("  ✨ [INSERTED] Homepage `seo-content` component");
  }

  console.log("\n------------------------------------------------------");
  console.log("🎉 Successfully updated all Category and Static SEO pages!");
  console.log("------------------------------------------------------\n");
}

run()
  .catch((err) => {
    console.error("❌ Error updating site SEO:", err);
    process.exit(1);
  })
  .finally(async () => {
    await DB.destroy();
    process.exit(0);
  });
