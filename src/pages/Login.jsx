import React, { useEffect, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';

// Importaciones de Chakra UI
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  Image, 
  VStack,
} from '@chakra-ui/react';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient.js';

// Importa tus imágenes aquí
import fondo1 from '../assets/fondo-login.png';
import fondo2 from '../assets/fondo-login2.png';
import fondo3 from '../assets/fondo-login3.png';
import fondo4 from '../assets/fondo-login4.png';

const IMAGENES_FONDO = [fondo1, fondo2, fondo3, fondo4];

// --- TEMA PERSONALIZADO PARA EL FORMULARIO (MODO CLARO) ---
const customTheme = {
    ...ThemeSupa,
    default: {
      colors: {
        brand: 'indigo',
        brandAccent: '#764ba2',
        // Forzamos colores claros para los inputs y textos del formulario
        inputText: '#2D3748', // Texto gris oscuro
        inputLabelText: '#718096', // Etiqueta gris más suave
        inputBorder: '#E2E8F0', // Borde muy suave (gray.200)
        inputBackground: '#F7FAFC', // Fondo muy sutil (gray.50)
        inputPlaceholder: '#A0AEC0',
      },
      radii: {
        borderRadiusButton: '12px',
        buttonBorderRadius: '12px',
        inputBorderRadius: '12px',
      },
      space: {
        inputPadding: '12px',
        buttonPadding: '12px',
      },
      fonts: {
        bodyFontFamily: `'Outfit', sans-serif`,
        buttonFontFamily: `'Outfit', sans-serif`,
      },
      borderWidths: {
        buttonBorderWidth: '0px',
        inputBorderWidth: '1px',
      },
    }
};

// --- ESTILOS DE APARIENCIA DE SUPABASE (CONSTANTES ESTABLES) ---
const authAppearance = {
  theme: customTheme,
  style: {
    button: {
      background: 'linear-gradient(to right, #667eea, #764ba2)',
      border: 'none',
      color: 'white',
      fontWeight: 'bold',
      borderRadius: '12px',
      padding: '12px',
      fontSize: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.2s ease',
    },
    anchor: {
      color: '#667eea',
      fontWeight: '500',
    },
    container: {
      gap: '16px',
    },
    divider: {
      background: '#E2E8F0',
    },
    label: {
      color: '#4A5568',
      fontWeight: '500',
      marginBottom: '4px',
    },
    input: {
      background: '#F7FAFC',
      borderColor: '#E2E8F0',
      borderRadius: '12px',
      padding: '12px',
      color: '#2D3748', // Color explícito para el texto
    }
  }
};

const authProviders = [];
const authLocalization = {
  variables: {
    sign_in: { email_label: 'Correo electrónico', password_label: 'Contraseña', button_label: 'Entrar', social_provider_text: 'Entrar con {{provider}}', link_text: '¿No tienes cuenta? Regístrate' },
    sign_up: { email_label: 'Correo electrónico', password_label: 'Contraseña', button_label: 'Registrarse', social_provider_text: 'Registrarse con {{provider}}', link_text: '¿Ya tienes cuenta? Inicia sesión' },
    forgotten_password: { email_label: 'Correo electrónico', button_label: 'Recuperar contraseña', link_text: 'Olvidé mi contraseña' }
  },
};

// --- COMPONENTE DEL FORMULARIO MEMOIZADO ---
// Este componente NO se volverá a renderizar a menos que sus props cambien.
// Como no tiene props (o usa constantes estables), no se verá afectado por el carrusel del padre.
const LoginForm = memo(() => {
  return (
    <Auth
      supabaseClient={supabase}
      appearance={authAppearance}
      theme="default"
      providers={authProviders}
      localization={authLocalization}
    />
  );
});

function Login() {
  const navigate = useNavigate();
  const [imagenActual, setImagenActual] = useState(0);

  // Carrusel automático
  useEffect(() => {
    const intervalo = setInterval(() => {
      setImagenActual((prev) => (prev + 1) % IMAGENES_FONDO.length);
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  // Guardián de Ruta
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { if (session) navigate('/'); });
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => { if (event === 'SIGNED_IN' || session) navigate('/'); });
    return () => authListener.subscription.unsubscribe();
  }, [navigate]);

  return (
    <Flex minH="100vh" direction={{ base: 'column', md: 'row' }}>
      
      {/* --- COLUMNA IZQUIERDA: FORMULARIO (FONDO CLARO) --- */}
      <Flex 
        p={8} 
        flex={1} 
        align={'center'} 
        justify={'center'} 
        bg="white" // <--- CAMBIO CLAVE: Fondo Blanco
        color="gray.800" // Texto oscuro
        zIndex={2} // Para que quede por encima del degradado
      >
        <VStack spacing={6} w={'full'} maxW={'md'} align="stretch">
          
          <Box textAlign="center" mb={4}>
            {/* Título con degradado Indigo/Purple */}
            <Heading fontSize={'4xl'} mb={2} bgGradient="linear(to-r, #667eea, #764ba2)" bgClip="text" fontWeight="extrabold" fontFamily="'Outfit', sans-serif">
              BalanceMe
            </Heading>
            <Text fontSize={'lg'} color={'gray.500'}>
              Tu mejor versión empieza hoy.
            </Text>
          </Box>

          {/* Caja del Formulario Limpia */}
          <Box 
            bg="white" 
            p={0} // Quitamos el padding extra para que se vea más integrado
          >
            {/* Usamos el componente memoizado */}
            <LoginForm />
          </Box>
        </VStack>
      </Flex>

      {/* --- COLUMNA DERECHA: IMÁGENES + FUSIÓN --- */}
      <Flex flex={1.5} display={{ base: 'none', md: 'flex' }} bg="gray.50" position="relative" overflow="hidden">
        
        {/* Carrusel */}
        {IMAGENES_FONDO.map((img, index) => (
          <Box
            key={index}
            position="absolute"
            top={0} left={0} w="100%" h="100%"
            opacity={index === imagenActual ? 1 : 0}
            transition="opacity 1s ease-in-out"
          >
            <Image src={img} objectFit="cover" w="100%" h="100%" />
          </Box>
        ))}

        {/* --- EL TRUCO DE MAGIA: DEGRADADO DE FUSIÓN --- */}
        {/* Esto crea un desvanecimiento blanco desde la izquierda hacia la imagen */}
        <Box 
          position="absolute" 
          top="0" left="0" bottom="0" 
          w="200px" // El ancho del desvanecimiento
          bgGradient="linear(to-r, white, transparent)" // Blanco -> Transparente
          pointerEvents="none"
        />
        
      </Flex>
    </Flex>
  );
}

export default Login;