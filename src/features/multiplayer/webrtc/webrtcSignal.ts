import type { ClientAnswerSignal, HostOfferSignal } from "../p2pTypes";

export const WEBRTC_CHANNEL_NAME = "oldwest-rpg";

export const WEBRTC_CONFIGURATION: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" }
  ]
};

const SIGNAL_PREFIX = "F2D6P2P:";

export function encodeSignal(data: HostOfferSignal | ClientAnswerSignal): string {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return `${SIGNAL_PREFIX}${btoa(binary)}`;
}

export function decodeSignal(code: string): HostOfferSignal | ClientAnswerSignal {
  const trimmed = code.trim();
  const raw = trimmed.startsWith(SIGNAL_PREFIX) ? trimmed.slice(SIGNAL_PREFIX.length) : trimmed;

  try {
    const binary = atob(raw);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const decoded = JSON.parse(new TextDecoder().decode(bytes)) as HostOfferSignal | ClientAnswerSignal;

    if (!isSignal(decoded)) {
      throw new Error("Formato de codigo invalido.");
    }

    return decoded;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Codigo invalido.";
    throw new Error(`Codigo P2P invalido: ${message}`);
  }
}

export function decodeOfferSignal(code: string): HostOfferSignal {
  const signal = decodeSignal(code);

  if (signal.kind !== "faroeste2d6-webrtc-offer") {
    throw new Error("Cole um Offer Code gerado pelo host.");
  }

  return signal;
}

export function decodeAnswerSignal(code: string): ClientAnswerSignal {
  const signal = decodeSignal(code);

  if (signal.kind !== "faroeste2d6-webrtc-answer") {
    throw new Error("Cole um Answer Code gerado pelo jogador.");
  }

  return signal;
}

export function createPeerConnection(): RTCPeerConnection {
  return new RTCPeerConnection(WEBRTC_CONFIGURATION);
}

export function waitForIceGatheringComplete(peerConnection: RTCPeerConnection): Promise<void> {
  if (peerConnection.iceGatheringState === "complete") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timeout = window.setTimeout(done, 10000);

    function done() {
      window.clearTimeout(timeout);
      peerConnection.removeEventListener("icegatheringstatechange", handleChange);
      resolve();
    }

    function handleChange() {
      if (peerConnection.iceGatheringState === "complete") {
        done();
      }
    }

    peerConnection.addEventListener("icegatheringstatechange", handleChange);
  });
}

function isSignal(value: unknown): value is HostOfferSignal | ClientAnswerSignal {
  if (!value || typeof value !== "object") {
    return false;
  }

  const signal = value as Partial<HostOfferSignal | ClientAnswerSignal>;

  return (
    signal.version === 1 &&
    (signal.kind === "faroeste2d6-webrtc-offer" || signal.kind === "faroeste2d6-webrtc-answer") &&
    Boolean(signal.sdp)
  );
}
