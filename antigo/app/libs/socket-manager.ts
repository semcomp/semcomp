import IOSocket, { Socket } from "socket.io-client";
import { baseURL } from "../constants/api-url";

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private connectionPromise: Promise<Socket> | null = null;

  private constructor() {}

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  connect(): Promise<Socket> {
    if (this.socket?.connected) {
      return Promise.resolve(this.socket);
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.socket = IOSocket(baseURL, {
          withCredentials: true,
          transports: ["websocket"],
          autoConnect: true,
        });

        this.socket.on('connect', () => {
          console.log('Socket connected successfully');
          resolve(this.socket!);
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          this.connectionPromise = null;
          reject(error);
        });

        this.socket.on('disconnect', () => {
          console.log('Socket disconnected');
          this.connectionPromise = null;
        });
      } catch (error) {
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionPromise = null;
    }
  }

  // Método para reutilizar listeners existentes
  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.removeAllListeners(event);
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    if (this.socket?.connected) {
      this.socket.emit(event, ...args);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  once(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.once(event, callback);
    }
  }
}

export default SocketManager; 