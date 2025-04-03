// app/api/datastores/[name]/entry/version/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getEntryVersion } from '@/lib/robloxApi';

// Define response types
interface VersionResponse {
  data: string;
  version: string;
  createdTime: string;
  contentLength: number;
  objectCreatedTime?: string;
}

interface ErrorResponse {
  error: string;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name: datastoreName } = await params;
    const { searchParams } = new URL(req.url);
    const universeId = searchParams.get('universeId');
    const entryKey = searchParams.get('entryKey');
    const versionId = searchParams.get('versionId');

    // Get API token from header first, fall back to query param
    const apiToken = req.headers.get('x-api-key') || searchParams.get('apiToken');

    if (!universeId || !entryKey || !versionId || !apiToken) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const result = await getEntryVersion(
      universeId,
      apiToken,
      datastoreName,
      entryKey,
      versionId,
      'global' // scope
    );

    return NextResponse.json<VersionResponse>(result);
  } catch (error) {
    console.error('Error fetching entry version:', error);

    // Check if this is a 404 error from the Roblox API
    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Entry version not found' },
        { status: 404 }
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json<ErrorResponse>({ error: message }, { status: 500 });
  }
}
