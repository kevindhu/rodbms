import { NextRequest, NextResponse } from "next/server";
import { getDatastores } from "@/lib/robloxApi";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const universeId = searchParams.get("universeId");
  const apiToken = searchParams.get("apiToken");

  if (!universeId || !apiToken) {
    return NextResponse.json(
      { error: "Missing universeId or apiToken" },
      { status: 400 }
    );
  }

  try {
    const data = await getDatastores(universeId, apiToken);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
