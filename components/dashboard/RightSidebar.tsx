"use client";

import React from "react";
import styles from "./Dashboard.module.css";
import { Icons } from "./Icons";
import { User } from "./types";

interface RightSidebarProps {
    selectedUser: User | null;
}

const RightSidebar = ({ selectedUser }: RightSidebarProps) => {
    if (!selectedUser) {
        return (
            <aside className={styles.rightPanel}>
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                    <p>Select a user to view their shared files and contact settings</p>
                </div>
            </aside>
        );
    }

    return (
        <aside className={styles.rightPanel}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                    <img src={selectedUser.image} alt={selectedUser.name} style={{ width: "120px", height: "120px", borderRadius: "32px", objectFit: "cover", boxShadow: "var(--card-shadow)" }} />
                    <div className={`${styles.statusDot} ${selectedUser.online ? styles.online : styles.offline}`} style={{ width: "20px", height: "20px", border: "4px solid var(--bg-right)", bottom: "4px", right: "4px" }}></div>
                </div>
                <h2 style={{ fontSize: "1.4rem", marginBottom: "0.4rem", fontWeight: 700 }}>{selectedUser.name}</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "2.5rem" }}>{selectedUser.status}</p>

                <div style={{ width: "100%", display: "flex", gap: "0.8rem", marginBottom: "2.5rem" }}>
                    <button className={styles.themeToggle} style={{ flex: 1, flexDirection: "column", gap: "5px", padding: "12px" }}>
                        <Icons.Phone size={18} />
                        <span style={{ fontSize: "0.7rem" }}>Audio</span>
                    </button>
                    <button className={styles.themeToggle} style={{ flex: 1, flexDirection: "column", gap: "5px", padding: "12px" }}>
                        <Icons.Video size={18} />
                        <span style={{ fontSize: "0.7rem" }}>Video</span>
                    </button>
                    <button className={styles.themeToggle} style={{ flex: 1, flexDirection: "column", gap: "5px", padding: "12px" }}>
                        <Icons.Dots size={18} />
                        <span style={{ fontSize: "0.7rem" }}>More</span>
                    </button>
                </div>

                <div style={{ width: "100%", textAlign: "left" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h3 style={{ fontSize: "0.80rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.2px", fontWeight: 600 }}>Media & Files</h3>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-primary)", cursor: "pointer", fontWeight: 600 }}>View All</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                        {[1, 2, 3, 4].map(i => (
                            <div
                                key={i}
                                style={{ aspectRatio: "1.2", background: "var(--input)", borderRadius: "16px", cursor: "pointer" }}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default RightSidebar;
