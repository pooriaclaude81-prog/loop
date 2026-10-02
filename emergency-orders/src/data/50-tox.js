/* ============ METHANOL / EG ============ */
V({id:'meoh-base',topic:'meoh',n:'Methanol toxicity',src:'A',lv:'II',
 meta:'Imp: Methanol toxicity · NPO until awake and stable · supine, bed head up',
 sc:'A 33-year-old man drank **home-made alcohol 12 hours ago**. He has **blurred vision, abdominal pain and vomiting**, is tachypneic (Kussmaul), GCS 14. VBG: **pH 7.12, HCO3 8**, high anion gap. Glucose normal.',
 o:[
  'IV line fix',
  'Labs: CBC/diff, BUN, Cr, Na, K, BS, Ca, amylase, ALT, AST, ALP, CPK, UA',
  'Cardiac monitoring + pulse oximetry',
  'O2 by face mask 4–6 L/min if SpO2 < 92%',
  '**BS glucometry stat and every 1–2 h**',
  'Check serum **ethanol and methanol**',
  'Check serum **acetaminophen and salicylate** levels',
  'Serum **D/S 1000 mL** IV stat',
  'Amp Ondansetron 4 mg IV stat',
  'Amp Famotidine 20 mg IV stat',
  'NG tube fix (then oral route if he cannot tolerate: source note)',
  'Spiral brain CT scan',
  '## Antidote: choose one',
  'Amp **Fomepizole 15 mg/kg** stat (over 30 min), then **10 mg/kg every 12 h**',
  '**or** **Ethanol 10%: 10 mL/kg** stat infusion over 30 min, then **1.2 mL/kg/h**. Ethanol infusion must go through a **central vein**; keep the ethanol level at **100–150 mg/dL**.',
  'Chart I/O',
  'Amp **Folic acid 1 mg/kg** IV every 4–6 h',
  'Amp **Sodium bicarbonate 7.5%: 1–2 mEq/kg/dose** if pH < 7.2',
  '**Hemodialysis if indicated** (see the list below)',
  'Toxicology consult',
 ],
 br:[
  {c:'**Hemodialysis indications (methanol and ethylene glycol)**: (1) metabolic acidosis: base deficit < −15, AG > 30, pH < 7.25; (2) visual disturbance; (3) renal failure; (4) worsening vital signs despite full treatment; (5) refractory electrolyte / metabolic disorder despite adequate treatment; (6) serum methanol or ethylene glycol > 50 mg/dL',d:['Hemodialysis']},
  {c:'**Ethylene glycol** is suspected instead',go:['meoh-eg']},
 ],
 fa:['مسمومیت با الکل می‌تواند ناشی از اتانول، متانول، اتیلن گلیکول باشد. علامت بالینی، حالت مستی است.','اصل مدیریت درمان در مسمومیت با اتانول، تحت نظر گرفتن تا زمان هوشیاری است.','برای تشخیص مسمومیت با متانول و اتیلن گلیکول، محاسبه‌ی آنیون گپ، اسمولار گپ و سرم اسمولالیته کمک‌کننده است.','انفوزیون اتانول باید حتماً از طریق ورید مرکزی باشد و سطح اتانول ۱۰۰–۱۵۰ نگه داشته شود.'],
 ref:['Fomepizole dosing: 15 mg/kg then 10 mg/kg every 12 h for 4 doses, per the product label and Toxicology reviews (e.g. Barceloux DG et al., Clin Toxicol 2002;40:415, ASPEN consensus on methanol). Source A does not state the number of doses.']
});
V({id:'meoh-eg',topic:'meoh',n:'Ethylene glycol add-ons',src:'A',lv:'II',
 meta:'Imp: Ethylene glycol toxicity · Add these to the methanol orders',
 sc:'A 40-year-old man ingested **antifreeze**, now with CNS depression, tachypnea, and high anion-gap acidosis, plus **oliguria** and calcium oxalate crystals in the urine. Treat as for methanol (antidote, bicarbonate, dialysis) **and add the vitamin co-factors**.',
 o:[
  'All orders on the [[meoh-base|methanol page]] (fomepizole or ethanol, bicarbonate, dialysis)',
  '## Added for ethylene glycol (right-margin bracket in source A)',
  'Amp **Thiamine (Vit B1) 100 mg** IV stat, then every 6 h',
  'Amp **Pyridoxine (Vit B6) 50–100 mg** IV stat, then every 6 h',
  'Amp **MgSO4 2 g** IV stat',
  'Hemodialysis criteria as on the methanol page',
 ]
});

/* ============ OPIOID ============ */
const OP_BASE=[
  'CVS / NPO / CBR; semi-sitting',
  'Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, BS, VBG, toxin level',
  'PO & HM',
  'O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%',
  'ECG',
  'BS glucometry',
  'IV line fix; N/S 1 L IV stat',
  'Amp **Naloxone** on standby',
  'Bed-side guard + fixed relative',
];
V({id:'opioid-arrest',topic:'opioid',n:'Apnea or arrest',src:'B',lv:'I',
 meta:'Imp: Opioid toxicity · Level I',
 sc:'A 29-year-old man is **found unresponsive with a needle beside him**, pinpoint pupils, **no breathing or only gasps**, cyanotic.',
 o:[
  'Move to the resuscitation room, bag-mask ventilation, **intubation considered**',
  'If unconscious, not breathing, or only gasping: **start CPR immediately**',
  'Naloxone **2 mg** IV (5 ampoules at once) for apnea, cyanosis or RR < 12',
  'Continue as on the [[opioid-resp|titration page]] once breathing returns',
 ],
 fa:['در صورت وجود سیانوز، آپنه و RR < ۱۰ بیمار بلافاصله به اتاق احیا منتقل می‌شود، آمبوبگ ونتیلاسیون انجام شده، ۲mg نالوکسان تزریق می‌گردد و اینتوباسیون مدنظر باشد.']
});
V({id:'opioid-resp',topic:'opioid',n:'Depressed respiration: titrate naloxone',src:'B',lv:'II',
 meta:'Imp: Opioid toxicity · C: I or II',
 sc:'A 35-year-old man is drowsy, **pinpoint pupils**, RR 10, SpO2 91%, arousable to voice. He is a known opioid user. Or: an opioid-naive older woman who took too many tablets.',
 o:OP_BASE.concat([
  'Brain CT is **not needed** if the patient wakes with naloxone',
 ]),
 br:[
  {c:'**Opioid addict** (dependent): give **0.1 mg** (¼ ampoule), repeat **every 3 min** until the patient wakes, **up to 10 mg total**',d:['Avoid precipitating withdrawal: start small']},
  {c:'**Naive patient**: give **0.4 mg (1 ampoule)**, repeat **every 3 min** until the patient wakes, up to 10 mg total',d:['Titrate to respiratory effort']},
  {c:'Naloxone must be repeated several times (the drug wears off)',d:[
   '**Naloxone infusion**: take **⅔ of the total naloxone dose that woke the patient, per hour, for 6 h**',
   'Example: awake after 3 ampoules = 1.2 mg → ⅔ × 1.2 = 0.8 mg/h × 6 h = **4.8 mg = 12 ampoules in D5W, over 6 h**',
  ]},
  {c:'Oral ingestion',go:['opioid-ingestion']},
  {c:'Methadone',go:['opioid-methadone']},
 ],
 fa:['اگر فرد آپنه، سیانوز یا RR < ۱۲ دارد: ۲mg نالوکسان (۵ آمپول) یک‌جا تزریق می‌شود. اگر فرد شرایط بالا را ندارد: در افراد معتاد ۰/۱ آمپول و در افراد معمولی ۱ آمپول (۰/۴mg) را تزریق می‌کنیم و هر سه دقیقه تکرار تا هوشیاری یا تا زمان رسیدن به دوز توتال ۱۰ میلی‌گرم.','دو سوم کل مقدار دوز نالوکسانی که باعث افزایش سطح هوشیاری و بهبود وضعیت تنفس بیمار گردید را در ساعت دریپ می‌گذاریم، مثلاً برای ۶ ساعت.','در صورتی که بیمار با نالوکسان هوشیار شود نیازی به انجام Br CT نیست.']
});
V({id:'opioid-ingestion',topic:'opioid',n:'Oral ingestion: lavage / charcoal',src:'B',lv:'II',
 meta:'Imp: Opioid toxicity, oral ingestion',
 sc:'A 24-year-old **swallowed a handful of opioid tablets 40 minutes ago**. Now awake but drowsy, airway protected. Decontamination may help only if done early.',
 o:OP_BASE.concat([
  'NG tube fix, **lavage until the returns are clear**',
  '**Lavage technique** (fully awake patient, after confirming NG position): left lateral position, head slightly below the trunk, legs drawn to the abdomen; instill **300 mL**, let it drain back by gravity. **Not useful and not recommended if more than 1 h has passed since ingestion.**',
  '**Activated charcoal 50 g** PO / by gavage (if < 1 h since ingestion, or if the drug slows gut motility, it may be given after 1 h)',
 ]),
 br:[{c:'↓LOC and no gag reflex, or any aspiration risk',d:['**Intubate BEFORE giving charcoal**. Give charcoal only when the airway is secure.']}]
});
V({id:'opioid-methadone',topic:'opioid',n:'Methadone toxicity',src:'B',lv:'II',
 meta:'Imp: Opioid toxicity, methadone',
 sc:'A 31-year-old on a **methadone maintenance program** took extra doses. He is sedated with a normal-to-low respiratory rate. ECG QTc 520 ms.',
 o:OP_BASE.concat([
  'Watch for **electrolyte disturbances**: K, Mg, Ca',
  'Watch for a **prolonged QT** on serial ECG',
  '@R Because methadone is long-acting, the naloxone effect wears off before the opioid does. Use the naloxone infusion approach on the [[opioid-resp|titration page]] and observe for a prolonged period.',
 ]),
 fa:['در افراد متادون توکسیستی مراقب اختلالات الکترولیتی و QT طولانی باشیم.'],
 ref:['Methadone toxicity and naloxone infusion: Boyer EW, N Engl J Med 2012;367:146 (Management of opioid analgesic overdose).']
});

/* ============ WARFARIN ============ */
const WAR_BASE=[
  'CVS / NPO / CBR; supine',
  'IV line fix',
  'Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, **PT, PTT, INR**, BG/Rh, VBG, Trop, AST, ALT, ALP',
  'Check **Hb/Hct every 6 h**',
  'PO & HM',
  'O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%',
  'Bed-side guard + fixed relative',
  'N/S 1 L IV infusion every 12 h',
  'ECG; BS glucometry; CXR',
  'Amp Omeprazole 40 mg IV stat',
  'Amp **Vitamin K** on standby',
];
V({id:'warfarin-low',topic:'warfarin',n:'INR 3–4.5, no life-threatening bleed',src:'B',lv:'II',
 meta:'Imp: Warfarin toxicity · C: I or II',
 sc:'A 71-year-old man with a **mechanical valve on warfarin** presents with bruising and a **supratherapeutic INR of 3.8**. No active major bleeding.',
 o:WAR_BASE,
 br:[{c:'INR 3–4.5 and no life-threatening bleed',d:['**Hold one dose of warfarin**']}]
});
V({id:'warfarin-mid',topic:'warfarin',n:'INR 4.5–10, no life-threatening bleed',src:'B',lv:'II',
 meta:'Imp: Warfarin toxicity',
 sc:'A 78-year-old woman, a new **antibiotic course**, INR **7.2**, epistaxis that stopped, hemodynamically stable.',
 o:WAR_BASE,
 br:[{c:'INR 4.5–10 and no life-threatening bleed',d:['**Hold one or two doses of warfarin**','Can give **Vitamin K 1–2 mg orally**']}]
});
V({id:'warfarin-high',topic:'warfarin',n:'INR > 10, no life-threatening bleed',src:'B',lv:'II',
 meta:'Imp: Warfarin toxicity',
 sc:'A 66-year-old man with a **very high INR of 14** after a dose error, **no active bleeding**.',
 o:WAR_BASE,
 br:[{c:'INR > 10 and no life-threatening bleed',d:['**Hold one or two doses of warfarin**','**Vitamin K 2 mg orally**']}]
});
V({id:'warfarin-bleed',topic:'warfarin',n:'Any INR + life-threatening bleed',src:'B',lv:'I',
 meta:'Imp: Warfarin toxicity with major bleeding · Level I',
 sc:'A 69-year-old man on warfarin has **melena and hypotension**, BP 82/50, INR 6. Or: **intracranial bleed**, **massive hemoptysis**, **intra-abdominal bleed**.',
 o:WAR_BASE.concat([
  'Reserve **4 units P.C**, iso-group iso-Rh',
  'Reserve **FFP**, iso-Rh',
  'ABC first; massive-bleed resuscitation (see [[gib-massive|massive GI bleeding]])',
 ]),
 br:[{c:'Any abnormal INR with life-threatening bleeding (GIB, hemoptysis, internal or brain bleeding)',d:[
   'Amp **Vitamin K 5–10 mg IV, slowly**',
   'Consider **FFP** or **PCC**',
  ]}],
 fa:['افرادی که اختلالات انعقادی دارند و با خونریزی‌های ماسیو مراجعه می‌کنند (ماسیو GIB، ماسیو همپتیزی، خونریزی‌های داخل شکمی و داخل مغزی) سریعاً باید عملیات احیا و ABC انجام شود.']
});

/* ============ SNAKE BITE ============ */
V({id:'snake-local',topic:'snake',n:'Local envenomation, hand',src:'A',lv:'II',
 meta:'Imp: Snake bite',
 sc:'A 45-year-old man was **bitten on the right hand 1 hour ago**. No nausea or vomiting, no dyspnea. **Swelling from the distal forearm over the whole right hand.**',
 o:[
  'IV line fix',
  'VBG',
  'Amp **Hydrocortisone 100 mg** IV stat',
  'Amp **Chlorpheniramine 1 vial** IV stat',
  'Serum N/S 500 mL IV stat',
  '**Right hand elevation**',
  'ECG',
  '**Antivenom 4 vials** IV stat',
  'Cardiac monitoring + pulse oximetry',
  '@R Mark the leading edge of the swelling with a pen and the time, and re-measure; watch for progression, bleeding, neurotoxicity; check PT/INR and platelets',
 ],
 ref:['WHO Guidelines for the Management of Snakebite (2nd ed., 2016). Marking swelling, coagulation monitoring.']
});

/* ============ ANGIOEDEMA ============ */
V({id:'angio-allergic',topic:'angio',n:'Allergic angioedema / anaphylaxis',src:'A',lv:'II',
 meta:'Imp: Angioedema',
 sc:'A 26-year-old woman develops **swollen lips and tongue with hives and wheeze 20 minutes after eating shellfish**. BP 100/60, HR 115, stridor absent. Mild anaphylaxis with angioedema.',
 o:[
  'IV line fix',
  'O2 by nasal cannula 3–4 L/min',
  'Serum N/S **500–1000 mL** IV stat',
  '@D Epinephrine (1:1000, 1 mg/mL) **0.01 mg/kg (usually 0.3–0.5 mg) IM**, anterolateral thigh, stat, repeat as needed **every 5–15 min**. Source A writes the dose unreadably and repeats every 20 min.',
  '@D Amp **Hydrocortisone 200 mg** IV stat. Source A\'s number is unreadable (starts "5-").',
  'Amp **Chlorpheniramine 10 mg** IM or IV slowly',
  'Salbutamol spray 4 puffs stat, or nebulized',
 ],
 br:[
  {c:'On a beta-blocker, or no response to the above',go:['angio-bblocker']},
  {c:'Angioedema **without urticaria**, ACE-inhibitor or hereditary',go:['angio-acei-hae']},
  {c:'Stridor, voice change, tongue swelling threatening the airway',d:['@R Early intubation by the most experienced operator; surgical airway kit open','Epinephrine IM and also nebulized epinephrine']},
 ],
 fa:['گلوکوکورتیکوئیدها (مثل هیدروکورتیزون) در فاز حاد مؤثر نیستند ولی از عود برونکواسپاسم، هیپوتانسیون یا کلاپس جلوگیری می‌کنند.','آنتی‌هیستامین‌ها خط اول درمان در کهیر و آنژیوادم هستند.','در موارد متوسط و شدید از اپی‌نفرین استفاده می‌شود.'],
 ref:['WAO Anaphylaxis Guidance 2020 (Cardona V et al., World Allergy Organ J 2020;13:100472) and Resuscitation Council UK 2021 anaphylaxis guidance. Epinephrine 0.01 mg/kg IM (max 0.5 mg), repeat 5–15 min; hydrocortisone 200 mg.']
});
V({id:'angio-bblocker',topic:'angio',n:'Beta-blocker patient / refractory',src:'A',lv:'I',
 meta:'Imp: Angioedema / anaphylaxis, refractory',
 sc:'A 58-year-old man on **bisoprolol** has anaphylaxis with hypotension (BP 70/40) and bronchospasm that does **not respond to repeated epinephrine**.',
 o:[
  'Continue the orders on the [[angio-allergic|allergic page]] (fluids, antihistamine, steroid, salbutamol)',
  'Amp **Glucagon 1 mg** IV stat, then **1 mg/h** IV infusion',
  '@R Aggressive IV fluids, and escalate to epinephrine infusion as per the resuscitation protocol',
 ],
 fa:['در صورت مصرف داروی بتابلوکر و یا عدم پاسخ به درمان‌های فوق: Amp Glucagon 1mg IV stat then 1mg/h IV inf']
});
V({id:'angio-acei-hae',topic:'angio',n:'No urticaria: ACE-I or hereditary',src:'A',lv:'II',
 meta:'Imp: Angioedema without urticaria',
 sc:'A 62-year-old man on **lisinopril** has **progressive lip and tongue swelling for 6 hours without hives or itch**, no wheeze. Or: a young patient with a family history, abdominal pain and swelling (hereditary C1-inhibitor deficiency).',
 o:[
  'IV line fix, O2, monitor',
  '**Treatment focuses on the airway and hemodynamic instability**',
  'Antihistamines and steroids are **not** the answer (no urticaria, bradykinin-mediated)',
  'In **hereditary angioedema**, **FFP**, which contains C1 inhibitor, is useful',
  '@R Stop the ACE inhibitor permanently',
  '@R Hereditary angioedema: **C1-inhibitor concentrate** (e.g. 20 U/kg IV) or **icatibant 30 mg SC**; adrenaline, antihistamines and steroids are ineffective',
  '@R Airway: serial assessment, early awake fiberoptic or surgical-airway planning for expanding swelling',
 ],
 fa:['آنژیوادم بدون کهیر علامت کمبود مهارکننده C1 است یا به علت مصرف ACEI ایجاد شده است.','درمان در آنژیوادم متمرکز بر برقراری راه هوایی و ناپایداری همودینامیک است.','در موارد آنژیوادم ارثی، استفاده از FFP که مهارکننده C1 دارد مفید است.'],
 ref:['The international WAO/EAACI guideline for the management of hereditary angioedema, 2021 revision (Maurer M et al., Allergy 2022;77:1961).']
});
