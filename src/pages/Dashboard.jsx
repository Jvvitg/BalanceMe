import React, { useEffect, useState, useCallback } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js'; 

// --- IMPORTACIONES DE CHAKRA UI ---
import {
  Box, Button, Container, Heading, HStack, IconButton, Input,
  Text, Checkbox, Spinner, Flex, Spacer, useToast,
  Card, CardBody, Badge, VStack, Tooltip, InputGroup, InputLeftElement
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, CheckIcon, CloseIcon, AddIcon, StarIcon } from '@chakra-ui/icons';

function getHoy() {
  const hoy = new Date();
  return hoy.toISOString().split('T')[0];
}

function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();

  // --- ESTADOS ---
  const [habitos, setHabitos] = useState([]);
  const [nuevoHabito, setNuevoHabito] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [registrosHoy, setRegistrosHoy] = useState(new Set());
  const [cargando, setCargando] = useState(true);
  const [userId, setUserId] = useState(null);

  // --- LÓGICA ---
  const fetchDatos = useCallback(async (usuario) => {
    if (!usuario) return;
    setCargando(true);
    
    const { data: habitosData, error: habitosError } = await supabase.from('habitos').select('*').eq('user_id', usuario.id).order('created_at', { ascending: false });
    if (habitosError) console.error(habitosError.message);

    const hoy = getHoy();
    const { data: registrosData, error: registrosError } = await supabase.from('registros').select('habitos_id').eq('user_id', usuario.id).eq('fecha', hoy);
    if (registrosError) console.error(registrosError.message);
    else setRegistrosHoy(new Set(registrosData.map(r => r.habitos_id)));
    
    if (habitosData) {
      const habitosConRacha = [];
      for (const habito of habitosData) {
        const { data } = await supabase.rpc('get_consecutive_days', { p_habito_id: habito.id, p_user_id: usuario.id });
        habitosConRacha.push({ ...habito, streak: data || 0 });
      }
      setHabitos(habitosConRacha);
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session === null) navigate('/login');
      else { setUserId(session.user.id); fetchDatos(session.user); }
    });
    return () => authListener.subscription.unsubscribe();
  }, [navigate, fetchDatos]); 

  // const handleLogout = async () => await supabase.auth.signOut(); // YA NO SE USA AQUÍ

  // --- ACCIONES ---

  const handleCrearHabito = async (e) => {
    e.preventDefault();
    if (nuevoHabito.trim() === "" || !userId) return;
    const { error } = await supabase.from('habitos').insert({ name: nuevoHabito, user_id: userId, frequency: 'diario' });
    
    if (error) {
      toast({ title: "Error", description: error.message, status: "error", duration: 3000, isClosable: true });
    } else {
      setNuevoHabito("");
      fetchDatos({ id: userId });
      toast({ title: "¡Hábito creado!", description: "A por esa racha 🔥", status: "success", duration: 3000, isClosable: true });
    }
  };

  const handleBorrarHabito = async (idDelHabito) => {
    if (!window.confirm("¿Estás seguro?")) return;
    const { error } = await supabase.from('habitos').delete().eq('id', idDelHabito);
    
    if (error) {
      toast({ title: "Error", description: error.message, status: "error", duration: 3000 });
    } else {
      fetchDatos({ id: userId });
      toast({ title: "Eliminado", description: "El hábito ha sido borrado.", status: "info", duration: 3000 });
    }
  };

  const handleActualizarHabito = async (idDelHabito) => {
    const { error } = await supabase.from('habitos').update({ name: editingText }).eq('id', idDelHabito);
    if (error) console.error(error.message);
    else {
      setEditingId(null); setEditingText(""); fetchDatos({ id: userId });
      toast({ title: "Actualizado", status: "success", duration: 2000 });
    }
  };

  const handleModoEdicion = (habito) => { setEditingId(habito.id); setEditingText(habito.name); };

  const handleToggleRegistro = async (habitoId, completado) => {
    const hoy = getHoy();
    if (completado) {
      const { error } = await supabase.from('registros').insert({ habitos_id: habitoId, user_id: userId, fecha: hoy });
      if (!error) {
        setRegistrosHoy(prev => new Set(prev).add(habitoId));
        toast({ title: "¡Bien hecho!", description: "Hábito completado hoy ✅", status: "success", duration: 2000 });
      }
    } else {
      const { error } = await supabase.from('registros').delete().eq('habitos_id', habitoId).eq('user_id', userId).eq('fecha', hoy);
      if (!error) {
        setRegistrosHoy(prev => { const newSet = new Set(prev); newSet.delete(habitoId); return newSet; });
      }
    }
    setTimeout(() => fetchDatos({ id: userId }), 500);
  };

  // -----------------------------------------------------------------
  // --- RENDERIZADO CON DISEÑO "MODERN DARK" ---
  // -----------------------------------------------------------------
  return (
    <Box minH="100vh" bgGradient="linear(to-br, gray.900, gray.800)">
      <Container maxW="container.md" py={10}>
        
        {/* --- CABECERA --- */}
        <Flex mb={12} align="center" wrap="wrap" gap={4}>
          <Box>
            <Heading as="h1" size="2xl" bgGradient="linear(to-r, #667eea, #764ba2)" bgClip="text" letterSpacing="tight" pb={2}>
              BalanceMe
            </Heading>
            <Text color="gray.400" fontSize="md" fontWeight="medium">Tu gestor de hábitos diario</Text>
          </Box>
          <Spacer />
          <HStack spacing={3}>
            <Button 
              as={Link} to="/progreso" 
              leftIcon={<StarIcon />} 
              variant="solid" 
              bg="whiteAlpha.200" 
              color="white" 
              _hover={{ bg: 'whiteAlpha.300' }}
              rounded="full"
              size="sm"
              px={6}
            >
              Progreso
            </Button>
            <Button 
              as={Link} to="/" 
              variant="ghost" 
              color="gray.400" 
              _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
              rounded="full"
              size="sm"
            >
              Volver al Inicio
            </Button>
          </HStack>
        </Flex>

        {/* --- SECCIÓN HERO: CREAR HÁBITO --- */}
        <Box 
          mb={12} 
          p={1} 
          borderRadius="2xl" 
          bgGradient="linear(to-r, #667eea, #764ba2)" // Borde degradado
        >
          <Box 
            bg="gray.900" 
            borderRadius="xl" 
            p={6} 
            boxShadow="xl"
          >
            <form onSubmit={handleCrearHabito}>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none" children={<AddIcon color="gray.500" />} />
                <Input 
                  placeholder="✨ ¿Qué nuevo hábito quieres empezar hoy?" 
                  value={nuevoHabito} 
                  onChange={(e) => setNuevoHabito(e.target.value)} 
                  bg="transparent" 
                  border="none"
                  color="white"
                  fontSize="lg"
                  _placeholder={{ color: 'gray.500' }}
                  _focus={{ boxShadow: "none" }}
                />
                <Button 
                  type="submit" 
                  colorScheme="purple" 
                  bgGradient="linear(to-r, #667eea, #764ba2)"
                  _hover={{ bgGradient: "linear(to-r, #764ba2, #667eea)" }}
                  size="md"
                  px={8}
                  rounded="lg"
                  isDisabled={!nuevoHabito.trim()}
                >
                  Crear
                </Button>
              </InputGroup>
            </form>
          </Box>
        </Box>

        {/* --- LISTA DE HÁBITOS --- */}
        <Heading as="h2" size="lg" mb={6} color="white" fontWeight="bold">
          Tus Objetivos de Hoy
        </Heading>
        
        {cargando ? (
          <Flex justify="center" py={20}><Spinner size="xl" color="purple.500" thickness="4px" /></Flex>
        ) : (
          <VStack spacing={4} align="stretch">
            {habitos.length === 0 ? (
              <Flex 
                direction="column" 
                align="center" 
                justify="center" 
                py={16} 
                bg="whiteAlpha.50" 
                borderRadius="2xl" 
                border="2px dashed" 
                borderColor="gray.700"
              >
                <Text fontSize="4xl" mb={4}>🌱</Text>
                <Text color="gray.300" fontSize="xl" fontWeight="medium">Aún no tienes hábitos.</Text>
                <Text color="gray.500">¡Usa la barra de arriba para comenzar tu viaje!</Text>
              </Flex>
            ) : (
              habitos.map((habito) => (
                <Card 
                  key={habito.id} 
                  bg="gray.800" 
                  border="1px solid" 
                  borderColor="gray.700" 
                  borderRadius="xl"
                  overflow="hidden"
                  transition="all 0.2s"
                  _hover={{ transform: 'translateY(-2px)', borderColor: '#667eea', boxShadow: 'lg' }}
                >
                  <CardBody display="flex" alignItems="center" gap={5} py={5}>
                    
                    {editingId === habito.id ? (
                      // --- MODO EDICIÓN ---
                      <Flex w="100%" gap={3} align="center">
                        <Input 
                          value={editingText} 
                          onChange={(e) => setEditingText(e.target.value)} 
                          autoFocus 
                          bg="gray.700" 
                          border="none"
                          color="white"
                          size="lg"
                          rounded="md"
                        />
                        <IconButton icon={<CheckIcon />} onClick={() => handleActualizarHabito(habito.id)} colorScheme="green" rounded="full" />
                        <IconButton icon={<CloseIcon />} onClick={() => setEditingId(null)} variant="ghost" color="gray.400" rounded="full" />
                      </Flex>
                    ) : (
                      // --- MODO VISUALIZACIÓN ---
                      <>
                        <Checkbox 
                          isChecked={registrosHoy.has(habito.id)} 
                          onChange={(e) => handleToggleRegistro(habito.id, e.target.checked)}
                          colorScheme="purple"
                          size="lg"
                          iconColor="white"
                          borderColor="gray.500"
                        />
                        
                        <Box flex="1">
                          <Text 
                            fontSize="lg" 
                            fontWeight={registrosHoy.has(habito.id) ? "normal" : "semibold"} 
                            color={registrosHoy.has(habito.id) ? "gray.500" : "white"}
                            textDecoration={registrosHoy.has(habito.id) ? "line-through" : "none"}
                            transition="all 0.2s"
                          >
                            {habito.name}
                          </Text>
                          
                          {/* --- RACHA (BADGE) --- */}
                          {habito.streak > 0 && (
                            <Badge 
                              bgGradient="linear(to-r, orange.400, red.500)" 
                              color="white" 
                              variant="solid" 
                              fontSize="xs" 
                              mt={2} 
                              px={2} 
                              py={0.5} 
                              rounded="full"
                              textTransform="none"
                              fontWeight="bold"
                            >
                              🔥 {habito.streak} días seguidos
                            </Badge>
                          )}
                        </Box>

                        <HStack spacing={1}>
                          <Tooltip label="Editar" hasArrow bg="gray.700">
                            <IconButton 
                              icon={<EditIcon />} 
                              onClick={() => handleModoEdicion(habito)} 
                              size="sm" 
                              variant="ghost" 
                              color="gray.500" 
                              _hover={{ color: 'white', bg: 'whiteAlpha.200' }} 
                              rounded="full"
                            />
                          </Tooltip>
                          <Tooltip label="Eliminar" hasArrow bg="red.600">
                            <IconButton 
                              icon={<DeleteIcon />} 
                              onClick={() => handleBorrarHabito(habito.id)} 
                              size="sm" 
                              variant="ghost" 
                              color="gray.500" 
                              _hover={{ color: 'red.400', bg: 'whiteAlpha.200' }} 
                              rounded="full"
                            />
                          </Tooltip>
                        </HStack>
                      </>
                    )}
                  </CardBody>
                </Card>
              ))
            )}
          </VStack>
        )}
      </Container>
    </Box>
  );
}

export default Dashboard;