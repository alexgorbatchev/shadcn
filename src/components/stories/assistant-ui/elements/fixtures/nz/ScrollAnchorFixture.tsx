import { useState, type JSX } from "react";
import { Button } from "../../../../../Button.js";
import { ScrollAnchor, type IScrollAnchorMessage } from "../../../../../assistant-ui/elements/ScrollAnchor.js";
export function ScrollAnchorFixture(): JSX.Element {
  const [messages, setMessages] = useState<IScrollAnchorMessage[]>(
    Array.from({ length: 12 }, (_, index) => ({
      role: "assistant",
      text: `Message ${index + 1}: Read the source and inspect the workspace before changing the application.`,
    })),
  );
  const [isFollowing, setIsFollowing] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const changeFollowing = (next: boolean): void => {
    setIsFollowing(next);
    if (next) setUnreadCount(0);
  };
  return (
    <section aria-label="Conversation demo">
      <ScrollAnchor
        messages={messages}
        isFollowing={isFollowing}
        unreadCount={unreadCount}
        onFollowingChange={changeFollowing}
      />
      <Button
        onClick={() => {
          setMessages((current) => [
            ...current,
            { role: "assistant", text: `Message ${current.length + 1}: New source result received.` },
          ]);
          if (!isFollowing) setUnreadCount((current) => current + 1);
        }}
      >
        Append a message
      </Button>
      <output>{isFollowing ? "Following latest messages" : "Following paused"}</output>
    </section>
  );
}
