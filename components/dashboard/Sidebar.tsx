"use client";

import React, { useState } from "react";
import styles from "./Dashboard.module.css";
import { Icons } from "./Icons";
import { User } from "./types";

import { ModeToggle } from "@/components/mode-toggle";

interface SidebarProps {
    selectedUser: User | null;
    onSelectUser: (user: User) => void;
}

const Sidebar = ({ selectedUser, onSelectUser }: SidebarProps) => {
    const [activeTab, setActiveTab] = useState<"users" | "groups">("users");

    const dummyUsers: User[] = [
        { id: "1", name: "Sarah Wilson", status: "Design Lead", image: "https://i.pravatar.cc/150?u=sarah", online: true, lastMessage: "See you at the meeting!" },
        { id: "2", name: "John Doe", status: "Senior Developer", image: "https://i.pravatar.cc/150?u=john", online: false, lastMessage: "The project looks great." },
        { id: "3", name: "Alex Rivers", status: "Product Manager", image: "https://i.pravatar.cc/150?u=alex", online: true, lastMessage: "Did you check the latest fix?" },
        { id: "4", name: "Emma Stone", status: "UX Researcher", image: "https://i.pravatar.cc/150?u=emma", online: true, lastMessage: "Lunch today?" },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.header}>
                <h1 className={styles.brand}>ChitChat</h1>
                <ModeToggle />
            </div>

            <div className={styles.searchWrapper}>
                <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
                    <Icons.Search size={18} />
                </div>
                <input type="text" placeholder="Search conversations..." className={styles.searchInput} />
            </div>

            <div className={styles.tabWrapper}>
                <div
                    className={`${styles.tab} ${activeTab === "users" ? styles.tabActive : ""}`}
                    onClick={() => setActiveTab("users")}
                >
                    Users
                </div>
                <div
                    className={`${styles.tab} ${activeTab === "groups" ? styles.tabActive : ""}`}
                    onClick={() => setActiveTab("groups")}
                >
                    Groups
                </div>
            </div>

            <div className={styles.userList}>
                {dummyUsers.map((user) => (
                    <div
                        key={user.id}
                        className={`${styles.userItem} ${selectedUser?.id === user.id ? styles.userItemActive : ""}`}
                        onClick={() => onSelectUser(user)}
                    >
                        <div className={styles.avatarWrapper}>
                            <img src={user.image} alt={user.name} className={styles.avatar} />
                            <div className={`${styles.statusDot} ${user.online ? styles.online : styles.offline}`}></div>
                        </div>
                        <div className={styles.userMeta}>
                            <div className={styles.userName} style={{ color: selectedUser?.id === user.id ? "black" : "inherit" }}>{user.name}</div>
                            <div style={{ fontSize: "0.8rem", color: selectedUser?.id === user.id ? "rgba(0,0,0,0.7)" : "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "150px" }}>
                                {user.lastMessage}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;

