const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Job = require('../models/Job');
const Bid = require('../models/Bid');

// @desc    Create a Stripe PaymentIntent
// @route   POST /api/payments/create-intent
// @access  Private (Client)
const createPaymentIntent = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Ensure the requester is the client of the job
    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this job' });
    }

    // Find the accepted bid for this job
    const acceptedBid = await Bid.findOne({ jobId, status: 'accepted' });
    if (!acceptedBid) {
      return res.status(400).json({ message: 'No accepted bid found for this job' });
    }

    // Commission logic assumption (as documented in the implementation plan):
    // The freelancer's quote represents the net amount they receive.
    // We add 15% on top for the platform fee to calculate the total charged to the client.
    const amount = acceptedBid.quoteAmount; // Net to freelancer
    const commissionAmount = amount * 0.15; // 15% platform fee
    const totalCharged = amount + commissionAmount; // Total client pays

    // Stripe expects amount in cents
    const amountInCents = Math.round(totalCharged * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        jobId: job._id.toString(),
        clientId: req.user._id.toString(),
        freelancerId: acceptedBid.freelancerId.toString(),
      },
    });

    // Create a pending Payment record
    const payment = new Payment({
      jobId: job._id,
      clientId: req.user._id,
      freelancerId: acceptedBid.freelancerId,
      amount,
      commissionAmount,
      totalCharged,
      status: 'pending',
      stripePaymentIntentId: paymentIntent.id
    });

    await payment.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      totalCharged,
      commissionAmount,
      amount
    });
  } catch (error) {
    console.error('createPaymentIntent Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find payments where the user is either the client or the freelancer
    const payments = await Payment.find({
      $or: [{ clientId: userId }, { freelancerId: userId }]
    })
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email')
      .populate('jobId', 'title')
      .sort('-createdAt');

    res.json(payments);
  } catch (error) {
    console.error('getPaymentHistory Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Stripe Webhook Handler
// @route   POST /api/payments/webhook
// @access  Public
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      try {
        const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });
        if (payment) {
          payment.status = 'completed';
          await payment.save();
          console.log(`Payment ${payment._id} completed successfully.`);
        } else {
          console.error(`Payment record not found for PaymentIntent ${paymentIntent.id}`);
        }
      } catch (dbError) {
        console.error('Error updating payment status in DB:', dbError);
      }
      break;
    // ... handle other event types if necessary
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};

module.exports = {
  createPaymentIntent,
  getPaymentHistory,
  stripeWebhook
};
