import React from "react"

import {
  Bell,
  Search,
  Moon,
  Sun,
} from "lucide-react"

import { useTheme } from "../../context/ThemeContext"

import { useAuth } from "../../context/AuthContext"

import { cn } from "../../lib/utils"

interface HeaderProps {
  className?: string
  currentPage?: string
}

export const Header: React.FC<HeaderProps> = ({
  className,
  currentPage
}) => {

  const {
    theme,
    toggleTheme
  } = useTheme()

  const {
    user
  } = useAuth()

  return (

    <header
      className={cn(
        `
        fixed
        top-0
        left-0
        right-0
        z-50

        px-6
        lg:px-10
        py-4

        bg-surface/70
        backdrop-blur-2xl

        border-b
        border-border

        shadow-dashboard

        transition-all
        duration-500
        `,
        className
      )}
    >

      <div
        className="
        flex
        items-center
        justify-between
        "
      >

        {/* LEFT */}

        <div
          className="
          flex
          items-center
          gap-8
          "
        >

          {/* LOGO */}

          <div>

            <h1
              className="
              text-2xl
              font-black

              bg-gradient-to-r
              from-primary
              via-[#9f86e3]
              to-tertiary

              bg-clip-text
              text-transparent
              "
            >
              RetailSense AI
            </h1>

          </div>

        </div>

        {/* RIGHT */}

        <div
          className="
          flex
          items-center
          gap-4
          "
        >

          {/* SEARCH */}

          <div
            className="
            hidden
            lg:flex

            items-center
            gap-3

            px-4
            py-3

            w-[260px]

            rounded-2xl

            bg-card
            border
            border-border
            "
          >

            <Search
              size={18}
              className="
              text-textSecondary
              "
            />

            <input
              placeholder="Search..."
              className="
              bg-transparent
              outline-none
              w-full
              text-sm
              "
            />

          </div>

          {/* NOTIFICATION */}

          <button
            className="
            relative

            w-11
            h-11

            rounded-2xl

            bg-card

            border
            border-border

            flex
            items-center
            justify-center

            hover:scale-105

            transition-all
            "
          >
            <Bell size={18} />

            <span
              className="
              absolute
              top-2
              right-2

              w-2
              h-2

              rounded-full

              bg-red-500
              "
            />
          </button>

          {/* THEME */}

          <button
            onClick={toggleTheme}
            className="
            w-11
            h-11

            rounded-2xl

            bg-card

            border
            border-border

            flex
            items-center
            justify-center

            hover:scale-105

            transition-all
            "
          >
            {
              theme === "dark"
                ? <Sun size={18} className="text-tertiary" />
                : <Moon size={18} className="text-primary" />
            }
          </button>

          {/* USER */}

          <div
            className="
            flex
            items-center
            gap-3

            pl-3
            "
          >

            <div
              className="
              hidden
              md:block
              "
            >

              <p
                className="
                text-sm
                font-semibold
                "
              >
                {user?.name || "Administrator"}
              </p>

              <p
                className="
                text-xs
                text-textSecondary
                "
              >
                {user?.role || "Admin"}
              </p>

            </div>

            <div
              className="
              w-12
              h-12

              rounded-2xl

              bg-gradient-to-br
              from-primary
              to-secondary

              text-white
              font-bold

              flex
              items-center
              justify-center

              shadow-lg
              "
            >
              {
                user?.name
                  ? user.name.substring(0, 2).toUpperCase()
                  : "AD"
              }
            </div>

          </div>

        </div>

      </div>

    </header>

  )
}