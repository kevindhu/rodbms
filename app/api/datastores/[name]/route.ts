// app/api/datastores/[name]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDataStoreEntries } from '@/lib/robloxApi';
import { rateLimit } from '@/lib/rateLimit';

export const runtime = 'edge'; // Use edge runtime for better performance

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const rateLimitResult = rateLimit(req, { 
    interval: 60,  // 1 minute
    limit: 30      // 30 requests
  });
  
  if (rateLimitResult.isLimited) {
    return NextResponse.json(
      { 
        error: 'Too many requests',
        reset: rateLimitResult.reset,
        remaining: 0
      }, 
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.reset.getTime().toString()
        }
      }
    );
  }

  try {
    const datastoreName = params.name;
    const { searchParams } = new URL(req.url);
    const universeId = searchParams.get('universeId');
    const apiToken = searchParams.get('apiToken');
    const prefix = searchParams.get('prefix')?.toLowerCase() || '';
    const cursor = searchParams.get('cursor') || '';
    const limit = 100;

    if (!universeId || !apiToken) {
      return NextResponse.json(
        { error: 'Missing universeId or apiToken' },
        { status: 400 }
      );
    }

    const data = await getDataStoreEntries(universeId, apiToken, datastoreName, prefix, cursor, limit);
    
    let filteredEntries = data.keys || [];
    if (prefix) {
      filteredEntries = filteredEntries.filter((key: string) => 
        key.toLowerCase().includes(prefix)
      );
    }

    return NextResponse.json({
      entries: filteredEntries,
      nextPageCursor: data.nextPageCursor || ''
    }, {
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.getTime().toString()
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
