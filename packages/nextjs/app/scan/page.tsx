"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, ChangeEvent } from "react";
import { BoltIcon, PhotoIcon } from "@heroicons/react/24/outline";
import type { IScannerControls } from "@zxing/browser";

import MobileShell from "~~/components/quickpay/MobileShell";

const ScanPage = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const readerRef = useRef<any>(null);
  const isMountedRef = useRef(true);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const stopScanner = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop();
    }
    if (trackRef.current) {
      trackRef.current.stop();
      trackRef.current = null;
    }
    if (readerRef.current && typeof readerRef.current.reset === "function") {
      readerRef.current.reset();
      readerRef.current = null;
    }
    controlsRef.current = null;
    if (isMountedRef.current) {
      setTorchSupported(false);
      setTorchEnabled(false);
    }
  }, []);

  type ParsedPayload =
    | { kind: "send"; address: string; params: URLSearchParams }
    | { kind: "link"; url: URL };

  const parseQuickPayPayload = useCallback((raw: string): ParsedPayload | null => {
    const value = raw.trim();
    if (!value) {
      return null;
    }

    if (/^https?:\/\//i.test(value)) {
      try {
        const url = new URL(value);
        return { kind: "link", url };
      } catch (error) {
        console.warn("Failed to parse URL payload", error);
        return null;
      }
    }

    if (value.startsWith("quickpay://")) {
      const withoutScheme = value.slice("quickpay://".length);
      const [addressPart = "", queryPart = ""] = withoutScheme.split("?");
      try {
        const address = decodeURIComponent(addressPart).trim();
        if (!address) {
          return null;
        }
        const params = new URLSearchParams(queryPart);
        return { kind: "send", address, params };
      } catch (error) {
        console.warn("Failed to parse quickpay payload", error);
        return null;
      }
    }

    return { kind: "send", address: value, params: new URLSearchParams() };
  }, []);

  const handleResult = useCallback(
    (text: string) => {
      if (!text || isProcessing) return;
      setIsProcessing(true);
      stopScanner();
      const payload = parseQuickPayPayload(text);
      if (!payload) {
        setIsProcessing(false);
        return;
      }

      if (payload.kind === "link") {
        const { url } = payload;
        if (typeof window !== "undefined" && url.origin === window.location.origin) {
          router.replace(`${url.pathname}${url.search}${url.hash}`);
        } else if (typeof window !== "undefined") {
          window.location.href = url.toString();
        }
        return;
      }

      const params = new URLSearchParams({ recipient: payload.address });
      const allowedKeys = new Set([
        "amount",
        "mode",
        "splitTotal",
        "splitPeople",
        "splitShare",
        "splitRole",
      ]);

      payload.params.forEach((value, key) => {
        if (allowedKeys.has(key) && value) {
          params.set(key, value);
        }
      });

      router.replace(`/send/amount?${params.toString()}`);
    },
    [isProcessing, parseQuickPayPayload, router, stopScanner]
  );

  useEffect(() => {
    let active = true;
    isMountedRef.current = true;

    const startScanner = async () => {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      if (!videoRef.current || !active) return;

      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result, error, controls) => {
        if (!active) {
          controls?.stop();
          return;
        }

        if (controls && !controlsRef.current) {
          controlsRef.current = controls;
          const stream = controls.stream as MediaStream | undefined;
          if (stream) {
            const [track] = stream.getVideoTracks();
            trackRef.current = track ?? null;
            const capabilities = track?.getCapabilities?.();
            if (capabilities && (capabilities as any).torch) {
              setTorchSupported(true);
            }
          }
        }

        if (result) {
          handleResult(result.getText());
        }
      });

      if (controls) {
        controlsRef.current = controls;
      }
    };

    startScanner();

    return () => {
      active = false;
      isMountedRef.current = false;
      stopScanner();
    };
  }, [handleResult, stopScanner]);

  const toggleTorch = useCallback(async () => {
    const track = trackRef.current;
    if (!track) return;

    const capabilities = track.getCapabilities?.();
    if (!capabilities || !(capabilities as any).torch) return;

    const newState = !torchEnabled;
    try {
      await track.applyConstraints({ advanced: [{ torch: newState }] });
      setTorchEnabled(newState);
    } catch (error) {
      console.warn("Torch toggle failed", error);
    }
  }, [torchEnabled]);

  const handleFileUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = async () => {
        const dataUrl = reader.result as string;
        if (!dataUrl) return;
        try {
          const { BrowserMultiFormatReader } = await import("@zxing/browser");
          const imageReader = new BrowserMultiFormatReader();
          const result = await imageReader.decodeFromImageUrl(dataUrl);
          handleResult(result.getText());
        } catch (error) {
          console.warn("Failed to decode uploaded QR", error);
        } finally {
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      };

      reader.readAsDataURL(file);
    },
    [handleResult]
  );

  return (
    <MobileShell backHref="/home" hideHeader contentClassName="flex-1 p-0">
      <div className="relative flex h-full w-full flex-1">
        <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(1,28,64,0.15),transparent_65%)]" />

        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-5">
          <button
            type="button"
            className="icon-button h-14 w-14 pointer-events-auto"
            aria-label="Upload from files"
            onClick={() => fileInputRef.current?.click()}
          >
            <PhotoIcon className="h-7 w-7" />
            <span className="sr-only">Upload from files</span>
          </button>
          <button
            type="button"
            className="icon-button h-14 w-14 pointer-events-auto disabled:opacity-40"
            aria-label="Toggle flashlight"
            onClick={toggleTorch}
            disabled={!torchSupported}
          >
            <BoltIcon className={`h-7 w-7 ${torchEnabled ? "text-[#54acbf]" : ""}`} />
            <span className="sr-only">Toggle flashlight</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </MobileShell>
  );
};

export default ScanPage;

