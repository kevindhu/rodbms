// app/api/datastores/[name]/entries/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDataStoreEntries } from "@/lib/robloxApi";
import type { DatastoreResponse, ErrorResponse } from "@/types/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name: datastoreName } = await params;
    const { searchParams } = new URL(req.url);
    const universeId = searchParams.get("universeId");
    const apiToken = searchParams.get("apiToken");
    const prefix = searchParams.get("prefix") || "";
    const cursor = searchParams.get("cursor") || "";
    const limit = 100;

    if (!universeId || !apiToken) {
      return NextResponse.json<ErrorResponse>(
        { error: "Missing universeId or apiToken" },
        { status: 400 }
      );
    }

    const data = await getDataStoreEntries(
      universeId,
      apiToken,
      datastoreName,
      prefix,
      cursor,
      limit
    );

    return NextResponse.json<DatastoreResponse>({
      keys: data.keys || [],
      nextPageCursor: data.nextPageCursor || "",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<ErrorResponse>(
      { error: message },
      { status: 500 }
    );
  }
}