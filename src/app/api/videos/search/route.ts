import ytSearch from 'yt-search';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    const { videos } = await ytSearch(query);
    const topVideos = videos.slice(0, 6).map(v => ({
      videoId: v.videoId,
      title: v.title,
      description: v.description,
      thumbnail: v.thumbnail,
      timestamp: v.timestamp,
      author: v.author.name
    }));

    return NextResponse.json({ videos: topVideos });
  } catch (error) {
    console.error('Video search error:', error);
    return NextResponse.json({ error: 'Failed to search videos' }, { status: 500 });
  }
}
