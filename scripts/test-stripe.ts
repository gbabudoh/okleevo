import fs from 'fs';
import path from 'path';
import Stripe from 'stripe';

function loadEnv(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnv(path.resolve('.env.local'));
loadEnv(path.resolve('.env'));

async function listTestPrices() {
  const secretKey = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' });

  console.log('Fetching active test prices from Stripe...\n');
  const prices = await stripe.prices.list({ limit: 10, active: true, expand: ['data.product'] });

  if (prices.data.length === 0) {
    console.log('⚠️ No active test mode prices found in your Stripe account.');
    console.log('👉 To create one: Go to Stripe Dashboard (Test Mode) → Product Catalog → Add Product ("Starter Plan", $39/month).');
  } else {
    console.log('✅ Found Test Mode Prices:');
    for (const p of prices.data) {
      const prod = p.product as Stripe.Product;
      console.log(`• Product: "${prod?.name || 'Unnamed'}" | Price ID: ${p.id} | Amount: ${(p.unit_amount ?? 0) / 100} ${p.currency.toUpperCase()} / ${p.recurring?.interval || 'one-time'}`);
    }
  }
}

listTestPrices().catch(console.error);
