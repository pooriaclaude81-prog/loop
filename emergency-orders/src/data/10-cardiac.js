/* ============ CARDIAC ARREST ============ */
V({id:'arrest-vf',topic:'arrest',n:'Shockable (VF / pulseless VT)',src:'A',lv:'I',
 meta:'Source A case · Level I · resuscitation room',
 sc:'A 52-year-old man collapses at work. Bystander CPR is under way when EMS brings him in. He is unresponsive and pulseless. The monitor shows **ventricular fibrillation**. This is the written VF case from the Beesat sheet.',
 o:[
  'Chest compressions, high quality, minimal interruptions',
  'Cardiac monitoring / defibrillator pads on',
  '**Shock 200 J, asynchronized**, stat. Repeat as needed (VF).',
  'IV line fix (IO if no access)',
  '@D Amp **Epinephrine 1 mg** IV/IO stat, repeat every 3–5 min. Source A gives no dose.',
  'Intubation + ventilation + O2',
  'Amp **Amiodarone 300 mg** IV stat. @R A second dose of 150 mg may be given for refractory VF/VT.',
  '@D Source A also lists "Amp Dopamine 2.mg IV stat" (the number is unreadable, probably 200 mg, and dopamine is not an arrest drug). Use it only after ROSC, as a vasopressor infusion (see the branch below).',
  'Cardiology service visit',
  'Anesthesia consult',
 ],
 br:[
  {c:'ROSC achieved (pulse back)',d:[
   '@R 12-lead ECG; if STEMI, emergency cardiology / cath lab',
   '@R Avoid hypoxia and hyperoxia (SpO2 92–98%), treat hypotension (SBP ≥ 90 / MAP ≥ 65)',
   '@D Hypotensive: **dopamine** 5–20 µg/kg/min (source A listed "dopamine" without a usable dose), or norepinephrine infusion per local protocol',
   '@R Targeted temperature management, ICU admission'
  ]},
  {c:'Rhythm turns to PEA / asystole',go:['arrest-nonshockable']},
 ],
 fa:['اردر اجرا: ماساژ قلبی، مانیتورینگ، شوک ۲۰۰ ژول غیرسینکرون (قابل تکرار)، IV line، اپی‌نفرین (قابل تکرار هر ۳ تا ۵ دقیقه)، اینتوباسیون و O2، آمیودارون ۳۰۰ میلی‌گرم، ویزیت قلب و عروق، مشاوره بیهوشی.'],
 ref:['AHA 2020 Guidelines for CPR and ECC, Part 3: Adult Basic and Advanced Life Support (Panchal AR et al., Circulation 2020;142:S366). Source for epinephrine 1 mg every 3–5 min, amiodarone 300 mg then 150 mg, and post-ROSC targets.']
});
V({id:'arrest-nonshockable',topic:'arrest',n:'Non-shockable (PEA / asystole)',src:'A',lv:'I',
 meta:'Added entirely from reference. Neither source has this pathway.',
 sc:'A 70-year-old man on hemodialysis, who missed his last session, is found unresponsive by family. The monitor shows a **slow wide-complex rhythm with no pulse (PEA)**. Think hyperkalemia, hypoxia and the other reversible causes.',
 o:[
  '@R Start CPR, 30:2 until the airway is secured, then continuous compressions with 10 breaths/min',
  '@R Monitor / pads on. **No shock** for PEA or asystole.',
  '@R IV/IO access',
  '@R **Epinephrine 1 mg** IV/IO as soon as possible, then every 3–5 min',
  '@R Secure the airway (intubation or supraglottic), waveform capnography',
  '@R Rhythm check every 2 minutes',
  '@R Search for and treat the reversible causes: hypovolemia, hypoxia, acidosis (H+), hypo/hyperkalemia, hypothermia, tension pneumothorax, tamponade, toxins, thrombosis (coronary / pulmonary)',
  '@R Point-of-care ultrasound during pulse checks (tamponade, RV dilation, hypovolemia)',
 ],
 br:[
  {c:'Suspected hyperkalemia (dialysis patient, peaked T before arrest)',d:['@R Calcium gluconate / chloride IV, sodium bicarbonate, insulin + dextrose (see [[hyperk-ecg|Hyperkalemia with ECG changes]])']},
  {c:'Rhythm becomes VF / pulseless VT',go:['arrest-vf']},
  {c:'ROSC',go:['arrest-vf']},
 ],
 ref:['AHA 2020 Guidelines for CPR and ECC, Part 3 (Panchal AR et al., Circulation 2020;142:S366). PEA/asystole algorithm and reversible causes (H\'s and T\'s).']
});

/* ============ AVNRT ============ */
V({id:'svt-stable',topic:'svt',n:'Stable narrow-complex SVT',src:'A',lv:'II',
 meta:'Imp: AVNRT · Diet: NPO until stable',
 sc:'A 29-year-old woman has sudden palpitations and anxiety for 30 minutes. HR **180 regular**, BP 118/76, SpO2 98%, no chest pain. The ECG shows a regular **narrow-complex tachycardia** without visible P waves.',
 o:[
  'IV line fix, in a large proximal vein (antecubital)',
  'Cardiac monitoring + pulse oximetry',
  'ECG (12-lead; record during any drug attempt)',
  'O2 by nasal cannula 3–4 L/min only if SpO2 < 92%',
  '@R First step: vagal maneuver, modified Valsalva (strain 15 s semi-recumbent, then lie flat with legs raised)',
  'Amp **Adenosine 6 mg** IV stat, rapid push over 1–3 s, followed by **20 mL N/S flush** with the arm elevated',
  'If no response: Amp **Adenosine 12 mg** IV rapid push, followed by 20 mL N/S push with elevation. Can be repeated (source reads "x2").',
  'If still no response: Amp **Verapamil 2.5–5 mg** IV over 2 min. May repeat **5–10 mg** every 15–30 min to a **total of 20 mg**.',
 ],
 br:[
  {c:'Rhythm persists, or the patient becomes unstable (hypotension, chest pain, altered, shock)',go:['svt-unstable']},
  {c:'Wide-complex tachycardia, pre-excited AF, hypotension, or already on a beta-blocker',d:['@R Do NOT give verapamil. Treat as unstable / seek cardiology advice.']},
 ],
 fa:['در AVNRT پایدار: ابتدا آدنوزین ۶ میلی‌گرم سریع (۱ تا ۳ ثانیه) و سپس ۲۰ سی‌سی نرمال سالین فلاش با بالا نگه داشتن دست؛ در صورت عدم پاسخ ۱۲ میلی‌گرم؛ سپس وراپامیل.'],
 ref:['2015 ACC/AHA/HRS Guideline for the Management of Adult Patients with Supraventricular Tachycardia (Page RL et al., Circulation 2016;133:e506). Vagal maneuvers first; adenosine 6 then 12 mg.','REVERT trial (Appelboam A et al., Lancet 2015;386:1747). The modified Valsalva maneuver.']
});
V({id:'svt-unstable',topic:'svt',n:'Persistent or unstable → cardioversion',src:'A',lv:'I',
 meta:'Imp: AVNRT, persistent despite drugs',
 sc:'A 63-year-old man with palpitations becomes pale and diaphoretic. HR **190 regular**, BP **78/50**, confusion, chest tightness. Or: an SVT that did not convert after adenosine and verapamil.',
 o:[
  'Move to the resuscitation room, monitor + pads',
  'IV line fix, O2 if SpO2 < 92%',
  'ECG if it does not delay treatment',
  'Mild sedation (small dose, if conscious)',
  '**Synchronized DC shock 100–200 J** after mild sedation',
  'Cardiology consult',
 ],
 br:[{c:'Stable and regular narrow-complex, and drugs not yet tried',go:['svt-stable']}],
 diff:['Source A: synchronized 100–200 J. @R Current AHA guidance suggests starting at 50–100 J for regular narrow-complex SVT and escalating.'],
 ref:['2015 ACC/AHA/HRS SVT Guideline (Page RL et al., Circulation 2016;133:e506).','AHA 2020 Guidelines for CPR and ECC, Part 3: tachycardia with a pulse algorithm.']
});

/* ============ ACS ============ */
V({id:'acs-stable',topic:'acs',n:'ACS, stable',src:'B',lv:'II',
 meta:'Imp: ACS · C: II · Diet: NPO · Activity: CBR · Position: supine or semi-sitting',
 sc:'A 58-year-old man with diabetes has had **retrosternal pressure for 45 minutes**, radiating to the left arm, with nausea. BP 142/88, HR 84, SpO2 96%, lungs clear. The ECG shows **ST depression and T inversion** in V4–V6, with no ST elevation.',
 o:[
  'CVS / NPO / CBR',
  'Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, **Troponin 0–6 h**',
  'Heart monitoring (HM) + pulse oximetry (PO)',
  'O2 by non-rebreather mask 8–10 L/min **only if SpO2 ≤ 94%** (no oxygen needed if room-air SpO2 > 94%)',
  'Portable CXR (once stable, a non-portable film is acceptable)',
  '**Serial ECG**',
  'IV line fix',
  'N/S IV over 8 h (reduce if BP is high or the kidney is failing)',
  'BS glucometry',
  'Tab **ASA 325 mg**, non-enteric-coated, **chewed**, stat. (If already on aspirin at home, B writes 80 mg.)',
  'Tab **Plavix 300 mg** PO stat. (If already on Plavix at home: 75 mg.)',
  'Tab **Atorvastatin 40 mg** PO stat',
  'Tab Metoral 25 mg PO stat if SBP ≥ 90 and PR ≥ 60 (beta-blocker and ACE-I are not mandatory in the acute phase in the ED)',
  'Tab Oxazepam 10 mg PO stat',
  'Amp Pantoprazole 40 mg IV stat',
  'Amp **Morphine 3 mg** IV stat, slow over 2 min, with RR control',
  'Amp Ondansetron 4 mg IV stat if nauseated',
  'Bed guard up, relative at bedside',
 ],
 br:[
  {c:'Ongoing / recurrent chest pain, ST-T changes, positive troponin, or acute MI → anticoagulate',d:[
   'Amp **Enoxaparin 60 mg SC** stat',
  ],e:['No anticoagulant is needed if none of these criteria is met'],ec:'None of the criteria'},
  {c:'Renal failure',d:['Use **heparin** instead of enoxaparin: 5000 U IV stat, then 1000 U/h infusion']},
  {c:'Candidate for thrombolysis',d:['Heparin **60 U/kg** IV stat, then **12 U/kg/h**'],go:['acs-stemi']},
  {c:'Chest pain persists after 1 sublingual TNG pearl, SBP ≥ 90 and PR > 50',d:[
   '**TNG pearl SL** stat, **up to 3 doses every 3–5 min**',
  ]},
  {c:'Pain still present after 3 pearls and no contraindication to TNG: SBP ≥ 100, PR ≥ 50, **no RV MI, no inferior MI**',d:['Serum **TNG infusion 10 µg/min**'],e:['Do NOT give TNG when SBP < 90, PR < 50, RV MI, or inferior MI → [[acs-rvmi|inferior / RV MI]]'],ec:'Contraindicated'},
  {c:'Patient is stable AND none of the Level I triggers apply',d:['After serial ECGs, send for CXR to radiology; portable is not required']},
  {c:'Any Level I trigger: HR > 150 or < 50, cyanosis / severe distress, tearing pain to the back, altered consciousness, low BP with raised JVP, ST elevation, pulmonary edema, SBP < 90',go:['acs-stemi','chestpain-redflag']},
 ],
 fa:['اگر SpO2 بیمار بالای ۹۴٪ است نیازی به اکسیژن مکمل ندارد.','اگر بیمار قبلاً آسپرین می‌خورده ۸۰ میلی‌گرم و اگر پلاویکس می‌خورده ۷۵ میلی‌گرم داده شود.','دادن بتابلوکر و ACEI در مرحله حاد ACS در اورژانس لزوم و اجبار ندارد.','اندیکاسیون آنتی‌کوآگولان (هپارین/انوکساپارین): درد قفسه سینه دائمی یا تکرارشونده، ECG همراه با تغییرات ST-T، مثبت شدن مارکرهای قلبی، MI حاد. در نارسایی کلیه هپارین بدهید.','TNG در بیماران با فشار کمتر از ۹۰، PR کمتر از ۵۰، RV MI و Inferior MI داده نشود.','در صورتی که بیمار Stable است و موارد ردیف C را ندارد، پس از ECG های سریال برای CXR به رادیولوژی اعزام شود و نیازی به پرتابل بودن ندارد.']
});
V({id:'acs-stemi',topic:'acs',n:'STEMI / unstable → Level I, reperfusion',src:'B',lv:'I',
 meta:'Imp: ACS with ST elevation or unstable features · Level I · resuscitation room',
 sc:'A 61-year-old man has **crushing chest pain for 1 hour**, is diaphoretic and pale. BP 150/90, HR 92, SpO2 94%. The ECG shows **ST elevation in V1–V4** (anterior STEMI). A second patient: the same pain but in pulmonary edema (BP 80/50, crackles) or with a malignant arrhythmia.',
 o:[
  'Move to the resuscitation room, monitor + defibrillator pads, **resuscitation equipment at the bedside**',
  'ECG immediately; repeat / serial ECGs',
  'IV line fix; labs as in [[acs-stable|ACS, stable]] (troponin 0–6 h)',
  'ASA 325 mg chewed + Plavix 300 mg + Atorvastatin 40 mg (as in [[acs-stable|stable ACS]])',
  'Amp Morphine 3 mg IV slow over 2 min with RR control; ondansetron if nauseated',
  'TNG pearl SL / infusion only if no contraindication (see the stable-ACS page)',
  '**Emergency reperfusion**: fibrinolytic (reteplase) + emergency cardiology for PCI and transfer',
  'Heparin if thrombolysis: **60 U/kg stat then 12 U/kg/h**',
  'Bed guard up with relative at bedside',
 ],
 br:[
  {c:'Shock or malignant arrhythmia',d:['Follow [[ape-hypoperfused|cardiogenic shock / pulmonary edema]] and [[ape-addons|arrhythmia add-ons]]'],go:['arrest-vf']},
  {c:'Fibrinolysis chosen',d:[
   '@R **Reteplase 10 U IV bolus over 2 min, repeat 10 U after 30 min**',
   '@R Door-to-needle goal ≤ 30 min. Choose primary PCI instead if first-medical-contact-to-device ≤ 120 min.',
  ]},
 ],
 diff:['Source B names reteplase and "emergency fibrinolytic or PCI" but gives no reteplase dose or time targets. @R Both come from the references.'],
 ref:['2013 ACCF/AHA STEMI Guideline (O\'Gara PT et al., Circulation 2013;127:e362). Fibrinolysis timing and reteplase dosing.','2021 AHA/ACC Chest Pain Guideline (Gulati M et al., Circulation 2021;144:e368).']
});
V({id:'acs-rvmi',topic:'acs',n:'Inferior / RV MI, or SBP < 90 / HR < 50',src:'B',lv:'I',
 meta:'Imp: ACS with TNG contraindication',
 sc:'A 66-year-old man has chest pain with sweating. **ST elevation in II, III, aVF**, BP **84/50**, HR 48, clear lungs, raised JVP. This is an inferior MI with probable RV involvement, so **nitrates can drop his preload and BP further**.',
 o:[
  'Level I: resuscitation room, monitor, pads, defibrillator',
  'Serial ECG',
  '@R Right-sided ECG leads (V4R) to confirm RV infarct',
  'IV line fix; N/S given cautiously (volume dependent)',
  'ASA 325 mg chewed + Plavix 300 mg + Atorvastatin 40 mg',
  '**NO TNG** (SBP < 90, PR < 50, RV MI and inferior MI are listed contraindications)',
  'Bradycardia < 50 with symptoms: atropine 0.5 mg IV, repeat up to 6 doses; external pacemaker + dopamine drip ready (from [[ape-addons|add-ons]])',
  '@R Fluid bolus 250–500 mL N/S and reassess; avoid diuretics and nitrates',
  'Emergency reperfusion: see [[acs-stemi|STEMI]]',
 ],
 ref:['2013 ACCF/AHA STEMI Guideline (O\'Gara PT et al., Circulation 2013;127:e362). RV infarction: fluids, avoid nitrates.']
});

/* ============ CHEST PAIN ============ */
V({id:'chestpain-lowrisk',topic:'chestpain',n:'Atypical chest pain, stable',src:'B',lv:'II',
 meta:'Imp: Atypical chest pain · C: II · Diet: NPO · Activity: CBR · Position: supine',
 sc:'A 44-year-old woman has **sharp, positional left chest pain for 6 hours**, and the pain does not follow exertion. Vitals are normal, no diaphoresis, normal exam, first ECG without acute changes. No sign of dissection, PE or tamponade.',
 o:[
  'CVS / NPO / CBR',
  'Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, **Troponin (0, 6 h)**',
  'HM, PO',
  'O2 non-rebreather 8–10 L/min only if SpO2 ≤ 94%',
  'CXR after stabilization',
  'Serial ECG',
  'IV line fix; N/S over 8 h',
  'Tab **ASA 325 mg chewed** PO stat',
  'Tab **Atorvastatin 40 mg** PO stat',
  'TNG pearl SL stat ×3 doses q 5 min **if PR > 50 and SBP ≥ 100**',
  'Amp Ranitidine 50 mg IV stat',
  'Bed guard up with fixed relative',
 ],
 br:[{c:'Any of the life-threatening features appears',go:['chestpain-redflag']}],
 fa:['در هر بیمار که با درد قفسه صدری مراجعه می‌کند بیماری‌های خطرناک و کشنده باید در نظر گرفته شوند (جزئیات در صفحه «Red flags»).']
});
V({id:'chestpain-redflag',topic:'chestpain',n:'Red flags: can’t-miss killers (hub)',src:'B',lv:'I',hub:true,
 meta:'Any of these puts the patient in Level I: resuscitation room + resuscitation measures started.',
 sc:'A chest-pain patient who looks sick: **tearing pain to the back, or hypotension, or hypoxia, or an arrhythmia**. Use the branch that matches the bedside finding. The sources name each killer. The orders for several are added from references (flagged).',
 br:[
  {c:'**Arrhythmia**: tachycardia > 150 or bradycardia < 50',go:['svt-unstable','ape-addons']},
  {c:'**Aortic dissection**: stabbing pain radiating to the back or shoulder',d:[
   'Level I, IV ×2, monitor',
   '@R **Heart-rate and BP control** (target HR < 60, SBP 100–120) with IV beta-blocker (esmolol / labetalol) before vasodilators',
   '@R CT angiography of the aorta, vascular / cardiac surgery consult',
  ]},
  {c:'**Aortic + carotid dissection**: stabbing pain with unilateral neck pain and neurological signs (CVA features)',d:['@R CT angiography head and neck + chest. Avoid anticoagulants / lytics until dissection is excluded.']},
  {c:'**Tension pneumothorax**: unilateral absent breath sounds + low BP + raised JVP + low SpO2',d:[
   'Chest tube equipment at the bedside, call surgery',
   '@R Immediate needle decompression 2nd intercostal space midclavicular line (or 5th ICS anterior axillary), then chest tube',
  ]},
  {c:'**Cardiac tamponade**: muffled heart sounds + raised JVP + low BP',d:['Emergency ultrasound / echo','Pericardiocentesis equipment at the bedside']},
  {c:'**Esophageal rupture**: severe mediastinal pain + vomiting + mediastinal air-fluid level or pleural effusion',d:[
   'NPO, Level I',
   '@R Broad-spectrum IV antibiotics (e.g. piperacillin-tazobactam, as B uses for suspected esophageal tear in [[neck-esoph|neck trauma]])',
   'Surgery consult',
  ]},
  {c:'**Massive PE**: severe chest pain + falling BP + low SpO2 + raised JVP, RV-strain ECG, markedly dilated RV on echo',d:[
   'Level I, resuscitation room',
   '@R Systemic thrombolysis (e.g. alteplase 100 mg IV over 2 h) if hemodynamically unstable and no contraindication; start IV heparin',
  ]},
  {c:'**AMI**: ischemic symptoms, positive troponin, regional wall-motion abnormality on echo',go:['acs-stemi']},
  {c:'**Acute pulmonary edema**',go:['ape-perfused','ape-hypoperfused']},
 ],
 fa:['۱- تاکی یا برادی دیس ریتمی (PR > 150 یا PR < 50)','۲- دایسکشن آئورت: درد خنجری تیرکشنده به پشت یا شانه','۳- دایسکشن آئورت و کاروتید: درد خنجری همراه با درد یک‌طرفه گردن و علائم CVA','۴- پنوموتوراکس فشارنده: کاهش یک‌طرفه صدای ریوی همراه با افت BP و O2sat و JVP برجسته','۵- تامپوناد: مافل شدن صداهای قلبی همراه با JVP برجسته و افت BP','۶- پارگی مری: درد شدید مدیاستن همراه با سطح مایع هوا در مدیاستن یا پلورال افیوژن','۷- Massive PTE: درد شدید قفسه سینه، افت BP و O2sat، JVP برجسته، ECG با RV strain و بطن راست به شدت دیلاته در اکو','۸- AMI: علائم قلبی + Trop مثبت همراه با کاهش حرکت منطقه‌ای در اکو','۹- ادم حاد ریه'],
 ref:['2021 AHA/ACC Chest Pain Guideline (Gulati M et al., Circulation 2021;144:e368).','2022 ACC/AHA Guideline for Diagnosis and Management of Aortic Disease (Isselbacher EM et al., Circulation 2022;146:e334). HR/BP control in dissection.','ATLS 10th ed. (ACS 2018). Needle decompression for tension pneumothorax.','2019 ESC Guidelines on acute pulmonary embolism (Konstantinides SV et al., Eur Heart J 2020;41:543).']
});

/* ============ ACUTE PULMONARY EDEMA ============ */
const APE_BASE=[
  'CVS / NPO (until stable) / CBR. Position: **semi-sitting**, head of bed up.',
  'IV line fix',
  'Labs: CBC/diff, Na, K, BUN/Cr, Troponin (0, 6 h), **NT-proBNP**, VBG. @B Also Ca, Ph, Mg, Alb, PT/PTT/INR, D-dimer.',
  'Cardiac monitoring + pulse oximetry',
  'ECG (serial)',
  '@A O2 by face mask with reservoir bag 15 L/min, non-invasive ventilation available (target SpO2 ≥ 90%)',
  '@B O2 8–10 L/min if SpO2 ≤ 90%; mask / reservoir / NIV / intubation as the patient needs',
  'Portable CXR',
  'Bedside echocardiography (by the emergency resident) @B Lung ultrasound too',
  '@B BS glucometry if diabetic',
  'Foley catheter + I/O chart',
];
V({id:'ape-perfused',topic:'ape',n:'Good perfusion (SBP > 90)',src:'AB',lv:'II',
 meta:'Imp: Acute pulmonary edema / decompensated heart failure · NPO until stable',
 sc:'A 72-year-old man with a history of heart failure has had **orthopnea for 2 nights** and now cannot lie flat. RR 30, SpO2 86% on room air, **BP 160/95**, HR 110, bilateral crackles to the apices, pink frothy sputum. Warm and sweaty.',
 o:APE_BASE.concat([
  '## Treatment (adequate perfusion, SBP > 90)',
  '@B Pearl **TNG 0.4 mg SL** every 5 min',
  '**Serum TNG 5–10 µg/min** infusion, titrate up rapidly to goal if perfusion is adequate / SBP ≥ 90',
  'Amp **Morphine sulfate 2–5 mg** IV slow boluses, titrated to effect, with airway support. Especially useful if angina.',
  'Amp **Furosemide (Lasix) 0.5–1 mg/kg** IV stat',
  'Bed guard, relative at bedside',
 ]),
 br:[
  {c:'SBP falls to ≤ 90 or perfusion poor',go:['ape-hypoperfused']},
  {c:'Recently took sildenafil (or similar)',d:['**Avoid nitrates** (refractory hypotension)']},
  {c:'Cyanosis, apnea, respiratory distress, agitation, or hypoxia not corrected by high-flow O2',d:['Level I, move to the resuscitation room, **intubation** (endotracheal), resuscitation + intubation equipment at the bedside']},
  {c:'Precipitating factor: fever / COPD / pneumonia / arrhythmia',go:['ape-addons']},
 ],
 diff:['TNG: A gives 5–10 µg/min infusion only; B adds 0.4 mg SL pearls every 5 min first.','Oxygen: A 15 L/min reservoir mask for all; B 8–10 L/min only if SpO2 ≤ 90%.'],
 fa:['اینتوباسیون اندوتراکئال در بیماران آپنه، دیسترس تنفسی، آژیتاسیون و هیپوکسی غیرپاسخ‌دهنده به اکسیژن high flow به کار می‌رود.','از مصرف نیترات‌ها در بیمارانی که اخیراً مصرف سیلدنافیل داشته‌اند (یا سایر عوامل مشابه) باید اجتناب شود، چرا که منجر به هیپوتانسیون مقاوم خواهد شد.','همودیالیز در بیماران با نارسایی کلیوی مفید است.','در صورت Hb < 8 ترانسفوزیون خون مفید است.']
});
V({id:'ape-hypoperfused',topic:'ape',n:'Poor perfusion / shock (SBP ≤ 90)',src:'AB',lv:'I',
 meta:'Imp: Acute pulmonary edema with hypoperfusion · Level I',
 sc:'A 68-year-old woman after an anterior MI: **BP 80/50**, HR 118, cold clammy skin, urine output poor, crackles. Cardiogenic shock. **Nitrates and a big loading dose of diuretic would drop her pressure further.**',
 o:APE_BASE.concat([
  '## Treatment (SBP ≤ 90)',
  '@B **Arterial line** if available',
  'Serum **N/S 250 mL bolus over 5–10 min**, carefully (A: "با احتیاط"), only if hypoperfused',
  '**Norepinephrine 8–12 µg/min** infusion if SBP < 90 (preferred by B)',
  '@B Alternatives: Epinephrine 1–4 µg/min, or Dopamine drip, or Dobutamine drip (see the dose note below)',
  'Resuscitation + intubation equipment at the bedside',
 ]),
 br:[
  {c:'Associated severe renal failure',d:['Keep **access and dialysis equipment** ready (B). Hemodialysis helps patients in renal failure.']},
  {c:'STEMI behind the pulmonary edema',go:['acs-stemi']},
  {c:'SBP rises above 90 with good perfusion',go:['ape-perfused']},
 ],
 diff:['B lists **dopamine 0.5–2** and **dobutamine 0.5–1** (µg/kg/min as written). Usual infusion ranges are higher (dopamine 2–20, dobutamine 2–20 µg/kg/min), so check these two lines before use.'],
 ref:['2021 ESC Guidelines for Acute and Chronic Heart Failure (McDonagh TA et al., Eur Heart J 2021;42:3599). Cardiogenic shock: norepinephrine preferred; inotropes dose ranges.']
});
V({id:'ape-addons',topic:'ape',n:'Add-ons: arrhythmia, anemia, precipitants',src:'AB',lv:'I',hub:true,
 meta:'Add these to the perfused or hypoperfused orders when the finding is present.',
 sc:'A patient in pulmonary edema whose **rhythm or labs add a second problem**: atrial fibrillation with rapid ventricular response, a very slow pulse, a very fast pulse with hypotension, Hb 6.8, fever with a lobar infiltrate, or STEMI.',
 br:[
  {c:'**AF or flutter with rapid response** (rate control)',d:['@B Digoxin **0.5 mg IV**']},
  {c:'**Tachyarrhythmia, PR > 150** with any of: BP < 90, acute drop in consciousness, shock, ischemic chest pain, acute heart failure',d:['Consider **synchronized shock 100 J**','DC shock stand-by at the bedside'],go:['svt-unstable']},
  {c:'**Bradycardia, PR < 50** (also with any of the five signs above)',d:['**Atropine 0.5 mg** stat, repeat up to 6 doses','If no response to atropine: **dopamine drip** or **external pacemaker** ready']},
  {c:'**Hb < 8**',d:['Transfuse **P.C**, iso-group / iso-Rh']},
  {c:'**STEMI**',go:['acs-stemi']},
  {c:'**Fever** → treat fever. **Pneumonia** → treat pneumonia. **COPD** → treat COPD.',go:['pna-cap','copd-modsevere']},
  {c:'Severe renal failure',d:['Access and dialysis equipment ready']},
 ],
 fa:['در موارد وجود تاکی‌دیس‌ریتمی PR>150 همراه با هر یک از موارد: BP<90، افت حاد سطح هوشیاری، علائم شوک، علائم Chest pain ایسکمیک، نارسایی حاد قلبی، شوک سینکرونیزه J100 مدنظر باشد.','در موارد وجود برادی‌کاردی PR<50 همراه با هر یک از موارد فوق: آتروپین ۰/۵ میلی‌گرم تا شش نوبت. اگر به آتروپین جواب نداد دریپ دوپامین یا پیس‌میکر اکسترنال مدنظر قرار گیرد.']
});
