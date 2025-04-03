import { NextRequest, NextResponse } from 'next/server';
import { listEntryVersions } from '@/lib/robloxApi';

// Define response types
interface VersionsResponse {
  versions: Array<{
    version: string;
    createdTime: string;
    contentLength: number;
    deleted: boolean;
    objectCreatedTime?: string;
    isLatest?: boolean;
  }>;
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

    // Get API token from header first, fall back to query param
    const apiToken = req.headers.get('x-api-key') || searchParams.get('apiToken');

    if (!universeId || !entryKey || !apiToken) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const result = await listEntryVersions(
      universeId,
      apiToken,
      datastoreName,
      entryKey,
      'global', // scope
      100, // limit
      'Descending' // explicitly set sortOrder
    );

    // Add isLatest flag to the first version (newest with Descending sort)
    if (result.versions && result.versions.length > 0) {
      result.versions[0].isLatest = true;
    }

    return NextResponse.json<VersionsResponse>(result);
  } catch (error) {
    console.error('Error fetching entry versions:', error);

    // Check if this is a 404 error from the Roblox API
    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Entry versions not found' },
        { status: 404 }
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json<ErrorResponse>({ error: message }, { status: 500 });
  }
}
