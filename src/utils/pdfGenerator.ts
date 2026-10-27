import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface PDFGenerationOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  scale?: number;
  quality?: number;
  marginMm?: number;
}

/**
 * Ensures all <img> elements inside a container are decoded and ready before html2canvas runs.
 */
async function waitForImagesInElement(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    images.map(
      img =>
        new Promise<void>(resolve => {
          if (img.complete && img.naturalHeight !== 0) {
            resolve();
            return;
          }
          const onDone = () => {
            img.removeEventListener('load', onDone);
            img.removeEventListener('error', onDone);
            resolve();
          };
          img.addEventListener('load', onDone);
          img.addEventListener('error', onDone);
          setTimeout(onDone, 2500);
        })
    )
  );
}

/**
 * Filter function that excludes interactive editor controls, toolbars, and popovers from PDF output.
 */
function shouldIgnoreElementForPDF(el: Element): boolean {
  if (!el) return false;
  if (el.hasAttribute && el.hasAttribute('data-html2canvas-ignore')) return true;
  if (el.classList && el.classList.contains('print:hidden')) return true;
  return false;
}

/**
 * Downloads any DOM element as a crisp, high-resolution A4 PDF file.
 * Handles images, custom fonts, borders, and margins cleanly.
 */
export async function downloadElementAsPDF(
  elementOrId: HTMLElement | string,
  options: PDFGenerationOptions = {}
): Promise<boolean> {
  const {
    filename = 'KYPAS_Solar_Document',
    orientation = 'portrait',
    scale = 2,
    marginMm = 0,
  } = options;

  try {
    let targetElement: HTMLElement | null = null;
    if (typeof elementOrId === 'string') {
      targetElement = document.querySelector(elementOrId) as HTMLElement;
    } else {
      targetElement = elementOrId;
    }

    if (!targetElement) {
      console.error('Target element for PDF download not found:', elementOrId);
      return false;
    }

    await waitForImagesInElement(targetElement);

    const canvas = await html2canvas(targetElement, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      ignoreElements: shouldIgnoreElementForPDF,
      onclone: (_doc, clonedEl) => {
        clonedEl.style.transform = 'none';
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.96);

    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = orientation === 'portrait' ? 210 : 297;
    const pdfHeight = orientation === 'portrait' ? 297 : 210;
    const printableWidth = pdfWidth - marginMm * 2;
    const printableHeight = pdfHeight - marginMm * 2;

    const imgWidth = printableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = marginMm;

    pdf.addImage(imgData, 'JPEG', marginMm, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= printableHeight;

    while (heightLeft > 5) {
      position = heightLeft - imgHeight + marginMm;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', marginMm, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= printableHeight;
    }

    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
    return true;
  } catch (error) {
    console.error('Error generating PDF with html2canvas:', error);
    window.print();
    return false;
  }
}

/**
 * Downloads multiple discrete A4 DOM pages into a unified, crisp multi-page PDF.
 * Captures each page individually at exact 794x1123 A4 dimensions so headers, footers,
 * and tables are never sliced across margins and interactive UI controls are stripped.
 */
export async function downloadPagesAsPDF(
  pageSelectorOrElements: string | HTMLElement[],
  options: PDFGenerationOptions = {}
): Promise<boolean> {
  const {
    filename = 'KYPAS_Solar_Quotation',
    orientation = 'portrait',
    scale = 2,
    marginMm = 0,
  } = options;

  try {
    let pages: HTMLElement[] = [];
    if (typeof pageSelectorOrElements === 'string') {
      pages = Array.from(document.querySelectorAll(pageSelectorOrElements));
    } else {
      pages = pageSelectorOrElements;
    }

    if (!pages || pages.length === 0) {
      console.warn('No discrete pages found matching selector, falling back to downloadElementAsPDF');
      return downloadElementAsPDF(pageSelectorOrElements as any, options);
    }

    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = orientation === 'portrait' ? 210 : 297;
    const pdfHeight = orientation === 'portrait' ? 297 : 210;
    const printableWidth = pdfWidth - marginMm * 2;
    const printableHeight = pdfHeight - marginMm * 2;

    for (let i = 0; i < pages.length; i++) {
      const pageEl = pages[i];
      if (i > 0) {
        pdf.addPage('a4', orientation);
      }

      await waitForImagesInElement(pageEl);

      const canvas = await html2canvas(pageEl, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        height: 1123,
        windowWidth: 1200,
        ignoreElements: shouldIgnoreElementForPDF,
        onclone: (_doc, clonedPage) => {
          clonedPage.style.transform = 'none';
          clonedPage.style.width = '794px';
          clonedPage.style.height = '1123px';
          clonedPage.style.minHeight = '1123px';
          clonedPage.style.margin = '0';
          clonedPage.style.boxShadow = 'none';
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      pdf.addImage(imgData, 'JPEG', marginMm, marginMm, printableWidth, printableHeight, undefined, 'FAST');
    }

    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
    return true;
  } catch (error) {
    console.error('Error generating multi-page PDF:', error);
    window.print();
    return false;
  }
}
