
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type {
  DebateResult,
  ChatMessage,
  CaseFile,
  SuggestedParticipant,
  CaseParticipant,
  CrossExaminationQuestion,
  Case,
  TimelineEvent,
} from "../types";

// GEMINI API kalitini to'g'ridan-to'g'ri foydalanuvchi bergan kalit bilan ishlatamiz.
// Shunda eski/suspend bo'lgan .env kalitlar aralashmaydi.
const GEMINI_API_KEY = "AIzaSyBgtfbSLet0LVZfbbyO1SHo_9CwUOrISfU";

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI API kaliti topilmadi. Iltimos, VITE_GEMINI_API_KEY ni .env faylida sozlang.");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// API key muammosini kuzatish uchun flag
let apiKeyIssueDetected = false;

// API key muammosini tekshirish funksiyasi
export const isApiKeyIssueDetected = (): boolean => {
  return apiKeyIssueDetected;
};

// To'liq bo'lmagan JSON dan qismlarni extract qilish
const extractPartialJson = (jsonStr: string): any => {
    try {
        const result: any = {
            debate: [],
            summary: "",
            winProbability: 0,
            probabilityJustification: "",
            positiveFactors: [],
            negativeFactors: [],
            riskMatrix: [],
            suggestedTasks: [],
            deepDiveAnalysis: "",
            knowledgeBase: {
                keyFacts: [],
                legalIssues: [],
                applicableLaws: [],
                strengths: [],
                weaknesses: [],
                statuteOfLimitations: {
                    status: "OK",
                    summary: "",
                },
            },
        };
        
        // Debate array ni extract qilamiz
        const debateStart = jsonStr.indexOf('"debate"');
        if (debateStart !== -1) {
            const arrayStart = jsonStr.indexOf('[', debateStart);
            if (arrayStart !== -1) {
                let pos = arrayStart + 1;
                let currentItem = '';
                let depth = 0;
                let inString = false;
                let escapeNext = false;
                
                while (pos < jsonStr.length) {
                    const char = jsonStr[pos];
                    
                    if (escapeNext) {
                        currentItem += char;
                        escapeNext = false;
                        pos++;
                        continue;
                    }
                    
                    if (char === '\\') {
                        escapeNext = true;
                        currentItem += char;
                        pos++;
                        continue;
                    }
                    
                    if (char === '"') {
                        inString = !inString;
                        currentItem += char;
                    } else if (!inString) {
                        if (char === '{') {
                            depth++;
                            currentItem += char;
                        } else if (char === '}') {
                            depth--;
                            currentItem += char;
                            if (depth === 0 && currentItem.trim()) {
                                // Debate element topildi
                                try {
                                    const itemObj = JSON.parse(currentItem.trim());
                                    if (itemObj.lawyerName) {
                                        result.debate.push({
                                            lawyerName: itemObj.lawyerName,
                                            analysis: itemObj.analysis || ""
                                        });
                                    }
                                } catch (e) {
                                    // Regex bilan extract qilamiz
                                    const nameMatch = currentItem.match(/"lawyerName"\s*:\s*"([^"]+)"/);
                                    const analysisStart = currentItem.indexOf('"analysis"');
                                    if (nameMatch && analysisStart !== -1) {
                                        const analysisValue = currentItem.substring(analysisStart + 12);
                                        const analysisEnd = analysisValue.indexOf('"', 1);
                                        result.debate.push({
                                            lawyerName: nameMatch[1],
                                            analysis: analysisEnd !== -1 ? analysisValue.substring(1, analysisEnd) : analysisValue.substring(1)
                                        });
                                    }
                                }
                                currentItem = '';
                            } else {
                                currentItem += char;
                            }
                        } else if (char === ']' && depth === 0) {
                            break;
                        } else {
                            currentItem += char;
                        }
                    } else {
                        currentItem += char;
                    }
                    
                    pos++;
                }
            }
        }
        
        // Boshqa maydonlarni extract qilamiz
        const extractField = (fieldName: string, isNumber = false): any => {
            const patternStr = isNumber 
                ? `"${fieldName}"\\s*:\\s*(\\d+)`
                : `"${fieldName}"\\s*:\\s*"([^"]*)"`;
            const pattern = new RegExp(patternStr, 'g');
            const match = pattern.exec(jsonStr);
            if (match) {
                if (isNumber) {
                    return parseInt(match[1]);
                } else {
                    return match[1].replace(/^"|"$/g, '');
                }
            }
            return isNumber ? 0 : "";
        };
        
        result.summary = extractField('summary');
        result.winProbability = extractField('winProbability', true);
        result.probabilityJustification = extractField('probabilityJustification');
        result.deepDiveAnalysis = extractField('deepDiveAnalysis');
        
        console.log("Partial extract natija:", Object.keys(result).length, "key, debate:", result.debate.length);
        return result;
    } catch (e: any) {
        console.error("extractPartialJson xatosi:", e?.message);
        return {};
    }
};

const extractJson = (text: string): any => {
    if (!text || typeof text !== 'string') {
        console.warn("extractJson: text bo'sh yoki string emas");
        return {};
    }
    
    try {
        let cleanText = text.replace(/```json\n?|```/g, '').trim();
        
        // Agar text to'g'ridan-to'g'ri JSON bo'lsa
        if (cleanText.startsWith('{') && cleanText.endsWith('}')) {
            try {
                return JSON.parse(cleanText);
            } catch (e) {
                console.warn("To'g'ridan-to'g'ri JSON parse qilishda xato:", e);
            }
        }
        
        // Agar text to'liq emas bo'lsa, to'ldirishga harakat qilamiz
        if (!cleanText.endsWith('}')) {
            const openBraces = (cleanText.match(/\{/g) || []).length;
            const closeBraces = (cleanText.match(/\}/g) || []).length;
            const openBrackets = (cleanText.match(/\[/g) || []).length;
            const closeBrackets = (cleanText.match(/\]/g) || []).length;
            
            if (openBrackets > closeBrackets) {
                cleanText += ']'.repeat(openBrackets - closeBrackets);
            }
            
            if (openBraces > closeBraces) {
                if (cleanText.trim().endsWith(',')) {
                    cleanText = cleanText.trim().slice(0, -1);
                }
                const quotes = (cleanText.match(/"/g) || []).length;
                if (quotes % 2 !== 0) {
                    cleanText += '"';
                }
                cleanText += '}'.repeat(openBraces - closeBraces);
            }
        }

        try {
            return JSON.parse(cleanText);
        } catch (parseError: any) {
            console.warn("Clean text parse qilishda xato:", parseError?.message);
            
            // Fallback 1: birinchi { dan oxirgi } gacha olamiz
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start !== -1 && end !== -1 && end > start) {
                const jsonStr = text.substring(start, end + 1);
                try {
                    return JSON.parse(jsonStr);
                } catch (innerError: any) {
                    console.warn("Fallback 1 ham xato:", innerError?.message);
                    
                    // Fallback 2: To'liq bo'lmagan JSON ni to'ldirishga harakat qilamiz
                    try {
                        console.log("Fallback 2: JSON ni to'ldirishga harakat qilamiz...");
                        let fixedJson = jsonStr;
                        
                        // Agar string to'liq yopilmagan bo'lsa, uni yopamiz
                        // Oxirgi qo'shtirnoqdan keyin yopish belgilarini qo'shamiz
                        const lastQuoteIndex = fixedJson.lastIndexOf('"');
                        if (lastQuoteIndex !== -1 && lastQuoteIndex < fixedJson.length - 1) {
                            // Oxirgi qo'shtirnoqdan keyin nima borligini tekshiramiz
                            const afterLastQuote = fixedJson.substring(lastQuoteIndex + 1).trim();
                            if (afterLastQuote && !afterLastQuote.startsWith('}') && !afterLastQuote.startsWith(']') && !afterLastQuote.startsWith(',')) {
                                // String to'liq yopilmagan, yopamiz
                                fixedJson = fixedJson.substring(0, lastQuoteIndex + 1);
                            }
                        }
                        
                        // Barcha ochiq bracket va brace larni yopamiz
                        const openBraces = (fixedJson.match(/\{/g) || []).length;
                        const closeBraces = (fixedJson.match(/\}/g) || []).length;
                        const openBrackets = (fixedJson.match(/\[/g) || []).length;
                        const closeBrackets = (fixedJson.match(/\]/g) || []).length;
                        
                        // Agar oxirida vergul bo'lsa, uni olib tashlaymiz
                        fixedJson = fixedJson.trim();
                        if (fixedJson.endsWith(',')) {
                            fixedJson = fixedJson.slice(0, -1);
                        }
                        
                        // Bracket va brace larni yopamiz
                        if (openBrackets > closeBrackets) {
                            fixedJson += ']'.repeat(openBrackets - closeBrackets);
                        }
                        if (openBraces > closeBraces) {
                            fixedJson += '}'.repeat(openBraces - closeBraces);
                        }
                        
                        // Yana bir bor parse qilishga harakat qilamiz
                        try {
                            const parsed = JSON.parse(fixedJson);
                            console.log("Fallback 2 muvaffaqiyatli:", Object.keys(parsed).length, "key");
                            return parsed;
                        } catch (finalError: any) {
                            console.warn("Fallback 2 parse ham xato:", finalError?.message);
                            // Oxirgi yechim: mavjud qismlarni regex bilan extract qilamiz
                            return extractPartialJson(jsonStr);
                        }
                    } catch (partialError: any) {
                        console.error("Fallback 2 umumiy xato:", partialError?.message);
                        return extractPartialJson(jsonStr);
                    }
                }
            }
            throw parseError;
        }
    } catch (e: any) {
        console.error("extractJson umumiy xato:", e?.message);
        console.error("Text uzunligi:", text.length);
        console.error("Text boshlanishi:", text.substring(0, 200));
        // Agar umuman JSON ajratib bo'lmasa, bo'sh obyekt qaytaramiz
        return {};
    }
};

const parseGeminiError = (error: any): Error => {
    const message = error?.message || 'Unknown error';
    if (message.includes('429')) return new Error('error_api_rate_limit');
    if (message.toLowerCase().includes('api key not valid')) return new Error('error_api_key_invalid');
    if (message.includes('503') || message.toLowerCase().includes('unavailable')) {
        return new Error('error_api_unavailable');
    }
    return new Error('error_api_unknown');
};

const aggregateText = (caseDetails: string, files: CaseFile[]): string => {
    const safeDetails = caseDetails || "";
    const aggregatedFileText = (files || [])
      .filter(f => f.extractedText)
      .map(f => {
          const text = f.extractedText || "";
          const maxLength = 2000000; 
          const safeText = text.length > maxLength ? text.substring(0, maxLength) + "\n...[davomi qisqartirildi]..." : text;
          return `\n\n--- HUJJAT: ${f.name} ---\n${safeText}\n---`;
      })
      .join('');
    return `ISH TAFSILOTLARI:\n${safeDetails}${aggregatedFileText}`.substring(0, 8000000); 
};

const formatParticipantsForPrompt = (participants: CaseParticipant[], clientName: string, t: (key: string) => string): string => {
  return (participants || []).map(p => {
    let line = `- ${p.name}: ${p.role}`;
    if (clientName && clientName.includes(p.name)) line += ` (${t('kb_client_tag')})`;
    return line;
  }).join('\n');
}

const prepareFileParts = (files: CaseFile[]) => {
  let parts: any[] = [];
  
  files.forEach(file => {
      if (file.images && file.images.length > 0) {
          file.images.slice(0, 20).forEach(imgData => {
              const base64Data = imgData.split(',')[1];
              if (base64Data) {
                  parts.push({
                      inlineData: {
                          mimeType: 'image/jpeg',
                          data: base64Data
                      }
                  });
              }
          });
          return;
      }

      // Kichik hujjatlar uchun to'g'ridan-to'g'ri faylni yuboramiz,
      // lekin juda katta base64 ma'lumotlarni cheklaymiz.
      if (!file.content) return;
      const fileParts = file.content.split(',');
      const base64Data = fileParts.length > 1 ? fileParts[1] : null;
      if (!base64Data) return;
      
      // Juda katta fayllarni yubormaslik uchun limit (taxminan 18MB atrofida)
      if (base64Data.length > 18 * 1024 * 1024) {
          return;
      }
      
      parts.push({ 
          inlineData: { 
              mimeType: file.type || 'application/pdf', 
              data: base64Data 
          } 
      });
  });
  
  return parts;
};

// Himoya qilinuvchi shaxslarni aniqlash uchun alohida – matn asosidagi tayyorlovchi
// (katta PDFlar uchun ham extractedText dan maksimal foydalanadi).
const MAX_PARTICIPANT_TEXT_PER_FILE = 20000;
const MAX_PARTICIPANT_TOTAL_TEXT = 120000;

const prepareParticipantTextParts = (caseDetails: string, files: CaseFile[]) => {
  const parts: any[] = [];
  let totalChars = 0;

  // Foydalanuvchi kiritgan ish tafsilotlarini ham kontekstga qo'shamiz
  if (caseDetails && caseDetails.trim()) {
    const snippet = caseDetails.trim().slice(0, 8000);
    parts.push({
      text: `ISH TAFSILOTLARI (foydalanuvchi kiritgan):\n${snippet}`,
    });
    totalChars += snippet.length;
  }

  files.forEach((file) => {
    if (!file.extractedText || !file.extractedText.trim()) return;
    if (totalChars >= MAX_PARTICIPANT_TOTAL_TEXT) return;

    const text = file.extractedText;
    const segments: string[] = [];

    if (text.length <= MAX_PARTICIPANT_TEXT_PER_FILE) {
      segments.push(text);
    } else {
      const first = text.slice(0, MAX_PARTICIPANT_TEXT_PER_FILE);
      const midStart = Math.max(
        0,
        Math.floor(text.length / 2) - Math.floor(MAX_PARTICIPANT_TEXT_PER_FILE / 2)
      );
      const middle = text.slice(midStart, midStart + MAX_PARTICIPANT_TEXT_PER_FILE);
      const last = text.slice(-MAX_PARTICIPANT_TEXT_PER_FILE);
      segments.push(first, middle, last);
    }

    segments.forEach((seg, idx) => {
      if (totalChars >= MAX_PARTICIPANT_TOTAL_TEXT) return;
      const snippet = seg.trim();
      if (!snippet) return;
      const label = segments.length > 1 ? ` (segment ${idx + 1})` : "";
      const content = `HUJJAT: ${file.name}${label}\n\n${snippet}`;
      parts.push({ text: content });
      totalChars += snippet.length;
    });
  });

  return parts;
};

// QAT'IY QOIDA: To'qima/taxminiy ism chiqarilmasin. Ishtirokchilar FAQAT hujjat matnida aniq tilga olingan shaxslardan olinadi.
const fallbackExtractParticipants = (_caseDetails: string, _files: CaseFile[]): SuggestedParticipant[] => {
  return [];
};

// Ishtirokchilarni aniqlashda birinchi navbatda lokal fallback ishlaydi,
// lekin asosiy va ishonchli ro'yxatni AI dan olamiz; fallback faqat zaxira sifatida.
const USE_AI_FOR_PARTICIPANTS = true;


const MAX_RETRIES = 1;
const RETRY_DELAY = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const executeWithRetry = async <T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> => {
    try {
        return await fn();
    } catch (error: any) {
        // 400 yoki boshqa xatolarni log qilamiz
        if (error?.message?.includes('400') || error?.response?.status === 400) {
            console.error("API 400 xatosi:", error?.response?.data || error?.message);
            console.error("Xato detallari:", JSON.stringify(error, null, 2));
        }
        
        if (retries > 0 && (
            error?.message?.includes('network') || 
            error?.message?.includes('fetch') || 
            error?.message?.includes('503') || 
            error?.message?.includes('504') ||
            error?.message?.includes('ERR_NETWORK_CHANGED') ||
            error?.message?.includes('429') || 
            error?.message?.includes('RESOURCE_EXHAUSTED')
        )) {
            await delay(RETRY_DELAY);
            return executeWithRetry(fn, retries - 1);
        }
        throw error;
    }
};

export const getLegalStrategy = async (
  caseDetails: string,
  files: CaseFile[],
  courtType: string,
  courtStage: string,
  clientRole: string,
  clientName: string,
  participants: CaseParticipant[],
  t: (key: string, replacements?: { [key: string]: string }) => string
): Promise<DebateResult> => {
  try {
    const currentDate = new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
    const translatedCourtStage = t(`court_stage_${courtStage.replace(/ /g, '_').toLowerCase()}`);
    const summaryText = aggregateText(caseDetails, files);
    const fileParts = prepareFileParts(files);
    const participantsList = formatParticipantsForPrompt(participants, clientName, (key) => t(key));

    let fullPrompt = `
    Siz O'zbekiston Respublikasining eng obro'li, afsonaviy va tajribali advokatisiz (40 yillik staj). Sizning vazifangiz - ushbu ishni o'ta chuqur, mukammal va strategik tahlil qilish.
    Foydalanuvchi "tahlillar sayoz va qisqa" ekanligidan shikoyat qilmoqda. Shuning uchun, bu safar maksimal darajada batafsil, har bir detalni qamrab oladigan va Oliy yuridik standartlarga javob beradigan hisobot tayyorlashingiz shart.

    DIQQAT: JORIY SANA VA VAQT: ${currentDate}.
    Tahlil davomida FAQAT shu kunga qadar kuchga kirgan va AMALDA BO'LGAN O'zbekiston Respublikasi qonunlari, Prezident farmonlari, Vazirlar Mahkamasi qarorlari va Oliy Sud Plenumi qarorlaridan foydalaning.

    ISH TAFSILOTLARI:
    - Sud Turi (Jurisdiksiya): ${courtType.toUpperCase()}
    - Sud Bosqichi: ${courtStage.toUpperCase()} (Tarjima: ${translatedCourtStage})
    - Mening Mijozim: ${clientName} (${clientRole})
    - Ish holatlari: ${summaryText}
    - Ishtirokchilar: ${participantsList}

    TALABLAR:
    1. **SUD TURI VA BOSQICHIGA QAT'IY RIOYA QILING**: Har bir argument sud turiga (JK, FK, MK) va bosqichiga mos bo'lsin.
    2. **AMALDA BO'LGAN QONUNCHILIK**: Har bir argumentingizni aniq modda (O'zRes ...) bilan asoslang. Lex.uz va Sud.uz amaliyotiga tayaning.
    3. **"GROSSMEYSTER" YONDASHUV**: Oddiy advokat kabi emas, balki vaziyatni butunlay o'zgartirib yuboradigan strategiyalarni o'ylab toping.

    TAHLIL TUZILMASI (JSON formatida - AYNAN SHU FORMATDA QAYTARING):
    {
      "summary": "Ishning 300-500 so'zlik, barcha muhim faktlarni o'z ichiga olgan mukammal yuridik xulosasi.",
      "winProbability": 0 dan 100 gacha raqam (realistik baho),
      "probabilityJustification": "G'alaba ehtimoli uchun batafsil asoslash (kamida 200 so'z)",
      "positiveFactors": ["Mijoz pozitsiyasini kuchaytiruvchi eng kuchli 7-10 ta fakt yoki qonuniy asos. Har biri kamida 3-4 gap bilan izohlansin."],
      "negativeFactors": ["Bizning pozitsiyamizdagi eng katta xavflar va zaif nuqtalar. Har biri kamida 3-4 gap bilan izohlansin."],
      "suggestedTasks": ["G'alaba uchun advokat bajarishi kerak bo'lgan 7-10 ta aniq amaliy vazifa (so'rovnoma yuborish, ekspertiza tayinlash va h.k.)"],
      "deepDiveAnalysis": "Sizdan kutilayotgan eng muhim qism. Bu qism kamida 2500 so'zdan iborat bo'lishi va quyidagi tuzilmalarni o'z ichiga olishi SHART: \n\n1. **Faktlarning Chuqur Tahlili (Fact Analysis)**: Har bir faktni 'elekdan o'tkazing'. Guvohlarning gaplaridagi ziddiyatlar, hujjatlardagi kamchiliklar.\n2. **IRAC Tahlili (Issue, Rule, Analysis, Conclusion)**: Har bir huquqiy muammo uchun alohida IRAC yozing.\n3. **Strategik Yo'l Xaritasi**: Tergov yoki sudda qanday harakat qilish kerakligi bo'yicha 'Step-by-step' qo'llanma.\n4. **Kutilmagan Yurishlar (Out of the box)**: Hech kim kutmagan, lekin qonuniy bo'lgan ayyorona usullar.\n5. **Pretsedentlar va Amaliyot**: Oliy sud plenum qarorlaridan iqtiboslar.\n\nMatnni iloji boricha 'suv'siz, aniq va qattiq yuridik tilda yozing. Foydalanuvchi o'qiganda 'Buni haqiqiy professional yozibdi' deyishi kerak.",
      "riskMatrix": [
        { "risk": "Xavf nomi", "likelihood": "Past yoki O'rta yoki Yuqori", "mitigation": "Xavfni kamaytirish usuli" }
      ],
      "debate": [
        { "lawyerName": "Strateg (Mijoz tarafi)", "analysis": "Mijozni oqlash/yutib chiqish uchun eng kuchli, hissiy va mantiqiy argument (kamida 200 so'z)" },
        { "lawyerName": "Prokuror/Raqib", "analysis": "Bizga qarshi ishlatilishi mumkin bo'lgan eng xavfli va ayblovchi argument (kamida 200 so'z)" },
        { "lawyerName": "Strateg (Rebuttal)", "analysis": "Raqibning argumentini butunlay yo'qqa chiqaruvchi va sindiruvchi javob (kamida 200 so'z)" },
        { "lawyerName": "Sudya", "analysis": "Qonun va ichki ishonchga asoslangan holda ishni qanday hal qilish bo'yicha xolis va yakuniy xulosa (kamida 200 so'z)" }
      ],
      "knowledgeBase": {
        "keyFacts": [
          { "fact": "Muhim fakt", "relevance": "Nima uchun muhim" }
        ],
        "legalIssues": ["Huquqiy muammo 1", "Huquqiy muammo 2"],
        "applicableLaws": [
          { "article": "O'zRes JK 100-modda", "summary": "Qisqa izoh" }
        ],
        "strengths": ["Kuchli tomon 1", "Kuchli tomon 2"],
        "weaknesses": ["Zaif tomon 1", "Zaif tomon 2"],
        "statuteOfLimitations": {
          "status": "OK yoki Muddati o'tgan yoki Xavf ostida",
          "summary": "Muddat holati haqida batafsil"
        }
      }
    }
  `;
    
    fullPrompt += `\n\n${t('prompt_language_enforcement')}`;
    
    // AI munozarasi uchun ham kuchliroq prompt
    const debatePrompt = `
    MUNOZARA UCHUN QAT'IY KO'RSATMA:
    Siz ikkita eng kuchli advokatsiz. Sizning bahsingiz haqiqiy sud zalidagi kabi keskin va murosasiz bo'lishi kerak.
    Har bir argument chuqur o'ylangan va faktlarga asoslangan bo'lsin.
    `;
    fullPrompt += debatePrompt;

    let response;
    try {
      response = await executeWithRetry(async () => await ai.models.generateContent({ 
          model: "gemini-3-pro-preview", 
          contents: { parts: [{ text: fullPrompt }, ...fileParts] }, 
          config: { 
            responseMimeType: "application/json", 
            responseSchema: responseSchema, 
            temperature: 0.5, 
            maxOutputTokens: 8192 
          } 
      }));
    } catch (apiError: any) {
      console.error("Gemini API xatosi:", apiError);
      // Agar schema bilan muammo bo'lsa, schema'siz urinib ko'ramiz
      try {
        response = await executeWithRetry(async () => await ai.models.generateContent({ 
            model: "gemini-3-pro-preview", 
            contents: { parts: [{ text: fullPrompt }, ...fileParts] }, 
            config: { 
              responseMimeType: "application/json", 
              temperature: 0.5, 
              maxOutputTokens: 8192 
            } 
        }));
      } catch (fallbackError: any) {
        console.error("Fallback API xatosi:", fallbackError);
        throw new Error(`API xatosi: ${fallbackError?.message || "Noma'lum xatolik"}`);
      }
    }
    
    if (!response?.text) {
      console.error("AI javobi bo'sh qaytdi");
      throw new Error("AI javobi bo'sh qaytdi.");
    }

    console.log("AI javob uzunligi:", response.text.length);
    console.log("AI javob boshlanishi:", response.text.substring(0, 200));
    
    // Agar response.text allaqachon obyekt bo'lsa, to'g'ridan-to'g'ri ishlatamiz
    let parsed: any;
    if (typeof response.text === 'object' && response.text !== null) {
      parsed = response.text;
      console.log("Response.text allaqachon obyekt");
    } else if (typeof response.text === 'string') {
      // String bo'lsa, JSON parse qilamiz
      console.log("Response.text string, parse qilamiz...");
      try {
        parsed = JSON.parse(response.text);
        console.log("JSON.parse muvaffaqiyatli:", Object.keys(parsed || {}).length, "key");
      } catch (parseError: any) {
        console.warn("JSON.parse xatosi:", parseError?.message);
        console.log("extractJson ishlatamiz...");
        // Agar JSON parse qilishda xato bo'lsa, extractJson ishlatamiz
        try {
          parsed = extractJson(response.text);
          console.log("extractJson natija:", Object.keys(parsed || {}).length, "key");
          if (!parsed || Object.keys(parsed).length === 0) {
            console.error("extractJson ham bo'sh qaytdi. Raw text:", response.text.substring(0, 500));
          }
        } catch (extractError: any) {
          console.error("extractJson xatosi:", extractError?.message);
          parsed = {};
        }
      }
    } else {
      console.log("Response.text boshqa tur, extractJson ishlatamiz...");
      parsed = extractJson(String(response.text));
    }
    
    console.log("Parsed natija:", parsed ? "Mavjud" : "Bo'sh", Object.keys(parsed || {}).length, "key");
    console.log("Parsed keys:", Object.keys(parsed || {}));
    if (parsed && Object.keys(parsed).length > 0) {
      console.log("Parsed sample:", JSON.stringify(parsed).substring(0, 300));
    }
    
    // Agar parsed bo'sh bo'lsa yoki muhim maydonlar yo'q bo'lsa
    if (!parsed || Object.keys(parsed).length === 0) {
      console.warn("Parsed natija bo'sh, raw textni qaytaramiz");
      const raw = typeof response.text === 'string' ? response.text : JSON.stringify(response.text);
      // Raw textdan ma'lumotlarni extract qilishga harakat qilamiz
      return {
        debate: [],
        summary: raw.substring(0, 500) || "",
        deepDiveAnalysis: raw || "",
        winProbability: 0,
        probabilityJustification: "",
        positiveFactors: [],
        negativeFactors: [],
        riskMatrix: [],
        suggestedTasks: [],
        knowledgeBase: {
          keyFacts: [],
          legalIssues: [],
          applicableLaws: [],
          strengths: [],
          weaknesses: [],
          statuteOfLimitations: {
            status: "OK",
            summary: "",
          },
        },
      };
    }
    
    // Parsed natijani to'ldirish - agar ba'zi maydonlar yo'q bo'lsa
    const result: DebateResult = {
      debate: parsed.debate || [],
      summary: parsed.summary || "",
      deepDiveAnalysis: parsed.deepDiveAnalysis || "",
      winProbability: parsed.winProbability ?? 0,
      probabilityJustification: parsed.probabilityJustification || "",
      positiveFactors: parsed.positiveFactors || [],
      negativeFactors: parsed.negativeFactors || [],
      riskMatrix: parsed.riskMatrix || [],
      suggestedTasks: parsed.suggestedTasks || [],
      knowledgeBase: {
        keyFacts: parsed.knowledgeBase?.keyFacts || [],
        legalIssues: parsed.knowledgeBase?.legalIssues || [],
        applicableLaws: parsed.knowledgeBase?.applicableLaws || [],
        strengths: parsed.knowledgeBase?.strengths || [],
        weaknesses: parsed.knowledgeBase?.weaknesses || [],
        statuteOfLimitations: parsed.knowledgeBase?.statuteOfLimitations || {
          status: "OK",
          summary: "",
        },
      },
    };
    
    console.log("Final natija:", {
      debate: result.debate.length,
      summary: result.summary.length,
      deepDiveAnalysis: result.deepDiveAnalysis.length,
      winProbability: result.winProbability,
      knowledgeBase: {
        keyFacts: result.knowledgeBase.keyFacts.length,
        strengths: result.knowledgeBase.strengths.length,
        weaknesses: result.knowledgeBase.weaknesses.length,
      }
    });
    
    return result;
  } catch (error) {
    // Har qanday xatoda ham xavfsiz fallback natija qaytaramiz
    return {
      debate: [],
      summary: "",
      deepDiveAnalysis: "",
      winProbability: 0,
      probabilityJustification: "",
      positiveFactors: [],
      negativeFactors: [],
      riskMatrix: [],
      suggestedTasks: [],
      knowledgeBase: {
        keyFacts: [],
        legalIssues: [],
        applicableLaws: [],
        strengths: [],
        weaknesses: [],
        statuteOfLimitations: {
          status: "OK",
          summary: "",
        },
      },
    };
  }
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        debate: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { lawyerName: { type: Type.STRING }, analysis: { type: Type.STRING } }, required: ["lawyerName", "analysis"] } },
        summary: { type: Type.STRING },
        deepDiveAnalysis: { type: Type.STRING },
        winProbability: { type: Type.INTEGER },
        probabilityJustification: { type: Type.STRING },
        positiveFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
        negativeFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
        riskMatrix: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { risk: { type: Type.STRING }, likelihood: { type: Type.STRING, enum: ['Past', 'O\'rta', 'Yuqori'] }, mitigation: { type: Type.STRING } }, required: ["risk", "likelihood", "mitigation"] } },
        suggestedTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
        knowledgeBase: { type: Type.OBJECT, properties: { keyFacts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { fact: { type: Type.STRING }, relevance: { type: Type.STRING } }, required: ["fact", "relevance"] } }, legalIssues: { type: Type.ARRAY, items: { type: Type.STRING } }, applicableLaws: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { article: { type: Type.STRING }, summary: { type: Type.STRING } }, required: ["article", "summary"] } }, strengths: { type: Type.ARRAY, items: { type: Type.STRING } }, weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }, statuteOfLimitations: { type: Type.OBJECT, properties: { status: { type: Type.STRING, enum: ['OK', 'Muddati o\'tgan', 'Xavf ostida'] }, summary: { type: Type.STRING } }, required: ["status", "summary"] } }, required: ["keyFacts", "legalIssues", "applicableLaws", "strengths", "weaknesses", "statuteOfLimitations"] }
    },
    required: ["debate", "summary", "deepDiveAnalysis", "winProbability", "probabilityJustification", "positiveFactors", "negativeFactors", "knowledgeBase", "riskMatrix", "suggestedTasks"]
};

export const getCaseParticipants = async (
  caseDetails: string,
  files: CaseFile[],
  t: (key: string, replacements?: { [key: string]: string }) => string
): Promise<SuggestedParticipant[]> => {
  // 1) Har doim avval lokal analiz (regex + heuristika) – faqat zaxira varianti sifatida.
  const localParticipants = fallbackExtractParticipants(caseDetails, files);

  // Agar AI ishlatilmasa, faqat lokal natijani qaytaramiz.
  if (!USE_AI_FOR_PARTICIPANTS) {
    return localParticipants;
  }

  try {
    // 2) Asosiy: AI orqali ishtirokchilarni aniqlash.
    const textParts = prepareParticipantTextParts(caseDetails, files);
    const inlineFileParts = prepareFileParts(files) || [];
    let fullPrompt = `QAT'IY QOIDA – bajaring:
1) FAQAT hujjat matnida yoki rasmda ANIQ tilga olingan (yozilgan yoki ko'rinadigan) shaxs ismlarini qaytaring.
2) Hech qachon hujjatda yo'q ismni ixtiro qilmang, taxmin qilib qo'shmang va generatsiya qilmang.
3) Agar hujjatda hech qanday ism aniq ko'rinmasa yoki matn scanner/OCR dan o'qilmayotgan bo'lsa – bo'sh ro'yxat qaytaring: {"participants":[]}.
4) Faqat hujjatda aniq yozilgan F.I.Sh (da'vogar, javobgar, guvoh, jabrlanuvchi va h.k.) ni participants ga kiriting. Rolni hujjatdagi kontekstdan aniqlang.
5) Tashkilot nomlari, sarlavhalar, shahar nomlari ishtirokchi emas – ularni qaytarmang.

Hujjatlarni tahlil qiling va FAQAT hujjatda aniq tilga olingan ishtirokchilarni JSON da qaytaring:
{"participants":[{"name":"Hujjatda yozilgan F.I.Sh","suggestedRole":"Rol nomi"}]}
Agar bitta ham aniq ism topilmasa: {"participants":[]}
\n\n${t("prompt_language_enforcement")}`;

    const response = await executeWithRetry(
      async () =>
        await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: { parts: [{ text: fullPrompt }, ...(textParts || []), ...inlineFileParts] },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                participants: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { name: { type: Type.STRING }, suggestedRole: { type: Type.STRING } },
                    required: ["name", "suggestedRole"],
                  },
                },
              },
              required: ["participants"],
            },
            temperature: 0.1,
          },
        })
    );

    if (!response.text) {
      return [];
    }

    const parsed = extractJson(response.text);
    const aiParticipants: SuggestedParticipant[] =
      parsed && Array.isArray(parsed.participants) ? parsed.participants : [];

    if (!aiParticipants.length) {
      return [];
    }

    // 3) AI natijalarini tozalab, dublikatlarni olib tashlaymiz.
    const byName = new Map<string, SuggestedParticipant>();
    for (const p of aiParticipants) {
      if (!p || !p.name) continue;
      const trimmed = p.name.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (!byName.has(key)) {
        byName.set(key, {
          name: trimmed,
          suggestedRole: (p.suggestedRole || "Boshqa").trim() || "Boshqa",
        });
      }
    }

    // Juda ko‘p bo‘lsa ham, eng ko‘pi bilan 100 ta nom qaytaramiz.
    const cleanedAi = Array.from(byName.values()).slice(0, 100);

    // 4) Agar AI ro'yxati juda qisqa bo'lsa (masalan, 0–1 kishi), lokal fallbackdan bir-ikki nom qo‘shib qo‘yishimiz mumkin.
    return cleanedAi;
  } catch (error) {
    return [];
  }
};

export const getDocumentType = async (file: CaseFile, t: (key: string, replacements?: { [key: string]: string }) => string): Promise<string> => {
    try {
        let promptText = `Ushbu hujjat turini aniqlang: ${file.name}\n\n${t('prompt_language_enforcement')}`;
        
        if (file.extractedText && file.extractedText.length > 100) {
            promptText += `\n\nHUJJAT MATNI (qisqartirilgan):\n${file.extractedText.substring(0, 2000)}`;
        }

        const parts = file.content?.split(',') || [];
        const base64Data = parts.length > 1 ? parts[1] : null;
        
        const shouldSendBase64 = base64Data && base64Data.length < 5 * 1024 * 1024; 
        
        const response = await executeWithRetry(async () => await ai.models.generateContent({ 
            model: "gemini-3-flash-preview", 
            contents: { 
              parts: [
                { text: promptText }, 
                ...(shouldSendBase64 ? [{ inlineData: { mimeType: file.type || 'application/pdf', data: base64Data! } }] : [])
              ] 
            }, 
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { type: Type.OBJECT, properties: { documentType: { type: Type.STRING } }, required: ["documentType"] }, 
                temperature: 0 
            } 
        }));
        if (!response.text) return "Hujjat";
        return extractJson(response.text).documentType || "Hujjat";
    } catch (error: any) { return "Hujjat"; }
};

export const getArticleSummary = async (article: string, t: (key: string, replacements?: any) => string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: { parts: [{ text: `"${article}" haqida O'zbekiston qonunchiligi asosida sharh bering.\n\n${t('prompt_language_enforcement')}` }] } });
        return response.text?.trim() || "";
    } catch (error) { return ""; }
};

export const getCourtroomScenario = async (caseDetails: string, files: CaseFile[], courtType: string, courtStage: string, clientRole: string, clientName: string, participants: CaseParticipant[], t: (key: string, replacements?: any) => string): Promise<string> => {
    try {
        const fileParts = prepareFileParts(files);
        const participantsList = formatParticipantsForPrompt(participants, clientName, (key) => t(key));
        const isInvestigation = courtStage === t('court_stage_tergov_raw') || courtStage.toLowerCase().includes('tergov');
        
        let prompt = '';
        if (isInvestigation) {
            prompt = `Tergov jarayoni uchun HAYOTIY va BATAFSIL simulyatsiya ssenariysini yarating. 

ISH TAFSILOTLARI:
${aggregateText(caseDetails, files)}

ISH ISHTIROKCHILARI:
${participantsList}

ASOSIY SHAXS: ${clientName} (${clientRole})

VAZIFA:
1. Tergov jarayonining to'liq ssenariysini yarating - tergovchining savollari, gumonlanuvchining javoblari, dalillar ko'rsatish, guvohlar bilan suhbatlar
2. Har bir bosqichni batafsil tasvirlang - qanday savollar berilishi mumkin, qanday javoblar kutilishi mumkin
3. Kutilmagan vaziyatlar va ularga qanday javob berish kerakligini ko'rsating
4. Tergovchining taktikalarini va ularga qanday qarshi turish kerakligini tushuntiring
5. Dalillarni qanday himoya qilish va qanday dalillarni taqdim etish kerakligini ko'rsating
6. O'zbekiston Jinoyat-protsessual kodeksiga mos keladigan jarayonni tasvirlang
7. Har bir bosqichda qanday xatolardan qochish kerakligini ko'rsating

SSENARIY quyidagi bo'limlarni o'z ichiga olishi kerak:
- ## Tergov boshlanishi va asosiy savollar
- ## Dalillar ko'rsatish va himoya qilish
- ## Guvohlar bilan suhbatlar
- ## Kutilmagan savollar va javoblar
- ## Tergovchining taktikalariga qarshi choralar
- ## Tergov yakunlanishi va keyingi qadamlar

Markdown formatida, juda batafsil va hayotiy bo'lsin.`;
        } else {
            prompt = `Sud jarayoni uchun HAYOTIY va BATAFSIL simulyatsiya ssenariysini yarating.

ISH TAFSILOTLARI:
${aggregateText(caseDetails, files)}

ISH ISHTIROKCHILARI:
${participantsList}

ASOSIY SHAXS: ${clientName} (${clientRole})
SUD TURI: ${courtType}
BOSQICH: ${courtStage}

VAZIFA:
1. Sud jarayonining to'liq ssenariysini yarating - sud raisi, prokuror, advokat, guvohlar nutqlari
2. Har bir bosqichni batafsil tasvirlang - ish ochilishi, dalillar ko'rsatish, guvohlar so'rovi, yakuniy nutqlar
3. Kutilmagan savollar va vaziyatlar, ularga qanday javob berish kerakligini ko'rsating
4. Qarama-qarshi tomonning taktikalarini va ularga qanday qarshi turish kerakligini tushuntiring
5. Sud raisining ehtimoliy savollarini va ularga qanday javob berish kerakligini ko'rsating
6. O'zbekiston Protsessual kodeksiga mos keladigan jarayonni tasvirlang
7. Har bir bosqichda qanday xatolardan qochish kerakligini ko'rsating

SSENARIY quyidagi bo'limlarni o'z ichiga olishi kerak:
- ## Sud jarayonining boshlanishi
- ## Dalillar ko'rsatish bosqichi
- ## Guvohlar so'rovi
- ## Qarama-qarshi tomonning savollari va javoblar
- ## Kutilmagan vaziyatlar va ularga tayyorgarlik
- ## Yakuniy nutq va sud qarori

Markdown formatida, juda batafsil va hayotiy bo'lsin.`;
        }
        
        const response = await ai.models.generateContent({ 
          model: "gemini-3-pro-preview", 
          contents: { 
            parts: [{ text: `${prompt}\n\n${t('prompt_language_enforcement')}` }, ...fileParts] 
          },
          config: {
            temperature: 0.7,
            maxOutputTokens: 8192
          }
        });
        return response.text?.trim() || "";
    } catch (error) { return ""; }
};

export const getCrossExaminationQuestions = async (caseDetails: string, files: CaseFile[], courtType: string, courtStage: string, clientRole: string, clientName: string, participants: CaseParticipant[], t: (key: string, replacements?: any) => string): Promise<CrossExaminationQuestion[]> => {
    try {
        const fileParts = prepareFileParts(files);
        const participantsList = formatParticipantsForPrompt(participants, clientName, (key) => t(key));
        const isInvestigation = courtStage === t('court_stage_tergov_raw') || courtStage.toLowerCase().includes('tergov');
        
        let prompt = '';
        if (isInvestigation) {
            prompt = `Tergov jarayoni uchun HAYOTIY va KUTILMAGAN savollar ro'yxatini yarating.

ISH TAFSILOTLARI:
${aggregateText(caseDetails, files)}

ISH ISHTIROKCHILARI:
${participantsList}

ASOSIY SHAXS: ${clientName} (${clientRole})

VAZIFA:
Kamida 15-20 ta kutilmagan va qiyin savollar yarating. Har bir savol uchun:
- Savol: Tergovchi yoki prokuror tomonidan berilishi mumkin bo'lgan qiyin savol
- Javob: ${clientName} uchun eng yaxshi va huquqiy to'g'ri javob

Savollar quyidagi mavzularni qamrab olishi kerak:
- Dalillar va ularning ishonchliligi
- Voqea xronologiyasi va ziddiyatlar
- Motiv va niyat
- Alibi va himoya versiyalari
- Kutilmagan faktlar va ularga javob
- Qarama-qarshi tomonning dalillariga qarshi argumentlar

JSON formatda: {"questions": [{"question": "...", "suggestedAnswer": "..."}]}`;
        } else {
            prompt = `Sud jarayoni uchun HAYOTIY va KUTILMAGAN kesishgan so'roq savollarini yarating.

ISH TAFSILOTLARI:
${aggregateText(caseDetails, files)}

ISH ISHTIROKCHILARI:
${participantsList}

ASOSIY SHAXS: ${clientName} (${clientRole})
SUD TURI: ${courtType}

VAZIFA:
Kamida 15-20 ta kutilmagan va qiyin savollar yarating. Har bir savol uchun:
- Savol: Qarama-qarshi tomon advokati yoki prokuror tomonidan berilishi mumkin bo'lgan qiyin savol
- Javob: ${clientName} uchun eng yaxshi va huquqiy to'g'ri javob

Savollar quyidagi mavzularni qamrab olishi kerak:
- Dalillar va ularning ishonchliligi
- Voqea xronologiyasi va ziddiyatlar
- Motiv va niyat
- Alibi va himoya versiyalari
- Kutilmagan faktlar va ularga javob
- Qarama-qarshi tomonning dalillariga qarshi argumentlar
- Sud raisining ehtimoliy savollari

JSON formatda: {"questions": [{"question": "...", "suggestedAnswer": "..."}]}`;
        }
        
        const response = await ai.models.generateContent({ 
            model: "gemini-3-pro-preview", 
            contents: { parts: [{ text: `${prompt}\n\n${t('prompt_language_enforcement')}` }, ...fileParts] },
            config: { 
                responseMimeType: "application/json",
                temperature: 0.7,
                maxOutputTokens: 8192
            }
        });
        if (!response.text) return [];
        return extractJson(response.text).questions || [];
    } catch (error) { return []; }
};

export const getClosingArgument = async (caseDetails: string, files: CaseFile[], courtType: string, courtStage: string, clientRole: string, clientName: string, participants: CaseParticipant[], mode: 'lead' | 'defender', t: (key: string, replacements?: any) => string): Promise<string> => {
    try {
        const fileParts = prepareFileParts(files);
        const participantsList = formatParticipantsForPrompt(participants, clientName, (key) => t(key));
        const isInvestigation = courtStage === t('court_stage_tergov_raw') || courtStage.toLowerCase().includes('tergov');
        
        let prompt = '';
        if (isInvestigation) {
            const roleName = mode === 'lead' ? 'Tergovchi/Prokuror' : `${clientName} himoyachisi`;
            prompt = `Tergov jarayoni uchun HAYOTIY va KUCHLI yakuniy nutq yarating.

ISH TAFSILOTLARI:
${aggregateText(caseDetails, files)}

ISH ISHTIROKCHILARI:
${participantsList}

ASOSIY SHAXS: ${clientName} (${clientRole})
NUTQ MUALLIFI: ${roleName}

VAZIFA:
${mode === 'lead' ? 
`Prokuror/Tergovchi sifatida ${clientName}ga qarshi KUCHLI va ISHONCHLI yakuniy nutq yarating. Nutq quyidagilarni o'z ichiga olishi kerak:
- Dalillarning to'liq tahlili va ularning ishonchliligi
- ${clientName}ning aybi va uning tasdiqlanishi
- Qonunchilikdagi tegishli moddalar va ularning qo'llanilishi
- Jamiyat manfaatlari va adolat talabi
- Qaror uchun asoslar` :
`${clientName} himoyachisi sifatida KUCHLI va ISHONCHLI yakuniy nutq yarating. Nutq quyidagilarni o'z ichiga olishi kerak:
- Dalillarning to'liq tahlili va ularning zaif tomonlari
- ${clientName}ning aybsizligi yoki yengilroq javobgarlik
- Qonunchilikdagi tegishli moddalar va ularning qo'llanilishi
- Dalillarning yetarli emasligi yoki noto'g'ri olinganligi
- ${clientName}ning huquqlari va ularning buzilishi
- Qaror uchun asoslar va tavsiyalar`}

Nutq juda KUCHLI, ISHONCHLI va HAYOTIY bo'lsin. Markdown formatida, batafsil va professional.`;
        } else {
            const roleName = mode === 'lead' ? 'Prokuror' : `${clientName} himoyachisi`;
            prompt = `Sud jarayoni uchun HAYOTIY va KUCHLI yakuniy nutq yarating.

ISH TAFSILOTLARI:
${aggregateText(caseDetails, files)}

ISH ISHTIROKCHILARI:
${participantsList}

ASOSIY SHAXS: ${clientName} (${clientRole})
SUD TURI: ${courtType}
BOSQICH: ${courtStage}
NUTQ MUALLIFI: ${roleName}

VAZIFA:
${mode === 'lead' ? 
`Prokuror sifatida ${clientName}ga qarshi KUCHLI va ISHONCHLI yakuniy nutq yarating. Nutq quyidagilarni o'z ichiga olishi kerak:
- Dalillarning to'liq tahlili va ularning ishonchliligi
- ${clientName}ning aybi va uning tasdiqlanishi
- Qonunchilikdagi tegishli moddalar va ularning qo'llanilishi
- Jamiyat manfaatlari va adolat talabi
- Sud qarori uchun asoslar va tavsiyalar` :
`${clientName} himoyachisi sifatida KUCHLI va ISHONCHLI yakuniy nutq yarating. Nutq quyidagilarni o'z ichiga olishi kerak:
- Dalillarning to'liq tahlili va ularning zaif tomonlari
- ${clientName}ning aybsizligi yoki yengilroq javobgarlik
- Qonunchilikdagi tegishli moddalar va ularning qo'llanilishi
- Dalillarning yetarli emasligi yoki noto'g'ri olinganligi
- ${clientName}ning huquqlari va ularning buzilishi
- Sud qarori uchun asoslar va tavsiyalar`}

Nutq juda KUCHLI, ISHONCHLI va HAYOTIY bo'lsin. Markdown formatida, batafsil va professional.`;
        }
        
        const response = await ai.models.generateContent({ 
          model: "gemini-3-pro-preview", 
          contents: { parts: [{ text: `${prompt}\n\n${t('prompt_language_enforcement')}` }, ...fileParts] },
          config: {
            temperature: 0.7,
            maxOutputTokens: 8192
          }
        });
        return response.text?.trim() || "";
    } catch (error) { return ""; }
};

export const startResearchChat = (t: (key: string) => string, language: string) => {
  researchChat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `Siz O'zbekiston Respublikasining eng tajribali va mutaxassis huquqshunossiz. Sizning vazifangiz - advokatlar va huquqshunoslarga advokatlikka oid har qanday mavzuda mukammal, batafsil va professional javoblar berish.

Siz quyidagi sohalarda mutaxassissiz:
- O'zbekiston Respublikasi qonunchiligi (JK, FK, MK, Mehnat kodeksi va boshqalar)
- YANGI QARORLAR: Prezident farmonlari, Vazirlar Mahkamasi qarorlari, Oliy Sud Plenumi qarorlari
- JK (Jinoyat Kodeksi) - barcha moddalar, o'zgarishlar va yangilanishlar
- FK (Fuqarolik Kodeksi) - barcha moddalar, o'zgarishlar va yangilanishlar
- MK (Ma'muriy Kodeks) - barcha moddalar, o'zgarishlar va yangilanishlar
- Oliy Sud Plenum qarorlari - barcha muhim qarorlar va ularning amaliy qo'llanilishi
- Sud amaliyoti va Oliy Sud qarorlari
- Xalqaro huquq va shartnomalar
- Huquqiy hujjatlar tayyorlash
- Sud jarayonlari va protsessual qoidalar
- Mulk huquqlari, shartnomalar, mehnat munosabatlari
- Jinoyat va ma'muriy javobgarlik

DIQQAT - YANGI QARORLAR:
- Har bir javobingizda eng so'nggi qonunlar va qarorlardan foydalaning
- Oliy Sud Plenum qarorlarini aniq moddalar bilan asoslang
- Prezident farmonlari va Vazirlar Mahkamasi qarorlarini eslatib o'ting
- Yangi o'zgarishlar va yangilanishlarni ko'rsating

Har bir javobingiz:
- Aniq qonun moddalari (masalan: O'zRes JK 168-modda) va qarorlar bilan asoslangan bo'lishi kerak
- Amaliy misollar va sud amaliyotidan iqtiboslar bilan to'ldirilgan bo'lishi kerak
- Tushunarli va professional tilda yozilgan bo'lishi kerak
- Mavzuga oid barcha muhim jihatlarni qamrab olgan bo'lishi kerak
- Eng so'nggi qonunlar va qarorlardan foydalangan bo'lishi kerak

Agar savol aniq bo'lmasa yoki qo'shimcha ma'lumot kerak bo'lsa, savol berishingiz mumkin.`,
      tools: [{ googleSearch: {} }],
    },
  });
};

let researchChat: Chat | null = null;
export const sendResearchMessage = async (text: string, t: (key: string) => string, language: string): Promise<ChatMessage> => {
  // Agar API key muammosi aniqlangan bo'lsa, darhol fallback message qaytaramiz
  if (apiKeyIssueDetected) {
    return {
      id: `res-error-${Date.now()}`,
      role: 'model',
      text: t('research_api_key_error') || "Uzr, hozirgi vaqtda AI tadqiqot funksiyasi ishlamayapti. Iltimos, keyinroq urinib ko'ring yoki boshqa funksiyalardan foydalaning.",
      sources: []
    };
  }

  try {
    if (!researchChat) startResearchChat(t, language);
    const response = await researchChat!.sendMessage({ message: text });
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web).filter((web: any) => web && web.uri).map((web: any) => ({ uri: web.uri, title: web.title || web.uri }));
    return { id: `res-${Date.now()}`, role: 'model', text: response.text || "", sources: sources || [] };
  } catch (error: any) {
    // API key muammolari: 403, 400 (expired/invalid), leaked, PERMISSION_DENIED, API_KEY_INVALID
    const errorMessage = error?.message || '';
    const errorCode = error?.error?.code || error?.code || '';
    const errorStatus = error?.error?.status || error?.status || '';
    const errorReason = error?.error?.details?.[0]?.reason || '';
    
    if (errorMessage.includes('403') || 
        errorMessage.includes('400') || 
        errorMessage.includes('leaked') || 
        errorMessage.includes('expired') || 
        errorMessage.includes('invalid') ||
        errorMessage.includes('PERMISSION_DENIED') ||
        errorCode === 403 || 
        errorCode === 400 ||
        errorStatus === 'PERMISSION_DENIED' ||
        errorStatus === 'INVALID_ARGUMENT' ||
        errorReason === 'API_KEY_INVALID' ||
        errorReason === 'CONSUMER_SUSPENDED') {
      apiKeyIssueDetected = true;
      return {
        id: `res-error-${Date.now()}`,
        role: 'model',
        text: t('research_api_key_error') || "Uzr, hozirgi vaqtda AI tadqiqot funksiyasi ishlamayapti. Iltimos, keyinroq urinib ko'ring yoki boshqa funksiyalardan foydalaning.",
        sources: []
      };
    } else {
      console.warn("Research chat xatosi:", error?.message || error);
      return {
        id: `res-error-${Date.now()}`,
        role: 'model',
        text: t('research_error_message') || "Uzr, javob berishda xatolik. Qayta urinib ko'ring.",
        sources: []
      };
    }
  }
};

// Ish bo'yicha chat funksiyalari
let caseChat: Chat | null = null;

export const startCaseChat = (caseData: Case, t: (key: string) => string) => {
  const caseSummary = aggregateText(caseData.caseDetails, caseData.files);
  const participantsList = formatParticipantsForPrompt(caseData.participants || [], caseData.clientName || "", (key) => t(key));
  
  caseChat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `Siz professional advokat va huquqshunossiz. Sizga quyidagi ish haqida ma'lumot berilgan:

ISH TAFSILOTLARI:
${caseSummary}

ISHTIROKCHILAR:
${participantsList}

SUD TURI: ${caseData.tags?.[0] || 'Noma\'lum'}
SUD BOSQICHI: ${caseData.courtStage || 'Noma\'lum'}
MIJOZ: ${caseData.clientName || 'Noma\'lum'} (${caseData.clientRole || 'Noma\'lum'})

Sizning vazifangiz - advokatga ushbu ish bo'yicha har qanday savolga aniq, batafsil va professional javob berish. Javobingiz:
- Faqat ushbu ishga tegishli bo'lishi kerak
- Qonun moddalari va sud amaliyotiga asoslangan bo'lishi kerak
- Amaliy tavsiyalar va strategiyalar bilan to'ldirilgan bo'lishi kerak
- Tushunarli va professional tilda yozilgan bo'lishi kerak

Agar savol ishga tegishli bo'lmasa, buni tushuntirib bering va ishga tegishli savollar berishni taklif qiling.`,
    },
  });
};

export const sendCaseMessage = async (text: string, caseData: Case, t: (key: string) => string): Promise<ChatMessage> => {
  // Agar API key muammo aniqlangan bo'lsa, darhol xabar qaytaramiz
  if (apiKeyIssueDetected) {
    return {
      id: `case-error-${Date.now()}`,
      role: 'model',
      text: t('chat_api_key_error') || "Uzr, hozirgi vaqtda AI chat funksiyasi ishlamayapti. Iltimos, keyinroq urinib ko'ring yoki boshqa funksiyalardan foydalaning."
    };
  }

  try {
    if (!caseChat) {
      try {
        startCaseChat(caseData, t);
      } catch (initError: any) {
        // Agar chat yaratishda xato bo'lsa
        if (initError?.message?.includes('403') || initError?.message?.includes('leaked') || initError?.message?.includes('PERMISSION_DENIED')) {
          apiKeyIssueDetected = true;
          return {
            id: `case-error-${Date.now()}`,
            role: 'model',
            text: t('chat_api_key_error') || "Uzr, hozirgi vaqtda AI chat funksiyasi ishlamayapti. Iltimos, keyinroq urinib ko'ring yoki boshqa funksiyalardan foydalaning."
          };
        }
        throw initError;
      }
    }
    const response = await caseChat!.sendMessage({ message: text });
    return { id: `case-${Date.now()}`, role: 'model', text: response.text || "" };
  } catch (error: any) {
    // API key muammo bo'lsa, flag'ni o'rnatamiz va keyingi so'rovlarni to'xtatamiz
    if (error?.message?.includes('403') || error?.message?.includes('leaked') || error?.message?.includes('PERMISSION_DENIED')) {
      apiKeyIssueDetected = true;
    } else {
      console.warn("Case chat xatosi:", error?.message);
    }
    // Agar API key muammo bo'lsa, tushunarli xabar qaytaramiz
    if (error?.message?.includes('403') || error?.message?.includes('leaked') || error?.message?.includes('PERMISSION_DENIED')) {
      return {
        id: `case-error-${Date.now()}`,
        role: 'model',
        text: t('chat_api_key_error') || "Uzr, hozirgi vaqtda AI chat funksiyasi ishlamayapti. Iltimos, keyinroq urinib ko'ring yoki boshqa funksiyalardan foydalaning."
      };
    }
    // Boshqa xatolar uchun
    return {
      id: `case-error-${Date.now()}`,
      role: 'model',
      text: t('chat_error_message') || "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
    };
  }
};

// Ish bo'yicha savol takliflari
export const getSuggestedQuestions = async (caseData: Case, t: (key: string) => string): Promise<string[]> => {
  // Fallback savollar - API key muammo bo'lsa ham ishlaydi
  const fallbackQuestions = [
    t('suggested_question_1') || "Bu ishda eng kuchli argumentlarimiz qanday?",
    t('suggested_question_2') || "Qanday qonun moddalari bizning pozitsiyamizni qo'llab-quvvatlaydi?",
    t('suggested_question_3') || "Raqibning eng kuchli argumentlari qanday va ularga qanday javob beramiz?",
    t('suggested_question_4') || "Bu bosqichda qanday amaliy qadamlar qilish kerak?",
    t('suggested_question_5') || "G'alaba ehtimoli qancha va nima uchun?",
  ];

  // Agar API key muammo aniqlangan bo'lsa, darhol fallback qaytaramiz
  if (apiKeyIssueDetected) {
    return fallbackQuestions;
  }

  try {
    const caseSummary = aggregateText(caseData.caseDetails, caseData.files);
    const prompt = `Quyidagi ish bo'yicha advokat uchun 5 ta foydali va muhim savol taklif qiling. Savollar ishdan kelib chiqib, amaliy va strategik bo'lishi kerak.

ISH TAFSILOTLARI:
${caseSummary.substring(0, 5000)}

SUD TURI: ${caseData.tags?.[0] || 'Noma\'lum'}
SUD BOSQICHI: ${caseData.courtStage || 'Noma\'lum'}
MIJOZ: ${caseData.clientName || 'Noma\'lum'}

Savollar JSON formatida qaytaring:
{
  "questions": ["savol 1", "savol 2", "savol 3", "savol 4", "savol 5"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    if (!response.text) return fallbackQuestions;
    const parsed = extractJson(response.text);
    return parsed.questions || fallbackQuestions;
  } catch (error: any) {
    // API key muammo bo'lsa, flag'ni o'rnatamiz va keyingi so'rovlarni to'xtatamiz
    if (error?.message?.includes('403') || error?.message?.includes('leaked') || error?.message?.includes('PERMISSION_DENIED')) {
      apiKeyIssueDetected = true;
    } else {
      console.warn("Savol takliflari olishda xato:", error?.message);
    }
    // API key muammo bo'lsa ham, fallback savollarni qaytaramiz
    // Bu funksiya boshqa funksiyalarga ta'sir qilmaydi
    return fallbackQuestions;
  }
};

export const prioritizeTasks = async (tasks: string[], t: (key: string) => string): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Vazifalarni saralab bering: ${tasks.join('\n')}`,
            config: { responseMimeType: "application/json" }
        });
        if (!response.text) return tasks;
        return extractJson(response.text).prioritizedTasks || tasks;
    } catch (e) { return tasks; }
};

export const generateDocument = async (template: string, caseData: Case, t: (key: string) => string): Promise<string> => {
    try {
        const fileParts = prepareFileParts(caseData.files);
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: { parts: [{ text: `"${template}" hujjatini yozing.\n\n${caseData.caseDetails}` }, ...fileParts] }
        });
        return response.text?.trim() || "Xatolik.";
    } catch (error) { return "Hujjat yaratib bo'lmadi."; }
};

export const generateClientSummary = async (summaryText: string, t: (key: string) => string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [{ text: `Mijoz uchun tushunarli tilda xulosa: ${summaryText}` }] }
        });
        return response.text?.trim() || "";
    } catch (error) { return ""; }
};

export const generateTimeline = async (caseDetails: string, files: CaseFile[], t: (key: string, replacements?: any) => string): Promise<TimelineEvent[]> => {
    try {
        const fileParts = prepareFileParts(files);
        let fullPrompt = `Ish materiallarini tahlil qilib, xronologik voqealar va muhim muddatlarni aniqlang (JSON formatda: {"timeline": [{"date": "YYYY-MM-DD", "description": "...", "type": "event"}]}).\n\n${t('prompt_language_enforcement')}`;

        const response = await ai.models.generateContent({ 
            model: "gemini-3-flash-preview", 
            contents: { parts: [{ text: fullPrompt }, ...fileParts] }, 
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        timeline: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    date: { type: Type.STRING }, 
                                    description: { type: Type.STRING },
                                    type: { type: Type.STRING, enum: ['event', 'deadline'] }
                                }, 
                                required: ["date", "description", "type"] 
                            } 
                        } 
                    }, 
                    required: ["timeline"] 
                }, 
                temperature: 0.1 
            } 
        });
        if (!response.text) return [];
        return extractJson(response.text).timeline || [];
    } catch (error) { return []; }
};

export const transcribeAudioMemo = async (base64Audio: string, t: (key: string) => string): Promise<string> => {
    try {
        const prompt = t('prompt_voice_memo_transcribe') + `\n\n${t('prompt_language_enforcement')}`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: 'audio/webm', data: base64Audio } }
                ]
            }
        });
        return response.text?.trim() || "Ovozli xabarni matnga aylantirib bo'lmadi.";
    } catch (error) {
        return "Xatolik yuz berdi.";
    }
};
