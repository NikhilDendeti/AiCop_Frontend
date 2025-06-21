"use client";
import { useEffect } from "react";

const DocuChatPage = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.docuchat.io/widget/widget.min.js";
    script.type = "text/javascript";
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.setAttribute(
      "data-chatbot-id",
      "bb48bd8f-0aad-4a63-bf51-af13f5f0a287"
    );
    script.setAttribute("data-visible-urls", "*"); // Show on all routes

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null; // Script injects widget automatically
};

export default DocuChatPage;
