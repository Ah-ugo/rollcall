import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SimpleGrid, Heading, Text, HStack, Button, Box, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, Input, Textarea, useDisclosure, useToast, Switch, VStack } from "@chakra-ui/react";
import { api } from "../api";
import { Card, Empty, Loading } from "../components/Shared";

export default function Classes() {
  const [list, setList] = useState<any[] | null>(null);
  const [archived, setArchived] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [f, setF] = useState({ course_code: "", course_title: "", description: "" });
  const [creating, setCreating] = useState(false);
  const toast = useToast();
  const load = () => api(`/classes?archived=${archived}`).then(setList);
  useEffect(() => { setList(null); load(); }, [archived]);

  const create = async () => {
    setCreating(true);
    try { await api("/classes", { body: f }); onClose(); setF({ course_code: "", course_title: "", description: "" }); load(); toast({ status: "success", title: "Class created" }); }
    catch (e: any) { toast({ status: "error", title: e.message }); }
    setCreating(false);
  };
  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between" flexWrap="wrap">
        <Heading size="lg">Classes</Heading>
        <HStack><Text fontSize="sm" color="ink.500">Show archived</Text><Switch isChecked={archived} onChange={(e) => setArchived(e.target.checked)} /><Button onClick={onOpen}>New class</Button></HStack>
      </HStack>
      {!list ? <Loading /> : list.length === 0 ?
        <Card><Empty title={archived ? "No archived classes" : "No classes yet"} body="Create a class, then share its enrolment link so students can register their face." action={archived ? undefined : "Create your first class"} onAction={onOpen} /></Card> :
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
          {list.map((c) => (
            <Card key={c.id} as={Link} to={`/classes/${c.id}`} _hover={{ borderColor: "brand.300" }} transition="border-color .15s">
              <Text color="brand.600" fontWeight={700} fontSize="sm">{c.course_code}</Text>
              <Heading size="md" mt={1} mb={4}>{c.course_title}</Heading>
              <HStack spacing={6} color="ink.500" fontSize="sm"><Box><b>{c.student_count}</b> students</Box><Box><b>{c.session_count}</b> sessions</Box></HStack>
            </Card>))}
        </SimpleGrid>}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay /><ModalContent borderRadius="2xl"><ModalHeader>New class</ModalHeader><ModalCloseButton />
          <ModalBody><VStack spacing={4}>
            <FormControl isRequired><FormLabel>Course code</FormLabel><Input placeholder="CSC 401" value={f.course_code} onChange={(e) => setF({ ...f, course_code: e.target.value })} /></FormControl>
            <FormControl isRequired><FormLabel>Course title</FormLabel><Input placeholder="Software Engineering" value={f.course_title} onChange={(e) => setF({ ...f, course_title: e.target.value })} /></FormControl>
            <FormControl><FormLabel>Description (optional)</FormLabel><Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></FormControl>
          </VStack></ModalBody>
          <ModalFooter gap={2}><Button variant="ghost" onClick={onClose}>Cancel</Button><Button isLoading={creating} onClick={create}>Create class</Button></ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
