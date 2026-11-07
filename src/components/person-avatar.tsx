import { Avatar, AvatarFallback, AvatarImage } from "@aback-ui/ui";
import { initials } from "@/lib/format";

type Size = "xs" | "sm" | "default" | "lg" | "xl";

/** A square avatar: the Google photo when there is one, initials otherwise. */
export function PersonAvatar({
  person,
  size = "default",
  className,
}: {
  person: { name: string; image: string | null };
  size?: Size;
  className?: string;
}) {
  return (
    <Avatar size={size} className={className}>
      {person.image ? <AvatarImage src={person.image} alt="" referrerPolicy="no-referrer" /> : null}
      <AvatarFallback aria-hidden="true">{initials(person.name)}</AvatarFallback>
    </Avatar>
  );
}
