
import { GoogleGenAI, Type } from "@google/genai";
import { PIPData } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async validateAndCleanData(rawData: Partial<PIPData>[]): Promise<PIPData[]> {
    if (rawData.length === 0) return [];

    // Jika data sangat banyak (misal > 100 baris), kita lewati AI agar tidak kena limit token 
    // dan memastikan semua data tetap masuk (reliability first)
    if (rawData.length > 100) {
      console.log("Data batch besar, melewati validasi AI untuk memastikan semua data masuk.");
      return rawData as PIPData[];
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Review and structure the following school PIP data. 
        - Ensure "jenisKelamin" is "Laki-laki" or "Perempuan".
        - Ensure "jenisSekolah" is "SMAK" or "SMTK".
        - Fix common typos in names or city names.
        - Return the EXACT same number of items as provided in input.
        Data: ${JSON.stringify(rawData)}`,
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
              required: ["nik", "nisn", "namaLengkap"],
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
      if (!text) return rawData as PIPData[];
      
      const cleanedData = JSON.parse(text.trim());
      
      // Keamanan tambahan: Jika jumlah data dari AI berbeda dengan input, gunakan input asli
      if (cleanedData.length !== rawData.length) {
        console.warn("AI returned different count, using raw data");
        return rawData as PIPData[];
      }
      
      return cleanedData;
    } catch (error) {
      console.error("Gemini Validation Error:", error);
      return rawData as PIPData[];
    }
  }
}

export const geminiService = new GeminiService();
