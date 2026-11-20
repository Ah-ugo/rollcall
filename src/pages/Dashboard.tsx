import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SimpleGrid, Heading, Text, Box, HStack, VStack, Button, Grid } from "@chakra-ui/react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { api, fmt } from "../api";
import { Card, Stat, Empty, Loading, StatusBadge } from "../components/Shared";
import { useAuth } from "../auth";

export default function Dashboard() {
  const [d, setD] = useState<any>(null);
  const { user } = useAuth();
  const nav = useNavigate();
  useEffect(() => { api("/classes/overview").then(setD); }, []);
  if (!d) return <Loading />;
  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between" flexWrap="wrap">
        <Box><Heading size="lg">Hello, {user?.full_name.split(" ")[0]}</Heading><Text color="ink.500">Here is how your classes are doing.</Text></Box>
        <Button onClick={() => nav("/classes")}>New class or session</Button>
      </HStack>
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
        <Stat label="Classes" value={d.classes} /><Stat label="Enrolled students" value={d.students} /><Stat label="Attendance sessions" value={d.sessions} />
      </SimpleGrid>
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={4}>
        <Card>
          <Heading size="sm" mb={4}>Attendance rate, last sessions</Heading>
          {d.trend.length === 0 ? <Empty title="No sessions yet" body="Create a session from any class to see attendance trends here." /> :
            <Box h="260px"><ResponsiveContainer><BarChart data={d.trend}>
              <CartesianGrid vertical={false} stroke="#EEF0F6" /><XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="rate" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Attendance %" />
            </BarChart></ResponsiveContainer></Box>}
        </Card>
        <Card>
          <Heading size="sm" mb={3}>Active and upcoming</Heading>
          {d.active.length === 0 ? <Text fontSize="sm" color="ink.500">Nothing scheduled right now.</Text> :
            d.active.map((s: any) => (
              <Box key={s.id} as={Link} to={`/sessions/${s.id}`} display="block" py={2.5} borderBottom="1px solid" borderColor="ink.100">
                <HStack justify="space-between"><Text fontWeight={600} fontSize="sm">{s.course_code} · {s.title}</Text><StatusBadge status={s.status} /></HStack>
                <Text fontSize="xs" color="ink.500">{fmt(s.start_time)}</Text>
              </Box>))}
        </Card>
      </Grid>
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4}>
        <Card>
          <Heading size="sm" mb={3}>Recent activity</Heading>
          {d.recent.length === 0 ? <Text fontSize="sm" color="ink.500">Submissions will appear here as students check in.</Text> :
            d.recent.map((a: any) => (
              <HStack key={a.id} justify="space-between" py={2} borderBottom="1px solid" borderColor="ink.100" fontSize="sm">
                <Text fontWeight={600}>{a.matric_no}</Text>
                <Text color={a.success ? "green.600" : "red.500"}>{a.reason}</Text>
              </HStack>))}
        </Card>
        <Card>
          <Heading size="sm" mb={3}>Most used classes</Heading>
          {d.top_classes.length === 0 ? <Text fontSize="sm" color="ink.500">No classes yet.</Text> :
            d.top_classes.map((c: any) => (
              <Box key={c.id} as={Link} to={`/classes/${c.id}`} display="block" py={2.5} borderBottom="1px solid" borderColor="ink.100">
                <Text fontWeight={600} fontSize="sm">{c.course_code} · {c.course_title}</Text><Text fontSize="xs" color="ink.500">{c.sessions} sessions</Text>
              </Box>))}
        </Card>
      </Grid>
    </VStack>
  );
}
