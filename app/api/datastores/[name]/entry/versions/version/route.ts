// app/api/datastores/[name]/entry/versions/version/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getEntryVersion } from '@/lib/robloxApi';

export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name: datastoreName } = await params;
  const { searchParams } = new URL(req.url);
  const universeId = searchParams.get('universeId');
  const apiToken = searchParams.get('apiToken');
  const entryKey = searchParams.get('entryKey');
  const versionId = searchParams.get('versionId');
  const scope = searchParams.get('scope') || '';

  if (!universeId || !apiToken || !entryKey || !versionId) {
    return NextResponse.json({ error: 'Missing required params' }, { status: 400 });
  }

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
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
