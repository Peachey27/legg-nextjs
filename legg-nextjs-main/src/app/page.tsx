import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SchedulerApp from "./SchedulerApp";

export default function Page() {
  const cookieStore = cookies();
  const auth = cookieStore.get("scheduler_auth");

  if (auth?.value !== "1") {
    redirect("/login");
  }

  return <SchedulerApp />;
}
