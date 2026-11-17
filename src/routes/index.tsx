import { createFileRoute } from "@tanstack/react-router";
import { YeraltiApp } from "@/components/yeralti-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <YeraltiApp />;
}
