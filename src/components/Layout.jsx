import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  Box,
  Flex,
  Icon,
  Text,
  VStack,
  HStack,
  Avatar,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Button,
  useToast
} from '@chakra-ui/react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  HamburgerIcon, 
  SettingsIcon, 
  CheckCircleIcon, 
  StarIcon, 
  ArrowBackIcon, 
  EditIcon,
  DownloadIcon
} from '@chakra-ui/icons';

// Mapeo de iconos para que sea más semántico
const LinkItems = [
  { name: 'Inicio', icon: SettingsIcon, path: '/' },
  { name: 'Hábitos', icon: CheckCircleIcon, path: '/dashboard' },
  { name: 'Tareas', icon: EditIcon, path: '/tasks' },
  { name: 'Progreso', icon: StarIcon, path: '/progreso' },
  { name: 'Logros', icon: StarIcon, path: '/logros' },
];

export default function Layout() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [perfil, setPerfil] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setPerfil(data);
      }
    };
    getProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // --- LÓGICA DE EXPORTAR PDF (GLOBAL) ---
  const handleExportPDF = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    toast({
      title: "Generando reporte...",
      status: "info",
      duration: 2000,
      isClosable: true,
    });

    // 1. Fetch Datos
    const { count: totalHabitos } = await supabase
      .from('habitos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id);
    
    const { data: registrosData } = await supabase
      .from('registros')
      .select('fecha')
      .eq('user_id', session.user.id);

    const { data: habitosList } = await supabase
      .from('habitos')
      .select('*')
      .eq('user_id', session.user.id);

    // Calcular días activos (aprox)
    const fechasCompletadas = new Set(registrosData?.map(r => r.fecha));

    // 2. Generar PDF
    const doc = new jsPDF();
    const fechaHoy = new Date().toLocaleDateString();

    doc.setFontSize(22);
    doc.setTextColor(102, 126, 234); 
    doc.text("BalanceMe", 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Informe de Progreso - ${fechaHoy}`, 14, 30);

    if (perfil) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Datos del Usuario", 14, 45);
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(`Nombre: ${perfil.full_name || 'N/A'}`, 14, 55);
      doc.text(`Propósito: ${perfil.purpose || 'N/A'}`, 14, 60);
    }

    let startY = perfil ? 75 : 45;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Resumen", 14, startY);
    
    autoTable(doc, {
      startY: startY + 5,
      head: [['Métrica', 'Valor']],
      body: [
        ['Acciones Totales', registrosData?.length || 0],
        ['Días Activos', fechasCompletadas.size],
        ['Hábitos Totales', totalHabitos || 0],
      ],
      theme: 'striped',
      headStyles: { fillColor: [102, 126, 234] },
    });

    if (habitosList && habitosList.length > 0) {
        doc.text("Mis Hábitos", 14, doc.lastAutoTable.finalY + 15);
        const habitosRows = habitosList.map(h => [h.name, h.frequency]);
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Hábito', 'Frecuencia']],
            body: habitosRows,
            theme: 'grid',
            headStyles: { fillColor: [118, 75, 162] },
        });
    }

    doc.save(`BalanceMe_Reporte_${fechaHoy.replace(/\//g, '-')}.pdf`);
    
    toast({
      title: "Informe descargado",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box minH="100vh" bg="gray.900">
      {/* Sidebar para Desktop */}
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
        handleLogout={handleLogout}
        handleExportPDF={handleExportPDF}
      />

      {/* Drawer para Mobile */}
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} handleLogout={handleLogout} handleExportPDF={handleExportPDF} />
        </DrawerContent>
      </Drawer>

      {/* Topbar (Mobile Nav) */}
      <MobileNav onOpen={onOpen} perfil={perfil} handleLogout={handleLogout} />

      {/* Contenido Principal */}
      <Box ml={{ base: 0, md: 60 }} p="4">
        <Outlet />
      </Box>
    </Box>
  );
}

const SidebarContent = ({ onClose, handleLogout, handleExportPDF, ...rest }) => {
  const location = useLocation();

  return (
    <Box
      transition="3s ease"
      bg="gray.900"
      borderRight="1px"
      borderRightColor="gray.700"
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold" bgGradient="linear(to-r, #667eea, #764ba2)" bgClip="text">
          BalanceMe
        </Text>
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onClose}
          variant="outline"
          aria-label="close menu"
          icon={<ArrowBackIcon />}
        />
      </Flex>
      <VStack align="stretch" spacing={2} mt={4}>
        {LinkItems.map((link) => (
          <NavItem 
            key={link.name} 
            icon={link.icon} 
            path={link.path} 
            isActive={location.pathname === link.path}
            onClick={onClose}
          >
            {link.name}
          </NavItem>
        ))}
      </VStack>
      
      {/* Botones al final */}
      <Box position="absolute" bottom="5" w="full" px={4}>
         <VStack spacing={2} align="stretch">
            <Button 
                leftIcon={<DownloadIcon />} 
                variant="outline" 
                colorScheme="purple" 
                size="sm" 
                onClick={handleExportPDF}
                _hover={{ bg: 'purple.900' }}
            >
                Exportar PDF
            </Button>
            <ButtonLogout onClick={handleLogout} />
         </VStack>
      </Box>
    </Box>
  );
};

const NavItem = ({ icon, children, path, isActive, onClick, ...rest }) => {
  return (
    <Link to={path} style={{ textDecoration: 'none' }} onClick={onClick}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? 'linear-gradient(to r, #667eea, #764ba2)' : 'transparent'}
        color={isActive ? 'white' : 'gray.400'}
        _hover={{
          bg: 'whiteAlpha.100',
          color: 'white',
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            as={icon}
            color={isActive ? 'white' : 'gray.500'}
            _groupHover={{
              color: 'white',
            }}
          />
        )}
        <Text fontWeight={isActive ? 'bold' : 'medium'}>{children}</Text>
      </Flex>
    </Link>
  );
};

const MobileNav = ({ onOpen, perfil, handleLogout, ...rest }) => {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg="gray.900"
      borderBottomWidth="1px"
      borderBottomColor="gray.700"
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<HamburgerIcon />}
        color="white"
      />

      <Text
        display={{ base: 'flex', md: 'none' }}
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold"
        bgGradient="linear(to-r, #667eea, #764ba2)" 
        bgClip="text"
      >
        BalanceMe
      </Text>

      <HStack spacing={{ base: '0', md: '6' }}>
        <Flex alignItems={'center'}>
          <Menu>
            <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
              <HStack>
                <Avatar
                  size={'sm'}
                  name={perfil?.full_name}
                  bgGradient="linear(to-r, #667eea, #764ba2)"
                />
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm" color="white">{perfil?.full_name || 'Usuario'}</Text>
                  <Text fontSize="xs" color="gray.400">
                    {perfil?.purpose ? 'Enfocado' : 'Viajero'}
                  </Text>
                </VStack>
              </HStack>
            </MenuButton>
            <MenuList
              bg="gray.800"
              borderColor="gray.700"
            >
              <MenuItem bg="gray.800" color="white" _hover={{ bg: 'gray.700' }} onClick={handleLogout}>
                Cerrar Sesión
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
};

const ButtonLogout = ({ onClick }) => (
  <Flex
    align="center"
    p="4"
    borderRadius="lg"
    role="group"
    cursor="pointer"
    color="red.400"
    _hover={{
      bg: 'red.900',
      color: 'red.200',
    }}
    onClick={onClick}
  >
    <Icon
      mr="4"
      fontSize="16"
      as={ArrowBackIcon} // Usamos ArrowBack como icono de salir por ahora
      transform="rotate(180deg)"
    />
    <Text fontWeight="medium">Salir</Text>
  </Flex>
);
