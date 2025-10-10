import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "react-hot-toast";

import Router from "@/routes/routes";
import AuthProvider from "./Provider/authProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <TooltipProvider>
          <Toaster position="bottom-right" reverseOrder={false} />
          <Router />
        </TooltipProvider>
      </GoogleOAuthProvider>
    </AuthProvider>
  );
}

export default App;
