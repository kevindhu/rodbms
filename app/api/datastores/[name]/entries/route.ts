// app/api/datastores/[name]/entries/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { DatastoreResponse, ErrorResponse } from "@/types/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name: datastoreName } = await params;
    const { searchParams } = new URL(req.url);
    const universeId = searchParams.get("universeId");
    
    // Get API token from header first, fall back to query param
    const apiToken = req.headers.get("x-api-key") || searchParams.get("apiToken");
    const prefix = searchParams.get("prefix") || "";
    const cursor = searchParams.get("cursor") || "";
    const searchQuery = searchParams.get("search") || "";
    const limit = 100;

    if (!universeId || !apiToken) {
      return NextResponse.json<ErrorResponse>(
        { error: "Missing universeId or apiToken" },
        { status: 400 }
      );
    }

    console.log("Fetching entries for datastore:", datastoreName);
    console.log("Universe ID:", universeId);
    console.log("API Token length:", apiToken.length);
    console.log("Search query:", searchQuery);

    // Construct the URL with the correct path format
    const url = `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores/datastore/entries`;
    
    // Add query parameters
    const queryParams = new URLSearchParams();
    queryParams.append("datastoreName", datastoreName);
    queryParams.append("limit", limit.toString());
    
    // If we have a search query, use it as a prefix to find matching entries
    if (searchQuery) {
      queryParams.append("prefix", searchQuery);
    } else if (prefix) {
      queryParams.append("prefix", prefix);
    }
    
    if (cursor) queryParams.append("cursor", cursor);
    
    const fullUrl = `${url}?${queryParams.toString()}`;
    console.log("Request URL:", fullUrl);
    
    // Pass the API token in the header to Roblox API
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "x-api-key": apiToken,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
    
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = await response.text();
      }
      
      console.error("Error details:", errorDetails);
      
      return NextResponse.json<ErrorResponse>(
        { error: `Roblox API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Response data:", data);
    
    return NextResponse.json<DatastoreResponse>({
      keys: data.keys || [],
      nextPageCursor: data.nextPageCursor || "",
    });
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<ErrorResponse>(
      { error: message },
      { status: 500 }
    );
  }
}

// Add POST method to handle the request with body parameters
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name: datastoreName } = await params;
    const body = await req.json();
    const { universeId, apiToken, prefix = "", cursor = "" } = body;
    const limit = 100;

    if (!universeId || !apiToken) {
      return NextResponse.json<ErrorResponse>(
        { error: "Missing universeId or apiToken in request body" },
        { status: 400 }
      );
    }

    return await fetchEntriesWithPost(universeId, apiToken, datastoreName, prefix, cursor, limit);
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<ErrorResponse>(
      { error: message },
      { status: 500 }
    );
  }
}

async function fetchEntriesWithPost(
  universeId: string,
  apiToken: string,
  datastoreName: string,
  prefix: string,
  cursor: string,
  limit: number
) {
  try {
    // Construct the URL with the correct path format
    const url = `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores/datastore/entries`;
    
    // Add query parameters
    const queryParams = new URLSearchParams();
    queryParams.append("datastoreName", datastoreName);
    queryParams.append("limit", limit.toString());
    if (prefix) queryParams.append("prefix", prefix);
    if (cursor) queryParams.append("cursor", cursor);
    
    const fullUrl = `${url}?${queryParams.toString()}`;
    console.log("Request URL:", fullUrl);
    
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "x-api-key": apiToken,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
    
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = await response.text();
      }
      
      console.error("Error details:", errorDetails);
      
      return NextResponse.json<ErrorResponse>(
        { error: `Roblox API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Response data:", data);
    
    return NextResponse.json<DatastoreResponse>({
      keys: data.keys || [],
      nextPageCursor: data.nextPageCursor || "",
    });
  } catch (error) {
    console.error("Error in fetchEntriesWithPost:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<ErrorResponse>(
      { error: message },
      { status: 500 }
    );
  }
}