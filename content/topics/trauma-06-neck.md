@topic neck
cluster: trauma
name: Neck trauma
name_fa: ترومای گردن
source: B
keywords: hard signs soft signs nexus collar cta
refs: atls-11, east-pen-neck

@guide
# ایده کلی
گردن در فضای کم، راه هوایی، رگ‌های بزرگ، مری و نخاع دارد؛ هر آسیب ممکن است حیاتی باشد [^east-pen-neck].
# علائم
- **Hard sign** (هماتوم در حال بزرگ‌شدن، خونریزی شدید، فقدان نبض، ایسکمی مغز، استریدور): سطح ۱ و جراحی.
- **Soft sign** (هموپتزی، دیسفاژی، هوای زیرپوستی ...): مانیتور دقیق و CTA گردن.
# بلانت
معیارهای NEXUS (آسیب حواس‌پرت‌کن، کاهش هوشیاری، مسمومیت، علامت نورولوژیک، تندرنس خط وسط): کلار و گرافی یا CT. کلار فقط در بلانت یا علامت عصبی.
# شک به پارگی مری
آنتی‌بیوتیک وسیع‌الطیف و جراحی.

@variant neck-hard
name: Hard signs → Level I
level: I
source: B
meta: Imp: Neck trauma · C: II → Level I
refs: east-pen-neck

@scenario
جوانی ۲۶ ساله با چاقو به گردن چپ (زون II): هماتوم رو به رشد، خونریزی فعال، نبض رادیال لمس نمی‌شود، صدای خشن، استریدور و SpO2 برابر 90٪.

@why
Hard sign دارد؛ احیا، راه هوایی و جراحی اورژانس.

@orders
- CVS / NPO / CBR; supine, Trendelenburg
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR
- HM, PO (cardiac monitor, pulse oximetry)
- O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%
- IV line; Serum N/S 1 L IV stat
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- Amp **Cefazolin 1 g** IV infusion
- Amp **Ketorolac 30 mg** IV stat
- Protected bed + fixed relative
- **Move to the resuscitation room**; ATLS; airway control and intubation
- Resuscitation + intubation equipment at the bedside
- Emergency surgery visit; add from the [[mt-unstable|unstable MT orders]] (item 18 onward)

@branch
if: **Hard signs**: expanding hematoma; active severe bleeding; thrill over the artery; absent or decreased radial pulse; signs of cerebral ischemia; airway obstruction; stridor; hoarseness. Also SBP ≤ 90, GCS ≤ 8, or respiratory distress needing intubation.
- Level I, resuscitation, ATLS, emergency surgery

@variant neck-soft
name: Soft signs → monitoring + CTA
level: II
source: B
meta: Imp: Neck trauma, soft signs · C: II
refs: east-pen-neck

@scenario
مردی ۳۲ ساله با زخم نافذ گردن، هماتوم غیرپیشرونده و هموپتزی خفیف. راه هوایی پایدار، نبض‌ها نرمال و آمفیزم زیرجلدی دارد.

@why
Soft sign دارد؛ مانیتور دقیق و CTA گردن.

@orders
- CVS / NPO / CBR; supine, Trendelenburg
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR
- HM, PO (cardiac monitor, pulse oximetry)
- O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%
- IV line; Serum N/S 1 L IV stat
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- Amp **Cefazolin 1 g** IV infusion
- Amp **Ketorolac 30 mg** IV stat
- Protected bed + fixed relative
- Neck X-ray AP, lateral and odontoid view, after the patient is stable
- Neck CT, once stable
- **Neck CT angiography** if vascular injury is suspected

@branch
if: **Soft signs**: hemoptysis; non-massive hematemesis; blood in the mouth or pharynx; dyspnea; non-expanding hematoma; dysphonia; dysphagia; subcutaneous air; focal neurological finding; persistent air leak from a chest tube
- **Close monitoring** and further diagnostic tests

@branch
if: **Zones**
- **Zone I and III** stable injuries: CT angiography can be done
- **Zone II**: surgical exploration is more common, since the neck structures are accessible

@branch
if: ↓LOC, carotid / brain ischemia, hemoptysis with LOC
- **Brain CT** too

@variant neck-blunt
name: Blunt neck trauma / NEXUS-positive
level: II
source: B
meta: Imp: Neck trauma, blunt · C: II
refs: atls-11

@scenario
مردی ۴۵ ساله از روی موتور پرت شده، حساسیت خط وسط گردن و شکستگی فمور دارد. هوشیار و بدون کمبود عصبی است. باید آسیب مهره‌های گردن را رد کنیم.

@why
ضربه بلانت و NEXUS مثبت است؛ کلار و گرافی یا CT.

@orders
- CVS / NPO / CBR; supine, Trendelenburg
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR
- HM, PO (cardiac monitor, pulse oximetry)
- O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%
- IV line; Serum N/S 1 L IV stat
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- Amp **Cefazolin 1 g** IV infusion
- Amp **Ketorolac 30 mg** IV stat
- Protected bed + fixed relative
- **Neck X-ray AP, Lat and odontoid** view, after the patient is stable
- **Hard cervical collar** fix
- Neck CT after the films, if pain / tenderness persists

@branch
if: **NEXUS** (any one positive): distracting injury (e.g. long-bone fracture); LOC; intoxication; focal neurological deficit; midline neck tenderness
- **Collar + AP/Lat neck film + analgesia**. If pain, tenderness or symptoms persist: **neck CT**. (Other references advise CT from the start.)

@branch
if: The cervical collar is used **only** in blunt neck injury or when there is a focal deficit
- No collar in isolated penetrating injury

@branch
if: Suspected vascular injury, ↓LOC, or to define the level of injury
- **CT angiography** of the neck

@branch
if: Severe neck pain
- Amp **Morphine 3 mg** IV, slowly over 2 min

@variant neck-esoph
name: Suspected esophageal injury
level: I
source: B
meta: Imp: Neck trauma, suspected esophageal tear
refs: east-pen-neck

@scenario
بیمار با زخم نافذ گردن، درد بلع، هوای زیرپوستی و خون در بزاق. به آسیب مری شک داریم.

@why
مری ممکن است پاره شده باشد؛ آنتی‌بیوتیک وسیع‌الطیف و جراحی.

@orders
- CVS / NPO / CBR; supine, Trendelenburg
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR
- HM, PO (cardiac monitor, pulse oximetry)
- O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%
- IV line; Serum N/S 1 L IV stat
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- Amp **Cefazolin 1 g** IV infusion
- Amp **Ketorolac 30 mg** IV stat
- Protected bed + fixed relative
- Start **broad-spectrum antibiotics**: Amp **Piperacillin–tazobactam (Tazocin)**
- Surgery consult
