import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';

// --- 1. IMPORTACIONES DE CHAKRA ---
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Spinner,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  VStack
} from '@chakra-ui/react';
import { StarIcon, CalendarIcon, CheckCircleIcon, ArrowBackIcon } from '@chakra-ui/icons';

// Importamos el Calendario (El CSS ya está en index.css)
import Calendar from 'react-calendar';

function Progreso() {
  const navigate = useNavigate();
  
  // --- ESTADOS ---
  const [registros, setRegistros] = useState(new Set());
  const [cargando, setCargando] = useState(true);
  
  // Nuevos estados para el "Informe de Gestión"
  const [stats, setStats] = useState({
    totalRegistros: 0,
    totalHabitos: 0,
    diasTotales: 0
  });

  // --- LÓGICA DE DATOS ---
  async function fetchDatos(usuario) {
    setCargando(true);

    // 1. Traemos TODOS los registros (historial completo)
    const { data: registrosData, error: errorRegistros } = await supabase
      .from('registros')
      .select('fecha')
      .eq('user_id', usuario.id);

    // 2. Contamos cuántos hábitos tiene el usuario
    const { count: habitosCount, error: errorHabitos } = await supabase
      .from('habitos')
      .select('*', { count: 'exact', head: true }) // Solo cuenta, no trae los datos
      .eq('user_id', usuario.id);

    if (errorRegistros || errorHabitos) {
      console.error('Error cargando datos');
    } else {
      // Preparamos los datos para el calendario
      const fechasCompletadas = new Set(registrosData.map(r => r.fecha));
      setRegistros(fechasCompletadas);

      // Guardamos las estadísticas para el Informe
      setStats({
        totalRegistros: registrosData.length, // Total de veces que marcó un checkbox
        totalHabitos: habitosCount || 0,      // Total de hábitos creados
        diasTotales: fechasCompletadas.size   // Total de días únicos trabajados
      });
    }
    setCargando(false);
  }

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session === null) {
        navigate('/login');
      } else {
        fetchDatos(session.user);
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, [navigate]);

  function esDiaCompletado({ date }) {
    const fechaFormateada = date.toISOString().split('T')[0];
    if (registros.has(fechaFormateada)) {
      return 'dia-completado';
    }
    return '';
  }

  // -----------------------------------------------------------------
  // --- RENDERIZADO MODERN DARK ---
  // -----------------------------------------------------------------
  return (
    <Box minH="100vh" bgGradient="linear(to-br, gray.900, gray.800)">
      <Container maxW="container.md" py={10}>
        
        {/* --- CABECERA --- */}
        <VStack spacing={2} align="start" mb={10}>
          <Heading as="h1" size="xl" bgGradient="linear(to-r, #667eea, #764ba2)" bgClip="text">
            Informe de Progreso
          </Heading>
          <Text color="gray.400" fontSize="lg">
            Resumen de tu rendimiento y constancia.
          </Text>
        </VStack>

        {cargando ? (
          <Flex justify="center" align="center" h="300px">
            <Spinner size="xl" color="purple.500" thickness="4px" />
          </Flex>
        ) : (
          <>
            {/* --- SECCIÓN NUEVA: TARJETAS DE ESTADÍSTICAS --- */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={12}>
              
              {/* Tarjeta 1: Total de Acciones */}
              <Box 
                p={6} 
                borderRadius="2xl" 
                bg="gray.800" 
                border="1px solid" 
                borderColor="gray.700"
                boxShadow="xl"
                transition="transform 0.2s"
                _hover={{ transform: 'translateY(-4px)', borderColor: '#667eea' }}
              >
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm" fontWeight="bold" mb={1}>
                    <Icon as={CheckCircleIcon} mr={2} color="green.400"/>
                    ACCIONES TOTALES
                  </StatLabel>
                  <StatNumber fontSize="4xl" color="white" fontWeight="extrabold">
                    {stats.totalRegistros}
                  </StatNumber>
                  <StatHelpText color="gray.500" fontSize="sm">
                    Hábitos completados
                  </StatHelpText>
                </Stat>
              </Box>

              {/* Tarjeta 2: Días Activos */}
              <Box 
                p={6} 
                borderRadius="2xl" 
                bg="gray.800" 
                border="1px solid" 
                borderColor="gray.700"
                boxShadow="xl"
                transition="transform 0.2s"
                _hover={{ transform: 'translateY(-4px)', borderColor: '#764ba2' }}
              >
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm" fontWeight="bold" mb={1}>
                    <Icon as={CalendarIcon} mr={2} color="purple.400"/>
                    DÍAS ACTIVOS
                  </StatLabel>
                  <StatNumber fontSize="4xl" color="white" fontWeight="extrabold">
                    {stats.diasTotales}
                  </StatNumber>
                  <StatHelpText color="gray.500" fontSize="sm">
                    Días con actividad
                  </StatHelpText>
                </Stat>
              </Box>

              {/* Tarjeta 3: Hábitos Gestionados */}
              <Box 
                p={6} 
                borderRadius="2xl" 
                bg="gray.800" 
                border="1px solid" 
                borderColor="gray.700"
                boxShadow="xl"
                transition="transform 0.2s"
                _hover={{ transform: 'translateY(-4px)', borderColor: 'orange.400' }}
              >
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm" fontWeight="bold" mb={1}>
                    <Icon as={StarIcon} mr={2} color="orange.400"/>
                    MIS HÁBITOS
                  </StatLabel>
                  <StatNumber fontSize="4xl" color="white" fontWeight="extrabold">
                    {stats.totalHabitos}
                  </StatNumber>
                  <StatHelpText color="gray.500" fontSize="sm">
                    En seguimiento
                  </StatHelpText>
                </Stat>
              </Box>

            </SimpleGrid>

            {/* --- CALENDARIO --- */}
            <Box
              p={8}
              bg="gray.800"
              borderRadius="2xl"
              boxShadow="2xl"
              border="1px solid"
              borderColor="gray.700"
              mb={10}
            >
              <Heading size="md" mb={6} color="white" textAlign="center" letterSpacing="wide">
                CALENDARIO DE ACTIVIDAD
              </Heading>
              <Calendar
                tileClassName={esDiaCompletado}
                locale="es-ES"
              />
            </Box>
          </>
        )}

        <Button 
          as={Link} 
          to="/" 
          leftIcon={<ArrowBackIcon />}
          colorScheme="whiteAlpha" 
          variant="ghost" 
          color="gray.400"
          _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
          size="lg"
          w="full"
          rounded="xl"
        >
          Volver al Dashboard
        </Button>
      </Container>
    </Box>
  );
}

export default Progreso;