"use strict";
"use client";

import React, { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import RightSidebar from "./RightSidebar";
import { User } from "./types";

const Dashboard = () => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    return (
        <div className={styles.container}>
            <Sidebar
                selectedUser={selectedUser}
                onSelectUser={setSelectedUser}
            />
            <ChatArea selectedUser={selectedUser} />
            <RightSidebar selectedUser={selectedUser} />
        </div>
    );
};

export default Dashboard;
