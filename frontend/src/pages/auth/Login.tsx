import React, { useState } from "react";
import { useForm } from "react-hook-form";

import Button from "../../components/ui/Button";
import AuthBackground from "../../components/background/AuthBackground";

import { User, LockKeyhole } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

type LoginFormData = {
  username: string;
  password: string;
};

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      username: "admin@retailsense.ai",
      password: "admin123",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);

    try {
      await login(data.username, data.password);

      showToast(
        "Session authenticated successfully! Welcome.",
        "success"
      );
    } catch (err: any) {
      console.error(err);

      showToast(
        err.message ||
          "Failed to establish secure session. Verify credentials.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="
      relative
      min-h-screen
      items-center
      flex
      justify-center
      overflow-hidden
      bg-gradient-to-br
      from-primary
      via-[#7050B5]
      to-secondary
      p-5 
    "
    >
      <AuthBackground />

      {/* MAIN CARD */}

      <div
        className="
        relative
        z-10
        w-full
        max-w-[1200px]
        bg-white/10
        backdrop-blur-xl
        rounded-[28px]
        overflow-hidden
        shadow-[0_20px_80px_rgba(0,0,0,0.25)]
        grid
        lg:grid-cols-2
      "
      >
        {/* LEFT SIDE */}

        <div
          className="
          relative
          min-h-[650px]
        "
        >
          <img
            src="/login_image.png"
            alt="dashboard"
            className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
          "
          />

          <div
            className="
            absolute
            inset-0
            bg-black/35
          "
          />

          <div
            className="
            relative
            z-10
            h-full
            flex
            flex-col
            justify-start
            p-8
            lg:p-14
          "
          >
            <h1
              className="
              text-5xl
              lg:text-6xl
              font-bold
              leading-tight
              text-white
            "
            >
              Welcome
              <br />
              Back!
            </h1>

            <p
              className="
              mt-6
              opacity-90
              max-w-lg
              leading-7
              text-white
            "
            >
              Connectez-vous à votre plateforme
              d’analyse et de prévision des ventes
              pour aider à la prise de décision
              et optimiser les performances
              de votre supermarché.
            </p>

            <div
              className="
              flex
              gap-4
              mt-12
            "
            >
              <Button variant="light">
                Learn More
              </Button>

              <Button variant="secondary">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div
          className="
          bg-white
          px-8
          py-10
          lg:px-14
          flex
          items-center
          justify-center
        "
        >
          <div
            className="
            w-full
            max-w-md
          "
          >
            <h2
              className="
              text-4xl
              font-bold
              text-[#3A3A46]
            "
            >
              Welcome to Company
            </h2>

            <p
              className="
              text-neutral
              mt-2
            "
            >
              Sign in to continue
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-10 space-y-6"
            >
              {/* EMAIL */}

              <div>

                <div
                  className={`
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  px-5
                  py-4
                  border
                  transition-all
                  duration-300

                  ${
                    errors.username
                      ? "bg-red-50 border-red-400"
                      : "bg-[#F4EEFF] border-transparent focus-within:border-primary"
                  }
                `}
                >
                  <User
                    className={`
                    w-5
                    h-5
                    ${
                      errors.username
                        ? "text-red-500"
                        : "text-neutral"
                    }
                  `}
                  />

                  <input
                    type="text"
                    placeholder="name@retailsense.ai"
                    className="
                    bg-transparent
                    outline-none
                    w-full
                    text-[#3A3A46]
                    text-sm
                  "
                    {...register("username", {
                      required: "Username is required",

                      pattern: {
                        value:
                          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,

                        message:
                          "Invalid email address",
                      },
                    })}
                  />
                </div>

                {errors.username && (
                  <p
                    className="
                    text-red-500
                    text-sm
                    mt-2
                    ml-2
                  "
                  >
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* PASSWORD */}

              <div>

                <div
                  className={`
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  px-5
                  py-4
                  border
                  transition-all
                  duration-300

                  ${
                    errors.password
                      ? "bg-red-50 border-red-400"
                      : "bg-[#F4EEFF] border-transparent focus-within:border-primary"
                  }
                `}
                >
                  <LockKeyhole
                    className={`
                    w-5
                    h-5
                    ${
                      errors.password
                        ? "text-red-500"
                        : "text-neutral"
                    }
                  `}
                  />

                  <input
                    type="password"
                    placeholder="••••••••"
                    className="
                    bg-transparent
                    outline-none
                    w-full
                    text-[#3A3A46]
                    text-sm
                  "
                    {...register(
                      "password",
                      {
                        required:
                          "Password is required",

                        minLength: {
                          value: 6,
                          message:
                            "Minimum 6 characters",
                        },
                      }
                    )}
                  />
                </div>

                {errors.password && (
                  <p
                    className="
                    text-red-500
                    text-sm
                    mt-2
                    ml-2
                  "
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* REMEMBER */}

              <div
                className="
                flex
                items-center
                gap-3
              "
              >
                <input
                  type="checkbox"
                  defaultChecked
                />

                <span
                  className="
                  text-neutral
                  text-sm
                "
                >
                  Remember me
                </span>
              </div>

              {/* BUTTON */}

              <Button
                type="submit"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div
                    className="
                    flex
                    items-center
                    gap-3
                  "
                  >
                    <div
                      className="
                      w-5
                      h-5
                      border-2
                      border-white
                      border-t-transparent
                      rounded-full
                      animate-spin
                    "
                    />

                    <span>
                      Verifying...
                    </span>
                  </div>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
            {/* ACCOUNT INFO */}

              <div
                className="
                bg-primary/5
                rounded-2xl
                border
                border-primary/10
                p-4
                text-center
                mt-12
              "
              >
                <span
                  className="
                  text-primary
                  text-xs
                  font-bold
                  block
                "
                >
                  Super Admin Account
                </span>

                <code
                  className="
                  text-[11px]
                  text-neutral
                "
                >
                  admin@retailsense.ai / admin123
                </code>
              </div>
          </div>
        </div>
      </div>
    </div>
  );

}

