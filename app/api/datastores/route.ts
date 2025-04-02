// app/api/datastores/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { DatastoreResponse, ErrorResponse } from '@/types/api';

// Define interfaces for the Roblox API response
interface RobloxDatastore {
  name: string;
  createdTime?: string;
  updatedTime?: string;
}

interface RobloxDatastoreResponse {
  datastores?: RobloxDatastore[];
}

// Define the DatastoreInfo interface
interface DatastoreInfo {
  name: string;
  createdTime: string;
}

// Handle POST requests with body parameters
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { universeId } = body;

    // Get API token from header first, fall back to body parameter
    const apiToken = req.headers.get('x-api-key') || body.apiToken;

    if (!universeId || !apiToken) {
      console.error('Missing required parameters:', {
        universeId: !!universeId,
        apiToken: !!apiToken,
        headerToken: !!req.headers.get('x-api-key'),
        bodyToken: !!body.apiToken,
      });
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Fetching datastores for universe:', universeId);
    console.log('API Token length:', apiToken.length);

    // Use the standard-datastores endpoint
    const url = `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores?limit=100`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiToken,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = await response.text();
      }

      console.error('Roblox API error:', {
        status: response.status,
        statusText: response.statusText,
        details: errorDetails,
      });

      return NextResponse.json(
        {
          error: `Roblox API error: ${response.status} ${response.statusText}`,
          details: JSON.stringify(errorDetails),
        },
        { status: response.status }
      );
    }

    const data = (await response.json()) as RobloxDatastoreResponse | RobloxDatastore[];
    console.log('Roblox API response:', data);

    // Format the response based on the actual structure
    let datastoreNames: string[] = [];

    if ('datastores' in data && Array.isArray(data.datastores)) {
      datastoreNames = data.datastores.map((ds: RobloxDatastore) => ds.name);
    } else if (Array.isArray(data)) {
      datastoreNames = data.map((ds: RobloxDatastore) => ds.name);
    }

    // Convert string array to DatastoreInfo array
    const datastoreInfos: DatastoreInfo[] = datastoreNames.map((name) => ({
      name,
      createdTime: new Date().toISOString(),
    }));

    return NextResponse.json<DatastoreResponse>({ datastores: datastoreInfos });
  } catch (error) {
    console.error('Error fetching datastores:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json<ErrorResponse>(
      {
        error: 'Failed to fetch datastores',
      },
      { status: 500 }
    );
  }
}

// Also support GET method for backward compatibility
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const universeId = searchParams.get('universeId');

    // Get API token from header first, fall back to query parameter
    const apiToken = req.headers.get('x-api-key') || searchParams.get('apiToken');

    if (!universeId || !apiToken) {
      console.error('Missing required parameters:', {
        universeId: !!universeId,
        apiToken: !!apiToken,
        headerToken: !!req.headers.get('x-api-key'),
        queryToken: !!searchParams.get('apiToken'),
      });
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Fetching datastores for universe:', universeId);
    console.log('API Token length:', apiToken.length);

    // Use the standard-datastores endpoint
    const url = `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores?limit=100`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiToken,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = await response.text();
      }

      console.error('Roblox API error:', {
        status: response.status,
        statusText: response.statusText,
        details: errorDetails,
      });

      return NextResponse.json(
        {
          error: `Roblox API error: ${response.status} ${response.statusText}`,
          details: JSON.stringify(errorDetails),
        },
        { status: response.status }
      );
    }

    const data = (await response.json()) as RobloxDatastoreResponse | RobloxDatastore[];
    console.log('Roblox API response:', data);

    // Format the response based on the actual structure
    let datastoreNames: string[] = [];

    if ('datastores' in data && Array.isArray(data.datastores)) {
      datastoreNames = data.datastores.map((ds: RobloxDatastore) => ds.name);
    } else if (Array.isArray(data)) {
      datastoreNames = data.map((ds: RobloxDatastore) => ds.name);
    }

    // Convert string array to DatastoreInfo array
    const datastoreInfos: DatastoreInfo[] = datastoreNames.map((name) => ({
      name,
      createdTime: new Date().toISOString(),
    }));

    return NextResponse.json<DatastoreResponse>({ datastores: datastoreInfos });
  } catch (error) {
    console.error('Error fetching datastores:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json<ErrorResponse>(
      {
        error: 'Failed to fetch datastores',
      },
      { status: 500 }
    );
  }
}
