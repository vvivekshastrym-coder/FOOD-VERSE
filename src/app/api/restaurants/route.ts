import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cuisine = searchParams.get("cuisine");
    const query = searchParams.get("q");
    const sortBy = searchParams.get("sort") || "honest_ranking"; // honest_ranking, rating, prep_time, hygiene, price_asc, price_desc
    const vegOnly = searchParams.get("veg") === "true";
    const minRating = searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined;

    const restaurants = await prisma.restaurant.findMany({
      where: {
        isOpen: true,
        ...(cuisine && cuisine !== "ALL" ? { cuisineType: { contains: cuisine } } : {}),
        ...(minRating ? { rating: { gte: minRating } } : {}),
        ...(query ? {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
            { cuisineType: { contains: query } },
            { menuItems: { some: { name: { contains: query } } } }
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
          take: 8
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

      const avgDishPrice = r.menuItems.length > 0
        ? r.menuItems.reduce((acc, item) => acc + item.price, 0) / r.menuItems.length
        : 250;

      const rankingExplanation = [
        `${r.hygieneRating}/5.0 Hygiene Audit`,
        `${r.avgPreparationTime}m Avg Prep`,
        `${verifiedDishesCount} 3D Verified Dishes`,
        r.isSponsored ? "Sponsored Placement (Disclosed)" : "Organic Rank"
      ];

      return {
        ...r,
        honestScore,
        avgDishPrice: Math.round(avgDishPrice),
        rankingExplanation,
        verifiedDishesCount
      };
    });

    // Sorting options
    if (sortBy === "honest_ranking") {
      rankedRestaurants.sort((a, b) => b.honestScore - a.honestScore);
    } else if (sortBy === "rating") {
      rankedRestaurants.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "prep_time") {
      rankedRestaurants.sort((a, b) => a.avgPreparationTime - b.avgPreparationTime);
    } else if (sortBy === "hygiene") {
      rankedRestaurants.sort((a, b) => b.hygieneRating - a.hygieneRating);
    } else if (sortBy === "price_asc") {
      rankedRestaurants.sort((a, b) => a.avgDishPrice - b.avgDishPrice);
    } else if (sortBy === "price_desc") {
      rankedRestaurants.sort((a, b) => b.avgDishPrice - a.avgDishPrice);
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
