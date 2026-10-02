/* ============ STROKE ============ */
const STROKE_BASE=[
  'CVS / NPO / CBR; supine',
  'IV line fix',
  'Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, BS, PT, PTT, INR, **Troponin**. @A Also CPK, LDH, CK-MB, ALT, AST, ALP. @B Also Alb.',
  'Pulse oximetry + cardiac monitoring (PO & HM)',
  'O2 by nasal cannula 4–6 L/min **if SpO2 ≤ 90%**',
  '**ECG**',
  '**Bedside glucose (glucometry) BEFORE the brain CT**, urgent',
  '**Emergency spiral brain CT without contrast**: aim for CT done **within 20 min** of arrival and **read within 45 min**',
  'CXR after the patient is stable',
  '@A Serum N/S 500 mL IV stat. @B N/S 500 mL every 4 h.',
  '@B **Emergency neurology visit**',
  '@B Amp Pantoprazole 40 mg IV stat',
  '@B Bed-side guard + fixed relative. Move the patient only with the resuscitation team. Resuscitation + intubation equipment at the bedside.',
];
V({id:'stroke-initial',topic:'stroke',n:'Suspected stroke, initial orders',src:'AB',lv:'I',
 meta:'Imp: CVA / R/O CVA · C: I · NPO · CBR · supine',
 sc:'A 68-year-old man developed **right arm weakness and slurred speech 90 minutes ago**. BP 175/95, HR 88 (irregular), glucose 140 mg/dL, GCS 14, right facial droop. No head injury, no anticoagulants. The CT has not been done yet.',
 o:STROKE_BASE,
 br:[
  {c:'**GCS ≤ 8, absent gag reflex, gasping respirations, signs of herniation** (eyes deviated to one side, one dilated pupil, pinpoint pupils, ↓LOC)',d:['**Intubation first**; assess breathing and circulation, treat as needed (ABC first in every stroke patient)']},
  {c:'CT: no blood and onset within 4.5 h',go:['stroke-ischemic-lysis']},
  {c:'CT: no blood and outside the window, or lysis contraindicated',go:['stroke-ischemic-nolysis']},
  {c:'CT: intracranial hemorrhage',go:['stroke-hemorrhagic']},
 ],
 diff:['Fluids: A writes N/S 500 mL stat once; B writes N/S 500 mL every 4 h.','Source A pages list wider labs (CPK, LDH, CK-MB, LFTs); B lists Ca, Ph, Mg, Alb.','Source B (and the LOC page) repeat a toxin panel / paracetamol / salicylate / ethanol level block in the stroke list. It looks copied from the LOC page, so it is left out here.'],
 fa:['در هر بیمار با شواهد stroke مثل همه بیماران دیگر ABC در قدم اول است. در صورت وجود GCS ≤ 8، عدم وجود رفلکس Gag، تنفس‌های gasping، علائم هرنیاسیون مغزی، Gaze چشم‌ها به طرفین، دیلاتاسیون یکی از مردمک‌ها، مردمک‌های pinpoint و کاهش هوشیاری مدنظر قرار دادن Intubation در ابتدا، همین‌طور موارد Breathing و Circulation ارزیابی و اقدامات لازم صورت گیرد.','Brain CT اورژانسی حداکثر تا ۲۰ دقیقه از ورود بیمار به اورژانس گرفته شده باشد و حداکثر تا ۴۵ دقیقه رؤیت شده باشد.','قند خون بیمار اورژانسی قبل از Brain CT گرفته شود.']
});
V({id:'stroke-ischemic-lysis',topic:'stroke',n:'Ischemic, within window → alteplase',src:'AB',lv:'I',
 meta:'Imp: Acute ischemic stroke, thrombolysis candidate · C: I',
 sc:'A 68-year-old man with **right arm weakness and slurred speech for 90 minutes** (NIHSS 9). **CT shows no hemorrhage.** BP 180/100, glucose 140, no anticoagulant, no recent surgery or bleeding. Clinical and radiological criteria for thrombolysis are met.',
 o:STROKE_BASE.concat([
  '## Blood pressure',
  'If **BP > 185/110**: Amp **Labetalol 20 mg (4 mL)** IV over 2 min',
  '@R Keep BP ≤ 185/110 before lysis and < 180/105 for 24 h after',
  '## Thrombolysis',
  'Ready to give **alteplase** after the **OK of the emergency physician or the neurologist** (mandatory) and when clinical and radiological indications are met',
  '@D Alteplase **0.9 mg/kg** (max 90 mg). **10% as a bolus over 1 min, the remaining 90% as an infusion over 60 min.** Source B\'s line is garbled ("5 mg stat and ?? 45 mg"), so the standard regimen is shown.',
  'Transfer to the **Stroke Care Unit (SCU)**',
  '@R No anticoagulants or antiplatelets for 24 h after alteplase; repeat neuro checks and BP checks per protocol',
 ]),
 br:[{c:'New severe headache, vomiting, or neurological worsening during the infusion',d:['@R Stop the infusion, urgent non-contrast CT, call neurology']}],
 ref:['2019 AHA/ASA Guidelines for the Early Management of Patients With Acute Ischemic Stroke (Powers WJ et al., Stroke 2019;50:e344). Alteplase 0.9 mg/kg, BP thresholds, 24-h post-lysis care.']
});
V({id:'stroke-hemorrhagic',topic:'stroke',n:'Hemorrhagic stroke (ICH on CT)',src:'AB',lv:'I',
 meta:'Imp: Acute hemorrhagic stroke · C: I',
 sc:'A 72-year-old woman on **warfarin** has a sudden severe headache, vomiting and left hemiparesis. BP **195/110**. **CT shows a right basal-ganglia intracerebral hemorrhage.**',
 o:STROKE_BASE.concat([
  '## Blood pressure',
  'If **BP > 160–180** or **MAP > 130**: Amp **Labetalol 20 mg** IV (4 mL) over 2 min, repeat as needed',
  '## Anticoagulated',
  'If on an anticoagulant: request **FFP and Vitamin K** immediately',
  '@R **4-factor PCC** is preferred over FFP for warfarin reversal where available; Vit K 10 mg IV slow with it',
  '@R Head of bed 30°, neurosurgery consult, ICU / stroke unit admission',
  '@R No thrombolytic and no antithrombotic',
 ]),
 br:[{c:'GCS ≤ 8, herniation signs',d:['Intubation first (see the initial page)'],go:['head-herniation']}],
 diff:['Target BP: B gives 160–180 (or MAP > 130). @R The 2022 AHA ICH guideline recommends lowering SBP to about 140 (range 130–150) for patients presenting with SBP 150–220 and no contraindication.'],
 ref:['2022 AHA/ASA Guideline for the Management of Patients With Spontaneous Intracerebral Hemorrhage (Greenberg SM et al., Stroke 2022;53:e282). BP target and anticoagulation reversal.']
});
V({id:'stroke-ischemic-nolysis',topic:'stroke',n:'Ischemic, no lysis',src:'AB',lv:'II',
 meta:'Imp: Acute ischemic stroke, not a thrombolysis candidate · C: I–II',
 sc:'A 74-year-old woman with right facial droop and aphasia. **Last seen well 8 hours ago.** CT shows no hemorrhage. BP 190/100. Out of the thrombolysis window.',
 o:STROKE_BASE.concat([
  'BP: in ischemic stroke, **BP > 185/110 is treated with labetalol 20 mg** (source B)',
  '@R If lysis is **not** planned, permissive hypertension: treat only if BP > 220/120',
  '@R **Aspirin 160–325 mg** within 24–48 h once hemorrhage is excluded (not within 24 h after alteplase)',
  'Transfer to the **SCU** / neurology',
 ]),
 diff:['B treats ischemic stroke with labetalol above 185/110. @R AHA 2019 allows permissive hypertension up to 220/120 in patients who are **not** receiving lysis.'],
 ref:['2019 AHA/ASA Early Management of Acute Ischemic Stroke (Powers WJ et al., Stroke 2019;50:e344).']
});

/* ============ SEIZURE ============ */
const SZ_INDIC='Brain CT indications: first seizure, suspected structural brain lesion, focal deficit, persistent altered consciousness, fever, recent head trauma, persistent headache, cancer history, anticoagulant use, immunodeficiency / HIV / chemotherapy, age > 40, partial seizure.';
V({id:'seizure-stable',topic:'seizure',n:'Seizure over, patient stable',src:'AB',lv:'II',
 meta:'Imp: Seizure · C: II · NPO · CBR · supine, head elevated',
 sc:'A 32-year-old man had a **witnessed generalized tonic-clonic seizure lasting 2 minutes**, now post-ictal and slowly waking, GCS 13 → 15, BP 130/80, glucose 110. Either a first seizure, or known epilepsy with missed doses.',
 o:[
  'CVS / NPO / CBR; bed guard + fixed relative; bed head up',
  'IV line fix',
  'Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, BS, PT, PTT, INR. @A Also CPK, LDH, CK-MB, Trop, UA, ALT, AST, ALP. @B Also Alb.',
  'PO & HM',
  'O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%',
  'N/S 1 L IV stat, free infusion',
  'ECG',
  'BS glucometry',
  'Brain CT when indicated (list below)',
  'Move the patient only with the resuscitation team',
  'Amp **Diazepam 10 mg** on **standby**, **or** Amp **Midazolam 5–10 mg IM** if no peripheral line',
  'Amp Ranitidine 50 mg IV stat (@A Pantoprazole 40 mg IV stat)',
  'Resuscitation + intubation equipment at the bedside; LP set if indicated',
 ],
 br:[
  {c:'**First seizure**, a single episode, patient now awake',d:['**Do not start** an antiseizure drug']},
  {c:'On antiseizure drugs',d:['Check the serum level (Depakin / valproate, phenobarbital, levetiracetam, carbamazepine)']},
  {c:'Brain CT indicated',d:[SZ_INDIC]},
  {c:'Fertile female',d:['βHCG']},
  {c:'Suspected liver disease',d:['LFT']},
  {c:'Suspected substance misuse',d:['Drug / toxin panel and levels']},
  {c:'Seizure continues > 5 min or repeats without recovery',go:['seizure-status']},
  {c:'Low BS, low Na, low Ca, poisoning, eclampsia',go:['seizure-causes']},
  {c:'Neurology service ordering an antiseizure load',go:['seizure-neuro-load']},
 ],
 fa:['در خانم‌های سنین باروری βHCG چک شود. در صورت شک به بیماری‌های کبدی LFT چک شود.','در مواردی که بیمار بار اول است که تشنج کرده است و فقط یک نوبت تکرار شده است اندیکاسیون شروع داروی ضد تشنج ندارد و نباید شروع شود.','در صورتی که بیمار سابقه تشنج و مصرف داروهای ضد تشنج دارد سطح سرمی داروها چک شود.','در بیمارانی که شک به سوء مصرف مواد داریم داروها و سطح توکسین دارویی چک شود.'],
 diff:['Antacid: A writes pantoprazole 40 mg; B writes ranitidine 50 mg.','A includes a loading dose of phenytoin from the neurology service; B reserves antiseizure drugs for status or recurrent seizures (see the linked pages).']
});
V({id:'seizure-status',topic:'seizure',n:'Status epilepticus (3 lines)',src:'B',lv:'I',
 meta:'Imp: Status epilepticus · Level I',
 sc:'A 45-year-old woman is **still seizing 8 minutes** after the start, or has had **repeated seizures without regaining consciousness between them**. SpO2 falling, glucose pending.',
 o:[
  'Level I: resuscitation room, airway, O2, IV line, monitor, check glucose immediately',
  '## First line (benzodiazepine)',
  '**Diazepam 5 mg** IV over 2 min; repeat every 2–3 min up to a **cumulative 20 mg**',
  '(No IV line: Midazolam 5–10 mg IM)',
  '## Second line',
  '**Phenytoin 20 mg/kg** IV, at **max 50 mg/min** (or fos-phenytoin 20 mg/kg at max 150 mg/min IM/IV)',
  '**or** Sodium **valproate 20–40 mg/kg** IV over 10–20 min',
  '**or** **Levetiracetam 1–3 g** IV over 15 min',
  '## Third line: intubate, then start one of',
  'Pentobarbital 5 mg/kg then 0.5–3 mg/kg/h',
  'Phenobarbital 20 mg/kg then 50 mg/min',
  'Midazolam 0.2 mg/kg then 0.1–0.4 mg/kg/h',
  'Propofol 2 mg/kg then 5–10 mg/kg/h',
 ],
 br:[{c:'A cause is found: hypoglycemia, low Na, low Ca, poisoning, eclampsia',go:['seizure-causes']}],
 fa:['درمان status: ۱) تشنج بیشتر از ۵ دقیقه یا ۲) تشنج‌های مکرر که در بین آنها بیمار هوشیار نشود.'],
 ref:['AES Guideline: Treatment of Convulsive Status Epilepticus (Glauser T et al., Epilepsy Curr 2016;16:48). Includes IM midazolam 10 mg and the second-line choices.']
});
V({id:'seizure-causes',topic:'seizure',n:'Provoked seizure: treat the cause (hub)',src:'B',lv:'II',hub:true,
 meta:'Use with the stable or status pages when the cause is found.',
 sc:'A seizing patient whose **glucose is 40**, or **Na 114**, or who **overdosed on a tricyclic**, or who is **36 weeks pregnant with BP 170/110**. Treating the cause stops the seizure when benzodiazepines will not.',
 br:[
  {c:'**Hypoglycemia, BS < 60**',d:['**Dextrose 50%** IV: 1 g/kg as written by B. @R The usual adult dose is 25 g (50 mL of D50).'],go:['hypoglycemia-bs']},
  {c:'**Hyponatremia, Na < 120**',d:['**3% saline 3 mL/kg**']},
  {c:'**Hypocalcemia, Ca < 6–7**',d:['**Calcium gluconate 10%, 10–30 mL**']},
  {c:'**TCA overdose**',d:['Alkalinize: **Sodium bicarbonate 1 mEq/kg** and infusion']},
  {c:'**Aspirin overdose**',d:['Alkalinization with **sodium bicarbonate 1 mEq/kg** + infusion; **dialysis**']},
  {c:'**Isoniazid overdose**',d:['**Pyridoxine 5 g IV**']},
  {c:'**Lithium poisoning**',d:['**Hemodialysis**']},
  {c:'**Cocaine / methamphetamine ("glass")**',d:['**Benzodiazepine**']},
  {c:'**Eclampsia**',d:['**Magnesium sulfate 6 g** over 20 min']},
 ],
 fa:['در هیپوگلیسمی BS < 60: از دکستروز ۵۰٪ ۱ gr/kg تزریق شود. هیپوناترمی Na < 120: تزریق ۳ cc/kg از سالین ۳٪. هیپوکلسمی Ca < 7-6: تزریق ۱۰ تا ۳۰ cc از کلسیم گلوکونات ۱۰٪. TCA overdose: آلکالیزاسیون با ۱ mg/kg سدیم بی‌کربنات و انفوزیون آن. ASA overdose: آلکالیزاسیون + دیالیز. ایزونیازید: پیریدوکسین ۵ گرم IV. مسمومیت با لیتیوم: همودیالیز. تشنج با کوکائین یا شیشه: بنزودیازپین. اکلامپسی: منیزیم سولفات ۶ گرم ظرف ۲۰ دقیقه.']
});
V({id:'seizure-neuro-load',topic:'seizure',n:'Neurology-service loading order',src:'A',lv:'II',
 meta:'Source A: this order was written by the **neurology service**, not emergency medicine.',
 sc:'A 40-year-old patient with a seizure has been seen by the neurology service, who write the full set of orders including an **antiseizure load**.',
 o:[
  'Imp: seizure. Diet: NPO. Activity: CBR',
  'Labs: CBC/diff, BUN, Cr, Na, K, Mg, P, Ca, BS, PT, PTT, INR, CPK, LDH, CK-MB, Trop, UA, ALT, AST, ALP',
  'BS by glucometry',
  'ECG',
  'Spiral brain CT without contrast',
  'Amp **Phenytoin 750 mg** stat, then **100 mg TDS** (ampules in 500 mL N/S). @D Usual load is 15–20 mg/kg; confirm for body weight.',
  '**Or instead of the phenytoin**: Amp **Depakin (valproate) 1200 mg** stat IV',
  'Amp **Diazepam** standby',
  'Amp Pantoprazole 40 mg IV stat',
  'Bed side up; a companion stays with the patient',
 ],
 ref:['Phenytoin loading 15–20 mg/kg: AES Guideline on convulsive status epilepticus (Glauser T et al., Epilepsy Curr 2016;16:48).']
});

/* ============ HEADACHE ============ */
const HA_BASE=[
  'CVS / NPO / CBR; supine, head elevated 30°',
  'Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, BS, **ESR**',
  'PO & HM',
  'O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%',
  'IV line fix; N/S 1 L IV stat, free infusion',
  'ECG; BS glucometry',
  'Bed-side guard + fixed relative',
  'Amp Ranitidine 50 mg IV stat',
  'Tab **Acetaminophen 500 mg** PO stat **or** Tab **Gelofen (ibuprofen) 400 mg** PO stat',
  'Amp **Metoclopramide 10 mg** IV',
];
V({id:'headache-benign',topic:'headache',n:'Known headache, stable',src:'B',lv:'III',
 meta:'Imp: Headache · C: III',
 sc:'A 34-year-old woman with **known migraine**, throbbing right-sided headache with nausea for 12 hours, similar to her previous attacks. Normal vitals, normal neurological exam, no meningism.',
 o:HA_BASE,
 br:[
  {c:'The patient has a known previous headache, you know the history well, **no meningismus**, **stable vital signs**, **no focal deficit**, and **improves during observation**',d:['**May be discharged from the emergency department**']},
  {c:'Severe headache refractory to the analgesics above, no contraindication',d:['Amp **Morphine 3 mg** IV slowly over 3 min with RR control']},
  {c:'Brain CT is needed',go:['headache-redflag']},
 ],
 fa:['در صورتی که بیمار سردرد شناخته شده قبلی دارد، از تاریخچه بیمار آگاهی کامل داریم، علائم مننژیسموس نداشته باشد، علائم حیاتی پایدار داشته باشد، FND نداشته باشد و در طی دوره تحت نظر بهبود یابد می‌توان از اورژانس مرخص نمود.']
});
V({id:'headache-redflag',topic:'headache',n:'Red flags → Level I',src:'B',lv:'I',
 meta:'Imp: Headache with red flags · Level I',
 sc:'A 52-year-old man with the **worst headache of his life**, sudden onset ("thunderclap") during exertion, neck stiffness and vomiting. Or: severe headache with **decreased consciousness or a focal deficit**. Or: neck pain with unilateral facial pain and **numbness of the hand and foot** (carotid dissection).',
 o:HA_BASE.concat([
  'Move to the resuscitation room (Level I); resuscitation + intubation equipment at the bedside',
  '**Brain CT**',
 ]),
 br:[
  {c:'**Brain CT is indicated** if any of: focal neurological deficit, suspected raised ICP, signs of meningitis, loss of consciousness, moderate or severe head trauma, severe or sudden headache, change in intensity or duration of a previous headache, CSF shunt, older age, minor head trauma on anticoagulants / alcohol / liver or kidney disease, headache not responding to drugs, immunosuppression, or headache with seizure',d:['Brain CT as above']},
  {c:'Level I triggers: ↓LOC, focal deficit, herniation signs, terrible sudden headache, neck pain + unilateral facial pain + hand/foot numbness (suspect carotid dissection)',d:['Level I, resuscitation equipment at the bedside']},
 ],
 fa:['اگر بیمار کاهش سطح هوشیاری دارد، علائم FND دارد، علائم هرنی مغزی، تغییر در سطح هوشیاری، سردرد شدید و وحشتناک، درد گردن و یک‌طرفه صورت و بی‌حسی در دست و پا (مشکوک به دایسکشن کاروتید) بیمار در سطح یک قرار می‌گیرد.','Brain CT در صورت وجود FND، شک به افزایش ICP، علائم مننژیت، LOC، تروماى سر متوسط و شدید، سردردهای شدید و ناگهانی، تغییر در شدت و مدت زمان علائم سردرد قبلی، وجود شانت مغزی، افراد مسن، تروماهای سر مینور که فرد داروهای ضد انعقاد، الکل، مشکلات کبدی و کلیوی دارد، سردردهایی که به درمان دارویی جواب نداده‌اند، سردرد در افراد نقص ایمنی و سردرد همراه با تشنج لازم است.']
});
V({id:'headache-cluster',topic:'headache',n:'Cluster headache',src:'B',lv:'III',
 meta:'Imp: Cluster headache',
 sc:'A 38-year-old man has **excruciating right periorbital pain** lasting 45 minutes, with tearing, nasal congestion and restlessness. It recurs every night for weeks.',
 o:[
  '**First step: high-flow O2, mask, 8–10 L/min**',
  'CVS / NPO / CBR, monitor, IV line',
  '@R **Sumatriptan 6 mg SC** (or intranasal) if no cardiovascular contraindication. Source B gives oxygen only.',
 ],
 ref:['Cluster headache acute treatment: oxygen 12 L/min and subcutaneous sumatriptan 6 mg. EHF/AHS guidance (e.g. May A et al., Eur J Neurol 2006;13:1066; American Headache Society consensus 2016).']
});
V({id:'headache-special',topic:'headache',n:'Special tests: GCA, pregnancy, severe hypertension',src:'B',lv:'II',hub:true,
 meta:'Add-ons to the base headache orders.',
 sc:'A **68-year-old woman with a new temporal headache and jaw pain** (suspect giant-cell arteritis), or a **pregnant woman at 35 weeks with headache and BP 170/110**, or a hypertensive patient with BP > 180/110.',
 br:[
  {c:'Suspected **temporal arteritis**: woman older than 50, collagen-vascular disease',d:['Check **ESR**']},
  {c:'Fertile woman, suspected **eclampsia**',d:['Check **βHCG**'],go:['seizure-causes']},
  {c:'**BP > 180/110**',d:['**Blood pressure control is mandatory**']},
 ],
 fa:['ESR در شک به آرتریت تمپورال معمولاً در خانم‌های سن بالای ۵۰ سال با سابقه بیماری‌های کلاژن واسکولار و βHCG در خانم‌های در سنین باروری و شک به اکلامپسی چک شود.','در صورت وجود BP > ۱۸۰/۱۱۰ کنترل فشار خون الزامی است.']
});

/* ============ VERTIGO ============ */
const VE_BASE=[
  'CVS / NPO / CBR; supine',
  'IV line fix; N/S 1 L every 12 h',
  'PO & HM',
  'O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%',
  'Bed-side guard + fixed relative',
  'BS glucometry',
  'Amp **Ondansetron 4–8 mg** IV stat (or Amp Promethazine 25 mg IM)',
];
V({id:'vertigo-peripheral',topic:'vertigo',n:'Peripheral vertigo',src:'B',lv:'III',
 meta:'Imp: Vertigo · C: II (typically III if clearly peripheral)',
 sc:'A 45-year-old woman has **brief spinning on rolling in bed**, lasting under a minute, with nausea. No hearing loss, no headache, no focal deficit, normal gait. Typical **BPPV** (Dix-Hallpike positive).',
 o:VE_BASE.concat([
  'Lab tests other than BS are **not mandatory**. CBC and electrolytes only if syncope is suspected.',
  '**Brain CT is not needed** when the vertigo is typical, definite and peripheral',
 ]),
 fa:['سرگیجه‌های محیطی: BPPV، سندرم منیر، نوریت وستیبولار، نوروما آکوستیک، لابیرنتیت.','در افتراق با سرگیجه موارد زیر مدنظر قرار گیرد: دیس ریتمی، MI، هیپوولمی، شوک وازواگال، سپسیس، حمله پانیک، آنمی، عفونت.']
});
V({id:'vertigo-central',topic:'vertigo',n:'Central vertigo / cerebellar hemorrhage',src:'B',lv:'II',
 meta:'Imp: Vertigo, central · C: II',
 sc:'A 66-year-old man with **hypertension and diabetes** has sudden severe vertigo with **vomiting, inability to walk, and a headache**. Gaze-evoked nystagmus. BP 190/110. Suspect **cerebellar stroke or hemorrhage**.',
 o:VE_BASE.concat([
  'Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, Trop, BS',
  '**Brain CT**',
  'CXR',
  'ECG',
  'Resuscitation + intubation equipment at the bedside; move only with the resuscitation team',
 ]),
 br:[
  {c:'Cerebellar hemorrhage or other ICH suspected',d:['**Emergency neurosurgery consult**','If **BP > 180/110**: Amp **Labetalol 20 mg (4 mL)** IV over 2 min, repeat every 10–15 min']},
  {c:'Admit if any of: age > 55, AF rhythm, diabetes, vascular disease, vertigo not improved with drugs, central vertigo',d:['**Admit**']},
 ],
 fa:['سرگیجه‌های مرکزی: CVA، میگرن ورتبروبازیلار، هیپوگلیسمی، VBI، خونریزی مخچه، تروما سر و گردن.','در خونریزی‌های مخچه مشاوره اورژانسی نوروسرجری درخواست شود.','جهت کنترل BP در افراد با خونریزی مغزی و BP > ۱۸۰/۱۱۰، لابتالول ۲۰ mg (۴ cc) ظرف دو دقیقه تزریق شود و هر ۱۰ تا ۱۵ دقیقه تکرار شود.']
});
