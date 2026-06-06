import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { HostOfferSignal } from "../p2pTypes";
import { decodeOfferSignal, decodeSignal, encodeSignal } from "./webrtcSignal";

describe("webrtcSignal", () => {
  it("encodes and decodes an offer code", () => {
    const offer: HostOfferSignal = {
      kind: "faroeste2d6-webrtc-offer",
      version: 1,
      pendingId: "pending-1",
      sessionId: "session-1",
      sessionName: "Mesa de teste",
      hostId: "host-1",
      hostName: "Mestre",
      sdp: {
        type: "offer",
        sdp: "fake-sdp"
      }
    };

    const code = encodeSignal(offer);
    const decoded = decodeOfferSignal(code);

    assert.equal(decoded.kind, "faroeste2d6-webrtc-offer");
    assert.equal(decoded.pendingId, "pending-1");
    assert.equal(decoded.sessionName, "Mesa de teste");
  });

  it("rejects invalid codes", () => {
    assert.throws(() => decodeSignal("isso nao e um codigo"), /Codigo P2P invalido/);
  });
});
