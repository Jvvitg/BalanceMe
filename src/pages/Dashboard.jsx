import React, { useEffect, useState, useCallback } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js'; 

// --- 1. IMPORTACIONES DE CHAKRA ---
import {
  Box, Button, Container, Heading, HStack, IconButton, Input,
  List, ListItem, Text, Checkbox, Spinner, Flex, Spacer
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';

// --- (Funciones auxiliares, sin cambios) ---
function getHoy() {
  const hoy = new Date();
  return hoy.toISOString().split('T')[0];
}

function Dashboard() {
  const navigate = useNavigate();
  // --- (Estados, sin cambios) ---
  const [habitos, setHabitos] = useState([]);
  const [nuevoHabito, setNuevoHabito] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [registrosHoy, setRegistrosHoy] = useState(new Set());
  const [cargando, setCargando] = useState(true);
  const [userId, setUserId] = useState(null);

  // --- Lógica de fetchDatos (¡AQUÍ ESTÁ EL ARREGLO!) ---
  const fetchDatos = useCallback(async (usuario) => {
    if (!usuario) return;
    setCargando(true);
    
    // 1. Obtenemos los Hábitos (igual que antes)
    const { data: habitosData, error: habitosError } = await supabase
      .from('habitos')
      .select('*')
      .eq('user_id', usuario.id);

    if (habitosError) console.error('Error al cargar hábitos:', habitosError.message);

    // 2. Obtenemos los Registros de HOY (igual que antes)
    const hoy = getHoy();
    const { data: registrosData, error: registrosError } = await supabase
      .from('registros')
      .select('habitos_id')
      .eq('user_id', usuario.id)
      .eq('fecha', hoy);

    if (registrosError) console.error('Error al cargar registros:', registrosError.message);
    else setRegistrosHoy(new Set(registrosData.map(r => r.habitos_id)));
    
    // -----------------------------------------------------------------
    // --- 3. ¡ARREGLO! Calculamos la Racha SECUENCIALMENTE (uno por uno) ---
    // -----------------------------------------------------------------
    if (habitosData) {
      const habitosConRacha = []; // Un array vacío para guardar los resultados
      
      // Usamos un bucle 'for...of' que SÍ espera por cada 'await'
      for (const habito of habitosData) {
        // 1. Preguntamos por la racha de este hábito
        const { data, error } = await supabase.rpc('get_consecutive_days', { 
          p_habito_id: habito.id, 
          p_user_id: usuario.id 
        });

        if (error) {
          console.error('Error al calcular racha:', error.message);
        }

        // 2. Añadimos el hábito (con su racha) al array
        habitosConRacha.push({
          ...habito,
          streak: data || 0
        });
      }
      
      setHabitos(habitosConRacha); // Guardamos el array completo
    }
    
    setCargando(false);
  }, []); // useCallback memoriza esta función

  // --- (El resto de la lógica es IDÉNTICA) ---
  useEffect(() => { const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => { if (session === null) navigate('/login'); else { setUserId(session.user.id); fetchDatos(session.user); } }); return () => authListener.subscription.unsubscribe(); }, [navigate, fetchDatos]); 
  const handleLogout = async () => await supabase.auth.signOut();
  const handleCrearHabito = async (e) => { e.preventDefault(); if (nuevoHabito.trim() === "" || !userId) return; const { error } = await supabase.from('habitos').insert({ name: nuevoHabito, user_id: userId, frequency: 'diario' }); if (error) console.error('Error al crear hábito:', error.message); else { setNuevoHabito(""); fetchDatos({ id: userId }); } };
  const handleBorrarHabito = async (idDelHabito) => { if (!window.confirm("¿Estás seguro? Se borrarán también los registros.")) return; const { error } = await supabase.from('habitos').delete().eq('id', idDelHabito); if (error) console.error('Error al borrar hábito:', error.message); else fetchDatos({ id: userId }); };
  const handleActualizarHabito = async (idDelHabito) => { const { error } = await supabase.from('habitos').update({ name: editingText }).eq('id', idDelHabito); if (error) console.error('Error al actualizar hábito:', error.message); else { setEditingId(null); setEditingText(""); fetchDatos({ id: userId }); } };
  const handleModoEdicion = (habito) => { setEditingId(habito.id); setEditingText(habito.name); };
  const handleToggleRegistro = async (habitoId, completado) => { const hoy = getHoy(); if (completado) { const { error } = await supabase.from('registros').insert({ habitos_id: habitoId, user_id: userId, fecha: hoy }); if (error) console.error('Error al registrar hábito:', error.message); else setRegistrosHoy(prev => new Set(prev).add(habitoId)); } else { const { error } = await supabase.from('registros').delete().eq('habitos_id', habitoId).eq('user_id', userId).eq('fecha', hoy); if (error) console.error('Error al borrar registro:', error.message); else { setRegistrosHoy(prev => { const newSet = new Set(prev); newSet.delete(habitoId); return newSet; }); } } setTimeout(() => fetchDatos({ id: userId }), 500); };
  // --- FIN DE LA LÓGICA ---


  // --- RENDERIZADO CON CHAKRA (Idéntico) ---
  return (
    <Container maxW="container.md" py={8}>
      <Flex mb={8} align="center">
        <Heading as="h1" size="lg" color="white">BalanceMe</Heading>
        <Spacer />
        <HStack spacing={4}>
          <Button as={Link} to="/progreso" variant="outline" colorScheme="teal" size="sm">
            Ver mi Progreso
          </Button>
          <Button onClick={handleLogout} colorScheme="red" variant="solid" size="sm">
            Cerrar Sesión
          </Button>
        </HStack>
      </Flex>
      <Box as="form" onSubmit={handleCrearHabito} mb={10}>
        <Heading as="h3" size="md" mb={4} color="whiteAlpha.900">Crear nuevo hábito</Heading>
        <HStack>
          <Input type="text" placeholder="Ej: Tomar 2L de agua" value={nuevoHabito} onChange={(e) => setNuevoHabito(e.target.value)} bg="whiteAlpha.100" borderColor="whiteAlpha.300" />
          <Button type="submit" colorScheme="teal">Guardar Hábito</Button>
        </HStack>
      </Box>
      <Heading as="h2" size="lg" mb={6} color="whiteAlpha.900">Mis Hábitos de Hoy</Heading>
      {cargando ? (
        <Flex justify="center" align="center" h="100px"><Spinner size="xl" color="teal.500" /></Flex>
      ) : (
        <List spacing={4}>
          {habitos.length === 0 ? (
            <Text color="whiteAlpha.600">Aún no tienes hábitos. ¡Crea el primero!</Text>
          ) : (
            habitos.map((habito) => (
              <ListItem key={habito.id} p={4} bg="whiteAlpha.100" borderRadius="md" display="flex" alignItems="center">
                {editingId === habito.id ? (
                  <HStack w="100%">
                    <Input type="text" value={editingText} onChange={(e) => setEditingText(e.target.value)} bg="whiteAlpha.50" />
                    <IconButton icon={<CheckIcon />} onClick={() => handleActualizarHabito(habito.id)} colorScheme="green" aria-label="Guardar cambio" />
                    <IconButton icon={<CloseIcon />} onClick={() => setEditingId(null)} colorScheme="gray" aria-label="Cancelar" />
                  </HStack>
                ) : (
                  <>
                    <Checkbox isChecked={registrosHoy.has(habito.id)} onChange={(e) => handleToggleRegistro(habito.id, e.target.checked)} colorScheme="teal" size="lg" mr={4} />
                    <Text fontSize="lg" color="whiteAlpha.900">{habito.name}</Text>
                    {habito.streak > 0 && (
                      <Text ml={3} color="yellow.400" fontWeight="bold">🔥 {habito.streak} {habito.streak > 1 ? 'días' : 'día'}</Text>
                    )}
                    <Spacer />
                    <IconButton icon={<EditIcon />} onClick={() => handleModoEdicion(habito)} size="sm" variant="ghost" colorScheme="whiteAlpha" aria-label="Editar hábito" />
                    <IconButton icon={<DeleteIcon />} onClick={() => handleBorrarHabito(habito.id)} size="sm" variant="ghost" colorScheme="red" aria-label="Borrar hábito" />
                  </>
                )}
              </ListItem>
            ))
          )}
        </List>
      )}
    </Container>
  );
}

export default Dashboard;