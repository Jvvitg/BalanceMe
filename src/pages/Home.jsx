import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';

// --- IMPORTACIONES DE CHAKRA UI ---
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  Icon,
  Flex,
  Spacer,
  Spinner,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress
} from '@chakra-ui/react';
import { 
  CheckCircleIcon, 
  StarIcon, 
  ArrowForwardIcon, 
  AddIcon, 
  TimeIcon,
  CalendarIcon
} from '@chakra-ui/icons';

function Home() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [stats, setStats] = useState({
    totalHabitos: 0,
    rachaActual: 0,
    habitosHoy: 0
  });
  const [recentHabits, setRecentHabits] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      // 1. Perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profile) {
        navigate('/onboarding');
        return;
      }
      setPerfil(profile);

      // 2. Stats (Simuladas o reales)
      const { count: totalHabitos } = await supabase
        .from('habitos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);

      // 3. Hábitos Recientes
      const { data: habitos } = await supabase
        .from('habitos')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      // 4. Tareas de Hoy (NUEVO)
      const today = new Date().toISOString().split('T')[0];
      const { count: tareasHoy } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('due_date', today)
        .eq('is_completed', false);

      setStats({
        totalHabitos: totalHabitos || 0,
        rachaActual: 0, 
        habitosHoy: 0,
        tareasHoy: tareasHoy || 0 // <--- AÑADIDO
      });
      setRecentHabits(habitos || []);
      setCargando(false);
    };

    fetchData();
  }, [navigate]);

  if (cargando) {
    return (
      <Flex minH="100vh" justify="center" align="center">
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Container maxW="container.xl" py={5}>
      
      {/* --- WELCOME BANNER --- */}
      <Box 
        bgGradient="linear(to-r, #667eea, #764ba2)" 
        borderRadius="2xl" 
        p={8} 
        mb={8} 
        color="white"
        boxShadow="xl"
      >
        <Heading size="lg" mb={2}>Hola, {perfil?.full_name || 'Viajero'} 👋</Heading>
        <Text fontSize="lg" opacity={0.9}>
          "{perfil?.purpose || 'Tu viaje hacia una mejor versión comienza hoy.'}"
        </Text>
      </Box>

      {/* --- WIDGETS GRID --- */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        
        {/* Widget 1: Total Hábitos */}
        <Card bg="gray.800" border="1px" borderColor="gray.700" borderRadius="xl">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Hábitos Activos</StatLabel>
              <StatNumber fontSize="3xl" color="white">{stats.totalHabitos}</StatNumber>
              <StatHelpText color="green.400">
                <Icon as={CheckCircleIcon} mr={1} />
                En seguimiento
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        {/* Widget 2: Racha (Simulada/Placeholder) */}
        <Card bg="gray.800" border="1px" borderColor="gray.700" borderRadius="xl">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Racha Global</StatLabel>
              <StatNumber fontSize="3xl" color="white">🔥 {stats.rachaActual}</StatNumber>
              <StatHelpText color="orange.400">
                Días seguidos
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        {/* Widget 3: Tareas de Hoy (NUEVO) */}
        <Card 
          bg="gray.800" 
          border="1px" 
          borderColor="gray.700" 
          borderRadius="xl" 
          as={Link} 
          to="/tasks"
          _hover={{ borderColor: 'pink.500', transform: 'translateY(-2px)', transition: 'all 0.2s' }}
        >
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Tareas para Hoy</StatLabel>
              <StatNumber fontSize="3xl" color="white">{stats.tareasHoy || 0}</StatNumber>
              <StatHelpText color="pink.400">
                <Icon as={CalendarIcon} mr={1} />
                Pendientes
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        {/* Widget 4: Quick Action */}
        <Card 
          bg="gray.800" 
          border="1px" 
          borderColor="gray.700" 
          borderRadius="xl" 
          as={Link} 
          to="/dashboard"
          _hover={{ borderColor: 'purple.500', transform: 'translateY(-2px)', transition: 'all 0.2s' }}
        >
          <CardBody display="flex" alignItems="center" justifyContent="center" flexDirection="column" gap={2}>
            <Icon as={AddIcon} w={8} h={8} color="purple.400" />
            <Text color="white" fontWeight="bold">Nuevo Hábito</Text>
          </CardBody>
        </Card>

      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        
        {/* --- RECENT ACTIVITY --- */}
        <Box>
          <Heading size="md" color="white" mb={4}>Actividad Reciente</Heading>
          <VStack spacing={4} align="stretch">
            {recentHabits.length === 0 ? (
              <Text color="gray.500">No hay hábitos recientes.</Text>
            ) : (
              recentHabits.map(h => (
                <HStack key={h.id} bg="gray.800" p={4} borderRadius="lg" spacing={4} border="1px" borderColor="gray.700">
                  <Box p={2} bg="whiteAlpha.100" borderRadius="md">
                    <Icon as={StarIcon} color="yellow.400" />
                  </Box>
                  <Box>
                    <Text color="white" fontWeight="bold">{h.name}</Text>
                    <Text color="gray.400" fontSize="sm">Creado el {new Date(h.created_at).toLocaleDateString()}</Text>
                  </Box>
                  <Spacer />
                  <Icon as={ArrowForwardIcon} color="gray.600" />
                </HStack>
              ))
            )}
            <Button as={Link} to="/dashboard" variant="link" color="purple.400" alignSelf="start">
              Ver todos mis hábitos
            </Button>
          </VStack>
        </Box>

        {/* --- GOAL PROGRESS (Placeholder) --- */}
        <Box>
          <Heading size="md" color="white" mb={4}>Tu Progreso Semanal</Heading>
          <Card bg="gray.800" border="1px" borderColor="gray.700" borderRadius="xl" p={6}>
            <VStack spacing={6} align="stretch">
              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text color="gray.300">Constancia</Text>
                  <Text color="purple.400">85%</Text>
                </Flex>
                <Progress value={85} colorScheme="purple" borderRadius="full" size="sm" />
              </Box>
              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text color="gray.300">Objetivos Cumplidos</Text>
                  <Text color="green.400">60%</Text>
                </Flex>
                <Progress value={60} colorScheme="green" borderRadius="full" size="sm" />
              </Box>
              <Button as={Link} to="/progreso" w="full" mt={2} variant="outline" colorScheme="purple">
                Ver Informe Completo
              </Button>
            </VStack>
          </Card>
        </Box>

      </SimpleGrid>

    </Container>
  );
}

export default Home;
