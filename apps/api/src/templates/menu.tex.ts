interface MenuItem {
  name: string;
  description: string | null;
  price: string | null;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuData {
  title: string;
  description: string | null;
  sections: MenuSection[];
}

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[&%$#_{}]/g, (m) => `\\${m}`)
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (isNaN(num)) return escapeLatex(price);
  return `\\$${num.toFixed(2)}`;
}

export function generateMenuTex(menu: MenuData): string {
  const title = escapeLatex(menu.title);
  const description = menu.description ? escapeLatex(menu.description) : '';

  const sectionsLatex = menu.sections
    .map((section) => {
      const sectionTitle = escapeLatex(section.title);
      const itemsLatex = section.items
        .map((item) => {
          const name = escapeLatex(item.name);
          const desc = item.description ? escapeLatex(item.description) : '';
          const price = item.price ? formatPrice(item.price) : '';

          let line = `\\textbf{${name}}`;
          if (price) line += ` \\dotfill ${price}`;
          if (desc) line += `\n\n{\\small\\color{gray} ${desc}}`;
          return line;
        })
        .join('\n\n\\vspace{4pt}\n\n');

      return `\\subsection*{${sectionTitle}}\n\\vspace{2pt}\n\\hrule\n\\vspace{8pt}\n${itemsLatex}`;
    })
    .join('\n\n\\vspace{16pt}\n\n');

  return `\\documentclass[11pt,a4paper]{article}
\\usepackage{fontspec}
\\usepackage{geometry}
\\usepackage{titlesec}
\\usepackage{xcolor}
\\usepackage{parskip}

\\geometry{margin=1in}
\\setmainfont{Latin Modern Roman}
\\pagestyle{empty}

\\titleformat{\\subsection}[block]{\\normalfont\\scshape\\small\\bfseries}{}{0em}{}
\\titlespacing{\\subsection}{0pt}{12pt}{4pt}

\\begin{document}

\\begin{center}
{\\LARGE\\bfseries ${title}}

${description ? `\\vspace{4pt}\n{\\itshape ${description}}` : ''}
\\end{center}

\\vspace{16pt}

${sectionsLatex}

\\end{document}
`;
}
