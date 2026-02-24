import { Id } from "@/convex/_generated/dataModel";

export interface User {
    _id: Id<"users">;
    clerkId: string;
    name: string;
    image: string;
    online: boolean;
}

export interface Conversation {
    _id: Id<"conversations">;
    members: Id<"users">[];
    isGroup: boolean;
    groupName?: string;
    otherMember?: User | null;
    lastMessage?: Message | null;
}

export interface Message {
    _id: Id<"messages">;
    conversationId: Id<"conversations">;
    senderId: Id<"users">;
    body: string;
    createdAt: number;
}
