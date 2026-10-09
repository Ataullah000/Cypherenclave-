/**
 * Cypherenclave assistant — natural, friendly, helpful.
 * Talks like a smart friend: explains from scratch, corrects mistakes gently,
 * never boring template spam. Harmful content blocked upstream in Workspace.
 */

export type ChatMessage = { role: 'user' | 'ai'; text: string }

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function has(t: string, ...words: string[]) {
  const x = t.toLowerCase()
  return words.some(w => x.includes(w.toLowerCase()))
}

function isBangla(t: string) {
  return /[\u0980-\u09FF]/.test(t)
}

/** Gentle correction when user states something inaccurate */
function maybeCorrect(lower: string): string | null {
  // Common misconceptions — correct kindly, then teach
  if (has(lower, 'html is a programming language') || has(lower, 'html programming language')) {
    return `Almost — but not quite. HTML is a *markup* language, not a programming language. It describes structure (headings, paragraphs, links). It doesn't do logic like loops or conditions on its own.

Programming languages (JavaScript, Python, etc.) *do* things. HTML *labels* content so the browser knows what it is.

A tiny example:
\`\`\`html
<h1>Hello</h1>
<p>This is a paragraph.</p>
\`\`\`

Want me to show how HTML + CSS + JavaScript fit together from the ground up?`
  }

  if (has(lower, 'javascript and java') && has(lower, 'same') || has(lower, 'java is same as javascript') || has(lower, 'javascript is java')) {
    return `Common mix-up! Java and JavaScript are *different* languages. The similar name is mostly historical marketing.

• **Java** — runs on the JVM, often used for backend, Android, big systems  
• **JavaScript** — runs in browsers (and Node.js), powers interactive web pages  

They don't share code. Think of them like "car" and "carpet" — related letters, different things.

Want a simple side-by-side comparison or a first JavaScript example?`
  }

  if (has(lower, 'http is secure') || has(lower, 'http is safe') || (has(lower, 'http') && has(lower, 'encrypted') && !has(lower, 'https'))) {
    return `Careful on this one — plain **HTTP** is *not* encrypted. Anyone on the network path can read the traffic.

**HTTPS** (the S = TLS/SSL) encrypts the connection. That's why browsers show a lock icon.

Rule of thumb: never type passwords or personal data on a page that only says \`http://\`.

I can explain how TLS works in plain language if you want.`
  }

  if (has(lower, 'ai is always right') || has(lower, 'ai never wrong') || has(lower, 'chatgpt always correct')) {
    return `I appreciate the trust — but no. AI (including me) can be wrong, outdated, or overconfident. Always double-check important facts, code, and advice — especially legal, medical, or financial stuff.

I'm here to think *with* you, not replace your judgment. If something I say feels off, challenge it. That's the healthy way to use any assistant.`
  }

  if (has(lower, 'password') && has(lower, 'share') && has(lower, 'email')) {
    return `I'd push back on that. Don't share real passwords over email or chat — even with "trusted" people or tools. Use a password manager and share via its secure share feature if you must.

If you're asking hypothetically about *policy* (e.g. how companies should handle resets), I can help design a safe flow. What's the actual goal?`
  }

  return null
}

/** Explain common topics from first principles */
function explainTopic(lower: string, original: string): string | null {
  // Math basics
  if (has(lower, 'what is algebra') || has(lower, 'algebra কি') || has(lower, 'algebra kya') || (has(lower, 'algebra') && has(lower, 'explain'))) {
    return isBangla(original)
      ? `অ্যালজেবরা হলো গণিতের সেই অংশ যেখানে সংখ্যার বদলে অক্ষর (x, y) ব্যবহার করে সাধারণ নিয়ম লেখা হয়।

সহজ উদাহরণ:  
তুমি জানো না একটা সংখ্যা কত, কিন্তু জানো সেটা ৫ যোগ করলে ১২ হয়।  
লিখবে: x + 5 = 12  
তাহলে x = 7

কেন দরকার? যাতে একই নিয়ম অনেক সমস্যায় লাগানো যায় — দোকানের হিসাব, বিজ্ঞানের সূত্র, প্রোগ্রামিং — সব জায়গায়।

একটা ছোট অঙ্ক একসাথে করি? নাকি সমীকরণের ধরনগুলো দেখতে চাও?`
      : `Algebra is just math where we use letters (like x or y) to stand for numbers we don't know yet — so we can write rules that work for many cases.

Simple example:  
You don't know a number, but you know: that number plus 5 equals 12.  
Write: x + 5 = 12  
Then x = 7.

Why it matters: same pattern shows up in business, science, and code. Once you can move symbols around carefully, a lot of problems get easier.

Want to solve a small equation together, or start from "what is a variable"?`
  }

  if (has(lower, 'what is fraction') || has(lower, 'ভগ্নাংশ') || (has(lower, 'fraction') && has(lower, 'explain'))) {
    return isBangla(original)
      ? `ভগ্নাংশ মানে পুরোটার একটা অংশ।

যেমন পিজ্জার ১টা কেটে ৪ ভাগ করলে এক ভাগ = ১/৪  
• উপরের সংখ্যা (১) = কত অংশ নিচ্ছ  
• নিচের সংখ্যা (৪) = মোট কত ভাগ

১/২ + ১/২ = ১ (পুরো)  
২/৪ = ১/২ (একই মান, আলাদা রূপ)

কোন জায়গায় আটকেছ — যোগ, বিয়োগ, নাকি অর্থ বোঝা?`
      : `A fraction is a way to talk about *part of a whole*.

Pizza cut into 4 equal slices: one slice is 1/4.  
• Top number (numerator) = how many parts you have  
• Bottom number (denominator) = how many equal parts the whole was split into

1/2 + 1/2 = 1 (the whole)  
2/4 is the same amount as 1/2 — just written differently.

Where are you stuck — adding them, simplifying, or the idea itself?`
  }

  if (has(lower, 'pythagoras') || has(lower, 'পইথাগোরাস') || has(lower, 'a2+b2')) {
    return `Pythagoras' theorem is about *right-angled* triangles only (one angle is 90°).

If the two shorter sides are a and b, and the longest side (opposite the right angle) is c:

**a² + b² = c²**

Example: a = 3, b = 4 → 9 + 16 = 25 → c = 5. That's the famous 3-4-5 triangle.

It only works for right angles. Other triangles need different tools (law of cosines, etc.).

Want a quick proof-idea in plain language, or practice problems?`
  }

  // Science / general knowledge
  if (has(lower, 'what is photosynthesis') || has(lower, 'photosynthesis কি') || (has(lower, 'photosynthesis') && has(lower, 'explain'))) {
    return `Photosynthesis is how green plants (and some bacteria) make their own food using light.

Very short version:  
They take in **carbon dioxide** (from air) + **water** (from roots) + **light** (usually sun)  
and produce **sugar** (energy) + **oxygen** (which we breathe).

The green color comes from chlorophyll — the molecule that catches light.

No photosynthesis → much less oxygen and food on Earth. That's why it matters.

Want the chemical equation, or how it differs from how *we* get energy?`
  }

  if (has(lower, 'what is gravity') || has(lower, 'মাধ্যাকর্ষণ') || (has(lower, 'gravity') && has(lower, 'explain'))) {
    return `Gravity is the pull that mass has on other mass. Your body pulls on the Earth a tiny bit; the Earth pulls on you a lot — so you stay on the ground.

Newton described it as a force between objects. Einstein went further: mass curves spacetime, and things follow that curve (that's why light bends near the sun).

Everyday level: drop a pen → it falls down because Earth pulls it. The Moon orbits Earth for the same reason — it's constantly "falling" around us.

Curious about orbits, weight vs mass, or black holes next?`
  }

  // Internet / web from scratch
  if (has(lower, 'how does the internet work') || has(lower, 'internet কিভাবে') || (has(lower, 'internet') && has(lower, 'work') && has(lower, 'how'))) {
    return `Think of the internet as a giant postal system for data.

1. Your device breaks a request (e.g. open a website) into small packets  
2. Each packet has an address (IP) — like a street address  
3. Routers pass packets hop by hop toward the destination  
4. The server sends packets back; your browser reassembles them into a page  

DNS is the phonebook: it turns \`google.com\` into a number address.  
HTTPS adds encryption so the "letters" can't be read in transit.

That's the backbone. Want the next layer — browsers, servers, or what a URL actually means?`
  }

  if (has(lower, 'what is a variable') || (has(lower, 'variable') && has(lower, 'programming') && has(lower, 'explain'))) {
    return `In programming, a variable is a *named box* that holds a value you can use and change later.

\`\`\`javascript
let age = 20
age = 21  // update the box
\`\`\`

• The name (\`age\`) is how you refer to it  
• The value (\`20\`) is what's inside right now  

Without variables you'd hard-code every number and string — messy and inflexible.

Different languages have slightly different rules (const vs let, types, etc.). Which language are you learning?`
  }

  // Zero-knowledge / product
  if (has(lower, 'zero-knowledge') || has(lower, 'zero knowledge') || has(lower, 'জিরো নলেজ')) {
    return `Zero-knowledge (in products like this) means the service is designed so the operator doesn't need — and ideally can't read — your actual content.

Rough idea: your data is encrypted with keys that stay with you (or your device). The server might store ciphertext or run code in isolated environments, but it shouldn't see the plaintext of your chats or files.

It's a design goal, not magic. Real systems combine encryption, careful key handling, and sometimes hardware isolation.

Private Lock in this workspace is the UI side of that idea: ciphertext on screen until *you* reveal a bubble locally.

Want the cryptographic intuition, or how it differs from "we promise not to look"?`
  }

  return null
}

export function generateAssistantReply(
  userText: string,
  history: ChatMessage[] = []
): string {
  const t = userText.trim()
  if (!t) return "I'm here — say anything you'd like help with."

  const lower = t.toLowerCase()
  const bn = isBangla(t)

  // —— Corrections first (friendly pushback) ——
  const corrected = maybeCorrect(lower)
  if (corrected) return corrected

  // —— Topic explainers from scratch ——
  const explained = explainTopic(lower, t)
  if (explained) return explained

  // —— Greetings (short, human) ——
  if (/^(hi|hello|hey|yo|হ্যালো|হাই|সালাম|assalamu|assalam|good morning|good evening|good afternoon|namaste)[\s!.]*$/i.test(t) ||
      (t.length < 16 && has(lower, 'hi', 'hello', 'hey', 'হাই', 'হ্যালো'))) {
    return pick(
      bn
        ? [
            'হাই! কী নিয়ে কাজ করবে আজ? লেখালেখি, পড়াশোনা, কোড, বা যেকোনো প্রশ্ন — বলো।',
            'হ্যালো! আমি আছি। কোথায় সাহায্য লাগবে?',
            'হাই — কেমন আছো? কী নিয়ে কথা বলব?',
          ]
        : [
            "Hey! What's on your mind?",
            "Hi — I'm here. What do you want to work on or figure out?",
            "Hello! Ask me anything constructive. I'll keep it clear and honest.",
          ]
    )
  }

  // —— How are you ——
  if (has(lower, 'how are you', 'how r you', 'কেমন আছ', 'কেমন আছেন')) {
    return bn
      ? 'ভালোই আছি, ধন্যবাদ। তুমি কেমন আছো? আর কীতে সাহায্য লাগবে বলো।'
      : pick([
          "Doing well, thanks for asking. More interested in how *you're* doing — and what you need help with.",
          "All good on my side. What are you working on today?",
        ])
  }

  // —— Thanks ——
  if (has(lower, 'thank', 'thanks', 'ধন্যবাদ', 'শুকরিয়া', 'thx')) {
    return pick(
      bn
        ? ['অবশ্যই! আর কিছু লাগলে বলো।', 'খুশি যে কাজে লেগেছে। পরের প্রশ্নটাও এনে দাও।']
        : ["You're welcome. Anytime.", "Glad it helped. Fire the next question whenever."]
    )
  }

  // —— Who / what can you do ——
  if (has(lower, 'who are you', 'what can you do', 'what are you', 'তুমি কে', 'কী করতে পারো', 'tomar kaj')) {
    return bn
      ? `আমি Cypherenclave-এর অ্যাসিস্ট্যান্ট — তোমার প্রাইভেট ওয়ার্কস্পেসের ভিতরে কাজ করি।

সাহায্য করতে পারি: লেখা, ব্যাখ্যা (গণিত থেকে টেকনোলজি), কোড, প্ল্যানিং, আইডিয়া গুছানো। ভুল থাকলে সোজাসুজি বলব, আর কঠিন বিষয় সহজ করে বোঝাব।

অবৈধ বা ক্ষতিকর কাজে সাহায্য করব না। বাকি প্রায় সব বৈধ কাজে পাশে আছি। কী দিয়ে শুরু করব?`
      : `I'm the assistant inside your Cypherenclave workspace — private by design.

I can help you write, explain ideas from the ground up (math, science, tech), debug code, plan work, and think through problems. If you're wrong about something, I'll say so kindly and show the better path. If a topic is hard, we start from the basics.

I won't help with illegal or harmful stuff. For everything constructive — I'm in. What should we dig into?`
  }

  // —— Coding help (conversational, not lecture) ——
  if (has(lower, 'code', 'javascript', 'python', 'typescript', 'react', 'bug', 'function', 'html', 'css', 'sql', 'debug', 'error', 'programming', 'কোড', 'প্রোগ্রাম', 'nodejs', 'api')) {
    if (has(lower, 'react')) {
      return `React is a library for building UI out of components — reusable pieces of the screen.

Smallest useful mental model:
• **Component** = a function that returns what you want to show  
• **State** = data that can change; when it changes, React re-renders  
• **Props** = inputs passed from parent to child  

\`\`\`tsx
import { useState } from 'react'

function Counter() {
  const [n, setN] = useState(0)
  return <button onClick={() => setN(n + 1)}>{n}</button>
}
\`\`\`

If you paste *your* component or the error message, I'll point at the exact issue instead of giving a generic tutorial.`
    }
    if (has(lower, 'python')) {
      return `Python reads almost like English, which is why beginners like it.

Bare minimum script shape:

\`\`\`python
def greet(name):
    return f"Hello, {name}"

print(greet("Sam"))
\`\`\`

Indentation matters (spaces define blocks). Tell me what you're building or paste the traceback — we'll fix it together without the fluff.`
    }
    if (has(lower, 'html')) {
      return `HTML is the skeleton of a webpage — tags that mean "this is a heading", "this is a link", and so on.

\`\`\`html
<!DOCTYPE html>
<html>
  <head><title>My page</title></head>
  <body>
    <h1>Hello</h1>
    <p>A paragraph of text.</p>
    <a href="https://example.com">A link</a>
  </body>
</html>
\`\`\`

CSS styles it. JavaScript makes it interactive. Stuck on a specific tag or layout?`
    }
    return bn
      ? `কোড নিয়ে সাহায্য করতে পারি। কোন ভাষা (Python, JavaScript, React…)? আর তুমি কী করতে চাচ্ছ বা কোন error আসছে, একটু লিখে/পেস্ট করলে সোজাসুজি ধরে সাহায্য করব।`
      : `I can help with code. Tell me the language and either (a) what you're trying to do, or (b) paste the error / snippet. I'll be direct — what works, what doesn't, and a clean fix.`
  }

  // —— Writing / email ——
  if (has(lower, 'write', 'draft', 'email', 'letter', 'essay', 'paragraph', 'লিখ', 'ইমেইল', 'ড্রাফট', 'রচনা')) {
    if (has(lower, 'email', 'ইমেইল')) {
      return bn
        ? `ইমেইল লিখে দিতে পারি। কাকে পাঠাবে, উদ্দেশ্য কী, আর টোন কেমন চাও (ফর্মাল / নরম) — এই তিনটা বলো। না হলে একটা সাধারণ ফর্মাল খসড়া:

বিষয়: [এক লাইনে উদ্দেশ্য]

প্রিয় [নাম],

আশা করি ভালো আছেন। আমি লিখছি [উদ্দেশ্য এক বাক্যে]।

[২–৩ লাইনে মূল কথা]

প্রয়োজন হলে জানাবেন।

শুভেচ্ছান্তে,  
[তোমার নাম]`
        : `I can draft the email. Quickest path: tell me who it's to, the one-sentence goal, and tone (formal / warm / short).

Here's a clean default you can edit:

Subject: [Outcome in a few words]

Hi [Name],

Hope you're well. I'm writing to [goal in one line].

[One short paragraph with the key detail or ask]

Happy to jump on a call if easier. Thanks either way.

Best,  
[Your name]

Send me the real details and I'll tailor it.`
    }
    return bn
      ? `লিখে দিতে পারি। কী ধরনের লেখা (ইমেইল, অনুচ্ছেদ, আবেদন), কাকে পড়াবে, আর কতখানি লম্বা চাও — বলো। অথবা কয়েকটা পয়েন্ট দিলে আমি গুছিয়ে লিখে দিই।`
      : `I can write it. Tell me the type (email, paragraph, application), the reader, and roughly how long. Or throw bullet points at me and I'll turn them into clean prose.`
  }

  // —— Study / homework style (explain, not cheat blindly) ——
  if (has(lower, 'homework', 'assignment', 'exam', 'pariksha', 'পরীক্ষা', 'বাড়ির কাজ', 'হোমওয়ার্ক')) {
    return bn
      ? `বাড়ির কাজ বা পরীক্ষার প্রস্তুতিতে সাহায্য করতে পারি — বুঝিয়ে, ধাপে ধাপে। পুরো উত্তর মুখস্থ করিয়ে দেওয়ার চেয়ে তুমি যেন নিজে করতে পারো, সেটাই লক্ষ্য।

প্রশ্নটা লিখে দাও বা বিষয়টা বলো। কোথায় আটকেছ সেটা জানলে আরও ভালো সাহায্য হয়।`
      : `I can help you learn the material — step by step — so you can do the work yourself. Blind full answers without understanding won't help you on the next problem.

Paste the question or topic and tell me where you're stuck. We'll work through it.`
  }

  // —— Math general (if not caught by explainTopic) ——
  if (has(lower, 'math', 'maths', 'calculate', 'equation', 'গণিত', 'অঙ্ক', 'solve for', 'derivative', 'integral', 'percentage')) {
    return bn
      ? `গণিত নিয়ে আছি। প্রশ্নটা লিখো (বা ছবির টেক্সট) — ধাপে ধাপে সমাধান করব, শুধু উত্তর নয় যাতে বুঝতে পারো কেন এমন হয়।`
      : `I'm good with math. Write the problem (or the part that's confusing). I'll walk through the reasoning step by step — not just the final number — so it actually sticks.`
  }

  // —— Planning ——
  if (has(lower, 'plan', 'roadmap', 'todo', 'schedule', 'প্ল্যান', 'পরিকল্পনা', 'routine')) {
    return bn
      ? `প্ল্যান গুছাতে পারি। লক্ষ্য এক বাক্যে আর সময়সীমা বলো (যেমন: ২ সপ্তাহে লঞ্চ)। আমি বাস্তবসম্মত ধাপ ভেঙে দিই — অতিরিক্ত লম্বা লিস্ট নয়।`
      : `Let's make a plan that you'll actually follow. One sentence goal + timeframe (e.g. "ship a landing page in 10 days"). I'll break it into a few concrete steps — not a 40-item fantasy list.`
  }

  // —— Opinions / advice (honest) ——
  if (has(lower, 'should i', 'do you think', 'is it good', 'is it bad', 'ami ki', 'করণীয়')) {
    return bn
      ? `সোজা উত্তর দিতে চাই, কিন্তু আগে একটু কনটেক্সট লাগবে। কী নিয়ে সিদ্ধান্ত নিচ্ছ, আর তোমার জন্য কোন জিনিসগুলো গুরুত্বপূর্ণ (সময়, টাকা, শেখা, ঝুঁকি)? যতটা বলবে, ততটাই ব্যবহারিক পরামর্শ দিতে পারব — চাটুকারিতা নয়।`
      : `I'll give you a straight take — but I need a bit of context. What's the decision, and what matters most to you (time, money, learning, risk)? The more specific you are, the less fluffy my advice will be.`
  }

  // —— Short yes / no / ok ——
  if (/^(yes|yeah|yep|yup|ok|okay|sure|no|nope|nah|হ্যাঁ|জি|না|ঠিক|আচ্ছা|hmm|হুম)[\s!.]*$/i.test(t)) {
    return pick(
      bn
        ? ['ঠিক আছে। এবার কী করব বলো।', 'বুঝেছি। পরের ধাপ কী?']
        : ["Got it. What's next?", "Okay — go ahead with the details.", "Understood. What do you want to do with that?"]
    )
  }

  // —— Jokes / light ——
  if (has(lower, 'joke', 'funny', 'bored', 'রসিকতা')) {
    return pick([
      "Why did the function break up with the variable? It needed more space.\n\nOkay, your turn — real question whenever you're ready.",
      "I only know dad jokes encrypted with AES. Decrypt: why was the computer cold? It left its Windows open.\n\nWhat are you actually working on?",
    ])
  }

  // —— Privacy product questions ——
  if (has(lower, 'private lock', 'enclave', 'vault', 'passkey', 'e2ee', 'encryption')) {
    return `Private Lock is the "don't shoulder-surf me" layer: messages show as ciphertext until you hover (or long-press) — decryption happens only in your browser memory for that moment.

The broader idea of this product is zero-knowledge style design: your content shouldn't be readable by the service operator in normal operation.

It's a demo UI for those ideas. Real production systems still need solid crypto, key management, and threat modeling.

What part do you want clarified — the UI behavior or the security model?`
  }

  // —— Bangla general fallback ——
  if (bn) {
    return pick([
      `বুঝতে পারছি তুমি বলছ: “${t.slice(0, 100)}${t.length > 100 ? '…' : ''}”।

এটা নিয়ে সাহায্য করতে চাই। আর একটু খুলে বলো — তুমি কী ফলাফল চাও, বা কোথায় আটকেছ? যত স্পষ্ট বলবে, তত সোজাসুজি কাজে লাগবে উত্তরটা। ভুল কিছু থাকলে সেটাও ধরিয়ে দেব।`,
      `ঠিক আছে, এটা নিয়ে কাজ করা যাক।

আমাকে একটু গাইড করো:  
• এটা কি ব্যাখ্যা চাও, নাকি লিখে দিতে বলছ, নাকি ধাপে ধাপে সমাধান?  
• কোনো ব্যাকগ্রাউন্ড বা সীমাবদ্ধতা আছে?

এগুলো জানলে ঘুরিয়ে-ফিরিয়ে না বলে সরাসরি সাহায্য করতে পারি।`,
    ])
  }

  // —— English general fallback — natural, not template spam ——
  const recent = history.filter(m => m.role === 'user').slice(-2).map(m => m.text)
  const continuity =
    recent.length && recent[recent.length - 1] !== t
      ? "\n\n(We can stay on the previous thread or switch — whatever you need.)"
      : ''

  return pick([
    `Okay, I'm with you on: “${t.slice(0, 140)}${t.length > 140 ? '…' : ''}”.

To help properly I need a bit more — are you looking for an explanation from the basics, a written draft, a worked example, or feedback on something you already have? Throw me one of those directions (or paste more detail) and I'll go straight at it.${continuity}`,

    `Makes sense. Here's how I'd approach it without the fluff: say what "done" looks like for you in one sentence, and where you're stuck. I'll fill the gap — explain, correct, or build the next step.

If you already have text or code, paste it. Easier to improve something real than guess.${continuity}`,

    `I can help with that. I won't just agree with everything — if something's off, I'll say so and show a better way. If it's a new topic for you, we can start from zero and climb up.

What would be most useful right now: a simple explanation, a concrete example, or feedback on your current attempt?${continuity}`,
  ])
}

export function estimateThinkMs(reply: string): number {
  const base = 500
  const perChar = 3
  return Math.min(2200, base + Math.min(reply.length, 350) * perChar)
}
