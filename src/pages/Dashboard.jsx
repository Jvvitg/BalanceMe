import React, { useEffect, useState, useCallback } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js'; 

// --- IMPORTACIONES DE CHAKRA UI ---
import {
  Box, Button, Container, Heading, HStack, IconButton, Input,
  Text, Checkbox, Spinner, Flex, Spacer, useToast, // <-- NUEVO: useToast
  Card, CardBody, Badge, VStack, Divider, Tooltip // <-- NUEVOS COMPONENTES DE DISEÑO
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, CheckIcon, CloseIcon, AddIcon, StarIcon } from '@chakra-ui/icons';

function getHoy() {
  const hoy = new Date();
  return hoy.toISOString().split('T')[0];
}

function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast(); // <-- NUEVO: Inicializamos el hook de notificaciones

  // --- ESTADOS ---
  const [habitos, setHabitos] = useState([]);
  const [nuevoHabito, setNuevoHabito] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [registrosHoy, setRegistrosHoy] = useState(new Set());
  const [cargando, setCargando] = useState(true);
  const [userId, setUserId] = useState(null);

  // --- LÓGICA (La misma que ya arreglamos, no cambia) ---
  const fetchDatos = useCallback(async (usuario) => {
    if (!usuario) return;
    setCargando(true);
    
    const { data: habitosData, error: habitosError } = await supabase.from('habitos').select('*').eq('user_id', usuario.id).order('created_at', { ascending: false }); // Ordenamos por fecha
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

  const handleLogout = async () => await supabase.auth.signOut();

  // --- ACCIONES CON TOASTS (NOTIFICACIONES) ---

  const handleCrearHabito = async (e) => {
    e.preventDefault();
    if (nuevoHabito.trim() === "" || !userId) return;
    const { error } = await supabase.from('habitos').insert({ name: nuevoHabito, user_id: userId, frequency: 'diario' });
    
    if (error) {
      toast({ title: "Error", description: error.message, status: "error", duration: 3000, isClosable: true });
    } else {
      setNuevoHabito("");
      fetchDatos({ id: userId });
      // NUEVO: Notificación de éxito
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
      // NUEVO: Notificación de borrado
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
  // --- RENDERIZADO CON DISEÑO PROFESIONAL ---
  // -----------------------------------------------------------------
  return (
    <Container maxW="container.md" py={10}>
      
      {/* --- CABECERA --- */}
      <Flex mb={10} align="center" wrap="wrap" gap={4}>
        <Box>
          <Heading as="h1" size="xl" bgGradient="linear(to-l, #34d399, #3182ce)" bgClip="text">
            BalanceMe
          </Heading>
          <Text color="gray.400" fontSize="sm">Tu gestor de hábitos diario</Text>
        </Box>
        <Spacer />
        <HStack spacing={3}>
          <Button as={Link} to="/progreso" leftIcon={<StarIcon />} variant="outline" colorScheme="teal" size="sm">
            Progreso
          </Button>
          <Button onClick={handleLogout} colorScheme="whiteAlpha" variant="ghost" size="sm">
            Salir
          </Button>
        </HStack>
      </Flex>

      {/* --- SECCIÓN DE CREAR (TARJETA DESTACADA) --- */}
      <Card bg="gray.700" variant="outline" borderColor="gray.600" mb={8} boxShadow="lg">
        <CardBody>
          <form onSubmit={handleCrearHabito}>
            <Flex gap={4} align="center">
              <Input 
                placeholder="✨ Escribe un nuevo hábito..." 
                value={nuevoHabito} 
                onChange={(e) => setNuevoHabito(e.target.value)} 
                bg="gray.800" 
                border="none"
                _focus={{ boxShadow: "0 0 0 2px #34d399" }} // Foco verde
              />
              <IconButton 
                type="submit" 
                icon={<AddIcon />} 
                colorScheme="teal" 
                aria-label="Crear"
                isDisabled={!nuevoHabito.trim()} // Deshabilitado si está vacío
              />
            </Flex>
          </form>
        </CardBody>
      </Card>

      {/* --- LISTA DE HÁBITOS --- */}
      <Heading as="h2" size="md" mb={4} color="gray.300">Tus Objetivos de Hoy</Heading>
      
      {cargando ? (
        <Flex justify="center" py={10}><Spinner size="xl" color="teal.500" /></Flex>
      ) : (
        <VStack spacing={4} align="stretch">
          {habitos.length === 0 ? (
            <Box textAlign="center" py={10} bg="whiteAlpha.50" borderRadius="xl" borderStyle="dashed" borderWidth="2px" borderColor="gray.600">
              <Text color="gray.400" fontSize="lg">🌱 Aún no tienes hábitos.</Text>
              <Text color="gray.500" fontSize="sm">¡Crea el primero arriba para empezar!</Text>
            </Box>
          ) : (
            habitos.map((habito) => (
              <Card key={habito.id} bg="gray.700" size="sm" _hover={{ transform: 'translateY(-2px)', shadow: 'md' }} transition="all 0.2s">
                <CardBody display="flex" alignItems="center" gap={4}>
                  
                  {editingId === habito.id ? (
                    // --- MODO EDICIÓN ---
                    <Flex w="100%" gap={2}>
                      <Input value={editingText} onChange={(e) => setEditingText(e.target.value)} autoFocus bg="gray.800" />
                      <IconButton icon={<CheckIcon />} onClick={() => handleActualizarHabito(habito.id)} colorScheme="green" size="sm" />
                      <IconButton icon={<CloseIcon />} onClick={() => setEditingId(null)} size="sm" />
                    </Flex>
                  ) : (
                    // --- MODO VISUALIZACIÓN ---
                    <>
                      <Checkbox 
                        isChecked={registrosHoy.has(habito.id)} 
                        onChange={(e) => handleToggleRegistro(habito.id, e.target.checked)}
                        colorScheme="teal"
                        size="lg"
                      />
                      
                      <Box flex="1">
                        <Text 
                          fontSize="md" 
                          fontWeight="medium" 
                          color={registrosHoy.has(habito.id) ? "gray.400" : "white"}
                          textDecoration={registrosHoy.has(habito.id) ? "line-through" : "none"}
                        >
                          {habito.name}
                        </Text>
                        
                        {/* --- RACHA (BADGE) --- */}
                        {habito.streak > 0 && (
                          <Badge colorScheme="orange" variant="subtle" fontSize="0.7em" mt={1}>
                            🔥 {habito.streak} días seguidos
                          </Badge>
                        )}
                      </Box>

                      <HStack>
                        <Tooltip label="Editar nombre">
                          <IconButton icon={<EditIcon />} onClick={() => handleModoEdicion(habito)} size="sm" variant="ghost" color="gray.400" />
                        </Tooltip>
                        <Tooltip label="Eliminar hábito">
                          <IconButton icon={<DeleteIcon />} onClick={() => handleBorrarHabito(habito.id)} size="sm" variant="ghost" color="red.300" _hover={{ bg: 'red.900' }} />
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
  );
}

export default Dashboard;