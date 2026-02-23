import {
    Search,
    Moon,
    Sun,
    Send,
    Phone,

    MoreVertical,
    CheckCheck,
    Video
} from "lucide-react";

export const Icons = {
    Search: Search,
    Moon: Moon,
    Sun: Sun,
    Send: Send,
    Phone: Phone,
    Video: Video,
    Dots: MoreVertical,
    DoubleCheck: CheckCheck
};

export interface User {
    id: string;
    name: string;
    image: string;
    online: boolean;
    status: string;
    lastMessage?: string;
}
