import Image from "next/image";

export function AuthLogo() {
  return (
    <div className="flex flex-col items-center space-y-3">
      <Image
        src="/philand.png"
        alt="Philand Logo"
        width={48}
        height={48}
        className="h-12 w-auto"
        priority
      />
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        Philand
      </h1>
    </div>
  );
}
