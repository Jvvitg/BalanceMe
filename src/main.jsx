import React from 'react'
import ReactDOM from 'react-dom/client'

// 1. Importamos TODAS las librerías de JS
// ¡CAMBIO! Importamos 'extendTheme' para crear nuestro tema
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

// 2. Importamos NUESTRAS páginas
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Progreso from './pages/Progreso.jsx';

// 3. Importamos TODOS los CSS al FINAL.
import './index.css'

// 4. ¡NUEVO! Definimos el tema para forzar el Modo Oscuro
const config = {
  initialColorMode: 'dark',  // Forzamos el modo oscuro
  useSystemColorMode: false, // Ignoramos la configuración del OS
};
const theme = extendTheme({ config }); // Creamos el tema

// 5. Definimos nuestras rutas (sin cambios)
const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/progreso",
    element: <Progreso />,
  },
]);

// 6. Renderizamos (¡con el 'theme'!)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ¡CAMBIO! Le pasamos nuestro 'theme' personalizado */}
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} /> 
    </ChakraProvider>
  </React.StrictMode>,
)