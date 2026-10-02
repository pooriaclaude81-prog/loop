/* ============ DYSPNEA HUB ============ */
V({id:'dyspnea-hub',topic:'dyspnea',n:'Pick the cause (hub)',src:'B',lv:'II',hub:true,
 meta:'Imp: Dyspnea, R/O asthma attack, PTE, MI, decompensated CHF, pneumonia · C: II · NPO · CBR · semi-sitting or sitting',
 sc:'A 60-year-old arrives **short of breath**, the cause not yet clear. RR 28, SpO2 89% on room air. Start the base orders, then use the bedside clues (wheeze, fever, leg swelling, chest pain, history) to pick the branch.',
 o:[
  'CVS / NPO / CBR',
  'Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, **Troponin (0, 6 h)**, **D-dimer**, **NT-proBNP**, ABG, BS',
  'HM, PO',
  'O2 by nasal cannula 4–6 L/min **if SpO2 ≤ 94%**',
  'CXR',
  '**Blue-protocol lung ultrasound** (by emergency resident)',
  'IV line fix; N/S 1 L IV stat',
  'Amp Ranitidine 50 mg IV stat',
  'BS glucometry',
  'ECG',
  'Bed-side guard up + fixed relative',
 ],
 br:[
  {c:'Suspect **asthma**: wheeze, prolonged expiration',go:['asthma-mild-mod','asthma-severe']},
  {c:'Suspect **COPD** exacerbation',go:['copd-modsevere','copd-mild']},
  {c:'Suspect **pneumonia**: fever, sputum, infiltrate',go:['pna-cap','pna-severe']},
  {c:'Suspect **pulmonary edema / decompensated CHF**',go:['ape-perfused','ape-hypoperfused']},
  {c:'Suspect **MI**',d:['Follow the ACS orders, and request **fibrinolytic (reteplase)** + emergency cardiology for PCI and transfer'],go:['acs-stable','acs-stemi']},
  {c:'Suspect **PE** (moderate / high pretest risk)',d:[
   'Start **anticoagulation** in moderate / high-risk patients',
   'CT lung with **PE protocol**, once BUN/Cr is back',
  ]},
  {c:'Suspect **anaphylaxis**',d:['Amp **Epinephrine 0.3 mg IM**'],go:['angio-allergic']},
  {c:'**Flail chest / pneumothorax**',d:['Request surgery visit; chest-tube equipment at the bedside']},
  {c:'Suspect **DKA**',d:['@R DKA orders are not in the sources. Reference-based start: N/S 1 L/h, regular insulin 0.1 U/kg/h after K ≥ 3.3, K replacement per level, hourly glucose, VBG/BMP every 2–4 h. Use your DKA protocol.']},
  {c:'Suspect **epiglottitis**',d:['Intubation equipment ready; **broad-spectrum antibiotics** (Tazocin + vancomycin)']},
  {c:'**Cardiac tamponade**: muffled heart sounds, low BP, raised JVP',d:['Emergency ultrasound / echo','Pericardiocentesis equipment at the bedside']},
  {c:'**Organophosphate poisoning**',d:['**Atropine** repeated until lung secretions dry','**Pralidoxime**','Consider intubation']},
  {c:'**CO poisoning**',d:['O2 by mask with reservoir bag **15 L/min**; consider intubation']},
  {c:'Ingestion of a toxic substance with dyspnea',d:['Consider **prophylactic intubation**; request surgery visit']},
  {c:'**CVA, Guillain–Barré, myasthenia gravis, tick paralysis**',d:['Brain CT and necessary measures'],go:['weakness-hub']},
  {c:'**SBP ≤ 90**',d:['**RUSH exam**']},
  {c:'**Abdominal sepsis / systemic sepsis**',d:['**Broad-spectrum antibiotics** and surgery consult']},
  {c:'**GI bleeding**',d:['Vital-sign measures, IV fluid, **FFP + P.C** and octreotide as needed'],go:['gib-massive']},
 ],
 fa:['در موارد شک به آسم: رجوع به دستورات آسم. در موارد شک به COPD: رجوع به دستورات COPD. در موارد شک به پنومونی: رجوع به دستورات پنومونی.','در موارد شک به PTE: آنتی‌کوآگولان در موارد ریسک متوسط و بالا شروع شود و CT ریه با پروتکل PTE با آماده بودن جواب BUN/Cr درخواست شود.','در موارد مسمومیت با ارگانوفسفره: تجویز آتروپین تا خشک شدن ترشحات ریوی، تجویز پرالیدوکسیم و مدنظر قرار داشتن اینتوباسیون.','در موارد مسمومیت با CO: درخواست اکسیژن با ماسک رزروبگ ۱۵ لیتر در دقیقه و مدنظر قرار داشتن اینتوباسیون.','در موارد شک به CVA، گیلن باره، میاستنی گراویس و فلج تیک: Brain CT و اقدامات لازم.'],
 ref:['DKA: ADA Consensus Report on Hyperglycemic Crises (Kitabchi AE et al., Diabetes Care 2009;32:1335), and the 2024 ADA/EASD/JBDS update. Source B refers to DKA orders that are not in the booklet.']
});

/* ============ ASTHMA ============ */
const ASTHMA_BASE=[
  'CVS / NPO / CBR. Position: semi-sitting or sitting.',
  'Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, Troponin, Ca, Ph, Mg, Alb, VBG',
  'HM, PO',
  'O2 by nasal cannula 3–4 L/min if SpO2 ≤ 90% (use < 94% in pregnancy and ischemic heart disease)',
  'IV line fix; N/S 1 L over 8 h',
  'Bed-side guard up + fixed relative',
  'ECG (recommended for cardiac patients or chest pain)',
];
V({id:'asthma-mild-mod',topic:'asthma',n:'Mild to moderate attack',src:'B',lv:'II',
 meta:'Imp: Asthma attack · C: II · NPO · CBR · semi-sitting or sitting',
 sc:'A 24-year-old with known asthma has **wheeze and chest tightness for 3 hours** after pollen exposure. He speaks in **full sentences or phrases**, RR 22, HR 105, SpO2 94%, no accessory muscle use. Peak flow is about 60–70% of his best.',
 o:ASTHMA_BASE.concat([
  'CXR **only if another diagnosis is suspected** (PTX, pneumonia, CHF), after stabilization. Not indicated otherwise.',
  'Neb **Salbutamol 2.5 mg** every 20 min, up to 3 doses',
  'Neb **Atrovent 0.5 mg** every 20 min, up to 3 doses',
  'Neb **Pulmicort 0.5 mg** every 20 min, up to 3 doses',
  'Amp **Methylprednisolone 80 mg** IV stat, **or** Tab **Prednisolone 50 mg** PO stat',
 ]),
 br:[
  {c:'**Mild attack** (full sentences): use an inhaler instead of a nebulizer',d:['**Salbutamol spray 8–12 puffs** with a spacer, with close supervision of the technique']},
  {c:'Fever, sinusitis, purulent sputum, or pneumonia',d:['Amp **Ceftriaxone 1 g** IV infusion **+** Cap **Azithromycin 500 mg** PO stat','**or** Amp **Levofloxacin 750 mg** IV stat'],e:['No antibiotic is indicated'],ec:'None of these features'},
  {c:'Can tolerate oral intake',d:['Oral steroid is preferred (prednisolone 50 mg)'],e:['Cannot tolerate oral: use IV methylprednisolone'],ec:'Vomiting / cannot swallow'},
  {c:'Reassess after 1 h: FEV1 40–69% predicted',d:['Repeat salbutamol every 1–3 h']},
  {c:'Reassess after 1 h: FEV1 < 40% predicted',d:['Salbutamol **continuous or hourly**'],go:['asthma-severe']},
  {c:'Steroid already given and the patient is fit for discharge',d:['Before discharge: **Dexamethasone 10 mg** or **Triamcinolone 40 mg** or **Methylprednisolone 160 mg**']},
 ],
 diff:['Source B severity wording: "full sentence" = mild, "phrases" = moderate, "word-by-word" = severe; HR > 120 and accessory muscle use = severe. The respiratory-rate threshold printed as "RR > 40" looks like a typo (usual severe cut-off is 30). Check it locally.'],
 fa:['برای بررسی شدت آسم اگرچه اسپیرومتری امری ضروری است اما بیمارانی که یک جمله نسبتاً کامل می‌توانند بگویند در شدت خفیف قرار دارند، آنها که «عبارت» می‌گویند در شدت متوسط و آنهایی که «کلمه کلمه» صحبت می‌کنند در حمله شدید قرار دارند.','اسپیرومتری و پیک فلومتری در همه موارد برای بررسی شدت آسم و جواب به درمان باید انجام شود.','CXR برای مواردی که مشکوک به تشخیص دیگری غیر از آسم هستیم (PTX، پنومونی، CHF) باید گرفته شود. در غیر از این موارد در بیماران آسم اندیکاسیون ندارد.','کورتون در مواردی که به سالبوتامول جواب ندهند یا در موارد شدید از ابتدا داده می‌شود. در موارد عدم توانایی در تحمل خوراکی فرم IV می‌دهیم؛ در غیر این موارد فرم خوراکی ارجح است.','آنتی‌بیوتیک در بیماران آسمی برای افرادی که تب دارند، سینوزیت دارند، خلط چرکی دارند و پنومونی دارند اندیکاسیون دارد؛ در غیر این موارد اندیکاسیون ندارد.','برای هر بیماری که کورتون دریافت کرده است و قابل ترخیص از اورژانس است، قبل از ترخیص ۱۰ mg دگزامتازون یا ۴۰ mg تریامسینولون یا ۱۶۰ mg متیل‌پردنیزولون استفاده شود.']
});
V({id:'asthma-severe',topic:'asthma',n:'Severe or refractory attack',src:'B',lv:'II',
 meta:'Imp: Asthma attack, severe or not responding · C: II (→ I if any trigger below)',
 sc:'A 35-year-old man has had **wheeze for 6 hours** and has used his inhaler 10 times. He can say only a few words, RR 34, HR 128, SpO2 88%, uses accessory muscles, silent areas on auscultation. Poor response to the first hour of nebulizers (FEV1 < 40%).',
 o:ASTHMA_BASE.concat([
  'Neb **Salbutamol 5 mg** (instead of 2.5 mg) every 20 min up to 1 h, then continuous or hourly',
  'Neb **Atrovent 0.5 mg** every 20 min ×3 (use in severe attacks, age > 40, beta-blocker bronchospasm, or a previous response to it)',
  'Neb **Pulmicort 0.5 mg** every 20 min ×3',
  'Amp **Methylprednisolone 80 mg** IV stat, continued **every 6–8 h**',
  'Spirometry / peak flow at baseline and after treatment',
 ]),
 br:[
  {c:'No response to all of the above and FEV1 < 25%',d:['**Magnesium sulfate 2–3 g** IV over 20 min']},
  {c:'Cannot use an inhaled beta-agonist, or very severe bronchospasm',d:['**Epinephrine 1:1000, 0.2–0.5 mg SC or IM** every 20 min up to 3 doses']},
  {c:'Very severe, cannot tolerate oral or inhaled drugs',d:['**IV terbutaline** and epinephrine']},
  {c:'Any of: severe dyspnea, severe tachycardia, profuse sweating, confusion, ↓LOC, cyanosis, near apnea, severe respiratory failure',go:['asthma-lifethreat']},
 ],
 fa:['در حملات شدید آسم که به همه درمان‌های فوق جواب نداده‌اند و FEV1 < ۲۵٪ است، منیزیم سولفات ۲ تا ۳ گرم ظرف ۲۰ دقیقه می‌دهیم.','در موارد بسیار شدید آسم که تحمل PO و استنشاقی ندارد از تربوتالین وریدی و اپی‌نفرین می‌توان استفاده کرد.','در موارد شدید به جای ۲/۵ mg سالبوتامول می‌توان ۵ mg و هر ۲۰ دقیقه تا یک ساعت استفاده کرد.']
});
V({id:'asthma-lifethreat',topic:'asthma',n:'Life-threatening → Level I, airway',src:'B',lv:'I',
 meta:'Imp: Asthma attack, near-fatal · Level I',
 sc:'A 28-year-old with asthma is **drowsy and sweating, cannot speak**, cyanotic with a **silent chest**, RR falling to 8, SpO2 78%, HR 140. He is exhausted and near respiratory arrest.',
 o:[
  'Move to the **resuscitation room**; ABC; monitor',
  'High-flow O2, bag-mask ready',
  'Resuscitation and intubation equipment at the bedside. Drugs ready: **Fentanyl 200 µg, Etomidate 20 mg, Succinylcholine 100 mg**. **Never inject these without a resident AND an attending present.**',
  'Continue nebulized salbutamol / ipratropium / budesonide, IV steroid, magnesium and epinephrine as on the [[asthma-severe|severe-attack page]]',
  'If intubated: set the ventilator as in [[copd-resp-failure|COPD respiratory failure]], and give nebulizers **in-line** through the ventilator',
 ],
 fa:['در موارد نیاز به اینتوباسیون به دستورات COPD مراجعه کنید.']
});

/* ============ COPD ============ */
V({id:'copd-modsevere',topic:'copd',n:'Moderate to severe exacerbation',src:'B',lv:'II',
 meta:'Imp: COPD exacerbation (moderate, severe) · C: II · NPO · CBR · sitting',
 sc:'A 68-year-old ex-smoker has had **more cough, purulent sputum and breathlessness for 4 days**. RR 28, SpO2 86%, wheeze, speaks in short phrases, uses accessory muscles. Not drowsy.',
 o:[
  'CVS / NPO / CBR; sitting',
  'Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, CPK, LDH, Trop, NT-proBNP, **ABG**, D-dimer',
  'HM, PO',
  'O2 by nasal cannula 3–4 L/min if SpO2 ≤ 90% (give **after** the nebulizers)',
  'CXR after stabilization',
  'Blue-protocol lung ultrasound (by emergency resident)',
  'ECG',
  'IV line fix; N/S 1 L over 8 h',
  'Bed-side guard + fixed relative; BS glucometry',
  'Amp Pantoprazole 40 mg IV stat',
  'Neb **Salbutamol 2.5 mg ×3 doses**, every 20 min up to 1 h',
  'Neb **Pulmicort 0.5 mg ×3 doses**, every 20 min up to 1 h',
  'Neb **Atrovent 0.5 mg ×3 doses**, every 20 min up to 1 h',
  'Amp **Levofloxacin 750 mg** IV stat, **or** Amp **Ceftriaxone 1 g** IV infusion + Cap **Azithromycin 500 mg** PO stat',
  'Amp **Enoxaparin 60 mg** SC stat (as written by source B)',
  'Amp **Methylprednisolone 125 mg** IV stat, **or** Tab **Prednisone 50 mg** PO stat',
  'BiPAP at the bedside',
 ],
 br:[
  {c:'Any of: cyanosis, entirely abdominal breathing, severe distress, respiratory failure, ↓LOC, PCO2 > 100, hemodynamic instability, severe drowsiness',go:['copd-resp-failure']},
  {c:'Mild exacerbation',go:['copd-mild']},
 ],
 fa:['این دستورات مربوط به COPD متوسط و شدید است که به COPDی اطلاق می‌شود که FEV1/FVC < ۷۰٪ و FEV1 < ۸۰٪ است.','نبولایزرها در موارد COPD خفیف می‌توانند با ۸ پاف از اسپری‌ها با دم‌یار و نظارت مستقیم بر بیمار جایگزین شوند.']
});
V({id:'copd-mild',topic:'copd',n:'Mild exacerbation',src:'B',lv:'III',
 meta:'Imp: COPD exacerbation (mild)',
 sc:'A 62-year-old with COPD has a **little more breathlessness and cough** than usual, speaks in full sentences, SpO2 93%, RR 20, no drowsiness.',
 o:[
  'Base orders as in [[copd-modsevere|moderate to severe]] (monitoring, labs, ECG, IV line)',
  '**Salbutamol spray 8 puffs** via a spacer, with direct supervision of correct technique, **instead of nebulizers**',
  'Tab **Prednisone 50 mg** PO',
  'Antibiotics as in the moderate–severe page if sputum is purulent',
 ]
});
V({id:'copd-resp-failure',topic:'copd',n:'Respiratory failure → BiPAP or intubation',src:'B',lv:'I',
 meta:'Imp: COPD exacerbation with respiratory failure · Level I',
 sc:'A 72-year-old with severe COPD is **drowsy**, with **paradoxical (entirely abdominal) breathing**, cyanosis, RR 36, ABG pH 7.18, PCO2 > 100. Hemodynamics are borderline. He is about to tire out.',
 o:[
  'Level I: resuscitation room, ABC, monitor',
  'All the drugs in [[copd-modsevere|the moderate–severe orders]]',
  '## BiPAP (only if ALL are true)',
  'No arrest, no need for intubation, not agitated, not drowsy, no airway obstruction, no aspiration risk, no recent gastric / esophageal / facial surgery, no facial trauma or anomaly',
  'BiPAP settings: **EPAP 2.5–5 cmH2O, IPAP 7.5–15 cmH2O**',
  '## Intubation (otherwise)',
  'Resuscitation and intubation equipment at the bedside. Drugs ready: **Fentanyl 200 µg, Etomidate 20 mg, Succinylcholine 100 mg**. **Never inject without a resident AND an attending.**',
  'Ventilator: **mode** assist-control or SIMV · **TV 6–8 mL/kg** · **rate 8–10/min** · **peak flow 80–100 L/min** · **FiO2 100%** · **I:E 1:4 to 1:3**',
  'Give the nebulizers **in-line** through the ventilator',
 ]
});

/* ============ PNEUMONIA ============ */
const PNA_BASE=[
  'CVS / NPO / CBR; semi-sitting',
  'Labs: CBC, BUN/Cr, VBG (blood cultures only for: immunocompromised, severe sepsis / shock, endovascular-infection risk, cavitation)',
  'PO + HM (always in pneumonia)',
  'O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%',
  'CXR',
  'IV line fix; N/S 1 L over 12 h',
  'Bed-side guard + fixed relative',
  'ECG',
];
const PNA_ISO='Isolate the patient when: contact with a TB case; cough with immunosuppression or HIV; alcoholics, IV drug users, homeless; patients from TB-endemic regions.';
V({id:'pna-cap',topic:'pna',n:'Community-acquired (ward)',src:'B',lv:'II',
 meta:'Imp: Pneumonia (CAP) · C: I, II or III by clinical picture',
 sc:'A 55-year-old man has had **fever, productive cough and right pleuritic pain for 3 days**. T 38.8 °C, RR 22, SpO2 93%, BP 128/78, crackles at the right base, CXR right lower-lobe infiltrate. No comorbidity, from home. CURB-65 score low.',
 o:PNA_BASE.concat([
  'Amp **Ceftriaxone 1 g** IV stat, then every 24 h',
  '**+** Cap **Azithromycin 500 mg** PO stat, then every 24 h',
  '**or** Amp **Levofloxacin 750 mg** IV stat, then every 24 h',
 ]),
 br:[
  {c:'TB risk (see the isolation list in the notes)',d:[PNA_ISO]},
  {c:'Older age or comorbidity',d:['A **chest CT** is preferred']},
  {c:'Severe features: CURB-65 ≥ 3, sepsis, shock',go:['pna-severe']},
 ],
 fa:['CURB-65: Confusion، BUN > 20، RR > 30، BP < 90، سن ≥ 65. سه امتیاز یا بیشتر = دسته B (نیاز به بستری در ICU).','CXR برای همه لازم نیست اما به صورت کلی می‌توان CXR انجام داد.','روتین انجام آزمایشات خاصی الزامی نیست؛ در موارد شدید CBC/diff، BUN/Cr، LFT، Na، K و ABG لازم است. Procalcitonin، CRP و ESR به صورت کلی کمک‌کننده نیستند.','ایزوله کردن بیماران: تماس با فرد مبتلا به TB، بیماران با سرفه و HIV مثبت، نقص ایمنی با سرفه، الکلی، IVDU، بی‌خانمان، مهاجرین از مناطق شایع TB.','بیماران پنومونی با اسیدوز متابولیک یا اختلال LFT و BUN/Cr بستری شوند.']
});
V({id:'pna-severe',topic:'pna',n:'Severe pneumonia (ICU)',src:'B',lv:'I',
 meta:'Imp: Severe pneumonia · category B (needs ICU)',
 sc:'A 66-year-old man with sepsis: fever, **RR 34, BP 84/50**, confusion, SpO2 84%, bilateral infiltrates. CURB-65 = 4. He needs vasopressors and possibly mechanical ventilation.',
 o:PNA_BASE.concat([
  'Amp **Ceftriaxone 1 g** IV infusion every 24 h',
  'Amp **Levofloxacin 750 mg** IV infusion every 24 h',
  'Amp **Vancomycin 1 g** IV in 250 mL N/S **over 1 h**, every 12 h',
  'Consider **aggressive fluid therapy**',
  'Consider **vasopressor**',
  'Consider **blood transfusion** if needed, per the septic-shock algorithm',
  'Consider **intubation and mechanical ventilation** if needed',
 ]),
 br:[
  {c:'Cyanosis, apnea, severe respiratory distress, severe agitation, septic shock, low SpO2, entirely abdominal breathing, confusion, PCO2 > 100, hemodynamic instability',d:['Level I, resuscitation room, **intubation considered**, resuscitation + intubation equipment at the bedside']},
  {c:'Why vancomycin: severe pneumonia with sepsis, contact with MRSA, or necrotizing pneumonia on imaging',d:['Vancomycin as above']},
 ]
});
V({id:'pna-hcap',topic:'pna',n:'Health-care-associated (HCAP)',src:'B',lv:'II',
 meta:'Imp: Pneumonia (HCAP)',
 sc:'A 70-year-old man from a **nursing home on hemodialysis** has fever and productive cough. He was hospitalized for 3 days last month. HCAP risk: nursing-home residence, hospital stay ≥ 2 days in the last 90 days, IV antibiotics / chemotherapy / wound care in the last 30 days, or hemodialysis.',
 o:PNA_BASE.concat([
  'Amp **Cefepime 2 g** IV infusion every 12 h',
  'Amp **Ciprofloxacin 500 mg** IV infusion every 12 h',
  'Amp **Vancomycin 1 g** IV infusion every 12 h, in 250 mL N/S **over 1 h**',
 ]),
 ref:['The HCAP concept has since been revised: IDSA/ATS 2019 CAP guideline (Metlay JP et al., Am J Respir Crit Care Med 2019;200:e45) advises risk-based, not category-based, MRSA / Pseudomonas coverage. Source B\'s regimen is shown as written.']
});
V({id:'pna-aspiration',topic:'pna',n:'Aspiration pneumonia',src:'B',lv:'II',
 meta:'Imp: Aspiration pneumonia',
 sc:'A 58-year-old alcoholic man was found drowsy after **vomiting**. A day later: fever and a right lower-lobe infiltrate.',
 o:PNA_BASE.concat([
  '## Antibiotics only if: new fever, infiltrate worse after 36 h, or unexplained clinical deterioration',
  'Amp **Ceftriaxone 1 g** IV infusion every 24 h',
  '**+** Cap **Azithromycin 500 mg** PO stat, every 24 h',
  '**+** Amp **Clindamycin 600 mg** IV stat **or** Amp **Metronidazole 400 mg** IV stat (anaerobic cover)',
 ]),
 br:[{c:'Alternative to the three antibiotics above',d:['**Ertapenem** or **Tazocin** alone']}]
});
V({id:'pna-pcp',topic:'pna',n:'AIDS: PCP',src:'B',lv:'II',
 meta:'Imp: Pneumonia in AIDS, PCP',
 sc:'A 38-year-old man with **HIV** has had a **dry cough and progressive dyspnea for 3 weeks**, exertional desaturation, high LDH, and bilateral interstitial infiltrates (or lung cavities). Consider PCP.',
 o:PNA_BASE.concat([
  'Treat as for CAP / HCAP / aspiration according to category A, B or C, **plus**:',
  'Amp **Cotrimoxazole (TMP-SMX) 240/1200 mg** IV every 6 h',
 ]),
 br:[{c:'PaO2 < 70, or A-a gradient > 35 mmHg',d:['**Corticosteroid** is indicated in AIDS-related PCP']}],
 fa:['در مواردی که AIDS مطرح است و یا کاویته در ریه همراه با LDH بالا داریم باید به PCP توجه کرد.']
});
