
export interface PIPData {
  nik: string;
  nisn: string;
  namaLengkap: string;
  jenisKelamin: string;
  tempatTanggalLahir: string;
  nikIbu: string;
  namaIbu: string;
  emis: string;
  npsn: string;
  jenisSekolah: string;
  namaSekolah: string;
  kabKota: string;
  provinsi: string;
  bank: string;
  noRekening: string;
  namaRekening: string;
  nominal: string;
  tahunPenerimaan: string;
  [key: string]: string;
}

export interface FormField {
  id: keyof PIPData;
  label: string;
  placeholder: string;
  type: 'text' | 'number' | 'select';
  required: boolean;
  options?: string[];
  validation?: (val: string) => string | null;
}

export interface AppSettings {
  googleWebAppUrl: string;
}
