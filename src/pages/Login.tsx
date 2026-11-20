import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Box, Button, FormControl, FormLabel, Heading, Input, Stack, Text, Flex, useToast, VStack } from "@chakra-ui/react";
import { api } from "../api";
import { useAuth } from "../auth";

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [f, setF] = useState({ full_name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" />;

  const submit = async () => {
    setBusy(true);
    try {
      const r = await api(`/auth/${mode}`, { body: mode === "login" ? { email: f.email, password: f.password } : f });
      login(r.token, r.lecturer); nav("/");
    } catch (e: any) { toast({ status: "error", title: e.message }); }
    setBusy(false);
  };
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  return (
    <Flex minH="100vh">
      <VStack display={{ base: "none", lg: "flex" }} flex={1} bg="brand.900" color="white" justify="center" align="start" p={16} spacing={5}>
        <Heading size="2xl" color="white" maxW="520px" lineHeight={1.1}>Attendance you can trust, taken in under a minute.</Heading>
        <Text color="brand.200" maxW="440px" fontSize="lg">Students scan a code, confirm their face and location, and you see the register fill up live.</Text>
      </VStack>
      <Flex flex={1} align="center" justify="center" p={6}>
        <Box w="full" maxW="400px">
          <Heading size="lg" mb={1}>{mode === "login" ? "Log in to Rollcall" : "Create your lecturer account"}</Heading>
          <Text color="ink.500" mb={6} fontSize="sm">{mode === "login" ? "Welcome back." : "Set up classes and start taking attendance in minutes."}</Text>
          <Stack spacing={4} onKeyDown={(e) => e.key === "Enter" && submit()}>
            {mode === "register" && <FormControl><FormLabel>Full name</FormLabel><Input value={f.full_name} onChange={set("full_name")} /></FormControl>}
            <FormControl><FormLabel>Email</FormLabel><Input type="email" value={f.email} onChange={set("email")} /></FormControl>
            <FormControl><FormLabel>Password</FormLabel><Input type="password" value={f.password} onChange={set("password")} placeholder={mode === "register" ? "At least 8 characters" : ""} /></FormControl>
            <Button size="lg" isLoading={busy} onClick={submit}>{mode === "login" ? "Log in" : "Create account"}</Button>
            <Button variant="link" onClick={() => setMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "New lecturer? Create an account" : "Already registered? Log in"}
            </Button>
          </Stack>
        </Box>
      </Flex>
    </Flex>
  );
}
