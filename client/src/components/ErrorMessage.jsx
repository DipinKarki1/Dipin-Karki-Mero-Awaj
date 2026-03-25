export default function ErrorMessage({ children }) {
  return (
    <div className="bg-red-900/20 border border-red-900/50 text-red-500 px-4 py-3 rounded-lg">
      {children}
    </div>
  );
}
