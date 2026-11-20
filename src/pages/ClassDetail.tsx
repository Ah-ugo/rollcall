import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heading, Text, HStack, VStack, Button, Tabs, TabList, Tab, TabPanels, TabPanel, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Input, IconButton, Switch, Box, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, SimpleGrid, useDisclosure, useToast, Progress, Menu, MenuButton, MenuList, MenuItem, InputGroup, InputRightElement, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter } from "@chakra-ui/react";
import { FiTrash2, FiCopy, FiDownload, FiMapPin } from "react-icons/fi";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { api, download, fmt, toLocalInput } from "../api";
import { Card, Empty, Loading, StatusBadge, getPosition } from "../components/Shared";

export default function ClassDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [c, setC] = useState<any>(null);
  const [students, setStudents] = useState<any[] | null>(null);
  const [sessions, setSessions] = useState<any[] | null>(null);
  const [report, setReport] = useState<any>(null);
  const [q, setQ] = useState("");
  const [rm, setRm] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [removing, setRemoving] = useState(false);
  const sm = useDisclosure();
  const now = new Date();
  const [s, setS] = useState({ title: "", start: toLocalInput(now), end: toLocalInput(new Date(now.getTime() + 3600000)), venue: "", lat: "", lng: "", radius: "50" });

  const loadClass = () => api(`/classes/${id}`).then(setC);
  const loadStudents = () => api(`/classes/${id}/students?q=${encodeURIComponent(q)}`).then(setStudents);
  const loadSessions = () => api(`/classes/${id}/sessions`).then(setSessions);
  const loadReport = () => api(`/classes/${id}/report`).then(setReport);
  useEffect(() => { loadClass(); loadSessions(); loadReport(); }, [id]);
  useEffect(() => { const t = setTimeout(loadStudents, 250); return () => clearTimeout(t); }, [q, id]);

  if (!c) return <Loading />;
  const link = `${window.location.origin}/enrol/${c.enrol_token}`;
  const patch = async (body: any) => { setC(await api(`/classes/${id}`, { method: "PATCH", body })); };
  const copy = (t: string) => { navigator.clipboard.writeText(t); toast({ status: "success", title: "Link copied", duration: 1500 }); };

  const useHere = async () => {
    try { const p = await getPosition(); setS({ ...s, lat: p.coords.latitude.toFixed(6), lng: p.coords.longitude.toFixed(6) }); }
    catch (e: any) { toast({ status: "error", title: e.message }); }
  };
  const createSession = async () => {
    setCreating(true);
    try {
      const r = await api(`/classes/${id}/sessions`, { body: {
        title: s.title, start_time: new Date(s.start).toISOString(), end_time: new Date(s.end).toISOString(),
        venue: s.venue, latitude: parseFloat(s.lat), longitude: parseFloat(s.lng), radius_m: parseFloat(s.radius) } });
      sm.onClose(); loadSessions(); toast({ status: "success", title: "Session created" });
      window.location.href = `/sessions/${r.id}`;
    } catch (e: any) { toast({ status: "error", title: e.message }); }
    setCreating(false);
  };
  const doRemove = async () => {
    setRemoving(true);
    try {
      await api(`/classes/${id}/students/${rm.id}`, { method: "DELETE" });
      setRm(null); loadStudents(); loadClass(); loadReport(); toast({ status: "success", title: "Student removed along with their face data" });
    } catch (e: any) { toast({ status: "error", title: e.message }); }
    setRemoving(false);
  };
  const editStudent = async (st: any) => {
    const name = window.prompt("Full name", st.full_name); if (name === null) return;
    const matric = window.prompt("Matriculation number", st.matric_no); if (matric === null) return;
    await api(`/classes/${id}/students/${st.id}`, { method: "PATCH", body: { full_name: name, matric_no: matric } }); loadStudents();
  };

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Text color="brand.600" fontWeight={700} fontSize="sm">{c.course_code}</Text>
        <HStack justify="space-between" flexWrap="wrap"><Heading size="lg">{c.course_title}</Heading><Button onClick={sm.onOpen}>New attendance session</Button></HStack>
      </Box>
      <Card>
        <Text fontWeight={600} fontSize="sm" mb={2}>Student enrolment link</Text>
        <InputGroup><Input isReadOnly value={link} pr="44px" /><InputRightElement><IconButton aria-label="Copy" size="sm" variant="ghost" icon={<FiCopy />} onClick={() => copy(link)} /></InputRightElement></InputGroup>
        <HStack mt={3} justify="space-between" flexWrap="wrap">
          <HStack><Switch isChecked={c.enrolment_open} onChange={(e) => patch({ enrolment_open: e.target.checked })} /><Text fontSize="sm">{c.enrolment_open ? "Enrolment open" : "Enrolment closed"}</Text></HStack>
          <Button size="sm" variant="ghost" isLoading={regenerating} onClick={async () => { setRegenerating(true); try { setC(await api(`/classes/${id}/regenerate-link`, { method: "POST", body: {} })); } catch (e: any) { toast({ status: "error", title: e.message }); } finally { setRegenerating(false); } }}>Generate new link</Button>
        </HStack>
      </Card>
      <Tabs variant="soft-rounded" colorScheme="brand" isLazy>
        <TabList flexWrap="wrap" gap={1}><Tab>Students ({c.student_count})</Tab><Tab>Sessions ({c.session_count})</Tab><Tab>Report</Tab><Tab>Settings</Tab></TabList>
        <TabPanels>
          <TabPanel px={0}>
            <Card>
              <Input placeholder="Search by name or matric number" mb={4} value={q} onChange={(e) => setQ(e.target.value)} />
              {!students ? <Loading /> : students.length === 0 ? <Empty title="No students found" body="Share the enrolment link above. Students appear here after registering their face." /> :
                <TableContainer><Table size="sm"><Thead><Tr><Th>Name</Th><Th>Matric no.</Th><Th>Registered</Th><Th /></Tr></Thead><Tbody>
                  {students.map((st) => <Tr key={st.id}><Td fontWeight={600}>{st.full_name}</Td><Td>{st.matric_no}</Td><Td>{fmt(st.created_at)}</Td>
                    <Td isNumeric><Button size="xs" variant="ghost" onClick={() => editStudent(st)}>Edit</Button><IconButton aria-label="Remove" size="xs" variant="ghost" colorScheme="red" icon={<FiTrash2 />} isDisabled={removing} onClick={() => setRm(st)} /></Td></Tr>)}
                </Tbody></Table></TableContainer>}
            </Card>
          </TabPanel>
          <TabPanel px={0}>
            {!sessions ? <Loading /> : sessions.length === 0 ? <Card><Empty title="No sessions yet" body="Create a session to generate its QR code and attendance link." action="New attendance session" onAction={sm.onOpen} /></Card> :
              <VStack align="stretch" spacing={3}>{sessions.map((x) => (
                <Card key={x.id} as={Link} to={`/sessions/${x.id}`} _hover={{ borderColor: "brand.300" }}>
                  <HStack justify="space-between" flexWrap="wrap"><Box><Text fontWeight={700}>{x.title}</Text><Text fontSize="sm" color="ink.500">{fmt(x.start_time)} · {x.venue}</Text></Box>
                    <HStack spacing={4}><Text fontSize="sm"><b>{x.present}</b>/{x.enrolled} present</Text><StatusBadge status={x.status} /></HStack></HStack>
                </Card>))}</VStack>}
          </TabPanel>
          <TabPanel px={0}>
            {!report ? <Loading /> : report.total_sessions === 0 ? <Card><Empty title="No completed sessions" body="Reports appear once at least one session has opened." /></Card> :
              <VStack align="stretch" spacing={4}>
                <HStack justify="flex-end">
                  <Menu><MenuButton as={Button} leftIcon={<FiDownload />} variant="outline">Export</MenuButton><MenuList>
                    {["csv", "xlsx", "pdf"].map((f) => <MenuItem key={f} onClick={() => download(`/classes/${id}/report/export?format=${f}`, `${c.course_code}.${f}`)}>{f.toUpperCase()}</MenuItem>)}
                  </MenuList></Menu>
                </HStack>
                <Card><Heading size="sm" mb={3}>Present per session</Heading><Box h="220px"><ResponsiveContainer><BarChart data={report.sessions}><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="present" fill="#4F46E5" radius={[6, 6, 0, 0]} /><Bar dataKey="failed_attempts" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Failed attempts" /></BarChart></ResponsiveContainer></Box></Card>
                <Card><TableContainer><Table size="sm"><Thead><Tr><Th>Student</Th><Th isNumeric>Attended</Th><Th isNumeric>Absent</Th><Th minW="160px">Attendance</Th></Tr></Thead><Tbody>
                  {report.students.map((r: any) => <Tr key={r.matric_no}><Td><Text fontWeight={600}>{r.full_name}</Text><Text fontSize="xs" color="ink.500">{r.matric_no}</Text></Td><Td isNumeric>{r.attended}/{r.total}</Td><Td isNumeric>{r.absent}</Td>
                    <Td><HStack><Progress value={r.percentage} flex={1} size="sm" borderRadius="full" colorScheme={r.percentage < 50 ? "red" : r.percentage < 75 ? "orange" : "green"} /><Text fontSize="xs" w="40px">{r.percentage}%</Text></HStack></Td></Tr>)}
                </Tbody></Table></TableContainer></Card>
              </VStack>}
          </TabPanel>
          <TabPanel px={0}>
            <Card><VStack align="stretch" spacing={4}>
              <FormControl><FormLabel>Course title</FormLabel><Input defaultValue={c.course_title} onBlur={(e) => e.target.value !== c.course_title && patch({ course_title: e.target.value })} /></FormControl>
              <FormControl><FormLabel>Course code</FormLabel><Input defaultValue={c.course_code} onBlur={(e) => e.target.value !== c.course_code && patch({ course_code: e.target.value })} /></FormControl>
              <Button alignSelf="start" variant="outline" colorScheme={c.archived ? "brand" : "red"} onClick={() => patch({ archived: !c.archived })}>{c.archived ? "Restore class" : "Archive class"}</Button>
            </VStack></Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal isOpen={sm.isOpen} onClose={sm.onClose} size="lg" isCentered scrollBehavior="inside">
        <ModalOverlay /><ModalContent borderRadius="2xl"><ModalHeader>New attendance session</ModalHeader><ModalCloseButton />
          <ModalBody><VStack spacing={4}>
            <FormControl isRequired><FormLabel>Session title</FormLabel><Input placeholder="Week 5: Requirements engineering" value={s.title} onChange={(e) => setS({ ...s, title: e.target.value })} /></FormControl>
            <SimpleGrid columns={2} spacing={3} w="full">
              <FormControl isRequired><FormLabel>Opens</FormLabel><Input type="datetime-local" value={s.start} onChange={(e) => setS({ ...s, start: e.target.value })} /></FormControl>
              <FormControl isRequired><FormLabel>Closes</FormLabel><Input type="datetime-local" value={s.end} onChange={(e) => setS({ ...s, end: e.target.value })} /></FormControl>
            </SimpleGrid>
            <FormControl isRequired><FormLabel>Venue</FormLabel><Input placeholder="LT2, Faculty of Science" value={s.venue} onChange={(e) => setS({ ...s, venue: e.target.value })} /></FormControl>
            <SimpleGrid columns={2} spacing={3} w="full">
              <FormControl isRequired><FormLabel>Latitude</FormLabel><Input value={s.lat} onChange={(e) => setS({ ...s, lat: e.target.value })} /></FormControl>
              <FormControl isRequired><FormLabel>Longitude</FormLabel><Input value={s.lng} onChange={(e) => setS({ ...s, lng: e.target.value })} /></FormControl>
            </SimpleGrid>
            <Button leftIcon={<FiMapPin />} variant="outline" alignSelf="start" onClick={useHere}>Use my current location</Button>
            <FormControl isRequired><FormLabel>Allowed radius (metres)</FormLabel><Input type="number" value={s.radius} onChange={(e) => setS({ ...s, radius: e.target.value })} /></FormControl>
          </VStack></ModalBody>
          <ModalFooter gap={2}><Button variant="ghost" onClick={sm.onClose}>Cancel</Button><Button isLoading={creating} onClick={createSession}>Create session</Button></ModalFooter>
        </ModalContent>
      </Modal>
      <AlertDialog isOpen={!!rm} leastDestructiveRef={undefined as any} onClose={() => setRm(null)} isCentered>
        <AlertDialogOverlay><AlertDialogContent borderRadius="2xl"><AlertDialogHeader>Remove {rm?.full_name}?</AlertDialogHeader>
          <AlertDialogBody>This deletes their face profile and removes them from the class. Past attendance records stay in the audit log.</AlertDialogBody>
          <AlertDialogFooter gap={2}><Button variant="ghost" onClick={() => setRm(null)}>Cancel</Button><Button colorScheme="red" isLoading={removing} onClick={doRemove}>Remove student</Button></AlertDialogFooter>
        </AlertDialogContent></AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
}
