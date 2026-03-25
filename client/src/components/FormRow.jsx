export default function FormRow({ labelName, error, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {labelName && <label className="text-gray-300 text-sm font-medium">{labelName}</label>}
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
