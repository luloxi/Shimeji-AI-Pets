"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type FreighterApi = {
  isConnected?: () => Promise<boolean>;
  getPublicKey?: () => Promise<string>;
  connect?: () => Promise<void>;
  getNetwork?: () => Promise<string>;
  getNetworkDetails?: () => Promise<{ network?: string; networkPassphrase?: string }>;
};

type FreighterState = {
  isAvailable: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  publicKey: string | null;
  network: string | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refresh: () => Promise<void>;
};

const FreighterContext = createContext<FreighterState | null>(null);

function getFreighterApi(): FreighterApi | null {
  if (typeof window === "undefined") return null;
  const anyWindow = window as unknown as { freighterApi?: FreighterApi; freighter?: FreighterApi };
  return anyWindow.freighterApi || anyWindow.freighter || null;
}

async function getNetworkLabel(api: FreighterApi): Promise<string | null> {
  if (api.getNetwork) {
    return api.getNetwork();
  }
  if (api.getNetworkDetails) {
    const details = await api.getNetworkDetails();
    return details.network || details.networkPassphrase || null;
  }
  return null;
}

export function FreighterProvider({ children }: { children: React.ReactNode }) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const api = getFreighterApi();
    setIsAvailable(Boolean(api));
    if (!api?.isConnected || !api.getPublicKey) {
      return;
    }

    try {
      const connected = await api.isConnected();
      if (!connected) {
        setIsConnected(false);
        setPublicKey(null);
        setNetwork(null);
        return;
      }

      const key = await api.getPublicKey();
      const nextNetwork = await getNetworkLabel(api);
      setIsConnected(true);
      setPublicKey(key);
      setNetwork(nextNetwork);
      setError(null);
    } catch (err) {
      console.error("Freighter refresh error:", err);
      setError("Unable to read Freighter connection.");
    }
  }, []);

  const connect = useCallback(async () => {
    const api = getFreighterApi();
    setIsAvailable(Boolean(api));
    if (!api?.getPublicKey) {
      setError("Freighter wallet not detected.");
      return;
    }

    setIsConnecting(true);
    try {
      if (api.connect) {
        await api.connect();
      }
      const key = await api.getPublicKey();
      const nextNetwork = await getNetworkLabel(api);
      setIsConnected(true);
      setPublicKey(key);
      setNetwork(nextNetwork);
      setError(null);
    } catch (err) {
      console.error("Freighter connect error:", err);
      setError("Connection request was rejected or failed.");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setPublicKey(null);
    setNetwork(null);
    setError(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      isAvailable,
      isConnected,
      isConnecting,
      publicKey,
      network,
      error,
      connect,
      disconnect,
      refresh,
    }),
    [
      isAvailable,
      isConnected,
      isConnecting,
      publicKey,
      network,
      error,
      connect,
      disconnect,
      refresh,
    ]
  );

  return (
    <FreighterContext.Provider value={value}>
      {children}
    </FreighterContext.Provider>
  );
}

export function useFreighter() {
  const context = useContext(FreighterContext);
  if (!context) {
    throw new Error("useFreighter must be used within FreighterProvider");
  }
  return context;
}
