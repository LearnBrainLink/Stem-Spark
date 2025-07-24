"use client"

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MessageSquare, Plus, ThumbsUp, MessageCircle, Share, Flag, Edit, Trash2, User, Clock, Hash } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  ThumbsDown, 
  Pin, 
  Lock, 
  TrendingUp,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import type { Database } from '@/lib/database.types'

type DiscussionBoard = Database['public']['Tables']['discussion_boards']['Row']
type DiscussionPost = Database['public']['Tables']['discussion_posts']['Row']
type DiscussionComment = Database['public']['Tables']['discussion_comments']['Row']

interface ExtendedPost extends DiscussionPost {
  author: {
    full_name: string
    role: string
    avatar_url?: string
  }
  comment_count: number
}

interface ExtendedComment extends DiscussionComment {
  author: {
    full_name: string
    role: string
    avatar_url?: string
  }
  replies?: ExtendedComment[]
}

export default function DiscussionBoard() {
  const [boards, setBoards] = useState<DiscussionBoard[]>([])
  const [posts, setPosts] = useState<ExtendedPost[]>([])
  const [comments, setComments] = useState<ExtendedComment[]>([])
  const [selectedBoard, setSelectedBoard] = useState<DiscussionBoard | null>(null)
  const [selectedPost, setSelectedPost] = useState<ExtendedPost | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateBoard, setShowCreateBoard] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newBoardData, setNewBoardData] = useState({ title: '', description: '', category: 'general' })
  const [newPostData, setNewPostData] = useState({ title: '', content: '' })
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    checkAuth()
    loadBoards()
  }, [])

  useEffect(() => {
    if (selectedBoard) {
      loadPosts(selectedBoard.id)
    }
  }, [selectedBoard])

  useEffect(() => {
    if (selectedPost) {
      loadComments(selectedPost.id)
    }
  }, [selectedPost])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setUserProfile(profile)
    }
    setIsLoading(false)
  }

  const loadBoards = async () => {
    const { data: boards } = await supabase
      .from('discussion_boards')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (boards) {
      setBoards(boards)
      if (boards.length > 0 && !selectedBoard) {
        setSelectedBoard(boards[0])
      }
    }
  }

  const loadPosts = async (boardId: string) => {
    const { data: posts } = await supabase
      .from('discussion_posts')
      .select(`
        *,
        author:profiles!discussion_posts_author_id_fkey(full_name, role, avatar_url)
      `)
      .eq('board_id', boardId)
      .order('is_pinned', { ascending: false })
      .order('upvotes', { ascending: false })
      .order('created_at', { ascending: false })

    if (posts) {
      // Get comment counts for each post
      const postsWithComments = await Promise.all(
        posts.map(async (post) => {
          const { count } = await supabase
            .from('discussion_comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)
          
          return {
            ...post,
            comment_count: count || 0
          }
        })
      )
      setPosts(postsWithComments)
    }
  }

  const loadComments = async (postId: string) => {
    const { data: comments } = await supabase
      .from('discussion_comments')
      .select(`
        *,
        author:profiles!discussion_comments_author_id_fkey(full_name, role, avatar_url)
      `)
      .eq('post_id', postId)
      .is('parent_comment_id', null)
      .order('upvotes', { ascending: false })
      .order('created_at', { ascending: true })

    if (comments) {
      // Load replies for each comment
      const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
          const { data: replies } = await supabase
            .from('discussion_comments')
            .select(`
              *,
              author:profiles!discussion_comments_author_id_fkey(full_name, role, avatar_url)
            `)
            .eq('parent_comment_id', comment.id)
            .order('upvotes', { ascending: false })
            .order('created_at', { ascending: true })
          
          return {
            ...comment,
            replies: replies || []
          }
        })
      )
      setComments(commentsWithReplies)
    }
  }

  const createBoard = async () => {
    if (!user) return

    const { data: board, error } = await supabase
      .from('discussion_boards')
      .insert({
        title: newBoardData.title,
        description: newBoardData.description,
        category: newBoardData.category,
        created_by: user.id
      })
      .select()
      .single()

    if (board) {
      setBoards(prev => [board, ...prev])
      setShowCreateBoard(false)
      setNewBoardData({ title: '', description: '', category: 'general' })
    }
  }

  const createPost = async () => {
    if (!user || !selectedBoard) return

    const { data: post, error } = await supabase
      .from('discussion_posts')
      .insert({
        board_id: selectedBoard.id,
        title: newPostData.title,
        content: newPostData.content,
        author_id: user.id
      })
      .select(`
        *,
        author:profiles!discussion_posts_author_id_fkey(full_name, role, avatar_url)
      `)
      .single()

    if (post) {
      setPosts(prev => [{ ...post, comment_count: 0 }, ...prev])
      setShowCreatePost(false)
      setNewPostData({ title: '', content: '' })
    }
  }

  const createComment = async (postId: string, parentCommentId?: string) => {
    if (!user || !newComment.trim()) return

    const { data: comment, error } = await supabase
      .from('discussion_comments')
      .insert({
        post_id: postId,
        content: newComment.trim(),
        author_id: user.id,
        parent_comment_id: parentCommentId || null
      })
      .select(`
        *,
        author:profiles!discussion_comments_author_id_fkey(full_name, role, avatar_url)
      `)
      .single()

    if (comment) {
      if (parentCommentId) {
        // Add reply to existing comment
        setComments(prev => prev.map(c => {
          if (c.id === parentCommentId) {
            return {
              ...c,
              replies: [...(c.replies || []), { ...comment, replies: [] }]
            }
          }
          return c
        }))
      } else {
        // Add new top-level comment
        setComments(prev => [{ ...comment, replies: [] }, ...prev])
      }
      setNewComment('')
    }
  }

  const votePost = async (postId: string, voteType: 'up' | 'down') => {
    if (!user) return

    const post = posts.find(p => p.id === postId)
    if (!post) return

    const newUpvotes = voteType === 'up' ? post.upvotes + 1 : post.upvotes
    const newDownvotes = voteType === 'down' ? post.downvotes + 1 : post.downvotes

    const { error } = await supabase
      .from('discussion_posts')
      .update({
        upvotes: newUpvotes,
        downvotes: newDownvotes
      })
      .eq('id', postId)

    if (!error) {
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, upvotes: newUpvotes, downvotes: newDownvotes }
          : p
      ))
    }
  }

  const voteComment = async (commentId: string, voteType: 'up' | 'down') => {
    if (!user) return

    const updateCommentVotes = (comments: ExtendedComment[]): ExtendedComment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          const newUpvotes = voteType === 'up' ? comment.upvotes + 1 : comment.upvotes
          const newDownvotes = voteType === 'down' ? comment.downvotes + 1 : comment.downvotes
          return { ...comment, upvotes: newUpvotes, downvotes: newDownvotes }
        }
        if (comment.replies) {
          return { ...comment, replies: updateCommentVotes(comment.replies) }
        }
        return comment
      })
    }

    const comment = comments.find(c => c.id === commentId) || 
                   comments.flatMap(c => c.replies || []).find(r => r.id === commentId)
    
    if (!comment) return

    const newUpvotes = voteType === 'up' ? comment.upvotes + 1 : comment.upvotes
    const newDownvotes = voteType === 'down' ? comment.downvotes + 1 : comment.downvotes

    const { error } = await supabase
      .from('discussion_comments')
      .update({
        upvotes: newUpvotes,
        downvotes: newDownvotes
      })
      .eq('id', commentId)

    if (!error) {
      setComments(prev => updateCommentVotes(prev))
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return <Hash className="w-4 h-4" />
      case 'help': return <MessageSquare className="w-4 h-4" />
      case 'projects': return <TrendingUp className="w-4 h-4" />
      case 'events': return <Clock className="w-4 h-4" />
      default: return <Hash className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading discussion board...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">Discussion Board</h1>
        <p className="text-center text-muted-foreground">
          Join the conversation and share your thoughts with the community
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Boards Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Categories</CardTitle>
              {user && (
                <Dialog open={showCreateBoard} onOpenChange={setShowCreateBoard}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={newBoardData.title}
                          onChange={(e) => setNewBoardData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter category title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={newBoardData.description}
                          onChange={(e) => setNewBoardData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter category description"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Category Type</label>
                        <select
                          value={newBoardData.category}
                          onChange={(e) => setNewBoardData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="general">General</option>
                          <option value="help">Help & Support</option>
                          <option value="projects">Projects</option>
                          <option value="events">Events</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={createBoard} className="flex-1">Create Category</Button>
                        <Button variant="outline" onClick={() => setShowCreateBoard(false)}>Cancel</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-1 p-2">
                {boards.map((board) => (
                  <div
                    key={board.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedBoard?.id === board.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedBoard(board)}
                  >
                    {getCategoryIcon(board.category)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{board.title}</div>
                      {board.description && (
                        <div className="text-xs opacity-70 truncate">{board.description}</div>
                      )}
                    </div>
                    {board.is_pinned && <Pin className="w-3 h-3" />}
                    {board.is_locked && <Lock className="w-3 h-3" />}
                  </div>
                ))}
                {boards.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm p-4">
                    No categories available
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Posts Area */}
        <Card className="lg:col-span-3 flex flex-col">
          {selectedBoard ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(selectedBoard.category)}
                    <CardTitle className="text-lg">{selectedBoard.title}</CardTitle>
                    {selectedBoard.description && (
                      <span className="text-sm text-muted-foreground">
                        {selectedBoard.description}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {user && (
                      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            New Post
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Post</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Title</label>
                              <Input
                                value={newPostData.title}
                                onChange={(e) => setNewPostData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter post title"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Content</label>
                              <Textarea
                                value={newPostData.content}
                                onChange={(e) => setNewPostData(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Enter post content"
                                rows={6}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={createPost} className="flex-1">Create Post</Button>
                              <Button variant="outline" onClick={() => setShowCreatePost(false)}>Cancel</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedPost(post)}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {/* Voting */}
                            <div className="flex flex-col items-center space-y-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  votePost(post.id, 'up')
                                }}
                              >
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                              <span className="text-sm font-medium">{post.upvotes - post.downvotes}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  votePost(post.id, 'down')
                                }}
                              >
                                <ArrowDown className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            {/* Post Content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={post.author.avatar_url} />
                                  <AvatarFallback>
                                    {post.author.full_name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{post.author.full_name}</span>
                                <Badge variant="outline" className="text-xs">{post.author.role}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(post.created_at)}
                                </span>
                                {post.is_pinned && <Pin className="w-3 h-3 text-yellow-500" />}
                                {post.is_locked && <Lock className="w-3 h-3 text-red-500" />}
                              </div>
                              <h3 className="font-semibold mb-2">{post.title}</h3>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                                {post.content}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {post.comment_count} comments
                                </div>
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="w-3 h-3" />
                                  {post.upvotes} upvotes
                                </div>
                                <div className="flex items-center gap-1">
                                  <ThumbsDown className="w-3 h-3" />
                                  {post.downvotes} downvotes
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {posts.length === 0 && (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Posts Yet</h3>
                        <p className="text-muted-foreground">
                          Be the first to start a discussion in this category
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Category</h3>
                <p className="text-muted-foreground">
                  Choose a category from the sidebar to view posts
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{selectedPost.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Post Content */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => votePost(selectedPost.id, 'up')}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {selectedPost.upvotes - selectedPost.downvotes}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => votePost(selectedPost.id, 'down')}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={selectedPost.author.avatar_url} />
                      <AvatarFallback>
                        {selectedPost.author.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{selectedPost.author.full_name}</span>
                    <Badge variant="outline">{selectedPost.author.role}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatTime(selectedPost.created_at)}
                    </span>
                  </div>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{selectedPost.content}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Comments */}
              <div className="space-y-4">
                <h3 className="font-semibold">Comments ({comments.length})</h3>
                
                {/* Add Comment */}
                {user && (
                  <div className="space-y-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                    />
                    <Button 
                      onClick={() => createComment(selectedPost.id)}
                      disabled={!newComment.trim()}
                      size="sm"
                    >
                      Post Comment
                    </Button>
                  </div>
                )}

                {/* Comments List */}
                <ScrollArea className="max-h-96">
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="space-y-2">
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => voteComment(comment.id, 'up')}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            <span className="text-xs font-medium">
                              {comment.upvotes - comment.downvotes}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => voteComment(comment.id, 'down')}
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={comment.author.avatar_url} />
                                <AvatarFallback>
                                  {comment.author.full_name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{comment.author.full_name}</span>
                              <Badge variant="outline" className="text-xs">{comment.author.role}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                            {user && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-1 h-6 text-xs"
                                onClick={() => {
                                  const replyContent = prompt('Enter your reply:')
                                  if (replyContent) {
                                    createComment(selectedPost.id, comment.id)
                                  }
                                }}
                              >
                                Reply
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-8 space-y-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3">
                                <div className="flex flex-col items-center space-y-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => voteComment(reply.id, 'up')}
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </Button>
                                  <span className="text-xs font-medium">
                                    {reply.upvotes - reply.downvotes}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => voteComment(reply.id, 'down')}
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </Button>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Avatar className="w-5 h-5">
                                      <AvatarImage src={reply.author.avatar_url} />
                                      <AvatarFallback>
                                        {reply.author.full_name.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-medium">{reply.author.full_name}</span>
                                    <Badge variant="outline" className="text-xs">{reply.author.role}</Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {formatTime(reply.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-sm">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 