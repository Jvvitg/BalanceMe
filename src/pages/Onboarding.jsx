import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';

// --- IMPORTACIONES DE CHAKRA UI ---
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';

function Onboarding() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // --- ESTADOS DEL FORMULARIO ---
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [purpose, setPurpose] = useState('');

  useEffect(() => {
    // Verificar sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      } else {
        setUserId(session.user.id);
      }
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    if (!fullName.trim() || !age || !purpose.trim()) {
      toast({
        title: "Faltan datos",
        description: "Por favor completa todos los campos.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .insert([
        { 
          id: userId, 
          full_name: fullName, 
          age: parseInt(age), 
          purpose: purpose 
        }
      ]);

    if (error) {
      console.error('Error al guardar perfil:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar tu perfil. Inténtalo de nuevo.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "¡Bienvenido!",
        description: "Tu perfil ha sido creado.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Redirigir al Home
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <Box minH="100vh" bgGradient="linear(to-br, gray.900, gray.800)" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="container.sm" py={10}>
        
        <Box 
          bg="gray.800" 
          p={8} 
          borderRadius="2xl" 
          boxShadow="2xl" 
          border="1px solid" 
          borderColor="gray.700"
        >
          <VStack spacing={6} align="stretch">
            
            <Box textAlign="center">
              <Heading as="h1" size="xl" bgGradient="linear(to-r, #667eea, #764ba2)" bgClip="text" mb={2}>
                ¡Hola! 👋
              </Heading>
              <Text color="gray.400">
                Antes de empezar, cuéntanos un poco sobre ti.
              </Text>
            </Box>

            <form onSubmit={handleSubmit}>
              <VStack spacing={5}>
                
                {/* NOMBRE */}
                <FormControl isRequired>
                  <FormLabel color="gray.300">¿Cómo quieres que te llamemos?</FormLabel>
                  <Input 
                    placeholder="Ej. Javier" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    bg="gray.700"
                    border="none"
                    color="white"
                    size="lg"
                    _focus={{ ring: 2, ringColor: "purple.500" }}
                  />
                </FormControl>

                {/* EDAD */}
                <FormControl isRequired>
                  <FormLabel color="gray.300">Tu Edad</FormLabel>
                  <NumberInput 
                    min={1} 
                    max={120} 
                    value={age} 
                    onChange={(val) => setAge(val)}
                    size="lg"
                  >
                    <NumberInputField 
                      bg="gray.700" 
                      border="none" 
                      color="white" 
                      placeholder="Ej. 25"
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper color="gray.400" />
                      <NumberDecrementStepper color="gray.400" />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                {/* PROPÓSITO */}
                <FormControl isRequired>
                  <FormLabel color="gray.300">¿Cuál es tu propósito principal?</FormLabel>
                  <Textarea 
                    placeholder="Ej. Quiero ser más productivo y organizar mejor mis días..." 
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    bg="gray.700"
                    border="none"
                    color="white"
                    size="lg"
                    rows={4}
                    _focus={{ ring: 2, ringColor: "purple.500" }}
                  />
                </FormControl>

                <Button 
                  type="submit" 
                  w="full" 
                  size="lg"
                  bgGradient="linear(to-r, #667eea, #764ba2)"
                  color="white"
                  _hover={{ bgGradient: "linear(to-r, #764ba2, #667eea)" }}
                  isLoading={loading}
                  loadingText="Guardando..."
                  mt={4}
                  rounded="xl"
                >
                  Comenzar mi viaje 🚀
                </Button>

                <Button 
                  variant="ghost" 
                  color="gray.500" 
                  size="sm" 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate('/login');
                  }}
                >
                  Cerrar Sesión
                </Button>

              </VStack>
            </form>

          </VStack>
        </Box>

      </Container>
    </Box>
  );
}

export default Onboarding;
