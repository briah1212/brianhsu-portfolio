import type { CodeLanguage } from "./codeFiles";

export type TokenType =
  | "plain"
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "function"
  | "property"
  | "tag"
  | "attr"
  | "boolean"
  | "punct"
  | "decorator"
  | "heading"
  | "link";

export interface Token {
  type: TokenType;
  text: string;
}

interface Rule {
  type: TokenType;
  re: RegExp;
  /** Reclassify a match based on surrounding source */
  classify?: (match: string, code: string, end: number) => TokenType;
}

/**
 * Generic sticky-regex scanner. Tries rules in order at each position;
 * unmatched characters accumulate into plain tokens.
 */
function scan(code: string, rules: Rule[]): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let plainStart = 0;

  const flushPlain = (until: number) => {
    if (plainStart < until) {
      tokens.push({ type: "plain", text: code.slice(plainStart, until) });
    }
  };

  outer: while (i < code.length) {
    for (const rule of rules) {
      rule.re.lastIndex = i;
      const match = rule.re.exec(code);
      if (match && match[0].length > 0) {
        flushPlain(i);
        const end = i + match[0].length;
        const type = rule.classify
          ? rule.classify(match[0], code, end)
          : rule.type;
        tokens.push({ type, text: match[0] });
        i = end;
        plainStart = i;
        continue outer;
      }
    }
    i++;
  }
  flushPlain(code.length);
  return tokens;
}

function keywordClassifier(
  keywords: Set<string>,
  literals: Set<string>
): NonNullable<Rule["classify"]> {
  return (match, code, end) => {
    if (literals.has(match)) return "boolean";
    if (keywords.has(match)) return "keyword";
    if (/^\s*\(/.test(code.slice(end))) return "function";
    return "plain";
  };
}

const PYTHON_KEYWORDS = new Set([
  "def", "class", "return", "if", "elif", "else", "for", "while", "in",
  "import", "from", "as", "with", "try", "except", "finally", "raise",
  "lambda", "pass", "break", "continue", "not", "and", "or", "is", "yield",
  "global", "nonlocal", "assert", "del", "async", "await", "self",
]);
const PYTHON_LITERALS = new Set(["None", "True", "False"]);

const PYTHON_RULES: Rule[] = [
  { type: "comment", re: /#[^\n]*/y },
  { type: "string", re: /(?:"""[\s\S]*?(?:"""|$))|(?:'''[\s\S]*?(?:'''|$))/y },
  { type: "string", re: /[rbf]?"(?:[^"\\\n]|\\.)*"|[rbf]?'(?:[^'\\\n]|\\.)*'/y },
  { type: "decorator", re: /@[\w.]+/y },
  {
    type: "plain",
    re: /[A-Za-z_]\w*/y,
    classify: keywordClassifier(PYTHON_KEYWORDS, PYTHON_LITERALS),
  },
  { type: "number", re: /\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y },
  { type: "punct", re: /[{}[\]()<>=+\-*/%!:;,.|&^~]+/y },
];

const JSON_RULES: Rule[] = [
  {
    type: "string",
    re: /"(?:[^"\\]|\\.)*"/y,
    classify: (match, code, end) =>
      /^\s*:/.test(code.slice(end)) ? "property" : "string",
  },
  {
    type: "plain",
    re: /[A-Za-z_]\w*/y,
    classify: (match) =>
      match === "true" || match === "false" || match === "null"
        ? "boolean"
        : "plain",
  },
  { type: "number", re: /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y },
  { type: "punct", re: /[{}[\]:,]+/y },
];

const CSS_UNITS = "px|rem|em|%|s|ms|vh|vw|vmin|vmax|fr|deg|ch";

const CSS_RULES: Rule[] = [
  { type: "comment", re: /\/\*[\s\S]*?(?:\*\/|$)/y },
  { type: "string", re: /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/y },
  { type: "keyword", re: /@[\w-]+/y },
  { type: "number", re: /#[0-9a-fA-F]{3,8}\b/y },
  {
    type: "property",
    re: /-{0,2}[a-zA-Z][\w-]*(?=\s*:)/y,
    // `a:hover {` is a selector with a pseudo-class, not a declaration
    classify: (match, code, end) =>
      /^\s*::?[\w-]+(?:\([^)\n]*\))?\s*[,{]/.test(code.slice(end))
        ? "tag"
        : "property",
  },
  { type: "number", re: new RegExp(`-?\\d+(?:\\.\\d+)?(?:${CSS_UNITS})?`, "y") },
  { type: "punct", re: /[{}();:,]+/y },
];

function tokenizePython(code: string): Token[] {
  return scan(code, PYTHON_RULES);
}

function tokenizeJson(code: string): Token[] {
  return scan(code, JSON_RULES);
}

function tokenizeCss(code: string): Token[] {
  return scan(code, CSS_RULES);
}

/** Small state machine: text nodes vs inside-a-tag attribute soup. */
function tokenizeHtml(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let plainStart = 0;

  const flushPlain = (until: number) => {
    if (plainStart < until) {
      tokens.push({ type: "plain", text: code.slice(plainStart, until) });
    }
  };

  const COMMENT = /<!--[\s\S]*?(?:-->|$)/y;
  const DOCTYPE = /<!DOCTYPE[^>]*>/iy;
  const TAG_OPEN = /<\/?[a-zA-Z][\w-]*/y;
  const ATTR = /[a-zA-Z_:][\w:.-]*/y;
  const STRING = /"[^"]*"|'[^']*'/y;
  const TAG_CLOSE = /\/?>/y;

  while (i < code.length) {
    COMMENT.lastIndex = i;
    DOCTYPE.lastIndex = i;
    TAG_OPEN.lastIndex = i;

    let match = COMMENT.exec(code);
    if (match) {
      flushPlain(i);
      tokens.push({ type: "comment", text: match[0] });
      i += match[0].length;
      plainStart = i;
      continue;
    }

    match = DOCTYPE.exec(code);
    if (match) {
      flushPlain(i);
      tokens.push({ type: "keyword", text: match[0] });
      i += match[0].length;
      plainStart = i;
      continue;
    }

    match = TAG_OPEN.exec(code);
    if (match) {
      flushPlain(i);
      tokens.push({ type: "tag", text: match[0] });
      i += match[0].length;

      // Attribute soup until the tag closes
      while (i < code.length) {
        TAG_CLOSE.lastIndex = i;
        ATTR.lastIndex = i;
        STRING.lastIndex = i;

        const close = TAG_CLOSE.exec(code);
        if (close) {
          tokens.push({ type: "tag", text: close[0] });
          i += close[0].length;
          break;
        }
        const str = STRING.exec(code);
        if (str) {
          tokens.push({ type: "string", text: str[0] });
          i += str[0].length;
          continue;
        }
        const attr = ATTR.exec(code);
        if (attr) {
          tokens.push({ type: "attr", text: attr[0] });
          i += attr[0].length;
          continue;
        }
        tokens.push({ type: "punct", text: code[i] });
        i++;
      }
      plainStart = i;
      continue;
    }

    i++;
  }
  flushPlain(code.length);
  return tokens;
}

/** Line-oriented markdown highlighting; block context handled per line. */
function tokenizeMarkdown(code: string): Token[] {
  const tokens: Token[] = [];
  const lines = code.split("\n");
  let inFence = false;

  const INLINE = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\[[^\]\n]*\]\([^)\n]*\))/g;

  lines.forEach((line, index) => {
    const push = (type: TokenType, text: string) => {
      if (text) tokens.push({ type, text });
    };

    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      push("string", line);
    } else if (inFence) {
      push("string", line);
    } else if (/^#{1,6}\s/.test(line)) {
      push("heading", line);
    } else if (/^\s*>/.test(line)) {
      push("comment", line);
    } else {
      let rest = line;
      const bullet = /^(\s*(?:[-*+]|\d+\.)\s+)(\[[ x]\]\s+)?/.exec(line);
      if (bullet) {
        push("punct", bullet[1]);
        if (bullet[2]) push("boolean", bullet[2]);
        rest = line.slice(bullet[0].length);
      }

      let last = 0;
      INLINE.lastIndex = 0;
      for (let m = INLINE.exec(rest); m; m = INLINE.exec(rest)) {
        push("plain", rest.slice(last, m.index));
        if (m[1]) push("string", m[1]);
        else if (m[2]) push("keyword", m[2]);
        else push("link", m[3]);
        last = m.index + m[0].length;
      }
      push("plain", rest.slice(last));
    }

    if (index < lines.length - 1) {
      tokens.push({ type: "plain", text: "\n" });
    }
  });

  return tokens;
}

function tokenizePlain(code: string): Token[] {
  const tokens: Token[] = [];
  for (const part of code.split(/(^#[^\n]*$)/m)) {
    if (!part) continue;
    tokens.push({
      type: part.startsWith("#") ? "comment" : "plain",
      text: part,
    });
  }
  return tokens;
}

export function tokenize(code: string, language: CodeLanguage): Token[] {
  switch (language) {
    case "python":
      return tokenizePython(code);
    case "json":
      return tokenizeJson(code);
    case "css":
      return tokenizeCss(code);
    case "html":
      return tokenizeHtml(code);
    case "markdown":
      return tokenizeMarkdown(code);
    default:
      return tokenizePlain(code);
  }
}

export const LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  json: "JSON",
  python: "Python",
  html: "HTML",
  css: "CSS",
  markdown: "Markdown",
  plain: "Plain Text",
};
