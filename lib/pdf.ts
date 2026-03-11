import { CVData } from '../types';

export function sanitizeFilename(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-]/g, '');
}

export function getCVFilename(data: Partial<CVData>): string {
  const name = data.fullName ? sanitizeFilename(data.fullName) : 'CV';
  return `${name}_doc.pdf`;
}

function normalizeOkLabColors(element: HTMLElement) {
  const nodes: HTMLElement[] = [element, ...Array.from(element.querySelectorAll<HTMLElement>('*'))];
  const colorKeys = [
    'color',
    'background-color',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'outline-color',
    'text-decoration-color',
    'box-shadow',
    'text-shadow'
  ];

  nodes.forEach((node) => {
    const computedStyle = window.getComputedStyle(node);
    colorKeys.forEach((key) => {
      const value = computedStyle.getPropertyValue(key);
      if (/oklab|oklch/i.test(value)) {
        // set computed value (likely converted to rgb/rgba) as inline style
        const normalized = computedStyle.getPropertyValue(key);
        node.style.setProperty(key, normalized);
      }
    });
  });
}

export async function downloadCVPdf(element: HTMLElement, filename: string): Promise<void> {
  if (!element) {
    throw new Error('PDF element is missing');
  }

  normalizeOkLabColors(element);

  try {
    // @ts-ignore - html2pdf types aren't complete
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default || html2pdfModule;

    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
