import { NextRequest, NextResponse } from "next/server";
import type { DatastoreResponse, ErrorResponse } from '@/types/api';

export async function GET(
  req: NextRequest, 
  { params }: { params: { name: string } }
) {
  try {
    const { name: datastoreName } = params;
    const { searchParams } = new URL(req.url);
    const universeId = searchParams.get("universeId");
    const apiToken = searchParams.get("apiToken");
    const entryKey = searchParams.get("entryKey") || "";

    if (!universeId || !apiToken || !entryKey) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const robloxUrl = `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores/datastore/entries/entry/versions`;
    const res = await fetch(robloxUrl, {
      headers: {
        "x-api-key": apiToken,
        "Content-Type": "application/json"
      },
      next: { revalidate: 0 }
    });

    const robloxData = await res.json();

    return NextResponse.json<DatastoreResponse>({
      versions: robloxData.data || [],
      nextPageCursor: robloxData.nextPageCursor || ""
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json<ErrorResponse>({ error: message }, { status: 500 });
  }
}