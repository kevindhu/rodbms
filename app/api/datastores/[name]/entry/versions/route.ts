import { NextRequest, NextResponse } from 'next/server';
import { listEntryVersions } from '@/lib/robloxApi';
import type { DatastoreResponse, ErrorResponse } from '@/types/api';

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const { name: datastoreName } = params;
    const { searchParams } = new URL(req.url);
    const universeId = searchParams.get('universeId');

    // Get API token from header first, fall back to query param
    const apiToken = req.headers.get('x-api-key') || searchParams.get('apiToken');
    const entryKey = searchParams.get('entryKey') || '';
    const scope = searchParams.get('scope') || '';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;

    if (!universeId || !apiToken || !entryKey) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const sortOrder = searchParams.get('sortOrder') || 'Descending';

    console.log('sortOrder', sortOrder);

    try {
      const versionsData = await listEntryVersions(
        universeId,
        apiToken,
        datastoreName,
        entryKey,
        scope,
        limit,
        sortOrder
      );

      return NextResponse.json<DatastoreResponse>({
        versions: versionsData.versions || [],
        nextPageCursor: versionsData.nextPageCursor || '',
      });
    } catch (error) {
      // Check if this is a 404 error from the Roblox API
      if (error instanceof Error && error.message.includes('404')) {
        return NextResponse.json<ErrorResponse>(
          { error: 'Entry versions not found' },
          { status: 404 }
        );
      }
      // Re-throw other errors to be caught by the outer catch block
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json<ErrorResponse>({ error: message }, { status: 500 });
  }
}
