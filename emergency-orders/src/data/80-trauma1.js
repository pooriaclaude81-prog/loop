const TET=[
  'Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)',
  'Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**. Source B writes "250 cc", but the unit is 250 **IU**.',
];
const TRAUMA_MON=['HM, PO (cardiac monitor, pulse oximetry)','O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%'];

/* ============ PENETRATING ABDOMEN ============ */
V({id:'pabd-unstable',topic:'pabd',n:'Unstable → resuscitation',src:'B',lv:'I',
 meta:'Imp: Penetrating abdominal trauma · C: II (→ Level I when unstable) · NPO · CBR · supine',
 sc:'A 24-year-old man is **stabbed in the left upper abdomen**. BP **76/40**, HR 132, pale, drowsy, **bowel loops outside the wound**, rigid abdomen. Active bleeding. **A knife may still be in the abdomen.**',
 o:[
  '**Move at once to the resuscitation room**; ATLS protocol; resuscitation + intubation equipment ready',
  'CVS / NPO / CBR; supine',
  'IV line ×2 **large**',
  'Serum N/S **1 L free**',
  'eFAST',
  'Labs: CBC/diff, BUN/Cr, Na, K, VBG, BG/Rh, UA, amylase, lipase, AST, ALT, ALP, Bili T/D, CPK, LDH. **Lactate** in unstable patients.',
  ...TRAUMA_MON,
  'Portable CXR',
  'NGT fix; Foley catheter fix',
  'Reserve **4 units P.C** (iso-group, iso-Rh) and **4 units FFP**',
  'Amp **Morphine sulfate 3 mg** IV slow over 2 min (not in asthma / COPD)',
  ...TET,
  'Amp **Cefazolin 1 g** IV infusion',
  'Amp Ranitidine 50 mg IV stat',
  'Hb/Hct every 6 h; control I/O; ECG; **cervical collar** fix; protected bed with fixed relative',
  'Emergency **surgery visit**; to the emergency OR for wound exploration',
 ],
 br:[
  {c:'**Unstable** = SBP < 90, active bleeding, ↓LOC, bowel outside the abdomen, peritonitis signs (tenderness, rebound, guarding, rigidity), knife or foreign body in the abdomen',d:['Resuscitation room + emergency surgery visit at the same time']},
  {c:'Any trauma patient with SBP < 90, respiratory distress needing intubation, or penetrating trauma to neck, chest, abdomen or proximal limbs, or GCS ≤ 8',d:['Request emergency surgery visit']},
  {c:'Associated head injury (as printed on this page of the source)',d:['Brain CT; neurosurgery after the CT; move only with the resuscitation team','If intubated: Amp **Phenytoin 1 g** IV in 250 mL N/S over 30 min, **ECG first** to check for pre-existing blocks']},
  {c:'Deformed limbs',d:['X-ray of the limbs, but **first examine vessels and nerves**. If pulses or neurological exam are abnormal: surgery and orthopedics visit.']},
  {c:'Women of childbearing age',d:['**βHCG**']},
  {c:'Elderly with chest trauma',d:['**Troponin**']},
 ],
 fa:['اگر بیمار ناپایدار است یعنی فشارخون کمتر از ۹۰ میلی‌متر جیوه دارد، خونریزی فعال از شکم دارد، کاهش سطح هوشیاری دارد، روده‌های بیمار از شکم بیرون است، علائم پریتونیت، تندرنس، ریباند تندرنس، گاردینگ و رژیدیتی دارد، چاقو یا جسم خارجی درون شکم مانده است بیمار فوراً به اتاق احیا برده شود و همزمان ویزیت اورژانس سرویس محترم جراحی درخواست شود.','در هر بیمار ترومایی با BP<90، دیسترس تنفسی که نیاز به اینتوباسیون دارد یا ترومای نافذ با گلوله به گردن، توراکس، شکم، پروگزیمال اندام‌ها و GCS ≤ 8 ویزیت اورژانس سرویس محترم جراحی درخواست شود.','در موارد ناپایداری لاکتات چک شود.']
});
V({id:'pabd-stable-deep',topic:'pabd',n:'Stable, deep or unclear wound → CT',src:'B',lv:'II',
 meta:'Imp: Penetrating abdominal trauma · C: II · stable',
 sc:'A 30-year-old man is **stabbed in the right flank**. BP 126/80, HR 90, awake, mild tenderness. The **depth and base of the wound cannot be seen**, and the peritoneum may be violated.',
 o:[
  'CVS / NPO / CBR; supine',
  'Labs: CBC/diff, BUN/Cr, Na, K, VBG, BG/Rh, UA, amylase, lipase, AST, ALT, ALP, Bili T/D, CPK, LDH',
  ...TRAUMA_MON,
  '**Abdominal and pelvic CT with IV contrast**',
  'IV line ×2 large; Serum N/S 1 L free **if indicated**',
  '**eFAST**',
  'Upright CXR **after the patient is stable**',
  'NGT, Foley **if indicated**',
  'Reserve P.C and FFP **if indicated**',
  'Amp **Morphine sulfate 3 mg** IV slow over 2 min',
  ...TET,
  'Amp **Cefazolin 1 g** IV infusion',
  'After stabilization and the orders above, **transfer to the emergency OR for exploration** of the wound',
  'Amp Ranitidine 50 mg IV stat; Hb/Hct every 6 h; control I/O; ECG; **collar** fix; protected bed with relative',
 ],
 br:[
  {c:'Patient is **stable** and the wound depth and base are **not clear**, or the wound is **deep / penetrates the abdomen**',d:['**CT of the abdomen and pelvis with IV contrast**']},
  {c:'**Pelvic X-ray** (PXR)',d:['If he has **not walked**, or has **lower abdominal tenderness**']},
  {c:'Suspected foreign body (knife etc.) in the abdomen',d:['**Abdominal X-ray AP and lateral**']},
  {c:'Patient becomes unstable',d:['**Portable CXR**'],go:['pabd-unstable']},
  {c:'Young, no cardiac history, no chest trauma or chest pain',d:['**No ECG needed**']},
  {c:'Severe trauma elsewhere or any neck finding (neck tenderness, focal deficit, intoxication, ↓LOC, long-bone fractures = NEXUS)',d:['Fix a cervical collar and request a neck AP / lateral film']},
  {c:'Severe bleeding or hemodynamic instability',d:['Reserve **P.C and FFP**']},
  {c:'Asthma or COPD',d:['**No morphine**']},
 ]
});
V({id:'pabd-superficial',topic:'pabd',n:'Superficial wound, base visible',src:'B',lv:'III',
 meta:'Imp: Penetrating abdominal trauma, superficial',
 sc:'A 22-year-old man with a **2 cm very superficial stab wound** to the right abdominal wall. The **base of the wound is visible**, the wound is shallow, and the peritoneum is not violated (intact). Normal vitals, soft abdomen.',
 o:[
  'CVS / NPO / CBR; supine',
  'Local wound exploration at the bedside; **simple repair**',
  ...TET,
  'Amp **Cefazolin 1 g** IV infusion (if laceration)',
 ],
 br:[
  {c:'Wound base visible, wound shallow, peritoneum intact',d:['**No need for full laboratory tests**','**No abdominal CT with contrast**','**No NGT or Foley**']},
  {c:'Wound or peritoneal breach is deep or unclear',go:['pabd-stable-deep']},
 ],
 fa:['اگر زخم شکم بیمار بسیار سطحی است و کف زخم مشخص است و عمق زخم زیاد نیست و از پریتوئن رد نشده است نیازی به ارسال آزمایشات کامل نمی‌باشد.']
});

/* ============ PENETRATING CHEST ============ */
const PCH_BASE=[
  'CVS / NPO / CBR; supine',
  'Labs: CBC/diff, BUN/Cr, PT, PTT, INR, BG/Rh, **Troponin**, VBG, Na, K',
  'CXR; **FAST / eFAST** (more sensitive than CXR for pneumothorax)',
  ...TRAUMA_MON,
  'IV line',
  'Serum N/S **1 L** IV stat, free infusion',
  'ECG',
  ...TET,
  'Amp **Cefazolin 1 g** IV infusion (if there is a laceration)',
  'Amp Ranitidine 50 mg IV stat; check **Hb/Hct every 6 h**',
  'Amp **Morphine 3 mg** IV slow over 2 min (if needed)',
];
V({id:'pchest-unstable',topic:'pchest',n:'Unstable → resuscitation',src:'B',lv:'I',
 meta:'Imp: Penetrating chest trauma · C: II (→ Level I when unstable) · NPO · CBR · supine',
 sc:'A 28-year-old man is **stabbed in the left chest**. RR 36, SpO2 82%, BP **78/44**, HR 130, **absent breath sounds on the left**, distended neck veins, ↓LOC. Tension pneumothorax or massive hemothorax.',
 o:PCH_BASE.concat([
  '**Move to the resuscitation room**, ATLS protocol',
  'IV line ×2 **large**',
  'Resuscitation and intubation equipment at the bedside',
  '**Needle thoracostomy** with a grey cannula (as written: "دوبرانول خاکستری"), prepared and done',
  '**Chest-tube equipment** at the bedside',
  '**Emergency thoracotomy equipment** at the bedside',
  'Reserve **2 U P.C** and **2 U FFP**, iso-group iso-Rh (as needed for severity)',
  '**Emergency surgery visit**',
  'Foley catheter fix; control I/O; NGT fix; protected bed',
 ]),
 br:[
  {c:'Instability: ↓LOC, SpO2 ≤ 90%, BP ≤ 90, weak pulses, tachycardia, delayed capillary refill, absent unilateral breath sounds with BP drop, severe dyspnea, cardiac arrhythmia, active cardiac bleeding, sucking wound, likely massive hemothorax, tension pneumothorax',d:['Level I, resuscitation room, ATLS']},
  {c:'Shock',d:['Check **lactate**; **βHCG** in women of childbearing age','Portable CXR']},
 ],
 fa:['ناپایداری بیمار شامل: کاهش سطح هوشیاری، O2SAT ≤ ۹۰٪، BP ≤ ۹۰، نبض‌های ضعیف و تاکی‌کاردی و پرشدگی مویرگی تأخیری، کاهش صدای یک‌طرفه همراه با افت BP، دیسترس تنفسی شدید، دیس ریتمی قلبی، خونریزی فعال قلبی، زخم مکنده، احتمال هموتوراکس ماسیو و PTX فشارنده.']
});
V({id:'pchest-stable',topic:'pchest',n:'Stable',src:'B',lv:'II',
 meta:'Imp: Penetrating chest trauma · C: II · stable',
 sc:'A 25-year-old man with a **small stab wound to the right chest**, **SpO2 97%**, equal breath sounds, no dyspnea, no chest pain, BP 130/80, alert. Possible small pneumothorax.',
 o:PCH_BASE.concat([
  '**Chest CT**, if needed (more sensitive than CXR)',
  'Reserve P.C and FFP only if the trauma is severe; **not needed** if he is fully stable, alert, with a normal exam and a **superficial** wound',
 ]),
 br:[
  {c:'Stable patient with: **no unilateral decreased breath sounds, SpO2 ≥ 94%, no severe rib or sternum tenderness, no LOC, non-toxic, no arrhythmia or chest pain, no dyspnea, fully alert**',d:['A plain **CXR is enough**; **no CT** needed (saves costs)']},
  {c:'Lacerations',d:['Cefazolin']},
  {c:'Patient deteriorates',go:['pchest-unstable']},
  {c:'Fractures of the **lower three ribs**',d:['Intra-abdominal injury to the kidney, liver, spleen is likely; **more than three** rib fractures need **permanent admission**']},
 ],
 fa:['در صورت شکستگی در سه دنده‌ی تحتانی احتمال آسیب‌های داخل شکمی به کلیه، کبد، طحال زیاد است و در صورت شکستگی بیشتر از سه دنده از مجموع دنده‌ها بستری دائم لازم است.']
});

/* ============ FACIAL TRAUMA ============ */
const FACE_BASE=[
  'CVS / NPO / CBR; supine',
  ...TRAUMA_MON,
  'IV line; Serum N/S **1 L** IV stat',
  ...TET,
  'Amp **Cefazolin 1 g** IV infusion, **if indicated** (see the list on the simple-laceration page)',
];
V({id:'face-airway',topic:'face',n:'Airway-threatening → Level I/II',src:'B',lv:'I',
 meta:'Imp: Facial trauma · C: III → II or I',
 sc:'A 33-year-old man after a **car crash**, bleeding heavily from the mouth, **swollen lips and tongue**, a **mobile, crushed midface**, voice muffled, SpO2 88% and falling.',
 o:FACE_BASE.concat([
  'Immediate **resuscitation measures** (Level I or II)',
  'Resuscitation, **intubation equipment**, **extraglottic devices (LMA)** and a **cricothyrotomy set** at the bedside',
  'If prophylactic intubation: labs PT, PTT, INR, VBG, Na, K, BUN/Cr, CBC/diff',
  'After the immediate measures: **emergency OR** for washing, dressing and wound repair',
 ]),
 br:[{c:'Severe facial bleeding, hypoxia, cyanosis, severe lip / face / tongue edema, severe bone fractures or crush, severe lip / tongue / jaw trauma, or hematomas of lips, tongue, neck threatening the airway',d:['**Level II, or even Level I**']}],
 fa:['در صورت خونریزی شدید صورت، هیپوکسی، سیانوز، ادم شدید لب‌ها و صورت و زبان، شکستگی و خردشدگی‌های شدید استخوانی و یا تروماهای شدید لب و زبان و فک و یا هماتوم‌های شدید لب و زبان و گردن که احتمال به مخاطره انداختن راه هوایی را دارد در سطح II و یا حتی I قرار می‌گیرد و در این صورت اقدامات فوری احیای بیمار انجام شود. وسایل احیا و اینتوباسیون و وسایل اکسترا گلوتیک مانند LMA و ست کریکوتیروتومی بر بالین بیمار آماده باشد.']
});
V({id:'face-fracture',topic:'face',n:'Stable, fracture suspected',src:'B',lv:'II',
 meta:'Imp: Facial trauma, suspected fracture · C: II/III',
 sc:'A 27-year-old man **punched in the face**, swollen cheek, **numb lip**, **malocclusion with limited mouth opening (trismus)**, face asymmetry. Airway stable, SpO2 98%.',
 o:FACE_BASE.concat([
  'Labs only if indicated',
  '**Facial CT, axial and coronal**',
  'After the above: emergency OR for washing, dressing, wound repair',
 ]),
 br:[
  {c:'Request **facial CT (axial + coronal)** if any of: positive **bite (abnormal occlusion) test**; **Le Fort** fractures; facial asymmetry; trismus; any suspicion of a fracture',d:['CT']},
  {c:'**Nasal X-ray** (bilateral) if any of: septal hematoma, uncontrolled epistaxis, cannot breathe through both nostrils, asymmetric nose shape',d:['Bilateral nasal X-ray']},
  {c:'**NEXUS criteria** at the same time: distracting injury, LOC, intoxication, focal deficit, neck tenderness',d:['**Neck X-ray AP & lateral** and a **cervical collar**']},
  {c:'Tetanus',d:['See the [[tetanus-table|tetanus table]]']},
 ]
});
V({id:'face-simple',topic:'face',n:'Simple facial laceration / nasal injury',src:'B',lv:'III',
 meta:'Imp: Facial trauma, simple · C: III',
 sc:'A 19-year-old with a **2 cm clean cheek laceration** after a fall, alert, no deformity, no airway issue, normal bite and eye movements.',
 o:FACE_BASE.concat([
  'Wound wash, dressing and repair in the emergency OR',
 ]),
 br:[
  {c:'**Antibiotics are indicated in facial wounds when:** (1) gross contamination; (2) involvement of **ear or nasal cartilage**; (3) **nasal tamponade**; (4) crush wound; (5) **open fracture**, or a fracture communicating with the sinuses; (6) **through-and-through** lacerations',d:['Cefazolin 1 g IV infusion'],e:['No antibiotic needed'],ec:'None of these features'},
  {c:'Suspected fracture',go:['face-fracture']},
 ]
});

/* ============ HEAD TRAUMA ============ */
const SZ_PROPH=['Amp **Phenytoin 1 g in 250 mL N/S** over 1 h infusion, **or** Amp **Levetiracetam (Keppra) 500 mg** IV infusion. **ECG first** for grade 2 or 3 blocks before phenytoin.'];
const SZ_PROPH_IND='Antiseizure drug indications: history of seizure; seizure after head trauma; depressed skull fracture; GCS ≤ 8; trauma patients who are intubated; any contusion / SDH / EDH / ICH / SAH; space-occupying brain lesion such as a tumor.';
V({id:'head-minor-ct',topic:'head',n:'Minor (GCS 14–15), CT indicated',src:'B',lv:'II',
 meta:'Imp: Minor head trauma · C: II · NPO · CBR · supine, head elevated 30°',
 sc:'A 70-year-old man **fell and struck his head**. GCS 15, but he **vomited twice**, cannot remember the fall, has a **scalp hematoma**, and takes **warfarin**.',
 o:[
  'CVS / NPO / CBR; head elevation 30°',
  'Labs: CBC/diff, BUN/Cr, PT, INR, PTT',
  ...TRAUMA_MON,
  '**Brain CT**',
  'IV line; Serum N/S 1 L IV infusion',
  'Amp **Diazepam** stand-by, if needed',
  ...TET,
  'Amp **Cefazolin 1 g** IV infusion (laceration)',
  'Transfer to the emergency OR for wound wash and repair, if needed',
 ],
 br:[
  {c:'**Brain CT indications in minor head trauma**: suspected depressed fracture; signs of skull-base fracture (rhinorrhea, otorrhea, Battle\'s sign); vomiting ≥ 2 times; age ≥ 65 or ≤ 2 years; amnesia; LOC; diffuse headache; concurrent alcohol intoxication; seizure; scalp hematoma; focal neurological deficit; coagulopathy; abnormal behavior',d:['Brain CT']},
  {c:'Antiseizure indications (see list below)',d:SZ_PROPH.concat([SZ_PROPH_IND])},
  {c:'Penetrating skull wound with skull fracture',go:['head-penetrating']},
  {c:'**Scalp laceration**: routine antibiotics are NOT given',d:['Give antibiotics only for: very crushed, contaminated, fecally contaminated wounds, or wounds that irrigation cannot clean']},
 ],
 fa:['اندیکاسیون‌های Brain CT در تروماى مینور سر: مشکوک به شکستگی Depress باشد، علائم Skull base fx داشته باشد (رینوره، اتوره، Battle sign)، استفراغ بیشتر و مساوی دو نوبت، سن ≥ ۶۵ سال یا ≤ ۲ سال، فراموشی، بیهوشی، سردرد منتشر، مسمومیت همزمان با الکل، تشنج، هماتوم اسکالپ، FND، کوآگولوپاتی، رفتار غیرنرمال.']
});
V({id:'head-minor-low',topic:'head',n:'Minor, no CT indication',src:'B',lv:'III',
 meta:'Imp: Minor head trauma, low risk',
 sc:'A 22-year-old with a **minor bump to the head** playing football, **GCS 15**, no LOC, no amnesia, no vomiting, no headache, normal exam, not on anticoagulants, sober.',
 o:[
  'CVS; observation',
  'Wound care and tetanus if there is a wound',
  ...TET,
  '@R **No Brain CT**: none of the CT indications is present. Observe, then discharge with head-injury advice.',
 ],
 br:[{c:'Any CT indication appears',go:['head-minor-ct']}],
 ref:['Canadian CT Head Rule (Stiell IG et al., Lancet 2001;357:1391) and NICE head injury guideline NG232 (2023) for low-risk minor head injury.']
});
V({id:'head-modsevere',topic:'head',n:'Moderate / severe (GCS ≤ 13)',src:'B',lv:'I',
 meta:'Imp: Moderate to severe head trauma · Level I · NPO · CBR · supine, head elevated 30°',
 sc:'A 35-year-old after a **motorcycle crash**, GCS **8**, right pupil dilated, vomiting, not following commands. BP 150/90, HR 60 (watch for the Cushing response).',
 o:[
  'CVS / NPO / CBR; head elevated **30°**',
  'Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, BG/Rh',
  ...TRAUMA_MON,
  'CXR AP, **portable**',
  '**Brain CT**',
  'IV line ×2; Serum N/S 1 L IV stat infusion',
  'BS glucometry; ECG',
  '**Cervical collar** fix',
  '**OGT** fix; Foley catheter fix; control I/O',
  'Amp Ranitidine 50 mg IV stat',
  'Tetanus; Cefazolin 1 g IV infusion',
  'Antipyretic (IV Apotel) if fever',
  'Reserve **4 U P.C** and **4 U FFP**, iso-group iso-Rh',
  'Check **GCS every 15 min**; vital signs **every 30 min**',
  '**Move the patient only with the resuscitation team**; protected bed + fixed relative',
  'Neurosurgery visit; surgery visit if indicated; check Hb/Hct every 6 h',
 ],
 br:[
  {c:'**Unstable**: BP ≤ 90, GCS ≤ 8, respiratory distress, penetrating scalp wound',d:['Move to the resuscitation room; ATLS; **intubate**; request surgery and neurosurgery']},
  {c:'Antiseizure drug indication (list below)',d:SZ_PROPH.concat([SZ_PROPH_IND])},
  {c:'Suspected brain herniation',go:['head-herniation']},
  {c:'Penetrating skull fracture',go:['head-penetrating']},
 ]
});
V({id:'head-herniation',topic:'head',n:'Herniation signs: hyperosmolar therapy',src:'B',lv:'I',
 meta:'Imp: Head trauma with signs of brain herniation · Level I',
 sc:'A 35-year-old with a **severe head injury** has **unequal pupils (anisocoria), hypertension with bradycardia** and posturing. Or any patient with a brain bleed and signs of impending herniation.',
 o:[
  'Move to the resuscitation room; intubation',
  'Head elevated 30°',
 ],
 br:[
  {c:'Suspected herniation: **anisocoria**, **hypertension with bradycardia**',d:[
   '**Hypertonic saline 5%, 100 mL** IV infusion',
   '**or** **Mannitol 0.5–1 g/kg** infusion, provided renal function is normal. Example: a 70 kg patient at 0.5 g/kg of **20% mannitol = 350 mL** over 30–60 min.',
  ]},
  {c:'Patient is intubated',d:['**Hyperventilation** at **16–24 breaths/min**, targeting **PCO2 < 32 mmHg**']},
 ]
});
V({id:'head-penetrating',topic:'head',n:'Penetrating skull wound: antibiotics',src:'B',lv:'II',
 meta:'Imp: Penetrating skull injury with fracture',
 sc:'A 40-year-old man with a **nail-gun injury to the skull with a depressed fracture** and a contaminated scalp wound. GCS 14.',
 o:[
  'Base orders of [[head-modsevere|moderate to severe]] or [[head-minor-ct|minor]] head trauma',
  '## Antibiotics (choose one regimen)',
  'Amp **Ceftazidime 2 g** IV infusion **+** Amp **Vancomycin 1 g in 250 mL N/S** over 1 h',
  '**or** Amp **Metronidazole 500 mg** IV infusion **+** Amp **Gentamicin 80 mg** IV **+** Amp **Vancomycin 1 g in 250 mL N/S** over 1 h',
 ]
});
V({id:'head-ich',topic:'head',n:'Traumatic ICH (Source A case)',src:'A',lv:'I',
 meta:'Source A case: ICH after head trauma',
 sc:'An **older man** with a **head injury** (a fall) now has an **intracerebral hemorrhage on CT**. This is the written ICH case from the Beesat sheet.',
 o:[
  '**Head elevation 30°**',
  'O2 by mask **10 L/min**; the aim is to lower the PCO2 to **32–34**',
  'Cardiac monitoring + pulse oximetry',
  'Foley catheter fix (urine drainage; the reason is not fully readable)',
  'Amp **Phenytoin 750 mg** IV, slow, stat',
  'Amp **Pantoprazole 40 mg** IV stat',
 ],
 br:[{c:'Herniation signs',go:['head-herniation']},{c:'Spontaneous (non-traumatic) hemorrhagic stroke',go:['stroke-hemorrhagic']}]
});

/* ============ MULTIPLE TRAUMA ============ */
const MT_BASE=[
  'CVS / NPO / CBR; supine',
  'Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, UA, BG/Rh',
  ...TRAUMA_MON,
  '**CXR in every MT patient**; neck AP / lateral (NEXUS); other films as needed',
  '**Brain CT** (per the indications on the head-trauma pages)',
  'IV line; Serum N/S 1 L IV stat',
  'Amp Ranitidine 50 mg IV stat; **eFAST**',
  'Amp **Morphine 3 mg** IV stat, slow over 2 min',
  ...TET,
  'Amp **Cefazolin 1 g** IV infusion',
  'Check Hb/Hct every 6 h; **mechanical collar** fix; protected bed + fixed relative',
];
V({id:'mt-stable',topic:'mt',n:'Stable multiple trauma',src:'B',lv:'II',
 meta:'Imp: MT · C: II · NPO · CBR · supine',
 sc:'A 40-year-old **restrained driver** after a moderate-speed crash: chest wall pain, mild abdominal tenderness, neck tenderness. BP 125/80, HR 88, GCS 15.',
 o:MT_BASE,
 br:[
  {c:'**Woman of childbearing age**',d:['βHCG']},
  {c:'**Neck X-ray** (AP + lateral) if any NEXUS criterion: distracting injury, LOC, intoxication, FND, midline neck tenderness',d:['Neck AP and lateral']},
  {c:'**Pelvic X-ray is NOT indicated** when: he has walked, no LOC, no pelvic-belt tenderness, fully alert, stable pelvic exam, no penetrating trauma',d:['Skip the pelvic film']},
  {c:'**Laceration**',d:['Decide on tetanus: see the [[tetanus-table|table]]']},
  {c:'Patient becomes unstable',go:['mt-unstable']},
 ]
});
V({id:'mt-unstable',topic:'mt',n:'Unstable → Level I',src:'B',lv:'I',
 meta:'Imp: MT, unstable · Level I',
 sc:'A 28-year-old after a **fall from height**: BP **78/40**, HR 130, GCS 9, distended abdomen, **unstable pelvis**, obvious thigh deformity.',
 o:MT_BASE.concat([
  '## Added when the patient is unstable',
  'IV line ×2 **large**; portable CXR',
  'Resuscitation + intubation equipment at the bedside',
  '**Move only with the resuscitation team**',
  'NGT fix; Foley catheter fix; control I/O; BS glucometry; ECG; **ECG every 15 min**; vital signs every hour',
  'Reserve **4 U P.C** and **4 U FFP**, iso-group',
  'If intubated: Amp **Phenytoin 1 g in 250 mL N/S** over 1 h',
  'Surgery consult',
 ]),
 br:[
  {c:'**Level I** if: SBP ≤ 90; GCS ≤ 8; penetrating wound to neck, chest, abdomen or proximal limbs; respiratory distress needing intubation',d:['Immediately admitted at Level I; resuscitation + intubation; **ATLS**; request surgery']},
  {c:'Shock',d:['**Lactate** and VBG']},
  {c:'FAST positive, or pelvic fracture with unstable hemodynamics',go:['mt-pelvic']},
 ]
});
V({id:'mt-pelvic',topic:'mt',n:'FAST positive / unstable pelvis: tranexamic acid',src:'B',lv:'I',
 meta:'Imp: MT with hemorrhage',
 sc:'A trauma patient with a **positive FAST** (free fluid in the abdomen) or a **pelvic fracture with unstable hemodynamics**.',
 o:[
  'All the orders of the [[mt-unstable|unstable MT page]]',
  'Amp **Tranexamic acid 1 g** IV over 15 min, then **1 g** IV over 15 min **every 8 h**, as written by source B',
 ],
 diff:['@R Standard CRASH-2 / ATLS dosing is **1 g over 10 min, then 1 g over 8 h** as an infusion; source B writes 1 g over 15 min every 8 h. Use whichever your protocol specifies.'],
 ref:['CRASH-2 trial (Lancet 2010;376:23): TXA 1 g over 10 min then 1 g over 8 h within 3 h of injury.']
});

/* ============ NECK TRAUMA ============ */
const NECK_BASE=[
  'CVS / NPO / CBR; supine, Trendelenburg',
  'Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR',
  ...TRAUMA_MON,
  'IV line; Serum N/S 1 L IV stat',
  ...TET,
  'Amp **Cefazolin 1 g** IV infusion',
  'Amp **Ketorolac 30 mg** IV stat',
  'Protected bed + fixed relative',
];
V({id:'neck-hard',topic:'neck',n:'Hard signs → Level I',src:'B',lv:'I',
 meta:'Imp: Neck trauma · C: II → Level I',
 sc:'A 26-year-old man **stabbed in the left neck (zone II)**: **expanding hematoma**, active bleeding, absent radial pulse, voice hoarse, **stridor**, SpO2 90%.',
 o:NECK_BASE.concat([
  '**Move to the resuscitation room**; ATLS; airway control and intubation',
  'Resuscitation + intubation equipment at the bedside',
  'Emergency surgery visit; add from the [[mt-unstable|unstable MT orders]] (item 18 onward)',
 ]),
 br:[{c:'**Hard signs**: expanding hematoma; active severe bleeding; thrill over the artery; absent or decreased radial pulse; signs of cerebral ischemia; airway obstruction; stridor; hoarseness. Also SBP ≤ 90, GCS ≤ 8, or respiratory distress needing intubation.',d:['Level I, resuscitation, ATLS, emergency surgery']}]
});
V({id:'neck-soft',topic:'neck',n:'Soft signs → monitoring + CTA',src:'B',lv:'II',
 meta:'Imp: Neck trauma, soft signs · C: II',
 sc:'A 32-year-old with a **penetrating neck injury, non-expanding hematoma and mild hemoptysis**, stable airway, normal pulses, subcutaneous emphysema.',
 o:NECK_BASE.concat([
  'Neck X-ray AP, lateral and odontoid view, after the patient is stable',
  'Neck CT, once stable',
  '**Neck CT angiography** if vascular injury is suspected',
 ]),
 br:[
  {c:'**Soft signs**: hemoptysis; non-massive hematemesis; blood in the mouth or pharynx; dyspnea; non-expanding hematoma; dysphonia; dysphagia; subcutaneous air; focal neurological finding; persistent air leak from a chest tube',d:['**Close monitoring** and further diagnostic tests']},
  {c:'**Zones**',d:['**Zone I and III** stable injuries: CT angiography can be done','**Zone II**: surgical exploration is more common, since the neck structures are accessible']},
  {c:'↓LOC, carotid / brain ischemia, hemoptysis with LOC',d:['**Brain CT** too']},
 ]
});
V({id:'neck-blunt',topic:'neck',n:'Blunt neck trauma / NEXUS-positive',src:'B',lv:'II',
 meta:'Imp: Neck trauma, blunt · C: II',
 sc:'A 45-year-old **thrown from a motorbike**, with **midline neck tenderness and a broken femur**, awake, no deficit. A cervical spine injury must be excluded.',
 o:NECK_BASE.concat([
  '**Neck X-ray AP, Lat and odontoid** view, after the patient is stable',
  '**Hard cervical collar** fix',
  'Neck CT after the films, if pain / tenderness persists',
 ]),
 br:[
  {c:'**NEXUS** (any one positive): distracting injury (e.g. long-bone fracture); LOC; intoxication; focal neurological deficit; midline neck tenderness',d:['**Collar + AP/Lat neck film + analgesia**. If pain, tenderness or symptoms persist: **neck CT**. (Other references advise CT from the start.)']},
  {c:'The cervical collar is used **only** in blunt neck injury or when there is a focal deficit',d:['No collar in isolated penetrating injury']},
  {c:'Suspected vascular injury, ↓LOC, or to define the level of injury',d:['**CT angiography** of the neck']},
  {c:'Severe neck pain',d:['Amp **Morphine 3 mg** IV, slowly over 2 min']},
 ]
});
V({id:'neck-esoph',topic:'neck',n:'Suspected esophageal injury',src:'B',lv:'I',
 meta:'Imp: Neck trauma, suspected esophageal tear',
 sc:'A patient with a **penetrating neck wound, painful swallowing, subcutaneous air and blood in the saliva**: suspect a **tear of the esophagus**.',
 o:NECK_BASE.concat([
  'Start **broad-spectrum antibiotics**: Amp **Piperacillin–tazobactam (Tazocin)**. @R Usual dose 4.5 g IV every 6 h.',
  'Surgery consult',
 ]),
 ref:['Dose: product information for piperacillin–tazobactam; source B names the antibiotic but gives no dose here.']
});
