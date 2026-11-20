import { ReactNode, useState } from "react";
import { Box, Text, Badge, VStack, Heading, Button, Skeleton, Stack, FormControl, FormLabel, Input, InputGroup, InputRightElement, IconButton } from "@chakra-ui/react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export const Card = (p: any) => <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="ink.100" p={5} {...p} />;

export const Stat = ({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) => (
  <Card>
    <Text color="ink.500" fontSize="sm" fontWeight={500}>{label}</Text>
    <Heading size="lg" mt={1}>{value}</Heading>
    {hint && <Text fontSize="xs" color="ink.500" mt={1}>{hint}</Text>}
  </Card>
);

const statusMap: Record<string, [string, string]> = {
  open: ["green", "Open"], not_started: ["blue", "Scheduled"], ended: ["gray", "Ended"], closed: ["gray", "Closed"], cancelled: ["red", "Cancelled"],
};
export const StatusBadge = ({ status }: { status: string }) => {
  const [c, l] = statusMap[status] || ["gray", status];
  return <Badge colorScheme={c} borderRadius="full" px={2.5} py={0.5} textTransform="none" fontSize="xs">{l}</Badge>;
};

export const Empty = ({ title, body, action, onAction }: { title: string; body: string; action?: string; onAction?: () => void }) => (
  <VStack py={14} spacing={2} textAlign="center">
    <Heading size="sm">{title}</Heading>
    <Text color="ink.500" fontSize="sm" maxW="340px">{body}</Text>
    {action && <Button mt={3} onClick={onAction}>{action}</Button>}
  </VStack>
);

export const Loading = () => <Stack spacing={4}><Skeleton h="90px" borderRadius="2xl" /><Skeleton h="260px" borderRadius="2xl" /></Stack>;

export function getPosition(): Promise<GeolocationPosition> {
  return new Promise((res, rej) => {
    if (!navigator.geolocation) return rej(new Error("Location is not supported on this device"));
    navigator.geolocation.getCurrentPosition(res, (e) => rej(new Error(
      e.code === 1 ? "Location permission was denied. Allow location access in your browser settings." :
      e.code === 3 ? "Getting your location timed out. Try again." : "Your location is unavailable right now.")),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  });
}

export const PasswordInput = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => {
  const [show, setShow] = useState(false);
  return (
    <FormControl>
      <FormLabel>Password</FormLabel>
      <InputGroup>
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          pr="40px"
        />
        <InputRightElement>
          <IconButton size="xs" variant="ghost" icon={show ? <FiEyeOff /> : <FiEye />} onClick={() => setShow(!show)} aria-label="Toggle password visibility" />
        </InputRightElement>
      </InputGroup>
    </FormControl>
  );
};
