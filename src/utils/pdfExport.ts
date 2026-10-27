import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PdfExportOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  scale?: number;
  marginMm?: number;
}

export async function exportElementToPdf(
  selectorOrElement: string | HTMLElement,
  options: PdfExportOptions = {}
): Promise<boolean> {
  const {
    filename = 'KYPAS_Solar_Quotation',
    orientation = 'portrait',
    scale = 2,
    marginMm = 6,
  } = options;

  try {
    const el =
      typeof selectorOrElement === 'string'
        ? (document.querySelector(selectorOrElement) as HTMLElement | null)
        : selectorOrElement;

    if (!el) {
      console.warn('Target element for PDF export not found:', selectorOrElement);
      window.print();
      return false;
    }

    const canvas = await html2canvas(el, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: el.scrollWidth || 1024,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = orientation === 'portrait' ? 210 : 297;
    const pageHeight = orientation === 'portrait' ? 297 : 210;
    const printWidth = pageWidth - marginMm * 2;
    const printHeight = pageHeight - marginMm * 2;

    const imgHeight = (canvas.height * printWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = marginMm;

    pdf.addImage(imgData, 'JPEG', marginMm, position, printWidth, imgHeight, undefined, 'FAST');
    heightLeft -= printHeight;

    while (heightLeft > 5) {
      position = heightLeft - imgHeight + marginMm;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', marginMm, position, printWidth, imgHeight, undefined, 'FAST');
      heightLeft -= printHeight;
    }

    const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(safeFilename);
    return true;
  } catch (err) {
    console.error('Error generating PDF with html2canvas:', err);
    window.print();
    return false;
  }
}
