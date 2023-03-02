"use client";

import Image from "next/image";
import Link from "next/link";
import { BsInstagram, BsLinkedin, BsTwitter } from "react-icons/bs";

export default function Home() {
  return (
    <>
      <p>yhakamay is ex-42 student, technical consultant, and Next.js lover.</p>
      <Image
        src="/yhakamay.png"
        width={80}
        height={80}
        alt={""}
        style={{ borderRadius: "20%" }}
      />
      <h2>Repositories</h2>
      {/*<Repos />*/}
      <h2>Contacts</h2>
      <Link
        href="https://twitter.com/yhakamay"
        target={"_blank"}
        rel={"noopener noreferrer"}
      >
        <BsTwitter size={24} />
      </Link>
      <Link
        href="https://www.instagram.com/yhakamay/"
        target={"_blank"}
        rel={"noopener noreferrer"}
      >
        <BsInstagram size={24} />
      </Link>
      <Link
        href="https://www.linkedin.com/in/yusuke-hakamaya/"
        target={"_blank"}
        rel={"noopener noreferrer"}
      >
        <BsLinkedin size={24} />
      </Link>
    </>
  );
}
