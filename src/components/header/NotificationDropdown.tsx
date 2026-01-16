"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Bell, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

interface Notification {
  type: "signal" | "alert";
  symbol: string;      
  signal_type: string; 
  strength: number;
  created_at: string;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Notifications on Mount
  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch((err) => console.error("Notify Error:", err))
      .finally(() => setLoading(false));
  }, []);

  function toggleDropdown() {
    setIsOpen(!isOpen);
    // When opening, mark as read (hide the orange dot)
    if (!isOpen) setNotifying(false);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  // Helper: Format Time Ago
  const getTimeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            !notifying || notifications.length === 0 ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        
        <Bell className="w-5 h-5 fill-current" />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
          </h5>
          <button
            onClick={toggleDropdown}
            className="text-gray-500 transition dropdown-toggle dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
           <span className="sr-only">Close</span>
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {loading ? (
             <div className="p-4 text-center text-sm text-gray-500">Loading updates...</div>
          ) : notifications.length === 0 ? (
             <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
          ) : (
            notifications.map((item, index) => {
              const isSignal = item.type === "signal";
              const isBuy = item.signal_type === "BUY";
              const isAlert = item.type === "alert";

              return (
                <li key={index}>
                  <DropdownItem
                    onItemClick={closeDropdown}
                    className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                  >
                    {/* --- ICON CONTAINER --- */}
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      {isAlert ? (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      ) : isBuy ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      )}
                      
                      {/* Status Dot */}
                      <span className={`absolute bottom-0 right-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white dark:border-gray-900 ${
                         isAlert ? "bg-red-500" : "bg-blue-500"
                      }`}></span>
                    </span>

                    {/* --- TEXT CONTENT --- */}
                    <span className="block w-full">
                      <span className="mb-1.5 block space-x-1 text-theme-sm text-gray-500 dark:text-gray-400">
                        {isAlert ? (
                           <span className="font-medium text-red-500">System Alert</span>
                        ) : (
                           <>
                             <span className="font-medium text-gray-800 dark:text-white/90">
                               New Signal:
                             </span>
                             <span className={`font-bold ${isBuy ? "text-green-500" : "text-red-500"}`}>
                               {item.signal_type}
                             </span>
                           </>
                        )}
                        <span className="font-medium text-gray-800 dark:text-white/90 ml-1">
                          {item.symbol}
                        </span>
                      </span>

                      <span className="flex items-center justify-between w-full gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                        <span className="truncate max-w-[140px]">
                          {isSignal ? `Confidence: ${item.strength}%` : item.signal_type}
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                           <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                           <span>{getTimeAgo(item.created_at)}</span>
                        </span>
                      </span>
                    </span>
                  </DropdownItem>
                </li>
              );
            })
          )}
        </ul> 
      </Dropdown>
    </div>
  );
}