import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Heading, Text, HStack, VStack, Button, Box, SimpleGrid, Image, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge, useToast, InputGroup, Input, InputRightElement, IconButton, Grid } from "@chakra-ui/react";
import { FiCopy, FiDownload, FiPrinter } from "react-icons/fi";
import { api, WS, fmt } from "../api";
import { Card, Stat, StatusBadge, Loading } from "../components/Shared";

export default function SessionDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [s, setS] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const ws = useRef<WebSocket>();

  const load = async () => { setS(await api(`/sessions/${id}`)); setAttempts(await api(`/sessions/${id}/attempts`)); };
  useEffect(() => {
    load();
    const connect = () => {
      const w = new WebSocket(`${WS}/ws/sessions/${id}?token=${localStorage.getItem("token")}`);
      w.onmessage = (m) => { const d = JSON.parse(m.data); if (d.type === "attempt") { setAttempts((a) => [d.attempt, ...a]); load(); } };
      w.onclose = () => { ws.current = undefined; setTimeout(() => { if (document.visibilityState !== "hidden") connect(); }, 3000); };
      ws.current = w;
    };
    connect();
    const tick = setInterval(load, 30000); // keeps status badge fresh as times pass
    return () => { clearInterval(tick); ws.current?.close(); };
  }, [id]);

  if (!s) return <Loading />;
  const act = async (action: string) => { setS({ ...(await api(`/sessions/${id}`, { method: "PATCH", body: { action } })), roster: s.roster }); load(); };
  const copy = () => { navigator.clipboard.writeText(s.url); toast({ status: "success", title: "Link copied", duration: 1500 }); };
  const live = s.status === "open" || s.status === "not_started";

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between" flexWrap="wrap">
        <Box><Text color="brand.600" fontWeight={700} fontSize="sm">{s.course_code} · {s.course_title}</Text><HStack><Heading size="lg">{s.title}</Heading><StatusBadge status={s.status} /></HStack>
          <Text color="ink.500" fontSize="sm">{fmt(s.start_time)} to {fmt(s.end_time)} · {s.venue} · {s.radius_m} m radius</Text></Box>
        {live && <HStack><Button variant="outline" onClick={() => act("close")}>Close now</Button><Button variant="outline" colorScheme="red" onClick={() => window.confirm("Cancel this session?") && act("cancel")}>Cancel session</Button></HStack>}
      </HStack>
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <Stat label="Enrolled" value={s.enrolled} /><Stat label="Present" value={s.present} /><Stat label="Not yet present" value={s.enrolled - s.present} /><Stat label="Failed attempts" value={s.failed} />
      </SimpleGrid>
      <Grid templateColumns={{ base: "1fr", lg: "320px 1fr" }} gap={4}>
        <Card textAlign="center" className="print-area">
          <Heading size="sm" mb={1}>{s.course_code}</Heading><Text fontSize="sm" color="ink.500" mb={3}>Scan to take attendance</Text>
          <Image src={s.qr} alt="Attendance QR code" mx="auto" w="240px" />
          <InputGroup mt={4} size="sm"><Input isReadOnly value={s.url} fontSize="xs" pr="40px" /><InputRightElement><IconButton aria-label="Copy" size="xs" variant="ghost" icon={<FiCopy />} onClick={copy} /></InputRightElement></InputGroup>
          <HStack mt={3} justify="center" className="no-print">
            <Button as="a" href={s.qr} download={`${s.course_code}-qr.png`} size="sm" variant="outline" leftIcon={<FiDownload />}>Download</Button>
            <Button size="sm" variant="outline" leftIcon={<FiPrinter />} onClick={() => window.print()}>Print</Button>
          </HStack>
        </Card>
        <VStack align="stretch" spacing={4}>
          <Card>
            <Heading size="sm" mb={3}>Live submissions</Heading>
            {attempts.length === 0 ? <Text fontSize="sm" color="ink.500">Waiting for the first student. New attempts appear here instantly.</Text> :
              <Box maxH="240px" overflowY="auto">{attempts.slice(0, 30).map((a) => (
                <HStack key={a.id} justify="space-between" py={2} borderBottom="1px solid" borderColor="ink.100" fontSize="sm">
                  <Box><Text fontWeight={600}>{a.matric_no}</Text><Text fontSize="xs" color="ink.500">{a.full_name || "Unknown"} · {fmt(a.created_at)}</Text></Box>
                  <Badge colorScheme={a.success ? "green" : "red"} textTransform="none" borderRadius="full" px={2}>{a.reason}</Badge>
                </HStack>))}</Box>}
          </Card>
        </VStack>
      </Grid>
      <Card>
        <Heading size="sm" mb={3}>Register</Heading>
        <TableContainer><Table size="sm"><Thead><Tr><Th>Student</Th><Th>Matric no.</Th><Th>Status</Th><Th>Time</Th><Th isNumeric>Distance</Th></Tr></Thead><Tbody>
          {s.roster.map((r: any) => <Tr key={r.id}><Td fontWeight={600}>{r.full_name}</Td><Td>{r.matric_no}</Td>
            <Td><Badge colorScheme={r.present ? "green" : "gray"} textTransform="none" borderRadius="full" px={2}>{r.present ? "Present" : "Absent"}</Badge></Td>
            <Td>{r.time ? new Date(r.time).toLocaleTimeString() : "—"}</Td><Td isNumeric>{r.distance_m != null ? `${r.distance_m} m` : "—"}</Td></Tr>)}
        </Tbody></Table></TableContainer>
      </Card>
      <style>{`@media print { body * { visibility: hidden } .print-area, .print-area * { visibility: visible } .print-area { position: absolute; left: 0; top: 0; width: 100%; border: 0 !important } .no-print { display: none !important } }`}</style>
    </VStack>
  );
}
