import { redirect } from "next/navigation";

export default function WorkerRedirect() {
  redirect("/dashboard/worker");
}
