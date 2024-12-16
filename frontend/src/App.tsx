import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/HomePage";
import OAuthCallbackHandler from "./components/OAuthCallBackHandler";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OAuthCallbackHandler />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
};
export default App;
