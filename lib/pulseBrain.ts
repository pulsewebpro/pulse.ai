export type PulseTone = 'intro'|'cta'|'humor'|'warning'|'cierre';
const LIB: Record<string, string> = {
  intro:   'Tu web antes de que se te enfríe el café ☕⚡',
  cta:     'Pulsa y te enseño la preview en 1 min.',
  humor:   'Inhalo café… exhalo código.',
  warning: 'Ups, café derramado. Reintentamos en 3,2,1…',
  cierre:  'Listo para lanzar: un clic y lo tienes online hoy.',
  closing: 'Ready to launch. One click and you are live.',
  close:   'Cierre listo. Lanzamos.',
  final:   'Último sorbo y live.',
  outro:   'Gracias por pasar, ¿lo lanzamos?',
  venta:   'Oferta clara: lanza ahora, corrige después.'
};
// Acepta cualquier string y hace fallback a 'intro' si no existe.
export function frase(tone?: string): string {
  return LIB[tone ?? 'intro'] ?? LIB.intro;
}
