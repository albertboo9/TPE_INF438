type InputProps = {
  type?: string
  placeholder?: string
}

export default function Input({
  type = "text",
  placeholder,
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="
        w-full
        bg-[#F4EEFF]
        px-4
        py-3
        rounded-xl
        outline-none
        focus:ring-2
        focus:ring-primary
      "
    />
  )
}
