@topic rhabdo
cluster: renal
name: Rhabdomyolysis
name_fa: رابدومیولیز
source: A
keywords: cpk myoglobin bicarbonate fluids
refs: east-rhabdo

@guide
# ایده کلی
در رابدومیولیز عضله آسیب می‌بیند و میوگلوبین، پتاسیم و CPK آزاد می‌شود. خطر اصلی نارسایی کلیه و هیپرکالمی است [^east-rhabdo].
# درمان
- **مایع زیاد و زودهنگام** ستون درمان است؛ هدف ادرار حدود ۳ ml/kg/h. ممکن است در ۲۴ ساعت اول ۱۰ تا ۲۰ لیتر لازم شود.
- پتاسیم، کلسیم و گاز خون را مرتب کنید.
- بی‌کربنات فقط در اسیدوز و نه روتین.
- فوروزماید و استازولامید روتین نیستند.
- دیالیز: اسیدوز غیرقابل اصلاح، هیپرکالمی مقاوم، اورمی/آنوری، overload حجمی.
# علل
تمرین سنگین، له‌شدگی، تشنج، مواد، داروها (استاتین)، بی‌حرکتی طولانی.

@variant rhabdo-std
name: Standard fluid resuscitation
level: II
source: A
meta: Imp: Rhabdomyolysis
refs: east-rhabdo

@scenario
مردی ۲۸ ساله بعد از یک جلسه سنگین ورزشی دچار درد شدید عضلانی و ادرار تیره (رنگ کوکاکولا) شده است. CPK برابر 38000، کراتینین 1.6 و پتاسیم 5.4. فشار نرمال است.

@why
رابدومیولیز بدون اسیدوز است؛ مایع زیاد و پایش ادرار ستون درمان است.

@orders
- Imp: rhabdomyolysis
- IV line fix
- Labs: CBC/diff, BUN, Cr, Na, K, Ca, Mg, P, **CPK**, LDH, UA, ABG, ALT, AST, ALP
- Cardiac monitoring + pulse oximetry
- ECG
- Foley catheter fix
- Chart I/O
- Serum **N/S 1 L** IV stat, free infusion, **until urine output reaches 3 mL/kg/h** [^east-rhabdo]
- Internist consult

@branch
if: Metabolic acidosis
go: rhabdo-acidosis

@branch
if: Dialysis indications
go: rhabdo-dialysis

@notes
- اگرچه وجود میوگلوبین پاتوگنومونیک برای رابدومیولیز است، ولی عدم وجود آن در سرم یا ادرار رابدومیولیز را رد نمی‌کند چون فقط در مراحل اولیه detect می‌شود.
- مایع درمانی در بیماران رابدومیولیز تا زمانی ادامه می‌یابد که CPK به کمتر از ۱۰۰۰ برسد.
- در ۲۴ ساعت اول ممکن است نیاز به ۱۰ تا ۲۰ لیتر مایع باشد تا برون‌ده ادراری به ۳ ml/kg/h برسد.
- فورزماید (لوپ دیورتیک) هم ادرار را افزایش می‌دهد اما به عنوان پروفیلاکسی برای RF استفاده نمی‌شود. استازولامید به طور کلی به صورت روتین تجویز آن توصیه نمی‌شود.

@variant rhabdo-acidosis
name: With metabolic acidosis → bicarbonate
level: II
source: A
meta: Imp: Rhabdomyolysis with metabolic acidosis
refs: east-rhabdo

@scenario
مردی ۳۵ ساله بعد از مصرف زیاد دارو ۱۰ ساعت روی زمین پیدا شده است. CPK برابر 120000، pH برابر 7.18، بی‌کربنات 12 و کراتینین 3.

@why
اسیدوز متابولیک دارد؛ در این حالت بی‌کربنات هم در نظر گرفته می‌شود.

@orders
- Imp: rhabdomyolysis
- IV line fix
- Labs: CBC/diff, BUN, Cr, Na, K, Ca, Mg, P, **CPK**, LDH, UA, ABG, ALT, AST, ALP
- Cardiac monitoring + pulse oximetry
- ECG
- Foley catheter fix
- Chart I/O
- Serum **N/S 1 L** IV stat, free infusion, **until urine output reaches 3 mL/kg/h** [^east-rhabdo]
- Internist consult
- **2–3 vials (50 mL each) Sodium bicarbonate** IV infusion
- Keep **urine pH > 6.5** and **blood pH about 7.40–7.45**
- Bicarbonate is not routine; stop it if hypocalcemia develops or pH > 7.5 [^east-rhabdo]

@notes
- در بیماران با اسیدوز متابولیک، تجویز نرمال سالین و بی‌کربنات سدیم توصیه می‌شود.

@variant rhabdo-dialysis
name: Dialysis indications
level: I
source: A
meta: Imp: Rhabdomyolysis with failing kidneys
refs: east-rhabdo

@scenario
مردی ۴۵ ساله با له‌شدگی، آنوری، پتاسیم 7.0، pH برابر 7.05 و احتقان ریه علی‌رغم مایع.

@why
اندیکاسیون دیالیز دارد؛ هیپرکالمی را همزمان درمان می‌کنیم.

@orders
- Imp: rhabdomyolysis
- IV line fix
- Labs: CBC/diff, BUN, Cr, Na, K, Ca, Mg, P, **CPK**, LDH, UA, ABG, ALT, AST, ALP
- Cardiac monitoring + pulse oximetry
- ECG
- Foley catheter fix
- Chart I/O
- Serum **N/S 1 L** IV stat, free infusion, **until urine output reaches 3 mL/kg/h** [^east-rhabdo]
- Internist consult
- **Dialysis if indicated** (list below)
- Treat hyperkalemia at once, see [[hyperk-ecg|hyperkalemia]]

@branch
if: **Dialysis indications**: (1) uncorrectable metabolic acidosis; (2) life-threatening hyperkalemia or other electrolyte disorder resistant to treatment; (3) uremia and anuria; (4) volume overload
- Dialysis

@notes
- اندیکاسیون‌های دیالیز: ① اسیدوز متابولیک غیرقابل اصلاح ② هایپرکالمی یا سایر اختلالات الکترولیتی تهدیدکننده حیات و مقاوم به درمان ③ اورمی و آنوری ④ اورلود مایع (volume overload).
