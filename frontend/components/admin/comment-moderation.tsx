'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { commentsAPI, photosAPI } from '@/lib/api';
import { Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import md5 from 'md5';

interface Comment {
  _id: string;
  text: string;
  user: {
    _id: string;
    username: string;
    email: string;
    displayName?: string;
  };
  photo: {
    _id: string;
    title: string;
  };
  createdAt: string;
}

export function CommentModeration() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; comment: Comment | null }>({
    open: false,
    comment: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAllComments();
  }, []);

  const fetchAllComments = async () => {
    try {
      setIsLoading(true);
      // Fetch all photos and their comments
      const photosRes = await photosAPI.getAll({ page: 1, limit: 100 });
      const photos = photosRes.data.photos || [];
      
      const allComments: Comment[] = [];
      
      for (const photo of photos) {
        try {
          const commentsRes = await commentsAPI.getByPhoto(photo._id);
          const photoComments = (commentsRes.data || []).map((comment: any) => ({
            ...comment,
            photo: { _id: photo._id, title: photo.title },
          }));
          allComments.push(...photoComments);
        } catch (error) {
          console.error(`Error fetching comments for photo ${photo._id}:`, error);
        }
      }
      
      // Sort by newest first
      allComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setComments(allComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.comment) return;

    setIsDeleting(true);
    try {
      await commentsAPI.delete(deleteDialog.comment._id);
      toast.success('Comment deleted successfully');
      setComments(comments.filter((c) => c._id !== deleteDialog.comment!._id));
      setDeleteDialog({ open: false, comment: null });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  const getGravatarUrl = (email: string) => {
    const hash = md5(email.toLowerCase().trim());
    return `https://www.gravatar.com/avatar/${hash}?d=mp&s=40`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comment Moderation</CardTitle>
          <CardDescription>Manage all comments across photos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Comment Moderation</CardTitle>
          <CardDescription>Manage all comments across photos ({comments.length} total)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Photo</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No comments yet
                    </TableCell>
                  </TableRow>
                ) : (
                  comments.map((comment) => (
                    <TableRow key={comment._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={getGravatarUrl(comment.user.email)} />
                            <AvatarFallback>
                              {(comment.user.displayName || comment.user.username).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{comment.user.displayName || comment.user.username}</div>
                            <div className="text-xs text-muted-foreground">{comment.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="line-clamp-2">{comment.text}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{comment.photo.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete comment"
                          onClick={() => setDeleteDialog({ open: true, comment })}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, comment: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, comment: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
