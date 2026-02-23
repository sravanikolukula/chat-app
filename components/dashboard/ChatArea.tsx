"use client";

import React from "react";
import styles from "./Dashboard.module.css";
import { Icons } from "./Icons";
import { User } from "./types";

interface ChatAreaProps {
    selectedUser: User | null;
}

const ChatArea = ({ selectedUser }: ChatAreaProps) => {
    if (!selectedUser) {
        return (
            <main className={styles.chatArea}>
                <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", color: "var(--text-muted)", flexDirection: "column", gap: "1.5rem" }}>
                    <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "var(--input)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>✨</div>
                    <div style={{ textAlign: "center" }}>
                        <h2 style={{ fontSize: "1.5rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>Welcome to NebulaChat</h2>
                        <p>Select a contact from the sidebar to start a conversation</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.chatArea}>
            <header className={styles.chatHeader}>
                <div className={styles.chatUserInfo}>
                    <div className={styles.avatarWrapper}>
                        <img src={selectedUser.image} alt={selectedUser.name} className={styles.avatar} />
                        <div className={`${styles.statusDot} ${selectedUser.online ? styles.online : styles.offline}`}></div>
                    </div>
                    <div>
                        <div className={styles.userName}>{selectedUser.name}</div>
                        <div style={{ fontSize: "0.80rem", color: "var(--status-online)", fontWeight: 500 }}>
                            {selectedUser.online ? "Online" : "Away"}
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className={styles.themeToggle}><Icons.Phone size={18} /></button>
                    <button className={styles.themeToggle}><Icons.Video size={18} /></button>
                    <button className={styles.themeToggle}><Icons.Dots size={18} /></button>
                </div>
            </header>

            <div className={styles.messages}>
                <div className={`${styles.messageWrapper} ${styles.received}`}>
                    <img src={selectedUser.image} alt="" className={styles.avatar} style={{ width: "28px", height: "28px" }} />
                    <div className={styles.messageContent}>
                        <div className={styles.bubble}>hii</div>
                        <div className={styles.timestamp}>21:01</div>
                    </div>
                </div>

                <div className={`${styles.messageWrapper} ${styles.received}`}>
                    <img src={selectedUser.image} alt="" className={styles.avatar} style={{ width: "28px", height: "28px" }} />
                    <div className={styles.messageContent}>
                        <div className={styles.bubble}>dtrfyuiguyhjkhbgftdyfcvghbnjm</div>
                        <div className={styles.timestamp}>21:01</div>
                    </div>
                </div>

                <div className={`${styles.messageWrapper} ${styles.sent}`}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#ccc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "black" }}>Me</div>
                    <div className={styles.messageContent}>
                        <div className={styles.bubble}>hiiiiii</div>
                        <div className={styles.timestamp}>
                            21:06 <Icons.DoubleCheck size={14} />
                        </div>
                    </div>
                </div>

                <div className={`${styles.messageWrapper} ${styles.sent}`}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#ccc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "black" }}>Me</div>
                    <div className={styles.messageContent}>
                        <div className={styles.bubble}>jeriuwerfdngwriuwbpthoureb...</div>
                        <div className={styles.timestamp}>
                            21:07 <Icons.DoubleCheck size={14} />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.inputArea}>
                <div className={styles.messageInputWrapper}>
                    <input type="text" placeholder="Type a message..." className={styles.messageInput} />
                </div>
                <button className={styles.sendButton}>
                    <span style={{ marginRight: "8px" }}>Send</span>
                    <Icons.Send size={18} />
                </button>
            </div>
        </main>
    );
};

export default ChatArea;
