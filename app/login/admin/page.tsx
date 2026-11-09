import { Shell } from "@/components/pv-shell";
import { LoginForm } from "@/components/pv-login-form";

export default function AdminLogin() {
  return (
    <Shell>
      <LoginForm role="admin" />
    </Shell>
  );
}
