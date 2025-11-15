export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-muted rounded-lg w-fit">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" />
      </div>
    </div>
  );
};
