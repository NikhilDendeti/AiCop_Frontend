// components/DocuChatWidget.tsx
import { useEffect } from "react";

const PoliceDocuChatWidget = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.docuchat.io/widget/widget.min.js";
    script.type = "text/javascript";
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.setAttribute(
      "data-chatbot-id",
      "706a3b3d-7013-4060-b6ad-1efe58d437cb"
    );
    script.setAttribute(
      "data-chatbot-avatar-url",
      "https://s3.eu-central-1.amazonaws.com/docuchatv2/706a3b3d-7013-4060-b6ad-1efe58d437cb/avatar.png?v=3da6619c-2358-455b-be8a-405334566c48"
    );
    script.setAttribute("data-visible-urls", "");

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null; // No visible component, script injects the widget
};

export default PoliceDocuChatWidget;
