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
  StatGroup,
  Icon
} from '@chakra-ui/react';
import { StarIcon, CalendarIcon, CheckCircleIcon } from '@chakra-ui/icons';

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
  // --- RENDERIZADO ---
  // -----------------------------------------------------------------
  return (
    <Container maxW="container.md" py={8}>
      <Heading as="h1" size="lg" mb={2} color="white">
        Informe de Progreso
      </Heading>
      <Text mb={8} color="whiteAlpha.700">
        Resumen de tu rendimiento y constancia.
      </Text>

      {cargando ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="xl" color="teal.500" />
        </Flex>
      ) : (
        <>
          {/* --- SECCIÓN NUEVA: TARJETAS DE ESTADÍSTICAS --- */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={10}>
            
            {/* Tarjeta 1: Total de Acciones */}
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="gray.700" borderColor="gray.600">
              <Stat>
                <StatLabel color="gray.400"><Icon as={CheckCircleIcon} mr={2}/>Acciones Totales</StatLabel>
                <StatNumber fontSize="3xl" color="white">{stats.totalRegistros}</StatNumber>
                <StatHelpText color="teal.300">Hábitos completados</StatHelpText>
              </Stat>
            </Box>

            {/* Tarjeta 2: Días Activos */}
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="gray.700" borderColor="gray.600">
              <Stat>
                <StatLabel color="gray.400"><Icon as={CalendarIcon} mr={2}/>Días Activos</StatLabel>
                <StatNumber fontSize="3xl" color="white">{stats.diasTotales}</StatNumber>
                <StatHelpText color="teal.300">Días con actividad</StatHelpText>
              </Stat>
            </Box>

            {/* Tarjeta 3: Hábitos Gestionados */}
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="gray.700" borderColor="gray.600">
              <Stat>
                <StatLabel color="gray.400"><Icon as={StarIcon} mr={2}/>Mis Hábitos</StatLabel>
                <StatNumber fontSize="3xl" color="white">{stats.totalHabitos}</StatNumber>
                <StatHelpText color="teal.300">En seguimiento</StatHelpText>
              </Stat>
            </Box>

          </SimpleGrid>

          {/* --- CALENDARIO --- */}
          <Box
            p={6}
            bg="white"
            borderRadius="xl"
            boxShadow="xl"
            mb={8}
          >
            <Heading size="md" mb={4} color="gray.700" textAlign="center">Calendario de Actividad</Heading>
            <Calendar
              tileClassName={esDiaCompletado}
              locale="es-ES"
            />
          </Box>
        </>
      )}

      <Button as={Link} to="/" colorScheme="teal" variant="outline" w="full">
        Volver al Dashboard
      </Button>
    </Container>
  );
}

export default Progreso;