import { ChevronRightIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import Link from "next/link";

import { Repo } from "@/types/repo";

export default async function Home() {
  const repos: Repo[] = await fetchRepos();
  const topRepos: Repo[] = await getTopRepos(repos, 7);

  return (
    <>
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <Image
              src={"/yhakamay.png"}
              width={240}
              height={240}
              alt={"yhakamay"}
              className="rounded-full h-24 w-auto"
            />
            <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
              Ex-42 student, technical consultant, and Next.js lover.
            </h1>
            <p className="mt-6 text-sm leading-6 text-gray-600">
              yhakamay, an ex-42 Tokyo student, is a technical consultant and an
              enthusiast of Next.js. Raised in Fukuoka and spent two years of
              childhood in Shanghai. Currently resides in Tokyo and works for
              Adobe as an AEM Technical Consultant.
            </p>
            <div className="mt-6 flex gap-x-6">
              <Link
                href="https://github.com/yhakamay"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={"/github.svg"}
                  width={24}
                  height={24}
                  alt={"GitHub"}
                  className="h-6 w-auto"
                />
              </Link>
              <Link
                href="https://twitter.com/yhakamay"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={"/twitter.svg"}
                  width={24}
                  height={24}
                  alt={"Twitter"}
                  className="h-6 w-auto"
                />
              </Link>
              <Link
                href="https://www.instagram.com/yhakamay/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={"/instagram.svg"}
                  width={24}
                  height={24}
                  alt={"Instagram"}
                  className="h-6 w-auto"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center mt-2 text-2xl font-bold text-gray-900">
              Skills
            </h2>
            <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
              <Image
                className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
                src="/flutter.svg"
                alt="Flutter"
                width={120}
                height={30}
              />
              <Image
                className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
                src="/firebase.svg"
                alt="Firebase"
                width={120}
                height={30}
              />
              <Image
                className="col-span-2 max-h-10 w-full object-contain lg:col-span-1"
                src="/nextjs.svg"
                alt="Next.js"
                width={120}
                height={30}
              />
              <Image
                className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1"
                src="/graphql.svg"
                alt="GraphQL"
                width={120}
                height={30}
              />
              <Image
                className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1"
                src="/tailwind.svg"
                alt="Tailwind CSS"
                width={120}
                height={30}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center mt-2 text-2xl font-bold text-gray-900">
              Repositories
            </h2>
            <ul
              role="list"
              className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl mt-10"
            >
              {topRepos.map((repo) => (
                <li
                  key={repo.url}
                  className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6"
                >
                  <div className="flex gap-x-4">
                    <div className="min-w-0 max-w-sm flex-auto">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        <Link
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="absolute inset-x-0 -top-px bottom-0" />
                          {repo.name}
                        </Link>
                      </p>
                      <p className="mt-1 flex text-xs leading-5 text-gray-500">
                        {repo.description?.substring(0, 200)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-4">
                    <div className="hidden sm:flex sm:flex-col sm:items-end">
                      <p className="text-xs leading-6 text-gray-600">
                        {repo.language ?? "🤷‍♂️"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Updated at{" "}
                        {new Date(repo.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRightIcon
                      className="h-5 w-5 flex-none text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

async function fetchRepos(): Promise<Repo[]> {
  const res = await fetch(
    "https://api.github.com/users/yhakamay/repos?sort=updated&direction=desc?per_page=100",
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_API_TOKEN}`,
      },
      next: {
        revalidate: 60 * 60 * 24,
      },
    }
  );

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  return res.json();
}

async function getTopRepos(repos: Repo[], count: number): Promise<Repo[]> {
  // pop forked repos
  const myRepos = repos.filter((repo) => !repo.fork);

  // pop archived repos
  const activeRepos = myRepos.filter((repo) => !repo.archived);

  // sort repos by updated_at
  const sortedRepos = activeRepos.sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return sortedRepos.slice(0, count);
}
