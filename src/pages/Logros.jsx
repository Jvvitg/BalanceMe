import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Icon,
  Tooltip,
  Badge,
  Spinner,
  Flex
} from '@chakra-ui/react';
import { TimeIcon, CalendarIcon, StarIcon } from '@chakra-ui/icons';

// --- DEFINICIÓN DE LOGROS ---
const ACHIEVEMENTS = [
  {
    id: 'week_streak',
    title: 'Racha Semanal',
    description: 'Usa la app 7 días seguidos',
    icon: TimeIcon,
    color: 'orange.400',
    condition: (stats) => stats.currentStreak >= 7
  },
  {
    id: 'month_warrior',
    title: 'Guerrero Mensual',
    description: '30 días de actividad total',
    icon: CalendarIcon,
    color: 'purple.400',
    condition: (stats) => stats.diasTotales >= 30
  },
  {
    id: 'habit_master',
    title: 'Maestro de Hábitos',
    description: 'Completa 50 hábitos en total',
    icon: StarIcon,
    color: 'yellow.400',
    condition: (stats) => stats.totalRegistros >= 50
  }
];

function Logros() {
  const [loading, setLoading] = useState(true);
  const [unlockedAchievements, setUnlockedAchievements] = useState(new Set());

  useEffect(() => {
    const fetchAchievements = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', session.user.id);

      const unlockedSet = new Set(data?.map(a => a.achievement_id));
      setUnlockedAchievements(unlockedSet);
      setLoading(false);
    };

    fetchAchievements();
  }, []);

  if (loading) return <Flex justify="center" py={10}><Spinner color="purple.500" /></Flex>;

  return (
    <Container maxW="container.lg" py={8}>
      <Heading mb={2} bgGradient="linear(to-r, #667eea, #764ba2)" bgClip="text">
        Mis Logros
      </Heading>
      <Text color="gray.400" mb={8}>Colecciona medallas por tu constancia y dedicación.</Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlockedAchievements.has(ach.id);
          return (
            <Tooltip key={ach.id} label={ach.description} hasArrow placement="top">
              <Box 
                p={6} 
                bg={isUnlocked ? "gray.800" : "gray.900"} 
                borderRadius="2xl" 
                border="1px dashed"
                borderColor={isUnlocked ? ach.color : "gray.700"}
                opacity={isUnlocked ? 1 : 0.6}
                filter={isUnlocked ? "none" : "grayscale(100%)"}
                transition="all 0.3s"
                _hover={{ transform: 'scale(1.05)', borderColor: ach.color, opacity: 1 }}
                textAlign="center"
                boxShadow={isUnlocked ? "xl" : "none"}
              >
                <Icon as={ach.icon} w={12} h={12} color={ach.color} mb={4} />
                <Heading size="md" color="white" mb={2}>{ach.title}</Heading>
                <Text color="gray.400" fontSize="sm" mb={4}>{ach.description}</Text>
                
                {isUnlocked ? (
                  <Badge colorScheme="green" variant="solid" rounded="full" px={3} py={1}>
                    Desbloqueado
                  </Badge>
                ) : (
                  <Badge colorScheme="gray" variant="outline" rounded="full" px={3} py={1}>
                    Bloqueado
                  </Badge>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </SimpleGrid>
    </Container>
  );
}

export default Logros;
