import React from 'react'
import ReactDOM from 'react-dom/client'

// 1. Importamos TODAS las librerías de JS
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

// 2. Importamos NUESTRAS páginas
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Progreso from './pages/Progreso.jsx';
import Home from './pages/Home.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Tasks from './pages/Tasks.jsx';
import Logros from './pages/Logros.jsx';
import Layout from './components/Layout.jsx'; // <--- IMPORTAMOS EL LAYOUT

// 3. Importamos TODOS los CSS al FINAL.
import './index.css'

// 4. Definimos el tema para forzar el Modo Oscuro
const config = {
  initialColorMode: 'dark',  // Forzamos el modo oscuro
  useSystemColorMode: false, // Ignoramos la configuración del OS
};
const theme = extendTheme({ 
  config,
  fonts: {
    heading: "'Outfit', sans-serif",
    body: "'Outfit', sans-serif",
  },
}); // Creamos el tema

// 5. Definimos nuestras rutas
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, 
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/tasks",
        element: <Tasks />,
      },
      {
        path: "/logros",
        element: <Logros />,
      },
      {
        path: "/progreso",
        element: <Progreso />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
  },
]);

// 6. Renderizamos
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} /> 
    </ChakraProvider>
  </React.StrictMode>,
)