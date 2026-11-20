import { ReactNode } from "react";
import { NavLink, Link } from "react-router-dom";
import { Box, Flex, HStack, VStack, Text, Avatar, IconButton, Drawer, DrawerContent, DrawerOverlay, useDisclosure, Menu, MenuButton, MenuList, MenuItem, Heading } from "@chakra-ui/react";
import { FiGrid, FiBookOpen, FiMenu, FiLogOut, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../auth";

const links = [{ to: "/", label: "Dashboard", icon: FiGrid, end: true }, { to: "/classes", label: "Classes", icon: FiBookOpen }];

function Nav({ onNav }: { onNav?: () => void }) {
  return (
    <VStack align="stretch" spacing={1} px={3}>
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.end} onClick={onNav}>
          {({ isActive }) => (
            <HStack px={3} py={2.5} borderRadius="xl" bg={isActive ? "whiteAlpha.200" : "transparent"} color={isActive ? "white" : "brand.200"} _hover={{ bg: "whiteAlpha.100" }} transition="background .15s">
              <l.icon /><Text fontWeight={600} fontSize="sm">{l.label}</Text>
            </HStack>
          )}
        </NavLink>
      ))}
    </VStack>
  );
}

const Brand = () => (
  <HStack px={6} py={6} color="white" as={Link} to="/"><FiCheckCircle size={22} /><Heading size="md" color="white">Rollcall</Heading></HStack>
);

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Flex minH="100vh">
      <Box display={{ base: "none", lg: "block" }} w="240px" bg="brand.900" position="sticky" top={0} h="100vh" flexShrink={0}>
        <Brand /><Nav />
      </Box>
      <Drawer isOpen={isOpen} onClose={onClose} placement="left">
        <DrawerOverlay /><DrawerContent bg="brand.900" maxW="240px"><Brand /><Nav onNav={onClose} /></DrawerContent>
      </Drawer>
      <Box flex={1} minW={0}>
        <Flex as="header" h="64px" px={{ base: 4, md: 8 }} align="center" justify="space-between" bg="white" borderBottom="1px solid" borderColor="ink.100" position="sticky" top={0} zIndex={10}>
          <IconButton aria-label="Menu" icon={<FiMenu />} variant="ghost" display={{ lg: "none" }} onClick={onOpen} />
          <Box display={{ base: "none", lg: "block" }} />
          <Menu>
            <MenuButton><HStack><Text fontSize="sm" fontWeight={600} display={{ base: "none", md: "block" }}>{user?.full_name}</Text><Avatar size="sm" name={user?.full_name} bg="brand.500" color="white" /></HStack></MenuButton>
            <MenuList><MenuItem icon={<FiLogOut />} onClick={logout}>Log out</MenuItem></MenuList>
          </Menu>
        </Flex>
        <Box px={{ base: 4, md: 8 }} py={8} maxW="1200px" mx="auto">{children}</Box>
      </Box>
    </Flex>
  );
}
