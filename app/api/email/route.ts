import { NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit, getIP } from "../../../lib/rateLimit";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const ip = getIP(request);
  if (!rateLimit(ip, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { type, to, data } = body;

    let subject = "";
    let html = "";

    if (type === "sale") {
      subject = `🎉 You sold ${data.card_name} on WaveTCG!`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000008; color: #ffffff; padding: 32px; border-radius: 16px;">
          <h1 style="color: #0099ff; font-size: 24px;">🎉 Card Sold!</h1>
          <p style="color: #c8d8f0;">Your card <strong style="color: #ffffff;">${data.card_name}</strong> was purchased on WaveTCG.</p>
          
          <div style="background: #050515; border: 1px solid rgba(0,153,255,0.2); border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #00d4ff; font-size: 16px; margin-bottom: 16px;">💰 Sale Details</h2>
            <p style="color: #8899bb; margin: 4px 0;">Card: <span style="color: #fff;">${data.card_name}</span></p>
            <p style="color: #8899bb; margin: 4px 0;">Price: <span style="color: #00d4ff;">${data.price_sui} SUI</span></p>
            <p style="color: #8899bb; margin: 4px 0;">Transaction: <span style="color: #0099ff;">${data.tx_digest?.slice(0, 16)}...</span></p>
          </div>

          <div style="background: #050515; border: 1px solid rgba(0,255,136,0.2); border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #00ff88; font-size: 16px; margin-bottom: 16px;">📦 Buyer Shipping Details</h2>
            <p style="color: #8899bb; margin: 4px 0;">Name: <span style="color: #fff;">${data.shipping_name}</span></p>
            <p style="color: #8899bb; margin: 4px 0;">Phone: <span style="color: #fff;">${data.shipping_phone}</span></p>
            <p style="color: #8899bb; margin: 4px 0;">Email: <span style="color: #fff;">${data.shipping_email}</span></p>
            <p style="color: #8899bb; margin: 4px 0;">Address: <span style="color: #fff;">${data.shipping_address}</span></p>
            <p style="color: #8899bb; margin: 4px 0;">City: <span style="color: #fff;">${data.shipping_city}</span></p>
            <p style="color: #8899bb; margin: 4px 0;">Province: <span style="color: #fff;">${data.shipping_province}</span></p>
            <p style="color: #8899bb; margin: 4px 0;">Country: <span style="color: #fff;">${data.shipping_country}</span></p>
            <p style="color: #8899bb; margin: 4px 0;">ZIP: <span style="color: #fff;">${data.shipping_zip}</span></p>
            ${data.shipping_notes ? `<p style="color: #ffcc00; margin: 8px 0;">📝 Notes: ${data.shipping_notes}</p>` : ''}
          </div>

          <a href="https://www.wavetcgmarket.com/orders" style="display: inline-block; background: linear-gradient(135deg, #0055ff, #0099ff); color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Order →</a>
          
          <p style="color: #444460; font-size: 12px; margin-top: 24px;">WaveTCG · Powered by Sui Blockchain</p>
        </div>
      `;
    } else if (type === "message") {
      subject = `💬 New message on WaveTCG`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000008; color: #ffffff; padding: 32px; border-radius: 16px;">
          <h1 style="color: #0099ff; font-size: 24px;">💬 New Message</h1>
          <p style="color: #c8d8f0;">You have a new message about <strong>${data.card_name}</strong>.</p>
          <div style="background: #050515; border: 1px solid rgba(0,153,255,0.2); border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="color: #8899bb;">From: <span style="color: #fff;">${data.sender?.slice(0, 8)}...${data.sender?.slice(-6)}</span></p>
            <p style="color: #ffffff; font-size: 16px; margin-top: 12px;">"${data.message}"</p>
          </div>
          <a href="https://www.wavetcgmarket.com/marketplace" style="display: inline-block; background: linear-gradient(135deg, #0055ff, #0099ff); color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reply →</a>
          <p style="color: #444460; font-size: 12px; margin-top: 24px;">WaveTCG · Powered by Sui Blockchain</p>
        </div>
      `;
    } else if (type === "offer") {
      subject = `🤝 New offer on ${data.card_name}!`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000008; color: #ffffff; padding: 32px; border-radius: 16px;">
          <h1 style="color: #0099ff; font-size: 24px;">🤝 New Offer!</h1>
          <p style="color: #c8d8f0;">Someone made an offer on your card <strong>${data.card_name}</strong>.</p>
          <div style="background: #050515; border: 1px solid rgba(0,153,255,0.2); border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="color: #8899bb;">Offer: <span style="color: #00d4ff; font-size: 20px; font-weight: bold;">${data.offer_sui} SUI</span></p>
            <p style="color: #8899bb;">From: <span style="color: #fff;">${data.buyer?.slice(0, 8)}...${data.buyer?.slice(-6)}</span></p>
          </div>
          <a href="https://www.wavetcgmarket.com/marketplace" style="display: inline-block; background: linear-gradient(135deg, #0055ff, #0099ff); color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Offer →</a>
          <p style="color: #444460; font-size: 12px; margin-top: 24px;">WaveTCG · Powered by Sui Blockchain</p>
        </div>
      `;
    }

    const { data: emailData, error } = await resend.emails.send({
      from: "WaveTCG <noreply@wavetcgmarket.com>",
      to: [to],
      subject,
      html,
    });

    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ success: true, id: emailData?.id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
