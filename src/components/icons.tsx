import {
  IconBed,
  IconBolt,
  IconBriefcase,
  IconBuildingCommunity,
  IconCar,
  IconDots,
  IconFirstAidKit,
  IconFolder,
  IconGift,
  IconHeart,
  IconHome,
  IconMovie,
  IconPlane,
  IconReceipt,
  IconShoppingBag,
  IconShoppingCart,
  IconToolsKitchen2,
  IconUsers,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import type { CategoryValue, GroupKindValue } from "@/lib/labels";

type TablerIcon = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;

export const CATEGORY_ICONS: Record<CategoryValue, TablerIcon> = {
  general: IconReceipt,
  food: IconToolsKitchen2,
  groceries: IconShoppingCart,
  transport: IconCar,
  travel: IconPlane,
  stay: IconBed,
  rent: IconBuildingCommunity,
  utilities: IconBolt,
  shopping: IconShoppingBag,
  entertainment: IconMovie,
  health: IconFirstAidKit,
  gifts: IconGift,
  other: IconDots,
};

export const GROUP_KIND_ICONS: Record<GroupKindValue, TablerIcon> = {
  trip: IconPlane,
  home: IconHome,
  couple: IconHeart,
  friends: IconUsers,
  work: IconBriefcase,
  other: IconFolder,
};

/** A 40px square chip with a brand icon, the Aback icon chip recipe. */
export function IconChip({
  icon: Icon,
  size = "md",
  tone = "brand",
  className = "",
}: {
  icon: TablerIcon;
  size?: "sm" | "md" | "lg";
  /** Neutral for long lists, where blue on every row would stop meaning anything. */
  tone?: "brand" | "neutral";
  className?: string;
}) {
  const box = size === "sm" ? "size-8" : size === "lg" ? "size-12" : "size-10";
  const glyph = size === "sm" ? "size-4" : size === "lg" ? "size-6" : "size-5";
  return (
    <span
      className={`flex ${box} shrink-0 items-center justify-center ${tone === "brand" ? "bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400" : "bg-muted text-muted-foreground"} ${className}`}
    >
      <Icon aria-hidden="true" className={glyph} />
    </span>
  );
}
