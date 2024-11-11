// src/components/TagInputForm.jsx
import { useState, useEffect } from "react";
import socket from "../socket"; // Ensure this points to your Socket.IO client instance

const TagInputForm = ({ onUidResult, uidResult }) => {
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    // Connection event
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    // Connection error event
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Disconnection event
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    // UIDresult event
    socket.on("uidresult", (data) => {
      console.log("Received UIDresult:", data);

      // Ensure UIDresult is a string
      let uidResultStr;
      if (data.UIDresult && typeof data.UIDresult === "string") {
        uidResultStr = data.UIDresult;
      } else if (data.UIDresult && data.UIDresult.type === "Buffer") {
        // Convert Buffer-like object to string
        uidResultStr = new TextDecoder("utf-8").decode(new Uint8Array(data.UIDresult.data));
      } else {
        uidResultStr = "";
      }

      if (onUidResult) {
        onUidResult(uidResultStr);
      }
      setTimestamp(data.updatedAt || data.createdAt);
    });

    // Cleanup on unmount
    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("uidresult");
    };
  }, [onUidResult]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">UIDresult</label>
        <input
          type="text"
          value={uidResult}
          readOnly
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-200 focus:outline-none sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Scanned At</label>
        <input
          type="text"
          value={timestamp ? new Date(timestamp).toLocaleString() : ""}
          readOnly
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-200 focus:outline-none sm:text-sm"
        />
      </div>
    </div>
  );
};

export default TagInputForm;
