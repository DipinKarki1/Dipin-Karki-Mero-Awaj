export default function Input({ id, name, type = "text", placeholder, autoComplete, register, className = "" }) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      autoComplete={autoComplete}
      {...register(name)}
      className={`w-full px-4 py-3 rounded-lg bg-[#3b1416] border border-[#5a1f21] text-white outline-none focus:ring-2 focus:ring-[#9A0D1B] transition ${className}`}
    />
  );
}
