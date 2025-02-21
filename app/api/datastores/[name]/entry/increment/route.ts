// app/api/datastores/[name]/entry/increment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { incrementDataStoreEntry } from '@/lib/robloxApi';
import type { DatastoreResponse, ErrorResponse } from '@/types/api';

interface IncrementBody {
    entryKey: string;
    incrementBy: number;
    scope?: string;
}

export async function POST(req: NextRequest, { params }: { params: { name: string } }) {
    try {
        const { name: datastoreName } = params;
        const { searchParams } = new URL(req.url);
        const universeId = searchParams.get('universeId');
        const apiToken = searchParams.get('apiToken');

        if (!universeId || !apiToken) {
            return NextResponse.json<ErrorResponse>(
                { error: 'Missing universeId or apiToken' },
                { status: 400 }
            );
        }

        const body = await req.json() as IncrementBody;
        if (!body.entryKey || body.incrementBy === undefined) {
            return NextResponse.json<ErrorResponse>(
                { error: 'Missing entryKey or incrementBy' },
                { status: 400 }
            );
        }

        const result = await incrementDataStoreEntry(
            universeId,
            apiToken,
            datastoreName,
            body.entryKey,
            body.incrementBy,
            body.scope
        );
        return NextResponse.json<DatastoreResponse>(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json<ErrorResponse>({ error: message }, { status: 500 });
    }
}
