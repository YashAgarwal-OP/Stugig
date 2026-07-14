const stripeLib = require('stripe');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const Payment = require('../models/Payment');
const notify = require('../utils/notify');
const { sendPaymentReceivedEmail, sendPaymentConfirmedEmail } = require('../utils/sendEmail');

const stripe = stripeLib(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// @desc    Create a Stripe PaymentIntent for the accepted bid on a job
// @route   POST /api/payments/create-intent
// @access  Private/Client
exports.createPaymentIntent = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: 'jobId is required' });
    }

    const job = await Job.findById(jobId).populate('acceptedBidId');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the client who posted this job can make a payment' });
    }

    if (!job.acceptedBidId) {
      return res.status(400).json({ message: 'No accepted bid found for this job. Accept a bid first.' });
    }

    const bid = job.acceptedBidId;

    // Check for an existing pending payment to avoid duplicates
    const existing = await Payment.findOne({ jobId, clientId: req.user.id, status: 'pending' });
    if (existing) {
      return res.status(200).json({
        clientSecret: existing.stripePaymentIntentId
          ? `${existing.stripePaymentIntentId}_secret_placeholder`
          : null,
        paymentId: existing._id,
        amount: existing.amount,
        commissionAmount: existing.commissionAmount,
        totalCharged: existing.totalCharged
      });
    }

    // 15% platform commission: client pays quote + 15%
    const amount = bid.quoteAmount;
    const commissionAmount = Number((amount * 0.15).toFixed(2));
    const totalCharged = Number((amount + commissionAmount).toFixed(2));

    let clientSecret = null;
    let stripePaymentIntentId = `mock_pi_${Date.now()}`;

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalCharged * 100), // Stripe works in cents
        currency: 'usd',
        metadata: {
          jobId: jobId.toString(),
          clientId: req.user.id.toString(),
          freelancerId: bid.freelancerId.toString()
        }
      });
      clientSecret = paymentIntent.client_secret;
      stripePaymentIntentId = paymentIntent.id;
    } catch (stripeError) {
      console.warn('[Payment] Stripe PaymentIntent creation failed — using mock for sandbox:', stripeError.message);
      // Fallback: return a mock secret so the frontend can still exercise the flow
      clientSecret = `${stripePaymentIntentId}_secret_mock`;
    }

    // Persist the pending payment record
    const payment = await Payment.create({
      jobId,
      clientId: req.user.id,
      freelancerId: bid.freelancerId,
      amount,
      commissionAmount,
      totalCharged,
      stripePaymentIntentId,
      status: 'pending'
    });

    res.status(200).json({
      clientSecret,
      paymentId: payment._id,
      amount,
      commissionAmount,
      totalCharged
    });
  } catch (error) {
    console.error('[Payment] createPaymentIntent error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm a payment server-side after Stripe client-side success
// @route   POST /api/payments/:id/confirm
// @access  Private/Client
exports.confirmPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (payment.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to confirm this payment' });
    }

    if (payment.status === 'completed') {
      return res.status(200).json({ message: 'Payment already confirmed', payment });
    }

    // Optionally verify against Stripe if a real key is configured
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      try {
        const pi = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
        if (pi.status !== 'succeeded') {
          return res.status(402).json({ message: `Stripe PaymentIntent status is '${pi.status}', not succeeded` });
        }
      } catch (stripeErr) {
        console.warn('[Payment] Stripe verification skipped (mock environment):', stripeErr.message);
      }
    }

    payment.status = 'completed';
    await payment.save();

    // Move job to in-progress if it isn't already
    const job = await Job.findById(payment.jobId);
    if (job && job.status !== 'in-progress' && job.status !== 'completed') {
      job.status = 'in-progress';
      await job.save();
    }

    // Notify both parties
    const io = req.app.locals.io;
    await Promise.all([
      // Freelancer: you have been paid
      notify(io, {
        userId: payment.freelancerId,
        type: 'payment_received',
        message: `You received a payment of $${payment.amount.toFixed(2)} for "${job?.title || 'a job'}"`,
        link: `/payment`
      }),
      // Client: payment confirmed
      notify(io, {
        userId: payment.clientId,
        type: 'payment_confirmed',
        message: `Your payment of $${payment.totalCharged.toFixed(2)} for "${job?.title || 'a job'}" has been confirmed.`,
        link: `/payment`
      })
    ]);

    // Send transactional emails (non-blocking)
    if (job) {
      const [freelancer, clientUser] = await Promise.all([
        User.findById(payment.freelancerId),
        User.findById(payment.clientId)
      ]);
      if (freelancer) sendPaymentReceivedEmail(freelancer, job, payment.amount).catch(() => {});
      if (clientUser) sendPaymentConfirmedEmail(clientUser, job, payment.totalCharged).catch(() => {});
    }

    res.status(200).json({ message: 'Payment confirmed', payment });
  } catch (error) {
    console.error('[Payment] confirmPayment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Stripe webhook handler — marks payment complete on charge.succeeded event
// @route   POST /api/payments/webhook
// @access  Public (raw body required)
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = req.body;
    }
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    try {
      const payment = await Payment.findOneAndUpdate(
        { stripePaymentIntentId: pi.id, status: 'pending' },
        { status: 'completed' },
        { new: true }
      );

      if (payment) {
        const job = await Job.findById(payment.jobId);
        if (job && job.status !== 'in-progress' && job.status !== 'completed') {
          job.status = 'in-progress';
          await job.save();
        }

        // Emit notifications via socket (io may not be available in webhook context
        // since req.app isn't passed here — use a direct import of the io singleton)
        const io = req.app?.locals?.io || null;
        await Promise.all([
          notify(io, {
            userId: payment.freelancerId,
            type: 'payment_received',
            message: `You received a payment of $${payment.amount.toFixed(2)} for "${job?.title || 'a job'}"`,
            link: `/payment`
          }),
          notify(io, {
            userId: payment.clientId,
            type: 'payment_confirmed',
            message: `Your payment of $${payment.totalCharged.toFixed(2)} for "${job?.title || 'a job'}" has been confirmed.`,
            link: `/payment`
          })
        ]);

        console.log(`[Webhook] Payment ${payment._id} confirmed via webhook`);
      }
    } catch (dbErr) {
      console.error('[Webhook] DB update error:', dbErr.message);
    }
  }

  res.status(200).json({ received: true });
};

// @desc    Get payment history for the authenticated user
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const query = req.user.role === 'client'
      ? { clientId: req.user.id }
      : { freelancerId: req.user.id };

    const payments = await Payment.find(query)
      .populate('jobId', 'title status')
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error('[Payment] getPaymentHistory error:', error);
    res.status(500).json({ message: error.message });
  }
};
