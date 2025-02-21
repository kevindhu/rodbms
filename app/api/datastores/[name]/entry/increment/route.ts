// app/api/datastores/[name]/entry/increment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { incrementDataStoreEntry } from '@/lib/robloxApi';

export async function POST(req: NextRequest, { params }: { params: { name: string } }) {
    const { name: datastoreName } = params;
    const { searchParams } = new URL(req.url);
    const universeId = searchParams.get('universeId');
    const apiToken = searchParams.get('apiToken');

    if (!universeId || !apiToken) {
        return NextResponse.json({ error: 'Missing universeId or apiToken' }, { status: 400 });
    }

    const body = await req.json(); // { entryKey, incrementBy, scope }
    if (!body.entryKey || body.incrementBy === undefined) {
        return NextResponse.json({ error: 'Missing entryKey or incrementBy' }, { status: 400 });
    }

    try {
        const result = await incrementDataStoreEntry(
            universeId,
            apiToken,
            datastoreName,
            body.entryKey,
            body.incrementBy,
            body.scope
        );
        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
