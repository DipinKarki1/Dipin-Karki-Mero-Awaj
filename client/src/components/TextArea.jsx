export default function TextArea({ id, name, placeholder, register, className = "", rows = 4 }) {
  return (
    <textarea
      id={id}
      placeholder={placeholder}
      rows={rows}
      {...register(name)}
      className={`w-full px-4 py-3 rounded-lg bg-[#3b1416] border border-[#5a1f21] text-white outline-none focus:ring-2 focus:ring-[#9A0D1B] transition resize-none ${className}`}
    />
  );
}
