import ChatMessage from "./ChatMessage";
import { Message } from "@/types/chat";

interface Props {
  messages: Message[];
}

export default function ChatArea({ messages }: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 text-white">

      <div className="max-w-4xl mx-auto space-y-6">

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
          />
        ))}

      </div>

    </div>
  );
}