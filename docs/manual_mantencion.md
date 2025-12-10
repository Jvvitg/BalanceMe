# Manual de Mantención - BalanceMe

Este documento sirve como guía para el mantenimiento continuo, la resolución de problemas y la extensión de la aplicación **BalanceMe**.

## 1. Tareas de Mantenimiento Rutinario

### 1.1 Actualización de Dependencias
Es recomendable mantener las librerías actualizadas para recibir parches de seguridad y mejoras de rendimiento.

**Comando para verificar actualizaciones:**
```bash
npm outdated
```

**Comando para actualizar:**
```bash
npm update
```
> **Precaución**: Las actualizaciones mayores (Major versions) pueden romper la compatibilidad. Revise siempre el `package.json` y las notas de la versión.

### 1.2 Copias de Seguridad (Base de Datos)
Supabase realiza copias de seguridad automáticas, pero para mayor seguridad:
1.  Vaya al Dashboard de Supabase > Database > Backups.
2.  Descargue un dump SQL periódicamente si el plan lo permite.
3.  Alternativamente, exporte los datos CSV desde el Table Editor.

## 2. Resolución de Problemas Comunes (Troubleshooting)

### Error: "Layout is not defined" o Pantalla en Blanco
*   **Causa**: Importación faltante en `main.jsx` o error de sintaxis.
*   **Solución**: Verifique que `Layout` esté importado correctamente desde `./components/Layout.jsx` y que no haya errores de sintaxis en la consola.

### Error: No se guardan los datos
*   **Causa**: Problemas con las políticas RLS (Row Level Security) en Supabase.
*   **Solución**: Revise las políticas en Supabase. Asegúrese de que el usuario autenticado tenga permisos `INSERT` y `SELECT` sobre su propio `user_id`.

### Error: La aplicación no conecta a Supabase
*   **Causa**: Variables de entorno incorrectas o faltantes.
*   **Solución**: Verifique el archivo `.env`. Asegúrese de que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` sean correctas. Reinicie el servidor (`npm run dev`) tras cualquier cambio en el `.env`.

## 3. Extensibilidad

### Agregar una Nueva Página
1.  Cree el componente en `src/pages/NuevaPagina.jsx`.
2.  Impórtelo en `src/main.jsx`.
3.  Agregue una nueva ruta en el `router` dentro de `main.jsx`.
4.  (Opcional) Agregue un enlace en el array `LinkItems` en `src/components/Layout.jsx` para que aparezca en el menú.

### Modificar el Tema
Edite el objeto `theme` en `src/main.jsx` para cambiar colores globales, tipografías o estilos de componentes de Chakra UI.

## 4. Soporte
Para problemas no cubiertos en este manual, contacte al equipo de desarrollo o revise la documentación oficial de las tecnologías utilizadas (React, Supabase, Chakra UI).
