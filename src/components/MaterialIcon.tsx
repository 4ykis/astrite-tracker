import Image from "next/image";
import { Material, TIER_STYLES } from "@/lib/materials";

export default function MaterialIcon({ material, size = 44 }: { material: Material; size?: number }) {
  const tier = TIER_STYLES[material.tier];
  return (
    <Image
      src={material.icon}
      alt={material.name}
      title={material.name}
      width={size}
      height={size}
      unoptimized
      className={`shrink-0 rounded-lg border-b-2 ${tier.border} ${tier.bg}`}
    />
  );
}
