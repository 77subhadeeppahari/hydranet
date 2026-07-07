import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";
import { LogIn, Loader2 } from "lucide-react";
import { formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await login(username, password);
      toast.success("Welcome back, admin");
      navigate("/admin", { replace: true });
    } catch (err) {
      const msg = formatApiErrorDetail(err.response?.data?.detail) || "Login failed";
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-[#020617]" data-testid="admin-login-page">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo size="lg" /></div>
        <div className="hn-card rounded-2xl p-8">
          <div className="hn-overline mb-2">Admin Portal</div>
          <h1 className="font-display text-3xl font-bold text-white">Sign in</h1>
          <p className="text-slate-400 text-sm mt-2">Manage plans and view contact enquiries.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-2">Username</label>
              <input
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="admin-login-username"
                className="w-full rounded-md bg-[#020617] border border-white/10 focus:border-[#F26B21] outline-none px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-2">Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="admin-login-password"
                className="w-full rounded-md bg-[#020617] border border-white/10 focus:border-[#F26B21] outline-none px-4 py-3 text-white"
              />
            </div>
            {error && <div className="text-sm text-red-400" data-testid="admin-login-error">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              data-testid="admin-login-submit"
              className="w-full hn-btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/admin/forgot-password" className="text-slate-400 hover:text-[#F26B21]" data-testid="admin-forgot-link">Forgot password?</Link>
            <Link to="/" className="text-slate-400 hover:text-white">← Back to site</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
