import { useEffect, useRef, useState } from 'react';

type Pm = 'npm' | 'pnpm' | 'yarn' | 'bun';
const PMS: Pm[] = ['npm', 'pnpm', 'yarn', 'bun'];
const PM_PREFIX: Record<Pm, string> = {
  npm: 'npx ',
  pnpm: 'pnpm dlx ',
  yarn: 'yarn dlx ',
  bun: 'bunx ',
};

export interface CodeBlockProps {
  code: string;
  filename?: string;
  language?: 'bash' | 'tsx' | 'json' | 'css' | 'text';
  /** Show the npm/pnpm/yarn/bun selector; `code` is the bare command after the PM prefix. */
  packageManager?: boolean;
  showLineNumbers?: boolean;
  className?: string;
}

/* Monochrome highlighting only: keywords bold, strings regular, comments dim. */
/* NOTE: the /g flags are MANDATORY — without them exec() ignores lastIndex and the
   tokenize loop below never terminates (infinite allocation during render). */
const KEYWORDS: Record<string, RegExp> = {
  tsx: /\b(import|export|const|let|var|function|return|default|interface|type|from|as|extends|implements|readonly|for|of|in|if|else|switch|case|break|new|typeof|keyof|number|string|boolean|void|null|undefined|true|false)\b/g,
  bash: /\b(npx|pnpm|yarn|bunx|npm|n|shadcn@latest|add|install|cd|git|node)\b/g,
  css: /(@media|@import|@keyframes|:root|from|to)/g,
  json: /^"[^"]+"(?=\s*:)/g,
};

interface Token {
  text: string;
  cls: 'k' | 's' | 'c' | null;
}

function tokenizeLine(line: string, lang: string): Token[] {
  const tokens: Token[] = [];
  const re =
    /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const kw = KEYWORDS[lang];
  const pushPlain = (text: string) => {
    if (!text) return;
    if (!kw) {
      tokens.push({ text, cls: null });
      return;
    }
    let l2 = 0;
    kw.lastIndex = 0;
    let km: RegExpExecArray | null;
    while ((km = kw.exec(text))) {
      if (km.index > l2) tokens.push({ text: text.slice(l2, km.index), cls: null });
      tokens.push({ text: km[0], cls: 'k' });
      l2 = km.index + km[0].length;
    }
    if (l2 < text.length) tokens.push({ text: text.slice(l2), cls: null });
  };
  while ((m = re.exec(line))) {
    if (m.index > last) pushPlain(line.slice(last, m.index));
    tokens.push({ text: m[0], cls: m[1] !== undefined ? 'c' : 's' });
    last = m.index + m[0].length;
  }
  if (last < line.length) pushPlain(line.slice(last));
  return tokens;
}

export async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

export default function CodeBlock({
  code,
  filename,
  language = 'text',
  packageManager = false,
  showLineNumbers = true,
  className,
}: CodeBlockProps) {
  const [pm, setPm] = useState<Pm>('npm');
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const shown = packageManager ? `${PM_PREFIX[pm]}${code}` : code;
  const lines = shown.split('\n');

  const onCopy = async () => {
    await copyText(shown);
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className={`border border-hexl-fg bg-hexl-bg text-hexl-fg${className ? ` ${className}` : ''}`}>
      <div className={`flex min-h-11 items-stretch justify-between border-b border-hexl-fg${packageManager ? ' flex-col sm:h-11 sm:flex-row' : ''}`}>
        <div className={`flex min-h-11 items-center gap-3 font-mono text-mono-micro uppercase${packageManager ? ' w-full sm:w-auto sm:px-3' : ' min-w-0 px-3'}`}>
          {packageManager ? (
            <div className="flex min-h-11 w-full items-stretch sm:w-auto" role="group" aria-label="Package manager">
              {PMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={pm === p}
                  onClick={() => setPm(p)}
                  className={`min-h-11 flex-1 border-r border-hexl-fg px-3 font-mono text-mono-label uppercase first:border-l sm:flex-none${
                    pm === p ? ' bg-hexl-fg text-hexl-bg' : ''
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          ) : (
            <span>{filename ?? 'SOURCE'}</span>
          )}
        </div>
        <button
          type="button"
          onClick={onCopy}
          className={`min-h-11 border-l border-hexl-fg px-4 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg${packageManager ? ' w-full border-l-0 border-t sm:w-auto sm:border-l sm:border-t-0' : ''}`}
          aria-live="polite"
        >
          {copied ? 'COPIED' : 'COPY'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-mono-data">
        <code>
          {lines.map((line, i) => (
            <span key={i} className="flex min-w-max">
              {showLineNumbers && (
                <span aria-hidden="true" className="w-8 shrink-0 select-none pr-3 text-right opacity-[0.55]">
                  {i + 1}
                </span>
              )}
              <span>
                {tokenizeLine(line, language === 'text' ? 'text' : language).map((t: Token, j: number) =>
                  t.cls === 'k' ? (
                    <strong key={j} className="font-bold">
                      {t.text}
                    </strong>
                  ) : t.cls === 'c' ? (
                    <span key={j} className="opacity-[0.55]">
                      {t.text}
                    </span>
                  ) : (
                    <span key={j}>{t.text}</span>
                  ),
                )}
                {line === '' ? ' ' : null}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
