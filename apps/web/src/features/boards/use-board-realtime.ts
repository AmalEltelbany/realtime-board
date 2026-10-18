"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { SocketEvents, type ActivityDto, type BoardDto, type BoardEventEnvelope, type PresenceUpdate, type UserDto } from "@board/shared";
import { CLIENT_ID } from "@/lib/client-id";
import { authApi } from "../auth/auth-api";
import { boardKeys } from "./boards-api";
import { applyBoardEvent } from "./board-state";

export type ConnectionState = "connecting" | "live" | "offline";

/** Applies other people's changes to the cached board as they happen, and tracks who is viewing. */
export function useBoardRealtime(boardId: string) {
  const queryClient = useQueryClient();
  const [viewers, setViewers] = useState<UserDto[]>([]);
  const [connection, setConnection] = useState<ConnectionState>("connecting");

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000", {
      // A function, so every reconnect fetches a fresh short-lived token.
      auth: (cb) => {
        authApi.socketToken().then(({ token }) => cb({ token }), () => cb({}));
      },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      setConnection("live");
      socket.emit(SocketEvents.join, { boardId });
      // Anything that happened while we were disconnected was missed, so resync once.
      void queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    });
    socket.on("disconnect", () => setConnection("offline"));
    socket.on("connect_error", () => setConnection("offline"));

    socket.on(SocketEvents.event, (envelope: BoardEventEnvelope) => {
      if (envelope.boardId !== boardId) return;
      const { event } = envelope;
      if (event.type === "activity") {
        queryClient.setQueryData<ActivityDto[]>(boardKeys.activity(boardId), (items) =>
          items ? [event.activity, ...items].slice(0, 50) : items,
        );
        return;
      }
      // This tab already applied its own change optimistically.
      if (envelope.originClientId === CLIENT_ID) return;
      queryClient.setQueryData<BoardDto>(boardKeys.detail(boardId), (board) => (board ? applyBoardEvent(board, event) : board));
    });

    socket.on(SocketEvents.presence, (update: PresenceUpdate) => {
      if (update.boardId === boardId) setViewers(update.users);
    });

    return () => {
      socket.emit(SocketEvents.leave, { boardId });
      socket.disconnect();
    };
  }, [boardId, queryClient]);

  return { viewers, connection };
}
