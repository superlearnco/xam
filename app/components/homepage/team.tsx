import { Globe, Linkedin, Twitter } from "lucide-react";

const team = [
  {
    name: "Rae Mitchell",
    role: "Co-founder & CEO",
    bio: "Drives product vision and customer success for every assessment workflow.",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80",
    links: {
      linkedin: "https://www.linkedin.com",
      twitter: "https://x.com",
    },
  },
  {
    name: "Noah Kim",
    role: "Co-founder & CTO",
    bio: "Leads engineering, AI reliability, and platform scale across enterprise tenants.",
    avatar:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80",
    links: {
      linkedin: "https://www.linkedin.com",
      website: "https://example.com",
    },
  },
  {
    name: "Priya Desai",
    role: "Head of Design",
    bio: "Designs the end-to-end authoring experience, ensuring clarity for writers and reviewers.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    links: {
      twitter: "https://x.com",
    },
  },
  {
    name: "Luis Andrade",
    role: "Head of Customer Operations",
    bio: "Owns onboarding, security reviews, and ongoing enablement for global programs.",
    avatar:
      "https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=400&q=80",
    links: {
      linkedin: "https://www.linkedin.com",
      website: "https://example.com",
    },
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 text-center md:text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Team
          </p>
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Operators who obsess over calm collaboration
            </h2>
            <p className="text-lg text-muted-foreground">
              We’re a distributed team of builders focused on giving learning
              organizations better tooling—from authoring to analytics.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <article
              key={member.name}
              className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="h-20 w-20 rounded-full border object-cover"
                loading="lazy"
                height={80}
                width={80}
              />
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {member.name}
                </h3>
                <p className="text-sm text-primary">{member.role}</p>
              </div>
              <p className="text-sm text-muted-foreground">{member.bio}</p>
              <div className="flex gap-3">
                {member.links?.linkedin && (
                  <a
                    href={member.links.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={`${member.name} on LinkedIn`}
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {member.links?.twitter && (
                  <a
                    href={member.links.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={`${member.name} on Twitter`}
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {member.links?.website && (
                  <a
                    href={member.links.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={`${member.name} website`}
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
