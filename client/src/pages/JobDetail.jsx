import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/organisms/PublicNavbar';
import Footer from '../components/organisms/Footer';
import FormField from '../components/molecules/FormField';
import { Input, TextArea } from '../components/atoms/Input';
import { Badge } from '../components/atoms/Badge';
import { Card } from '../components/molecules/Card';
import AIFeatureCard from '../components/molecules/AIFeatureCard';
import Button from '../components/atoms/Button';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatExpectedDelivery } from '../utils/deliveryUtils';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isFreelancer, isClient } = useAuth();

  const [job, setJob] = useState(null);
  const [biddingAssistance, setBiddingAssistance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingAssistant, setFetchingAssistant] = useState(false);

  // Proposal Form State (Freelancer)
  const [quoteAmount, setQuoteAmount] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Client Bid Management State
  const [bids, setBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [bidActionLoading, setBidActionLoading] = useState(null); // bidId being actioned
  const [bidActionError, setBidActionError] = useState('');

  // Mark Complete State (client only)
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const res = await client.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (err) {
        console.error('Error fetching job details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [id]);

  // Fetch bids when a client views their own job
  const fetchBids = async (jobData) => {
    const currentJob = jobData || job;
    if (!currentJob || !user) return;
    // Normalize: clientId may be a populated object or a plain ObjectId string
    const jobClientId = currentJob.clientId?._id?.toString() || currentJob.clientId?.toString();
    const myId = (user._id || user.id)?.toString();
    if (jobClientId !== myId) return;
    setBidsLoading(true);
    try {
      const res = await client.get(`/jobs/${id}/bids`);
      setBids(res.data || []);
    } catch (err) {
      console.error('Error fetching bids:', err);
    } finally {
      setBidsLoading(false);
    }
  };

  useEffect(() => {
    if (job && user && !isFreelancer) {
      fetchBids(job);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job, user]);

  const handleBidAction = async (bidId, status) => {
    setBidActionLoading(bidId);
    setBidActionError('');
    try {
      await client.put(`/bids/${bidId}`, { status });
      // Refresh both bids list and job status
      const [bidsRes, jobRes] = await Promise.all([
        client.get(`/jobs/${id}/bids`),
        client.get(`/jobs/${id}`),
      ]);
      setBids(bidsRes.data || []);
      setJob(jobRes.data);
    } catch (err) {
      setBidActionError(err.response?.data?.message || 'Failed to update bid. Please try again.');
    } finally {
      setBidActionLoading(null);
    }
  };

  const handleMarkComplete = async () => {
    setCompleting(true);
    setCompleteError('');
    try {
      await client.put(`/jobs/${id}/status`, { status: 'completed' });
      const jobRes = await client.get(`/jobs/${id}`);
      setJob(jobRes.data);
    } catch (err) {
      setCompleteError(err.response?.data?.message || 'Failed to mark job complete.');
    } finally {
      setCompleting(false);
    }
  };

  const loadBiddingAssistant = async () => {
    setFetchingAssistant(true);
    try {
      const res = await client.get(`/bidding-assistant/${id}`);
      setBiddingAssistance(res.data);
    } catch (err) {
      console.error('Error loading smart bidding assistant details:', err);
    } finally {
      setFetchingAssistant(false);
    }
  };

  const handleApplyAssistantDraft = () => {
    if (!biddingAssistance) return;
    setProposalText(biddingAssistance.draftCoverMessage || '');
    // Pre-fill price if suggested range exists
    if (biddingAssistance.suggestedPriceRange) {
      const parts = biddingAssistance.suggestedPriceRange.match(/\d+/g);
      if (parts && parts.length > 0) {
        // Pre-fill with the middle/average of range, or min/max
        const avg = parts.length === 2 
          ? Math.round((Number(parts[0]) + Number(parts[1])) / 2) 
          : Number(parts[0]);
        setQuoteAmount(avg.toString());
      }
    }
    if (biddingAssistance.estimatedDeliveryTime) {
      setDeliveryTime(biddingAssistance.estimatedDeliveryTime);
    }
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!quoteAmount || !deliveryTime || !proposalText) {
      setFormError('Please fill in all proposal fields');
      return;
    }

    setSubmitLoading(true);
    try {
      await client.post(`/jobs/${id}/bids`, {
        quoteAmount: Number(quoteAmount),
        deliveryTime,
        coverMessage: proposalText,
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/freelancer');
      }, 2000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error submitting proposal. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col pt-[64px] bg-[#f8f9fa]">
        <PublicNavbar />
        <div className="flex-grow flex items-center justify-center text-[#464555] font-body">
          Loading job details...
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col pt-[64px] bg-[#f8f9fa]">
        <PublicNavbar />
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <p className="text-[#464555] font-body">Job not found.</p>
          <Button variant="primary" onClick={() => navigate('/jobs')}>Back to Listings</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-[64px] bg-[#f8f9fa]">
      <PublicNavbar />

      <main className="flex-grow max-w-[1440px] mx-auto px-8 py-8 w-full">
        {/* Navigation back */}
        <button onClick={() => navigate('/jobs')} className="text-sm font-semibold text-[#3525cd] hover:underline mb-6 flex items-center gap-1">
          &larr; Back to Listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Details Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-[#e7e8e9] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="bg-[#e2dfff] text-[#3525cd] text-xs font-semibold px-3 py-1 rounded-full font-label uppercase tracking-wide">
                    {job.category}
                  </span>
                  <h1 className="text-2xl font-bold font-headline text-[#191c1d] mt-3">{job.title}</h1>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-[#191c1d]">${job.budgetMin}–${job.budgetMax}</div>
                  <div className="text-xs text-[#777587] font-body mt-1">Estimated Budget</div>
                </div>
              </div>

              <div className="border-t border-[#e7e8e9] pt-4">
                <h3 className="font-semibold text-sm text-[#191c1d] mb-2 font-label">Project Description</h3>
                <p className="text-sm text-[#464555] font-body leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </div>

              {job.skillsRequired && job.skillsRequired.length > 0 && (
                <div className="border-t border-[#e7e8e9] pt-4">
                  <h3 className="font-semibold text-sm text-[#191c1d] mb-2 font-label">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsRequired.map((s) => (
                      <Badge key={s} variant="primary">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-[#e7e8e9] pt-4 flex flex-wrap gap-6 text-xs text-[#464555] font-body">
                <div>
                  <strong className="text-[#191c1d]">Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <strong className="text-[#191c1d]">Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}
                </div>
                <div>
                  <strong className="text-[#191c1d]">Status:</strong> <span className="capitalize">{job.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Proposal/Bid Submission Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {isFreelancer ? (
              <>
                {submitSuccess ? (
                  <Card className="p-6 border-[#006a61] bg-[#89f5e7]/10 text-center">
                    <svg className="w-12 h-12 text-[#006a61] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h3 className="font-bold text-lg text-[#006a61] font-headline">Proposal Submitted!</h3>
                    <p className="text-xs text-[#464555] font-body mt-2">Your bid has been sent. Redirecting to your dashboard...</p>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Smart Bidding Assistant — optional convenience helper */}
                    {!biddingAssistance ? (
                      <Card className="p-5 border-dashed border-2 border-[#3525cd]/20 flex flex-col items-center text-center gap-3">
                        <svg className="w-8 h-8 text-[#8B5CF6]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        <div>
                          <h3 className="font-bold text-sm text-[#191c1d] font-headline">Need Proposal Help?</h3>
                          <p className="text-xs text-[#464555] font-body mt-1">Get custom price recommendations and a draft cover letter — or just fill in the form below yourself.</p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={loadBiddingAssistant}
                          disabled={fetchingAssistant}
                        >
                          {fetchingAssistant ? 'Consulting Assistant...' : 'Activate Bidding Assistant'}
                        </Button>
                        {fetchingAssistant === false && biddingAssistance === null && formError.includes('assistant') && (
                          <p className="text-xs text-[#ba1a1a] font-body">Assistant unavailable — fill the form manually below.</p>
                        )}
                      </Card>
                    ) : (
                      <AIFeatureCard
                        title="Smart Bidding Assistant"
                        description="Tailored recommendations for this specific gig"
                        action={
                          <Button variant="primary" size="sm" onClick={handleApplyAssistantDraft} className="w-full">
                            Apply Draft to Form
                          </Button>
                        }
                      >
                        <div className="space-y-2 mt-3 text-xs border-t border-[#e7e8e9] pt-3 text-[#464555] font-body">
                          <div>
                            <strong>Suggested Quote:</strong>{' '}
                            <span className="text-[#006a61] font-semibold">{biddingAssistance.suggestedPriceRange}</span>
                          </div>
                          <div>
                            <strong>Estimated Delivery:</strong>{' '}
                            <span className="text-[#3525cd] font-semibold">{biddingAssistance.estimatedDeliveryTime}</span>
                          </div>
                        </div>
                      </AIFeatureCard>
                    )}

                    {/* Proposal Form — always visible, decoupled from assistant */}
                    <Card className="p-5 space-y-4">
                      <h2 className="text-lg font-bold font-headline text-[#191c1d]">Submit Proposal</h2>
                      {formError && <p className="text-xs text-[#ba1a1a] font-body">{formError}</p>}
                      <form onSubmit={handleProposalSubmit} className="space-y-4">
                        <FormField label="Your Quote ($)" htmlFor="quoteAmount" required>
                          <Input
                            id="quoteAmount"
                            type="number"
                            placeholder="e.g. 150"
                            value={quoteAmount}
                            onChange={(e) => setQuoteAmount(e.target.value)}
                            required
                          />
                        </FormField>

                        <FormField label="Delivery Time" htmlFor="deliveryTime" required>
                          <Input
                            id="deliveryTime"
                            placeholder="e.g. 3 days"
                            value={deliveryTime}
                            onChange={(e) => setDeliveryTime(e.target.value)}
                            required
                          />
                        </FormField>

                        <FormField label="Cover Message" htmlFor="proposalText" required>
                          <TextArea
                            id="proposalText"
                            placeholder="Generate proposal… or write your own cover message here."
                            value={proposalText}
                            onChange={(e) => setProposalText(e.target.value)}
                            required
                          />
                        </FormField>

                        <Button type="submit" variant="primary" className="w-full" disabled={submitLoading}>
                          {submitLoading ? 'Submitting proposal...' : 'Submit Proposal'}
                        </Button>
                      </form>
                    </Card>
                  </div>
                )}
              </>
            ) : isClient ? (
              /* Client Bid Management Panel */
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold font-headline text-[#191c1d]">Incoming Bids</h2>
                  <span className="text-xs font-semibold text-[#464555] font-label bg-[#edeeef] px-2 py-1 rounded-full">
                    {bids.length} bid{bids.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {bidActionError && (
                  <p className="text-xs text-[#ba1a1a] font-body bg-[#ba1a1a]/10 rounded-lg px-3 py-2">{bidActionError}</p>
                )}

                {bidsLoading ? (
                  <div className="text-center py-8 text-[#464555] font-body text-sm">Loading bids...</div>
                ) : bids.length === 0 ? (
                  <Card className="p-6 text-center">
                    <svg className="w-10 h-10 text-[#b0afc0] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm text-[#464555] font-body">No bids received yet.</p>
                    <p className="text-xs text-[#777587] font-body mt-1">Freelancers will appear here once they apply.</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {bids.map((bid) => (
                      <Card key={bid._id} className={`p-5 space-y-3 border-2 transition-all ${
                        bid.status === 'accepted'
                          ? 'border-[#006a61] bg-[#89f5e7]/10'
                          : bid.status === 'rejected'
                          ? 'border-[#e7e8e9] opacity-60'
                          : 'border-[#e7e8e9] hover:border-[#3525cd]/30'
                      }`}>
                        {/* Freelancer header */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3525cd] to-[#8B5CF6] flex items-center justify-center text-white text-sm font-bold">
                              {bid.freelancerId?.name?.[0]?.toUpperCase() || 'F'}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#191c1d] font-headline">
                                {bid.freelancerId?.name || 'Freelancer'}
                              </p>
                              {bid.freelancerId?.rating > 0 && (
                                <p className="text-xs text-[#777587] font-body">⭐ {bid.freelancerId.rating.toFixed(1)}</p>
                              )}
                            </div>
                          </div>
                          {/* Status pill */}
                          {bid.status !== 'pending' && (
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full font-label capitalize ${
                              bid.status === 'accepted'
                                ? 'bg-[#89f5e7] text-[#006a61]'
                                : 'bg-[#edeeef] text-[#464555]'
                            }`}>
                              {bid.status}
                            </span>
                          )}
                        </div>

                        {/* Bid details */}
                        <div className="grid grid-cols-2 gap-3 text-xs font-body">
                          <div className="bg-[#f8f9fa] rounded-lg p-2 text-center">
                            <p className="text-[#777587]">Quote</p>
                            <p className="font-bold text-[#191c1d] text-sm mt-0.5">${bid.quoteAmount}</p>
                          </div>
                          <div className="bg-[#f8f9fa] rounded-lg p-2 text-center">
                            <p className="text-[#777587]">Delivery</p>
                            <p className="font-semibold text-[#191c1d] text-sm mt-0.5">{bid.deliveryTime}</p>
                          </div>
                        </div>

                        {/* Expected delivery date — shown once bid is accepted */}
                        {bid.status === 'accepted' && bid.acceptedAt && (
                          <div className="flex items-center gap-1.5 bg-[#e2dfff] rounded-lg px-3 py-2">
                            <svg className="w-4 h-4 text-[#3525cd] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-semibold text-[#3525cd]">{formatExpectedDelivery(bid.deliveryTime, bid.acceptedAt)}</span>
                          </div>
                        )}

                        {/* Cover message */}
                        {bid.coverMessage && (
                          <div>
                            <p className="text-xs font-semibold text-[#464555] font-label mb-1">Cover Message</p>
                            <p className="text-xs text-[#464555] font-body leading-relaxed line-clamp-4 bg-[#f8f9fa] rounded-lg p-2">
                              {bid.coverMessage}
                            </p>
                          </div>
                        )}

                        {/* Action buttons — only for pending bids on open jobs */}
                        {bid.status === 'pending' && job?.status === 'open' && (
                          <div className="flex gap-2 pt-1">
                            <Button
                              variant="primary"
                              size="sm"
                              className="flex-1"
                              disabled={bidActionLoading === bid._id}
                              onClick={() => handleBidAction(bid._id, 'accepted')}
                            >
                              {bidActionLoading === bid._id ? 'Accepting...' : '✓ Accept'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 text-[#ba1a1a] hover:bg-[#ba1a1a]/10"
                              disabled={bidActionLoading === bid._id}
                              onClick={() => handleBidAction(bid._id, 'rejected')}
                            >
                              ✕ Reject
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}

                {job?.status === 'in-progress' && (
                  <div className="bg-[#89f5e7]/20 border border-[#006a61]/30 rounded-xl p-4 space-y-3">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-[#006a61] font-headline">🎉 Freelancer Hired!</p>
                      <p className="text-xs text-[#464555] font-body mt-1">This job is now in progress.</p>
                    </div>
                    {completeError && (
                      <p className="text-xs text-[#ba1a1a] font-body text-center">{completeError}</p>
                    )}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        disabled={completing}
                        onClick={handleMarkComplete}
                      >
                        {completing ? 'Completing...' : '✓ Mark Job as Complete'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => navigate('/messages')}
                      >
                        💬 Go to Chat
                      </Button>
                    </div>
                  </div>
                )}

                {job?.status === 'completed' && (
                  <div className="bg-[#e2dfff]/40 border border-[#3525cd]/20 rounded-xl p-4 text-center space-y-2">
                    <p className="text-sm font-semibold text-[#3525cd] font-headline">✅ Job Completed</p>
                    <p className="text-xs text-[#464555] font-body">This job has been marked as complete.</p>
                    <Button variant="secondary" size="sm" className="w-full" onClick={() => navigate('/messages')}>
                      Leave Feedback
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Card className="p-5 text-center bg-[#edeeef]/40">
                <p className="text-sm text-[#464555] font-body leading-relaxed">
                  Only authenticated Student Freelancers can submit bids on active job requests.
                </p>
                {!user && (
                  <Button variant="primary" className="mt-4 w-full" onClick={() => navigate('/login')}>
                    Log In to Apply
                  </Button>
                )}
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
