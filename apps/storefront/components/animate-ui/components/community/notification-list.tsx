'use client';

import * as React from 'react';
import { RotateCcw, ArrowUpRight } from 'lucide-react';
import { motion, type Transition } from 'motion/react';

const notifications = [
  {
    id: 1,
    type: "warning",
    title: "Order Past Due for Shipment",
    content: "Order #9825 from Marcus Chen is past the expected shipping date",
    timestamp: "10 min ago",
    unread: true,
  },
  {
    id: 2,
    type: "warning",
    title: "Order Past Due for Shipment",
    content: "Order #9820 from Sofia Rodriguez is past the expected shipping date",
    timestamp: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    type: "delay",
    title: "Delivery Delay Reported",
    content: "Order #9815 shipment is experiencing delays · Carrier: UPS",
    timestamp: "2 hours ago",
    unread: false,
  },
  {
    id: 4,
    type: "delay",
    title: "Delivery Delay Reported",
    content: "Order #9810 shipment is experiencing delays · Carrier: USPS",
    timestamp: "3 hours ago",
    unread: false,
  },
    {
    id: 2,
    type: "warning",
    title: "Order Past Due for Shipment",
    content: "Order #9820 from Sofia Rodriguez is past the expected shipping date",
    timestamp: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    type: "delay",
    title: "Delivery Delay Reported",
    content: "Order #9815 shipment is experiencing delays · Carrier: UPS",
    timestamp: "2 hours ago",
    unread: false,
  },
  {
    id: 4,
    type: "delay",
    title: "Delivery Delay Reported",
    content: "Order #9810 shipment is experiencing delays · Carrier: USPS",
    timestamp: "3 hours ago",
    unread: false,
  },

   {
    id: 2,
    type: "warning",
    title: "Order Past Due for Shipment",
    content: "Order #9820 from Sofia Rodriguez is past the expected shipping date",
    timestamp: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    type: "delay",
    title: "Delivery Delay Reported",
    content: "Order #9815 shipment is experiencing delays · Carrier: UPS",
    timestamp: "2 hours ago",
    unread: false,
  },
  {
    id: 4,
    type: "delay",
    title: "Delivery Delay Reported",
    content: "Order #9810 shipment is experiencing delays · Carrier: USPS",
    timestamp: "3 hours ago",
    unread: false,
  },
    {
    id: 2,
    type: "warning",
    title: "Order Past Due for Shipment",
    content: "Order #9820 from Sofia Rodriguez is past the expected shipping date",
    timestamp: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    type: "delay",
    title: "Delivery Delay Reported",
    content: "Order #9815 shipment is experiencing delays · Carrier: UPS",
    timestamp: "2 hours ago",
    unread: false,
  },
  {
    id: 4,
    type: "delay",
    title: "Delivery Delay Reported",
    content: "Order #9810 shipment is experiencing delays · Carrier: USPS",
    timestamp: "3 hours ago",
    unread: false,
  },
  
];

const transition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 26,
};

const getCardVariants = (i: number) => ({
  collapsed: {
    marginTop: i === 0 ? 0 : -44,
    scaleX: 1 - i * 0.05,
  },
  expanded: {
    marginTop: i === 0 ? 0 : 4,
    scaleX: 1,
  },
});

const textSwitchTransition: Transition = {
  duration: 0.22,
  ease: 'easeInOut',
};

const notificationTextVariants = {
  collapsed: { opacity: 1, y: 0, pointerEvents: 'auto' },
  expanded: { opacity: 0, y: -16, pointerEvents: 'none' },
};

const viewAllTextVariants = {
  collapsed: { opacity: 0, y: 16, pointerEvents: 'none' },
  expanded: { opacity: 1, y: 0, pointerEvents: 'auto' },
};

export default function NotificationList() {
  return (
    <motion.div
      className="bg-neutral-200 dark:bg-neutral-900 p-3 rounded-3xl w-80 space-y-3 shadow-md"
      initial="collapsed"
      whileHover="expanded"
    >
      <div>
        {notifications.map((notification, i) => (
          <motion.div
            key={notification.id}
            className={`rounded-xl px-4 py-2 shadow-sm hover:shadow-lg transition-shadow duration-200 relative
              ${notification.unread ? "bg-yellow-100 dark:bg-yellow-800" : "bg-neutral-100 dark:bg-neutral-800"}`}
            variants={getCardVariants(i)}
            transition={transition}
            style={{ zIndex: notifications.length - i }}
          >
            <div className="flex justify-between items-center">
              <h1 className="text-sm font-medium">{notification.title}</h1>
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-300 mt-1">
              {notification.content}
            </div>
            <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              {notification.timestamp}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-2">
        <div className="w-5 h-5 rounded-full bg-neutral-400 text-card text-xs flex items-center justify-center font-medium">
          {notifications.length}
        </div>
        <span className="grid">
          <motion.span
            className="text-sm font-medium text-neutral-600 dark:text-neutral-300 row-start-1 col-start-1"
            variants={notificationTextVariants}
            transition={textSwitchTransition}
          >
            Notifications
          </motion.span>
          <motion.span
            className="text-sm font-medium text-neutral-600 dark:text-neutral-300 flex items-center gap-1 cursor-pointer select-none row-start-1 col-start-1"
            variants={viewAllTextVariants}
            transition={textSwitchTransition}
          >
            View all <ArrowUpRight className="w-4 h-4" />
          </motion.span>
        </span>
      </div>
    </motion.div>
  );
}
