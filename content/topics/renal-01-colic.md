@topic colic
cluster: renal
name: Renal colic
name_fa: کولیک کلیوی
source: AB
keywords: kidney stone ketorolac morphine flank pain
refs: eau-urolithiasis-2026

@guide
# ایده کلی
کولیک کلیوی درد شدید ناگهانی پهلو است که به کشاله ران می‌رود، با تهوع و بی‌قراری، معمولاً از سنگ حالب. درمان اصلی کنترل درد است و ارزیابی عوارض [^eau-urolithiasis-2026].
# منطق دستورها
- **مسکن:** NSAID (کتورولاک) اولین انتخاب؛ مورفین اگر کافی نبود. در نارسایی کلیه یا تک‌کلیه NSAID با احتیاط.
- **مایع** و **ضدتهوع**.
- **سونوگرافی** کلیه و مجاری ادراری؛ تصویربرداری روتین لازم نیست مگر پیوند، تک‌کلیه، سمی بودن بیمار یا انسداد شدید.
# هشدارها
- بالای ۵۰ سال، به آنوریسم آئورت شکمی هم فکر کنید.
- تب + انسداد = اورولوژی فوری و آنتی‌بیوتیک.
- اندیکاسیون‌های بستری: سنگ با عفونت، استفراغ کنترل‌نشده، درد شدید، اکستراوازاسیون ادرار.

@variant colic-uncomp
name: Uncomplicated colic
level: II
source: AB
meta: Imp: Renal colic · C: II · NPO · RBR · supine
refs: eau-urolithiasis-2026

@scenario
خانمی ۶۰ ساله با درد ناگهانی و شدید پهلوی راست که به کشاله ران می‌رود، تهوع و استفراغ و بی‌قراری. سابقه سنگ کلیه و ESWL دارد. فشار 135/85، نبض 96 و تب ندارد.

@why
کولیک بدون عارضه است؛ مسکن، مایع و سونوگرافی کافی است.

@orders
- CVS / NPO / RBR; supine
- Labs: CBC/diff, BUN/Cr, UA
- Serum **N/S 500 mL** IV stat infusion
- **Sonography of kidney, bladder and ureter**
- Amp **Morphine sulfate 3 mg** IV stat, slow, with RR control
- @B Amp **Ketorolac 30 mg** IV stat
- @A Amp **Promethazine 25 mg** IM stat (for nausea)

@branch
if: Age > 50 with renal-colic-type pain
- Always consider an **abdominal aortic aneurysm**: examine, auscultate, and request aortic ultrasound if needed

@branch
if: **BUN/Cr and UA** are not essential, but are **mandatory** in: single kidney, transplanted kidney, history of renal failure
- Check them

@branch
if: **Imaging** is not routine
- Do ultrasound / imaging routinely only for transplant, single kidney, toxic appearance or severe obstruction

@branch
if: Complicated picture
go: colic-comp

@notes
- چک BUN/Cr و UA ضروری نیست اما در بیمارانی که تک کلیه، کلیه پیوندی یا شرح حال نارسایی کلیه می‌دهند باید حتماً چک شود. WBC می‌تواند به علت درد زیاد افزایش پیدا کند.
- در افراد بالای ۵۰ سال با رنال کولیک حتماً آنوریسم آئورت شکمی مدنظر باشد و معاینه و سمع و در صورت نیاز سونوگرافی آئورت درخواست شود.

@variant colic-comp
name: Complicated: infected, single kidney, severe
level: II
source: AB
meta: Imp: Renal colic with complications
refs: eau-urolithiasis-2026

@scenario
مردی ۵۲ ساله با تک‌کلیه، کولیک را با تب 38.9، لرز، استفراغ کنترل‌نشده و بالا رفتن کراتینین دارد. یا درد که مرتب به مسکن تزریقی نیاز دارد، یا کلیه پیوندی.

@why
عارضه‌دار است؛ آنتی‌بیوتیک، تصویربرداری و بستری لازم است و NSAID با احتیاط.

@orders
- CVS / NPO / RBR; supine
- Labs: CBC/diff, BUN/Cr, UA
- Serum **N/S 500 mL** IV stat infusion
- **Sonography of kidney, bladder and ureter**
- Amp **Morphine sulfate 3 mg** IV stat, slow, with RR control
- Amp **Ceftriaxone 2 g** IV stat (infected obstructed stone) @A
- Avoid NSAIDs (ketorolac) in AKI, single kidney or transplant [^eau-urolithiasis-2026]
- Amp Ondansetron 4 mg or Promethazine 25 mg IM stat
- **Imaging is indicated**: ultrasound (or CT as needed)

@branch
if: **Absolute admission indications**: obstructing stone with UTI; uncontrolled nausea / vomiting; severe pain needing repeated injectable analgesics; urinary extravasation; hypercalcemic crisis
- Admit

@branch
if: **Relative admission indications**: underlying disease that makes outpatient treatment difficult; very severe obstruction; leukocytosis; single kidney or renal disease; socio-economic factors
- Consider admission

@notes
- اندیکاسیون‌های مطلق بستری در سنگ کلیه: سنگی که انسداد داده است همراه با عفونت ادراری، تهوع و استفراغ غیرقابل کنترل، درد شدیدی که نیاز به تکرار متناوب مسکن تزریقی داشته باشد، اکستراوازیشن ادراری، کریز هیپرکلسمیک.
- اندیکاسیون‌های نسبی بستری: بیماری زمینه‌ای واضح که درمان سرپایی را مشکل می‌کند، انسداد بسیار شدید، لکوسیتوز، تک کلیه و یا بیماری‌های کلیوی، فاکتورهای اقتصادی اجتماعی.
