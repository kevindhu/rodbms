// app/api/datastores/[name]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDataStoreEntries } from "@/lib/robloxApi";
import type { DatastoreResponse } from "@/types/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  try {
    const { searchParams } = new URL(req.url);
    const universeId = searchParams.get("universeId");
    const apiToken = searchParams.get("apiToken");
    const prefix = searchParams.get("prefix")?.toLowerCase() || "";
    const cursor = searchParams.get("cursor") || "";
    const limit = 100;

    if (!universeId || !apiToken) {
      return NextResponse.json<DatastoreResponse>(
        { error: "Missing universeId or apiToken" },
        { status: 400 }
      );
    }

    const data = await getDataStoreEntries(
      universeId,
      apiToken,
      name,
      prefix,
      cursor,
      limit
    );

    let filteredEntries = data.keys || [];
    if (prefix) {
      filteredEntries = filteredEntries.filter((key: string) =>
        key.toLowerCase().includes(prefix)
      );
    }

    return NextResponse.json<DatastoreResponse>({
      keys: filteredEntries,
      nextPageCursor: data.nextPageCursor || "",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<DatastoreResponse>(
      { error: message },
      { status: 500 }
    );
  }
}
