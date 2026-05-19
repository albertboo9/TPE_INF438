import { ReactNode } from "react"

type ButtonProps = {
  children: ReactNode
  variant?: "primary" | "secondary" | "outline" | "light"
  fullWidth?: boolean
  onClick?: () => void
  type?: "button" | "submit"
}

export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  onClick,
  type = "button",
}: ButtonProps) {

  const styles = {

    primary:
      `
      bg-primary
      text-white
      
      hover:shadow-[0_0_25px_rgba(128,105,191,0.5)]
      `,

    secondary:
      `
      border
      border-white
      text-white

      hover:bg-white
      hover:text-primary
      `,

    outline:
      `
      border
      border-primary
      text-primary

      hover:bg-primary
      hover:text-white
      `,

    light:
      `
      bg-white
      text-black

      hover:bg-gray-100
      `,
  }

  return (

    <button
      type={type}

      onClick={onClick}

      className={`

        ${fullWidth ? "w-full" : ""}

        px-6
        py-4

        rounded-xl
        font-semibold

        transform
        transition-all
        duration-300
        ease-out

        hover:scale-105
        hover:-translate-y-1

        active:scale-95

        hover:shadow-2xl

        ${styles[variant]}
      `}
    >
      {children}
    </button>
  )
}
// import { ReactNode } from "react"

// type ButtonProps = {
//   children: ReactNode
//   variant?: "primary" | "secondary" | "outline" | "light"
//   fullWidth?: boolean
// }

// export default function Button({
//   children,
//   variant = "primary",
//   fullWidth = false,
// }: ButtonProps) {

//   const styles = {

//     primary:
//       `
//       bg-primary
//       text-white

//       hover:shadow-[0_0_25px_rgba(128,105,191,0.5)]
//       `,

//     secondary:
//       `
//       border
//       border-white
//       text-white

//       hover:bg-white
//       hover:text-primary
//       `,

//     outline:
//       `
//       border
//       border-primary
//       text-primary

//       hover:bg-primary
//       hover:text-white
//       `,

//     light:
//       `
//       bg-white
//       text-black

//       hover:bg-gray-100
//       `,
//   }

//   return (

//     <button
//       className={`

//         ${fullWidth ? "w-full" : ""}

//         px-6
//         py-3

//         rounded-xl
//         font-semibold

//         transform
//         transition-all
//         duration-300
//         ease-out

//         hover:scale-105
//         hover:-translate-y-1

//         active:scale-95

//         hover:shadow-2xl

//         ${styles[variant]}
//       `}
//     >
//       {children}
//     </button>
//   )
// }