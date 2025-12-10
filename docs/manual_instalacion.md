# Manual de Instalación - BalanceMe

Este documento detalla los pasos necesarios para instalar y ejecutar el entorno de desarrollo de **BalanceMe** en una máquina local.

## 1. Prerrequisitos

Antes de comenzar, asegúrese de tener instalado el siguiente software:

*   **Node.js**: Versión 16.0.0 o superior. [Descargar aquí](https://nodejs.org/)
*   **Git**: Para clonar el repositorio. [Descargar aquí](https://git-scm.com/)
*   **Editor de Código**: Recomendado Visual Studio Code.

## 2. Instalación Paso a Paso

### Paso 1: Clonar el Repositorio
Abra una terminal y ejecute el siguiente comando para descargar el código fuente:

```bash
git clone https://github.com/usuario/balanceme.git
cd balanceme
```

### Paso 2: Instalar Dependencias
Instale las librerías necesarias del proyecto ejecutando:

```bash
npm install
```
Esto descargará paquetes como React, Chakra UI, Supabase Client, etc.

### Paso 3: Configuración de Variables de Entorno
Cree un archivo llamado `.env` en la raíz del proyecto. Este archivo debe contener las credenciales de conexión a Supabase.

Copie el siguiente formato y reemplace con sus claves reales:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-publica
```

> **Nota**: Puede obtener estas claves en el panel de control de su proyecto en Supabase (Settings > API).

### Paso 4: Ejecutar el Servidor de Desarrollo
Para iniciar la aplicación en modo local:

```bash
npm run dev
```

La terminal mostrará una URL local (generalmente `http://localhost:5173`). Abra esa dirección en su navegador web.

## 3. Configuración de Base de Datos (Supabase)

Si está instalando el proyecto desde cero, necesitará crear las tablas en Supabase. Ejecute los scripts SQL proporcionados en la documentación del proyecto (o en el editor SQL de Supabase) para crear:

1.  `profiles`
2.  `habitos`
3.  `registros`
4.  `tasks`
5.  `user_achievements`

Asegúrese de habilitar **Row Level Security (RLS)** en todas las tablas para garantizar la privacidad de los datos.

## 4. Verificación
Si todo se ha instalado correctamente:
1.  Verá la pantalla de Login al abrir la app.
2.  Podrá registrar un usuario nuevo.
3.  La consola del navegador no debería mostrar errores de conexión a Supabase.
