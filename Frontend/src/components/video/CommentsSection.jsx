import React, { useState, useEffect } from 'react';
import { 
  FaThumbsUp, 
  FaThumbsDown, 
  FaReply, 
  FaEdit, 
  FaTrash, 
  FaPaperPlane,
  FaSpinner 
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { 
  getVideoComments, 
  createComment, 
  updateComment, 
  deleteComment 
} from '../../api/comments';
import { 
  toggleCommentLike, 
  getUserVote,
  getLikeCounts 
} from '../../api/likes';
import { formatTimeAgo, formatViews } from '../../utils/format';

const CommentsSection = ({ videoId, onCommentCountUpdate }) => {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    if (videoId) {
      loadComments();
    }
  }, [videoId]);

  const loadComments = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getVideoComments(videoId, { 
        page, 
        limit: 10,
        includeReplies: false 
      });
      
      const commentsWithLikes = await Promise.all(
        response.data.comments.map(async (comment) => {
          const [likeCounts, userVote] = await Promise.all([
            getLikeCounts('Comment', comment._id),
            currentUser ? getUserVote('Comment', comment._id) : Promise.resolve({ data: 0 })
          ]);
          
          return {
            ...comment,
            likeCounts: likeCounts.data,
            userVote: userVote.data
          };
        })
      );
      
      setComments(commentsWithLikes);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    try {
      setSubmitting(true);
      const response = await createComment(videoId, newComment.trim());
      
      // Add like counts and user vote to new comment
      const [likeCounts, userVote] = await Promise.all([
        getLikeCounts('Comment', response.data._id),
        getUserVote('Comment', response.data._id)
      ]);
      
      const commentWithLikes = {
        ...response.data,
        likeCounts: likeCounts.data,
        userVote: userVote.data
      };
      
      setComments([commentWithLikes, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId, value) => {
    if (!currentUser) return;

    try {
      await toggleCommentLike(commentId, value);
      
      // Update the comment in the list
      setComments(comments.map(comment => {
        if (comment._id === commentId) {
          const isCurrentlyLiked = comment.userVote === value;
          const newUserVote = isCurrentlyLiked ? 0 : value;
          
          let newLikeCounts = { ...comment.likeCounts };
          if (value === 1) {
            newLikeCounts.likes += isCurrentlyLiked ? -1 : 1;
            if (comment.userVote === -1) {
              newLikeCounts.dislikes -= 1;
            }
          } else {
            newLikeCounts.dislikes += isCurrentlyLiked ? -1 : 1;
            if (comment.userVote === 1) {
              newLikeCounts.likes -= 1;
            }
          }
          
          return {
            ...comment,
            userVote: newUserVote,
            likeCounts: newLikeCounts
          };
        }
        return comment;
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    try {
      await updateComment(commentId, newContent);
      setComments(comments.map(comment =>
        comment._id === commentId 
          ? { ...comment, content: newContent, isEdited: true }
          : comment
      ));
      setEditingComment(null);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(commentId);
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const CommentItem = ({ comment }) => {
    const [editing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const isOwner = currentUser?._id === comment.user._id;

    return (
      <div className="flex space-x-3 mb-6">
        {/* Avatar */}
        <img
          src={
            comment.user.profile?.picture ||
            `https://ui-avatars.com/api/?name=${comment.user.username}&background=random`
          }
          alt={comment.user.username}
          className="w-10 h-10 rounded-full flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          {/* User info */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-gray-900 dark:text-white">
              {comment.user.fullName || comment.user.username}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTimeAgo(comment.createdAt)}
              {comment.isEdited && ' (edited)'}
            </span>
          </div>

          {/* Comment content */}
          {editing ? (
            <div className="mb-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={3}
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => {
                    handleEditComment(comment._id, editContent);
                    setEditing(false);
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 dark:text-gray-200 mb-3 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Like/Dislike */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleLikeComment(comment._id, 1)}
                className={`flex items-center space-x-1 text-sm ${
                  comment.userVote === 1
                    ? 'text-red-600'
                    : 'text-gray-500 hover:text-red-600'
                }`}
                disabled={!currentUser}
              >
                <FaThumbsUp size={14} />
                <span>{comment.likeCounts?.likes || 0}</span>
              </button>
              
              <button
                onClick={() => handleLikeComment(comment._id, -1)}
                className={`flex items-center space-x-1 text-sm ${
                  comment.userVote === -1
                    ? 'text-red-600'
                    : 'text-gray-500 hover:text-red-600'
                }`}
                disabled={!currentUser}
              >
                <FaThumbsDown size={14} />
                <span>{comment.likeCounts?.dislikes || 0}</span>
              </button>
            </div>

            {/* Reply */}
            {currentUser && (
              <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
                <FaReply size={12} />
                <span>Reply</span>
              </button>
            )}

            {/* Edit/Delete for comment owner */}
            {isOwner && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <FaEdit size={12} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="flex items-center space-x-1 text-sm text-red-500 hover:text-red-700"
                >
                  <FaTrash size={12} />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8">
      <div className="flex items-center space-x-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {pagination.totalComments || 0} Comments
        </h3>
      </div>

      {/* Add comment form */}
      {currentUser ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex space-x-3">
            <img
              src={
                currentUser.profile?.picture ||
                `https://ui-avatars.com/api/?name=${currentUser.username}&background=random`
              }
              alt={currentUser.username}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <FaSpinner className="animate-spin" size={14} />
                  ) : (
                    <FaPaperPlane size={14} />
                  )}
                  <span>Comment</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to leave a comment.
          </p>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <FaSpinner className="animate-spin text-gray-500" size={24} />
        </div>
      ) : comments.length > 0 ? (
        <div>
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
          
          {/* Load more button */}
          {pagination.hasNextPage && (
            <button
              onClick={() => loadComments(pagination.currentPage + 1)}
              className="w-full py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Load More Comments
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to comment!
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
