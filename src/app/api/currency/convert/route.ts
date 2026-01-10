// @ts-nocheck
import { NextResponse } from 'next/server';
import { CurrencyEngine } from '@/lib/utils/currency';

/**
 * API Endpoint to convert platform USD prices to any target currency.
 * Example: /api/currency/convert?amount=20&target=EUR
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const amount = parseFloat(searchParams.get('amount') || '0');
    const target = searchParams.get('target') || 'USD';

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    // Use the engine we just created in Step 21.1
    const convertedAmount = await CurrencyEngine.convert(amount, target);
    const formatted = CurrencyEngine.format(convertedAmount, target);

    return NextResponse.json({
      baseAmount: amount,
      baseCurrency: 'USD',
      targetCurrency: target,
      convertedAmount,
      formatted
    });

  } catch (err) {
    console.error('API Currency Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
