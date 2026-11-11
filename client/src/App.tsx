import { useEffect, useState } from "react";

type ApiStatus = "checking" | "ok" | "unreachable";

export default function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/health", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
        return response.json() as Promise<{ status: string }>;
      })
      .then((body) => setApiStatus(body.status === "ok" ? "ok" : "unreachable"))
      .catch(() => {
        if (!controller.signal.aborted) setApiStatus("unreachable");
      });

    return () => controller.abort();
  }, []);

  return (
    <main>
      <h1>Helpdesk</h1>
      <p>API status: {apiStatus}</p>
    </main>
  );
}
