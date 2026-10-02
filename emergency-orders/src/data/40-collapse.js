/* ============ SYNCOPE ============ */
const SYN_BASE=[
  'CVS / NPO / CBR; supine',
  'IV line fix',
  'Labs: CBC/diff, BUN/Cr, Na, K. @B Also Ca, Ph, Mg, Alb, PT, PTT, INR, Trop.',
  'BS glucometry',
  '**ECG**',
  'PO & HM (cardiac monitoring + pulse oximetry)',
  'O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%',
  'Bed-side guard + fixed relative',
  '@A Serum N/S 500 mL IV stat. @B N/S 1 L IV every 12 h.',
  'Spiral brain CT without contrast (when indicated: focal deficit, head injury, first seizure)',
  'CXR PA',
  '@B Amp Ranitidine 50 mg IV stat',
];
V({id:'syncope-lowrisk',topic:'syncope',n:'Low-risk syncope',src:'AB',lv:'II',
 meta:'Imp: Syncope, faint · C: II · NPO · CBR · supine',
 sc:'A 22-year-old woman **fainted after standing for a long time in a hot room**, with prodrome of warmth and tunnel vision, quick recovery. No cardiac history, no family history of sudden death, no chest pain, normal exam, normal vitals, no orthostasis.',
 o:SYN_BASE,
 br:[
  {c:'Young patient with no cardiac history',d:['Source B: an ECG is taken in everyone **except** young people with no cardiac history, but source A orders an ECG for all. Take it if in any doubt.']},
  {c:'Any of the high-risk features appears',go:['syncope-highrisk']},
 ],
 diff:['Fluids: A writes N/S 500 mL stat; B writes N/S 1 L every 12 h.','CT brain: both list it. B limits it to neurological findings or suspected first-time seizure.','Source A orders the CXR for suspected aortic dissection only; B lists it as routine.']
});
V({id:'syncope-highrisk',topic:'syncope',n:'High-risk → admit and monitor',src:'AB',lv:'II',
 meta:'Imp: Syncope, high risk',
 sc:'A 71-year-old man **fainted while walking**, no warning, with a history of **heart failure**. HR 40 (new bundle-branch block on ECG), BP 105/60. His father died suddenly at 50. Or: syncope **during exercise**, or **while lying down**, or with chest pain / unexplained dyspnea.',
 o:SYN_BASE.concat([
  'Admit to a **monitored bed**',
  'Cardiology consult',
 ]),
 br:[
  {c:'Admit and monitor if ANY of: chest pain, unexplained dyspnea, CHF, valvular disease, ventricular arrhythmia, prolonged QT, new BBB, age > 65, family history of sudden death, diabetes, syncope during activity, syncope in the supine position',d:['Admit to a monitored bed']},
 ],
 fa:['سنکوپ در موارد زیر بستری و مانیتور شود: همراهی با درد سینه، تنگی نفس توجیه‌نشده، CHF، بیماری‌های دریچه‌ای، دیس ریتمی‌های بطنی، طولانی شدن QT، BBB جدید، افراد بیشتر از ۶۵ سال، سابقه مرگ ناگهانی در خانواده، DM، سنکوپ حین فعالیت، سنکوپ در حالت خوابیده.']
});
V({id:'syncope-special',topic:'syncope',n:'Special branches (hub)',src:'B',lv:'II',hub:true,
 meta:'Add to the base orders when the finding is present.',
 sc:'A syncope patient with an **extra clue**: abdominal pain, suspected PE, possible poisoning, black stool, a neurological deficit, a woman of childbearing age.',
 br:[
  {c:'**Woman of childbearing age**',d:['**βHCG**']},
  {c:'Suspected **PE**',d:['**D-dimer**']},
  {c:'Suspected **poisoning**',d:['Drug screen and **toxin panel**']},
  {c:'Neurological deficit, suspected first seizure, or abnormal neuro exam',d:['Do a full neurological exam; brain CT']},
  {c:'Suspected **GI bleeding**',d:['**Rectal exam** to rule out GI bleeding'],go:['gib-stable']},
  {c:'Syncope with **abdominal pain**',d:['Consider **aortic aneurysm, MI, ectopic pregnancy, hemorrhagic cyst**']},
  {c:'Suspected **aortic dissection**',d:['CXR PA'],go:['chestpain-redflag']},
 ],
 fa:['در خانم‌های سنین باروری βHCG چک شود. در موارد شک به PTE، D-dimer ارسال شود. در شک به مسمومیت‌ها، Screen دارویی و toxin panel ارسال شود.','معاینه TR (رکتال) برای رد GIB ضروری است.']
});

/* ============ DECREASED LOC ============ */
V({id:'loc-hub',topic:'loc',n:'Work-up and branches (hub)',src:'B',lv:'I',hub:true,
 meta:'Imp: LOC · C: I or II · NPO · CBR · supine · **ABC first**',
 sc:'A 55-year-old man is **found drowsy**, responding only to pain, GCS 9, cause unknown. Start with airway, breathing, circulation and glucose, then run the base orders while you hunt for the cause with the branches.',
 o:[
  '**ABC** first. If GCS ≤ 8 or no gag reflex: **RSI intubation**.',
  'CVS / NPO / CBR',
  'IV line fix',
  'Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, UA, BS, Cl, VBG, AST, ALT, ALP, Trop, TSH, T3, T4, NH4',
  'Toxin panel; levels of acetaminophen, ASA, ethanol; co-oximetry, MetHb',
  'PO & HM',
  'O2 by nasal cannula, mask, or mask with reservoir. **Target SpO2 > 96%.**',
  'Bed-side guard + fixed relative',
  '**BS glucometry**',
  'ECG; CXR; brain CT',
  'Move with the resuscitation team; resuscitation + intubation equipment at the bedside',
 ],
 br:[
  {c:'**Opioid overdose**: gasping respirations or apnea',d:['**Naloxone 2 mg stat**, repeat every 3–5 min, max 10 mg']},
  {c:'Miosis and a **mild** drop in consciousness',d:['**Opioid addict: naloxone 0.1 mg**. Healthy person: **0.4 mg** (per step).'],go:['opioid-resp']},
  {c:'LOC with **cachexia / malnutrition**, hyperemesis gravidarum, or an alcoholic',d:['**Thiamine 100 mg**']},
  {c:'**Brain herniation**',d:['**Mannitol 0.5–1 g/kg**'],go:['head-herniation']},
  {c:'**Acute CVA within 4.5 h** with a thrombolytic indication',d:['**Alteplase**'],go:['stroke-ischemic-lysis']},
  {c:'Suspected **meningitis**',d:['**Ceftriaxone 2 g + vancomycin 1 g** BEFORE the brain CT']},
  {c:'Suspected vascular or brainstem lesion (carotid dissection, aneurysm, basilar stenosis)',d:['**CT angiography**']},
  {c:'Suspected **non-convulsive seizure**',d:['**EEG**'],go:['seizure-status']},
  {c:'Acute LOC where MRI is considered',d:['MRI has little use in acute LOC when the patient cannot be monitored in the scanner, except in acute cerebral apoplexy, infection, neoplasm']},
  {c:'Hypoglycemia',go:['hypoglycemia-bs']},
  {c:'Hepatic encephalopathy',go:['he-lowloc']},
 ],
 fa:['ابتدا ارزیابی راه هوایی، تنفس و سیرکولاسیون انجام می‌شود. در صورت GCS ≤ 8 و عدم وجود رفلکس Gag، بیمار تحت RSI اینتوباسیون می‌شود.','میزان اکسیژن بر حسب O2SAT بیمار یا با نازال کانولا یا با ماسک یا با ماسک و رزروبگ داده شود و هدف حفظ O2SAT > ۹۶٪ است.','تیامین ۱۰۰ mg: در مواردی که بیمار با LOC مراجعه کرده است و کاشکتیک و سوء تغذیه دارد و زنان با هیپرامزیس گراویداروم شدید، الکلی‌ها داده شود.','مانیتول ۰/۵-۱ gr/kg در افرادی که هرنیاسیون مغزی دارند داده شود.','در افراد مشکوک به مننژیت سفتریاکسون ۲ gr و وانکومایسین ۱ gr قبل از انجام B-CT داده شود.','در موارد شک به تشنج‌های Non-convulsive، EEG انجام شود.']
});

/* ============ WEAKNESS ============ */
V({id:'weakness-hub',topic:'weakness',n:'Work-up and branches (hub)',src:'B',lv:'II',hub:true,
 meta:'Imp: Generalized weakness · C: II (may be I, II or III) · ABC first',
 sc:'A 70-year-old woman has felt **weak for 3 days**, and cannot get up from a chair today. She has had a poor appetite and mild diarrhea. BP 100/60, HR 98, afebrile. She takes five drugs. Weakness is a symptom of many dangerous conditions, so the base work-up is broad.',
 o:[
  'CVS / NPO / CBR; **ABC** done first (airway, breathing, circulation secured)',
  'IV line fix; N/S 1 L every 12 h',
  'Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, CPK, LDH, Trop, VBG, UA, U/C, ESR, CRP, **blood culture**, AST, ALT, ALP',
  'PO & HM',
  'O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%',
  'Bed-side guard + fixed relative',
  'CXR; brain CT; ECG; BS glucometry',
  'Amp Ranitidine 50 mg IV stat',
  'Amp **Apotel (acetaminophen) 1 g** IV infusion if T ≥ 37.8 °C',
 ],
 br:[
  {c:'Focal deficit, face / arm / leg weakness, speech change',go:['stroke-initial']},
  {c:'Dark urine, muscle pain, high CPK',go:['rhabdo-std']},
  {c:'Low BS',go:['hypoglycemia-bs']},
  {c:'High K, low K, other electrolyte disorder',go:['hyperk-ecg']},
  {c:'Sepsis / infection',go:['pna-cap','pyelo-uncomp']},
  {c:'Cardiac ischemia',go:['acs-stable']},
  {c:'Dehydration, anemia',d:['Treat accordingly (fluids, transfusion if Hb < 8 per source A/B guidance elsewhere)']},
  {c:'**Guillain–Barré, myasthenic crisis, botulism, tick paralysis**',d:['Neurology consult','@R Bedside respiratory monitoring (vital capacity / negative inspiratory force); low threshold for ICU and intubation if respiratory muscles are failing']},
  {c:'Poisoning',d:['Toxin screen; see the toxicology cluster'],go:['opioid-resp','meoh-base']},
  {c:'**Elderly**: the commonest causes are electrolyte disorders, cardiac causes, lung and urinary infection, delirium, anemia, polypharmacy, malignancy',d:['Think of these first']},
 ],
 fa:['تشخیص‌های افتراقی مهم: CVA، گیلن باره، کریز میاستنی، بوتولیسم، فلج تیک، مسمومیت‌ها، رابدومیولیز، دهیدراتاسیون، افت BS، اختلالات الکترولیت، آنمی، ایسکمی قلبی، سپسیس.','شایع‌ترین علل ضعف ژنرالیزه در افراد مسن: اختلال الکترولیت، علل قلبی، عفونت‌های ریه و ژنیتویورینری، دلیریوم، آنمی، اختلالات مصرف داروهای متعدد و بدخیمی.'],
 ref:['Neuromuscular respiratory failure monitoring (vital capacity, NIF): Neurocritical Care Society guideline on Guillain–Barré / myasthenic crisis; e.g. Wijdicks EFM et al., Neurocrit Care 2016;24:1 (practice reference).']
});

/* ============ HYPOGLYCEMIA ============ */
V({id:'hypoglycemia-bs',topic:'hypoglycemia',n:'Diabetic patient, low BS',src:'A',lv:'II',
 meta:'Source A case: hypoglycemia',
 sc:'A **78-year-old diabetic woman** on insulin is brought with **weakness and a drop in consciousness**. She is sweaty and drowsy, BS **55 mg/dL**.',
 o:[
  'IV line fix',
  '@D **Dextrose 50%** IV bolus stat (Source A: "Vial dextrose 50% IV stat"): **50 mL (25 g)**',
  '@D Serum **D/W 10%** infusion IV stat (source A writes the rate as "1-cc/h", not readable): titrate to glucose; for example 100 mL/h',
  'Check BS **every 2 hours**. Check again 15 min after the bolus.',
  '**If 2 consecutive BS readings are above 200 mg/dL, hold the dextrose infusion.**',
  'Continue the patient\'s usual medications, **except** the one that caused the episode (the second word is unreadable in the sheet; hold the insulin or sulfonylurea)',
 ],
 br:[{c:'Patient is awake and can swallow',d:['@R Oral glucose 15–20 g (juice or glucose tablets), recheck in 15 min']}],
 ref:['Hypoglycemia in diabetes: ADA Standards of Care 2024, Section 6 (Diabetes Care 2024;47(Suppl 1):S111). IV dextrose 25 g, recheck at 15 min.']
});
