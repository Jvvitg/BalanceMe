# Manual de Sistema - BalanceMe

## 1. Descripción General
**BalanceMe** es una aplicación web progresiva (PWA) diseñada para ayudar a los usuarios a construir y mantener hábitos saludables, gestionar tareas diarias y visualizar su progreso a través de estadísticas y gamificación.

## 2. Arquitectura del Sistema
El sistema sigue una arquitectura **Client-Server** moderna, desacoplada y basada en la nube.

### 2.1 Frontend (Cliente)
-   **Framework**: React (v18) con Vite como empaquetador.
-   **Lenguaje**: JavaScript (ES6+).
-   **UI Library**: Chakra UI para componentes de interfaz modernos y responsivos.
-   **Enrutamiento**: React Router DOM (v6).
-   **Gestión de Estado**: React Hooks (useState, useEffect, useContext).
-   **Gráficos y Visualización**: React Calendar.
-   **Generación de Reportes**: jsPDF y jspdf-autotable.

### 2.2 Backend (Servidor y Base de Datos)
-   **Plataforma**: Supabase (Backend-as-a-Service).
-   **Base de Datos**: PostgreSQL.
-   **Autenticación**: Supabase Auth (Email/Password).
-   **Seguridad**: Row Level Security (RLS) para proteger los datos de cada usuario.

## 3. Modelo de Datos (Base de Datos)

### Tablas Principales

1.  **`profiles`**
    -   Almacena información extendida del usuario.
    -   Campos: `id` (FK auth.users), `full_name`, `age`, `purpose`, `avatar_url`.

2.  **`habitos`**
    -   Define los hábitos que el usuario quiere seguir.
    -   Campos: `id`, `user_id` (FK), `name`, `frequency` (diario, semanal), `created_at`.

3.  **`registros`**
    -   Historial de cumplimiento de hábitos.
    -   Campos: `id`, `user_id` (FK), `habito_id` (FK), `fecha` (DATE), `completado` (BOOLEAN).

4.  **`tasks`**
    -   Gestión de tareas pendientes y diarias.
    -   Campos: `id`, `user_id` (FK), `title`, `description`, `is_completed`, `due_date`.

5.  **`user_achievements`**
    -   Registro de logros desbloqueados por el usuario (Gamificación).
    -   Campos: `id`, `user_id` (FK), `achievement_id` (string), `unlocked_at`.

## 4. Flujos Principales

### 4.1 Autenticación y Onboarding
-   El usuario se registra/inicia sesión.
-   Si es su primera vez, se le redirige a `/onboarding` para completar su perfil.
-   Una vez completado, accede al Dashboard principal.

### 4.2 Gestión de Hábitos
-   El usuario crea hábitos en `/dashboard`.
-   Marca el cumplimiento diario.
-   El sistema guarda un registro en la tabla `registros`.

### 4.3 Progreso y Reportes
-   El sistema calcula estadísticas (racha, días totales) en tiempo real.
-   El usuario puede descargar un PDF con su resumen desde la barra lateral.
