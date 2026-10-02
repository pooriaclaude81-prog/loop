/* ============ GI BLEEDING ============ */
const GIB_BASE=[
  'CVS / NPO / CBR; supine or semi-sitting (A: supine, head elevated)',
  'IV line fix. @B **Two large-bore lines.**',
  'Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR. @B Also lactate, LDH, AST/ALT/ALP, BG/Rh, VBG.',
  'Cardiac monitoring + pulse oximetry',
  'ECG (age > 40, or any cardiac history)',
  '@A CXR. @B CXR / abdominal film only if perforation, obstruction or foreign body is suspected.',
  'O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%',
  '@A Serum **N/S 2 L** IV stat. @B Serum **N/S 1 L** IV stat (repeat per shock protocol).',
  'Amp **Pantoprazole 80 mg** IV stat, then @A **40 mg BD** @B **8 mg/h infusion**',
  '@A Amp Ondansetron 4 mg IV stat. @B Amp Plasil (metoclopramide) 10 mg IV stat.',
  '@A Reserve **2 U P.C** (iso-group, iso-Rh). @B Reserve **4 U P.C** and **4 U FFP**, iso-group.',
  'BS glucometry; NGT if indicated; I/O control',
  '@A Internist consult. @B GI (internal medicine) consult.',
];
V({id:'gib-stable',topic:'gib',n:'Stable upper GI bleed',src:'AB',lv:'II',
 meta:'Imp: GI bleeding · C: II/III · NPO · CBR · supine or semi-sitting',
 sc:'A 55-year-old man on **NSAIDs for back pain** vomited bright-red blood twice and has **black stool**. BP 118/72, HR 96, Hb 10.4, not diaphoretic. Alert.',
 o:GIB_BASE,
 br:[
  {c:'Hemoglobin target',d:['Keep **Hb > 7 mg/dL**; in **ischemic heart disease or the elderly keep Hb > 9**']},
  {c:'Platelets < 50,000 with active bleeding',d:['Transfuse **6 units of platelets**']},
  {c:'Underlying disease, disabled patient, or shock',d:['**Fix a Foley catheter**']},
  {c:'Each fluid bolus given',d:['Re-check vital signs by the **shock protocol** after every dose (each 20 min) and repeat the bolus to keep **SBP about 100 mmHg**']},
  {c:'Suspected perforation, obstruction or foreign body',d:['Upright CXR and abdominal film']},
  {c:'Massive bleeding, shock, hypoxia, severe tachypnea, ↓LOC',go:['gib-massive']},
  {c:'Cirrhosis / alcohol / varices / abnormal LFT',go:['gib-variceal']},
  {c:'Warfarin or INR > 1.5',go:['gib-anticoag']},
 ],
 diff:['Fluids: A **2 L** stat; B **1 L** stat, with boluses repeated per shock protocol.','PPI: both start 80 mg IV. A then 40 mg BD; B continues **8 mg/h** infusion.','Blood: A reserves **2 U**; B reserves **4 U P.C + 4 U FFP**.','Antiemetic: A ondansetron; B metoclopramide.']
});
V({id:'gib-massive',topic:'gib',n:'Massive / unstable bleed → Level I',src:'AB',lv:'I',
 meta:'Imp: Massive GI bleeding · Level I',
 sc:'A 62-year-old man with **hematemesis of about 1 liter**, BP **78/45**, HR 126, cold and pale, drowsy, SpO2 90%. Ongoing bleeding.',
 o:GIB_BASE.concat([
  'Move to the resuscitation room',
  'Aggressive fluid therapy and a **massive-transfusion plan**; intubation considered',
  '**Aggressive re-warming**',
  'Reserve **4 U P.C and 4 U FFP**, iso-group iso-Rh',
 ]),
 br:[{c:'Fluid response',d:['Repeat the N/S bolus after re-assessment every 20 min, **aim for SBP about 100**']}],
 fa:['در صورت Massive GIB، شوک، هیپوکسی، تاکی‌پنه شدید، کاهش سطح هوشیاری بیمار در سطح یک قرار گرفته است. مایع درمانی شدید و برنامه ماسیو ترانسفیوژن و اینتوباسیون برای بیمار مدنظر قرار گیرد.']
});
V({id:'gib-variceal',topic:'gib',n:'Variceal / cirrhotic bleed',src:'B',lv:'I',
 meta:'Imp: GI bleeding with liver disease',
 sc:'A 48-year-old **alcoholic with known cirrhosis** vomits large amounts of blood. BP 92/58, HR 112, jaundice, ascites.',
 o:GIB_BASE.concat([
  'Amp **Octreotide 50 µg bolus, then 50 µg/h** infusion (for liver disease, alcoholics, esophageal varices, deranged LFT)',
  'Amp **Ceftriaxone 1 g** IV infusion (antibiotic in cirrhosis, immunodeficiency or suspected bacterial peritonitis)',
  '**Sengstaken–Blakemore tube on standby**',
  '@R Restrictive transfusion (Hb target 7–8), endoscopy within 12 h',
 ]),
 ref:['Baveno VII consensus on portal hypertension (de Franchis R et al., J Hepatol 2022;76:959). Octreotide, antibiotics, restrictive transfusion, endoscopy within 12 h.']
});
V({id:'gib-anticoag',topic:'gib',n:'On warfarin or INR > 1.5',src:'B',lv:'I',
 meta:'Imp: GI bleeding with coagulopathy',
 sc:'A 70-year-old woman on **warfarin** has black stools and dizziness. INR 4.1, BP 100/60.',
 o:GIB_BASE.concat([
  'Correct the coagulopathy: **FFP 10–15 mL/kg stat**',
  '**± Amp Vitamin K 10 mg IV stat**',
 ]),
 br:[{c:'Life-threatening bleed on warfarin',go:['warfarin-bleed']}]
});

/* ============ HEPATIC ENCEPHALOPATHY ============ */
const HE_BASE=[
  'CVS / NPO / CBR; semi-sitting or sitting',
  'Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, AFP, **NH4 (ammonia, must be checked)**, CPK, LDH, HBsAg, HCV Ab, HIV Ab, AST, ALT, ALP, Bili T/D, amylase, lipase, VBG',
  'HM, PO; O2 by nasal cannula 4–6 L/min if SpO2 < 94%',
  'CXR; **brain CT** (mandatory if reduced consciousness or confusion); ECG; BS glucometry',
  'IV line fix; serum **1/3–2/3, 1 L over 12 h**',
  'Amp Ranitidine 50 mg IV stat',
  '**No sedative drugs**',
  'Tab **Zinc 600 mg** PO daily (dose as written in source B; the common tablet is 220 mg of zinc sulfate, so verify)',
];
V({id:'he-alert',topic:'he',n:'Alert enough to take oral drugs',src:'B',lv:'II',
 meta:'Imp: Hepatic encephalopathy · C: II',
 sc:'A 60-year-old man with **cirrhosis** is **confused and sleepy, with a flapping tremor**, after several days of constipation. GCS 13, BP 110/70, no fever.',
 o:HE_BASE.concat([
  'Tab **Metronidazole 250 mg** PO stat, every 8 h',
  'Syrup **Lactulose 30 g** PO stat, then every 6 h until the stool is loose (diarrhea)',
 ]),
 br:[{c:'Alternative to metronidazole',d:['Oral **neomycin** or oral **vancomycin**']}]
});
V({id:'he-lowloc',topic:'he',n:'Decreased LOC / aspiration risk',src:'B',lv:'I',
 meta:'Imp: Hepatic encephalopathy, reduced consciousness · Level I',
 sc:'A 58-year-old with cirrhosis is **responsive only to pain, GCS 8**, absent gag reflex, BP 95/60. He cannot swallow, and aspiration risk is high.',
 o:HE_BASE.concat([
  '**Level I**: resuscitation equipment and intubation equipment at the bedside; **intubate** if GCS ≤ 8, absent gag, or BP ≤ 90',
  '**NGT fix**; give metronidazole tablets and lactulose syrup **by gavage**',
 ]),
 br:[{c:'Cannot take lactulose by mouth or NGT',d:['**Lactulose enema 300 mL in 700 mL water**']}]
});
V({id:'he-sbp',topic:'he',n:'With ascites: suspect SBP',src:'B',lv:'II',
 meta:'Imp: Hepatic encephalopathy, suspected SBP',
 sc:'A 63-year-old alcoholic with **tense ascites, fever and abdominal tenderness**, now confused. Think **spontaneous bacterial peritonitis** as the trigger.',
 o:HE_BASE.concat([
  'Diagnostic **ascitic tap kit at the bedside**',
  'Amp **Cefotaxime 2 g** IV stat if SBP is suspected',
  'Tab Metronidazole 250 mg PO q8h and lactulose syrup 30 g as on the [[he-alert|first page]]',
 ])
});

/* ============ PANCREATITIS ============ */
const PANC_BASE=[
  'IV line fix',
  'Labs: CBC/diff, BUN/Cr, Na, K, Ca, BS, Bili (T, D), ALT, AST, ALP, **amylase or lipase** (lipase is preferred), LDH, VBG, Alb. @A (case) Also HBsAg / HBsAb, P, PT, PTT, INR.',
  'CXR (PA)',
  '**Ultrasound of liver, gallbladder, bile ducts** (case also lists pancreas)',
  'Amp **Ondansetron 4 mg** IV stat',
  'ECG; chart I/O',
  'Internist or surgeon consult',
];
V({id:'panc-mild',topic:'panc',n:'Mild pancreatitis',src:'AB',lv:'III',
 meta:'Imp: Acute pancreatitis (mild) · NPO initially',
 sc:'A 45-year-old man with **epigastric pain after a fatty meal and alcohol**, radiating to the back, **vomiting once**. Hemodynamically stable, **lipase 4× normal**, no organ failure.',
 o:PANC_BASE.concat([
  'Serum N/S **2 L IV stat** (A protocol), then maintenance @R (lactated Ringer\'s is more physiological; A\'s notes say it may carry a better prognosis)',
  'Amp **Morphine sulfate 2–5 mg** IV slowly, stat',
  'No NG tube: in mild pancreatitis **oral feeding is ideal** and shortens admission',
  'No prophylactic antibiotic',
 ]),
 diff:['A\'s protocol page: N/S 2 L stat; the A case page: N/S **500 mL in 2 h, then 200 mL/h**.','Analgesia: A protocol uses **morphine 2–5 mg**; A case uses **pethidine 25 mg**. A\'s note says no clinical study shows morphine worsens pancreatitis or cholecystitis.','PPI: the A case adds **pantoprazole 40 mg IV BD**.'],
 fa:['درمان پانکراتیت حاد عمدتاً حمایتی است.','تعیین سطح سرمی لیپاز نسبت به آمیلاز برتر است زیرا اختصاصیت بالاتری دارد. انجام همزمان هر دو تست، حساسیت و ویژگی را افزایش نمی‌دهد.','برای هر ۲ آنزیم مقدار ۳ برابر بیشتر از نرمال ارزش دارد.','انجام روتین CT scan نیاز نیست و فقط برای موارد نامشخص یا در فاز تأخیری برای رد کردن عوارض توصیه می‌شود.','اگرچه گفته می‌شود مورفین باعث اسپاسم اسفنکتر اودی می‌شود ولی مطالعات بالینی که نشان‌دهنده‌ی بدتر شدن پانکراتیت یا کولسیستیت با مورفین باشد وجود ندارد.']
});
V({id:'panc-modsevere',topic:'panc',n:'Moderate to severe pancreatitis',src:'AB',lv:'II',
 meta:'Imp: Acute pancreatitis (moderate / severe) · NPO',
 sc:'A 68-year-old woman with **continuous (non-colicky) epigastric pain for 3 days** and nausea and vomiting since yesterday. HR 112, BP 100/62, dry mucosa, lipase 8× normal, rising creatinine.',
 o:PANC_BASE.concat([
  'Serum N/S **500 mL IV in 2 h, then 200 mL/h** (A case) / **2 L IV stat** (A protocol)',
  '**NG tube fix** (only for moderate to severe pancreatitis)',
  'Amp **Pethidine 25 mg** IV stat **or** Amp **Morphine sulfate 2–5 mg** IV slowly',
  'Amp Pantoprazole 40 mg IV BD',
  'Amp Ondansetron 4 mg IV BD',
 ]),
 br:[{c:'CT scan',d:['Not routine. Use for unclear diagnosis or in the late phase to look for complications.']},{c:'Infected / necrotizing pancreatitis, or with cholangitis',go:['panc-infected']}],
 fa:['سرم رینگر لاکتات، فیزیولوژیک‌تر از نرمال سالین است و ممکن است در بیمارانی که حجم زیادی از مایعات دریافت می‌کنند با پروگنوز بهتر همراه باشد.']
});
V({id:'panc-infected',topic:'panc',n:'Infected or necrotizing, or with cholangitis',src:'B',lv:'II',
 meta:'Imp: Acute pancreatitis with infection',
 sc:'A 59-year-old man, day 8 of severe pancreatitis, with **new fever 39 °C, rising WBC and a CT showing infected necrosis**. Or: pancreatitis with fever, jaundice and RUQ pain (cholangitis).',
 o:[
  'Continue the orders of [[panc-modsevere|moderate to severe]] pancreatitis',
  'Antibiotics (choose one):',
  'Amp **Ciprofloxacin 400 mg** IV stat + Amp **Metronidazole 500 mg** IV stat',
  '**or** Amp **Tazocin 3.375 g** IV infusion',
  '**or** Amp **Ceftriaxone 1 g** IV infusion + Amp **Metronidazole 500 mg** IV infusion',
 ],
 fa:['آنتی‌بیوتیک پروفیلاکتیک اندیکاسیون ندارد و نباید صرفاً به دلیل وجود کرایتریای SIRS تجویز شود. ولی در مواردی که پانکراتیت نکروزه و عفونی شود یا شواهد آشکار عفونت وجود داشته باشد، آنتی‌بیوتیک تجویز می‌شود.']
});

/* ============ EPIGASTRIC / RUQ HUB ============ */
V({id:'epig-hub',topic:'epig',n:'Work-up and branches (hub)',src:'B',lv:'II',hub:true,
 meta:'Imp: R/O gastritis, pancreatitis, GIB / AAA, cholangitis, cholecystitis, cholelithiasis, mesenteric ischemia, DKA, perforation, obstruction, hepatitis · C: I/II/III',
 sc:'A 57-year-old man with **epigastric and right-upper-quadrant pain for 8 hours**, nausea, no clear cause yet. BP 128/76, HR 96, T 37.8 °C, tender RUQ. Run the base work-up and then pick the branch.',
 o:[
  'CVS / NPO / CBR; semi-sitting; bed-side guard + fixed relative',
  'Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, CPK, LDH, Trop, VBG, AST, ALT, ALP, Bili (D & T), amylase, lipase, BS, **lactate**. **βHCG in women of childbearing age.**',
  'PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%',
  'CXR; if he can stand an upright CXR, **if not a left lateral decubitus abdominal film** (for suspected visceral perforation, perforated peptic ulcer, obstruction or foreign body)',
  'ECG; BS glucometry',
  'IV line fix; N/S 1 L IV stat, free infusion',
  '**Ultrasound of gallbladder, liver, bile ducts**',
  'Amp Ranitidine 50 mg IV stat; Amp Ondansetron 4 mg IV stat',
  'Amp **Morphine 3 mg** IV slow',
 ],
 br:[
  {c:'**Shock**, refractory hypotension, ↓LOC',d:['Move at once to resus (Level I)','**RUSH exam** by emergency medicine','Intubation if needed','Start **broad-spectrum antibiotics** at once']},
  {c:'**Peritonitis** / acute surgical abdomen',d:['**Surgical consult**']},
  {c:'**Acute cholecystitis**',d:['Amp **Tazocin 3.375 g** IV infusion']},
  {c:'**Pancreatitis**',go:['panc-mild','panc-modsevere','panc-infected']},
  {c:'Pancreatitis that is **infected / necrotizing, or with cholangitis**',d:['**Ciprofloxacin 400 mg + metronidazole 500 mg** IV stat','**or Tazocin 3.375 g**','**or ceftriaxone 1 g + metronidazole 500 mg**']},
  {c:'Diagnosis still unclear, non-pregnant',d:['**Abdominal CT scan** is advised to find the cause of pain']},
  {c:'GI bleed / AAA',go:['gib-stable']},
  {c:'DKA',go:['dyspnea-hub']},
 ],
 fa:['در بیماران با درد شکم و شوک، هیپوتانسیون مقاوم به درمان، کاهش سطح هوشیاری، بیمار فوراً به احیا منتقل شده در سطح یک قرار گرفته و اقدامات فوراً درمانی آغاز می‌شود.','RUSH Exam توسط طب اورژانس انجام شده، در صورت نیاز اینتوباسیون انجام شود.','آنتی‌بیوتیک در بیماران شوک از ابتدا وسیع‌الطیف شروع شود. در کوله‌سیستیت حاد آمپول تازوسین ۳.۳۷۵ gr انفوزیون IV شود.','CT اسکن در خانم‌های غیرباردار و سایر افراد به شرطی که علت درد ناشناخته بماند جهت پیدا کردن علت درد توصیه می‌شود.']
});

/* ============ SBO ============ */
const SBO_BASE=[
  'CVS / NPO / CBR; supine',
  'Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, VBG, BS, **lactate**',
  'PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%',
  'IV line fix; N/S 1 L over 12 h',
  '**Upright CXR** (if he cannot stand: left lateral decubitus abdominal film)',
  'ECG',
  '**NGT fix**',
  'Amp **Ondansetron 4 mg** IV stat',
  'Amp **Morphine 3 mg** IV stat, slow, with respiratory control',
];
V({id:'sbo-stable',topic:'sbo',n:'Stable SBO',src:'B',lv:'II',
 meta:'Imp: Small bowel obstruction · C: II',
 sc:'A 66-year-old woman with a **previous laparotomy** has **colicky abdominal pain, vomiting and no flatus for 2 days**, distended abdomen, hyperactive bowel sounds. BP 120/72, HR 100.',
 o:SBO_BASE,
 br:[
  {c:'High suspicion of obstruction and the film shows nothing',d:['**Abdominal and pelvic CT with IV contrast**']},
  {c:'Shock, ↓LOC, airway risk from vomiting',go:['sbo-shock']},
  {c:'Perforation or an operation planned',go:['sbo-perf']},
  {c:'Severe ascites / carcinomatosis',go:['sbo-ascites']},
 ]
});
V({id:'sbo-shock',topic:'sbo',n:'Shock / airway risk → Level I',src:'B',lv:'I',
 meta:'Imp: Small bowel obstruction, unstable · Level I',
 sc:'A 72-year-old man with **bowel obstruction, repeated vomiting, drowsy**, BP 82/50, HR 124, dry. Aspiration risk.',
 o:SBO_BASE.concat(['**Level I**, aggressive fluid resuscitation','If ↓LOC: **NGT to suction**, airway protection']),
 br:[{c:'Reduced level of consciousness',d:['**NGT connected to suction**']}]
});
V({id:'sbo-perf',topic:'sbo',n:'Perforation or surgery planned: antibiotics',src:'B',lv:'II',
 meta:'Imp: Small bowel obstruction with perforation / surgical plan',
 sc:'A 60-year-old with SBO now has **fever, guarding and free air under the diaphragm** on the upright film. Surgery is planned.',
 o:SBO_BASE.concat([
  'Amp **Cefuroxime 1000 mg** IV every 8 h **or** Amp **Meropenem 1 g** IV every 8 h',
  'Surgical consult',
 ]),
 fa:['آنتی‌بیوتیک در انسداد روده کوچک زمانی لازم است که شواهد پرفوراسیون وجود داشته باشد و یا برنامه جراحی مدنظر باشد.']
});
V({id:'sbo-ascites',topic:'sbo',n:'Severe ascites / carcinomatosis',src:'B',lv:'II',
 meta:'Imp: Small bowel obstruction, malignant / ascites',
 sc:'A 58-year-old woman with **ovarian cancer and tense ascites** with vomiting and a distended abdomen. Malignant bowel obstruction.',
 o:SBO_BASE.concat(['Amp **Octreotide 0.3 mg/day** (300 µg per day)'])
});

/* ============ LBO ============ */
const LBO_BASE=[
  'CVS / NPO / CBR; semi-sitting',
  'Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, VBG, BS, **lactate**',
  'PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%',
  'IV line fix; ECG; N/S 1 L IV stat',
  '**Upright CXR** (if he cannot stand: left lateral decubitus abdominal film)',
  '**NGT fix**',
  'Amp Ondansetron 4 mg IV stat',
  'Amp Morphine 3 mg IV stat, slow, with respiratory control',
  'Abdominal and pelvic CT with IV contrast if needed',
];
V({id:'lbo-stable',topic:'lbo',n:'Stable LBO',src:'B',lv:'II',
 meta:'Imp: Large bowel obstruction · C: II',
 sc:'A 74-year-old man with **weeks of constipation, then abdominal distension and vomiting**, pain, no flatus. BP 130/80. A dilated colon on film, suspected **sigmoid mass or volvulus**.',
 o:LBO_BASE,
 br:[{c:'Shock / ↓LOC',go:['lbo-shock']},{c:'Gangrene, perforation, or peritoneal signs',go:['lbo-gangrene']},{c:'Suspected pseudo-obstruction',go:['lbo-pseudo']}]
});
V({id:'lbo-shock',topic:'lbo',n:'Shock / airway risk → Level I',src:'B',lv:'I',
 meta:'Imp: Large bowel obstruction, unstable · Level I',
 sc:'A 78-year-old with **LBO, repeated vomiting, confusion, BP 80/48, HR 130**.',
 o:LBO_BASE.concat(['**Level I** and **aggressive fluid therapy**','If reduced consciousness: **NGT to suction**'])
});
V({id:'lbo-gangrene',topic:'lbo',n:'Gangrene / perforation → antibiotics',src:'B',lv:'II',
 meta:'Imp: Large bowel obstruction with gangrene or perforation',
 sc:'A 70-year-old with **LBO now febrile, peritonitic** with free air. Surgical emergency.',
 o:LBO_BASE.concat([
  '## Antibiotics (choose one regimen)',
  'Amp **Ciprofloxacin 400 mg** IV stat, then every 12 h **+** Amp **Metronidazole 500 mg** IV stat, then every 12 h',
  '**or** Amp **Ampicillin 2 g** IV every 6 h **+** Amp **Metronidazole 500 mg** every 6 h **+** Amp **Gentamicin 7 mg/kg** every 24 h',
  '**or** Amp **Imipenem 500 mg** IV every 6 h',
  'Surgical consult',
 ])
});
V({id:'lbo-pseudo',topic:'lbo',n:'Suspected pseudo-obstruction',src:'B',lv:'II',
 meta:'Imp: Colonic pseudo-obstruction (Ogilvie)',
 sc:'A 79-year-old in a medical ward after **hip surgery**, with a massively distended abdomen, little pain, no mechanical cause suspected.',
 o:LBO_BASE.concat(['**Water-soluble contrast enema** to differentiate from mechanical obstruction'])
});

/* ============ RLQ ============ */
const RLQ_BASE=[
  'CVS / NPO / CBR; supine; bed-side guard + fixed relative',
  'Labs: CBC/diff, BUN/Cr, Na, K, VBG, UA, PT, PTT, INR, **CRP**',
  'PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%',
  'ECG (age > 40)',
  'IV line fix; N/S 1 L IV infusion every 12 h',
  'Amp **Morphine 3 mg** IV slow, with respiratory control',
  'Amp **Ondansetron 4 mg** IV stat',
  'Amp **Apotel (acetaminophen) 1 g** IV infusion if T ≥ 38 °C',
];
V({id:'rlq-stable',topic:'rlq',n:'Stable, suspected appendicitis',src:'B',lv:'II',
 meta:'Imp: RLQ abdominal pain · C: II/III',
 sc:'A 24-year-old man with **periumbilical pain that migrated to the right lower quadrant over 12 hours**, anorexia, nausea, low-grade fever, **tenderness at McBurney\'s point**, stable.',
 o:RLQ_BASE.concat(['**RLQ graded-compression ultrasound**, R/O appendicitis']),
 br:[
  {c:'Diagnosis is not clear on clinical grounds',d:['RLQ ultrasound for appendicitis']},
  {c:'Appendicitis confirmed, not perforated',go:['rlq-nonperf']},
  {c:'Perforated',go:['rlq-perf']},
  {c:'Shock',go:['rlq-shock']},
  {c:'Female, pregnancy possible, or ultrasound inconclusive',go:['rlq-imaging']},
 ]
});
V({id:'rlq-shock',topic:'rlq',n:'Shock → Level I',src:'B',lv:'I',
 meta:'Imp: RLQ pain with shock · Level I',
 sc:'A 35-year-old with **RLQ pain, fever, BP 85/50, HR 128, delayed capillary refill, drowsy**. Probable perforation with sepsis.',
 o:RLQ_BASE.concat(['**Level I**, resuscitation room','**Aggressive fluid therapy** and **broad-spectrum antibiotics** at once (see the perforated page)','Surgery consult']),
 br:[{c:'Antibiotic choice',go:['rlq-perf']}]
});
V({id:'rlq-nonperf',topic:'rlq',n:'Non-perforated appendicitis: antibiotics',src:'B',lv:'II',
 meta:'Imp: Appendicitis, non-perforated',
 sc:'A 24-year-old with **ultrasound-proven appendicitis**, no perforation, stable.',
 o:RLQ_BASE.concat([
  'Amp **Metronidazole 500 mg** IV **+** Amp **Ciprofloxacin 400 mg** IV',
  '**or** Amp **Ceftriaxone 1 g** IV infusion **+** Amp **Metronidazole 500 mg** IV infusion',
  'Surgical consult',
 ])
});
V({id:'rlq-perf',topic:'rlq',n:'Perforated appendicitis: antibiotics',src:'B',lv:'II',
 meta:'Imp: Appendicitis, perforated',
 sc:'A 45-year-old with **5 days of RLQ pain**, now diffuse peritonitis, fever, WBC 22,000. CT shows perforation with abscess.',
 o:RLQ_BASE.concat([
  'Amp **Tazocin (piperacillin–tazobactam) 4.5 g** IV',
  '**or** Amp **Cefepime 2 g** IV infusion',
  '**or** Amp **Imipenem 500 mg** IV infusion',
  'Surgical consult',
 ])
});
V({id:'rlq-imaging',topic:'rlq',n:'Imaging pathway: female, pregnant, unclear',src:'B',lv:'II',hub:true,
 meta:'Imp: RLQ pain, diagnosis uncertain',
 sc:'A **26-year-old woman** with RLQ pain and **missed period**, or a **pregnant patient**, or an adult with an **inconclusive ultrasound**.',
 br:[
  {c:'**Every woman of childbearing age**',d:['**βHCG**']},
  {c:'Diagnosis not definite on clinical grounds',d:['**RLQ ultrasound** for appendicitis']},
  {c:'Female',d:['Ask also for **ultrasound of the appendix and of the uterus / adnexa** (ovarian torsion)']},
  {c:'**βHCG positive**',d:['Also evaluate for **ectopic pregnancy**']},
  {c:'Renal colic symptoms, first episode',d:['Add **ultrasound of the kidneys and urinary tract**']},
  {c:'Unclear diagnosis, ultrasound negative or non-diagnostic, **not pregnant**',d:['**Abdominal and pelvic CT with IV contrast**']},
  {c:'Unclear diagnosis, ultrasound negative or non-diagnostic, **pregnant**',d:['**MRI of abdomen and pelvis without contrast**']},
 ]
});

/* ============ HICCUP ============ */
V({id:'hiccup-case',topic:'hiccup',n:'Persistent hiccup, case example',src:'A',lv:'III',
 meta:'Source A case: hiccup',
 sc:'A **74-year-old man** has had **persistent hiccups for 5 days with nausea and vomiting**. Check the heart and the stomach first (an inferior MI can present this way).',
 o:[
  'IV line fix',
  'Serum 1/3–2/3 (written as "1/3 2/3 2--cc/24 h", probably **2000 mL / 24 h**)',
  'Check **Troponin (0, 6 h)**',
  'Amp **Pantoprazole 40 mg** IV BD',
  'Amp **Chlorpheniramine** IM stat',
  'Tab **Baclofen 10 mg** BD',
 ]
});
