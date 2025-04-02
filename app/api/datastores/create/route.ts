// app/api/datastores/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import type { ErrorResponse } from '@/types/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { universeId, apiToken, datastoreName } = body;

    if (!universeId || !apiToken || !datastoreName) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create a datastore by posting an entry to it
    const apiUrl = `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores/datastore/entries/entry`;

    await axios.post(
      apiUrl,
      // The value to store
      { value: { created: new Date().toISOString() } },
      {
        headers: {
          'x-api-key': apiToken,
          'Content-Type': 'application/json',
        },
        params: {
          datastoreName: datastoreName,
          entryKey: `__init_${Date.now()}`,
          scope: 'global',
          exclusiveCreate: true,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Datastore created successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json<ErrorResponse>({ error: message }, { status: 500 });
  }
}
