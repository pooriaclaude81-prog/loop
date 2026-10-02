@topic epi
cluster: trauma
name: Epistaxis
name_fa: خونریزی بینی (اپیستاکسی)
source: B
keywords: nosebleed packing silver nitrate ent
refs: aaohns-epistaxis-2020

@guide
# ایده کلی
بیشتر خونریزی‌های بینی قدامی‌اند و با فشار ساده بند می‌آیند [^aaohns-epistaxis-2020].
# پله‌ها
- ۱) قطره موضعی منقبض‌کننده (نفازولین/اکسی‌متازولین) و فشار ۱۰ تا ۱۵ دقیقه.
- ۲) کوتر شیمیایی نیترات نقره (فقط چند ثانیه).
- ۳) گاز جاذب آغشته به اسید ترانگزامیک.
- ۴) تامپون قدامی (و در صورت لزوم دوطرفه).
- ۵) شک به خونریزی خلفی: تامپون خلفی با فولی و مشاوره ENT.
# چه موقع آزمایش و رگ؟
فقط در خونریزی شدید یا مصرف ضدانعقاد (وارفارین، انوکساپارین) یا بیماری زمینه‌ای شدید.

@variant epi-anterior
name: Anterior bleed: stepwise
level: III
source: B
meta: Imp: Epistaxis · C: IV/III/II · NPO · CBR · semi-sitting
refs: aaohns-epistaxis-2020

@scenario
مردی ۴۵ ساله بعد از فین کردن ۲۰ دقیقه است از بینی راست خونریزی دارد. نشسته، خون کمی می‌بلعد، فشار 140/85 و ضدانعقاد نمی‌خورد.

@why
خونریزی قدامی ساده است؛ پله‌پله از فشار تا تامپون.

@orders
- CVS / NPO / CBR; semi-sitting
- **Step 1**: Naphazoline or oxymetazoline nasal drops in each nostril, **twice**; then **pinch the nose with the fingers for 10–15 min**
- **Step 2** (if not controlled): **Chemical cautery with silver nitrate for 5 s** (never more than 15 s)
- **Step 3**: A **surgical** (absorbable) pack **soaked in tranexamic acid** placed in the nose
- **Step 4**: **Anterior nasal packing** in the bleeding nostril; if still not controlled, pack the **other nostril** too
- **Step 5**: Not controlled: **ENT** or surgery consult

@branch
if: **Labs and IV access are not needed**, unless he takes **warfarin** or another anticoagulant (enoxaparin etc.) or has a severe underlying disease, or the bleed is heavy
- Labs: CBC/diff, BUN/Cr, PT, PTT, INR, BG/Rh; IV line; N/S 1 L stat
go: epi-massive

@branch
if: Not controlled and a **posterior** source is suspected
go: epi-posterior

@variant epi-posterior
name: Posterior bleed
level: II
source: B
meta: Imp: Epistaxis, suspected posterior
refs: aaohns-epistaxis-2020

@scenario
مردی ۶۸ ساله با فشار خون بالا، با وجود تامپون قدامی هنوز خونریزی دارد و خون در گلو می‌ریزد.

@why
خونریزی خلفی است؛ تامپون خلفی با سوند فولی و ENT.

@orders
- CVS / NPO / CBR; semi-sitting; IV line
- Labs: CBC/diff, BUN/Cr, PT, PTT, INR, BG/Rh
- **Posterior nasal packing with a Foley catheter #12**, inflated with **5–7 mL of distilled water**
- ENT or surgery consult

@variant epi-massive
name: Massive bleed / anticoagulated
level: II
source: B
meta: Imp: Epistaxis, massive or on anticoagulants · C: II
refs: aaohns-epistaxis-2020

@scenario
مردی ۷۲ ساله که وارفارین می‌خورد، خونریزی شدید بینی، سرگیجه، فشار 98/60 و نبض 108 دارد. ممکن است دچار شوک هیپوولمیک شود.

@why
خونریزی ماسیو یا ضدانعقاد است؛ رگ، آزمایش، اصلاح انعقاد و ENT.

@orders
- CVS / NPO / CBR; semi-sitting
- IV line; Serum **N/S 1 L** IV stat
- Labs: CBC/diff, BUN/Cr, PT, PTT, INR, BG/Rh
- Local measures as on the [[epi-anterior|anterior page]]; ENT or surgery consult

@branch
if: Warfarin and a high INR
go: warfarin-bleed

@notes
- بسته به شرایط بیمار و میزان خونریزی می‌تواند یک خونریزی ساده تا خونریزی‌های شدید و ماسیو باشد که منجر به شوک هیپوولمیک شود لذا سطح‌بندی بیمار بر حسب شرایط بیمار متفاوت است.
- آزمایشات لازم نمی‌باشد مگر این که بیمار وارفارین مصرف می‌کند و یا داروی ضد انعقاد دیگر مثل انوکساپارین مصرف می‌کند و یا یک بیماری زمینه‌ای شدید دارد.
