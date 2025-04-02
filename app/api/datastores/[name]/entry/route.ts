import { NextRequest, NextResponse } from 'next/server';
import { getDataStoreEntry, setDataStoreEntry, deleteDataStoreEntry } from '@/lib/robloxApi';
import type { DatastoreResponse, ErrorResponse } from '@/types/api';

// GET: Fetch a single entry's data
export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name: datastoreName } = await params;
    const { searchParams } = new URL(req.url);
    const universeId = searchParams.get('universeId');

    // Get API token from header first, fall back to query param
    const apiToken = req.headers.get('x-api-key') || searchParams.get('apiToken');
    const entryKey = searchParams.get('entryKey') || '';
    const scope = searchParams.get('scope') || '';

    if (!universeId || !apiToken || !entryKey) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing universeId, apiToken, or entryKey' },
        { status: 400 }
      );
    }

    try {
      const data = await getDataStoreEntry(universeId, apiToken, datastoreName, entryKey, scope);
      return NextResponse.json<DatastoreResponse>(data);
    } catch (error) {
      // Check if this is a 404 error from the Roblox API
      if (error instanceof Error && error.message.includes('404')) {
        return NextResponse.json<ErrorResponse>({ error: 'Entry not found' }, { status: 404 });
      }
      // Re-throw other errors to be caught by the outer catch block
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json<ErrorResponse>({ error: message }, { status: 500 });
  }
}

// POST: Set (create/update) an entry
export async function POST(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name: datastoreName } = await params;
    const { searchParams } = new URL(req.url);
    const universeId = searchParams.get('universeId');

    // Get API token from header first, fall back to query param
    const apiToken = req.headers.get('x-api-key') || searchParams.get('apiToken');

    if (!universeId || !apiToken) {
      return NextResponse.json({ error: 'Missing universeId or apiToken' }, { status: 400 });
    }

    const body = await req.json();
    if (!body.entryKey || body.value === undefined) {
      return NextResponse.json({ error: 'Missing entryKey or value' }, { status: 400 });
    }

    const result = await setDataStoreEntry(
      universeId,
      apiToken,
      datastoreName,
      body.entryKey,
      body.value,
      body.matchVersion,
      body.exclusiveCreate,
      body.scope || ''
    );
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE: Delete an entry
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name: datastoreName } = await params;
  const { searchParams } = new URL(req.url);
  const universeId = searchParams.get('universeId');

  // Get API token from header first, fall back to query param
  const apiToken = req.headers.get('x-api-key') || searchParams.get('apiToken');
  const entryKey = searchParams.get('entryKey') || '';
  const scope = searchParams.get('scope') || '';

  if (!universeId || !apiToken || !entryKey) {
    return NextResponse.json(
      { error: 'Missing universeId, apiToken, or entryKey' },
      { status: 400 }
    );
  }

  try {
    const result = await deleteDataStoreEntry(universeId, apiToken, datastoreName, entryKey, scope);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
