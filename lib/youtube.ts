/**
 * Extracts YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 */
export const extractVideoId = (url: string): string | null => {
  try {
    // Remove whitespace
    const trimmedUrl = url.trim();

    // Pattern 1: youtube.com/watch?v=VIDEO_ID
    const watchPattern = /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
    const watchMatch = trimmedUrl.match(watchPattern);
    if (watchMatch) return watchMatch[1];

    // Pattern 2: youtu.be/VIDEO_ID
    const shortPattern = /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const shortMatch = trimmedUrl.match(shortPattern);
    if (shortMatch) return shortMatch[1];

    // Pattern 3: youtube.com/embed/VIDEO_ID
    const embedPattern = /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    const embedMatch = trimmedUrl.match(embedPattern);
    if (embedMatch) return embedMatch[1];

    // Pattern 4: youtube.com/v/VIDEO_ID
    const vPattern = /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/;
    const vMatch = trimmedUrl.match(vPattern);
    if (vMatch) return vMatch[1];

    return null;
  } catch (error) {
    console.error("Error extracting video ID:", error);
    return null;
  }
};

/**
 * Gets the highest quality YouTube thumbnail available
 * Tries in order: maxresdefault (1920x1080), sddefault (640x480), hqdefault (480x360)
 */
export const getHighestQualityThumbnail = async (
  videoId: string
): Promise<string | null> => {
  const qualities = [
    { name: "maxresdefault", url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
    { name: "sddefault", url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg` },
    { name: "hqdefault", url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` },
  ];

  for (const quality of qualities) {
    try {
      const response = await fetch(quality.url, { method: "HEAD" });
      if (response.ok) {
        // Additional check: maxresdefault returns 200 even if not available,
        // but has a smaller file size when it's the placeholder
        if (quality.name === "maxresdefault") {
          const contentLength = response.headers.get("content-length");
          if (contentLength && parseInt(contentLength) < 5000) {
            // Placeholder image, try next quality
            continue;
          }
        }
        return quality.url;
      }
    } catch (error) {
      console.error(`Failed to check ${quality.name}:`, error);
      continue;
    }
  }

  return null;
};

/**
 * Fetches YouTube thumbnail and converts it to a File object
 */
export const fetchThumbnailAsFile = async (
  thumbnailUrl: string,
  filename: string = "youtube-thumbnail.jpg"
): Promise<File> => {
  try {
    const response = await fetch(thumbnailUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch thumbnail");
    }

    const blob = await response.blob();
    const file = new File([blob], filename, { type: "image/jpeg" });
    return file;
  } catch (error) {
    console.error("Error fetching thumbnail:", error);
    throw error;
  }
};

/**
 * Main function to extract thumbnail from YouTube URL
 * Returns File object ready to be used in forms
 */
export const extractYouTubeThumbnail = async (
  youtubeUrl: string
): Promise<{ file: File; videoId: string } | null> => {
  try {
    // Extract video ID
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    // Get highest quality thumbnail URL
    const thumbnailUrl = await getHighestQualityThumbnail(videoId);
    if (!thumbnailUrl) {
      throw new Error("Could not fetch thumbnail");
    }

    // Convert to File object
    const file = await fetchThumbnailAsFile(
      thumbnailUrl,
      `yt-thumbnail-${videoId}.jpg`
    );

    return { file, videoId };
  } catch (error) {
    console.error("Error extracting YouTube thumbnail:", error);
    throw error;
  }
};

