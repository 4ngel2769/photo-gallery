"use client"

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Eye, MapPin, Calendar, Camera, MessageSquare, Send, Trash2, Edit2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ZoomCursor } from '@/components/ui/zoom-cursor';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDate, getGravatarUrl, getSessionId } from '@/lib/utils-app';
import { photosAPI, commentsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getFingerprint } from '@/lib/fingerprint';
import Link from 'next/link';

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
  const { settings } = useSettings();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const checkLikeStatus = useCallback(async () => {
    if (!photo) return;
    
    try {
      const sessionId = getSessionId();
      const response = await photosAPI.getLikeStatus(photo._id, sessionId);
      setIsLiked(response.data.isLiked);
    } catch {
      console.error('Error checking like status');
    }
  }, [photo]);

  const loadComments = useCallback(async () => {
    if (!photo) return;
    
    try {
      const response = await commentsAPI.getByPhoto(photo._id);
      setComments(response.data);
    } catch {
      console.error('Error loading comments');
    }
  }, [photo]);

  const trackView = useCallback(async () => {
    if (!photo) return;
    
    try {
      const fingerprint = getFingerprint();
      const response = await photosAPI.trackView(photo._id, fingerprint);
      setViews(response.data.views);
    } catch {
      console.error('Error tracking view');
    }
  }, [photo]);

  useEffect(() => {
    if (photo && isOpen) {
      setLikes(photo.likes);
      setViews(photo.views);
      loadComments();
      checkLikeStatus();
      trackView(); // Track view when dialog opens
    }
  }, [photo, isOpen, checkLikeStatus, loadComments, trackView]);

  const handleLike = async () => {
    if (!photo) return;

    try {
      const sessionId = getSessionId();
      const response = await photosAPI.like(photo._id, sessionId);
      setIsLiked(response.data.isLiked);
      setLikes(response.data.likes);
    } catch {
      toast.error('Failed to update like');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to comment');
      return;
    }

    if (!photo || !newComment.trim()) return;

    setLoading(true);
    try {
      await commentsAPI.create(photo._id, newComment);
      setNewComment('');
      await loadComments();
      toast.success('Comment posted!');
    } catch {
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
    } catch {
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
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  if (!photo) return null;

  const imageUrl = photo.imageUrl.startsWith('http') 
    ? photo.imageUrl 
    : `${API_URL.replace('/api', '')}${photo.imageUrl}`;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-[95vw]! w-full h-[95vh] p-0 gap-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 40 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                transition: {
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1],
                  scale: {
                    delay: 0.1,
                    duration: 0.3
                  }
                }
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.95, 
                y: 30,
                transition: {
                  duration: 0.3,
                  ease: [0.4, 0, 1, 1]
                }
              }}
              className="relative h-full w-full"
            >
          {/* Image Section - Full Screen */}
          <div 
            className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden"
            style={{
              cursor: settings.enableImageZoom ? 'none' : 'default',
            }}
          >
            {/* Custom Zoom Cursor */}
            {settings.enableImageZoom && (
              <ZoomCursor isActive={true} isZoomed={isZoomed} />
            )}
            
            <motion.div
              className="w-full h-full flex items-center justify-center p-4"
              animate={{
                scale: isZoomed ? 2 : 1,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={() => {
                if (settings.enableImageZoom) {
                  setIsZoomed(!isZoomed);
                }
              }}
            >
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={imageUrl}
                alt={photo.title}
                className="max-w-full max-h-full object-contain"
                style={{ 
                  width: 'auto',
                  height: 'auto',
                  pointerEvents: 'none'
                }}
              />
            </motion.div>
          </div>

          {/* Details Overlay */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-0 left-0 right-0 md:top-0 md:left-auto md:right-0 md:bottom-0 md:w-[400px] lg:w-[450px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 h-[40vh] md:h-full"
          >
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold leading-tight">
                      {photo.title || 'Untitled Photo'}
                    </h2>
                    {photo.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {photo.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  {settings.showLikes && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      disabled={loading}
                      className="gap-2"
                    >
                      <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span>{likes}</span>
                    </Button>
                  )}
                  {settings.showViews && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Eye className="h-5 w-5" />
                      <span>{views}</span>
                    </div>
                  )}
                  {settings.showComments && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageSquare className="h-5 w-5" />
                      <span>{comments.length}</span>
                    </div>
                  )}
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
                        className="min-h-20"
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
                      <Link href="/login">
                        <Button variant="outline" size="sm">
                          Sign In
                        </Button>
                      </Link>
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
        </motion.div>
      </DialogContent>
    </Dialog>
      )}
    </AnimatePresence>
  );
}
