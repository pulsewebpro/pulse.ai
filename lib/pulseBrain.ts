export type PulseTone = 'intro' | 'cta' | 'humor' | 'warning' | 'cierre';

export function frase(tone: PulseTone = 'intro'): string {
  const lib: Record<PulseTone, string> = {
    intro:   'Tu web antes de que se te enfríe el café ☕⚡',
    cta:     'Pulsa y te enseño la preview en 1 min.',
    humor:   'Inhalo café… exhalo código.',
    warning: 'Ups, café derramado. Reintentamos en 3,2,1…',
    cierre:  'Listo para lanzar: un clic y lo tienes online hoy.',
  };
  return lib[tone] ?? lib.intro;
}
