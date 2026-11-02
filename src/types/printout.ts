/** Everything the printed page shows, already worded. */
export type Printout = {
  isDraft: boolean;
  doctor: {
    name: string;
    qualifications: string;
    speciality: string;
    pmdc: string;
  };
  clinic: {
    name: string;
    address: string;
    schedule: string;
    phone: string;
  };
  patient: { name: string; ageSex: string; mrNo: string; date: string };
  vitals: { key: string; label: string; value: string }[];
  allergy: string | null;
  diagnosis: string[];
  complaints: string[];
  investigations: string[];
  followUp: { date: string; note: string } | null;
  medicines: {
    id: string;
    title: string;
    en: string;
    ur: string;
    dose: string;
    duration: string;
  }[];
  avoid: string[];
  eatMore: string[];
  advice: string[];
  rxNumber: string | null;
  /**
   * The QR that checks an approved prescription, from the server. Null on a
   * draft, which no one should be able to check as genuine.
   */
  verifyQrUrl: string | null;
  signature: string;
  signedBy: string;
};

/** How this computer prints: its own settings, kept in the browser. */
export type PrintOptions = {
  /** `preprinted` leaves the top blank for the clinic's own pads. */
  header: 'letterhead' | 'preprinted';
  /** `en_ur` adds the Urdu dose line under each medicine. */
  language: 'en' | 'en_ur';
  /** The blank space above the page's content, in millimetres. */
  topMarginMm: number;
  copies: number;
};
