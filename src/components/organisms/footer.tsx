import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer footer-center my-8 font-sans">
      <div>
        <Link
          href={"https://github.com/yhakamay/me"}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-700 transition duration-150 ease-in-out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 inline-block align-middle mr-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
            />
          </svg>
          <small className="text-center text-xs">on GitHub</small>
        </Link>
        <small className="text-center text-xs">
          &copy; 2023 Yusuke Hakamaya. All rights reserved.
        </small>
      </div>
    </footer>
  );
}
