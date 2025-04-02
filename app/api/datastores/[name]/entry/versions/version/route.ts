// app/api/datastores/[name]/entry/versions/version/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getEntryVersion } from '@/lib/robloxApi';
import type { ErrorResponse } from '@/types/api';

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const { name: datastoreName } = params;
    const { searchParams } = new URL(req.url);

    // Get parameters from query string or headers
    const universeId = searchParams.get('universeId');
    const apiToken = req.headers.get('x-api-key') || searchParams.get('apiToken');
    const entryKey = searchParams.get('entryKey');
    const versionId = searchParams.get('versionId');
    const scope = searchParams.get('scope') || '';

    // Log the parameters for debugging (remove in production)
    console.log('Version API request parameters:', {
      datastoreName,
      universeId,
      apiToken: apiToken ? '[REDACTED]' : undefined,
      entryKey,
      versionId,
      scope,
    });

    // Check for required parameters
    if (!universeId) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing universeId parameter' },
        { status: 400 }
      );
    }
    if (!apiToken) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing apiToken parameter' },
        { status: 400 }
      );
    }
    if (!entryKey) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing entryKey parameter' },
        { status: 400 }
      );
    }
    if (!versionId) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing versionId parameter' },
        { status: 400 }
      );
    }

    // Call the Roblox API
    try {
      const data = await getEntryVersion(
        universeId,
        apiToken,
        datastoreName,
        entryKey,
        versionId,
        scope
      );
      return NextResponse.json(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching version from Roblox API:', errorMessage);
      return NextResponse.json<ErrorResponse>({ error: errorMessage }, { status: 500 });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in version API route:', errorMessage);
    return NextResponse.json<ErrorResponse>({ error: errorMessage }, { status: 500 });
  }
}
