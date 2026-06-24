import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image src="/logo.jpeg" alt="Million logo" width={32} height={32} />
      <span className="text-lg font-semibold">Million</span>
    </div>
  );
}