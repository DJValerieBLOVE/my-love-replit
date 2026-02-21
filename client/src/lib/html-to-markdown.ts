export function htmlToMarkdown(html: string): string {
  if (!html) return "";

  let md = html;

  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, (_, content) => `# ${stripTags(content)}\n\n`);
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, (_, content) => `## ${stripTags(content)}\n\n`);
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, (_, content) => `### ${stripTags(content)}\n\n`);

  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");
  md = md.replace(/<u[^>]*>(.*?)<\/u>/gi, "$1");
  md = md.replace(/<s[^>]*>(.*?)<\/s>/gi, "~~$1~~");
  md = md.replace(/<strike[^>]*>(.*?)<\/strike>/gi, "~~$1~~");
  md = md.replace(/<del[^>]*>(.*?)<\/del>/gi, "~~$1~~");

  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");

  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)");
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, "![]($1)");

  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, code) => {
    return "\n```\n" + decodeHtmlEntities(code.trim()) + "\n```\n\n";
  });
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");

  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
    const cleaned = stripTags(content).trim();
    return cleaned.split("\n").map((line: string) => `> ${line}`).join("\n") + "\n\n";
  });

  md = md.replace(/<hr[^>]*\/?>/gi, "\n---\n\n");

  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, items) => {
    return items.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, content: string) => {
      return `- ${stripTags(content).trim()}\n`;
    }) + "\n";
  });

  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, items) => {
    let index = 0;
    return items.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, content: string) => {
      index++;
      return `${index}. ${stripTags(content).trim()}\n`;
    }) + "\n";
  });

  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
    const rows: string[][] = [];
    const rowMatches = tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];

    for (const row of rowMatches) {
      const cells: string[] = [];
      const cellMatches = row.match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [];
      for (const cell of cellMatches) {
        const content = cell.replace(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/i, "$1");
        cells.push(stripTags(content).trim());
      }
      rows.push(cells);
    }

    if (rows.length === 0) return "";

    let result = "";
    const header = rows[0];
    result += "| " + header.join(" | ") + " |\n";
    result += "| " + header.map(() => "---").join(" | ") + " |\n";

    for (let i = 1; i < rows.length; i++) {
      result += "| " + rows[i].join(" | ") + " |\n";
    }

    return result + "\n";
  });

  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, content) => {
    const cleaned = content.trim();
    if (!cleaned || cleaned === "<br>" || cleaned === "<br/>") return "\n";
    return cleaned + "\n\n";
  });

  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, "$1\n");
  md = md.replace(/<[^>]+>/g, "");
  md = decodeHtmlEntities(md);
  md = md.replace(/\n{3,}/g, "\n\n");
  md = md.trim();

  return md;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}
