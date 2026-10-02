/* ============ RENAL COLIC ============ */
const COLIC_BASE=[
  'CVS / NPO / RBR; supine',
  'Labs: CBC/diff, BUN/Cr, UA',
  'Serum **N/S 500 mL** IV stat infusion',
  '**Sonography of kidney, bladder and ureter**',
  'Amp **Morphine sulfate 3 mg** IV stat, slow, with RR control',
];
V({id:'colic-uncomp',topic:'colic',n:'Uncomplicated colic',src:'AB',lv:'II',
 meta:'Imp: Renal colic · C: II · NPO · RBR · supine',
 sc:'A 60-year-old woman has **sudden severe right flank pain radiating to the groin, with nausea and vomiting**, writhing, no fever. Past history of kidney stones and ESWL. BP 135/85, HR 96, afebrile.',
 o:COLIC_BASE.concat([
  '@B Amp **Ketorolac 30 mg** IV stat',
  '@A Amp **Ceftriaxone 2 g** IV stat',
  '@A Amp **Promethazine 25 mg** IM stat (for nausea)',
 ]),
 br:[
  {c:'Age > 50 with renal-colic-type pain',d:['Always consider an **abdominal aortic aneurysm**: examine, auscultate, and request aortic ultrasound if needed']},
  {c:'**BUN/Cr and UA** are not essential, but are **mandatory** in: single kidney, transplanted kidney, history of renal failure',d:['Check them']},
  {c:'**Imaging** is not routine',d:['Do ultrasound / imaging routinely only for transplant, single kidney, toxic appearance or severe obstruction']},
  {c:'Complicated picture',go:['colic-comp']},
 ],
 diff:['**Analgesia**: B gives ketorolac 30 mg plus morphine 3 mg; A gives only morphine 3 mg.','**Antibiotic**: A gives ceftriaxone 2 g stat. B gives none unless infected (see the complicated page).','**Antiemetic**: A adds promethazine 25 mg IM.','**Imaging**: both order a kidney / bladder / ureter ultrasound; B says routine imaging is not needed except in the special cases.'],
 fa:['چک BUN/Cr و UA ضروری نیست اما در بیمارانی که تک کلیه، کلیه پیوندی یا شرح حال نارسایی کلیه می‌دهند باید حتماً چک شود. WBC می‌تواند به علت درد زیاد افزایش پیدا کند.','در افراد بالای ۵۰ سال با رنال کولیک حتماً آنوریسم آئورت شکمی مدنظر باشد و معاینه و سمع و در صورت نیاز سونوگرافی آئورت درخواست شود.']
});
V({id:'colic-comp',topic:'colic',n:'Complicated: infected, single kidney, severe',src:'AB',lv:'II',
 meta:'Imp: Renal colic with complications',
 sc:'A 52-year-old with a **single kidney** has colic with **fever 38.9 °C, rigors, vomiting not controlled and rising creatinine**. Or: pain that needs repeated injectable analgesia, or a transplant kidney.',
 o:COLIC_BASE.concat([
  'Amp **Ceftriaxone 2 g** IV stat (infected obstructed stone)',
  'Ketorolac with caution in renal impairment @R (avoid NSAIDs in AKI / single kidney / transplant)',
  'Amp Ondansetron 4 mg or Promethazine 25 mg IM stat',
  '**Imaging is indicated**: ultrasound (or CT as needed)',
 ]),
 br:[
  {c:'**Absolute admission indications**: obstructing stone with UTI; uncontrolled nausea / vomiting; severe pain needing repeated injectable analgesics; urinary extravasation; hypercalcemic crisis',d:['Admit']},
  {c:'**Relative admission indications**: underlying disease that makes outpatient treatment difficult; very severe obstruction; leukocytosis; single kidney or renal disease; socio-economic factors',d:['Consider admission']},
 ],
 fa:['اندیکاسیون‌های مطلق بستری در سنگ کلیه: سنگی که انسداد داده است همراه با عفونت ادراری، تهوع و استفراغ غیرقابل کنترل، درد شدیدی که نیاز به تکرار متناوب مسکن تزریقی داشته باشد، اکستراوازیشن ادراری، کریز هیپرکلسمیک.','اندیکاسیون‌های نسبی بستری: بیماری زمینه‌ای واضح که درمان سرپایی را مشکل می‌کند، انسداد بسیار شدید، لکوسیتوز، تک کلیه و یا بیماری‌های کلیوی، فاکتورهای اقتصادی اجتماعی.'],
 ref:['AUA/Endourological Society Surgical Management of Stones guideline (Assimos D et al., J Urol 2016;196:1153) and EAU Urolithiasis guideline: avoid NSAIDs in renal impairment; obstructed infected system needs urgent decompression.']
});

/* ============ AKI ============ */
const AKI_BASE=[
  'CVS / NPO / RBR; supine',
  'Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, UA, **FeNa, urine Na**, HBsAg, HCV Ab, HIV Ab (viral markers in case dialysis is needed)',
  'PO & HM; O2 by nasal cannula if SpO2 ≤ 90%',
  'Bed-side guard + fixed relative; CXR; ECG',
  '**Kidney and urinary tract sonography**',
  '**Foley catheter** fix (relieves obstruction and measures output); **control I/O**',
];
V({id:'aki-prerenal',topic:'aki',n:'Pre-renal (dehydrated)',src:'B',lv:'II',
 meta:'Imp: AKI, pre-renal · C: II',
 sc:'A 66-year-old man with **3 days of vomiting and diarrhea**, dry mucous membranes, BP 98/60, HR 108, **creatinine 3.4 (baseline 1.0)**, low urine output.',
 o:AKI_BASE.concat([
  'Serum **N/S 1 L IV stat**, repeat as needed until out of dehydration',
 ]),
 br:[
  {c:'Pre-renal causes: diarrhea, vomiting, heart failure, burns, surgery, fever, trauma, GI bleeding',d:['Fluids as above, **rapid and adequate**']},
  {c:'Hyperkalemia or pulmonary edema first',d:['In any patient with AKI or CKD consider **hyperkalemia and pulmonary edema first**; treat urgently'],go:['hyperk-ecg','ape-perfused']},
  {c:'Still oliguric after volume correction',d:['Amp **Lasix** or **Mannitol**']},
 ]
});
V({id:'aki-postrenal',topic:'aki',n:'Post-renal (obstruction)',src:'B',lv:'II',
 meta:'Imp: AKI, post-renal',
 sc:'A 72-year-old man with **no urine for 12 hours**, a **palpable bladder**, suprapubic pain, BPH history. Creatinine 4.',
 o:AKI_BASE.concat([
  'The **Foley catheter** relieves the obstruction',
  'If he stays admitted and needs fluid: **maintenance 1/3–2/3, 1 L every 8 h**',
 ])
});
V({id:'aki-intrinsic',topic:'aki',n:'Intrinsic renal / normal hydration',src:'B',lv:'II',
 meta:'Imp: AKI, renal',
 sc:'A 54-year-old after a **contrast study and NSAID use**, euvolemic, BP 140/90, creatinine rising 2.1 → 3.6, granular casts in the urine.',
 o:AKI_BASE.concat([
  'Serum **N/S 250 mL + the urine output**, every 8 h',
  'If still oliguric once volume is corrected: Amp **Lasix** or **Mannitol**',
 ])
});
V({id:'aki-dialysis',topic:'aki',n:'Emergency dialysis indications',src:'B',lv:'I',
 meta:'Imp: AKI / CKD, urgent dialysis · Level I',
 sc:'A 60-year-old with **K 7.1, creatinine 9, BUN 120, confusion, and pulmonary edema** unresponsive to diuretics.',
 o:AKI_BASE.concat([
  'Send HBsAg, HCV Ab, HIV Ab if not already sent',
  'Treat hyperkalemia and pulmonary edema now (see [[hyperk-ecg|hyperkalemia]] and [[ape-perfused|pulmonary edema]])',
  'Nephrology consult for **emergency dialysis**',
 ]),
 br:[{c:'**Dialysis indications**: treatment-resistant hyperkalemia; refractory hypertension; uncontrollable pulmonary edema; encephalopathy; fluid overload; pericarditis; BUN > 100; refractory electrolyte disorders; dangerous poisonings (lithium, methanol, aspirin, ethylene glycol, theophylline)',d:['Emergency dialysis']}],
 fa:['اندیکاسیون‌های دیالیز اورژانس: هیپرکالمی مقاوم به درمان، HTN، ادم ریه غیرقابل کنترل، منجر به انسفالوپاتی، overload مایع، پریکاردیت، BUN > ۱۰۰، اختلالات الکترولیتی مقاوم به درمان، مسمومیت‌های خطرناک و کشنده ناشی از لیتیوم، متانول، آسپیرین، اتیلن گلیکول، تئوفیلین.']
});

/* ============ RHABDO ============ */
const RHABDO_BASE=[
  'Imp: rhabdomyolysis',
  'IV line fix',
  'Labs: CBC/diff, BUN, Cr, Na, K, Ca, Mg, P, **CPK**, LDH, UA, ABG, ALT, AST, ALP',
  'Cardiac monitoring + pulse oximetry',
  'ECG',
  'Foley catheter fix',
  'Chart I/O',
  'Serum **N/S 1 L** IV stat, free infusion ("free 96′" in source A, not readable; typically over 60 min), **until urine output reaches 3 mL/kg/h**',
  'Internist consult',
];
V({id:'rhabdo-std',topic:'rhabdo',n:'Standard fluid resuscitation',src:'A',lv:'II',
 meta:'Imp: Rhabdomyolysis',
 sc:'A 28-year-old man **after an intense CrossFit session** has severe muscle pain and **dark (cola-colored) urine**. CPK 38,000, creatinine 1.6, K 5.4. Normotensive.',
 o:RHABDO_BASE,
 br:[
  {c:'Metabolic acidosis',go:['rhabdo-acidosis']},
  {c:'Dialysis indications',go:['rhabdo-dialysis']},
 ],
 fa:['اگرچه وجود میوگلوبین پاتوگنومونیک برای رابدومیولیز است، ولی عدم وجود آن در سرم یا ادرار رابدومیولیز را رد نمی‌کند چون فقط در مراحل اولیه detect می‌شود.','مایع درمانی در بیماران رابدومیولیز تا زمانی ادامه می‌یابد که CPK به کمتر از ۱۰۰۰ برسد.','در ۲۴ ساعت اول ممکن است نیاز به ۱۰ تا ۲۰ لیتر مایع باشد تا برون‌ده ادراری به ۳ ml/kg/h برسد.','فورزماید (لوپ دیورتیک) هم ادرار را افزایش می‌دهد اما به عنوان پروفیلاکسی برای RF استفاده نمی‌شود. استازولامید به طور کلی به صورت روتین تجویز آن توصیه نمی‌شود.']
});
V({id:'rhabdo-acidosis',topic:'rhabdo',n:'With metabolic acidosis → bicarbonate',src:'A',lv:'II',
 meta:'Imp: Rhabdomyolysis with metabolic acidosis',
 sc:'A 35-year-old found down for 10 hours after a **drug overdose**, CPK 120,000, **pH 7.18, HCO3 12**, creatinine 3.',
 o:RHABDO_BASE.concat([
  '**2–3 vials (50 mL each) Sodium bicarbonate** IV infusion',
  'Keep **urine pH > 6.5** and **blood pH about 7.40–7.45**',
  '@D Stop bicarbonate if hypocalcemia develops. Source A\'s line reads "Ca < 9" (possibly "Ca < 2"), unclear. References: stop if symptomatic hypocalcemia, blood pH > 7.5 or serum bicarbonate > 30.',
 ]),
 fa:['در بیماران با اسیدوز متابولیک، تجویز نرمال سالین و بی‌کربنات سدیم توصیه می‌شود.'],
 ref:['Rhabdomyolysis review: Bosch X, Poch E, Grau JM. N Engl J Med 2009;361:62. Bicarbonate only with acidosis; stop with hypocalcemia or alkalemia.']
});
V({id:'rhabdo-dialysis',topic:'rhabdo',n:'Dialysis indications',src:'A',lv:'I',
 meta:'Imp: Rhabdomyolysis with failing kidneys',
 sc:'A 45-year-old with crush injury, **anuria, K 7.0, pH 7.05**, pulmonary congestion despite fluids.',
 o:RHABDO_BASE.concat(['**Dialysis if indicated** (list below)','Treat hyperkalemia at once, see [[hyperk-ecg|hyperkalemia]]']),
 br:[{c:'**Dialysis indications**: (1) uncorrectable metabolic acidosis; (2) life-threatening hyperkalemia or other electrolyte disorder resistant to treatment; (3) uremia and anuria; (4) volume overload',d:['Dialysis']}],
 fa:['اندیکاسیون‌های دیالیز: ① اسیدوز متابولیک غیرقابل اصلاح ② هایپرکالمی یا سایر اختلالات الکترولیتی تهدیدکننده حیات و مقاوم به درمان ③ اورمی و آنوری ④ اورلود مایع (volume overload).']
});

/* ============ HYPERKALEMIA ============ */
const HK_BASE=[
  'CVS / NPO / CBR; supine',
  'Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, VBG; HBsAg, HCV Ab, HIV Ab (in case dialysis is needed)',
  'PO & HM; O2 by nasal cannula if SpO2 ≤ 94%',
  '**ECG**; CXR (portable, or after he is stable)',
  'IV line fix; bed-side guard + fixed relative',
  'Dialysis access equipment at the bedside; **DC shock** ready',
];
V({id:'hyperk-ecg',topic:'hyperk',n:'With ECG changes (wide QRS) → Level I',src:'B',lv:'I',
 meta:'Imp: Hyperkalemia · C: II–I',
 sc:'A 58-year-old with **end-stage renal disease** who missed dialysis for 5 days has weakness and palpitations. **K 7.4**, ECG with **peaked T waves and a wide QRS**. Hyperkalemic patients can suddenly develop **cardiorespiratory arrest** or wide-QRS rhythms.',
 o:HK_BASE.concat([
  '## Emergency treatment (Level I, move to resuscitation)',
  'Amp **Calcium gluconate** at the bedside, **1 ampoule (10 mL)** over **3 min** IV, as long as the QRS is wide; may continue up to **30 mL**',
  'Amp **Insulin 10 units** + **dextrose 50% (100 mL as written)** IV. @R The usual regimen is 10 U regular insulin with 25 g dextrose (50 mL of D50); check the glucose hourly for hypoglycemia.',
  'Neb **Salbutamol 15 mg** stat, by mask',
 ]),
 diff:['The calcium gluconate and insulin lines in source B are partly garbled. Read as: calcium gluconate 1 ampoule (10 mL) over 3 min while the QRS is wide, repeat up to 30 mL; insulin 10 units with dextrose. @R Standard adult dosing is calcium gluconate 1–3 g (10–30 mL of 10%) and 10 U regular insulin with 25 g dextrose.'],
 br:[
  {c:'**Volume status**',go:['hyperk-volume']},
  {c:'**Severe acidosis**',go:['hyperk-acidosis']},
  {c:'Residual renal function',d:['Amp **Lasix 40 mg**']},
  {c:'Hyperkalemic arrest',go:['arrest-nonshockable']},
 ],
 fa:['بیماران هیپرکالمی می‌توانند ناگهان دچار ایست قلبی تنفسی و یا Wide QRS شوند که در این موارد درمان اورژانس هیپرکالمی باید آغاز شود و در این شرایط به سطح I و احیا منتقل شوند.','در صورتی که احتمال دیالیز بیمار وجود دارد مارکرهای ویروسی HBS Ag, HCV Ab, HIV Ab چک شوند.']
});
V({id:'hyperk-noecg',topic:'hyperk',n:'No ECG changes',src:'B',lv:'II',
 meta:'Imp: Hyperkalemia · C: II',
 sc:'A 64-year-old with CKD on an ACE inhibitor and a potassium supplement has **K 6.3** on routine labs. Asymptomatic, ECG unchanged, narrow QRS.',
 o:HK_BASE.concat([
  'Amp **Insulin 10 units** + **dextrose 50% 100 mL** IV (@R usual regimen: 25 g dextrose, check glucose hourly)',
  'Neb **Salbutamol 15 mg** stat, by mask',
  'Amp **Calcium gluconate stand-by** at the bedside, ready if the QRS widens',
  'Amp **Lasix 40 mg** if there is residual renal function',
 ]),
 br:[{c:'K > 6 on labs',d:['Start **emergency treatment of hyperkalemia**']},{c:'Wide QRS appears',go:['hyperk-ecg']}]
});
V({id:'hyperk-volume',topic:'hyperk',n:'Fluids: overloaded vs not',src:'B',lv:'II',
 meta:'Imp: Hyperkalemia, fluid management',
 sc:'Two patients with K 6.8. One is **dry from diarrhea with normal kidneys**. The other is a **dialysis patient with swollen legs and crackles**.',
 o:[
  '**Overloaded**: serum **N/S 250 mL + the previous 8 h urine output** every 8 h',
  '**Not overloaded and no kidney disorder**: serum **N/S 1 L every 8 h**',
  'Continue the treatment on the [[hyperk-ecg|emergency page]] or [[hyperk-noecg|non-ECG page]]',
 ]
});
V({id:'hyperk-acidosis',topic:'hyperk',n:'Severe acidosis → bicarbonate',src:'B',lv:'II',
 meta:'Imp: Hyperkalemia with severe acidosis',
 sc:'A 50-year-old with **K 7.2 and pH 6.95**, BUN 90, not volume overloaded. Or: organic acidemia.',
 o:[
  'Vial **Sodium bicarbonate up to 150 mEq**, as long as the patient is **not volume overloaded** and has severe acidosis (pH < 7). Useful in organic acidemias as well.',
  'Continue the [[hyperk-ecg|emergency treatment]]',
 ]
});

/* ============ PERMCATH ============ */
const PC_BASE=[
  'CVS / NPO / CBR; sitting or semi-sitting',
  'Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, VBG; **check K urgently**',
  'PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%',
  'ECG, then CXR after the ECG is seen',
  'Serum N/S 250 mL + the 6 h urine output, every 8 h',
  'Bed-side guard + fixed relative',
];
V({id:'permcath-mech',topic:'permcath',n:'Catheter malfunction, not urgent',src:'B',lv:'II',
 meta:'Imp: Permcath dysfunction · C: II',
 sc:'A 62-year-old on hemodialysis arrives because **the tunnelled catheter would not draw or flush at the end of the session**. Euvolemic, K 4.8, no emergency dialysis indication.',
 o:PC_BASE.concat([
  'Reteplase or alteplase vial **ready at the bedside**',
  '## Stepwise',
  'Causes: (1) improper position, (2) kinking, (3) intraluminal thrombus, (4) extraluminal thrombus, (5) fibrin sheath',
  '**First**: Valsalva maneuver, **Trendelenburg** position; gentle traction on the catheter, mild hydration, bring the arm above the clavicle',
  '**CXR** can show a break, pinch-off, or kink',
  '**Up-to-date step**: push **forceful saline flushes** with a **10 mL syringe full of N/S** at maximum pressure, repeated several times, before any lytic',
 ]),
 br:[
  {c:'Lumen still not open: suspect thrombus',d:[
   '**Alteplase** (1 mg/mL, diluted with sterile water) to the **volume of each lumen**, instilled in each lumen, **re-check after 2 h**. If it fails, repeat once.',
   '**or** **Reteplase** (one vial = 18 mg, diluted with 9 mL sterile water, so 1 mL = 2 mg) to the **lumen volume**, instilled, **re-check after 30 min**. If it fails, repeat once.',
  ]},
  {c:'K > 6',go:['hyperk-ecg']},
  {c:'Any emergency-dialysis indication',go:['permcath-dialysis']},
 ]
});
V({id:'permcath-dialysis',topic:'permcath',n:'Urgent dialysis criteria → Level I',src:'B',lv:'I',
 meta:'Imp: Permcath dysfunction with an emergency-dialysis indication · Level I',
 sc:'A 59-year-old with a **blocked catheter and K 6.9, pulmonary edema, drowsiness and a flap**, pericardial rub, BUN 130. He needs dialysis through another route.',
 o:PC_BASE.concat([
  '**Level I**, dialysis emergency: arrange emergency dialysis (new access) and treat the complications',
  'Vial reteplase or alteplase ready at the bedside',
 ]),
 br:[{c:'**Emergency dialysis criteria**: (1) severe fluid overload; (2) resistant HTN; (3) uncontrollable hyperkalemia; (4) intractable nausea / vomiting; (5) severe acidosis resistant to treatment; (6) drowsiness, coma, tremor, seizure, asterixis; (7) pericarditis with tamponade risk; (8) BUN > 70–100; (9) uremic encephalopathy',d:['Level I; emergency dialysis']},{c:'K > 6',go:['hyperk-ecg']}]
});

/* ============ PYELO ============ */
const PY_BASE=[
  'CVS / NPO / CBR; supine',
  'Labs: CBC/diff, BUN/Cr, UA, **urine culture**, **βHCG**',
  'PO & HM; O2 by nasal cannula if SpO2 ≤ 90%',
  'IV line fix; Serum N/S 1 L IV stat',
  'Amp **Apotel (acetaminophen) 1 g** IV if T ≥ 38 °C',
];
V({id:'pyelo-uncomp',topic:'pyelo',n:'Uncomplicated',src:'B',lv:'II',
 meta:'Imp: Pyelonephritis · C: II',
 sc:'A 30-year-old woman with **fever, right flank pain, dysuria and urinary frequency for 2 days**. T 38.6 °C, BP 118/72, CVA tenderness, pyuria. No pregnancy, no diabetes, tolerating oral fluids.',
 o:PY_BASE.concat([
  'Tab **Ciprofloxacin 500 mg** PO every 12 h **or** Tab **Levofloxacin 750 mg** PO daily',
 ]),
 br:[{c:'Complicated factors',go:['pyelo-comp']},{c:'Imaging criteria',go:['pyelo-imaging']}]
});
V({id:'pyelo-comp',topic:'pyelo',n:'Complicated (IV antibiotics)',src:'B',lv:'II',
 meta:'Imp: Pyelonephritis, complicated',
 sc:'A 68-year-old woman with **diabetes and CKD**, fever 39 °C, vomiting, flank pain, BP 105/65. Or: **pregnant**, immunodeficient, anatomical abnormality.',
 o:PY_BASE.concat([
  '## IV antibiotic (choose one)',
  'Amp **Cefepime 2 g** IV every 12 h',
  'Amp **Ceftriaxone 1 g** IV every 12 h',
  'Amp **Ciprofloxacin 400 mg** IV every 12 h',
  'Amp **Levofloxacin 500 mg** IV every 12 h',
  'Amp **Tazocin 3.375 g** every 6 h',
 ]),
 br:[{c:'Use the complicated regimen in: pregnancy, immunodeficiency, anatomical disorders, diabetes, CKD or ARF, other significant comorbidity',d:['IV regimen']}]
});
V({id:'pyelo-imaging',topic:'pyelo',n:'When to image',src:'B',lv:'II',
 meta:'Imp: Pyelonephritis, imaging indications',
 sc:'A patient on **day 3 of antibiotics who is still febrile**, or with a history of stones or a known anatomical abnormality.',
 o:[
  'Kidney and urinary-tract **ultrasound** if indicated',
  '**CT** of kidneys and urinary tract if indicated',
 ],
 br:[{c:'Imaging is done **only** if: underlying anatomical disorder; suspected abscess; suspected stone with pyelonephritis; fever persists beyond **72 h** of antibiotics',d:['Image']}]
});

/* ============ RETENTION ============ */
V({id:'retention-case',topic:'retention',n:'Case: BPH retention',src:'A',lv:'II',
 meta:'Source A case: acute urinary retention',
 sc:'A **70-year-old man** with **no urine since yesterday**, suprapubic fullness and discomfort. Probable **BPH**.',
 o:[
  'IV line fix',
  'Labs: CBC/diff, BUN, Cr, Na, K',
  '**Foley catheter** fix',
  'Amp **Ceftriaxone 2 g** IV stat, then **1 g IV every 12 h**',
  'Cap **Tamsulosin 0.4 mg** daily',
  'Tab **Finasteride 5 mg** daily',
 ]
});

/* ============ DIABETIC FOOT ============ */
const DF_BASE=[
  'CVS / NPO / CBR; supine',
  'IV line fix',
  'Labs: CBC/diff, BUN/Cr, Na, K, BS, ESR. @B Also Ca, Ph, Mg, Alb, PT, PTT, INR, UA, CRP, blood culture, VBG.',
  'ECG',
  '**X-ray of the foot, AP and oblique**',
  '@B Smear and **culture of the wound secretions**; wound irrigation and dressing',
  '@B PO & HM; O2 if SpO2 ≤ 90%; BS glucometry; bed-side guard + fixed relative',
  '@A Infectious-disease consult',
];
V({id:'dfoot-mild',topic:'dfoot',n:'Mild: no systemic signs',src:'B',lv:'III',
 meta:'Imp: Diabetic foot · C: III',
 sc:'A 58-year-old diabetic with a **small superficial ulcer under the great toe, 1 cm, mild redness**, no pus, no fever, no ischemic change.',
 o:DF_BASE.concat(['**Oral clindamycin** (if none of the risk features below)']),
 br:[{c:'Any of: ulcer > 2 cm, deep, foul purulent discharge, fever, ischemic changes, foot edema, sepsis or septic shock',d:['Use IV antibiotics (see next pages)'],go:['dfoot-stable','dfoot-septic']}]
});
V({id:'dfoot-stable',topic:'dfoot',n:'Moderate to severe, stable',src:'AB',lv:'II',
 meta:'Imp: Diabetic foot · C: II',
 sc:'An **80-year-old diabetic man** admitted with **gangrene of the toes of the left foot**. Foul purulent discharge, ulcer > 2 cm and deep, edema of the foot, low-grade fever, BP 130/80.',
 o:DF_BASE.concat([
  '@A Amp **Clindamycin 900 mg** IV stat **+** Amp **Ceftriaxone 2 g** IV stat',
  '@B Amp **Clindamycin 900 mg** IV every 6 h **+** Amp **Ciprofloxacin 400 mg** IV every 8 h',
 ]),
 diff:['**Second antibiotic**: A pairs clindamycin 900 mg with **ceftriaxone 2 g**; B pairs clindamycin 900 mg q6h with **ciprofloxacin 400 mg q8h**.','Infectious-disease consult is in A only.'],
 br:[{c:'Unstable vital signs or septic shock',go:['dfoot-septic']}]
});
V({id:'dfoot-septic',topic:'dfoot',n:'Septic shock / unstable',src:'B',lv:'I',
 meta:'Imp: Diabetic foot with sepsis · Level I',
 sc:'A 74-year-old diabetic with a **necrotic foot ulcer and spreading cellulitis**, fever 39.5 °C, **BP 80/48**, HR 124, confusion.',
 o:DF_BASE.concat([
  '**Level I**, resuscitation room; fluids and sepsis care',
  'Amp **Meropenem 1 g** IV every 8 h',
  '**+** Amp **Vancomycin 1 g** in 250 mL N/S over 1 h, every 12 h',
 ])
});
