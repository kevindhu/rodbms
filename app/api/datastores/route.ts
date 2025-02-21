// app/api/datastores/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatastores } from '@/lib/robloxApi';

export async function GET(req: NextRequest) {
  // Parse URL params
  const { searchParams } = new URL(req.url);
  const universeId = searchParams.get('universeId');
  const apiToken = searchParams.get('apiToken');

  if (!universeId || !apiToken) {
    return NextResponse.json({ error: 'Missing universeId or apiToken' }, { status: 400 });
  }

  try {
    const data = await getDatastores(universeId, apiToken);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
