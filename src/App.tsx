import { Routes, Route, Navigate } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";
import { useAuth } from "./auth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import ClassDetail from "./pages/ClassDetail";
import SessionDetail from "./pages/SessionDetail";
import Enrol from "./pages/Enrol";
import Attend from "./pages/Attend";

function Protected({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <Center h="100vh"><Spinner color="brand.500" /></Center>;
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/enrol/:token" element={<Enrol />} />
      <Route path="/attendance/:token" element={<Attend />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/classes" element={<Protected><Classes /></Protected>} />
      <Route path="/classes/:id" element={<Protected><ClassDetail /></Protected>} />
      <Route path="/sessions/:id" element={<Protected><SessionDetail /></Protected>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
