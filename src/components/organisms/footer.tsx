import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-6 pb-8 md:flex md:items-center md:justify-between lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-500">
              View source on{" "}
              <Link
                href={"https://github.com/yhakamay/me"}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700 transition duration-150 ease-in-out"
              >
                GitHub
              </Link>
            </p>
            <p className="text-center text-xs leading-5 text-gray-500">
              &copy; 2023 Yusuke Hakamaya. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
