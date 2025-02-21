import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
    console.log("Fetching versions route triggered");
    const { name: datastoreName } = params;
    const { searchParams } = new URL(req.url);
    const universeId = searchParams.get("universeId");
    const apiToken = searchParams.get("apiToken");
    const entryKey = searchParams.get("entryKey") || "";

    // Call Roblox's "List Entry Versions" endpoint
    const robloxUrl = `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores/datastore/entries/entry/versions?datastoreName=${datastoreName}&entryKey=${entryKey}&limit=100`;
    const res = await fetch(robloxUrl, {
        headers: {
            "x-api-key": apiToken ?? "",
            "Content-Type": "application/json"
        }
    });
    const robloxData = await res.json();

    // If Roblox returns { data: [...], nextPageCursor: ... }, rename 'data' -> 'versions'
    return NextResponse.json({
        versions: robloxData.data || [],
        nextPageCursor: robloxData.nextPageCursor || ""
    });
}