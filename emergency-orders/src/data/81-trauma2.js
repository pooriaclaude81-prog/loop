/* ============ BLUNT LIMB ============ */
const BL_BASE=[
  'CVS / NPO / RBR (source: CBR) ; supine or sitting',
  'IV line, **if** reduction / sedation / severe pain / neurovascular disorder is expected',
  'Amp **Morphine 3 mg** IV stat, slow over 2 min (severe pain; watch for respiratory depression)',
  'Serum N/S 500 mL IV infusion (if the above needs IV access)',
  '**Ice pack and limb elevation**',
];
const BL_XR='**X-ray views**: wrist, forearm, elbow, arm, ankle, leg, knee, thigh = AP + lateral. Palm and foot = AP + oblique. Tenderness in the anatomical snuffbox = **scaphoid view**. Elbow = true lateral. Lisfranc injury = lateral weight-bearing foot view (MRI confirms). Calcaneus = calcaneal view. Lateral malleolus = AP + lateral + **mortise view**. Knee = patellar and tunnel views.';
V({id:'blunt-intact',topic:'blunt',n:'Neurovascularly intact: splint',src:'B',lv:'III',
 meta:'Imp: Blunt limb injury · C: III · NPO · CBR/RBR · supine or sitting',
 sc:'A 30-year-old **fell on an outstretched hand**, with a swollen, tender wrist and **tenderness in the anatomical snuffbox**. Pulses, sensation and movement are normal.',
 o:BL_BASE.concat([
  'X-rays **after the patient is stable**',
  'Transfer to the **plaster room** for splinting and reduction, if needed',
 ]),
 br:[
  {c:'X-ray views',d:[BL_XR]},
  {c:'Mild or no pain',d:['No analgesic needed; or **Acetaminophen + Gelofen (ibuprofen)** tablets']},
  {c:'Severe pain',d:['An opioid (and watch for apnea)']},
  {c:'**Splint choice**',d:[
   'Proximal / middle phalanges (not thumb, not great toe): **Buddy taping**',
   'Great toe: **Toe plate**; thumb: **thumb spica**',
   'Palm, wrist, distal forearm: **short volar splint**',
   'Mid / proximal forearm, elbow, distal humerus: **long arm splint**',
   'Proximal humerus and mid / distal humerus: **U-slab**',
   'Shoulder, clavicle: **arm sling**',
   'Foot and ankle: **short leg splint**; leg: **short or long leg splint**; knee: **cylinder splint**',
  ]},
  {c:'Labs',d:['No labs for a simple trauma. Labs only if emergency surgery or a life-saving act is possible.']},
  {c:'CT without contrast',d:['Normal films but suspected **occult fracture**, **inability to bear weight** (lower limb), severe wrist or elbow tenderness with impaired ROM, or occult shoulder / pelvis fracture']},
  {c:'Neurovascular disorder',go:['blunt-nv']},
  {c:'Needs reduction under sedation',go:['blunt-reduction']},
 ],
 fa:['در صورت درد خفیف و یا نبود درد نیازی به تجویز مسکن نیست. در موارد درد خفیف می‌توان از قرص استامینوفن همراه با قرص ژلوفن (بروفن) استفاده کرد. در صورت موارد درد شدید از مخدر استفاده شود و البته مراقب عوارض ناشی از مخدر از جمله احتمال آپنه تنفسی باشیم.']
});
V({id:'blunt-nv',topic:'blunt',n:'Neurovascular compromise / compartment syndrome',src:'B',lv:'II',
 meta:'Imp: Blunt limb injury with neurovascular disorder · C: II (limb threatened)',
 sc:'A 25-year-old with a **supracondylar fracture**, **absent radial pulse, cool pale hand, numb fingers**, and severe pain with passive stretch. Or: a **dislocated knee** with a cyanotic foot. Imminent amputation is possible.',
 o:BL_BASE.concat([
  '**Emergency limb-saving measures**',
  '**Immediate transfer to the OR** for reduction of the dislocation or splinting and immobilization',
  '**Emergency surgery or orthopedics visit**',
  'Labs: Na, K, PT, PTT, INR, BUN/Cr, CBC/diff',
  '**Arterial color-Doppler ultrasound** of the same limb if vascular findings; **CT angiography** if indicated',
 ]),
 br:[
  {c:'Abnormal pulse, or abnormal sensory / motor exam → **Level II**. **Cyanosis**, obvious deformity with perfusion disorder, **compartment syndrome**, or joint dislocation with **imminent amputation** → emergency OR.',d:['Emergency limb-saving steps, OR, surgery / ortho visit']},
  {c:'**Soft or hard signs** (see the penetrating-limb pages)',go:['plimb-soft','plimb-hard']},
 ]
});
V({id:'blunt-reduction',topic:'blunt',n:'Reduction under sedation (PSA)',src:'B',lv:'II',
 meta:'Imp: Blunt limb injury needing reduction and procedural sedation',
 sc:'A 40-year-old with a **displaced distal radius fracture** needing reduction and casting, severe pain.',
 o:BL_BASE.concat([
  'Transfer to the plaster room / OR',
  '## At the bedside, ready (coordinate with the emergency specialist)',
  'Amp **Ketamine 150 mg** ready **or** Amp **Fentanyl 100 µg** ready **or** **Nesdonal (thiopental) 300 mg** ready',
  'Ambu bag, oral airway, suction, HM, PO, Amp Ondansetron, airway-management equipment for PSA',
  'Take a history of heart and lung disease, drug sites, and **previous difficult intubation**',
 ]),
 br:[{c:'IV line for **reduction**, a fracture with **severe pain** that needs splint or cast, **PSA**, or a neurovascular disorder',d:['Secure the IV line']}]
});

/* ============ PENETRATING LIMB ============ */
const PL_BASE=[
  'CVS / NPO / CBR; supine',
  ...TRAUMA_MON,
  '**X-ray AP & lateral** of the injured limb (wrist, forearm, elbow, arm: AP/lat. Palm, foot: AP/oblique. Ankle, leg, knee, thigh: AP/lat. Shoulder: AP)',
  ...TET,
  'Amp **Cefazolin 1 g** IV infusion',
  'Analgesic; **splint** the limb',
  'After the above: **emergency OR** for exploration, irrigation, dressing',
];
V({id:'plimb-simple',topic:'plimb',n:'Simple, stable wound',src:'B',lv:'III',
 meta:'Imp: Penetrating limb injury · C: III',
 sc:'A 30-year-old with a **stab wound to the forearm**, bleeding controlled, **normal pulses and sensation**, normal movement. A simple penetrating injury.',
 o:PL_BASE,
 br:[
  {c:'Simple penetrating trauma without hemodynamic problems',d:['**No lab tests needed**']},
  {c:'Complete tetanus vaccination',d:['No need for the vaccines above']},
  {c:'Previous allergy to a tetanus vaccine',d:['**Contraindicated**']},
  {c:'Any neurological or vascular sign appears',go:['plimb-soft','plimb-hard']},
 ]
});
V({id:'plimb-soft',topic:'plimb',n:'Soft signs',src:'B',lv:'II',
 meta:'Imp: Penetrating limb injury with soft signs · C: II',
 sc:'A 28-year-old with a **gunshot to the thigh**: **weaker pedal pulse than the other side**, a **large non-pulsatile hematoma**, and **numbness**, but no active bleeding.',
 o:PL_BASE.concat([
  '**Arterial color-Doppler ultrasound** of the injured limb',
  '**Repeat examination** at intervals',
  'If neuro or pulse deficit: Level II; possible imminent amputation; emergency surgery / orthopedics visit',
 ]),
 br:[{c:'**Soft signs**: reduced pulse force or pulse asymmetry; large non-pulsatile, non-progressive hematoma; numbness or paresthesia',d:['Arterial color-Doppler ultrasound and repeated exams']},{c:'**Gunshot to the proximal limb**, or the patient is hemodynamically unstable',d:['Emergency surgery visit']},{c:'A hard sign appears',go:['plimb-hard']}]
});
V({id:'plimb-hard',topic:'plimb',n:'Hard signs / major bleeding → OR',src:'B',lv:'I',
 meta:'Imp: Penetrating limb injury with hard signs · Level I/II',
 sc:'A 24-year-old with a **stab wound to the groin**, **pulsatile bleeding**, an **expanding hematoma** and an absent dorsalis pedis pulse. BP 90/60.',
 o:PL_BASE.concat([
  '**IV line ×2 large**; serum **N/S 1 L stat**',
  'Labs: CBC/diff, BUN/Cr, PT, PTT, INR, Na, K',
  'Reserve **blood (P.C) and FFP**',
  '**Emergency color-Doppler** of the artery; **CT angiography**',
  '**Surgery visit** and start resuscitation',
  'To the **emergency OR** for exploration and bleeding control',
 ]),
 br:[{c:'**Hard signs**: absent pulse; limb ischemia; expanding hematoma; pulsatile bleeding; bruit or thrill over the artery',d:['Emergency surgery visit; PO, HM, IV line, fluids, analgesia; transfer to the OR; **FFP and P.C** if unstable']}],
 fa:['در صورت وجود علائم Hard sign مانند: نبودن نبض، ایسکمی اندام، هماتوم گسترش‌یابنده، خونریزی ضربان‌دار، بروئی یا تریل روی شریان: ویزیت اورژانس جراحی و اقدامات اورژانس لازم مانند PO، HM، IV line، سرم تراپی، مسکن و انتقال به اتاق عمل اورژانس.']
});
V({id:'plimb-openfx',topic:'plimb',n:'Open fracture (wound > 1 cm)',src:'B',lv:'II',
 meta:'Imp: Penetrating limb injury with fracture',
 sc:'A 33-year-old with an **open tibial fracture**, a **3 cm skin wound** (Gustilo II/III) after a motorbike crash, contaminated. Pulses intact.',
 o:PL_BASE.concat([
  'Amp **Gentamicin 80 mg** IV stat, **added** (fracture with skin laceration larger than 1 cm, grades II and III)',
 ]),
 br:[{c:'**Cefazolin allergy**',d:['Use Amp **Clindamycin 600 mg** IV instead']},{c:'Life-threatening signs: massive bleeding, hemorrhagic shock, abnormal pulses or neurological signs',d:['Surgery visit, resuscitation, emergency color-Doppler','IV line ×2 large; N/S 1 L stat']}]
});

/* ============ SHOULDER ============ */
const SH_BASE=[
  'CVS / NPO / CBR; sitting',
  'HM, PO; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%',
  'Bed-side guard + fixed relative',
  '**AP shoulder X-ray and Y-view** (all traumatic and first-time dislocations need an X-ray **before** reduction)',
  'IV line; Serum N/S 250 mL IV infusion',
  'Neurovascular exam **before and after** reduction',
  '**Control X-ray after reduction**',
];
V({id:'shoulder-uncomp',topic:'shoulder',n:'Uncomplicated: reduction',src:'B',lv:'III',
 meta:'Imp: Shoulder dislocation · C: III · NPO · CBR · sitting',
 sc:'A 25-year-old rugby player **fell on an abducted arm**: squared-off shoulder, painful, **normal sensation and pulses**, arm held in slight abduction.',
 o:SH_BASE.concat([
  'For **sedation or nerve block**, transfer to the **emergency OR** for reduction',
  '**Arm sling and swathe** after reduction',
  'Discharge orders (below)',
 ]),
 br:[
  {c:'**Sedation drugs on stand-by** at the bedside, and **never injected without the senior emergency-medicine resident**',d:['Amp **Fentanyl 100 µg** ready','Amp **Thiopental 300 mg** ready']},
  {c:'**Nerve block** (after a secure IV line)',d:['**Supraclavicular or interscalene** block: **15–20 mL lidocaine 1%**; lidocaine cream; **LP needle #21 (green)** and an extension tube ready','Done with **two emergency-medicine assistants** present']},
  {c:'**Procedural sedation (PSA)** requirements',d:['A person skilled in airway management at the head; another person does the reduction','Overall assessment: airway, cardiac, respiratory, GI, hepatic, renal; PO and HM; capnography if available; ECG; resuscitation and intubation equipment; vital signs; O2 at the bedside']},
  {c:'**Discharge after sedation**',d:['For **12 h**: no driving, no important decisions, no dangerous sports (cycling, gymnastics), no bath, no cooking, no electrical equipment; no food for 2 h; return for breathing difficulty, nausea or vomiting','Children must be able to sit alone','After a **nerve block**, heaviness and numbness of the limb for several hours is normal']},
  {c:'Neurological or vascular deficit',go:['shoulder-nv']},
  {c:'Dislocation with a fracture',go:['shoulder-fx']},
 ]
});
V({id:'shoulder-nv',topic:'shoulder',n:'Neurovascular deficit',src:'B',lv:'I',
 meta:'Imp: Shoulder dislocation with neurovascular deficit · Level I–II',
 sc:'A 60-year-old with a dislocated shoulder, **numbness over the deltoid (axillary nerve)**, **weak radial pulse**, a cool, pale hand.',
 o:SH_BASE.concat([
  '**Emergency limb-saving measures**',
  'Orthopedics visit',
 ]),
 br:[{c:'Neurological signs (numbness, **axillary-nerve** motor loss), sensory / motor disorder, **vascular disorder** (pulse loss or asymmetry), limb ischemia, cyanosis',d:['**Level I or II**, emergency limb-saving measures']}],
 fa:['در موارد وجود علائم نورولوژیک مانند بی‌حسی، اختلال در حرکات مربوط به عصب آگزیلاری، اختلال حسی و حرکتی و همچنین اختلال عروقی مانند اختلال در نبض‌ها و غیرقرینگی نبض‌ها، ایسکمی اندام‌ها، سیانوز اندام‌ها، در سطح یک یا دو قرار می‌گیرد و نیاز به اقدامات اورژانسی جهت نجات اندام دارد.']
});
V({id:'shoulder-fx',topic:'shoulder',n:'Dislocation with a fracture',src:'B',lv:'II',
 meta:'Imp: Shoulder fracture-dislocation',
 sc:'A 55-year-old with a **fracture-dislocation** of the shoulder (greater tuberosity fracture) on X-ray.',
 o:SH_BASE.concat(['**Orthopedics visit** (a dislocation with a fracture, or neurovascular involvement)'])
});

/* ============ MANDIBLE ============ */
V({id:'mandible-dislocation',topic:'mandible',n:'Mandible dislocation',src:'B',lv:'III',
 meta:'Imp: Mandible dislocation · C: III · NPO · RBR · sitting',
 sc:'A 22-year-old **yawned and can no longer close his mouth**, with drooling and pain in front of the ears. Non-traumatic dislocation.',
 o:[
  'CVS / NPO / RBR; sitting',
  'HM, PO; O2 by nasal cannula 4–6 L/min',
  'Bed-side guard + fixed relative',
  '**X-ray not needed** if non-traumatic. If **traumatic**: **facial CT** or **Panorex**.',
  'IV line; Serum N/S 250 mL IV infusion',
  'Transfer to the emergency OR for **sedation and reduction**',
  '## Ready at the bedside; not injected without the senior emergency resident',
  'Amp **Fentanyl 100 µg**; Amp **Thiopental 300 mg**',
  '**Barton bandage** after reduction',
  'Discharge orders (as for [[shoulder-uncomp|shoulder dislocation]])',
 ],
 fa:['تمامی دررفتگی‌های تروماتیک نیاز به گرافی panorex و یا facial CT دارند.']
});

/* ============ BURNS ============ */
const BURN_BASE=[
  'Imp: burn · Diet: NPO',
  'IV line ×2 **large**, or a **central line**',
  'Labs: CBC/diff, BUN, Cr, Na, K, BS, ABG, UA, Ca',
  'CXR',
  '**Ringer lactate resuscitation by the Parkland formula**: **4 mL × body weight (kg) × % burn**. **Half in the first 8 h; the other half over the next 16 h.** (Example: 70 kg, 40% burn = 11,200 mL; 5,600 mL in the first 8 h = 700 mL/h.) @D Source A\'s written volume ("45-- cc") is not readable.',
  'NG tube fix; Foley catheter fix; chart I/O',
  'Amp **Famotidine 20 mg** IV stat, then TDS',
  'Amp **Morphine sulfate (MS) 5 mg** IV stat, slowly',
  'Cardiac monitoring + pulse oximetry',
  'Amp **Td 0.5 mL** SC stat (source A writes "D.T 0.15 mg", probably 0.5)',
  'Wash and dress the **non-burned** areas, **splint** the burned limb (**avoid manipulating blisters**) @D (text partly unclear)',
  'ICU admission; surgeon consult',
];
V({id:'burn-std',topic:'burn',n:'Major burn: Parkland resuscitation',src:'A',lv:'I',
 meta:'Imp: burn · NPO · ICU admission',
 sc:'A **35-year-old man** (70 kg) is pulled from a house fire with **partial- and full-thickness burns over about 40% of his body surface**, in pain, BP 100/60, HR 120. Airway is clear for now.',
 o:BURN_BASE.concat([
  'O2 by face mask **4–6 L/min**',
  'Amp **Vitamin C 1 g ×10 (10 g)** infusion in 1000 mL serum, rate as written is not readable ("1-cc/h"). @D If used, high-dose vitamin C is given as a continuous infusion (e.g. 66 mg/kg/h for 24 h in the Tanaka protocol) under ICU supervision.',
 ]),
 br:[
  {c:'**Vitamin C** is usually given for burns **> 30%**',d:['If given, **reduce the initial fluid volume**']},
  {c:'Burns to count in the Parkland formula',d:['**First-degree burns are not counted**']},
  {c:'Airway risk (face / neck burns, inhalation)',go:['burn-airway']},
  {c:'Circumferential burns of the thorax, neck or limbs',go:['burn-circ']},
 ],
 fa:['سوختگی‌های درجه ۱ در قانون پارکلند محاسبه نمی‌شوند.','Vit C معمولاً در بیماران با سوختگی بالای ۳۰٪ تجویز می‌شود و در صورت تجویز باید از حجم سرم اولیه کاسته شود.'],
 ref:['Parkland formula: Baxter CR, Shires T. Ann NY Acad Sci 1968;150:874; ABA / ATLS 10th ed. Vitamin C: Tanaka H et al., Arch Surg 2000;135:326 (investigational).']
});
V({id:'burn-airway',topic:'burn',n:'Inhalation / airway concern',src:'A',lv:'I',
 meta:'Imp: burn with airway involvement · Level I',
 sc:'A 40-year-old trapped in a **closed-room fire**: **singed nasal hairs, soot in the mouth, hoarse voice**, facial burns, SpO2 90%.',
 o:BURN_BASE.concat([
  'O2 by face mask **4–6 L/min**, with **intubation for a secure airway**',
  '@R **Early intubation** while the airway is still passable; carboxyhemoglobin level; **100% O2** if CO exposure is suspected',
 ]),
 ref:['American Burn Association Advanced Burn Life Support (ABLS) provider manual: indications for early intubation in inhalation injury.']
});
V({id:'burn-circ',topic:'burn',n:'Circumferential burn → escharotomy',src:'A',lv:'I',
 meta:'Imp: burn with circumferential eschar',
 sc:'A 30-year-old with **full-thickness circumferential burns of the chest and left forearm**. Breathing is restricted, the **hand is cold with a weak pulse**.',
 o:BURN_BASE.concat([
  '**Escharotomy** if indicated',
 ]),
 br:[{c:'Circumferential eschar of the **thorax or neck** with possible respiratory restriction',d:['**Escharotomy**']},{c:'**Limb** escharotomy',d:['Cut on the **mid-lateral** side, deep enough that **fat bulges out**']}],
 fa:['در زخم‌های حلقوی توراکس و گردن، در صورت احتمال محدودیت تنفسی، باید اسکاروتومی انجام شود.','اسکاروتومی در اندام باید در سمت mid lat انجام شود و در حدی که چربی بیرون بزند کفایت می‌کند.']
});

/* ============ LACERATION ============ */
V({id:'lac-simple',topic:'lac',n:'Outpatient superficial laceration',src:'A',lv:'III',
 meta:'Source A: emergency clinic case, with a prescription',
 sc:'A **26-year-old** with a **clean 3 cm superficial cut on the forearm** from a kitchen knife, 2 hours old, bleeding controlled, normal sensation and movement. Seen in the emergency clinic.',
 o:[
  'Suture in the **outpatient operating room**',
  '## Prescription (source A)',
  'Oint **Tetracycline 3%** (N = 1), every 12 h',
  'Cap **Cephalexin 500 mg** (N = 30), every 6 h',
  'Tab **Acetaminophen 500 mg** (N = 20), every 8 h',
 ],
 br:[{c:'Tetanus status unknown or overdue',d:['See the [[tetanus-table|tetanus table]]']}],
 diff:['Source B states that in **scalp** lacerations routine antibiotics are not given unless the wound is crushed, contaminated or hard to clean. Systemic cephalexin for a clean, simple laceration is not generally required.']
});

/* ============ EPISTAXIS ============ */
V({id:'epi-anterior',topic:'epi',n:'Anterior bleed: stepwise',src:'B',lv:'III',
 meta:'Imp: Epistaxis · C: IV/III/II · NPO · CBR · semi-sitting',
 sc:'A 45-year-old man has had a **right-sided nosebleed for 20 minutes** after blowing his nose. He is sitting up, swallowing little blood, BP 140/85, not anticoagulated.',
 o:[
  'CVS / NPO / CBR; semi-sitting',
  '**Step 1**: Naphazoline or oxymetazoline nasal drops in each nostril, **twice**; then **pinch the nose with the fingers for 10–15 min**',
  '**Step 2** (if not controlled): **Chemical cautery with silver nitrate for 5 s** (never more than 15 s)',
  '**Step 3**: A **surgical** (absorbable) pack **soaked in tranexamic acid** placed in the nose',
  '**Step 4**: **Anterior nasal packing** in the bleeding nostril; if still not controlled, pack the **other nostril** too',
  '**Step 5**: Not controlled: **ENT** or surgery consult',
 ],
 br:[
  {c:'**Labs and IV access are not needed**, unless he takes **warfarin** or another anticoagulant (enoxaparin etc.) or has a severe underlying disease, or the bleed is heavy',d:['Labs: CBC/diff, BUN/Cr, PT, PTT, INR, BG/Rh; IV line; N/S 1 L stat'],go:['epi-massive']},
  {c:'Not controlled and a **posterior** source is suspected',go:['epi-posterior']},
 ]
});
V({id:'epi-posterior',topic:'epi',n:'Posterior bleed',src:'B',lv:'II',
 meta:'Imp: Epistaxis, suspected posterior',
 sc:'A 68-year-old man with **hypertension** has a nosebleed that continues **despite anterior packing**, with blood running down the throat.',
 o:[
  'CVS / NPO / CBR; semi-sitting; IV line',
  'Labs: CBC/diff, BUN/Cr, PT, PTT, INR, BG/Rh',
  '**Posterior nasal packing with a Foley catheter #12**, inflated with **5–7 mL of distilled water**',
  'ENT or surgery consult',
 ]
});
V({id:'epi-massive',topic:'epi',n:'Massive bleed / anticoagulated',src:'B',lv:'II',
 meta:'Imp: Epistaxis, massive or on anticoagulants · C: II',
 sc:'A 72-year-old on **warfarin** with a **heavy nosebleed**, dizzy, BP 98/60, HR 108. The bleeding may cause **hypovolemic shock**.',
 o:[
  'CVS / NPO / CBR; semi-sitting',
  'IV line; Serum **N/S 1 L** IV stat',
  'Labs: CBC/diff, BUN/Cr, PT, PTT, INR, BG/Rh',
  'Local measures as on the [[epi-anterior|anterior page]]; ENT or surgery consult',
 ],
 br:[{c:'Warfarin and a high INR',go:['warfarin-bleed']}],
 fa:['بسته به شرایط بیمار و میزان خونریزی می‌تواند یک خونریزی ساده تا خونریزی‌های شدید و ماسیو باشد که منجر به شوک هیپوولمیک شود لذا سطح‌بندی بیمار بر حسب شرایط بیمار متفاوت است.','آزمایشات لازم نمی‌باشد مگر این که بیمار وارفارین مصرف می‌کند و یا داروی ضد انعقاد دیگر مثل انوکساپارین مصرف می‌کند و یا یک بیماری زمینه‌ای شدید دارد.']
});

/* ============ TETANUS ============ */
V({id:'tetanus-table',topic:'tetanus',n:'Tetanus prophylaxis table',src:'B',lv:'III',
 meta:'Source B refers to a tetanus table that is missing from the booklet text. This table is added from the CDC / ACIP recommendations.',
 sc:'A 35-year-old with a **rusty-nail puncture wound of the foot**. He is unsure of his immunization history, and his last tetanus shot was **8 years ago**. Is a vaccine needed? Is tetanus immunoglobulin?',
 o:[
  '@R **If immunization is complete, no tetanus vaccine is needed** (Source B). Decide using the table below.',
  '@R **Contraindication**: previous allergic reaction to a tetanus vaccine.',
  '@R Source B orders: **Td 0.5 mL IM** and **Tetabulin 250 IU IM** (written as "cc" in the source).',
 ],
 br:[
  {c:'**Clean, minor wound** AND history is **unknown or fewer than 3 doses**',d:['@R **Td (or Tdap)** 0.5 mL IM; complete the primary series','@R **No** tetanus immunoglobulin']},
  {c:'**Clean, minor wound** AND **3 or more doses**',d:['@R Td / Tdap only if **≥ 10 years** since the last dose']},
  {c:'**All other wounds** (contaminated with dirt, feces, soil or saliva; puncture; avulsion; missile; crush; burn; frostbite) AND history **unknown or fewer than 3 doses**',d:['@R **Td / Tdap** AND **tetanus immunoglobulin 250 U IM** at a different site']},
  {c:'**All other wounds** AND **3 or more doses**',d:['@R Td / Tdap only if **≥ 5 years** since the last dose; no immunoglobulin']},
 ],
 ref:['Liang JL et al. Prevention of Pertussis, Tetanus, and Diphtheria with Vaccines in the United States: Recommendations of the ACIP. MMWR Recomm Rep 2018;67(RR-2):1–44.']
});
