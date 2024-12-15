import React, { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthCallbackHandler: FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = () => {
      const queryParams = new URLSearchParams(window.location.search);
      const accessToken = queryParams.get("access_token");

      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
      }
      navigate("/home");
    };

    handleOAuthCallback();
  }, [navigate]);

  return <div>Redirecting...</div>;
};
export default OAuthCallbackHandler;
