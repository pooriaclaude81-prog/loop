@topic opioid
cluster: tox
name: Opioid toxicity
name_fa: مسمومیت اوپیوئیدی
source: B
keywords: naloxone overdose methadone charcoal
refs: rcem-opioid-2024

@guide
# ایده کلی
اوپیوئیدها تنفس را مهار می‌کنند: سه‌گانه کلاسیک مردمک سوزنی، کاهش هوشیاری و تنفس کند. مرگ از ایست تنفسی است [^rcem-opioid-2024].
# نالوکسان
- در **آپنه یا ایست:** CPR و نالوکسان با دوز بالا.
- در **افسردگی تنفسی:** تیتراسیون با دوز کم تا تنفس برگردد. در فرد معتاد، دوز شروع کمتر تا علائم ترک ناگهانی ایجاد نشود.
- نالوکسان کوتاه‌اثر است و اثر مخدر ممکن است بیشتر بماند؛ لذا اگر لازم شد انفوزیون می‌گذاریم.
# در مصرف خوراکی
شستشوی معده فقط در یک ساعت اول و زغال فعال فقط با راه هوایی ایمن.
# متادون
اثر طولانی، خطر QT طولانی و اختلال الکترولیت؛ مدت مشاهده بیشتر لازم است.

@variant opioid-arrest
name: Apnea or arrest
level: I
source: B
meta: Imp: Opioid toxicity · Level I
refs: rcem-opioid-2024

@scenario
مردی ۲۹ ساله کنار سرنگ بی‌هوش پیدا شده است. مردمک‌هایش سوزنی و تنفس ندارد (یا فقط نفس‌های گاسپ دارد) و سیانوزه است.

@why
آپنه یا ایست است؛ ابتدا ونتیلاسیون و CPR، همراه با دوز بالای نالوکسان.

@orders
- Move to the resuscitation room, bag-mask ventilation, **intubation considered**
- If unconscious, not breathing, or only gasping: **start CPR immediately**
- Naloxone **2 mg** IV (5 ampoules at once) for apnea, cyanosis or RR < 12
- Continue as on the [[opioid-resp|titration page]] once breathing returns

@notes
- در صورت وجود سیانوز، آپنه و RR < ۱۰ بیمار بلافاصله به اتاق احیا منتقل می‌شود، آمبوبگ ونتیلاسیون انجام شده، ۲mg نالوکسان تزریق می‌گردد و اینتوباسیون مدنظر باشد.

@variant opioid-resp
name: Depressed respiration: titrate naloxone
level: II
source: B
meta: Imp: Opioid toxicity · C: I or II
refs: rcem-opioid-2024

@scenario
مردی ۳۵ ساله خواب‌آلود است، مردمک سوزنی، تنفس 10 و SpO2 برابر 91٪ دارد؛ با صدا بیدار می‌شود. معتاد به اوپیوئید است. یا خانمی مسن که قرص‌های زیادی خورده و تا به حال معتاد نبوده.

@why
افسردگی تنفسی است؛ نالوکسان را کم‌کم تیتره می‌کنیم تا تنفس برگردد بدون اینکه ترک حاد ایجاد شود.

@orders
- CVS / NPO / CBR; semi-sitting
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, BS, VBG, toxin level
- PO & HM
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- ECG
- BS glucometry
- IV line fix; N/S 1 L IV stat
- Amp **Naloxone** on standby
- Bed-side guard + fixed relative
- Brain CT is **not needed** if the patient wakes with naloxone

@branch
if: **Opioid addict** (dependent): give **0.1 mg** (¼ ampoule), repeat **every 3 min** until the patient wakes, **up to 10 mg total**
- Avoid precipitating withdrawal: start small

@branch
if: **Naive patient**: give **0.4 mg (1 ampoule)**, repeat **every 3 min** until the patient wakes, up to 10 mg total
- Titrate to respiratory effort

@branch
if: Naloxone must be repeated several times (the drug wears off)
- **Naloxone infusion**: take **⅔ of the total naloxone dose that woke the patient, per hour, for 6 h**
- Example: awake after 3 ampoules = 1.2 mg → ⅔ × 1.2 = 0.8 mg/h × 6 h = **4.8 mg = 12 ampoules in D5W, over 6 h**

@branch
if: Oral ingestion
go: opioid-ingestion

@branch
if: Methadone
go: opioid-methadone

@notes
- اگر فرد آپنه، سیانوز یا RR < ۱۲ دارد: ۲mg نالوکسان (۵ آمپول) یک‌جا تزریق می‌شود. اگر فرد شرایط بالا را ندارد: در افراد معتاد ۰/۱ آمپول و در افراد معمولی ۱ آمپول (۰/۴mg) را تزریق می‌کنیم و هر سه دقیقه تکرار تا هوشیاری یا تا زمان رسیدن به دوز توتال ۱۰ میلی‌گرم.
- دو سوم کل مقدار دوز نالوکسانی که باعث افزایش سطح هوشیاری و بهبود وضعیت تنفس بیمار گردید را در ساعت دریپ می‌گذاریم، مثلاً برای ۶ ساعت.
- در صورتی که بیمار با نالوکسان هوشیار شود نیازی به انجام Br CT نیست.

@variant opioid-ingestion
name: Oral ingestion: lavage / charcoal
level: II
source: B
meta: Imp: Opioid toxicity, oral ingestion
refs: rcem-opioid-2024

@scenario
جوانی ۲۴ ساله ۴۰ دقیقه پیش مشت‌مشت قرص مخدر خورده است. هوشیار ولی خواب‌آلود است و راه هوایی‌اش حفظ شده. پاکسازی گوارش فقط اگر زود انجام شود فایده دارد.

@why
مسمومیت خوراکی است؛ شستشو و زغال فعال فقط در ساعت اول و با راه هوایی ایمن.

@orders
- CVS / NPO / CBR; semi-sitting
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, BS, VBG, toxin level
- PO & HM
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- ECG
- BS glucometry
- IV line fix; N/S 1 L IV stat
- Amp **Naloxone** on standby
- Bed-side guard + fixed relative
- NG tube fix, **lavage until the returns are clear**
- **Lavage technique** (fully awake patient, after confirming NG position): left lateral position, head slightly below the trunk, legs drawn to the abdomen; instill **300 mL**, let it drain back by gravity. **Not useful and not recommended if more than 1 h has passed since ingestion.**
- **Activated charcoal 50 g** PO / by gavage (if < 1 h since ingestion, or if the drug slows gut motility, it may be given after 1 h)

@branch
if: ↓LOC and no gag reflex, or any aspiration risk
- **Intubate BEFORE giving charcoal**. Give charcoal only when the airway is secure.

@variant opioid-methadone
name: Methadone toxicity
level: II
source: B
meta: Imp: Opioid toxicity, methadone
refs: rcem-opioid-2024

@scenario
جوانی ۳۱ ساله که در برنامه نگهدارنده متادون است چند دوز اضافه خورده است. آرام‌بخشی دارد و تنفسش کند یا نرمال است. QTc برابر 520 میلی‌ثانیه است.

@why
متادون طول اثر زیاد و خطر QT طولانی دارد؛ مدت مشاهده بیشتر و کنترل الکترولیت لازم است.

@orders
- CVS / NPO / CBR; semi-sitting
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, BS, VBG, toxin level
- PO & HM
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- ECG
- BS glucometry
- IV line fix; N/S 1 L IV stat
- Amp **Naloxone** on standby
- Bed-side guard + fixed relative
- Watch for **electrolyte disturbances**: K, Mg, Ca
- Watch for a **prolonged QT** on serial ECG
- Methadone is long-acting: use the naloxone infusion approach on the [[opioid-resp|titration page]] and observe for a prolonged period [^rcem-opioid-2024]

@notes
- در افراد متادون توکسیستی مراقب اختلالات الکترولیتی و QT طولانی باشیم.
