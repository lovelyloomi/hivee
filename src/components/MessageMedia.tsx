interface MessageMediaProps {
  mediaUrl: string;
  mediaType: string;
}

export const MessageMedia = ({ mediaUrl, mediaType }: MessageMediaProps) => {
  if (mediaType.startsWith('image/')) {
    return (
      <img
        src={mediaUrl}
        alt="Message attachment"
        className="max-w-sm rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => window.open(mediaUrl, '_blank')}
      />
    );
  }

  if (mediaType.startsWith('video/')) {
    return (
      <video
        src={mediaUrl}
        controls
        className="max-w-sm rounded-lg"
      />
    );
  }

  return (
    <a
      href={mediaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline hover:no-underline"
    >
      View attachment
    </a>
  );
};
