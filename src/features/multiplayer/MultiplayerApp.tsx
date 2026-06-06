import MultiplayerLobby from "./MultiplayerLobby";
import MultiplayerTable from "./MultiplayerTable";
import P2PSignalPanel from "./P2PSignalPanel";
import { MultiplayerProvider, useMultiplayer } from "./MultiplayerContext";

export default function MultiplayerApp({ initialCode = "" }: { initialCode?: string }) {
  return (
    <MultiplayerProvider initialCode={initialCode}>
      <MultiplayerContent initialCode={initialCode} />
    </MultiplayerProvider>
  );
}

function MultiplayerContent({ initialCode }: { initialCode: string }) {
  const { session } = useMultiplayer();

  return session ? (
    <>
      <P2PSignalPanel />
      <MultiplayerTable />
    </>
  ) : (
    <MultiplayerLobby initialCode={initialCode} />
  );
}
