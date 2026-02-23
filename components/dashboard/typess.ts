import React from "react";

export const Icons = {
    Search: () => (
        <svg width= "18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <circle cx="11" cy = "11" r="8" > </circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line > </svg>
  ),
Moon: () => (
    <svg width= "18" height = "18" viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2" strokeLinecap = "round" strokeLinejoin = "round" > <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" > </path></svg >
  ),
Sun: () => (
    <svg width= "18" height = "18" viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2" strokeLinecap = "round" strokeLinejoin = "round" > <circle cx="12" cy = "12" r = "5" > </circle><line x1="12" y1="1" x2="12" y2="3"></line > <line x1="12" y1 = "21" x2 = "12" y2 = "23" > </line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line > <line x1="18.36" y1 = "18.36" x2 = "19.78" y2 = "19.78" > </line><line x1="1" y1="12" x2="3" y2="12"></line > <line x1="21" y1 = "12" x2 = "23" y2 = "12" > </line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line > <line x1="18.36" y1 = "5.64" x2 = "19.78" y2 = "4.22" > </line></svg >
  ),
Send: () => (
    <svg width= "18" height = "18" viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2" strokeLinecap = "round" strokeLinejoin = "round" > <line x1="22" y1 = "2" x2 = "11" y2 = "13" > </line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon > </svg>
  ),
Phone: () => (
    <svg width= "18" height = "18" viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2" strokeLinecap = "round" strokeLinejoin = "round" > <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" > </path></svg >
  ),
Video: () => (
    <svg width= "18" height = "18" viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2" strokeLinecap = "round" strokeLinejoin = "round" > <polygon points="23 7 16 12 23 17 23 7" > </polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect > </svg>
  ),
Dots: () => (
    <svg width= "18" height = "18" viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2" strokeLinecap = "round" strokeLinejoin = "round" > <circle cx="12" cy = "12" r = "1" > </circle><circle cx="12" cy="5" r="1"></circle > <circle cx="12" cy = "19" r = "1" > </circle></svg >
  ),
DoubleCheck: () => (
    <svg width= "14" height = "14" viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2" strokeLinecap = "round" strokeLinejoin = "round" > <polyline points="20 6 9 17 4 12" > </polyline><polyline points="20 12 9 23 4 18"></polyline > </svg>
  )
};

export interface User {
    id: string;
    name: string;
    image: string;
    online: boolean;
    status: string;
    lastMessage?: string;
}
