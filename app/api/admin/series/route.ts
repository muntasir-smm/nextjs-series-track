// app/api/admin/series/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { defaultSeries } from "@/app/lib/placeholder-data";

// In-memory store for defaultSeries (since it's in a JS file)
// In production, you'd want to use a database for this
let currentSeries = [...defaultSeries];

export async function GET(request: NextRequest) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json(currentSeries);
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const series = await request.json();
    currentSeries.push(series);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding series:", error);
    return NextResponse.json(
      { error: "Failed to add series" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const updatedSeries = await request.json();
    const index = currentSeries.findIndex((s) => s.id === updatedSeries.id);

    if (index !== -1) {
      currentSeries[index] = updatedSeries;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Series not found" }, { status: 404 });
  } catch (error) {
    console.error("Error updating series:", error);
    return NextResponse.json(
      { error: "Failed to update series" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing series ID" }, { status: 400 });
    }

    const seriesExists = currentSeries.find((s) => s.id === id);
    if (!seriesExists) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    currentSeries = currentSeries.filter((s) => s.id !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting series:", error);
    return NextResponse.json(
      { error: "Failed to delete series" },
      { status: 500 },
    );
  }
}
