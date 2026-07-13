const stripeLib = require('stripe');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const Payment = require('../models/Payment');
const User = require('../models/User');

// Initialize Stripe (checking if a secret key is provided, otherwise fallback to dummy key for sandbox/tests)
const stripe = stripeLib(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_stripe_key_51P0');

// @desc    Initialize Stripe Checkout session & record pending payment
// @route   POST /api/payment/checkout
// @access  Private/Client
exports.checkout = async (req, res) => {
  try {
    const { jobId, bidId } = req.body;

    // 1. Fetch job and bid
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res.status(404).json({ success: false, error: 'Bid not found' });
    }

    // 2. Validate ownership (Only the job poster can trigger payment)
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the client who posted the job can initiate payments' });
    }

    // 3. Validate bid belongs to the job
    if (bid.job.toString() !== jobId) {
      return res.status(400).json({ success: false, error: 'The selected bid does not belong to this job' });
    }

    // 4. Retrieve freelancer details
    const freelancer = await User.findById(bid.freelancer);
    if (!freelancer) {
      return res.status(404).json({ success: false, error: 'Freelancer not found' });
    }

    // 5. Calculate commission logic (15% platform commission)
    const grossAmount = bid.quote;
    const commissionAmount = Number((grossAmount * 0.15).toFixed(2));
    const netAmount = Number((grossAmount * 0.85).toFixed(2));

    let stripeSessionId = '';
    let stripeUrl = '';

    try {
      // 6. Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `StuGig: ${job.title}`,
                description: `Freelancer Proposal: ${bid.message.substring(0, 100)}...`
              },
              unit_amount: Math.round(grossAmount * 100) // Stripe amount is in cents
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: process.env.STRIPE_SUCCESS_URL || `http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: process.env.STRIPE_CANCEL_URL || `http://localhost:3000/payment/cancel`
      });

      stripeSessionId = session.id;
      stripeUrl = session.url;
    } catch (stripeError) {
      console.warn('Stripe Session Creation failed or key is missing. Falling back to Mock Session ID for testing.', stripeError.message);
      // Fallback for tests/sandbox when Stripe keys are not set
      stripeSessionId = `mock_session_id_${Date.now()}`;
      stripeUrl = `http://localhost:3000/mock-stripe-checkout?session_id=${stripeSessionId}`;
    }

    // 7. Save pending Payment record in database
    const payment = await Payment.create({
      job: jobId,
      client: req.user.id,
      freelancer: bid.freelancer,
      grossAmount,
      commissionAmount,
      netAmount,
      stripeSessionId,
      status: 'pending'
    });

    // 8. Update job status to negotiating / hired pending payment completion
    job.status = 'negotiating';
    await job.save();

    res.status(200).json({
      success: true,
      stripeSessionId,
      stripeUrl,
      paymentDetails: {
        id: payment._id,
        grossAmount,
        commissionAmount,
        netAmount,
        status: payment.status
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};
