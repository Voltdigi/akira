export interface SoundOption {
  id: string;
  label: string;
  src: string;
}

export const SOUND_OPTIONS: SoundOption[] = [
  { id: "sound1", label: "Sound 1", src: "/sounds/baby-coo.mp3" },
  { id: "sound2", label: "Sound 2", src: "/sounds/googoo-gaga.mp3" },
];

export const DEFAULT_SOUND_ID = SOUND_OPTIONS[0].id;
