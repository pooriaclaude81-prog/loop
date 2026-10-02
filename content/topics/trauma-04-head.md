@topic head
cluster: trauma
name: Head trauma
name_fa: ترومای سر
source: AB
keywords: gcs brain ct herniation mannitol ich skull fracture
refs: btf-tbi-2016, acep-mtbi-2023, nice-head-2023

@guide
# ایده کلی
ترومای سر را با GCS تقسیم می‌کنیم. هدف: پیدا کردن خونریزی داخل جمجمه، جلوگیری از آسیب ثانویه (افت فشار، هیپوکسی) و تشخیص هرنی [^btf-tbi-2016].
# سه سطح
- **مینور (GCS 14–15):** CT اگر معیارها وجود دارد (استفراغ ≥۲ بار، فراموشی، سن ≥۶۵، ضدانعقاد، علائم شکستگی قاعده، تشنج ...) [^acep-mtbi-2023]. در کم‌خطر، مشاهده و ترخیص [^nice-head-2023].
- **متوسط و شدید:** سطح ۱، CT، راه هوایی ایمن، پایش GCS، نوروسرجری.
- **علائم هرنی** (آنیزوکوری، فشار بالا با نبض کم): درمان هیپراسمولار (مانیتول یا سالین هیپرتونیک) و هیپرونتیلاسیون کوتاه‌مدت.
# داروی ضدتشنج
در اندیکاسیون‌ها: GCS ≤ 8، شکستگی فرورفته، خونریزی داخل مغزی، تشنج بعد از ضربه و بیمار اینتوبه.
# آنتی‌بیوتیک
فقط در زخم نافذ با شکستگی جمجمه یا زخم بسیار آلوده.

@variant head-minor-ct
name: Minor (GCS 14–15), CT indicated
level: II
source: B
meta: Imp: Minor head trauma · C: II · NPO · CBR · supine, head elevated 30°
refs: acep-mtbi-2023

@scenario
مردی ۷۰ ساله افتاده و سرش خورده است. GCS برابر 15 است، ولی دو بار استفراغ کرده، حادثه را به یاد نمی‌آورد، هماتوم پوست سر دارد و وارفارین می‌خورد.

@why
مینور ولی با معیار CT است (سن، ضدانعقاد، استفراغ، فراموشی)؛ CT انجام می‌شود.

@orders
- CVS / NPO / CBR; head elevation 30°
- Labs: CBC/diff, BUN/Cr, PT, INR, PTT
- HM, PO (cardiac monitor, pulse oximetry)
- O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%
- **Brain CT**
- IV line; Serum N/S 1 L IV infusion
- Amp **Diazepam** stand-by, if needed
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- Amp **Cefazolin 1 g** IV infusion (laceration)
- Transfer to the emergency OR for wound wash and repair, if needed

@branch
if: **Brain CT indications in minor head trauma**: suspected depressed fracture; signs of skull-base fracture (rhinorrhea, otorrhea, Battle's sign); vomiting ≥ 2 times; age ≥ 65 or ≤ 2 years; amnesia; LOC; diffuse headache; concurrent alcohol intoxication; seizure; scalp hematoma; focal neurological deficit; coagulopathy; abnormal behavior
- Brain CT

@branch
if: Antiseizure indications (see list below)
- Amp **Phenytoin 1 g in 250 mL N/S** over 1 h infusion, **or** Amp **Levetiracetam (Keppra) 500 mg** IV infusion. **ECG first** for grade 2 or 3 blocks before phenytoin.
- Antiseizure drug indications: history of seizure; seizure after head trauma; depressed skull fracture; GCS ≤ 8; trauma patients who are intubated; any contusion / SDH / EDH / ICH / SAH; space-occupying brain lesion such as a tumor.

@branch
if: Penetrating skull wound with skull fracture
go: head-penetrating

@branch
if: **Scalp laceration**: routine antibiotics are NOT given
- Give antibiotics only for: very crushed, contaminated, fecally contaminated wounds, or wounds that irrigation cannot clean

@notes
- اندیکاسیون‌های Brain CT در تروماى مینور سر: مشکوک به شکستگی Depress باشد، علائم Skull base fx داشته باشد (رینوره، اتوره، Battle sign)، استفراغ بیشتر و مساوی دو نوبت، سن ≥ ۶۵ سال یا ≤ ۲ سال، فراموشی، بیهوشی، سردرد منتشر، مسمومیت همزمان با الکل، تشنج، هماتوم اسکالپ، FND، کوآگولوپاتی، رفتار غیرنرمال.

@variant head-minor-low
name: Minor, no CT indication
level: III
source: B
meta: Imp: Minor head trauma, low risk
refs: nice-head-2023

@scenario
جوانی ۲۲ ساله حین فوتبال ضربه جزئی به سر خورده است. GCS برابر 15، بدون بیهوشی، فراموشی، استفراغ یا سردرد؛ معاینه نرمال، ضدانعقاد نمی‌خورد و هوشیار و غیرمست است.

@why
هیچ معیار CT ندارد؛ مشاهده و ترخیص با توصیه‌ها.

@orders
- CVS; observation
- Wound care and tetanus if there is a wound
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- **No Brain CT**: none of the CT indications is present. Observe, then discharge with head-injury advice. [^nice-head-2023]

@branch
if: Any CT indication appears
go: head-minor-ct

@variant head-modsevere
name: Moderate / severe (GCS ≤ 13)
level: I
source: B
meta: Imp: Moderate to severe head trauma · Level I · NPO · CBR · supine, head elevated 30°
refs: btf-tbi-2016

@scenario
مردی ۳۵ ساله بعد از تصادف موتور GCS برابر 8، مردمک راست گشاد، استفراغ و عدم اطاعت از دستور. فشار 150/90 و نبض 60 (پاسخ کوشینگ).

@why
متوسط یا شدید است؛ سطح ۱، راه هوایی، CT و نوروسرجری.

@orders
- CVS / NPO / CBR; head elevated **30°**
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, BG/Rh
- HM, PO (cardiac monitor, pulse oximetry)
- O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%
- CXR AP, **portable**
- **Brain CT**
- IV line ×2; Serum N/S 1 L IV stat infusion
- BS glucometry; ECG
- **Cervical collar** fix
- **OGT** fix; Foley catheter fix; control I/O
- Amp Ranitidine 50 mg IV stat
- Tetanus; Cefazolin 1 g IV infusion
- Antipyretic (IV Apotel) if fever
- Reserve **4 U P.C** and **4 U FFP**, iso-group iso-Rh
- Check **GCS every 15 min**; vital signs **every 30 min**
- **Move the patient only with the resuscitation team**; protected bed + fixed relative
- Neurosurgery visit; surgery visit if indicated; check Hb/Hct every 6 h

@branch
if: **Unstable**: BP ≤ 90, GCS ≤ 8, respiratory distress, penetrating scalp wound
- Move to the resuscitation room; ATLS; **intubate**; request surgery and neurosurgery

@branch
if: Antiseizure drug indication (list below)
- Amp **Phenytoin 1 g in 250 mL N/S** over 1 h infusion, **or** Amp **Levetiracetam (Keppra) 500 mg** IV infusion. **ECG first** for grade 2 or 3 blocks before phenytoin.
- Antiseizure drug indications: history of seizure; seizure after head trauma; depressed skull fracture; GCS ≤ 8; trauma patients who are intubated; any contusion / SDH / EDH / ICH / SAH; space-occupying brain lesion such as a tumor.

@branch
if: Suspected brain herniation
go: head-herniation

@branch
if: Penetrating skull fracture
go: head-penetrating

@variant head-herniation
name: Herniation signs: hyperosmolar therapy
level: I
source: B
meta: Imp: Head trauma with signs of brain herniation · Level I
refs: btf-tbi-2016

@scenario
مردی ۳۵ ساله با ضربه شدید به سر، مردمک‌های نابرابر، فشار بالا با نبض کند و پوسچرینگ دارد. یا هر بیمار با خونریزی مغزی و علائم هرنی قریب‌الوقوع.

@why
هرنی در حال وقوع است؛ درمان هیپراسمولار و هیپرونتیلاسیون کوتاه‌مدت تا برسیم به جراحی.

@orders
- Move to the resuscitation room; intubation
- Head elevated 30°

@branch
if: Suspected herniation: **anisocoria**, **hypertension with bradycardia**
- **Hypertonic saline 5%, 100 mL** IV infusion
- **or** **Mannitol 0.5–1 g/kg** infusion, provided renal function is normal. Example: a 70 kg patient at 0.5 g/kg of **20% mannitol = 350 mL** over 30–60 min.

@branch
if: Patient is intubated
- **Hyperventilation** at **16–24 breaths/min**, targeting **PCO2 < 32 mmHg**

@variant head-penetrating
name: Penetrating skull wound: antibiotics
level: II
source: B
meta: Imp: Penetrating skull injury with fracture
refs: btf-tbi-2016

@scenario
مردی ۴۰ ساله با آسیب میخ‌کوب به جمجمه، شکستگی فرورفته و زخم آلوده پوست سر. GCS برابر 14.

@why
شکستگی نافذ جمجمه؛ آنتی‌بیوتیک وسیع‌الطیف لازم است.

@orders
- Base orders of [[head-modsevere|moderate to severe]] or [[head-minor-ct|minor]] head trauma
-- Antibiotics (choose one regimen)
- Amp **Ceftazidime 2 g** IV infusion **+** Amp **Vancomycin 1 g in 250 mL N/S** over 1 h
- **or** Amp **Metronidazole 500 mg** IV infusion **+** Amp **Gentamicin 80 mg** IV **+** Amp **Vancomycin 1 g in 250 mL N/S** over 1 h

@variant head-ich
name: Traumatic ICH (Source A case)
level: I
source: A
meta: Source A case: ICH after head trauma
refs: btf-tbi-2016

@scenario
مردی مسن بعد از ضربه به سر دچار خونریزی داخل مغزی در CT شده است. این همان نمونه ICH در برگه بعثت است.

@why
نمونه‌ای از برگه بعثت برای خونریزی داخل مغزی بعد از ضربه.

@orders
- **Head elevation 30°**
- O2 by mask **10 L/min**; the aim is to lower the PCO2 to **32–34**
- Cardiac monitoring + pulse oximetry
- Foley catheter fix (urine drainage; the reason is not fully readable)
- Amp **Phenytoin 750 mg** IV, slow, stat
- Amp **Pantoprazole 40 mg** IV stat

@branch
if: Herniation signs
go: head-herniation

@branch
if: Spontaneous (non-traumatic) hemorrhagic stroke
go: stroke-hemorrhagic
