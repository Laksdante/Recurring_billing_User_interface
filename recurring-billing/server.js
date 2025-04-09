const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
require('dotenv').config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve your index.html from the public folder

// Subscription route
app.post('/subscribe', async (req, res) => {
  const { email, plan } = req.body;

  // Map frontend plan to actual Stripe price ID
  const priceMap = {
    basic: 'price_1XXXXXXX_basic',    // replace with your real Stripe Price ID
    pro: 'price_1XXXXXXX_pro',        // replace with your real Stripe Price ID
    premium: 'price_1XXXXXXX_premium' // replace with your real Stripe Price ID
  };

  try {
    // 1. Create a customer
    const customer = await stripe.customers.create({ email });

    // 2. Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceMap[plan] }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // 3. Send client secret to frontend for payment
    res.json({
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
