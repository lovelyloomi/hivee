import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "company";
  timestamp: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! We loved your portfolio and would like to discuss the position with you.",
      sender: "company",
      timestamp: "10:30 AM",
    },
    {
      id: "2",
      text: "Thank you! I'm very interested in learning more about the role.",
      sender: "user",
      timestamp: "10:35 AM",
    },
    {
      id: "3",
      text: "Great! Are you available for a quick call this week?",
      sender: "company",
      timestamp: "10:40 AM",
    },
  ]);

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/matches")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="font-semibold text-lg">TechCorp</h2>
              <p className="text-sm bg-gradient-primary bg-clip-text text-transparent font-medium">
                Junior Developer
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-2xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] ${
                  message.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                <Card
                  className={`p-4 ${
                    message.sender === "user"
                      ? "bg-gradient-primary text-white"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </Card>
                <p className="text-xs text-muted-foreground mt-1">
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="bg-gradient-primary text-white hover:opacity-90"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
