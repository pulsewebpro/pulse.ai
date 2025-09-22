# 📂 PULSE · NORMAS (ÍNDICE MAESTRO)

Bienvenido/a a la carpeta **NORMAS** de Pulse.  
Este directorio contiene los documentos fundacionales que todo colaborador (humano o agente) debe leer **antes de tocar una sola línea de código**.

---

## 📑 Orden de lectura y jerarquía

1. **testamento.md** (OBLIGATORIO, nivel contrato)  
   - Reglas inquebrantables.  
   - Legalidad internacional, confidencialidad, eficiencia.  
   - Guardias técnicos (`guard-home`, `check-magic`, `require-intent`).  
   - Deploy checklist.

2. **vision.md** (Visión global)  
   - Identidad visual (robot, café, paleta cristal/oro/cian).  
   - Valores y rituales.  
   - Planes de producto (5/39/59).  
   - Experiencia WOW en <60s.  
   - Extensible: pricing, i18n, rituales, colores.

3. **psicologia.md** (El libro completo)  
   - Psicología interna: cómo piensa y decide Pulse.  
   - Demo vs Premium: mecánica emocional.  
   - Cómo baraja opciones en 1 min.  
   - Cómo guía y propone mejoras.  
   - Contrato emocional con el usuario.

4. **ladrillos.md** (Manual técnico)  
   - Los 10 ladrillos de Pulse, con tablas.  
   - Objetivo, entradas, salidas, QA automático y humano.  
   - Ejemplos válidos/prohibidos.

---

## ✅ Checklist antes de trabajar
- [ ] Leíste `testamento.md` completo.  
- [ ] Revisaste `vision.md` para entender el contexto.  
- [ ] Consultaste `psicologia.md` si trabajas en UX, copy o IA.  
- [ ] Usaste `ladrillos.md` si implementas funcionalidad.  
- [ ] Ejecutaste `scripts/preflight.sh` antes de cualquier commit.  

---

## 🚫 Qué NO hacer
- ❌ No tocar la HOME (`/pages/index.*`).  
- ❌ No usar “lorem ipsum” ni placeholders genéricos.  
- ❌ No mencionar marcas externas.  
- ❌ No guardar datos sin consentimiento explícito.  
- ❌ No hacer cambios sin `codex.intent.json`.

---

## ⚖️ Legal Reminder
Pulse está blindado con **legalidad internacional 1000%**:  
- Privacidad (RGPD/CCPA equivalentes).  
- Accesibilidad (WCAG AA).  
- Precios con impuestos claros.  
- Bloqueo regional en caso de sanciones.  
- Confidencialidad: este repo es privado.

---
## Configuración local
1. Duplica `.env.local.example` → renómbralo `.env.local`.
2. Rellena con tus claves reales (no se comparten).
3. `.env.local` está en `.gitignore`, nunca se sube al repo.

☕⚡ **Recuerda:**  
“Inhalo café… exhalo código.”  
