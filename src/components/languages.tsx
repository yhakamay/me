"use client";

import { motion } from "framer-motion";
import {
  Si42,
  SiC,
  SiCplusplus,
  SiCsharp,
  SiCss3,
  SiDart,
  SiGo,
  SiHtml5,
  SiJavascript,
  SiPhp,
  SiPython,
  SiRuby,
  SiRust,
  SiShell,
  SiTypescript,
} from "react-icons/si";

import FadeInSection from "./fade_in_section";
import styles from "./languages.module.scss";

type LanguagesProps = {
  languages: [string, number][];
};

export default function Languages(props: LanguagesProps) {
  const { languages } = props;
  const topLanguages = languages.slice(0, 5);

  return (
    <FadeInSection className={styles.languages}>
      <h3>Languages</h3>
      <ul>
        {topLanguages.map(([language, count]) => {
          const languageIcon = getLanguageIcon(language);
          const maxUsage = topLanguages[0][1];

          return (
            <li key={language} className={styles.language}>
              {languageIcon}
              <motion.div
                className={styles.bar}
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${(count / maxUsage) * 100}%`,
                }}
                transition={{
                  type: "spring",
                  delay: 0.4,
                  stiffness: 30,
                  damping: 12,
                }}
              />
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
    default:
      return <Si42 />;
  }
}
