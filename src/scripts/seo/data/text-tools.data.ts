import { ToolPageFormData } from "./types";

export const textToolsSeoData: ToolPageFormData[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. Word Counter & Case Converter
  // ─────────────────────────────────────────────────────────────────────────
  {
    tool_slug: "text-case-converter",
    page_title: "Free Word Counter & Case Converter – Change Text Case Online",
    page_intro:
      "Count words, characters, sentences, and paragraphs while instantly converting text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case. Fast, accurate, and 100% private in your browser.",
    meta_title: "Word Counter & Case Converter – Change Text Case Online Free",
    meta_description:
      "Count words, characters, and reading time while converting text case online. Switch to UPPERCASE, lowercase, Title Case, camelCase, snake_case, and more. 100% free.",
    meta_keywords: [
      "case converter",
      "word counter online",
      "convert text case",
      "uppercase to lowercase",
      "title case converter",
      "sentence case generator",
      "character counter with spaces",
      "camelcase converter",
      "snake case generator",
      "kebab case converter",
      "reading time calculator"
    ],
    canonical_url: "https://fusiontools.in/tools/text-tools/text-case-converter",
    noindex: false,
    schema_markup: null,
    status: "active",
    features: [
      {
        title: "All Major Text Cases Supported",
        description:
          "Convert in one click between UPPERCASE, lowercase, Title Case, Sentence case, Capitalized Case, camelCase, PascalCase, snake_case, and kebab-case."
      },
      {
        title: "Real-Time Word & Character Statistics",
        description:
          "Live metric counters for total characters (with and without spaces), word count, sentence count, and paragraph count as you type."
      },
      {
        title: "Reading & Speaking Time Estimates",
        description:
          "Calculates accurate estimated reading time (at 200 WPM) and speech delivery time (at 130 WPM) for presentations and voiceovers."
      },
      {
        title: "Developer & Code Friendly",
        description:
          "Quickly transform phrases into variable naming conventions like camelCase, PascalCase, snake_case, and URL-friendly kebab-case."
      },
      {
        title: "100% Client-Side Privacy",
        description:
          "Your manuscripts, essays, confidential memos, and private notes are counted and converted locally in your browser memory and never leave your device."
      },
      {
        title: "One-Click Copy & Clear",
        description:
          "Quick action buttons allow you to instantly copy converted text to your clipboard or reset the editor."
      }
    ],
    faqs: [
      {
        question: "How does the Title Case converter handle small words like 'and', 'the', and 'in'?",
        answer:
          "Our intelligent Title Case algorithm follows standard editorial style manuals (AP and Chicago Manual of Style). It capitalizes the first and last words, all major nouns, verbs, and adjectives, while keeping minor conjunctions, articles, and short prepositions (e.g., 'and', 'or', 'the', 'of', 'in', 'on') lowercase unless they begin a title."
      },
      {
        question: "What is the difference between characters with spaces and without spaces?",
        answer:
          "'Characters with spaces' counts every keystroke, including letters, numbers, punctuation, tabs, and spacebar presses (often used for Twitter / X limits). 'Characters without spaces' counts only visible text characters, which is standard for academic essays and translation billing."
      },
      {
        question: "What are camelCase, snake_case, and kebab-case?",
        answer:
          "These are programming naming conventions: `camelCase` joins words with capitalized initials starting from the second word (e.g., `myVariableName`); `snake_case` replaces spaces with underscores (e.g., `user_account_id`); and `kebab-case` separates words with hyphens (e.g., `main-header-title`), commonly used in URLs and CSS classes."
      },
      {
        question: "How is reading time calculated?",
        answer:
          "Reading time is calculated using the widely accepted average silent reading speed of 200 words per minute (WPM) for adult readers. Estimated speaking time is calculated based on standard conversational pacing of 130 words per minute."
      },
      {
        question: "Are my essays or private documents stored on your servers?",
        answer:
          "Never. All text analysis, counting, and case transformation execute 100% locally in your web browser using JavaScript. No text is ever uploaded, cached, or logged."
      }
    ],
    long_content: `
<h2>How to Count Words and Convert Text Case Online</h2>
<p>Transform your text and analyze content metrics in three easy steps:</p>
<ol>
  <li><strong>Paste or Type Text:</strong> Input your text into the editor window.</li>
  <li><strong>Select Desired Case:</strong> Click any case button (e.g., <em>Title Case</em>, <em>UPPERCASE</em>, <em>lowercase</em>, or <em>camelCase</em>) to transform the text instantly.</li>
  <li><strong>Inspect Metrics & Copy:</strong> Check live word, character, and reading time stats, then click <em>Copy</em> to grab your converted text.</li>
</ol>

<h2>Guide to Text Case Formats</h2>
<p>Choose the exact formatting style needed for your writing or programming project:</p>
<ul>
  <li><strong>Sentence case:</strong> Capitalizes the first letter of each sentence and lowers everything else, perfect for restoring text accidentally typed with Caps Lock on.</li>
  <li><strong>Title Case:</strong> Capitalizes major words according to standard publishing style guides, ideal for book titles, blog headlines, and email subject lines.</li>
  <li><strong>UPPERCASE:</strong> Converts all letters to capital letters (e.g., <code>HELLO WORLD</code>), great for urgent warnings, headers, and acronyms.</li>
  <li><strong>lowercase:</strong> Converts all characters to small letters (e.g., <code>hello world</code>), useful for normalizing email addresses and usernames.</li>
  <li><strong>camelCase:</strong> Lowercases the first word and capitalizes subsequent words with no spaces (e.g., <code>iPhone</code>, <code>getUserProfile</code>), the standard for JavaScript and TypeScript variables.</li>
  <li><strong>PascalCase:</strong> Capitalizes the first letter of every word with no spaces (e.g., <code>UserProfileCard</code>), standard for React components and C#/Java class names.</li>
  <li><strong>snake_case:</strong> Connects lowercase words with underscores (e.g., <code>database_column_name</code>), standard for Python, SQL, and database columns.</li>
  <li><strong>kebab-case:</strong> Connects lowercase words with hyphens (e.g., <code>seo-friendly-url-slug</code>), essential for clean URLs and CSS class selectors.</li>
</ul>

<h2>Why Accurate Word and Character Counting Matters</h2>
<p>Character limits dictate communication across modern digital platforms:</p>
<ul>
  <li><strong>Social Media Posts:</strong> Ensure your tweets stay under Twitter/X's 280-character limit, Instagram captions remain within optimal 125-character preview limits, and LinkedIn updates stay concise.</li>
  <li><strong>SEO Meta Descriptions:</strong> Keep your meta descriptions between 140 and 160 characters so Google displays them without truncation.</li>
  <li><strong>Academic & Editorial Writing:</strong> Stay precisely within essay constraints, admissions application character limits, and abstract length guidelines.</li>
</ul>
`
  }
];
