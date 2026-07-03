import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Journey } from "@/components/journey";
import { Nav } from "@/components/nav";
import { Projects } from "@/components/projects";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/section";
import { Skills } from "@/components/skills";
import { Writing } from "@/components/writing";
import { getRepos } from "@/lib/github";
import { site } from "@/lib/site";
import { getArticles } from "@/lib/zenn";

export const metadata: Metadata = {
  title: `${site.name} — Classic edition`,
};

export default async function Classic() {
  const [repos, articles] = await Promise.all([getRepos(6), getArticles(6)]);

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <Hero />

        <Section id="about" index="01" title="About">
          <Reveal>
            <div className="grid gap-6 sm:grid-cols-3">
              <p className="text-lg leading-relaxed sm:col-span-2">
                {site.intro}
              </p>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-(--muted)">Now</dt>
                  <dd className="font-medium">{site.role}</dd>
                </div>
                <div>
                  <dt className="text-(--muted)">Based in</dt>
                  <dd className="font-medium">Tokyo, Japan</dd>
                </div>
                <div>
                  <dt className="text-(--muted)">Focus</dt>
                  <dd className="font-medium">Web · DX · Frontend</dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </Section>

        <Section id="journey" index="02" title="Places That Made Me">
          <Journey />
        </Section>

        <Section id="skills" index="03" title="Skills & Tools">
          <Skills />
        </Section>

        <Section id="work" index="04" title="Selected Work">
          <Projects repos={repos} />
        </Section>

        <Section id="writing" index="05" title="Writing">
          <Writing articles={articles} />
        </Section>
      </main>
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <Footer />
      </div>
    </>
  );
}
