# Video para TikTok / Reels

**`parfect-tiktok.mp4`** — vertical 4K **2160×3840 (9:16)**, H.264, **15 s**, ~25 MB.
Fiel a la marca real (fondo verde-cielo, hero lima, números navy, personajes 3D, wordmark itálico).

## Las 5 escenas
1. **Intro** — marca + golfista 3D + *"Deja de practicar. Empieza a mejorar."*
2. **Gancho** — *"¿Sabes de verdad cómo juegas?"*
3. **Tus números** — hero con hándicap 7 + tarjetas (56/51/41, putts, birdies)
4. **Diagnóstico** — *"Deja de practicar al azar."* + Prioridad 1: Putting + drill
5. **CTA** — *"50 fundadores en Morelia"* + golfista y bandera 3D + @parfect.golf

Transiciones por crossfade + zoom suave (Ken Burns) por escena.

## Cómo se hace (sin ffmpeg — usa lo nativo de macOS)
1. `_build_video.py` (Pillow) → genera `frames/*.png` (4K) + `manifest.txt` (path + escala por frame), incrustando tus PNG reales de `assets/`.
2. `_encode.swift` (AVFoundation) → lee el manifest y escribe el MP4 H.264 + un `.thumb.png` de verificación.

```bash
cd ~/claude/parfect/marketing/video
python3 _build_video.py
swiftc -O _encode.swift -o _encode
./_encode manifest.txt parfect-tiktok.mp4
```

## Editar
- Textos/datos/escenas → `_build_video.py` (funciones `scene_*`). Cambia los datos demo (7, 56%, 32.3…) por los reales.
- Duración por escena → `HOLD` (frames); transición → `XF`.
- `frames/` (25 MB) es **regenerable**: puedes borrarla; se vuelve a crear al correr el script.

## Subir
- TikTok/Reels aceptan 9:16 directo. La música la pones en la app (no se puede incrustar audio con copyright aquí).
- Sugerencia de caption: *"¿Sabes de verdad cómo juegas? 📊 Busco 50 fundadores en Morelia. Gratis. Link en bio. #golfmexico #golfmorelia #parfect"*
