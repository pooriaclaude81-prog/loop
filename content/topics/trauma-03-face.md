@topic face
cluster: trauma
name: Facial trauma
name_fa: ترومای صورت
source: B
keywords: lefort nasal fracture mandible maxilla
refs: atls-11

@guide
# ایده کلی
در ترومای صورت اول راه هوایی را ببینید. خونریزی، تورم لب و زبان و شکستگی ناپایدار می‌تواند راه هوایی را ببندد [^atls-11].
# سه مسیر
- **تهدید راه هوایی:** سطح ۱ یا ۲، آماده‌باش اینتوباسیون، LMA و کریکوتیروتومی.
- **پایدار با شک شکستگی:** CT صورت (آگزیال و کرونال)؛ معیارها: اکلوژن غیرطبیعی، لوفور، عدم تقارن، تریسموس.
- **ساده:** شستشو و ترمیم؛ آنتی‌بیوتیک فقط با معیارهای خاص (آلودگی شدید، غضروف، خرد شدن، شکستگی باز).
# همیشه
معیارهای NEXUS گردن و در صورت وجود، کلار و گرافی گردن.

@variant face-airway
name: Airway-threatening → Level I/II
level: I
source: B
meta: Imp: Facial trauma · C: III → II or I
refs: atls-11

@scenario
مردی ۳۳ ساله بعد از تصادف با خودرو از دهان خونریزی شدید دارد، لب و زبانش ورم کرده، میان‌صورتش شکسته و متحرک است، صدایش خفه و SpO2 برابر 88٪ در حال افت.

@why
راه هوایی در خطر است؛ اولویت اول مدیریت راه هوایی، نه عکس و CT.

@orders
- CVS / NPO / CBR; supine
- HM, PO (cardiac monitor, pulse oximetry)
- O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%
- IV line; Serum N/S **1 L** IV stat
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- Amp **Cefazolin 1 g** IV infusion, **if indicated** (see the list on the simple-laceration page)
- Immediate **resuscitation measures** (Level I or II)
- Resuscitation, **intubation equipment**, **extraglottic devices (LMA)** and a **cricothyrotomy set** at the bedside
- If prophylactic intubation: labs PT, PTT, INR, VBG, Na, K, BUN/Cr, CBC/diff
- After the immediate measures: **emergency OR** for washing, dressing and wound repair

@branch
if: Severe facial bleeding, hypoxia, cyanosis, severe lip / face / tongue edema, severe bone fractures or crush, severe lip / tongue / jaw trauma, or hematomas of lips, tongue, neck threatening the airway
- **Level II, or even Level I**

@notes
- در صورت خونریزی شدید صورت، هیپوکسی، سیانوز، ادم شدید لب‌ها و صورت و زبان، شکستگی و خردشدگی‌های شدید استخوانی و یا تروماهای شدید لب و زبان و فک و یا هماتوم‌های شدید لب و زبان و گردن که احتمال به مخاطره انداختن راه هوایی را دارد در سطح II و یا حتی I قرار می‌گیرد و در این صورت اقدامات فوری احیای بیمار انجام شود. وسایل احیا و اینتوباسیون و وسایل اکسترا گلوتیک مانند LMA و ست کریکوتیروتومی بر بالین بیمار آماده باشد.

@variant face-fracture
name: Stable, fracture suspected
level: II
source: B
meta: Imp: Facial trauma, suspected fracture · C: II/III
refs: atls-11

@scenario
مردی ۲۷ ساله با مشت به صورتش خورده است. گونه متورم، لب بی‌حس، اکلوژن غیرطبیعی با محدودیت باز شدن دهان و عدم تقارن صورت دارد. راه هوایی پایدار و SpO2 برابر 98٪ است.

@why
شکستگی محتمل است؛ CT صورت و نمای مناسب لازم است.

@orders
- CVS / NPO / CBR; supine
- HM, PO (cardiac monitor, pulse oximetry)
- O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%
- IV line; Serum N/S **1 L** IV stat
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- Amp **Cefazolin 1 g** IV infusion, **if indicated** (see the list on the simple-laceration page)
- Labs only if indicated
- **Facial CT, axial and coronal**
- After the above: emergency OR for washing, dressing, wound repair

@branch
if: Request **facial CT (axial + coronal)** if any of: positive **bite (abnormal occlusion) test**; **Le Fort** fractures; facial asymmetry; trismus; any suspicion of a fracture
- CT

@branch
if: **Nasal X-ray** (bilateral) if any of: septal hematoma, uncontrolled epistaxis, cannot breathe through both nostrils, asymmetric nose shape
- Bilateral nasal X-ray

@branch
if: **NEXUS criteria** at the same time: distracting injury, LOC, intoxication, focal deficit, neck tenderness
- **Neck X-ray AP & lateral** and a **cervical collar**

@branch
if: Tetanus
- See the [[tetanus-table|tetanus table]]

@variant face-simple
name: Simple facial laceration / nasal injury
level: III
source: B
meta: Imp: Facial trauma, simple · C: III
refs: atls-11

@scenario
جوانی ۱۹ ساله بعد از افتادن بریدگی تمیز ۲ سانتی‌متری گونه دارد. هوشیار، بدون بدشکلی، مشکل راه هوایی نیست و اکلوژن و حرکات چشم نرمال است.

@why
ساده است؛ شستشو و ترمیم، و آنتی‌بیوتیک فقط با معیارهای خاص.

@orders
- CVS / NPO / CBR; supine
- HM, PO (cardiac monitor, pulse oximetry)
- O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%
- IV line; Serum N/S **1 L** IV stat
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- Amp **Cefazolin 1 g** IV infusion, **if indicated** (see the list on the simple-laceration page)
- Wound wash, dressing and repair in the emergency OR

@branch
if: **Antibiotics are indicated in facial wounds when:** (1) gross contamination; (2) involvement of **ear or nasal cartilage**; (3) **nasal tamponade**; (4) crush wound; (5) **open fracture**, or a fracture communicating with the sinuses; (6) **through-and-through** lacerations
- Cefazolin 1 g IV infusion
else: None of these features
- No antibiotic needed

@branch
if: Suspected fracture
go: face-fracture
