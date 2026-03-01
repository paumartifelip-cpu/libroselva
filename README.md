# LibroSelva 🌳

Una red social minimalista tipo Twitter construida con **HTML, CSS y JavaScript puro (Vanilla JS)** y conectada a **Supabase**.

## 🚀 Cómo probar en local
1. Clona este repositorio o descarga los archivos.
2. Abre el archivo `index.html` directamente en tu navegador (Chrome, Safari, Edge, etc.).
3. ¡Eso es todo! No necesitas `npm` ni `node`.

## 🏪 Cómo desplegar en Cloudflare Pages
Sigue estos pasos para poner tu app en internet:

### 1. Preparar GitHub
1. Crea un nuevo repositorio en tu GitHub llamado `libroselva`.
2. Sube estos archivos (`index.html`, `style.css`, `app.js`, `config.js`, `_redirects`).

### 2. Configurar Cloudflare Pages
1. Entra en tu panel de [Cloudflare](https://dash.cloudflare.com/).
2. Ve a **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Selecciona tu repositorio `libroselva`.
4. **Configuración de Build:**
   - Framework preset: `None`
   - Build command: (dejar vacío)
   - Build output directory: (dejar vacío, o poner `./`)
5. Pulsa en **Save and Deploy**.

### 3. Variables de Entorno (Opcional)
En esta versión "Vainilla", hemos puesto las llaves en `config.js` por simplicidad técnica, pero si quieres usar variables de entorno reales, necesitarías un proceso de build (como Vite o Webpack). Para este tutorial, `config.js` es suficiente.

## 📦 Estructura del Almacén (Supabase)
Si quieres replicar este proyecto, crea estas tablas en el SQL Editor de Supabase:

```sql
create table posts (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  device_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, device_id)
);
```