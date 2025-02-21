// app/api/datastores/[name]/entry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  getDataStoreEntry,
  setDataStoreEntry,
  deleteDataStoreEntry,
} from '@/lib/robloxApi';

/**
 * GET => Fetch a single entry's data
 * POST => Set (create/update) an entry
 * DELETE => Delete an entry
 */

// Example fix for GET:
export async function GET(req: NextRequest, context: { params: { name: string } }) {
  // Await the params object
  const { name: datastoreName } = await context.params;
  const { searchParams } = new URL(req.url);
  const universeId = searchParams.get('universeId');
  const apiToken = searchParams.get('apiToken');
  const entryKey = searchParams.get('entryKey') || '';
  const scope = searchParams.get('scope') || '';

  if (!universeId || !apiToken || !entryKey) {
    return NextResponse.json(
      { error: 'Missing universeId, apiToken, or entryKey' },
      { status: 400 }
    );
  }

  try {
    const data = await getDataStoreEntry(
      universeId,
      apiToken,
      datastoreName,
      entryKey,
      scope
    );
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Example fix for POST:
export async function POST(req: NextRequest, context: { params: { name: string } }) {
  const { name: datastoreName } = await context.params;
  const { searchParams } = new URL(req.url);
  const universeId = searchParams.get('universeId');
  const apiToken = searchParams.get('apiToken');

  if (!universeId || !apiToken) {
    return NextResponse.json(
      { error: 'Missing universeId or apiToken' },
      { status: 400 }
    );
  }

  // Body: { entryKey, value, scope?, matchVersion?, exclusiveCreate? }
  const body = await req.json();
  if (!body.entryKey || body.value === undefined) {
    return NextResponse.json(
      { error: 'Missing entryKey or value' },
      { status: 400 }
    );
  }

  try {
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Example fix for DELETE:
export async function DELETE(req: NextRequest, context: { params: { name: string } }) {
  const { name: datastoreName } = await context.params;
  const { searchParams } = new URL(req.url);
  const universeId = searchParams.get('universeId');
  const apiToken = searchParams.get('apiToken');
  const entryKey = searchParams.get('entryKey') || '';
  const scope = searchParams.get('scope') || '';

  if (!universeId || !apiToken || !entryKey) {
    return NextResponse.json(
      { error: 'Missing universeId, apiToken, or entryKey' },
      { status: 400 }
    );
  }

  try {
    const result = await deleteDataStoreEntry(
      universeId,
      apiToken,
      datastoreName,
      entryKey,
      scope
    );
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
