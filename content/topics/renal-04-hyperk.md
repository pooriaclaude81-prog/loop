@topic hyperk
cluster: renal
name: Hyperkalemia
name_fa: هیپرکالمی
source: B
keywords: potassium calcium gluconate insulin salbutamol
refs: ukka-hyperk-2023, kdigo-potassium-2020

@guide
# ایده کلی
پتاسیم بالا قلب را بی‌ثبات می‌کند: T نوک‌تیز، QRS پهن، و در نهایت ایست. معیار خطر نه فقط عدد، بلکه ECG است [^ukka-hyperk-2023].
# سه کار هم‌زمان
- **محافظت از قلب:** کلسیم (گلوکونات) وریدی وقتی ECG تغییر دارد؛ اثرش چند دقیقه است ولی پتاسیم را کم نمی‌کند.
- **بردن پتاسیم به داخل سلول:** انسولین + دکستروز، سالبوتامول نبولایزر، و در اسیدوز بی‌کربنات.
- **دفع از بدن:** دیورتیک اگر کلیه کار می‌کند، رزین، و دیالیز اگر مقاوم است [^kdigo-potassium-2020].
# مراقب باش
- بعد از انسولین قند را چک کنید (هیپوگلیسمی).
- بیمار با QRS پهن سطح ۱ است و مانیتور و دفیبریلاتور آماده.

@variant hyperk-ecg
name: With ECG changes (wide QRS) → Level I
level: I
source: B
meta: Imp: Hyperkalemia · C: II–I
refs: ukka-hyperk-2023

@scenario
مردی ۵۸ ساله با نارسایی مزمن کلیه که پنج روز دیالیز را از دست داده، ضعف و تپش قلب دارد. پتاسیم 7.4، ECG با T نوک‌تیز و QRS پهن. ممکن است ناگهان ایست کند.

@why
ECG تغییر کرده؛ سطح ۱ و محافظت از قلب با کلسیم اولین قدم است.

@orders
- CVS / NPO / CBR; supine
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, VBG; HBsAg, HCV Ab, HIV Ab (in case dialysis is needed)
- PO & HM; O2 by nasal cannula if SpO2 ≤ 94%
- **ECG**; CXR (portable, or after he is stable)
- IV line fix; bed-side guard + fixed relative
- Dialysis access equipment at the bedside; **DC shock** ready
-- Emergency treatment (Level I, move to resuscitation)
- Amp **Calcium gluconate** at the bedside, **1 ampoule (10 mL)** over **3 min** IV, as long as the QRS is wide; may continue up to **30 mL**
- Amp **Insulin 10 units** + **dextrose 25 g (50 mL of 50%)** IV; check glucose hourly [^ukka-hyperk-2023]
- Neb **Salbutamol 15 mg** stat, by mask

@branch
if: **Volume status**
go: hyperk-volume

@branch
if: **Severe acidosis**
go: hyperk-acidosis

@branch
if: Residual renal function
- Amp **Lasix 40 mg**

@branch
if: Hyperkalemic arrest
go: arrest-nonshockable

@notes
- بیماران هیپرکالمی می‌توانند ناگهان دچار ایست قلبی تنفسی و یا Wide QRS شوند که در این موارد درمان اورژانس هیپرکالمی باید آغاز شود و در این شرایط به سطح I و احیا منتقل شوند.
- در صورتی که احتمال دیالیز بیمار وجود دارد مارکرهای ویروسی HBS Ag, HCV Ab, HIV Ab چک شوند.

@variant hyperk-noecg
name: No ECG changes
level: II
source: B
meta: Imp: Hyperkalemia · C: II
refs: ukka-hyperk-2023

@scenario
مردی ۶۴ ساله با CKD که مهارکننده ACE و مکمل پتاسیم می‌خورد، پتاسیم 6.3 در آزمایش روتین دارد. بدون علامت، ECG بدون تغییر و QRS باریک.

@why
بدون ECG تغییریافته است؛ کاهش پتاسیم با انسولین و سالبوتامول و آمادگی کلسیم.

@orders
- CVS / NPO / CBR; supine
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, VBG; HBsAg, HCV Ab, HIV Ab (in case dialysis is needed)
- PO & HM; O2 by nasal cannula if SpO2 ≤ 94%
- **ECG**; CXR (portable, or after he is stable)
- IV line fix; bed-side guard + fixed relative
- Dialysis access equipment at the bedside; **DC shock** ready
- Amp **Insulin 10 units** + **dextrose 25 g (50 mL of 50%)** IV; check glucose hourly [^ukka-hyperk-2023]
- Neb **Salbutamol 15 mg** stat, by mask
- Amp **Calcium gluconate stand-by** at the bedside, ready if the QRS widens
- Amp **Lasix 40 mg** if there is residual renal function

@branch
if: K > 6 on labs
- Start **emergency treatment of hyperkalemia**

@branch
if: Wide QRS appears
go: hyperk-ecg

@variant hyperk-volume
name: Fluids: overloaded vs not
level: II
source: B
meta: Imp: Hyperkalemia, fluid management
refs: ukka-hyperk-2023

@scenario
دو بیمار با پتاسیم 6.8: یکی کم‌آب بعد از اسهال با کلیه سالم، دیگری بیمار دیالیزی با تورم پا و کراکل.

@why
نوع مایع به وضعیت حجم بیمار بستگی دارد؛ overload یا کم‌آبی.

@orders
- **Overloaded**: serum **N/S 250 mL + the previous 8 h urine output** every 8 h
- **Not overloaded and no kidney disorder**: serum **N/S 1 L every 8 h**
- Continue the treatment on the [[hyperk-ecg|emergency page]] or [[hyperk-noecg|non-ECG page]]

@variant hyperk-acidosis
name: Severe acidosis → bicarbonate
level: II
source: B
meta: Imp: Hyperkalemia with severe acidosis
refs: ukka-hyperk-2023

@scenario
مردی ۵۰ ساله با پتاسیم 7.2 و pH برابر 6.95، BUN برابر 90 و overload ندارد. یا اسیدمی ارگانیک.

@why
اسیدوز شدید بی‌کربنات را اندیکاسیون می‌کند، مشروط به نبود overload.

@orders
- Vial **Sodium bicarbonate up to 150 mEq**, as long as the patient is **not volume overloaded** and has severe acidosis (pH < 7). Useful in organic acidemias as well.
- Continue the [[hyperk-ecg|emergency treatment]]
