export const site = {
  name: "Yusuke Hakamaya",
  handle: "yhakamay",
  role: "AEM Technical Consultant @ Adobe",
  tagline: "Building delightful things on the web.",
  intro:
    "Ex-42 Tokyo student and technical consultant with a soft spot for Next.js. Raised in Fukuoka, spent two childhood years in Shanghai, now based in Tokyo — where I help teams ship great digital experiences at Adobe.",
  url: "https://yhakamay.me",
  contact: "https://twitter.com/yhakamay",
  socials: [
    { label: "GitHub", href: "https://github.com/yhakamay" },
    { label: "X", href: "https://twitter.com/yhakamay" },
    { label: "Instagram", href: "https://www.instagram.com/yhakamay/" },
    { label: "Zenn", href: "https://zenn.dev/yhakamay" },
  ],
  skills: [
    "Next.js",
    "React",
    "TypeScript",
    "Flutter",
    "Firebase",
    "GraphQL",
    "Tailwind CSS",
    "AEM",
  ],
  // Chronological stops that shaped me — rendered on an interactive map.
  // coord is [longitude, latitude].
  journey: [
    {
      city: "Fukuoka",
      jp: "福岡",
      label: "Hometown",
      coord: [130.4, 33.6],
      note: "Where I grew up. Kyushu raised me — and gave me a soft spot for good ramen and the sea.",
    },
    {
      city: "Shanghai",
      jp: "上海",
      label: "Childhood",
      coord: [121.5, 31.2],
      note: "Two childhood years abroad. An early lesson that a new language and a new city are just another thing you can learn.",
    },
    {
      city: "Tokyo",
      jp: "東京",
      label: "Now",
      coord: [139.7, 35.7],
      note: "Based here today, helping teams ship great digital experiences at Adobe — and building delightful things on the web.",
    },
  ],
} as const;
