import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../components/ui/Button";
import AuthBackground from "../../components/background/AuthBackground";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { User, LockKeyhole } from "lucide-react";

type LoginFormData = {
  username: string;
  password: string;
};

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      username: 'admin@retailsense.ai',
      password: 'admin123'
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.username, data.password);
      showToast("Session authenticated successfully! Welcome.", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to establish secure session. Verify credentials.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.2fr_0.8fr] bg-[#0f0b15] overflow-y-auto">
      {/* LEFT COLUMN: HERO AREA (Apple Style) */}
      <div className="relative overflow-hidden flex flex-col justify-between p-10 lg:p-16 text-white min-h-[40vh] lg:min-h-screen">
        <AuthBackground />
        
        {/* Top Branding Header */}
        <div className="relative z-10">
          <span className="font-label-caps text-xs font-black uppercase bg-white/10 px-3 py-1.5 rounded-full tracking-widest text-primary border border-white/5">
            Big Data Platform V3.4
          </span>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 my-auto pt-10 lg:pt-0">
          <h1 className="text-4xl lg:text-7xl font-black leading-tight tracking-tight bg-gradient-to-br from-white via-white to-primary/40 bg-clip-text text-transparent">
            Unleash the <br />
            Power of Data.
          </h1>
          <p className="mt-6 text-sm lg:text-lg opacity-70 max-w-xl leading-relaxed">
            Connectez-vous à votre cockpit de pilotage décisionnel. Analysez 125 millions de transactions en temps réel avec notre intégration Unity Catalog et l'intelligence prédictive Databricks.
          </p>
        </div>

        {/* Action Info footer */}
        <div className="relative z-10 flex gap-4">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-ai animate-pulse"></span>
            <span className="font-mono-data text-[10px] uppercase font-bold text-emerald-ai">DBSQL Warehouse Active</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN WORKFLOW CARD (Stripe Style) */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-background dark:bg-[#0f0b15]">
        <div className="w-full max-w-md bg-surface dark:bg-[#181420] border border-border dark:border-[#2b2735] rounded-[32px] shadow-2xl p-8 lg:p-12 flex flex-col gap-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-on-surface leading-tight tracking-tight">
              Sign In
            </h2>
            <p className="text-on-surface-variant/70 text-sm font-semibold">
              Enter your credentials to access the executive cockpit.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1">
                <div className={`
                  flex items-center gap-4 rounded-2xl px-5 py-4 border transition-all duration-300
                  ${errors.username 
                    ? "bg-red-500/5 border-red-500 text-red-500" 
                    : "bg-surface-container border-border dark:border-[#2b2735] focus-within:border-primary/50 text-on-surface-variant"
                  }
                `}>
                  <User className="w-5 h-5 opacity-60" />
                  <input
                    type="text"
                    placeholder="name@retailsense.ai"
                    className="bg-transparent outline-none w-full text-sm font-semibold placeholder:text-outline/60 text-on-surface"
                    {...register("username", {
                      required: "Username is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                  />
                </div>
                {errors.username && (
                  <span className="text-[11px] font-bold text-red-500 px-2 block">{errors.username.message}</span>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className={`
                  flex items-center gap-4 rounded-2xl px-5 py-4 border transition-all duration-300
                  ${errors.password 
                    ? "bg-red-500/5 border-red-500 text-red-500" 
                    : "bg-surface-container border-border dark:border-[#2b2735] focus-within:border-primary/50 text-on-surface-variant"
                  }
                `}>
                  <LockKeyhole className="w-5 h-5 opacity-60" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="bg-transparent outline-none w-full text-sm font-semibold placeholder:text-outline/60 text-on-surface"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Minimum 6 characters" }
                    })}
                  />
                </div>
                {errors.password && (
                  <span className="text-[11px] font-bold text-red-500 px-2 block">{errors.password.message}</span>
                )}
              </div>
            </div>

            {/* Remember preferences */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 dark:bg-surface-container cursor-pointer"
                defaultChecked
              />
              <label htmlFor="remember" className="text-xs font-semibold text-on-surface-variant cursor-pointer">
                Remember this terminal
              </label>
            </div>

            {/* Form Actions */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                  <span>Connect Securely</span>
                </>
              )}
            </button>
          </form>

          {/* Quick seeded login notice helper */}
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center">
            <span className="font-label-caps text-[10px] font-bold text-primary block mb-1">Super Admin Account Seeded</span>
            <code className="text-[10px] font-mono-data text-on-surface-variant block">admin@retailsense.ai / admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
}
