import { writeFile, readFile, mkdir, rm } from 'fs/promises';
import { execFile } from 'child_process';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { generateMenuTex } from '../templates/menu.tex.js';

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

export async function generateMenuPdf(menu: MenuData): Promise<Buffer> {
  const workDir = join(tmpdir(), `dona-pdf-${randomUUID()}`);
  await mkdir(workDir, { recursive: true });

  const texPath = join(workDir, 'menu.tex');
  const pdfPath = join(workDir, 'menu.pdf');

  try {
    const tex = generateMenuTex(menu);
    await writeFile(texPath, tex, 'utf-8');

    await new Promise<void>((resolve, reject) => {
      const proc = execFile(
        'lualatex',
        ['-interaction=nonstopmode', '-halt-on-error', 'menu.tex'],
        { cwd: workDir, timeout: 10000 },
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });

    const pdf = await readFile(pdfPath);
    return pdf;
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function isLatexAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    execFile('lualatex', ['--version'], (error) => {
      resolve(!error);
    });
  });
}
