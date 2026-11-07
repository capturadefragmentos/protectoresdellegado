# Protectores del Legado: guía de publicación y edición

La web queda publicada en internet y tiene un **panel de administración** en `/admin`. Desde ahí agregas episodios, documentales, productos y experiencias de la comunidad con formularios, sin tocar código.

Así funciona:

```
Tú editas en /admin  →  se guarda en GitHub  →  Netlify actualiza la web sola (1–2 min)
```

La configuración se hace **una sola vez**. Toma unos 20 minutos y todo es gratis.

---

## Parte A · Subir la web a GitHub

1. Crea una cuenta gratis en **https://github.com** y anota tu **nombre de usuario**.
2. Arriba a la derecha, haz clic en **＋ → New repository**.
   - Repository name: `protectores-del-legado` (escríbelo exactamente así)
   - Marca **Public**
   - No marques ninguna otra casilla. Clic en **Create repository**.
3. En la página del repositorio vacío, haz clic en el enlace **«uploading an existing file»**.
4. Abre la carpeta `protectores-del-legado` en tu computadora, **selecciona todo lo que hay dentro** (index.html, admin, contenido, css, img, js y LEEME.md) y arrástralo a GitHub. No arrastres la carpeta misma, sino su contenido. Usa Chrome o Edge para que se conserven las subcarpetas.
5. Espera a que termine de subir y haz clic en **Commit changes**.
6. Abre el archivo `admin/config.yml` → clic en el ícono del **lápiz** ✏️ → en la línea `repo: TU-USUARIO/protectores-del-legado` reemplaza `TU-USUARIO` por tu usuario de GitHub → **Commit changes**.

## Parte B · Publicar con Netlify

1. Entra a **https://app.netlify.com** y regístrate con el botón **GitHub**. Es lo más fácil, porque ya quedan conectados.
2. Clic en **Add new project** (o *Add new site*) → **Import an existing project** → **GitHub** → autoriza → elige `protectores-del-legado`.
3. Deja **vacíos** los campos de *Build command* y *Publish directory* → **Deploy**.
4. En un minuto tendrás tu enlace público. Para cambiarle el nombre: **Project configuration → Change project name** → por ejemplo `protectoresdellegado`. Tu enlace será `https://protectoresdellegado.netlify.app`.

## Parte C · Activar el inicio de sesión del panel (una sola vez)

**En GitHub:**
1. Haz clic en tu foto (arriba a la derecha) → **Settings** → al final del menú izquierdo, **Developer settings** → **OAuth Apps** → **New OAuth App**.
2. Completa:
   - Application name: `Panel Protectores del Legado`
   - Homepage URL: tu enlace de Netlify, por ejemplo `https://protectoresdellegado.netlify.app`
   - Authorization callback URL: `https://api.netlify.com/auth/done`
3. Clic en **Register application**. Copia el **Client ID**. Luego haz clic en **Generate a new client secret** y cópialo también: solo se muestra una vez.

**En Netlify:**
4. Entra a tu proyecto → **Project configuration** → **Access & security** → **OAuth** → **Install provider** → elige **GitHub** → pega el Client ID y el Secret → **Install**.

## Parte D · Usar el panel (esto es lo que harás siempre)

1. Entra a `https://protectoresdellegado.netlify.app/admin`.
2. Clic en **Login with GitHub**.
3. Verás estas secciones: 🎙️ El Murmullu · 🎬 Documentales · 🤝 Comunidad · 🛍️ Tienda · 👥 Equipo · ⚙️ Datos generales · 🏺 Historia y trivia.
4. Edita lo que necesites y presiona **Publicar** (*Publish*). En uno o dos minutos el cambio aparece en la web.

**Ejemplos:**
- **Publicar un episodio:** El Murmullu → abre el episodio → pega el enlace de YouTube y el de Spotify → Estado: *Disponible* → Publicar.
- **Agregar un integrante del equipo:** Equipo → «Añadir integrante» → nombre, rol y foto → Publicar.
- **Poner precio a un producto:** Tienda → producto → Precio `S/ 25` → Publicar.
- **Video de portada:** Datos generales → Video de portada → sube un .mp4 corto y sin audio. Lo ideal es que pese menos de 10 MB.

## Si algo no funciona

- **El panel no te deja entrar:** revisa que en `admin/config.yml` esté bien escrito tu usuario de GitHub y que la callback URL sea exactamente `https://api.netlify.com/auth/done`.
- **La web no se actualizó:** espera dos minutos y recarga con Ctrl+F5. En Netlify, pestaña *Deploys*, puedes ver si la publicación terminó.
- **Volver a una versión anterior:** en Netlify → *Deploys* → elige una versión antigua → *Publish deploy*.
- **Ver la web en tu computadora:** si abres `index.html` con doble clic, el contenido no carga, porque el navegador bloquea esos archivos. Revisa siempre la versión publicada.

## Más adelante: dominio propio

1. Compra el dominio (por ejemplo `protectoresdellegado.com`, aprox. 10–15 USD al año). Lo más simple es comprarlo desde Netlify: **Domain management → Add a domain**.
2. Netlify lo conecta y activa el HTTPS gratis.
3. En la OAuth App de GitHub (Parte C) cambia la *Homepage URL* por tu nuevo dominio.

## Estructura de archivos (referencia)

```
index.html          página principal
admin/              panel de administración (config.yml = qué se puede editar)
contenido/*.json    todos los textos, episodios, productos… (lo que edita el panel)
img/subidas/        fotos que subas desde el panel
css/ js/ img/       diseño, funcionamiento y recursos de marca
```
