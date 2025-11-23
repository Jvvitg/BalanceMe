import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Importamos los componentes básicos de Chakra
import { Box, Heading, Container, Text, SimpleGrid, Image } from '@chakra-ui/react'; // Añade SimpleGrid e Image

// 2. Importamos el componente Auth
import { Auth } from '@supabase/auth-ui-react';

// 3. Importamos ThemeSupa de la librería CORRECTA
import { ThemeSupa } from '@supabase/auth-ui-shared'; 

// 4. Importamos nuestro cliente de Supabase
import { supabase } from '../supabaseClient.js';

function Login() {
  const navigate = useNavigate();

  // -------------------------------------------------------------
  // GUARDIÁN DE RUTA
  // -------------------------------------------------------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || session) {
        navigate('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

return (
    // Usamos Container para centrar y limitar el ancho MÁXIMO
    <Container maxW="container.lg" centerContent minH="100vh" display="flex" alignItems="center"> 
      
      {/* SimpleGrid crea las columnas. 
          'columns={{ base: 1, md: 2 }}' significa: 1 columna en móviles, 2 en pantallas medianas y grandes.
          'spacing={10}' añade espacio entre columnas.
      */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} w="100%" alignItems="center">
        
        {/* --- Columna Izquierda (Formulario) --- */}
        <Box 
          p={8} 
          borderRadius="xl" 
          boxShadow="xl" 
          bg="gray.700" // El fondo gris oscuro que elegimos
          borderWidth="1px" 
          borderColor="gray.600"
        >
          <Heading as="h1" size="lg" textAlign="center" mb={4} color="white"> {/* Un poco más pequeño */}
            ¡Bienvenido/a de vuelta!
          </Heading>

          <Text fontSize="md" textAlign="center" mb={8} color="gray.300">
            Inicia sesión para seguir construyendo tus hábitos.
          </Text>
          
          {/* El componente <Auth> de Supabase se queda aquí */}
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }} // Mantenemos el tema base de Supabase
            providers={['github']}
            localization={{
              // ... (Tu objeto de localización es idéntico) ...
              variables: {
                sign_in: { email_label: 'Correo electrónico', password_label: 'Contraseña', button_label: 'Iniciar sesión', social_provider_text: 'Iniciar con {{provider}}', link_text: '¿Ya tienes cuenta? Inicia sesión' },
                sign_up: { email_label: 'Correo electrónico', password_label: 'Contraseña', button_label: 'Crear cuenta', social_provider_text: 'Registrarse con {{provider}}', link_text: '¿No tienes cuenta? Crea una' },
                forgotten_password: { email_label: 'Correo electrónico', password_label: 'Contraseña', button_label: 'Enviar instrucciones', link_text: '¿Olvidaste tu contraseña?' }
              },
            }}
          />
        </Box>

        {/* --- Columna Derecha (Imagen/Placeholder) --- */}
        <Box display={{ base: 'none', md: 'block' }}> {/* Ocultamos en móviles */}
          {/* Por ahora, un placeholder. Más adelante puedes poner un <Image src="..." /> */}
          <Box bg="teal.500" h="400px" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
            <Text fontSize="2xl" color="white">Aquí va una imagen cool 🧘‍♀️</Text>
          </Box>
        </Box>

      </SimpleGrid>
    </Container>
  );
}

export default Login;