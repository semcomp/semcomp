import { useEffect, useState, useCallback, useRef } from 'react';
import SocketManager from '../socket-manager';
import { Socket } from 'socket.io-client';
import { useAppContext } from '../contextLib';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, ...args: any[]) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
  once: (event: string, callback: (...args: any[]) => void) => void;
  connect: () => Promise<Socket>;
  disconnect: () => void;
}

export function useSocket(): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketManager = useRef(SocketManager.getInstance());
  const listenersRef = useRef<Map<string, (...args: any[]) => void>>(new Map());
  const connectionTimeoutRef = useRef<NodeJS.Timeout>();
  const { token } = useAppContext();

  useEffect(() => {
    const manager = socketManager.current;
    
    // Conectar automaticamente com timeout
    const connectWithTimeout = async () => {
      try {
        connectionTimeoutRef.current = setTimeout(() => {
          console.error('Socket connection timeout');
          setIsConnected(false);
        }, 10000); // 10 segundos

        const socket = await manager.connect();
        clearTimeout(connectionTimeoutRef.current);
        setSocket(socket);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect socket:', error);
        setIsConnected(false);
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
        }
      }
    };

    connectWithTimeout();

    // Listener para mudanças de conexão
    const handleConnect = () => {
      setIsConnected(true);
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
    
    const handleDisconnect = () => {
      setIsConnected(false);
    };

    manager.on('connect', handleConnect);
    manager.on('disconnect', handleDisconnect);

    return () => {
      manager.off('connect', handleConnect);
      manager.off('disconnect', handleDisconnect);
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, []);

  const emit = useCallback((event: string, ...args: any[]) => {
    if (!isConnected) {
      console.warn('Socket not connected, cannot emit event:', event);
      return;
    }
    
    // Adicionar token automaticamente se disponível
    if (token && args.length > 0 && typeof args[0] === 'object' && !args[0].token) {
      args[0] = { ...args[0], token };
    } else if (token && args.length === 0) {
      args = [{ token }];
    }
    
    socketManager.current.emit(event, ...args);
  }, [isConnected, token]);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    // Verificar se já existe um listener para este evento
    if (listenersRef.current.has(event)) {
      console.warn(`Listener for event '${event}' already exists. Removing previous listener.`);
      socketManager.current.off(event, listenersRef.current.get(event));
    }
    
    socketManager.current.on(event, callback);
    listenersRef.current.set(event, callback);
  }, []);

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (callback) {
      socketManager.current.off(event, callback);
      listenersRef.current.delete(event);
    } else {
      socketManager.current.off(event);
      listenersRef.current.delete(event);
    }
  }, []);

  const once = useCallback((event: string, callback: (...args: any[]) => void) => {
    socketManager.current.once(event, callback);
  }, []);

  const connect = useCallback(async () => {
    return await socketManager.current.connect();
  }, []);

  const disconnect = useCallback(() => {
    // Remover todos os listeners antes de desconectar
    listenersRef.current.forEach((callback, event) => {
      socketManager.current.off(event, callback);
    });
    listenersRef.current.clear();
    
    socketManager.current.disconnect();
    setSocket(null);
    setIsConnected(false);
  }, []);

  return {
    socket,
    isConnected,
    emit,
    on,
    off,
    once,
    connect,
    disconnect,
  };
} 