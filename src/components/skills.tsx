import { site } from "@/lib/site";

export function Skills() {
  return (
    <p className="text-lg leading-relaxed">
      {site.skills.join("  ·  ")}
    </p>
  );
}
