import { useEffect } from "react";
import { socketService } from "../api/socketService";

export default function useSocket(event, callback, dependencies = []) {
  useEffect(() => {
    // Ensure socket reconnection if needed
    socketService.ensureConnection();

    // Add event listener
    const unsubscribe = socketService.on(event, callback);

    // Cleanup on unmount or when dependencies change
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    isConnected: socketService.isConnected(),
    emit: socketService.emitToServer.bind(socketService),
  };
}
