
import { GoogleGenAI, Type } from "@google/genai";
import { PIPData } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async validateAndCleanData(rawData: Partial<PIPData>[]): Promise<PIPData[]> {
    if (rawData.length === 0) return [];
    const dataToProcess = rawData.slice(0, 5);

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Review and structure the following school PIP data. Ensure all fields follow formal Indonesian naming conventions.
        Ensure "jenisKelamin" is normalized to "Laki-laki" or "Perempuan".
        Ensure "jenisSekolah" is normalized to "SMAK" or "SMTK".
        Ensure "tahunPenerimaan" is either "2024" or "2025".
        Data: ${JSON.stringify(dataToProcess)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                nik: { type: Type.STRING },
                nisn: { type: Type.STRING },
                namaLengkap: { type: Type.STRING },
                jenisKelamin: { type: Type.STRING },
                tempatTanggalLahir: { type: Type.STRING },
                nikIbu: { type: Type.STRING },
                namaIbu: { type: Type.STRING },
                emis: { type: Type.STRING },
                npsn: { type: Type.STRING },
                jenisSekolah: { type: Type.STRING },
                namaSekolah: { type: Type.STRING },
                kabKota: { type: Type.STRING },
                provinsi: { type: Type.STRING },
                bank: { type: Type.STRING },
                noRekening: { type: Type.STRING },
                namaRekening: { type: Type.STRING },
                nominal: { type: Type.STRING },
                tahunPenerimaan: { type: Type.STRING },
              },
              propertyOrdering: [
                "nik", "nisn", "namaLengkap", "jenisKelamin", "tempatTanggalLahir", "nikIbu", 
                "namaIbu", "emis", "npsn", "jenisSekolah", "namaSekolah", "kabKota", 
                "provinsi", "bank", "noRekening", "namaRekening", "nominal", "tahunPenerimaan"
              ],
            }
          }
        }
      });

      const text = response.text;
      return text ? JSON.parse(text.trim()) : (rawData as PIPData[]);
    } catch (error) {
      console.error("Gemini Validation Error:", error);
      return rawData as PIPData[];
    }
  }
}

export const geminiService = new GeminiService();
