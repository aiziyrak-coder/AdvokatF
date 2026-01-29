import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Worker from node_modules — Vite resolves it; no CDN, no CORS, no 404
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

/** Sahifada shuncha belgidan kam matn bo'lsa, sahifa rasm/skan deb hisoblanib OCR ishlatiladi */
const MIN_TEXT_PER_PAGE_FOR_SKIP_OCR = 80;
const MAX_OCR_PAGES = 25;
const OCR_SCALE = 2.5;
/** Tesseract tillar: eng, rus (kirill). uzb mavjud bo'lsa avtomatik qo'shiladi */
const OCR_LANGS_PRIMARY = 'eng+rus';
const OCR_LANGS_WITH_UZB = 'eng+rus+uzb';

export const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = Math.min(pdf.numPages, MAX_OCR_PAGES);
        const pageTexts: string[] = [];

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ')
                .trim();
            const textLen = pageText.replace(/\s+/g, '').length;

            // Agar sahifada matn yetarli bo'lsa – faqat shuni ishlatamiz
            if (textLen >= MIN_TEXT_PER_PAGE_FOR_SKIP_OCR) {
                pageTexts.push(`--- Page ${i} ---\n${pageText}\n\n`);
                continue;
            }

            // Sahifa rasm/skan – OCR qilamiz (rasmli PDF ichidagi ismlar shu orqali chiqadi)
            const viewport = page.getViewport({ scale: OCR_SCALE });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) {
                if (pageText) pageTexts.push(`--- Page ${i} ---\n${pageText}\n\n`);
                continue;
            }

            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: context, viewport }).promise;

            const dataUrl = canvas.toDataURL('image/png');
            try {
                let result: { data?: { text?: string } } | null = null;
                try {
                    result = await Tesseract.recognize(dataUrl, OCR_LANGS_WITH_UZB, { logger: () => {} });
                } catch (_) {
                    result = await Tesseract.recognize(dataUrl, OCR_LANGS_PRIMARY, { logger: () => {} });
                }
                const ocrText = result?.data?.text?.trim() || '';
                if (ocrText) {
                    pageTexts.push(`--- Page ${i} (OCR) ---\n${ocrText}\n\n`);
                } else if (pageText) {
                    pageTexts.push(`--- Page ${i} ---\n${pageText}\n\n`);
                }
            } catch (ocrError) {
                if (pageText) pageTexts.push(`--- Page ${i} ---\n${pageText}\n\n`);
            }
        }

        const combined = pageTexts.join('').trim();
        if (!combined) {
            throw new Error("PDF dan matn o'qib bo'lmadi (matn + OCR). Rasmli sahifalar bo'lsa, OCR ishlatildi.");
        }
        return combined;
    } catch (error) {
        console.error("Error extracting PDF text (with OCR fallback):", error);
        throw new Error("PDF dan matn o'qishda xatolik yuz berdi.");
    }
};
