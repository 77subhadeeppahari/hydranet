import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatApiErrorDetail } from "../lib/api";
import { Logo } from "../components/Logo";
import { toast } from "sonner";
import { KeyRound, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [expectedOtp, setExpectedOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { data } = await api.post("/auth/forgot-password", { recovery_email: email });
      setExpectedOtp(data.otp);
      setResetToken(data.reset_token);
      setMaskedEmail(data.recovery_email_masked);
      setStep(2);
      toast.success("OTP generated");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || "Failed to request OTP");
    } finally { setLoading(false); }
  };

  const verifyAndReset = async (e) => {
    e.preventDefault();
    setError("");
    if (otp !== expectedOtp) { setError("Incorrect OTP"); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { reset_token: resetToken, new_password: newPassword });
      toast.success("Password reset successful. Please sign in.");
      navigate("/admin/login", { replace: true });
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || "Reset failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-[#020617]" data-testid="admin-forgot-page">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo size="lg" /></div>
        <div className="hn-card rounded-2xl p-8">
          <div className="hn-overline mb-2">Password Reset</div>
          <h1 className="font-display text-3xl font-bold text-white">Recover Access</h1>

          {step === 1 && (
            <form onSubmit={requestOtp} className="mt-8 space-y-5">
              <p className="text-sm text-slate-400">Enter your registered recovery email to receive an OTP.</p>
              <div>
                <label className="block text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-2">Recovery Email</label>
                <input
                  required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  data-testid="forgot-email-input"
                  className="w-full rounded-md bg-[#020617] border border-white/10 focus:border-[#F26B21] outline-none px-4 py-3 text-white"
                />
              </div>
              {error && <div className="text-sm text-red-400" data-testid="forgot-error">{error}</div>}
              <button type="submit" disabled={loading} data-testid="forgot-request-btn" className="w-full hn-btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-60">
                <KeyRound size={16} /> {loading ? "Sending…" : "Send OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={verifyAndReset} className="mt-8 space-y-5">
              <div className="p-4 rounded-md bg-[#F26B21]/10 border border-[#F26B21]/30 text-sm text-slate-200">
                <div>OTP sent to <span className="font-mono-metric text-white">{maskedEmail}</span></div>
                <div className="mt-2 text-xs text-slate-400">DEV MODE — OTP shown here since no email provider is configured:</div>
                <div className="mt-1 font-mono-metric text-2xl font-bold text-[#F26B21] tracking-widest" data-testid="forgot-dev-otp">{expectedOtp}</div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-2">Enter OTP</label>
                <input
                  required inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  data-testid="forgot-otp-input"
                  className="w-full rounded-md bg-[#020617] border border-white/10 focus:border-[#F26B21] outline-none px-4 py-3 text-white font-mono-metric text-xl tracking-widest text-center"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-2">New Password</label>
                <input
                  required type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6}
                  data-testid="forgot-newpassword-input"
                  className="w-full rounded-md bg-[#020617] border border-white/10 focus:border-[#F26B21] outline-none px-4 py-3 text-white"
                />
              </div>
              {error && <div className="text-sm text-red-400" data-testid="forgot-error">{error}</div>}
              <button type="submit" disabled={loading} data-testid="forgot-reset-btn" className="w-full hn-btn-primary disabled:opacity-60">
                {loading ? "Resetting…" : "Reset Password"}
              </button>
            </form>
          )}

          <Link to="/admin/login" className="mt-6 inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
