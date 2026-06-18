# PARFECT · Puesta en línea 0–100

Datos de tu proyecto (ya en el código):
- **Supabase URL:** `https://xvkbkhyznwoaljjnsxue.supabase.co`
- **Callback de Google (para Supabase):** `https://xvkbkhyznwoaljjnsxue.supabase.co/auth/v1/callback`
- **URL actual de la app:** `https://rorropirrorro69.github.io/parfect/`
- **URL final (tras renombrar):** `https://parfectgolf.github.io`

El código de "Continuar con Google" y email ya está desplegado. Faltan estos pasos en tus cuentas.

---

## A) Login con Google

### 1. Google Cloud Console — https://console.cloud.google.com
1. Crea un proyecto: **PARFECT**.
2. **APIs y servicios → Pantalla de consentimiento de OAuth** → tipo **External** →
   - Nombre de la app: **PARFECT**
   - Correo de soporte y de contacto: tu Gmail
   - Guarda. (Puedes dejarlo en "Testing" con tu correo agregado como usuario de prueba, o **Publicar** para que entre cualquiera.)
3. **APIs y servicios → Credenciales → Crear credenciales → ID de cliente de OAuth** → tipo **Aplicación web**:
   - **Orígenes de JavaScript autorizados:**
     - `https://rorropirrorro69.github.io`
     - `https://parfectgolf.github.io` (agrégalo también para cuando renombres)
   - **URI de redireccionamiento autorizados:**
     - `https://xvkbkhyznwoaljjnsxue.supabase.co/auth/v1/callback`
   - Crear → **copia el Client ID y el Client Secret**.

### 2. Supabase — https://app.supabase.com (tu proyecto)
1. **Authentication → Providers → Google** → **Enable** → pega **Client ID** y **Client Secret** → **Save**.
2. **Authentication → URL Configuration**:
   - **Site URL:** `https://rorropirrorro69.github.io/parfect/` (cámbiala a `https://parfectgolf.github.io` cuando renombres)
   - **Redirect URLs** (agrega estas dos, con `/**` al final):
     - `https://rorropirrorro69.github.io/parfect/**`
     - `https://parfectgolf.github.io/**`

Listo: el botón "Continuar con Google" ya inicia sesión.

---

## B) Login con email/contraseña
- **Authentication → Providers → Email** debe estar **enabled** (viene activado).
- Para que entren al instante en demos: **Authentication → Providers → Email → desactiva "Confirm email"**.
  (Para producción seria, déjalo activado; ya manejamos el aviso de "confirma tu correo".)
- Usa el mismo **Site URL / Redirect URLs** del paso A2.

---

## C) URL limpia gratis (github.io)
1. github.com → tu foto → **Settings → Account → Change username** → **parfectgolf**.
2. Repo → **Settings → General → Repository name** → **parfectgolf.github.io** → **Rename**.
3. Repo → **Settings → Pages** → Branch **main** / **(root)** → **Save**.
   → Tu sitio queda en **https://parfectgolf.github.io** (el deck en `/deck/`).
4. Dime **"listo"** y yo actualizo el remoto de git y verifico.
5. Después del rename, agrega `https://parfectgolf.github.io` en Google Cloud (orígenes) y Supabase (Site URL + Redirect URLs).

> Recomendado: haz **C primero** y configura A/B con la URL final, para no repetir.

---

## D) Coach IA real (Birdie con IA)
Desde la carpeta `parfect/` con el CLI de Supabase:
```bash
supabase functions deploy coach --no-verify-jwt
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```
(Guía completa en `supabase/functions/coach/README.md`.)

---

## Checklist
- [ ] Google Cloud: OAuth client (origins + redirect a Supabase)
- [ ] Supabase: Google provider con Client ID/Secret
- [ ] Supabase: Site URL + Redirect URLs
- [ ] Email: confirmación on/off según prefieras
- [ ] (Opcional) Renombrar usuario/repo → parfectgolf.github.io → avísame
- [ ] (Opcional) Desplegar Edge Function `coach` + secreto
