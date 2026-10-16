import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cuisine = searchParams.get("cuisine");
    const query = searchParams.get("q");
    const sortBy = searchParams.get("sort") || "honest_ranking"; // honest_ranking, rating, prep_time, hygiene
    const vegOnly = searchParams.get("veg") === "true";

    const restaurants = await prisma.restaurant.findMany({
      where: {
        isOpen: true,
        ...(cuisine ? { cuisineType: { contains: cuisine } } : {}),
        ...(query ? {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
            { cuisineType: { contains: query } }
          ]
        } : {})
      },
      include: {
        verification: true,
        menuItems: {
          where: vegOnly ? { isVeg: true, isAvailable: true } : { isAvailable: true },
          include: {
            assets: true,
            portionVariants: true
          },
          take: 4
        },
        antiWasteDeals: {
          where: { isActive: true },
          take: 1
        }
      }
    });

    // Compute Honest Ranking Score & Explainable Factors
    // Honest formula: Base Rating (40%) + Hygiene Score (30%) + Speed (20%) + True-Size Verified dishes ratio (10%)
    const rankedRestaurants = restaurants.map((r) => {
      const verifiedDishesCount = r.menuItems.filter(m => m.trueSizeVerified).length;
      const verifiedRatio = r.menuItems.length > 0 ? (verifiedDishesCount / r.menuItems.length) : 0;
      
      const speedScore = Math.max(0, 1 - (r.avgPreparationTime / 60)); // 20m prep gives higher score than 50m prep
      const ratingNormalized = r.rating / 5.0;
      const hygieneNormalized = r.hygieneRating / 5.0;

      const honestScore = Math.round(
        (ratingNormalized * 0.40 + hygieneNormalized * 0.30 + speedScore * 0.20 + verifiedRatio * 0.10) * 100
      );

      const rankingExplanation = [
        `${r.hygieneRating}/5.0 Hygiene Audit`,
        `${r.avgPreparationTime}m Avg Prep`,
        `${verifiedDishesCount} 3D Verified Dishes`,
        r.isSponsored ? "Sponsored Placement (Disclosed)" : "Organic Rank"
      ];

      return {
        ...r,
        honestScore,
        rankingExplanation,
        verifiedDishesCount
      };
    });

    // If sorting by honest ranking, sort by score descending, but keep sponsored clearly flagged
    if (sortBy === "honest_ranking") {
      rankedRestaurants.sort((a, b) => b.honestScore - a.honestScore);
    } else if (sortBy === "rating") {
      rankedRestaurants.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "prep_time") {
      rankedRestaurants.sort((a, b) => a.avgPreparationTime - b.avgPreparationTime);
    } else if (sortBy === "hygiene") {
      rankedRestaurants.sort((a, b) => b.hygieneRating - a.hygieneRating);
    }

    return NextResponse.json({
      success: true,
      count: rankedRestaurants.length,
      restaurants: rankedRestaurants,
      rankingPolicy: {
        disclosedFactors: ["40% Diner Rating", "30% Official Hygiene Audit", "20% Prep Speed", "10% True-Size 3D Verification"],
        adTransparency: "Sponsored placements are strictly labeled and never inflate organic ranking."
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load restaurants" }, { status: 500 });
  }
}
