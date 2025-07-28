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
  Clock,
  MessageCircle
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
    >
      {!isOwn && showSender && (
        <Avatar className="w-6 h-6">
          <AvatarImage src={message.sender?.avatar_url} />
          <AvatarFallback>
            {message.sender?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn(
        'flex flex-col max-w-[70%]',
        isOwn ? 'items-end' : 'items-start'
      )}>
        {!isOwn && showSender && (
          <span className="text-xs text-gray-500 mb-1">
            {message.sender?.full_name || 'Unknown User'}
          </span>
        )}

        <div className={cn(
          'relative group',
          isOwn ? 'flex flex-col items-end' : 'flex flex-col items-start'
        )}>
          <div
            className={cn(
              'px-3 py-2 rounded-lg text-sm relative',
              isOwn
                ? 'bg-blue-500 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-900 rounded-bl-md'
            )}
            onContextMenu={(e) => {
              e.preventDefault();
              onSelect();
            }}
          >
            {message.reply_to && (
              <div className={cn(
                'text-xs opacity-70 mb-1 p-1 rounded',
                isOwn ? 'bg-blue-400' : 'bg-gray-200'
              )}>
                Replying to: {message.reply_message?.content || 'Message not found'}
              </div>
            )}

            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>

            {message.edited && (
              <span className="text-xs opacity-70 ml-1">(edited)</span>
            )}

            <div className={cn(
              'flex items-center gap-1 mt-1 text-xs',
              isOwn ? 'justify-end' : 'justify-start'
            )}>
              {getMessageStatus()}
              <span className="opacity-70">
                {dayjs(message.created_at).format('HH:mm')}
              </span>
            </div>
          </div>

          {/* Message Actions */}
          <div className={cn(
            'absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity',
            isOwn ? '-left-20' : '-right-20'
          )}>
            <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                <DropdownMenuItem onClick={onReply}>
                  <Reply className="w-4 h-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onForward}>
                  <Forward className="w-4 h-4 mr-2" />
                  Forward
                </DropdownMenuItem>
                {isOwn && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Reactions */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="flex gap-1 mt-1">
              {Object.entries(message.reactions).map(([emoji, users]) => (
                <Badge key={emoji} variant="secondary" className="text-xs">
                  {emoji} {(users as string[]).length}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reaction Picker */}
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white border rounded-lg shadow-lg p-2"
          >
            <div className="flex gap-1">
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(emoji);
                    setShowReactions(false);
                  }}
                  className="hover:bg-gray-100 p-1 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500"
    >
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
      <span>
        {users.length === 1
          ? `${users[0].user?.full_name || 'Someone'} is typing...`
          : `${users.length} people are typing...`}
      </span>
    </motion.div>
  );
};

export default function WhatsAppChat() {
  const {
    currentUser,
    channels,
    selectedChannel,
    selectedChannelId,
    messages,
    loadingMessages,
    typingUsers,
    editingMessage,
    replyingTo,
    forwardingMessage,
    selectedMessages,
    loadChannels,
    selectChannel,
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
    setupRealtimeSubscriptions,
    cleanupSubscriptions
  } = useChatStore();

  const [messageInput, setMessageInput] = useState('');
  const [editInput, setEditInput] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showChannelList, setShowChannelList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [selectedChannelsForForward, setSelectedChannelsForForward] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [ref, inView] = useInView();

  // Responsive design
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load channels on mount
  useEffect(() => {
    if (currentUser) {
      loadChannels();
      setupRealtimeSubscriptions();
    }

    return () => {
      cleanupSubscriptions();
    };
  }, [currentUser, loadChannels, setupRealtimeSubscriptions, cleanupSubscriptions]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChannelId]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChannelId) return;

    await sendMessage(selectedChannelId, messageInput);
    setMessageInput('');
    updateTypingStatus(selectedChannelId, false);
  };

  // Handle typing
  const handleTyping = (value: string) => {
    setMessageInput(value);
    if (selectedChannelId) {
      updateTypingStatus(selectedChannelId, value.length > 0);
    }
  };

  // Handle editing message
  const handleEditMessage = async () => {
    if (!editInput.trim() || !editingMessage) return;

    await editMessage(editingMessage, editInput);
    setEditInput('');
    setEditingMessage(null);
  };

  // Handle key press
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

  // Handle message actions
  const handleMessageAction = (action: string, message: any) => {
    switch (action) {
      case 'reply':
        setReplyingTo(message);
        break;
      case 'edit':
        setEditingMessage(message.id);
        setEditInput(message.content);
        break;
      case 'delete':
        deleteMessage(message.id, true);
        break;
      case 'forward':
        setForwardingMessage(message);
        setShowForwardDialog(true);
        break;
      case 'copy':
        navigator.clipboard.writeText(message.content);
        break;
      case 'react':
        reactToMessage(message.id, '👍');
        break;
    }
  };

  // Handle forward message
  const handleForwardMessage = async () => {
    if (!forwardingMessage || selectedChannelsForForward.length === 0) return;

    await forwardMessage(forwardingMessage.id, selectedChannelsForForward);
    setForwardingMessage(null);
    setSelectedChannelsForForward([]);
    setShowForwardDialog(false);
  };

  // Mark messages as seen when they come into view
  useEffect(() => {
    if (inView && selectedChannelId) {
      const channelMessages = messages[selectedChannelId] || [];
      channelMessages.forEach(message => {
        if (message.sender_id !== currentUser?.id) {
          markMessageSeen(message.id);
        }
      });
    }
  }, [inView, selectedChannelId, messages, currentUser, markMessageSeen]);

  const currentMessages = messages[selectedChannelId || ''] || [];
  const isLoading = loadingMessages[selectedChannelId || ''];

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Please log in to access the chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Channel List */}
      <div className={cn(
        'w-full md:w-80 bg-white border-r border-gray-200 flex flex-col',
        isMobile && !showChannelList && 'hidden'
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Channels</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChannelList(false)}
              className="md:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-3">
            <Input
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Channel List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {channels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => {
                  selectChannel(channel.id);
                  if (isMobile) setShowChannelList(false);
                }}
                className={cn(
                  'p-3 rounded-lg cursor-pointer transition-colors',
                  selectedChannelId === channel.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {channel.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {channel.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {channel.description || 'No description'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className={cn(
        'flex-1 flex flex-col',
        isMobile && showChannelList && 'hidden'
      )}>
        {selectedChannel ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChannelList(true)}
                    className="md:hidden"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedChannel.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedChannel.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedChannel.description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                  </div>
                ) : (
                  <>
                    {currentMessages.map((message, index) => {
                      const isOwn = message.sender_id === currentUser.id;
                      const showSender = index === 0 || 
                        currentMessages[index - 1]?.sender_id !== message.sender_id;

                      return (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isOwn={isOwn}
                          showSender={showSender}
                          isSelected={selectedMessages.includes(message.id)}
                          onSelect={() => toggleMessageSelection(message.id)}
                          onReply={() => handleMessageAction('reply', message)}
                          onEdit={() => handleMessageAction('edit', message)}
                          onDelete={() => handleMessageAction('delete', message)}
                          onForward={() => handleMessageAction('forward', message)}
                          onCopy={() => handleMessageAction('copy', message)}
                          onReact={(emoji) => reactToMessage(message.id, emoji)}
                        />
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </ScrollArea>

            {/* Typing Indicator */}
            <TypingIndicator users={typingUsers} />

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {replyingTo && (
                <div className="mb-2 p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Replying to: {replyingTo.content}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(null)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}

              {editingMessage ? (
                <div className="flex gap-2">
                  <Textarea
                    ref={inputRef}
                    value={editInput}
                    onChange={(e) => setEditInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Edit message..."
                    className="flex-1"
                    rows={1}
                  />
                  <Button onClick={handleEditMessage}>Save</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingMessage(null);
                      setEditInput('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Textarea
                      ref={inputRef}
                      value={messageInput}
                      onChange={(e) => handleTyping(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="pr-12"
                      rows={1}
                    />
                    <div className="absolute right-2 top-2 flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a channel to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Forward Dialog */}
      <Dialog open={showForwardDialog} onOpenChange={setShowForwardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forward Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Select channels to forward to:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {channels.map((channel) => (
                  <label key={channel.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedChannelsForForward.includes(channel.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedChannelsForForward([...selectedChannelsForForward, channel.id]);
                        } else {
                          setSelectedChannelsForForward(
                            selectedChannelsForForward.filter(id => id !== channel.id)
                          );
                        }
                      }}
                    />
                    <span>{channel.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowForwardDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleForwardMessage}
                disabled={selectedChannelsForForward.length === 0}
              >
                Forward
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 