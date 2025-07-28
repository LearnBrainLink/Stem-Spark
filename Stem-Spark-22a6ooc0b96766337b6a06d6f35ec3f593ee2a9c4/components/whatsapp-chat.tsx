'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip, 
  Smile, 
  Mic,
  ArrowLeft,
  Edit,
  Trash2,
  Forward,
  Reply,
  Copy,
  Star,
  Info,
  UserPlus,
  Settings,
  Check,
  CheckCheck,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useChatStore } from '@/lib/store/chat-store';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import { useInView } from 'react-intersection-observer';

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '😡'];

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
  showSender: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onForward: () => void;
  onCopy: () => void;
  onReact: (emoji: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showSender,
  isSelected,
  onSelect,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onCopy,
  onReact
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getMessageStatus = () => {
    if (message.id.startsWith('temp-')) return <Clock className="w-3 h-3 text-gray-400" />;
    if (message.seen_by?.length > 1) return <CheckCheck className="w-3 h-3 text-blue-500" />;
    return <Check className="w-3 h-3 text-gray-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-2 group relative',
        isOwn ? 'flex-row-reverse' : 'flex-row',
        isSelected && 'bg-blue-50 rounded-lg p-1'
      )}
      onClick={() => onSelect()}
    >
      {!isOwn && showSender && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={message.sender?.avatar_url} />
          <AvatarFallback>
            {message.sender?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn('flex flex-col max-w-[70%]', isOwn ? 'items-end' : 'items-start')}>
        {message.reply_message && (
          <div className={cn(
            'mb-1 p-2 rounded-md border-l-4 text-xs bg-gray-50',
            isOwn ? 'border-l-blue-500' : 'border-l-green-500'
          )}>
            <div className="font-medium text-gray-600">
              {message.reply_message.sender?.full_name}
            </div>
            <div className="text-gray-500 line-clamp-1">
              {message.reply_message.content}
            </div>
          </div>
        )}

        <div
          className={cn(
            'relative rounded-2xl px-3 py-2 max-w-full break-words',
            isOwn 
              ? 'bg-blue-500 text-white rounded-br-md' 
              : 'bg-white text-gray-900 rounded-bl-md shadow-sm border'
          )}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowMenu(true);
          }}
        >
          {!isOwn && showSender && (
            <div className="text-xs font-medium mb-1 text-gray-600">
              {message.sender?.full_name}
            </div>
          )}

          {message.message_type === 'forwarded' && (
            <div className="text-xs italic mb-1 opacity-75">
              📤 Forwarded
            </div>
          )}

          <div className="whitespace-pre-wrap">{message.content}</div>

          {message.edited && (
            <span className="text-xs opacity-60 ml-1">(edited)</span>
          )}

          <div className={cn(
            'flex items-center gap-1 mt-1 text-xs',
            isOwn ? 'text-blue-100' : 'text-gray-500'
          )}>
            <span>{dayjs(message.created_at).format('HH:mm')}</span>
            {isOwn && getMessageStatus()}
          </div>

          {/* Reactions */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(message.reactions).map(([emoji, users]) => (
                <button
                  key={emoji}
                  onClick={() => onReact(emoji)}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-xs hover:bg-gray-200"
                >
                  <span>{emoji}</span>
                  <span>{(users as string[]).length}</span>
                </button>
              ))}
            </div>
          )}

          {/* Quick reactions on hover */}
          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn(
                  'absolute flex gap-1 p-1 bg-white rounded-full shadow-lg border z-10',
                  isOwn ? 'bottom-full right-0 mb-1' : 'bottom-full left-0 mb-1'
                )}
              >
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact(emoji);
                      setShowReactions(false);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="absolute top-0 -right-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onReply}>
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onForward}>
                  <Forward className="h-4 w-4 mr-2" />
                  Forward
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowReactions(true)}>
                  <Smile className="h-4 w-4 mr-2" />
                  React
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isOwn && (
                  <>
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface TypingIndicatorProps {
  users: any[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users }) => {
  if (users.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2 px-4 py-2"
    >
      <div className="flex gap-1">
        {users.slice(0, 3).map((user) => (
          <Avatar key={user.user_id} className="w-6 h-6">
            <AvatarImage src={user.user.avatar_url} />
            <AvatarFallback className="text-xs">
              {user.user.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="text-sm text-gray-500">
        {users.length === 1 
          ? `${users[0].user.full_name} is typing...`
          : `${users.length} people are typing...`
        }
      </div>
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              delay: i * 0.2 
            }}
            className="w-1 h-1 bg-gray-400 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
};

export default function WhatsAppChat() {
  const {
    currentUser,
    chats,
    selectedChat,
    selectedChatId,
    messages,
    loadingMessages,
    typingUsers,
    editingMessage,
    replyingTo,
    searchQuery,
    filteredChats,
    selectedMessages,
    
    // Actions
    loadChats,
    selectChat,
    loadMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    forwardMessage,
    markMessageSeen,
    reactToMessage,
    setEditingMessage,
    setReplyingTo,
    setForwardingMessage,
    toggleMessageSelection,
    clearSelectedMessages,
    updateTypingStatus,
    setSearchQuery,
    setupRealtimeSubscriptions,
    cleanupSubscriptions,
    getChatName,
    getChatAvatar,
    getLastMessage,
    isUserOnline,
    getLastSeen,
  } = useChatStore();

  const [messageInput, setMessageInput] = useState('');
  const [editInput, setEditInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Intersection observer for auto-scroll
  const { ref: scrollRef, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadChats();
      setupRealtimeSubscriptions();
    }

    return () => {
      cleanupSubscriptions();
    };
  }, [currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages[selectedChatId || '']]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChatId) return;

    await sendMessage(selectedChatId, messageInput.trim());
    setMessageInput('');
    setIsTyping(false);
    if (selectedChatId) {
      await updateTypingStatus(selectedChatId, false);
    }
  };

  const handleTyping = (value: string) => {
    setMessageInput(value);

    if (!selectedChatId) return;

    // Start typing
    if (!isTyping) {
      setIsTyping(true);
      updateTypingStatus(selectedChatId, true);
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (selectedChatId) {
        updateTypingStatus(selectedChatId, false);
      }
    }, 2000);
  };

  const handleEditMessage = async () => {
    if (!editingMessage || !editInput.trim()) return;

    await editMessage(editingMessage, editInput.trim());
    setEditInput('');
    setEditingMessage(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingMessage) {
        handleEditMessage();
      } else {
        handleSendMessage();
      }
    }
  };

  const currentMessages = selectedChatId ? messages[selectedChatId] || [] : [];
  const currentTypingUsers = typingUsers.filter(u => u.chat_id === selectedChatId);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Chat List */}
      <div className={cn(
        'bg-white border-r border-gray-200 flex flex-col',
        isMobile && selectedChatId ? 'hidden' : 'w-full md:w-80'
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Chats</h1>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <UserPlus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredChats.map((chat) => {
              const lastMessage = getLastMessage(chat);
              const isOnline = !chat.is_group && chat.participant_details?.some(p => 
                p.id !== currentUser?.id && isUserOnline(p.id)
              );

              return (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                    selectedChatId === chat.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                  )}
                  onClick={() => selectChat(chat.id)}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={getChatAvatar(chat)} />
                      <AvatarFallback>
                        {getChatName(chat).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {getChatName(chat)}
                      </h3>
                      {lastMessage && (
                        <span className="text-xs text-gray-500">
                          {dayjs(lastMessage.created_at).format('HH:mm')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {lastMessage?.content || 'No messages yet'}
                      </p>
                      {chat.unread_count && chat.unread_count > 0 && (
                        <Badge variant="default" className="bg-green-500 text-xs">
                          {chat.unread_count}
                        </Badge>
                      )}
                    </div>

                    {chat.is_announcement && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        📢 Announcement
                      </Badge>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => selectChat('')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}

              <Avatar className="w-10 h-10">
                <AvatarImage src={getChatAvatar(selectedChat)} />
                <AvatarFallback>
                  {getChatName(selectedChat).charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h2 className="font-medium text-gray-900">
                  {getChatName(selectedChat)}
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedChat.is_group 
                    ? `${selectedChat.participants.length} members`
                    : isUserOnline(selectedChat.participants.find(id => id !== currentUser?.id) || '')
                      ? 'Online'
                      : getLastSeen(selectedChat.participants.find(id => id !== currentUser?.id) || '')
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowChatInfo(true)}>
                    <Info className="h-4 w-4 mr-2" />
                    Chat Info
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Search className="h-4 w-4 mr-2" />
                    Search Messages
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {loadingMessages[selectedChatId] ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <MessageCircle className="h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                  <p className="text-center">Send a message to start the conversation</p>
                </div>
              ) : (
                currentMessages.map((message, index) => {
                  const isOwn = message.sender_id === currentUser?.id;
                  const showSender = !isOwn && (
                    index === 0 || 
                    currentMessages[index - 1].sender_id !== message.sender_id
                  );

                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={isOwn}
                      showSender={showSender}
                      isSelected={selectedMessages.includes(message.id)}
                      onSelect={() => toggleMessageSelection(message.id)}
                      onReply={() => setReplyingTo(message)}
                      onEdit={() => {
                        if (isOwn) {
                          setEditingMessage(message.id);
                          setEditInput(message.content);
                        }
                      }}
                      onDelete={() => isOwn && deleteMessage(message.id)}
                      onForward={() => setForwardingMessage(message)}
                      onCopy={() => navigator.clipboard.writeText(message.content)}
                      onReact={(emoji) => reactToMessage(message.id, emoji)}
                    />
                  );
                })
              )}

              {/* Typing Indicator */}
              <AnimatePresence>
                {currentTypingUsers.length > 0 && (
                  <TypingIndicator users={currentTypingUsers} />
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Reply Preview */}
          <AnimatePresence>
            {replyingTo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-blue-50 border-t border-blue-200 p-3 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="text-xs font-medium text-blue-600">
                    Replying to {replyingTo.sender?.full_name}
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {replyingTo.content}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                >
                  ✕
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-end gap-2">
              <Button variant="ghost" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>

              <div className="flex-1">
                {editingMessage ? (
                  <div className="space-y-2">
                    <div className="text-xs text-blue-600 font-medium">
                      Editing message
                    </div>
                    <Textarea
                      value={editInput}
                      onChange={(e) => setEditInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Edit your message..."
                      className="min-h-[40px] resize-none"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleEditMessage}>
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingMessage(null);
                          setEditInput('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Textarea
                    value={messageInput}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="min-h-[40px] resize-none"
                  />
                )}
              </div>

              <Button variant="ghost" size="sm">
                <Smile className="h-4 w-4" />
              </Button>

              {messageInput.trim() ? (
                <Button onClick={handleSendMessage} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="ghost" size="sm">
                  <Mic className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              Welcome to NovaKinetix Chat
            </h2>
            <p className="text-gray-600">
              Select a chat to start messaging
            </p>
          </div>
        </div>
      )}

      {/* Chat Info Dialog */}
      <Dialog open={showChatInfo} onOpenChange={setShowChatInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chat Information</DialogTitle>
          </DialogHeader>
          {selectedChat && (
            <div className="space-y-4">
              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={getChatAvatar(selectedChat)} />
                  <AvatarFallback className="text-2xl">
                    {getChatName(selectedChat).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-medium text-lg">
                  {getChatName(selectedChat)}
                </h3>
                <p className="text-gray-600">
                  {selectedChat.is_group 
                    ? `Group • ${selectedChat.participants.length} members`
                    : 'Direct message'
                  }
                </p>
              </div>

              {selectedChat.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{selectedChat.description}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Participants</h4>
                <div className="space-y-2">
                  {selectedChat.participant_details?.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={participant.avatar_url} />
                        <AvatarFallback>
                          {participant.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {participant.full_name || participant.username || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {isUserOnline(participant.id) ? 'Online' : getLastSeen(participant.id)}
                        </div>
                      </div>
                      {participant.role === 'admin' && (
                        <Badge variant="secondary" className="text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 