// src/app/components/TutorialChannel/TheoryTab.tsx
import React from "react";
import { TrendingUp, ShieldAlert, Target, Info, Tag, Layers } from "lucide-react";
import { TheoryEmbed, TooltipText } from "./TutorialUI";

export function TheoryTab() {
  return (
    <div className="grid grid-cols-1 gap-5 max-w-4xl mx-auto animate-fade-in pb-8">
      <TheoryEmbed
        color="#30A163"
        icon={<TrendingUp className="w-5 h-5 text-[#30A163]" />}
        title="Market Tags: Rising vs Dropping"
        content={
          <>
            If a unit is <TooltipText text="Rising" tip="Consistently overpaid." color="#30A163" />, it means the unit is being consistently overpaid. Conversely, if a unit is <TooltipText text="Dropping" tip="Owners constantly taking underpays." color="#E60A18" />, it means owners are constantly taking underpays.
            <br />
            <br />
            Units labeled <TooltipText text="Stable" tip="Fair and consistently decent offers." color="#E6D8A1" /> are most likely not to move unless something happens. Always be cautious around <TooltipText text="Unstable" tip="Could rise or drop at any moment." color="#6B9EB5" /> units, which can shift trajectory randomly.
          </>
        }
      />

      <TheoryEmbed
        color="#01EFFD"
        icon={<Tag className="w-5 h-5 text-[#01EFFD]" />}
        title="Secondary Tags: The Hyped Trap"
        content={
          <>
            Tags are usually placed with Values or Supply/Demand to better define the unit's situation. 
            <br /><br />
            If a unit is <TooltipText text="Hyped" tip="Skyrocketing value and demand due to changes." color="#01EFFD" />, it can either be a new unit, or something big changed, skyrocketing a unit's value and demand. <strong className="text-white">Never hold a Hyped unit.</strong> Trade it immediately for stable, high-rarity units before the hype dies.
          </>
        }
        historyTitle="Case Study: The Rengoku Crash"
        historyContent="When Challenger Rengoku was released, hype drove his value to over 800k. Within 72 hours, the hype died, and his value plummeted. Players who held him lost over half their net worth."
      />

      <TheoryEmbed
        color="#5865F2"
        icon={<Layers className="w-5 h-5 text-[#5865F2]" />}
        title="Rarity, Supply & Demand"
        content={
          <>
            <TooltipText text="Demand" tip="How easy it is to find someone interested in the unit." color="#5865F2" /> <strong>CAN</strong> influence a unit's value, but it is <strong>NOT</strong> a direct relation. Demand merely means how easy it is to find someone interested, which can mean it eventually gets overpay or underpay.
            <br />
            <br />
            <TooltipText text="Supply" tip="Based on the amount of units in circulation." color="#FFB74D" /> is based on the amount of units in circulation (taking into account its rarity). <TooltipText text="Rarity" tip="Ranges from 0 (Forever Obtained) to 20 (Ultra Mega Rare)." color="#4DB6AC" /> determines absolute scarcity. High Rarity (e.g., Ultra Mega Rare - 20 Copies or Less) ensures a unit retains value, while High Demand makes it liquid.
          </>
        }
        historyTitle="Data Insight: Liquidity Flow"
        historyContent="Demand itself does not make a unit's value better, or worse (usually where values/tags don't change), even tho it CAN lead to that."
      />

      <TheoryEmbed
        color="#AF78A8"
        icon={<ShieldAlert className="w-5 h-5 text-[#AF78A8]" />}
        title="Gatekeeping & O/C Leverage"
        content={
          <>
            If a unit is <TooltipText text="Gatekept" tip="Refusing to trade, waiting for overpay." color="#AF78A8" />, it means owners are refusing to trade this unit for any reason, waiting for a rise or huge overpay.
            <br />
            <br />
            This is highly relevant for <strong>Owner's Choice (O/C)</strong> units. If you own one, you have infinite leverage. Never settle for dropping units. Wait for a massive overpay in stable or rising assets. Watch out for <TooltipText text="Black Marketed" tip="Impacted by outside-game currency." color="#9aa3b2" /> units, as real-world trading heavily impacts their trajectory.
          </>
        }
      />
    </div>
  );
}