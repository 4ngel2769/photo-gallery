"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Eye, MapPin, Calendar, Camera, MessageSquare, Send, Trash2, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDate, getGravatarUrl, getSessionId } from '@/lib/utils-app';
import { photosAPI, commentsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Photo {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  likes: number;
  views: number;
  location?: string;
  category?: string;
  mood?: string;
  dateTaken?: string;
  tags?: string[];
  camera?: {
    type?: string;
    model?: string;
    brand?: string;
  };
  resolution?: {
    width: number;
    height: number;
  };
}

interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    username: string;
    displayName: string;
    email: string;
  };
  createdAt: string;
  isEdited: boolean;
}

interface PhotoDialogProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PhotoDialog({ photo, isOpen, onClose }: PhotoDialogProps) {
  const { user, isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (photo && isOpen) {
      setLikes(photo.likes);
      loadComments();
      checkLikeStatus();
    }
  }, [photo, isOpen]);

  const checkLikeStatus = async () => {
    if (!photo) return;
    
    try {
      const sessionId = getSessionId();
      const response = await photosAPI.getLikeStatus(photo._id, sessionId);
      setIsLiked(response.data.isLiked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const loadComments = async () => {
    if (!photo) return;
    
    try {
      const response = await commentsAPI.getByPhoto(photo._id);
      setComments(response.data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleLike = async () => {
    if (!photo) return;

    try {
      const sessionId = getSessionId();
      const response = await photosAPI.like(photo._id, sessionId);
      setIsLiked(response.data.isLiked);
      setLikes(response.data.likes);
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (!photo || !newComment.trim()) return;

    setLoading(true);
    try {
      await commentsAPI.create(photo._id, newComment);
      setNewComment('');
      await loadComments();
      toast.success('Comment posted!');
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    setLoading(true);
    try {
      await commentsAPI.update(commentId, editContent);
      setEditingCommentId(null);
      setEditContent('');
      await loadComments();
      toast.success('Comment updated!');
    } catch (error) {
      toast.error('Failed to update comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentsAPI.delete(commentId);
      await loadComments();
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  if (!photo) return null;

  const imageUrl = photo.imageUrl.startsWith('http') 
    ? photo.imageUrl 
    : `${API_URL.replace('/api', '')}${photo.imageUrl}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0">
        <div className="grid md:grid-cols-[1.2fr,1fr] lg:grid-cols-[1.5fr,1fr] gap-0 h-full">
          {/* Image Section */}
          <div className="relative bg-black flex items-center justify-center">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={imageUrl}
              alt={photo.title}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Details Section */}
          <div className="flex flex-col h-full">
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle className="text-2xl">{photo.title}</DialogTitle>
            </DialogHeader>

            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-6">
                {/* Description */}
                {photo.description && (
                  <p className="text-muted-foreground">{photo.description}</p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={cn("gap-2", isLiked && "text-red-500")}
                  >
                    <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                    <span>{likes}</span>
                  </Button>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-5 w-5" />
                    <span>{photo.views}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageSquare className="h-5 w-5" />
                    <span>{comments.length}</span>
                  </div>
                </div>

                {/* Tags & Badges */}
                {(photo.category || photo.mood || photo.tags) && (
                  <div className="flex flex-wrap gap-2">
                    {photo.category && <Badge>{photo.category}</Badge>}
                    {photo.mood && <Badge variant="secondary">{photo.mood}</Badge>}
                    {photo.tags?.map((tag, i) => (
                      <Badge key={i} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Metadata */}
                <div className="space-y-3 text-sm">
                  {photo.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{photo.location}</span>
                    </div>
                  )}
                  {photo.dateTaken && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(photo.dateTaken)}</span>
                    </div>
                  )}
                  {(photo.camera?.brand || photo.camera?.model) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Camera className="h-4 w-4" />
                      <span>
                        {photo.camera.brand} {photo.camera.model}
                        {photo.camera.type && ` (${photo.camera.type})`}
                      </span>
                    </div>
                  )}
                  {photo.resolution && (
                    <div className="text-muted-foreground">
                      Resolution: {photo.resolution.width} × {photo.resolution.height}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Comments Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comments ({comments.length})
                  </h3>

                  {/* Comment Form */}
                  {isAuthenticated ? (
                    <form onSubmit={handleCommentSubmit} className="space-y-3">
                      <Textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <Button type="submit" disabled={loading || !newComment.trim()} className="gap-2">
                        <Send className="h-4 w-4" />
                        Post Comment
                      </Button>
                    </form>
                  ) : (
                    <div className="p-4 border rounded-lg bg-muted/50 text-center">
                      <p className="text-sm text-muted-foreground mb-3">
                        Please sign in to comment
                      </p>
                      <Button variant="outline" size="sm">
                        Sign In
                      </Button>
                    </div>
                  )}

                  {/* Comments List */}
                  <div className="space-y-4">
                    <AnimatePresence>
                      {comments.map((comment) => (
                        <motion.div
                          key={comment._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <Avatar>
                            <AvatarImage src={getGravatarUrl(comment.user.email)} />
                            <AvatarFallback>
                              {comment.user.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-semibold text-sm">
                                  {comment.user.displayName}
                                </span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {formatDate(comment.createdAt)}
                                  {comment.isEdited && ' (edited)'}
                                </span>
                              </div>

                              {user && (user._id === comment.user._id || user.role === 'admin') && (
                                <div className="flex gap-1">
                                  {user._id === comment.user._id && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => {
                                        setEditingCommentId(comment._id);
                                        setEditContent(comment.content);
                                      }}
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive"
                                    onClick={() => handleDeleteComment(comment._id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>

                            {editingCommentId === comment._id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="min-h-[60px]"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleEditComment(comment._id)}
                                    disabled={loading}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingCommentId(null);
                                      setEditContent('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-foreground">{comment.content}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {comments.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No comments yet. Be the first to comment!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
