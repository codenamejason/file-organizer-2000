import { requestUrl } from 'obsidian';

export async function getYouTubeTranscript(videoId: string): Promise<string> {
  try {
    const videoPageUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const videoPageResponse = await requestUrl(videoPageUrl);
    const videoPageBody = videoPageResponse.text;

    const captionsJson = videoPageBody.split('"captions":')[1]?.split(',"videoDetails')[0];
    if (!captionsJson) {
      throw new Error('Transcript not available');
    }

    const captions = JSON.parse(captionsJson);
    const transcriptUrl = captions.playerCaptionsTracklistRenderer.captionTracks[0].baseUrl;

    const transcriptResponse = await requestUrl(transcriptUrl);
    const transcriptBody = transcriptResponse.text;

    const transcript = transcriptBody.match(/<text[^>]*>(.*?)<\/text>/g)
      ?.map(line => line.replace(/<[^>]*>/g, ''))
      .join(' ');

    return transcript || '';
  } catch (error) {
    console.error('Error fetching YouTube transcript:', error);
    throw new Error('Failed to fetch YouTube transcript');
  }
}