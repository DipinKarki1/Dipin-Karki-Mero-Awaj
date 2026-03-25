export default function Button({ children, type = "button", disabled, onClick, className = "" }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-6 py-3 rounded-lg bg-[#9A0D1B] hover:bg-[#7A0A15] transition text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
