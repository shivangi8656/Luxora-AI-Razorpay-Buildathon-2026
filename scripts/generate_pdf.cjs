const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outputPath = path.join(__dirname, '../public/Luxora_AI_Commerce_5Min_Video_Script.pdf');

// Ensure directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 40, left: 45, right: 45 },
  bufferPages: true
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Colors
const PRIMARY = '#1b1c19';
const ACCENT = '#a83900';
const MUTED = '#555555';
const LIGHT_BG = '#f5f3ee';
const BORDER_COLOR = '#d6d1c4';

// Helper for section headers
function addSectionHeader(title, subtitle) {
  doc.addPage();
  doc.rect(45, 40, doc.page.width - 90, 36).fill(LIGHT_BG);
  doc.fillColor(ACCENT).fontSize(14).font('Helvetica-Bold').text(title, 55, 48);
  if (subtitle) {
    doc.fillColor(MUTED).fontSize(9).font('Helvetica').text(subtitle, 55, 64);
  }
  doc.moveDown(1.5);
}

// ----------------- PAGE 1: TITLE & EXECUTIVE SUMMARY -----------------
// Header Banner
doc.rect(45, 40, doc.page.width - 90, 75).fill(PRIMARY);
doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('LUXORA', 60, 52);
doc.fillColor('#e5a880').fontSize(11).font('Helvetica-Bold').text('01. AI GROWTH & AGENTIC COMMERCE | 5-MINUTE VIDEO DEMO SCRIPT', 60, 78);
doc.fillColor('#bbbbbb').fontSize(9).font('Helvetica').text('Complete Presenter Guide, Step-by-Step Dialogues & Evaluation Bar Compliance', 60, 93);

doc.y = 130;

// Objective Box
doc.rect(45, doc.y, doc.page.width - 90, 68).fillAndStroke('#faf8f5', BORDER_COLOR);
doc.fillColor(ACCENT).fontSize(11).font('Helvetica-Bold').text('CHALLENGE OBJECTIVE & CORE CRITERIA', 55, doc.y + 10);
doc.fillColor('#222222').fontSize(9).font('Helvetica').text(
  'Build AI solutions that can increase merchant revenue or enable merchants to become transactable by AI buyers. Every money-related action must be Explainable, Bounded, and Gated. The solution must demonstrate an Audit Trail, at least one Failure Scenario, and Graceful Failure Handling.',
  55,
  doc.y + 24,
  { width: doc.page.width - 110, lineGap: 2 }
);

doc.y = 215;

// Evaluation Bar Matrix
doc.fillColor(PRIMARY).fontSize(12).font('Helvetica-Bold').text('EVALUATION BAR COMPLIANCE MATRIX', 45, doc.y);
doc.moveDown(0.5);

const criteria = [
  {
    pillar: 'Explainable',
    desc: 'Merchant Copilot provides transparent growth projections, margin impact breakdowns, and financial rationale for every automated suggestion.'
  },
  {
    pillar: 'Bounded',
    desc: 'Discounts, coupon values, and inventory limits are strictly bounded within gross margin safety guardrails (capped % and pricing thresholds).'
  },
  {
    pillar: 'Gated',
    desc: 'Human-in-the-loop consent is mandatory. No coupon, price, or campaign goes live without merchant confirmation and 1-click gated deployment.'
  },
  {
    pillar: 'Audit Trail',
    desc: 'Real-time enterprise audit logging captures all merchant confirmations, AI proposals, coupon state changes, and transaction payloads with timestamps.'
  },
  {
    pillar: 'Failure Scenario',
    desc: 'Demonstrates deactivated privilege re-application and Razorpay test-mode payment gateway decline simulations.'
  },
  {
    pillar: 'Graceful Recovery',
    desc: 'Zero cart abandonment on payment decline, user-friendly fallback messaging, and deterministic error handling without double deduction.'
  }
];

criteria.forEach((item) => {
  const curY = doc.y;
  doc.rect(45, curY, doc.page.width - 90, 36).fillAndStroke('#ffffff', '#e5e2d9');
  doc.fillColor(ACCENT).fontSize(9.5).font('Helvetica-Bold').text(item.pillar, 55, curY + 6);
  doc.fillColor('#333333').fontSize(8.5).font('Helvetica').text(item.desc, 140, curY + 6, {
    width: doc.page.width - 195,
    lineGap: 1.5
  });
  doc.y = curY + 40;
});

doc.moveDown(0.5);
doc.rect(45, doc.y, doc.page.width - 90, 50).fillAndStroke(LIGHT_BG, BORDER_COLOR);
doc.fillColor(PRIMARY).fontSize(10).font('Helvetica-Bold').text('VIDEO PRESENTATION STRUCTURE (5 MINUTES TOTAL)', 55, doc.y + 8);
doc.fillColor(MUTED).fontSize(8.5).font('Helvetica').text(
  '• Min 0:00-0:45: Hook & Dual-Portal Architecture | • Min 0:45-1:45: Merchant Copilot Telemetry\n• Min 1:45-2:30: Gated Deployment & Storefront Sync | • Min 2:30-3:30: Conversational Checkout\n• Min 3:30-4:15: Failure Scenario & Graceful Recovery | • Min 4:15-5:00: Audit Trail & Closing',
  55,
  doc.y + 22,
  { width: doc.page.width - 110, lineGap: 2 }
);

// ----------------- PAGE 2: SCRIPT PART 1 (0:00 - 2:30) -----------------
doc.addPage();

doc.rect(45, 40, doc.page.width - 90, 32).fill(PRIMARY);
doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold').text('PART 1: THE HOOK, COPILOT TELEMETRY & GATED DEPLOYMENT', 55, 50);

doc.y = 85;

function addScriptBlock(timeRange, title, visualPrompt, dialogue) {
  const startY = doc.y;
  
  // Header tag
  doc.rect(45, startY, doc.page.width - 90, 20).fill(LIGHT_BG);
  doc.fillColor(ACCENT).fontSize(9.5).font('Helvetica-Bold').text(`${timeRange}  |  ${title}`, 52, startY + 5);
  doc.y = startY + 25;

  // Visual Cue Box
  doc.fillColor(MUTED).fontSize(8.5).font('Helvetica-Bold').text('SCREEN / ACTION: ', 52, doc.y, { continued: true });
  doc.font('Helvetica').text(visualPrompt, { width: doc.page.width - 110 });
  doc.moveDown(0.4);

  // Dialogue Box
  doc.rect(45, doc.y, doc.page.width - 90, 1).fill('#e0ded7');
  doc.moveDown(0.4);
  doc.fillColor(PRIMARY).fontSize(8.5).font('Helvetica-Bold').text('SPOKEN DIALOGUE:', 52, doc.y);
  doc.moveDown(0.2);
  doc.fillColor('#1e1e1e').fontSize(8.5).font('Helvetica').text(dialogue, 52, doc.y, {
    width: doc.page.width - 105,
    lineGap: 2.2
  });
  doc.moveDown(1.2);
}

addScriptBlock(
  '0:00 – 0:45',
  'Hook & Dual-Engine Problem Statement',
  'Start on the Luxora editorial landing page. Showcase the sleek dual toggle: "Buyer" vs "Business".',
  '"Hello judges! Welcome to Luxora — an end-to-end AI Growth and Agentic Commerce platform built for high-value merchants and autonomous AI buyers.\n\nToday, e-commerce faces a two-sided challenge:\n1. Merchants struggle to spot live revenue leaks and take hours to formulate and deploy safe promotional campaigns.\n2. Autonomous AI buyers demand transactable, machine-readable stores where money-related actions are strictly explainable, bounded, and gated.\n\nLuxora solves both sides through a unified dual portal: a live Buyer Storefront with Conversational Checkout, paired with an Autonomous Merchant Growth Copilot backed by enterprise audit governance. Let\'s see it in action!"'
);

addScriptBlock(
  '0:45 – 1:45',
  'Merchant Copilot: Natural Language & Revenue Telemetry',
  'Click header toggle to "Business". Open Merchant Workspace AI Copilot. Click or type: "Kaha kitna revenue loss ho rha kyu ho rha kaise theek kr sakte?"',
  '"We switch directly into the Merchant Workspace. Our AI Copilot communicates fluently in English, Hindi, and Hinglish.\n\nLet\'s ask a candid merchant inquiry: \'Kaha kitna revenue loss ho rha kyu ho rha kaise theek kr sakte?\'\n\nObserve how the Copilot responds: It doesn\'t offer generic advice. It scans live funnel telemetry, isolates cart drop-offs on the Noir Column Dress, and models an exact recovery plan.\n\nThis demonstrates our first core pillar: Explainability. The AI delivers clear Growth Highlights, Margin Risk analysis, and an explicit action rationale before suggesting any monetary change."'
);

addScriptBlock(
  '1:45 – 2:30',
  'Bounded & Gated Execution (Live Storefront Sync)',
  'Type: "Haan coupon FESTIVE30 pe 30% off active kr do". Highlight the confirmation box, then click "Deploy to Storefront". Show the spinner turning into green "Live & Deployed".',
  '"Now, let\'s examine the hackathon evaluation bar:\n• Is this action Bounded? Yes, discount rates are checked against strict gross-margin guardrails.\n• Is it Gated? Absolutely. The AI is forbidden from pushing promos live autonomously. It presents a gated confirmation panel requiring merchant sign-off.\n\nI say: \'Haan coupon FESTIVE30 pe 30% off active kr do\'. The AI verifies the rule and prompts for approval. As I click \'Deploy to Storefront\', watch the real-time sync:\nInstant visual feedback — the button transitions into a verified green \'Live & Deployed\' state, and a sync alert confirms deployment across the storefront!"'
);

// ----------------- PAGE 3: SCRIPT PART 2 (2:30 - 5:00) -----------------
doc.addPage();

doc.rect(45, 40, doc.page.width - 90, 32).fill(PRIMARY);
doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold').text('PART 2: BUYER CHECKOUT, FAILURE SCENARIO & AUDIT TRAIL', 55, 50);

doc.y = 85;

addScriptBlock(
  '2:30 – 3:30',
  'Omnichannel Verification & Conversational Checkout',
  'Toggle back to "Buyer" mode. Point out the top Hero Marquee showing FESTIVE30. Add an item to bag, open Bag Drawer, see FESTIVE30 auto-applied, click Proceed to Checkout.',
  '"Let\'s verify omnichannel synchronization. We glide back to the Buyer Storefront with zero page reloads.\n\nLook at the Hero Coupon Marquee and promotional banner: FESTIVE30 is live and streaming!\n\nAs a buyer, I add the luxury piece to my bag and slide open the Bag Drawer. The newly deployed FESTIVE30 coupon is automatically recognized, deducting 30% from the order subtotal.\n\nWhen I proceed to checkout, our Conversational Checkout and Razorpay Test-Mode integration initiates, ensuring bounded tokenization and a seamless buying journey."'
);

addScriptBlock(
  '3:30 – 4:15',
  'Failure Scenarios & Deterministic Graceful Recovery',
  'Demo two scenarios: 1. Deactivating a coupon and seeing graceful rejection at checkout. 2. Razorpay test-mode payment gateway decline simulation.',
  '"Now to the most critical hackathon criteria: Failure Scenarios and Graceful Handling.\n\nFailure Scenario 1: Deactivated or Expired Privilege.\nIn Merchant AI, if we instruct \'Ye coupon deactivate kar do\', the promo is instantly killed from the active registry. If a shopper attempts to apply the old code, the app does not break or crash — it delivers a polite, informative notice: \'This privilege has expired\' and auto-recommends current active alternatives.\n\nFailure Scenario 2: Payment Gateway Decline.\nDuring Razorpay checkout, if a payment is declined or times out, our architecture guarantees zero cart state loss. The items remain securely locked in the bag, a human-readable failure diagnosis is displayed, and a 1-click retry is offered with zero duplicate charge risk."'
);

addScriptBlock(
  '4:15 – 5:00',
  'Enterprise Audit Trail Governance & High-Impact Closing',
  'Navigate to Merchant Workspace -> "Audit Governance" tab. Show logged events with timestamps and JSON payload viewer. Finish on camera or dual view.',
  '"Finally, financial safety is impossible without total accountability. Here is our Enterprise Audit Trail.\n\nEvery single action is permanently recorded:\n• The AI\'s proposed coupon and stock changes.\n• The merchant\'s cryptographic approval timestamp.\n• Razorpay test order IDs, payment statuses, and balance reconciliations.\nMerchants can inspect raw JSON payloads or export audit reports in one click.\n\nTo conclude: Luxora transforms passive digital boutiques into Autonomous, High-Converting Commerce Engines. Every dollar-related action is Explainable, Bounded, Gated by human consent, audited end-to-end, and resilient against edge-case failures. Thank you!"'
);

// ----------------- PAGE 4: PRESENTER TIPS & HACKATHON BONUS -----------------
doc.addPage();

doc.rect(45, 40, doc.page.width - 90, 32).fill(PRIMARY);
doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold').text('PRESENTER CHECKLIST, DEMO TIPS & ADDED FEATURES', 55, 50);

doc.y = 85;

doc.fillColor(PRIMARY).fontSize(11).font('Helvetica-Bold').text('TOP 5 RECORDING TIPS FOR MAXIMUM JUDGING IMPACT', 45, doc.y);
doc.moveDown(0.4);

const tips = [
  'Pacing is King: Speak calmly. When clicking "Deploy to Storefront", pause for 1 second to let the judges register the deploying spinner and the green "Live & Deployed" badge.',
  'Show the Instant Sync: Emphasize that toggling between Buyer and Merchant modes has 0 reload time because state is unified in real time.',
  'Use the Exact Hackathon Terminology: Use words like "Explainable", "Bounded", "Gated", "Human-in-the-loop", and "Graceful Recovery" verbatim — judges look for these keywords on their scoring sheets.',
  'Highlight Multilingual NLP: Mention that the Merchant Copilot natively understands Hindi ("kaha kitna loss ho rha"), Hinglish ("coupon pe 30% off active kr do"), and formal English without breaking a sweat.',
  'Audit Tab Proof: Spend at least 25 seconds on the Audit Trail tab to visually validate the enterprise governance story.'
];

tips.forEach((tip, idx) => {
  const curY = doc.y;
  doc.circle(52, curY + 5, 3).fill(ACCENT);
  doc.fillColor('#222222').fontSize(9).font('Helvetica').text(tip, 62, curY, {
    width: doc.page.width - 110,
    lineGap: 2
  });
  doc.moveDown(0.5);
});

doc.moveDown(0.8);
doc.fillColor(PRIMARY).fontSize(11).font('Helvetica-Bold').text('ADDED POWER FEATURES IMPLEMENTED IN LUXORA', 45, doc.y);
doc.moveDown(0.4);

const addedFeatures = [
  {
    title: 'Omnichannel Coupon Marquee',
    desc: 'Newly activated coupons stream directly in the luxury storefront marquee and promo ticker.'
  },
  {
    title: 'Dynamic Bag Drawer with Auto-Detection',
    desc: 'Shoppers see live discount recalculations without manually typing promo codes.'
  },
  {
    title: 'Razorpay Test-Mode Gateway Emulation',
    desc: 'Realistic checkout flows with failure toggles, transaction IDs, and idempotency guarantees.'
  },
  {
    title: 'Catalog Inventory Guardrails',
    desc: 'Prevents merchants from overselling or setting irrational price cuts via voice/chat prompts.'
  },
  {
    title: 'Instant Audit Export',
    desc: 'Enterprise-grade JSON audit export for regulatory compliance and accountant review.'
  }
];

addedFeatures.forEach((feat) => {
  const curY = doc.y;
  doc.rect(45, curY, doc.page.width - 90, 32).fillAndStroke('#faf8f5', '#e8e5dc');
  doc.fillColor(ACCENT).fontSize(9).font('Helvetica-Bold').text(feat.title, 55, curY + 6);
  doc.fillColor('#444444').fontSize(8.5).font('Helvetica').text(feat.desc, 55, curY + 18, {
    width: doc.page.width - 110
  });
  doc.y = curY + 36;
});

// Footer across all pages
const totalPages = doc.bufferedPageRange().count;
for (let i = 0; i < totalPages; i++) {
  doc.switchToPage(i);
  doc.rect(45, doc.page.height - 35, doc.page.width - 90, 0.5).fill('#cccccc');
  doc.fillColor(MUTED).fontSize(8).font('Helvetica').text(
    `LUXORA • AI Growth & Agentic Commerce Video Script • Page ${i + 1} of ${totalPages}`,
    45,
    doc.page.height - 25,
    { align: 'center', width: doc.page.width - 90 }
  );
}

doc.end();

writeStream.on('finish', () => {
  console.log('PDF generated successfully at:', outputPath);
});
