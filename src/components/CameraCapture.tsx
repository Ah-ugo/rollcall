import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Box, Text, Center } from "@chakra-ui/react";

export type CameraHandle = { capture: () => string | null };

const CameraCapture = forwardRef<CameraHandle, { overlay?: string }>(({ overlay }, ref) => {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let stream: MediaStream | undefined;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
      .then((s) => { stream = s; if (video.current) video.current.srcObject = s; })
      .catch(() => setError("Camera access is blocked. Allow camera permission in your browser settings, then reload. HTTPS is required."));
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  useImperativeHandle(ref, () => ({
    capture() {
      const v = video.current;
      if (!v || !v.videoWidth) return null;
      const c = document.createElement("canvas");
      c.width = v.videoWidth; c.height = v.videoHeight;
      c.getContext("2d")!.drawImage(v, 0, 0);
      return c.toDataURL("image/jpeg", 0.9);
    },
  }));

  if (error) return <Center bg="ink.100" borderRadius="2xl" p={8} minH="240px"><Text fontSize="sm" textAlign="center" color="ink.700">{error}</Text></Center>;
  return (
    <Box position="relative" borderRadius="2xl" overflow="hidden" bg="brand.900" aspectRatio={4 / 3}>
      <video ref={video} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
      <Box position="absolute" inset={0} display="flex" alignItems="center" justifyContent="center" pointerEvents="none">
        <Box w="48%" h="72%" border="3px dashed" borderColor="whiteAlpha.800" borderRadius="50%" />
      </Box>
      {overlay && <Box position="absolute" bottom={3} left={3} right={3} bg="blackAlpha.700" color="white" borderRadius="xl" px={3} py={2} textAlign="center" fontSize="sm" fontWeight={600}>{overlay}</Box>}
    </Box>
  );
});
export default CameraCapture;
