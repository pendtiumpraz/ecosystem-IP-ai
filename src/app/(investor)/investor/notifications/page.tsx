"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bell, Check, Trash2, DollarSign, TrendingUp, AlertCircle,
  CheckCircle, Clock
} from "lucide-react";

const NOTIFICATIONS = [
  { 
    id: 1, 
    type: "return", 
    title: "Return Received", 
    message: "You received Rp 2,500,000 return from Project Beta",
    time: "2 hours ago",
    read: false
  },
  { 
    id: 2, 
    type: "update", 
    title: "Project Update", 
    message: "Project Alpha has reached 75% production milestone",
    time: "1 day ago",
    read: false
  },
  { 
    id: 3, 
    type: "alert", 
    title: "Action Required", 
    message: "Please complete KYC verification to continue investing",
    time: "2 days ago",
    read: true
  },
  { 
    id: 4, 
    type: "success", 
    title: "Investment Confirmed", 
    message: "Your investment in Project Gamma has been confirmed",
    time: "1 week ago",
    read: true
  },
];

export default function InvestorNotificationsPage() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  function markAllRead() {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  }

  function getIcon(type: string) {
    switch (type) {
      case "return": return <DollarSign className="w-5 h-5 text-green-600" />;
      case "update": return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case "alert": return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case "success": return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  }

  function getBg(type: string) {
    switch (type) {
      case "return": return "bg-green-100";
      case "update": return "bg-blue-100";
      case "alert": return "bg-orange-100";
      case "success": return "bg-green-100";
      default: return "bg-gray-100";
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-green-600" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 text-sm rounded-full bg-red-500 text-white">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-500">Stay updated on your investments</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllRead}>
            <Check className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 flex items-start gap-4 ${!notif.read ? "bg-green-50/50" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getBg(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{notif.title}</h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {notif.time}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

