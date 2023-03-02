import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <div>
      <Image src="/logo.png" width={24} height={24} alt={""} />
      <h3>
        <Link href="/">yhakamay</Link>
      </h3>
    </div>
  );
}
