import { ConversationDetail, ConversationListItem } from "@/types/inbox";

export const conversationList: ConversationListItem[] = [
  {
    id: "conv-1",
    preview: "When will my order be shipped?",
    orderId: "Order #9830",
    lastMessageTime: "10:35 AM",
    isReadCount: 2,
    user: {
      name: "Jasmin Riad",
      email: "jasmin.reed@gmail.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasmin",
    },
  },
  {
    id: "conv-2",
    preview: "Can I change my shipping address?",
    orderId: "Order #7621",
    lastMessageTime: "11:15 AM",
    isReadCount: 0,
    user: {
      name: "Liam Chen",
      email: "liam.chen@gmail.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam",
    },
  },
  {
    id: "conv-3",
    preview: "What is the return policy?",
    orderId: "Order #5492",
    lastMessageTime: "Yesterday",
    isReadCount: 1,
    user: {
      name: "Ava Patel",
      email: "ava.patel@gmail.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ava",
    },
  },
  {
    id: "conv-4",
    preview: "How can I track my order?",
    orderId: "Order #8354",
    lastMessageTime: "2:45 PM",
    isReadCount: 0,
    user: {
      name: "Noah Kim",
      email: "noah.kim@gmail.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Noah",
    },
  },
  {
    id: "conv-5",
    preview: "Is there a warranty on my purchase?",
    orderId: "Order #6128",
    lastMessageTime: "3:30 PM",
    isReadCount: 1,
    user: {
      name: "Sophia Brown",
      email: "sophia.brown@gmail.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
    },
  },
  {
    id: "conv-6",
    preview: "Can I get a refund for my order?",
    orderId: "Order #4517",
    lastMessageTime: "Jan 28",
    isReadCount: 0,
    user: {
      name: "Emma Davis",
      email: "emma.davis@gmail.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    },
  },
  {
    id: "conv-7",
    preview: "The product arrived damaged",
    orderId: "Order #3298",
    lastMessageTime: "Jan 27",
    isReadCount: 0,
    user: {
      name: "Oliver Martinez",
      email: "oliver.martinez@gmail.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver",
    },
  },
  {
    id: "conv-8",
    preview: "Do you ship internationally?",
    orderId: "Order #2156",
    lastMessageTime: "Jan 26",
    isReadCount: 0,
    user: {
      name: "Isabella Garcia",
      email: "isabella.garcia@gmail.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella",
    },
  },
  {
    id: "conv-9",
    preview: "Can I modify my order before it ships?",
    orderId: "Order #1984",
    lastMessageTime: "Jan 25",
    isReadCount: 3,
    user: {
      name: "Lucas Anderson",
      email: "lucas.anderson@gmail.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
    },
  },
  {
    id: "conv-10",
    preview: "What payment methods do you accept?",
    orderId: "Order #7743",
    lastMessageTime: "Jan 24",
    isReadCount: 0,
    user: {
      name: "Mia Thompson",
      email: "mia.thompson@gmail.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia",
    },
  },
];

// Mock Data - Conversation Details
export const conversationDetails: ConversationDetail[] = [
  {
    id: "conv-1",
    messages: [
      {
        sender: "customer",
        message: "Hi! I have a question about my order.",
        time: "10:30 AM",
      },
      {
        sender: "user",
        message: "Hello! I'd be happy to help 😊 What would you like to know?",
        time: "10:31 AM",
      },
      {
        sender: "customer",
        message: "When will my order be shipped?",
        time: "10:35 AM",
      },
      {
        sender: "user",
        message:
          "Thanks for checking! Let me look up your order details. Could you please share your order ID?",
        time: "10:36 AM",
      },
      {
        sender: "customer",
        message: "Sure, the order ID is ORD-2024-010.",
        time: "10:38 AM",
      },
      {
        sender: "user",
        message:
          "Got it 👍 Your order is currently being prepared and is scheduled to ship within the next 24 hours.",
        time: "10:40 AM",
      },
      {
        sender: "customer",
        message: "Great! Will I receive a tracking number?",
        time: "10:42 AM",
      },
      {
        sender: "user",
        message:
          "Yes, absolutely. Once the order is shipped, you’ll receive an email with the tracking number and a link to track it in real time.",
        time: "10:43 AM",
      },
      {
        sender: "customer",
        message: "Perfect, thanks for the quick help!",
        time: "10:44 AM",
      },
      {
        sender: "user",
        message:
          "You’re very welcome! 😊 If you need anything else, feel free to reach out anytime.",
        time: "10:45 AM",
      },
    ],
  },

  {
    id: "conv-2",
    messages: [
      {
        sender: "customer",
        message: "Can I change my shipping address?",
        time: "11:10 AM",
      },
      {
        sender: "user",
        message:
          "Yes, I can help you with that 🙂 May I have your order ID first?",
        time: "11:11 AM",
      },
      {
        sender: "customer",
        message: "The order ID is ORD-2024-011.",
        time: "11:12 AM",
      },
      {
        sender: "user",
        message:
          "Thank you! I see that your order hasn’t shipped yet, so we can update the address.",
        time: "11:13 AM",
      },
      {
        sender: "customer",
        message:
          "Great! The new address is 123 Main Street, Apt 4B, New York, NY 10001.",
        time: "11:15 AM",
      },
      {
        sender: "user",
        message:
          "Thanks for sharing the new address. Please confirm that everything looks correct before I update it.",
        time: "11:16 AM",
      },
      {
        sender: "customer",
        message: "Yes, that address is correct.",
        time: "11:17 AM",
      },
      {
        sender: "user",
        message:
          "All set ✅ Your shipping address has been successfully updated.",
        time: "11:18 AM",
      },
      {
        sender: "customer",
        message: "Awesome, thanks a lot!",
        time: "11:19 AM",
      },
      {
        sender: "user",
        message:
          "Happy to help! 😊 Let me know if you have any other questions.",
        time: "11:20 AM",
      },
    ],
  },
  {
    id: "conv-3",
    messages: [
      {
        sender: "customer",
        message: "What is the return policy?",
        time: "Yesterday",
      },
      {
        sender: "user",
        message:
          "We offer a 30-day return policy for most items. Would you like me to send you the detailed policy?",
        time: "Yesterday",
      },
      {
        sender: "customer",
        message: "Yes, please send me the details.",
        time: "Yesterday",
      },
    ],
  },
  {
    id: "conv-4",
    messages: [
      {
        sender: "customer",
        message: "How can I track my order?",
        time: "2:45 PM",
      },
      {
        sender: "user",
        message:
          "I'll send you the tracking link right away. You can also find it in your order confirmation email.",
        time: "2:46 PM",
      },
    ],
  },
  {
    id: "conv-5",
    messages: [
      {
        sender: "customer",
        message: "Is there a warranty on my purchase?",
        time: "3:30 PM",
      },
      {
        sender: "user",
        message:
          "Yes! All our products come with a 1-year manufacturer warranty. Some items have extended warranty options available.",
        time: "3:32 PM",
      },
      {
        sender: "customer",
        message: "Great! How do I activate the warranty?",
        time: "3:33 PM",
      },
    ],
  },
  {
    id: "conv-6",
    messages: [
      {
        sender: "customer",
        message: "Can I get a refund for my order?",
        time: "Jan 28, 10:15 AM",
      },
      {
        sender: "user",
        message:
          "I'm sorry to hear you're not satisfied. Can you tell me more about the issue?",
        time: "Jan 28, 10:20 AM",
      },
      {
        sender: "customer",
        message: "The product doesn't match the description on the website.",
        time: "Jan 28, 10:25 AM",
      },
      {
        sender: "user",
        message:
          "I understand. I'll process a full refund for you right away. You should see it in 3-5 business days.",
        time: "Jan 28, 10:30 AM",
      },
    ],
  },
  {
    id: "conv-7",
    messages: [
      {
        sender: "customer",
        message: "The product arrived damaged",
        time: "Jan 27, 2:00 PM",
      },
      {
        sender: "user",
        message:
          "I'm very sorry about that! Can you send me photos of the damage?",
        time: "Jan 27, 2:05 PM",
      },
      {
        sender: "customer",
        message: "Sure, I'll send them now.",
        time: "Jan 27, 2:10 PM",
      },
      {
        sender: "user",
        message:
          "Thank you. I'll arrange for a replacement to be sent immediately at no extra cost.",
        time: "Jan 27, 2:15 PM",
      },
    ],
  },
  {
    id: "conv-8",
    messages: [
      {
        sender: "customer",
        message: "Do you ship internationally?",
        time: "Jan 26, 9:00 AM",
      },
      {
        sender: "user",
        message:
          "Yes, we ship to over 50 countries worldwide. Where are you located?",
        time: "Jan 26, 9:05 AM",
      },
      {
        sender: "customer",
        message: "I'm in Australia.",
        time: "Jan 26, 9:10 AM",
      },
      {
        sender: "user",
        message:
          "Perfect! We do ship to Australia. Shipping takes 7-14 business days and costs $15 USD.",
        time: "Jan 26, 9:15 AM",
      },
    ],
  },
  {
    id: "conv-9",
    messages: [
      {
        sender: "customer",
        message: "Can I modify my order before it ships?",
        time: "Jan 25, 3:00 PM",
      },
      {
        sender: "user",
        message:
          "Let me check the status of your order. What would you like to change?",
        time: "Jan 25, 3:05 PM",
      },
      {
        sender: "customer",
        message: "I want to add another item to my order.",
        time: "Jan 25, 3:10 PM",
      },
      {
        sender: "user",
        message: "I can help with that. Which item would you like to add?",
        time: "Jan 25, 3:15 PM",
      },
    ],
  },
  {
    id: "conv-10",
    messages: [
      {
        sender: "customer",
        message: "What payment methods do you accept?",
        time: "Jan 24, 11:00 AM",
      },
      {
        sender: "user",
        message:
          "We accept all major credit cards, PayPal, Apple Pay, and Google Pay. All transactions are secure and encrypted.",
        time: "Jan 24, 11:05 AM",
      },
      {
        sender: "customer",
        message: "Great, thank you!",
        time: "Jan 24, 11:10 AM",
      },
      {
        sender: "user",
        message: "You're welcome! Let me know if you have any other questions.",
        time: "Jan 24, 11:15 AM",
      },
    ],
  },
];
