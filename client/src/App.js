import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";
import { AuthContext } from "./AuthContext";
import { useState } from "react";
function App() {
  const [accessToken, setAccessToken] = useState("");
  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>
      <BrowserRouter>
        <div>
          <Routes>
            <Route exact path="/" element={<LandingPage />}></Route>
            <Route exact path="/chat" element={<ChatPage />}></Route>
          </Routes>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
