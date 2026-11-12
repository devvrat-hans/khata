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
