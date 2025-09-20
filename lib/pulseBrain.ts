export type PulseTone = 'intro'|'cta'|'humor'|'warning';

export function frase(tone: PulseTone = 'intro'): string {
  const lib: Record<PulseTone, string> = {
    intro:   'Tu web antes de que se te enfríe el café ☕⚡',
    cta:     '¿Listx para ver tu preview?',
    humor:   'Inhalo café… exhalo código.',
    warning: 'Ups, café derramado. Reintentamos en 3,2,1…',
  };
  return lib[tone] ?? lib.intro;
}
