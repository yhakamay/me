import Image from "next/image";
import Link from "next/link";
import xml2js from "xml2js";

import { Article } from "@/types/article";
import { Repo } from "@/types/repo";

export default async function Home() {
  const repos: Repo[] = await fetchRepos();
  const topRepos: Repo[] = await getTopRepos(repos, 7);
  const articles: Article[] = await fetchArticles();

  return (
    <>
      <main className="mx-auto max-w-5xl px-4">
        <section>
          <div className="hero min-h-screen">
            <div className="hero-content flex-col lg:flex-row">
              <Image
                src={"/yhakamay.png"}
                width={96}
                height={96}
                alt={"yhakamay"}
                className="mask mask-squircle h-20 md:h-24 w-auto shadow-sm shadow-black"
                unoptimized={true}
              />
              <h1 className="mt-2 text-3xl font-bold">
                Ex-42 student, technical consultant, and Next.js lover.
              </h1>
              <div className="flex-col">
                <p className="mt-6 text-sm leading-6">
                  yhakamay, an ex-42 Tokyo student, is a technical consultant
                  and an enthusiast of Next.js. Raised in Fukuoka and spent two
                  years of childhood in Shanghai. Currently resides in Tokyo and
                  works for Adobe as an AEM Technical Consultant.
                </p>
                <div className="mt-10 flex gap-x-6 justify-center lg:justify-normal">
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
                      className="h-6 w-auto dark:hidden"
                    />
                    <Image
                      src={"/github-fff.svg"}
                      width={24}
                      height={24}
                      alt={"GitHub"}
                      className="h-6 w-auto hidden dark:block"
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
                      className="h-6 w-auto dark:hidden"
                    />
                    <Image
                      src={"/twitter-fff.svg"}
                      width={24}
                      height={24}
                      alt={"Twitter"}
                      className="h-6 w-auto hidden dark:block"
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
                      className="h-6 w-auto dark:hidden"
                    />
                    <Image
                      src={"/instagram-fff.svg"}
                      width={24}
                      height={24}
                      alt={"Instagram"}
                      className="h-6 w-auto hidden dark:block"
                    />
                  </Link>
                </div>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 absolute bottom-4 animate-bounce mx-auto left-0 right-0 dark:text-neutral-content"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </div>
        </section>

        <section className="pt-16">
          <div className="mx-auto">
            <h2 className="text-center mt-2 text-2xl font-bold">Skills</h2>
            <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-4 gap-y-6 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
              <Image
                className="col-span-2 h-10 w-full object-contain lg:col-span-1 dark:hidden"
                src="/flutter.svg"
                alt="Flutter"
                width={120}
                height={30}
              />
              <Image
                className="col-span-2 h-10 w-full object-contain lg:col-span-1 hidden dark:block"
                src="/flutter-fff.svg"
                alt="Flutter"
                width={120}
                height={30}
              />
              <Image
                className="col-span-2 h-10 w-full object-contain lg:col-span-1 dark:hidden"
                src="/firebase.svg"
                alt="Firebase"
                width={120}
                height={30}
              />
              <Image
                className="col-span-2 h-10 w-full object-contain lg:col-span-1 hidden dark:block"
                src="/firebase-fff.svg"
                alt="Firebase"
                width={120}
                height={30}
              />
              <Image
                className="col-span-2 h-6 w-full object-contain lg:col-span-1 dark:hidden"
                src="/nextjs.svg"
                alt="Next.js"
                width={120}
                height={30}
              />
              <Image
                className="col-span-2 h-6 w-full object-contain lg:col-span-1 hidden dark:block"
                src="/nextjs-fff.svg"
                alt="Next.js"
                width={120}
                height={30}
              />
              <Image
                className="col-span-2 h-10 w-full object-contain sm:col-start-2 lg:col-span-1 dark:hidden"
                src="/graphql.svg"
                alt="GraphQL"
                width={120}
                height={30}
              />
              <Image
                className="col-span-2 h-10 w-full object-contain sm:col-start-2 lg:col-span-1 hidden dark:block"
                src="/graphql-fff.svg"
                alt="GraphQL"
                width={120}
                height={30}
              />
              <Image
                className="col-span-2 col-start-2 h-10 w-full object-contain sm:col-start-auto lg:col-span-1 dark:hidden"
                src="/tailwind.svg"
                alt="Tailwind CSS"
                width={120}
                height={30}
              />
              <Image
                className="col-span-2 col-start-2 h-10 w-full object-contain sm:col-start-auto lg:col-span-1 hidden dark:block"
                src="/tailwind-fff.svg"
                alt="Tailwind CSS"
                width={120}
                height={30}
              />
            </div>
          </div>
        </section>

        <section className="pt-16">
          <h2 className="text-center mt-2 text-2xl font-bold">Repositories</h2>
          <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topRepos.map((repo) => (
              <li key={repo.id}>
                <Link
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="card bg-base-100 shadow-md md:h-60">
                    <div className="card-body">
                      <h2 className="card-title line-clamp-1">{repo.name}</h2>
                      <div className="md:h-20">
                        {repo.description ? (
                          <p className="line-clamp-3">{repo.description}</p>
                        ) : (
                          <p className="italic">No description</p>
                        )}
                      </div>
                      <div className="card-actions justify-end md:h-6">
                        {new Date(repo.updated_at) >
                        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? (
                          <div className="badge badge-outline badge-primary">
                            Recent
                          </div>
                        ) : null}
                        {repo.language && (
                          <div className="badge badge-outline">
                            {repo.language}
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-base-content/70 dark:text-neutral-content/70">
                        {new Date(repo.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="pt-16">
          <h2 className="text-center mt-2 text-2xl font-bold">Articles</h2>
          <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {articles.map(
              (article) =>
                article.title && (
                  <li key={article.guid[0]}>
                    <Link
                      href={article.link[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="card bg-base-100 shadow-md md:h-52">
                        <div className="card-body">
                          <h2 className="card-title line-clamp-1">
                            {article.title[0]}
                          </h2>
                          <div className="md:h-20">
                            {article.description ? (
                              <p className="line-clamp-3">
                                {article.description[0]}
                              </p>
                            ) : (
                              <p className="italic">No description</p>
                            )}
                          </div>
                          <p className="mt-1 text-base-content/70 dark:text-neutral-content/70">
                            {new Date(article.pubDate[0]).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                )
            )}
          </ul>
        </section>
      </main>
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
  // pop archived repos
  const activeRepos = repos.filter((repo) => !repo.archived);

  // sort repos by updated_at
  const sortedRepos = activeRepos.sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return sortedRepos.slice(0, count);
}

async function fetchArticles(): Promise<Article[]> {
  const res = await fetch("https://zenn.dev/yhakamay/feed", {
    next: {
      revalidate: 60 * 60 * 24,
    },
  });
  const xml = await res.text();
  const feed = await xml2js.parseStringPromise(xml);
  const items = feed.rss.channel[0].item;

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  items.forEach((item: Article) => {
    console.log(item.enclosure);
  });

  return items;
}
