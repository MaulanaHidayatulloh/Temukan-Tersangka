import React from "react";

function formatInline(text, keyPrefix) {
  const token = /(\*\*[^*]+\*\*|(?<!\*)\*[^*\n]+\*(?!\*)|__[^_]+__|`[^`]+`)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let index = 0;

  while ((match = token.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        text.slice(lastIndex, match.index).replace(/\\([*_`])/g, "$1"),
      );
    }

    const value = match[0];
    if (value.startsWith("**") || value.startsWith("__")) {
      parts.push(
        <strong key={`${keyPrefix}-${index++}`}>{value.slice(2, -2)}</strong>,
      );
    } else if (value.startsWith("`")) {
      parts.push(
        <code key={`${keyPrefix}-${index++}`}>{value.slice(1, -1)}</code>,
      );
    } else {
      // Model kadang memakai *teks* untuk penekanan; tampilkan sebagai tebal agar konsisten.
      parts.push(
        <strong key={`${keyPrefix}-${index++}`}>{value.slice(1, -1)}</strong>,
      );
    }
    lastIndex = token.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex).replace(/\\([*_`])/g, "$1"));
  }
  return parts;
}

export default function MarkdownText({ children, className = "" }) {
  const source = String(children ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/\\\*/g, "*");
  const lines = source.split("\n");
  const blocks = [];
  let paragraph = [];
  let list = [];
  let key = 0;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(
        <p key={`p-${key++}`}>
          {paragraph.map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {formatInline(line, `p-${key}-${i}`)}
            </React.Fragment>
          ))}
        </p>,
      );
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={`ul-${key++}`}>
          {list.map((item, i) => (
            <li key={i}>{formatInline(item, `li-${key}-${i}`)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    const bullet = trimmed.match(/^(?:[-•]|\d+[.)])\s+(.+)$/);

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }
    if (heading) {
      flushParagraph();
      flushList();
      const Tag =
        heading[1].length === 1 ? "h3" : heading[1].length === 2 ? "h4" : "h5";
      blocks.push(
        <Tag key={`h-${key++}`}>{formatInline(heading[2], `h-${key}`)}</Tag>,
      );
      return;
    }
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      return;
    }
    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();

  return <div className={`markdown-ai ${className}`.trim()}>{blocks}</div>;
}
