"use client";

import DOMPurify from "isomorphic-dompurify";
import parse from "html-react-parser";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  html: string;
  isMarkdown?: boolean;
}

export default function HtmlRenderer({ html, isMarkdown = false }: Props) {
  const cleanHtml = DOMPurify.sanitize(html);
  if (isMarkdown) {
    return (
      <div className="rounded-md bg-card p-4">
        <Markdown remarkPlugins={[remarkGfm]}>{cleanHtml}</Markdown>
      </div>
    );
  }

  return <div className="rounded-md bg-card p-4">{parse(cleanHtml)}</div>;
}