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
    scale = 2, // 2x scale for crisp retina typography
    marginMm = 8,
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

    // Capture element with html2canvas
    const canvas = await html2canvas(targetElement, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: targetElement.scrollWidth || 1024,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Initialize jsPDF with standard A4
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

    // Handle single or multi-page
    let heightLeft = imgHeight;
    let position = marginMm;

    // First page
    pdf.addImage(imgData, 'JPEG', marginMm, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= printableHeight;

    // Add extra pages if content overflows A4 height
    while (heightLeft > 5) {
      position = heightLeft - imgHeight + marginMm;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', marginMm, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= printableHeight;
    }

    // Trigger direct browser file download
    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
    return true;
  } catch (error) {
    console.error('Error generating PDF with html2canvas:', error);
    // Fallback: If canvas render fails, attempt iframe/window print
    window.print();
    return false;
  }
}
