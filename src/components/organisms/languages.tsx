"use client";

import { motion } from "framer-motion";
import { BsFiletypeScss } from "react-icons/bs";
import { FaJava } from "react-icons/fa";
import {
  Si42,
  SiC,
  SiCmake,
  SiCplusplus,
  SiCsharp,
  SiCss3,
  SiDart,
  SiDocker,
  SiGo,
  SiHtml5,
  SiJavascript,
  SiJupyter,
  SiKotlin,
  SiLess,
  SiPhp,
  SiPython,
  SiRuby,
  SiRust,
  SiShell,
  SiSwift,
  SiTypescript,
} from "react-icons/si";

import { RepoLanguage } from "@/types/repo_languages";

import FadeInSection from "../molecules/fade_in_section";

import styles from "./languages.module.scss";

type LanguagesProps = {
  languages: RepoLanguage[];
};

export default function Languages(props: LanguagesProps) {
  const { languages } = props;
  const maxCount = Math.max(...languages.map((language) => language.count));
  const sortedLanguages = languages.sort((a, b) => b.count - a.count);
  const topTenLanguages = sortedLanguages.slice(0, 10);

  return (
    <FadeInSection className={styles.languages}>
      <h3>Languages</h3>
      <ul>
        {topTenLanguages.map((language, index) => {
          const { name, count } = language;
          const languageIcon = getLanguageIcon(name);

          return (
            <li key={name} className={styles.language}>
              {languageIcon}
              <div className={styles.bar_container}>
                <motion.div
                  className={styles.bar}
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / maxCount) * 100}%` }}
                  transition={{
                    type: "spring",
                    delay: 0.4,
                    stiffness: 30,
                    damping: 12,
                  }}
                ></motion.div>
                <p className={styles.name}>{language.name}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </FadeInSection>
  );
}

function getLanguageIcon(language: string) {
  switch (language) {
    case "TypeScript":
      return <SiTypescript />;
    case "JavaScript":
      return <SiJavascript />;
    case "C#":
      return <SiCsharp />;
    case "HTML":
      return <SiHtml5 />;
    case "C++":
      return <SiCplusplus />;
    case "CSS":
      return <SiCss3 />;
    case "Python":
      return <SiPython />;
    case "PHP":
      return <SiPhp />;
    case "C":
      return <SiC />;
    case "Shell":
      return <SiShell />;
    case "Ruby":
      return <SiRuby />;
    case "Go":
      return <SiGo />;
    case "Rust":
      return <SiRust />;
    case "Dart":
      return <SiDart />;
    case "Java":
      return <FaJava />;
    case "SCSS":
      return <BsFiletypeScss />;
    case "CMake":
      return <SiCmake />;
    case "Swift":
      return <SiSwift />;
    case "Dockerfile":
      return <SiDocker />;
    case "Jupyter Notebook":
      return <SiJupyter />;
    case "Less":
      return <SiLess />;
    case "Kotlin":
      return <SiKotlin />;
    default:
      return <Si42 />;
  }
}
