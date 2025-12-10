import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Checkbox,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  useToast,
  Badge,
  Flex,
  Spinner
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon, CalendarIcon } from '@chakra-ui/icons';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [userId, setUserId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        fetchTasks(session.user.id);
      }
    };
    getSession();
  }, []);

  const fetchTasks = async (uid) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching tasks:', error);
    else setTasks(data || []);
    setLoading(false);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ 
        user_id: userId, 
        title: newTask, 
        due_date: today 
      }])
      .select();

    if (error) {
      toast({ title: 'Error al crear tarea', status: 'error' });
    } else {
      setTasks([data[0], ...tasks]);
      setNewTask('');
      toast({ title: 'Tarea creada', status: 'success', duration: 2000 });
    }
  };

  const toggleComplete = async (task) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !task.is_completed })
      .eq('id', task.id);

    if (!error) {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, is_completed: !t.is_completed } : t));
    }
  };

  const deleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) {
      setTasks(tasks.filter(t => t.id !== id));
      toast({ title: 'Tarea eliminada', status: 'info', duration: 2000 });
    }
  };

  // Filtrar tareas
  const todayStr = new Date().toISOString().split('T')[0];
  
  const tasksToday = tasks.filter(t => t.due_date === todayStr && !t.is_completed);
  const tasksPending = tasks.filter(t => !t.is_completed && t.due_date !== todayStr);
  const tasksCompleted = tasks.filter(t => t.is_completed);

  if (loading) return <Flex justify="center" py={10}><Spinner color="purple.500" /></Flex>;

  return (
    <Container maxW="container.md" py={8}>
      <Heading mb={6} bgGradient="linear(to-r, #667eea, #764ba2)" bgClip="text">
        Mis Tareas
      </Heading>

      {/* Input Nueva Tarea */}
      <form onSubmit={handleAddTask}>
        <HStack mb={8}>
          <Input 
            placeholder="¿Qué tienes que hacer hoy?" 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            bg="gray.800"
            border="none"
            size="lg"
            color="white"
            _focus={{ ring: 2, ringColor: "purple.500" }}
          />
          <IconButton 
            icon={<AddIcon />} 
            type="submit" 
            colorScheme="purple" 
            size="lg" 
            aria-label="Add task"
          />
        </HStack>
      </form>

      <Tabs variant="soft-rounded" colorScheme="purple">
        <TabList mb={4}>
          <Tab color="gray.400" _selected={{ color: 'white', bg: 'purple.600' }}>Hoy ({tasksToday.length})</Tab>
          <Tab color="gray.400" _selected={{ color: 'white', bg: 'purple.600' }}>Pendientes ({tasksPending.length})</Tab>
          <Tab color="gray.400" _selected={{ color: 'white', bg: 'purple.600' }}>Completadas</Tab>
        </TabList>

        <TabPanels>
          {/* HOY */}
          <TabPanel px={0}>
            <TaskList tasks={tasksToday} onToggle={toggleComplete} onDelete={deleteTask} emptyText="¡Todo listo por hoy! 🎉" />
          </TabPanel>

          {/* PENDIENTES */}
          <TabPanel px={0}>
             <TaskList tasks={tasksPending} onToggle={toggleComplete} onDelete={deleteTask} emptyText="No tienes tareas pendientes." />
          </TabPanel>

          {/* COMPLETADAS */}
          <TabPanel px={0}>
             <TaskList tasks={tasksCompleted} onToggle={toggleComplete} onDelete={deleteTask} isCompletedList />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}

const TaskList = ({ tasks, onToggle, onDelete, emptyText, isCompletedList }) => {
  if (tasks.length === 0) {
    return (
      <Box textAlign="center" py={10} color="gray.500">
        <Text fontSize="lg">{emptyText || "No hay tareas."}</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={3} align="stretch">
      {tasks.map(task => (
        <HStack 
          key={task.id} 
          bg="gray.800" 
          p={4} 
          borderRadius="xl" 
          border="1px solid" 
          borderColor="gray.700"
          justify="space-between"
          opacity={isCompletedList ? 0.6 : 1}
        >
          <HStack>
            <Checkbox 
              isChecked={task.is_completed} 
              onChange={() => onToggle(task)}
              colorScheme="purple"
              size="lg"
            />
            <Box ml={3}>
              <Text 
                color={isCompletedList ? "gray.500" : "white"} 
                textDecoration={isCompletedList ? "line-through" : "none"}
                fontWeight="medium"
              >
                {task.title}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {task.due_date}
              </Text>
            </Box>
          </HStack>
          <IconButton 
            icon={<DeleteIcon />} 
            variant="ghost" 
            colorScheme="red" 
            size="sm" 
            onClick={() => onDelete(task.id)}
            aria-label="Delete task"
          />
        </HStack>
      ))}
    </VStack>
  );
};

export default Tasks;
