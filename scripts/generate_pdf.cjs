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
  margins: { top: 32, bottom: 32, left: 36, right: 36 },
  bufferPages: true
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Luxury Editorial Color Palette
const PRIMARY = '#1b1c19';
const ACCENT = '#a83900';
const MUTED = '#555555';
const LIGHT_BG = '#f7f5f0';
const BORDER_COLOR = '#dcd7cc';
const ACCENT_LIGHT = '#faf5ef';
const GREEN = '#1e7b48';
const RED = '#b91c1c';

// Helper for page headers
function renderPageHeader(title, subtitle) {
  doc.rect(36, 32, doc.page.width - 72, 38).fill(PRIMARY);
  doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold').text(title, 48, 41);
  doc.fillColor('#e5a880').fontSize(7.5).font('Helvetica').text(subtitle, 48, 54);
  doc.y = 80;
}

// ----------------- PAGE 1: TITLE & HACKATHON EVALUATION BAR MAPPING -----------------
// Header Banner
doc.rect(36, 32, doc.page.width - 72, 74).fill(PRIMARY);
doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('LUXORA', 48, 44);
doc.fillColor('#e5a880').fontSize(10).font('Helvetica-Bold').text('AI GROWTH & AGENTIC COMMERCE — 5-MINUTE MASTER SCRIPT', 48, 69);
doc.fillColor('#cccccc').fontSize(7.8).font('Helvetica').text('Complete Use Cases • Live Failure & Recovery Scenarios • Explainable • Bounded • Gated • Audit Trail', 48, 84);

doc.y = 118;

// Hackathon Evaluation Bar Matrix Box
doc.rect(36, doc.y, doc.page.width - 72, 102).fillAndStroke(ACCENT_LIGHT, BORDER_COLOR);
doc.fillColor(ACCENT).fontSize(9.5).font('Helvetica-Bold').text('OFFICIAL HACKATHON EVALUATION BAR ALIGNMENT', 46, doc.y + 7);

const evalCriteria = [
  { term: '1. EXPLAINABLE:', desc: 'AI shows data-backed drop-off reasoning, conversion predictions & gross margin impact before any action.' },
  { term: '2. BOUNDED:', desc: 'Autonomous limits capped: discounts capped at 15-30%, spend capped at ₹50,000 to prevent runaway AI spending.' },
  { term: '3. GATED (Human):', desc: 'No changes deploy automatically. Merchant MUST click "Deploy to Storefront" to confirm and activate live.' },
  { term: '4. AUDIT TRAIL:', desc: 'Every transaction, AI query, merchant approval & payment failure is written to immutable Firebase logs.' },
  { term: '5. FAILURE & RECOVERY:', desc: 'Live card decline (ending in 0002) & expired coupons handled gracefully with zero cart loss.' }
];

let evalY = doc.y + 22;
evalCriteria.forEach(c => {
  doc.fillColor(PRIMARY).fontSize(7.8).font('Helvetica-Bold').text(c.term, 46, evalY);
  doc.fillColor('#333333').fontSize(7.8).font('Helvetica').text(c.desc, 155, evalY, { width: doc.page.width - 205 });
  evalY += 15;
});

doc.y = 230;

// 5-Minute Timeline Structure
doc.fillColor(PRIMARY).fontSize(9.5).font('Helvetica-Bold').text('5-MINUTE HIGH-IMPACT VIDEO TIMELINE', 36, doc.y);
doc.moveDown(0.3);

const timelineSteps = [
  { time: '0:00 – 0:45', title: 'Segment 1: Hook & Vision', focus: 'Market gap in luxury retail, conversational commerce, and agentic safeguards.' },
  { time: '0:45 – 1:30', title: 'Segment 2: Full-Stack Architecture & Auth', focus: 'Cloud Firestore, Google Auth, dual BUYER / BUSINESS instant mode toggle.' },
  { time: '1:30 – 2:30', title: 'Segment 3A: Use Case 1 (Atelier Stylist)', focus: 'Gemini reasoning, occasion styling, cross-sell/upsell accessories, and bag sync.' },
  { time: '2:30 – 3:15', title: 'Segment 3B: Use Case 2 (Autonomous Buyout)', focus: '"Acquire Piece" in-chat terminal, SKU check, SHA-256 cryptographic verification.' },
  { time: '3:15 – 4:00', title: 'Segment 4: Use Case 3 & Human Gating', focus: 'AI Copilot revenue analysis, bounded campaign, and "Deploy to Storefront" gate.' },
  { time: '4:00 – 4:35', title: 'Segment 5: Live Failure & Graceful Recovery', focus: 'Card ending in 0002 decline, 100% cart preservation, split-payment alternatives.' },
  { time: '4:35 – 5:00', title: 'Segment 6: Audit Trail & Closing Verdict', focus: 'Firestore audit ledger, raw JSON inspection, and final summary for examiners.' }
];

timelineSteps.forEach(step => {
  const curY = doc.y;
  doc.rect(36, curY, doc.page.width - 72, 21).fillAndStroke('#ffffff', '#e6e2d8');
  doc.fillColor(ACCENT).fontSize(7.8).font('Helvetica-Bold').text(step.time, 44, curY + 5);
  doc.fillColor(PRIMARY).fontSize(7.8).font('Helvetica-Bold').text(step.title, 125, curY + 5);
  doc.fillColor('#555555').fontSize(7.5).font('Helvetica').text(step.focus, 275, curY + 5, { width: doc.page.width - 315 });
  doc.y = curY + 23;
});

doc.moveDown(0.5);

// Key Web App UI Elements Table
doc.fillColor(PRIMARY).fontSize(9.5).font('Helvetica-Bold').text('KEY REAL UI BUTTONS & CONTROLS USED IN THIS DEMO', 36, doc.y);
doc.moveDown(0.3);

const quickButtons = [
  { name: 'BUYER / BUSINESS Toggle', loc: 'Top Nav Bar', purpose: 'Seamless client storefront vs merchant revenue cockpit switch.' },
  { name: 'Sign In / Google Sign In', loc: 'Navbar & Modal', purpose: 'Firebase OAuth login and email verification for private clientele.' },
  { name: '✨ AI Stylist', loc: 'Top Nav & Hero', purpose: 'Drawer for multi-turn Gemini styling, occasion advice and recommendations.' },
  { name: 'Acquire Piece', loc: 'Inside Chat', purpose: 'Autonomous in-chat buyout terminal executing 5-step verified transaction.' },
  { name: 'Deploy to Storefront', loc: 'AI Bot & Strategy', purpose: 'Mandatory Human Gate. Changes to green "✓ Live & Deployed".' },
  { name: 'Settings & Security Audit', loc: 'Merchant Menu', purpose: 'Immutable Firestore audit trail with raw JSON inspector & export.' }
];

quickButtons.forEach(btn => {
  const bY = doc.y;
  doc.rect(36, bY, doc.page.width - 72, 19).fillAndStroke(LIGHT_BG, '#e8e5dc');
  doc.fillColor(ACCENT).fontSize(7.5).font('Helvetica-Bold').text(btn.name, 44, bY + 4);
  doc.fillColor('#111111').fontSize(7).font('Helvetica-Bold').text(`[${btn.loc}]`, 175, bY + 4);
  doc.fillColor('#555555').fontSize(7.2).font('Helvetica').text(btn.purpose, 265, bY + 4, { width: doc.page.width - 305 });
  doc.y = bY + 21;
});

// ----------------- PAGE 2: USE CASE SCENARIOS & ARCHITECTURE -----------------
doc.addPage();
renderPageHeader('SECTION A: CORE USE CASE SCENARIOS', 'Three Real-World Architectures Executed in the Demo Video');

function renderUseCaseCard(num, title, actor, objective, workflow, value) {
  const startY = doc.y;
  doc.rect(36, startY, doc.page.width - 72, 118).fillAndStroke('#ffffff', BORDER_COLOR);
  
  // Title Bar
  doc.rect(36, startY, doc.page.width - 72, 20).fill(LIGHT_BG);
  doc.fillColor(ACCENT).fontSize(8.5).font('Helvetica-Bold').text(`USE CASE ${num}: ${title.toUpperCase()}`, 44, startY + 5);
  doc.fillColor(PRIMARY).fontSize(7.5).font('Helvetica-Bold').text(`Actor: ${actor}`, doc.page.width - 160, startY + 5);

  let cY = startY + 26;
  doc.fillColor(PRIMARY).fontSize(7.5).font('Helvetica-Bold').text('Business Objective: ', 44, cY);
  doc.fillColor('#333333').font('Helvetica').text(objective, 125, cY, { width: doc.page.width - 170 });
  
  cY += 18;
  doc.fillColor(PRIMARY).fontSize(7.5).font('Helvetica-Bold').text('Live Workflow: ', 44, cY);
  doc.fillColor('#333333').font('Helvetica').text(workflow, 125, cY, { width: doc.page.width - 170, lineGap: 1.5 });

  cY += 34;
  doc.fillColor(GREEN).fontSize(7.5).font('Helvetica-Bold').text('Hackathon Bar Value: ', 44, cY);
  doc.fillColor('#222222').font('Helvetica').text(value, 135, cY, { width: doc.page.width - 180, lineGap: 1.5 });

  doc.y = startY + 126;
}

renderUseCaseCard(
  '1',
  'Conversational Styling & Upsell/Cross-Sell Concierge',
  'High-Net-Worth Luxury Shopper',
  'Deliver bespoke styling recommendations on-demand and eliminate search fatigue.',
  '1. Shopper opens "✨ AI Stylist" and requests black-tie gala evening attire.\n2. Gemini evaluates drape, silhouette, and etiquette, curating the Noir Column Dress.\n3. AI proactively cross-sells the matching Diamond Drop Earrings with cohesive styling logic.',
  'Conversational in-app shopping experience with context-aware upselling that increases average order value (AOV) naturally without aggressive ad banners.'
);

renderUseCaseCard(
  '2',
  'Autonomous AI-Buyer Transaction Protocol (Agentic Checkout)',
  'Autonomous Buyer / Authorized Client Agent',
  'Enable autonomous AI buyers to discover, verify and transact under strict security limits.',
  '1. Buyer clicks "Acquire Piece" inside chat conversation.\n2. Verification Gate 1 confirms stock availability in Firestore.\n3. Verification Gate 2 checks transaction amount against Bounded spend caps (<= ₹50,000).\n4. A SHA-256 cryptographic token is minted and order is saved to Firestore ledger.',
  'Zero-friction Conversational In-App Checkout. Fulfills the "transactable by AI buyers" objective with cryptographic auditability.'
);

renderUseCaseCard(
  '3',
  'AI Growth Copilot & Gated Campaign Orchestrator',
  'Merchant Boutique Director',
  'Detect hidden cart abandonment revenue leaks and launch targeted campaigns safely.',
  '1. Merchant asks: "Where are we losing revenue, and how do we fix it?".\n2. AI calculates revenue leak (e.g. 24% cart drop-off) and models a 30% recovery campaign.\n3. AI generates promo "FESTIVE30" but HALTS execution at the Human Gate.\n4. Merchant reviews margin impact and clicks "Deploy to Storefront" to synchronize live.',
  'Explainable (clear reasoning), Bounded (profit margin cap), and Gated (mandatory merchant authorization). Prevents unconstrained AI actions.'
);

// ----------------- PAGE 3: FAILURE SCENARIOS & GRACEFUL RECOVERY -----------------
doc.addPage();
renderPageHeader('SECTION B: FAILURE SCENARIOS & GRACEFUL RECOVERY', 'Critical Hackathon Evaluation Criteria Demonstrated Step-by-Step');

function renderFailureCard(num, title, triggerAction, systemResponse, gracefulRecovery, auditProof) {
  const startY = doc.y;
  doc.rect(36, startY, doc.page.width - 72, 118).fillAndStroke('#ffffff', BORDER_COLOR);

  // Title Bar
  doc.rect(36, startY, doc.page.width - 72, 20).fill('#fff1f0');
  doc.fillColor(RED).fontSize(8.5).font('Helvetica-Bold').text(`FAILURE SCENARIO ${num}: ${title.toUpperCase()}`, 44, startY + 5);

  let cY = startY + 26;
  doc.fillColor(PRIMARY).fontSize(7.5).font('Helvetica-Bold').text('Trigger in Demo: ', 44, cY);
  doc.fillColor(RED).font('Helvetica-Bold').text(triggerAction, 120, cY, { width: doc.page.width - 165 });

  cY += 16;
  doc.fillColor(PRIMARY).fontSize(7.5).font('Helvetica-Bold').text('System Response: ', 44, cY);
  doc.fillColor('#333333').font('Helvetica').text(systemResponse, 120, cY, { width: doc.page.width - 165, lineGap: 1.2 });

  cY += 28;
  doc.fillColor(GREEN).fontSize(7.5).font('Helvetica-Bold').text('Graceful Recovery: ', 44, cY);
  doc.fillColor('#222222').font('Helvetica').text(gracefulRecovery, 125, cY, { width: doc.page.width - 170, lineGap: 1.2 });

  cY += 26;
  doc.fillColor(MUTED).fontSize(7.2).font('Helvetica-Bold').text('Audit Log Proof: ', 44, cY);
  doc.fillColor('#444444').font('Helvetica').text(auditProof, 120, cY, { width: doc.page.width - 165 });

  doc.y = startY + 126;
}

renderFailureCard(
  '1',
  'Payment Gateway Decline / Insufficient Balance (Live Demo)',
  'In Razorpay test modal, enter card number ending in "0002".',
  'Razorpay simulates bank decline: "INSUFFICIENT_BALANCE: Your bank reported insufficient funds for this card."',
  '1. 100% Bag Preservation: Items and total remain safe in the cart with zero lost state.\n2. Zero Phantom Debits: Explicit confirmation that no funds were deducted.\n3. Intelligent Recovery Alternatives: System offers 1-Click Split-Payment, UPI QR code, or alternative card retry.',
  'Event [FAILURE]: Logged with code "BAD_REQUEST_PAYMENT_ACCOUNT_INSUFFICIENT_BALANCE" and card ending "0002".'
);

renderFailureCard(
  '2',
  'Expired Privilege / Deactivated Promotional Code',
  'In the Bag Drawer promo code field, type "EXPIRED20" or "SUMMER2025".',
  'System detects that the promotional campaign has passed its validity window.',
  '1. No aggressive error blocking: User is not blocked or forced to restart checkout.\n2. AI Auto-Upgrade: Concierge displays: "Graceful Recovery: EXPIRED20 has expired, but LUXORA Concierge auto-applied active privilege VIPATELIER10 (10% off) for you!"\n3. Cart value recalculates smoothly with instant discount feedback.',
  'Event [PROMO_EXPIRED]: Recorded in user activity session with automatic fallback application details.'
);

renderFailureCard(
  '3',
  'Bounded Guardrail Over-Discounting Breach',
  'Merchant AI is prompted to create a campaign exceeding 50% discount or > ₹50,000 spend cap.',
  'Guardrail Engine triggers HTTP 422 "BOUNDED_LIMIT_EXCEEDED" due to gross margin risk.',
  '1. Action is locked immediately: AI cannot unilaterally push loss-making promotions.\n2. Transparent Explanation: AI provides margin breakdown showing why the request was held.\n3. Human Gatekeeper Override: Changes require dual-signoff or adjustment within safe margins.',
  'Event [GUARDRAIL_BREACH]: Logged to immutable Firestore ledger with risk assessment parameters.'
);

// ----------------- PAGE 4: SPOKEN SCRIPT PART 1 (0:00 - 2:30) -----------------
doc.addPage();
renderPageHeader('SECTION C: MASTER SCRIPT (PART 1 — 0:00 TO 2:30)', 'Exact Dialogue & Action Cues for Segments 1, 2 & 3A');

function renderScriptRow(time, title, actionCue, dialogue) {
  const startY = doc.y;
  
  // Header
  doc.rect(36, startY, doc.page.width - 72, 17).fill(LIGHT_BG);
  doc.fillColor(ACCENT).fontSize(8.2).font('Helvetica-Bold').text(`${time}  |  ${title}`, 42, startY + 4);
  doc.y = startY + 20;

  // Action Box
  doc.rect(36, doc.y, doc.page.width - 72, 28).fillAndStroke('#ffffff', '#ded9ce');
  doc.fillColor(MUTED).fontSize(7.2).font('Helvetica-Bold').text('ACTION CUE: ', 42, doc.y + 5, { continued: true });
  doc.font('Helvetica').text(actionCue, { width: doc.page.width - 92, lineGap: 1.2 });
  doc.y += 32;

  // Dialogue
  doc.fillColor(PRIMARY).fontSize(7.5).font('Helvetica-Bold').text('SPOKEN DIALOGUE (VERBATIM ENGLISH):', 42, doc.y);
  doc.moveDown(0.2);
  doc.fillColor('#1a1a1a').fontSize(7.8).font('Helvetica').text(dialogue, 42, doc.y, {
    width: doc.page.width - 84,
    lineGap: 2.1
  });
  doc.moveDown(0.7);
}

renderScriptRow(
  '0:00 – 0:45',
  'Segment 1: Hook, Problem & Luxury Agentic Vision',
  'Start on the LUXORA luxury editorial homepage. Pan cursor over the handcrafted evening dress and jewelry. Point out the floating top navigation bar with the dual "BUYER / BUSINESS" toggle pill.',
  '"Hello examiners and judges! Welcome to LUXORA — the next evolution of AI Growth and Agentic Commerce.\n\n' +
  'In the luxury retail world, high-net-worth patrons demand white-glove personal styling on demand. Meanwhile, merchants face rising acquisition costs and silent cart abandonment.\n\n' +
  'LUXORA solves both challenges with an end-to-end, production-grade system: We empower buyers with an intelligent AI Atelier Stylist capable of autonomous in-chat transactions, while equipping merchants with an AI Growth Copilot where every financial action is strictly Explainable, Bounded, and Gated by human consent. Let us begin!"'
);

renderScriptRow(
  '0:45 – 1:30',
  'Segment 2: Full-Stack Architecture, Firebase & Dual Modes',
  'In the top navbar, click "Sign In". Show Google OAuth and email verification screens. Close modal. Click "BUYER" and "BUSINESS" toggle back and forth to show zero-lag instant switching.',
  '"Under the hood, LUXORA is engineered as a robust full-stack application:\n\n' +
  '• Cloud Firestore serves as our real-time database, managing synchronized product catalogs, live customer carts, active growth campaigns, and an immutable security audit ledger.\n' +
  '• For authentication, we implemented full Firebase Auth featuring 1-Click Google Sign-In and private client email verification.\n' +
  '• An Express Node backend powers our server-side Gemini intelligence and Razorpay test-mode transaction tokens.\n\n' +
  'Notice our central toggle: We can switch seamlessly between the client-facing luxury storefront and the merchant intelligence workspace with zero page reload delay!"'
);

renderScriptRow(
  '1:30 – 2:30',
  'Segment 3A: Use Case 1 — AI Atelier Stylist & Conversational Upsell',
  'In Buyer mode, click "✨ AI Stylist" in the navbar. The luxury concierge drawer glides open. Click the quick prompt: "Show silk evening gowns for a black-tie gala". AI replies with styling notes and the Noir Column Dress, plus accessories.',
  '"Now, let us experience Use Case 1: Conversational Luxury Shopping.\n\n' +
  'I click \'✨ AI Stylist\'. Our luxury concierge drawer opens. Let us give the stylist an occasion prompt: \'Show silk evening gowns for a black-tie gala\'.\n\n' +
  'Watch the AI response: Powered by Gemini reasoning, it does not just return static links. It analyzes evening dress codes, fabric drape, and silhouette elegance to recommend the handcrafted Noir Column Dress.\n\n' +
  'Notice the intelligent Upsell & Cross-Sell: It automatically curates matching Diamond Drop Earrings to complete the black-tie ensemble, boosting merchant Average Order Value naturally through genuine styling expertise."'
);

// ----------------- PAGE 5: SPOKEN SCRIPT PART 2 (2:30 - 5:00) -----------------
doc.addPage();
renderPageHeader('SECTION C: MASTER SCRIPT (PART 2 — 2:30 TO 5:00)', 'Exact Dialogue & Action Cues for Buyout, Gating, Failure & Audit');

renderScriptRow(
  '2:30 – 3:15',
  'Segment 3B: Use Case 2 — Autonomous In-Chat Buyout & SHA-256 Token',
  'Inside the Atelier chat drawer, click "Acquire Piece" under the Noir Column Dress. The Autonomous Terminal executes 5 verification steps and mints a SHA-256 token.',
  '"Now comes our biggest innovation — Agentic In-Chat Checkout:\n\n' +
  'Instead of sending the client through repetitive checkout forms, the patron can authorize an in-chat acquisition.\n\n' +
  'I click \'Acquire Piece\'. Watch our autonomous terminal execute a 5-step safety handshake:\n' +
  '1. It verifies live inventory in Firestore.\n' +
  '2. It checks gross-margin safety thresholds.\n' +
  '3. It generates a cryptographic SHA-256 tamper-proof token.\n' +
  '4. It reserves the atelier piece.\n' +
  '5. And commits the verified order straight to the client ledger with complete traceability!"'
);

renderScriptRow(
  '3:15 – 4:00',
  'Segment 4: Use Case 3 — Explainable AI, Bounded Limits & Human Gate',
  'Toggle to "BUSINESS" mode. Click "AI Bot & Strategy" tab. Click the question: "Kaha kitna revenue loss ho rha kyu ho rha kaise theek kr sakte?". Copilot calculates loss and models FESTIVE30. Show the Human Gate. Click "Deploy to Storefront".',
  '"Next, let us see how LUXORA empowers merchants while meeting every hackathon safeguard:\n\n' +
  'We toggle into the \'BUSINESS\' cockpit. In \'AI Bot & Strategy\', we ask: \'Where are we losing revenue, and how do we fix it?\'.\n\n' +
  'Notice how the AI is 100% Explainable: It identifies cart friction on gowns and proposes a 30% recovery campaign, explicitly calculating gross-margin impact.\n\n' +
  'Crucially, notice the Gated Human-in-the-Loop protection: The AI cannot unilaterally alter the live store. It prepares the promotion, but requires human signoff.\n\n' +
  'As I click \'Deploy to Storefront\', the system updates Firebase and turns green with \'✓ Live & Deployed\'!"'
);

renderScriptRow(
  '4:00 – 4:35',
  'Segment 5: Failure Scenarios & Deterministic Graceful Recovery',
  'Switch to Buyer mode. Open Bag Drawer. 1) Type "EXPIRED20" in promo field to show graceful auto-upgrade. 2) Click Checkout -> Pay with Razorpay. Enter test card ending in "0002" and click Pay. Red decline banner appears. Highlight cart preservation.',
  '"Now, let us examine how LUXORA handles real-world failures gracefully:\n\n' +
  'First, promo code failure: If a customer inputs \'EXPIRED20\', our concierge does not crash. It informs them politely and auto-applies active privilege VIPATELIER10.\n\n' +
  'Second, payment decline failure: In our Razorpay test modal, I enter a test card ending in \'0002\'.\n\n' +
  'Watch what happens: The gateway simulates an Insufficient Balance decline. Notice our Graceful Recovery: Zero cart loss! The client\'s bag and total remain 100% preserved, zero duplicate debits occur, and the system instantly provides split-payment and UPI QR alternatives."'
);

renderScriptRow(
  '4:35 – 5:00',
  'Segment 6: Immutable Audit Trail & Final Summary for Examiners',
  'Navigate to "Settings & Security Audit" tab. Click on a log row to reveal raw JSON payload and cryptographic timestamp. Turn to camera for final concluding remarks.',
  '"Finally, our Audit Trail: Under \'Settings & Security Audit\', every single monetary action, AI reasoning step, merchant gate approval, and payment failure is recorded in an immutable Firestore audit ledger with raw JSON inspection and 1-click export.\n\n' +
  'In conclusion, LUXORA delivers on every evaluation criteria: Explainable reasoning, Bounded margin limits, Gated human authorization, Conversational AI checkout, and complete Failure Resilience.\n\n' +
  'Thank you, examiners and judges — we look forward to your questions!"'
);

// ----------------- PAGE 6: EXAMINER Q&A & SCORING SUMMARY -----------------
doc.addPage();
renderPageHeader('SECTION D: EXAMINER Q&A & SCORING CHECKLIST', 'Defensive Answers to Likely Judge Questions During Presentation');

function renderQABox(question, answer) {
  const startY = doc.y;
  doc.rect(36, startY, doc.page.width - 72, 54).fillAndStroke('#ffffff', BORDER_COLOR);
  doc.fillColor(ACCENT).fontSize(7.8).font('Helvetica-Bold').text(`Q: "${question}"`, 44, startY + 6);
  doc.fillColor('#222222').fontSize(7.5).font('Helvetica').text(answer, 44, startY + 20, {
    width: doc.page.width - 88,
    lineGap: 1.5
  });
  doc.y = startY + 60;
}

renderQABox(
  'How does LUXORA ensure the AI doesn\'t offer 90% discounts and bankrupt the merchant?',
  'Through our Bounded Guardrail Policy. All AI proposals are clamped to a maximum 15-30% discount ceiling and checked against gross margins. Furthermore, every promotion is Gated by mandatory merchant signoff ("Deploy to Storefront") before reaching the live storefront marquee.'
);

renderQABox(
  'What happens when a customer\'s card fails or payment gateway timeouts?',
  'We implement Deterministic Failure Recovery: Shopping cart state is never wiped, zero ghost debits occur, the exact decline code is logged in the Audit Trail, and the user is offered 1-click retry alternatives including Split-Payment and UPI QR codes.'
);

renderQABox(
  'How is an AI-buyer transaction authenticated without human button clicks?',
  'Through our Agent Buyer Terminal protocol. The AI agent submits an acquisition request verified against active Firestore inventory, checks that the amount does not exceed the ₹50,000 spend cap, and mints an immutable SHA-256 token linked to the client\'s verified account.'
);

renderQABox(
  'Where is data stored and how is the audit trail secured?',
  'Data is persisted in Firebase Cloud Firestore across collections: `products`, `campaigns`, `orders`, and `audit_logs`. The audit logs contain client timestamps, IP/user tokens, action payloads, and state hashes that cannot be modified post-creation.'
);

doc.moveDown(0.5);

// Final Scoring Box
doc.rect(36, doc.y, doc.page.width - 72, 60).fillAndStroke(LIGHT_BG, BORDER_COLOR);
doc.fillColor(PRIMARY).fontSize(8.5).font('Helvetica-Bold').text('FINAL PRESENTATION CHECKLIST FOR MAXIMUM MARKS', 44, doc.y + 6);
doc.fillColor('#333333').fontSize(7.5).font('Helvetica').text(
  '✔ Showed Google Auth & Dual Mode Toggle (0:45)    ✔ Demonstrated AI Atelier Stylist & Gala Recommendation (1:30)\n' +
  '✔ Triggered "Acquire Piece" In-Chat Buyout (2:30)    ✔ Asked AI Bot & Clicked "Deploy to Storefront" (3:15)\n' +
  '✔ Tested Card Ending 0002 Decline with Cart Kept (4:00)    ✔ Opened Firestore Audit Trail & Inspected JSON (4:35)',
  44,
  doc.y + 22,
  { width: doc.page.width - 88, lineGap: 3 }
);

// Footer across all pages
const totalPages = doc.bufferedPageRange().count;
for (let i = 0; i < totalPages; i++) {
  doc.switchToPage(i);
  doc.rect(36, doc.page.height - 24, doc.page.width - 72, 0.5).fill('#cccccc');
  doc.fillColor(MUTED).fontSize(7).font('Helvetica').text(
    `LUXORA • AI Growth & Agentic Commerce Master Script • Evaluation Bar & Failure Scenarios Edition • Page ${i + 1} of ${totalPages}`,
    36,
    doc.page.height - 16,
    { align: 'center', width: doc.page.width - 72 }
  );
}

doc.end();

writeStream.on('finish', () => {
  console.log('Master English PDF generated successfully at:', outputPath);
});
