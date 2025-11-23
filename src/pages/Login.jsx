import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Importaciones de Chakra UI
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  useColorMode, 
  Image, 
  VStack 
} from '@chakra-ui/react';

// Importaciones de Supabase
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient.js';

// Tema personalizado para el formulario (Verde Fitia/BalanceMe)
const customTheme = {
    ...ThemeSupa,
    colors: {
        ...ThemeSupa.colors,
        brand: { 
            500: '#34d399', // Nuestro verde principal
            600: '#2bb884', // Verde un poco más oscuro para hover
        }
    },
};

function Login() {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();

  // --- Guardián de Ruta (Si ya entró, lo mandamos al Dashboard) ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/');
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || session) navigate('/');
    });
    return () => authListener.subscription.unsubscribe();
  }, [navigate]);

  return (
    // Flex contenedor principal (ocupa toda la pantalla)
    <Flex minH="100vh" direction={{ base: 'column', md: 'row' }}>
      
      {/* --- COLUMNA IZQUIERDA: EL FORMULARIO --- */}
      <Flex 
        p={8} 
        flex={1} 
        align={'center'} 
        justify={'center'} 
        bg="gray.900" // Fondo oscuro elegante
      >
        <VStack spacing={6} w={'full'} maxW={'md'} align="stretch">
          
          {/* Encabezado de bienvenida */}
          <Box textAlign="center" mb={4}>
            <Heading fontSize={'4xl'} mb={2} bgGradient="linear(to-r, #34d399, #3182ce)" bgClip="text">
              BalanceMe
            </Heading>
            <Text fontSize={'lg'} color={'gray.400'}>
              Construye la mejor versión de ti mismo, un hábito a la vez.
            </Text>
          </Box>

          {/* Caja del Formulario */}
          <Box 
            bg="gray.800" 
            p={8} 
            borderRadius="xl" 
            boxShadow="lg" 
            border="1px solid" 
            borderColor="gray.700"
          >
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: customTheme }}
              theme={colorMode}
              providers={['github']}
              localization={{
                variables: {
                  sign_in: { email_label: 'Correo electrónico', password_label: 'Contraseña', button_label: 'Entrar a mi cuenta', social_provider_text: 'Entrar con {{provider}}', link_text: '¿No tienes cuenta? Regístrate gratis' },
                  sign_up: { email_label: 'Correo electrónico', password_label: 'Crea una contraseña', button_label: 'Comenzar ahora', social_provider_text: 'Registrarse con {{provider}}', link_text: '¿Ya tienes cuenta? Inicia sesión' },
                  forgotten_password: { email_label: 'Correo electrónico', button_label: 'Recuperar contraseña', link_text: 'Olvidé mi contraseña' }
                },
              }}
            />
          </Box>
        </VStack>
      </Flex>

      {/* --- COLUMNA DERECHA: LA IMAGEN INSPIRACIONAL --- */}
      <Flex flex={1} display={{ base: 'none', md: 'flex' }}>
        <Image
          alt={'Login Image'}
          objectFit={'cover'}
          // Usamos una imagen de Unsplash de alta calidad (estilo Productividad/Zen)
          src={
            'https://images.unsplash.com/photo-1499750310159-5b600aaf0321?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
          }
          w="100%"
          h="100%"
        />
      </Flex>
    </Flex>
  );
}

export default Login;