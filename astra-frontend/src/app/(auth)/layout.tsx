export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[url('/loginBg.png')] bg-cover bg-top bg-fixed min-h-screen w-full font-[ClashGrotesk-regular]">
      {children}
    </div>
  );
}
