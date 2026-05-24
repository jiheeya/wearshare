export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-7rem)] py-12 px-4">
      {children}
    </div>
  );
}
