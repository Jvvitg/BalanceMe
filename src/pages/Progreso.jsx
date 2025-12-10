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
  VStack,
  Spacer
} from '@chakra-ui/react';
import { 
  CalendarIcon, 
  CheckCircleIcon, 
  ArrowBackIcon, 
  TimeIcon
} from '@chakra-ui/icons';

// Importamos el Calendario
import Calendar from 'react-calendar';

function Progreso() {
  const navigate = useNavigate();
  
  // --- ESTADOS ---
  const [registros, setRegistros] = useState(new Set());
  const [cargando, setCargando] = useState(true);
  
  const [stats, setStats] = useState({
    totalRegistros: 0,
    totalHabitos: 0,
    diasTotales: 0,
    currentStreak: 0
  });

  // --- LÓGICA DE DATOS ---
  async function fetchDatos(usuario) {
    setCargando(true);

    // 1. Traer Registros
    const { data: registrosData, error: errorRegistros } = await supabase
      .from('registros')
      .select('fecha')
      .eq('user_id', usuario.id)
      .order('fecha', { ascending: true });

    // 2. Traer Hábitos
    const { data: habitosData, error: errorHabitos } = await supabase
      .from('habitos')
      .select('*')
      .eq('user_id', usuario.id);

    if (errorRegistros || errorHabitos) {
      console.error('Error cargando datos');
    } else {
      const fechasCompletadas = new Set(registrosData.map(r => r.fecha));
      setRegistros(fechasCompletadas);

      // Calcular Racha Actual (aproximada)
      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (registrosData.length > 0) {
          let current = new Date(registrosData[registrosData.length - 1].fecha);
          let count = 1;
          for (let i = registrosData.length - 2; i >= 0; i--) {
              const prev = new Date(registrosData[i].fecha);
              const diffTime = Math.abs(current - prev);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
              
              if (diffDays === 1) {
                  count++;
                  current = prev;
              } else if (diffDays === 0) {
                  continue; // Mismo día
              } else {
                  break; // Racha rota
              }
          }
          const lastDate = registrosData[registrosData.length - 1].fecha;
          if (lastDate === today || lastDate === yesterday) {
              streak = count;
          }
      }

      const newStats = {
        totalRegistros: registrosData.length,
        totalHabitos: habitosData?.length || 0,
        diasTotales: fechasCompletadas.size,
        currentStreak: streak
      };
      setStats(newStats);
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
        <Flex mb={10} align="center" wrap="wrap" gap={4}>
          <VStack spacing={2} align="start">
            <Heading as="h1" size="xl" bgGradient="linear(to-r, #667eea, #764ba2)" bgClip="text">
              Informe de Progreso
            </Heading>
            <Text color="gray.400" fontSize="lg">
              Tus estadísticas detalladas.
            </Text>
          </VStack>
          <Spacer />
        </Flex>

        {cargando ? (
          <Flex justify="center" align="center" h="300px">
            <Spinner size="xl" color="purple.500" thickness="4px" />
          </Flex>
        ) : (
          <>
            {/* --- SECCIÓN 1: TARJETAS DE ESTADÍSTICAS --- */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={12}>
              
              <Box p={6} borderRadius="2xl" bg="gray.800" border="1px solid" borderColor="gray.700" boxShadow="xl">
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm" fontWeight="bold" mb={1}>
                    <Icon as={CheckCircleIcon} mr={2} color="green.400"/>
                    ACCIONES TOTALES
                  </StatLabel>
                  <StatNumber fontSize="4xl" color="white" fontWeight="extrabold">
                    {stats.totalRegistros}
                  </StatNumber>
                </Stat>
              </Box>

              <Box p={6} borderRadius="2xl" bg="gray.800" border="1px solid" borderColor="gray.700" boxShadow="xl">
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm" fontWeight="bold" mb={1}>
                    <Icon as={CalendarIcon} mr={2} color="purple.400"/>
                    DÍAS ACTIVOS
                  </StatLabel>
                  <StatNumber fontSize="4xl" color="white" fontWeight="extrabold">
                    {stats.diasTotales}
                  </StatNumber>
                </Stat>
              </Box>

              <Box p={6} borderRadius="2xl" bg="gray.800" border="1px solid" borderColor="gray.700" boxShadow="xl">
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm" fontWeight="bold" mb={1}>
                    <Icon as={TimeIcon} mr={2} color="orange.400"/>
                    RACHA ACTUAL
                  </StatLabel>
                  <StatNumber fontSize="4xl" color="white" fontWeight="extrabold">
                    {stats.currentStreak}
                  </StatNumber>
                  <StatHelpText color="gray.500" fontSize="sm">Días seguidos</StatHelpText>
                </Stat>
              </Box>

            </SimpleGrid>

            {/* --- SECCIÓN 2: CALENDARIO --- */}
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
          Volver al Inicio
        </Button>
      </Container>
    </Box>
  );
}

export default Progreso;