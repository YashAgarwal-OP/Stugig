import { useState } from 'react';
import Modal from '../molecules/Modal';
import FormField from '../molecules/FormField';
import { StarRating } from '../atoms/Avatar';
import { TextArea } from '../atoms/Input';
import Button from '../atoms/Button';
import client from '../../api/client';

export default function LeaveReviewModal({ open, onClose, jobId, revieweeId, onReviewSubmitted }) {
  const [commRating, setCommRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [timelinessRating, setTimelinessRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await client.post('/reviews', {
        jobId,
        revieweeId,
        communicationRating: commRating,
        qualityRating: qualityRating,
        timelinessRating: timelinessRating,
        comment,
      });
      onReviewSubmitted?.();
      onClose();
      // Reset
      setComment('');
      setCommRating(5);
      setQualityRating(5);
      setTimelinessRating(5);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Leave Feedback & Review" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-xs text-[#ba1a1a] font-body">{error}</p>}

        <FormField label="Communication Rating" required>
          <div className="py-1">
            <StarRating
              interactive
              value={commRating}
              onChange={setCommRating}
              size="lg"
            />
          </div>
        </FormField>

        <FormField label="Quality of Work Rating" required>
          <div className="py-1">
            <StarRating
              interactive
              value={qualityRating}
              onChange={setQualityRating}
              size="lg"
            />
          </div>
        </FormField>

        <FormField label="Timeliness / Punctuality Rating" required>
          <div className="py-1">
            <StarRating
              interactive
              value={timelinessRating}
              onChange={setTimelinessRating}
              size="lg"
            />
          </div>
        </FormField>

        <FormField label="Feedback & Comment" required>
          <TextArea
            placeholder="Share details of your experience working together..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            required
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#e7e8e9]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
