import { useForm } from "react-hook-form"

import Button from "../../components/ui/Button"
import AuthBackground from "../../components/background/AuthBackground"

import {
  User,
  LockKeyhole,
} from "lucide-react"

type LoginFormData = {
  username: string
  password: string
}

export default function Login() {

  const {

    register,
    handleSubmit,

    formState: {
      errors,
    },

  } = useForm<LoginFormData>()

  // SUBMIT

  const onSubmit = (
    data: LoginFormData
  ) => {

    console.log(data)

    // future API call
  }

  return (

    <div
      className="
        min-h-screen
        lg:grid
        lg:grid-cols-[1.2fr_0.8fr]
        bg-gradient-to-br
        from-primary
        via-[#7050B5]
        to-secondary
      "
    >

      {/* LEFT SIDE */}

      <div
        className="
          relative
          overflow-hidden
          flex
          flex-col
          p-10
          lg:p-16
          text-white
        "
      >

        <AuthBackground />

        <div className="relative z-10">

          <h1
            className="
              text-5xl
              lg:text-7xl
              font-bold
              leading-tight
            "
          >
            Welcome <br />
            Back!
          </h1>

          <p
            className="
              mt-6
              text-lg
              opacity-75
              max-w-xl
              leading-7
            "
          >
            Connectez-vous à votre plateforme
            d’analyse et de prévision des ventes
            pour aider à la prise de décision
            et optimiser les performances
            de votre supermarché.
          </p>

        </div>

        {/* BUTTONS */}

        <div
          className="
            mt-10
            flex
            gap-4
            relative
            z-10
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

      {/* RIGHT SIDE */}

      <div
        className="
          flex
          items-center
          justify-center
          lg:items-start
          lg:justify-start
          px-4
          lg:px-0
          py-10
        "
      >

        {/* CARD */}

        <div
          className="
            w-full
            max-w-md
            min-h-[93vh]
            bg-white
            rounded-[20px]
            shadow-2xl
            p-8
            lg:p-14
          "
        >

          <h2
            className="
              text-3xl
              font-bold
              text-text
              leading-tight
            "
          >
            Welcome to Company
          </h2>

          <p className="text-neutral text-lg">
            Sign in to continue
          </p>

          {/* FORM */}

          <form
            onSubmit={handleSubmit(onSubmit)}
          >

            {/* INPUTS */}

            <div className="mt-16 space-y-6">

              {/* USERNAME */}

              <div>

                <div
                  className={`
                    flex
                    items-center
                    gap-4
                    rounded-2xl
                    px-5
                    py-4
                    transition-all

                    ${errors.username
                      ? "bg-red-50 border border-red-400"
                      : "bg-[#F4EEFF]"
                    }
                  `}
                >

                  <User
                    className={`
                      ${errors.username
                        ? "text-red-500"
                        : "text-neutral"
                      }
                    `}
                  />

                  <input
                    type="text"

                    placeholder="Username"

                    className="
                      bg-transparent
                      outline-none
                      w-full
                    "

                    {...register(
                      "username",
                      {
                        required:
                          "Username is required",

                        minLength: {
                          value: 3,

                          message:
                            "Minimum 3 characters",
                        },
                      }
                    )}
                  />

                </div>

                {
                  errors.username && (

                    <p
                      className="
                        text-red-500
                        text-sm
                        mt-2
                        ml-2
                      "
                    >
                      {
                        errors.username.message
                      }
                    </p>
                  )
                }

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
                    transition-all

                    ${errors.password
                      ? "bg-red-50 border border-red-400"
                      : "bg-[#F4EEFF]"
                    }
                  `}
                >

                  <LockKeyhole
                    className={`
                      ${errors.password
                        ? "text-red-500"
                        : "text-neutral"
                      }
                    `}
                  />

                  <input
                    type="password"

                    placeholder="Password"

                    className="
                      bg-transparent
                      outline-none
                      w-full
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

                {
                  errors.password && (

                    <p
                      className="
                        text-red-500
                        text-sm
                        mt-2
                        ml-2
                      "
                    >
                      {
                        errors.password.message
                      }
                    </p>
                  )
                }

              </div>

            </div>

            {/* REMEMBER ME */}

            <div
              className="
                mt-5
                flex
                items-center
                gap-3
              "
            >

              <input type="checkbox" />

              <span className="text-neutral">
                Remember me
              </span>

            </div>

            {/* BUTTON */}

            <div className="mt-10">

              <Button
                type="submit"
                fullWidth
              >
                Login
              </Button>

            </div>

          </form>

        </div>

      </div>

    </div>
  )
}

