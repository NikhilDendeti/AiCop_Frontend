// // components/DocuChatWidget.tsx
// import { useEffect } from "react";

// export const DocuChatWidget = () => {
//   useEffect(() => {
//     const script = document.createElement("script");
//     script.src = "https://app.docuchat.io/widget/widget.min.js";
//     script.type = "text/javascript";
//     script.defer = true;
//     script.crossOrigin = "anonymous";
//     script.setAttribute(
//       "data-chatbot-id",
//       "bb48bd8f-0aad-4a63-bf51-af13f5f0a287"
//     );
//     script.setAttribute("data-chatbot-avatar-url", "");
//     script.setAttribute("data-visible-urls", "");

//     document.body.appendChild(script);

//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);

//   // useEffect(() => {
//   //   const script = document.createElement("script");
//   //   script.src = "https://app.docuchat.io/widget/widget.min.js";
//   //   script.defer = true;
//   //   script.crossOrigin = "anonymous";
//   //   script.setAttribute(
//   //     "data-chatbot-id",
//   //     "bb48bd8f-0aad-4a63-bf51-af13f5f0a287"
//   //   );

//   //   document.body.appendChild(script);

//   //   // Delay to allow widget to load, then style it
//   //   const interval = setInterval(() => {
//   //     const iframe = document.querySelector<HTMLElement>(
//   //       "iframe[src*='docuchat']"
//   //     );
//   //     if (iframe) {
//   //       (iframe as HTMLIFrameElement).style.width = "400px";
//   //       (iframe as HTMLIFrameElement).style.height = "600px";
//   //       clearInterval(interval);
//   //     }
//   //   }, 500);

//   //   return () => {
//   //     document.body.removeChild(script);
//   //     clearInterval(interval);
//   //   };
//   // }, []);

//   return null;
// };

// app/docuchat/page.tsx (or /pages/docuchat.tsx if using Next.js pages)
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
    script.setAttribute("data-chatbot-avatar-url", "");
    script.setAttribute("data-visible-urls", "*"); // shows on all routes

    document.body.appendChild(script);

    // Optional: resize the iframe after it loads
    const interval = setInterval(() => {
      const iframe = document.querySelector("iframe[src*='docuchat']");
      if (iframe) {
        const frame = iframe as HTMLIFrameElement;
        frame.style.position = "fixed";
        frame.style.top = "0";
        frame.style.left = "0";
        frame.style.width = "100vw";
        frame.style.height = "100vh";
        frame.style.border = "none";
        frame.style.zIndex = "9999";
        clearInterval(interval);
      }
    }, 500);

    return () => {
      document.body.removeChild(script);
      clearInterval(interval);
    };
  }, []);

  return null; // Because the widget injects itself via script
};

export default DocuChatPage;
