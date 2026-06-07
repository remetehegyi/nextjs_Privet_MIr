import { WebhookLoader } from "@/components/webhook-loader";

export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center gap-6 bg-zinc-50 px-4 py-12 font-sans text-black dark:bg-black dark:text-white">
      <h1 className="text-4xl font-semibold">Привет мир!</h1>
      <WebhookLoader />
    </main>
  );
}
