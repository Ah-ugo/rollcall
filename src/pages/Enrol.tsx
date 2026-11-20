import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Checkbox, FormControl, FormLabel, Heading, Input, Text, VStack, Center, Spinner, Alert, AlertIcon } from "@chakra-ui/react";
import { api } from "../api";
import CameraCapture, { CameraHandle } from "../components/CameraCapture";

export default function Enrol() {
  const { token } = useParams();
  const cam = useRef<CameraHandle>(null);
  const [info, setInfo] = useState<any>(null);
  const [err, setErr] = useState("");
  const [f, setF] = useState({ full_name: "", matric_no: "" });
  const [consent, setConsent] = useState(false);
  const [step, setStep] = useState<"form" | "face" | "done">("form");
  const [busy, setBusy] = useState(false);

  useEffect(() => { api(`/public/enrol/${token}`).then(setInfo).catch((e) => setErr(e.message)); }, [token]);

  const submit = async () => {
    const image = cam.current?.capture();
    if (!image) return setErr("Camera is not ready yet. Wait a moment and try again.");
    setBusy(true); setErr("");
    try { await api(`/public/enrol/${token}`, { body: { ...f, image, consent } }); setStep("done"); }
    catch (e: any) { setErr(e.message); }
    setBusy(false);
  };

  if (!info && !err) return <Center h="100vh"><Spinner color="brand.500" /></Center>;
  return (
    <Center minH="100vh" p={4}><Box w="full" maxW="440px" bg="white" p={{ base: 5, md: 8 }} borderRadius="2xl" border="1px solid" borderColor="ink.100">
      {!info ? <Alert status="error" borderRadius="xl"><AlertIcon />{err}</Alert> : step === "done" ? (
        <VStack spacing={2} textAlign="center" py={6}><Heading size="md">You are enrolled</Heading><Text color="ink.500">{info.course_code} · {info.course_title}. You can now take attendance by scanning the lecturer's QR code.</Text></VStack>
      ) : (
        <VStack align="stretch" spacing={4}>
          <Box><Text color="brand.600" fontWeight={700} fontSize="sm">{info.course_code}</Text><Heading size="md">{info.course_title}</Heading><Text fontSize="sm" color="ink.500">Lecturer: {info.lecturer}</Text></Box>
          {!info.open ? <Alert status="warning" borderRadius="xl"><AlertIcon />Enrolment for this class is closed. Contact your lecturer.</Alert> :
            step === "form" ? <>
              <FormControl isRequired><FormLabel>Full name</FormLabel><Input value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></FormControl>
              <FormControl isRequired><FormLabel>Matriculation number</FormLabel><Input value={f.matric_no} onChange={(e) => setF({ ...f, matric_no: e.target.value })} /></FormControl>
              <Checkbox isChecked={consent} onChange={(e) => setConsent(e.target.checked)} alignItems="flex-start"><Text fontSize="sm">I consent to my face being scanned and a numerical face profile being stored to verify my attendance in this class. I can ask my lecturer to delete it.</Text></Checkbox>
              <Button size="lg" isDisabled={!consent || f.full_name.trim().length < 2 || f.matric_no.trim().length < 3} onClick={() => setStep("face")}>Continue to face registration</Button>
            </> : <>
              <CameraCapture ref={cam} overlay="Centre your face in the oval, in good light" />
              {err && <Alert status="error" borderRadius="xl" fontSize="sm"><AlertIcon />{err}</Alert>}
              <Button size="lg" isLoading={busy} onClick={submit}>Capture and enrol</Button>
              <Button variant="ghost" onClick={() => setStep("form")}>Back</Button>
            </>}
        </VStack>)}
    </Box></Center>
  );
}
