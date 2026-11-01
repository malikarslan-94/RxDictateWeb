/** A location as its card in Settings › Locations shows it. */
export type LocationCardItem = {
  id: string;
  name: string;
  isDefault: boolean;
  address: string;
  /** "Mon–Sat · 5–9 pm", or that the hours aren't set. */
  hours: string;
  /** The assistants working there, or that there are none yet. */
  assistants: string;
  edit: () => void;
  preview: () => void;
};
