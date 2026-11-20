import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, FormControl, FormLabel, Heading, Input, Text, VStack, Center, Spinner, Alert, AlertIcon } from "@chakra-ui/react";
import { api, fmt } from "../api";
import CameraCapture, { CameraHandle } from "../components/CameraCapture";
import { getPosition } from "../components/Shared";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Attend() {
  const { token } = useParams();
  const cam = useRef<CameraHandle>(null);
  const [info, setInfo] = useState<any>(null);
  const [matric, setMatric] = useState("");
  const [step, setStep] = useState<"id" | "verify" | "done">("id");
  const [prompt, setPrompt] = useState("Centre your face in the oval");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => { api(`/public/attend/${token}`).then(setInfo).catch((e) => setErr(e.message)); }, [token]);

  const verify = async () => {
    setBusy(true); setErr("");
    try {
      // Liveness prompt: two frames about 2 seconds apart while the student moves
      setPrompt("Look straight at the camera"); await wait(800);
      const a = cam.current?.capture();
      setPrompt("Now blink and turn your head slightly"); await wait(2000);
      const b = cam.current?.capture();
      if (!a || !b) throw new Error("Camera is not ready. Wait a moment and try again.");
      setPrompt("Checking your location…");
      const pos = await getPosition();
      setPrompt("Verifying…");
      const r = await api(`/public/attend/${token}/verify`, { body: { matric_no: matric, images: [a, b],
        latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy } });
      setResult(r); setStep("done");
    } catch (e: any) { setErr(e.message); setPrompt("Centre your face in the oval"); }
    setBusy(false);
  };

  if (!info && !err) return <Center h="100vh"><Spinner color="brand.500" /></Center>;
  const blocked = info && info.status !== "open";
  const why: Record<string, string> = { not_started: info ? `Attendance opens ${fmt(info.start_time)}.` : "", ended: "Attendance for this session has closed.", closed: "The lecturer has closed this session.", cancelled: "This session was cancelled." };
  return (
    <Center minH="100vh" p={4}><Box w="full" maxW="440px" bg="white" p={{ base: 5, md: 8 }} borderRadius="2xl" border="1px solid" borderColor="ink.100">
      {!info ? <Alert status="error" borderRadius="xl"><AlertIcon />{err}</Alert> : (
        <VStack align="stretch" spacing={4}>
          <Box><Text color="brand.600" fontWeight={700} fontSize="sm">{info.course_code} · {info.course_title}</Text><Heading size="md">{info.title}</Heading><Text fontSize="sm" color="ink.500">{info.venue}</Text></Box>
          {blocked ? <Alert status="warning" borderRadius="xl"><AlertIcon />{why[info.status]}</Alert> :
            step === "done" ? <VStack py={6} spacing={2} textAlign="center"><Heading size="md" color="green.600">Attendance recorded</Heading><Text color="ink.500">Thanks, {result.full_name}. You were {result.distance_m} m from the venue.</Text></VStack> :
            step === "id" ? <>
              <FormControl><FormLabel>Matriculation number</FormLabel><Input size="lg" value={matric} onChange={(e) => setMatric(e.target.value)} placeholder="22/0012" autoCapitalize="characters" /></FormControl>
              <Button size="lg" isDisabled={matric.trim().length < 3} onClick={() => setStep("verify")}>Continue</Button>
            </> : <>
              <CameraCapture ref={cam} overlay={prompt} />
              {err && <Alert status="error" borderRadius="xl" fontSize="sm"><AlertIcon />{err}</Alert>}
              <Text fontSize="xs" color="ink.500">Your browser will ask for camera and location access. Both are needed to confirm you are in the lecture.</Text>
              <Button size="lg" isLoading={busy} loadingText="Verifying" onClick={verify}>{err ? "Try again" : "Verify and submit"}</Button>
              <Button variant="ghost" isDisabled={busy} onClick={() => { setStep("id"); setErr(""); }}>Change matric number</Button>
            </>}
        </VStack>)}
    </Box></Center>
  );
}
