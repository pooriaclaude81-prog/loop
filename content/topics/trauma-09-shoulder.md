@topic shoulder
cluster: trauma
name: Shoulder dislocation
name_fa: دررفتگی شانه
source: B
keywords: reduction sedation nerve block
refs: acep-psa-2014

@guide
# ایده کلی
شانه شایع‌ترین مفصل دررفته است. قبل از جااندازی گرافی (AP و Y) و معاینه عصب آگزیلاری و نبض لازم است؛ بعد از جااندازی دوباره [^acep-psa-2014].
# جااندازی
با آرام‌بخشی (PSA) یا بلوک عصبی. فردی ماهر در راه هوایی بالای سر بیمار و فردی دیگر برای پروسیجر؛ مانیتور و تجهیزات احیا آماده. داروها بدون رزیدنت ارشد تزریق نمی‌شوند.
# بعد
گرافی کنترل، آرم‌اسلینگ و دستورات ترخیص (تا ۱۲ ساعت رانندگی نکند و تصمیم مهم نگیرد).
# چه موقع ارتوپدی؟
شکستگی همراه یا درگیری نورووسکولار.

@variant shoulder-uncomp
name: Uncomplicated: reduction
level: III
source: B
meta: Imp: Shoulder dislocation · C: III · NPO · CBR · sitting
refs: acep-psa-2014

@scenario
بازیکن راگبی ۲۵ ساله روی بازوی دورشده افتاده است. شانه صاف و دردناک، دست در کمی آبداکشن، حس و نبض نرمال.

@why
دررفتگی بدون عارضه است؛ گرافی، جااندازی و آرم‌اسلینگ.

@orders
- CVS / NPO / CBR; sitting
- HM, PO; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%
- Bed-side guard + fixed relative
- **AP shoulder X-ray and Y-view** (all traumatic and first-time dislocations need an X-ray **before** reduction)
- IV line; Serum N/S 250 mL IV infusion
- Neurovascular exam **before and after** reduction
- **Control X-ray after reduction**
- For **sedation or nerve block**, transfer to the **emergency OR** for reduction
- **Arm sling and swathe** after reduction
- Discharge orders (below)

@branch
if: **Sedation drugs on stand-by** at the bedside, and **never injected without the senior emergency-medicine resident**
- Amp **Fentanyl 100 µg** ready
- Amp **Thiopental 300 mg** ready

@branch
if: **Nerve block** (after a secure IV line)
- **Supraclavicular or interscalene** block: **15–20 mL lidocaine 1%**; lidocaine cream; **LP needle #21 (green)** and an extension tube ready
- Done with **two emergency-medicine assistants** present

@branch
if: **Procedural sedation (PSA)** requirements
- A person skilled in airway management at the head; another person does the reduction
- Overall assessment: airway, cardiac, respiratory, GI, hepatic, renal; PO and HM; capnography if available; ECG; resuscitation and intubation equipment; vital signs; O2 at the bedside

@branch
if: **Discharge after sedation**
- For **12 h**: no driving, no important decisions, no dangerous sports (cycling, gymnastics), no bath, no cooking, no electrical equipment; no food for 2 h; return for breathing difficulty, nausea or vomiting
- Children must be able to sit alone
- After a **nerve block**, heaviness and numbness of the limb for several hours is normal

@branch
if: Neurological or vascular deficit
go: shoulder-nv

@branch
if: Dislocation with a fracture
go: shoulder-fx

@variant shoulder-nv
name: Neurovascular deficit
level: I
source: B
meta: Imp: Shoulder dislocation with neurovascular deficit · Level I–II
refs: acep-psa-2014

@scenario
مردی ۶۰ ساله با دررفتگی شانه، بی‌حسی روی دلتوئید (عصب آگزیلاری)، نبض رادیال ضعیف و دست سرد و رنگ‌پریده.

@why
درگیری نورووسکولار است؛ اورژانس نجات عضو و ارتوپدی.

@orders
- CVS / NPO / CBR; sitting
- HM, PO; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%
- Bed-side guard + fixed relative
- **AP shoulder X-ray and Y-view** (all traumatic and first-time dislocations need an X-ray **before** reduction)
- IV line; Serum N/S 250 mL IV infusion
- Neurovascular exam **before and after** reduction
- **Control X-ray after reduction**
- **Emergency limb-saving measures**
- Orthopedics visit

@branch
if: Neurological signs (numbness, **axillary-nerve** motor loss), sensory / motor disorder, **vascular disorder** (pulse loss or asymmetry), limb ischemia, cyanosis
- **Level I or II**, emergency limb-saving measures

@notes
- در موارد وجود علائم نورولوژیک مانند بی‌حسی، اختلال در حرکات مربوط به عصب آگزیلاری، اختلال حسی و حرکتی و همچنین اختلال عروقی مانند اختلال در نبض‌ها و غیرقرینگی نبض‌ها، ایسکمی اندام‌ها، سیانوز اندام‌ها، در سطح یک یا دو قرار می‌گیرد و نیاز به اقدامات اورژانسی جهت نجات اندام دارد.

@variant shoulder-fx
name: Dislocation with a fracture
level: II
source: B
meta: Imp: Shoulder fracture-dislocation
refs: acep-psa-2014

@scenario
مردی ۵۵ ساله با دررفتگی شانه که در گرافی شکستگی توبروزیته بزرگ هم دارد.

@why
دررفتگی همراه شکستگی است؛ ارتوپدی باید ببیند.

@orders
- CVS / NPO / CBR; sitting
- HM, PO; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%
- Bed-side guard + fixed relative
- **AP shoulder X-ray and Y-view** (all traumatic and first-time dislocations need an X-ray **before** reduction)
- IV line; Serum N/S 250 mL IV infusion
- Neurovascular exam **before and after** reduction
- **Control X-ray after reduction**
- **Orthopedics visit** (a dislocation with a fracture, or neurovascular involvement)
