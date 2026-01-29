import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Worker from node_modules — Vite resolves it; no CDN, no CORS, no 404
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

const MIN_TEXT_CHAR_THRESHOLD = 200;
const MAX_OCR_PAGES = 20;

export const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        // 1) Avval pdf.js orqali mavjud matnni o'qib ko'ramiz
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            if (pageText.trim()) {
                fullText += `--- Page ${i} ---\n${pageText}\n\n`;
            }
        }

        const nonWhitespaceChars = fullText.replace(/\s+/g, '').length;
        if (nonWhitespaceChars >= MIN_TEXT_CHAR_THRESHOLD) {
            // Yetarli matn bor – odatdagi pipeline uchun shu yetadi
            return fullText;
        }

        // 2) Agar matn juda kam bo'lsa, bu ehtimol skanerlangan PDF.
        //    Shunda Tesseract.js yordamida OCR qilib ko'ramiz.
        let ocrText = '';
        const totalPages = pdf.numPages;
        const pagesToProcess = Math.min(totalPages, MAX_OCR_PAGES);

        for (let i = 1; i <= pagesToProcess; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2 }); // biroz yuqori sifat

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) continue;

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport }).promise;

            const dataUrl = canvas.toDataURL('image/png');
            try {
                const result = await Tesseract.recognize(
                    dataUrl,
                    'eng+rus', // asosiy tillar; kerak bo'lsa keyin kengaytirish mumkin
                    { logger: () => {} }
                );
                if (result.data && result.data.text) {
                    ocrText += `--- OCR Page ${i} ---\n${result.data.text}\n\n`;
                }
            } catch (ocrError) {
                console.error(`OCR failed for page ${i}:`, ocrError);
            }
        }

        const combined = (fullText + '\n' + ocrText).trim();
        if (!combined) {
            throw new Error("PDF dan matn o'qib bo'lmadi (odatdagi va OCR usullari).");
        }
        return combined;
    } catch (error) {
        console.error("Error extracting PDF text (with OCR fallback):", error);
        throw new Error("PDF dan matn o'qishda xatolik yuz berdi.");
    }
};
