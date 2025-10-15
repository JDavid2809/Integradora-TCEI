import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function setupProducts() {
  // Create a product
  const product = await stripe.products.create({
    name: 'Premium Feature',
    description: 'One-time access to premium features',
  });

  // Create a price for the product
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 2999, // $29.99 (in cents)
    currency: 'usd',
  });

  console.log('Price ID:', price.id); // Save this!
}

setupProducts();