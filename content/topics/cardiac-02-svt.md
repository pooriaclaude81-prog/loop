@topic svt
cluster: cardiac
name: AVNRT / SVT
name_fa: تاکی‌کاردی فوق‌بطنی (AVNRT)
source: A
keywords: adenosine verapamil cardioversion tachycardia narrow complex
refs: acc-svt-2015, aha-cpr-2025

@guide
# ایده کلی
در AVNRT یک مدار برگشتی در گره دهلیزی‌بطنی باعث ضربان سریع و منظم (حدود ۱۵۰ تا ۲۵۰) با QRS باریک می‌شود. بیشتر بیماران پایدارند و دارو فوراً درمانش می‌کند [^acc-svt-2015].
# منطق دستورها
- **اول مانور وگال** (والسالوای اصلاح‌شده)، چون ساده و بی‌خطر است.
- **آدنوزین** مدار را برای چند ثانیه قطع می‌کند. نیمه‌عمرش خیلی کوتاه است، پس باید سریع و از رگ بزرگ تزریق و با فلاش سرم دنبال شود. دست را بالا نگه می‌دارند تا دارو زودتر به قلب برسد.
- اگر جواب نداد، **وراپامیل** (یا دیلتیازم) سد کننده کانال کلسیم است. در بیمار ناپایدار، با QRS پهن یا WPW نباید داده شود.
# اگر بیمار ناپایدار شد
فشار پایین، درد قفسه، گیجی یا شوک یعنی دیگر وقت دارو دادن نیست: **کاردیوورژن سنکرون** بعد از آرام‌بخشی کوتاه [^aha-cpr-2025].

@variant svt-stable
name: Stable narrow-complex SVT
level: II
source: A
meta: Imp: AVNRT · Diet: NPO until stable
refs: acc-svt-2015

@scenario
خانمی ۲۹ ساله نیم ساعت است که ناگهان دچار تپش قلب و اضطراب شده است. ضربان ۱۸۰ و منظم، فشار 118/76، SpO2 98٪ و درد قفسه ندارد. ECG یک تاکی‌کاردی منظم با QRS باریک و بدون موج P واضح نشان می‌دهد.

@why
بیمار پایدار است، پس اول مانور وگال و آدنوزین را امتحان می‌کنیم و فقط در صورت شکست سراغ وراپامیل می‌رویم.

@orders
- IV line fix, in a large proximal vein (antecubital)
- Cardiac monitoring + pulse oximetry
- ECG (12-lead; record during any drug attempt)
- O2 by nasal cannula 3–4 L/min only if SpO2 < 92%
- First step: vagal maneuver, modified Valsalva (strain 15 s semi-recumbent, then lie flat with legs raised) [^acc-svt-2015]
- Amp **Adenosine 6 mg** IV stat, rapid push over 1–3 s, followed by **20 mL N/S flush** with the arm elevated
- If no response: Amp **Adenosine 12 mg** IV rapid push, followed by 20 mL N/S push with elevation. Can be repeated (source reads "x2").
- If still no response: Amp **Verapamil 2.5–5 mg** IV over 2 min. May repeat **5–10 mg** every 15–30 min to a **total of 20 mg**.

@branch
if: Rhythm persists, or the patient becomes unstable (hypotension, chest pain, altered, shock)
go: svt-unstable

@branch
if: Wide-complex tachycardia, pre-excited AF, hypotension, or already on a beta-blocker
- Do NOT give verapamil. Treat as unstable / seek cardiology advice. [^acc-svt-2015]

@notes
- در AVNRT پایدار: ابتدا آدنوزین ۶ میلی‌گرم سریع (۱ تا ۳ ثانیه) و سپس ۲۰ سی‌سی نرمال سالین فلاش با بالا نگه داشتن دست؛ در صورت عدم پاسخ ۱۲ میلی‌گرم؛ سپس وراپامیل.

@variant svt-unstable
name: Persistent or unstable → cardioversion
level: I
source: A
meta: Imp: AVNRT, persistent despite drugs
refs: aha-cpr-2025

@scenario
مردی ۶۳ ساله با تپش قلب ناگهان رنگ‌پریده و عرق‌کرده شده است. ضربان ۱۹۰ و منظم، فشار 78/50، گیج است و درد قفسه سینه دارد. یا: یک SVT که با آدنوزین و وراپامیل برنگشته است.

@why
بیمار ناپایدار است و وقت دارو دادن ندارد؛ اینجا کاردیوورژن الکتریکی سنکرون درمان است.

@orders
- Move to the resuscitation room, monitor + pads
- IV line fix, O2 if SpO2 < 92%
- ECG if it does not delay treatment
- Mild sedation (small dose, if conscious)
- **Synchronized DC shock 100–200 J** after mild sedation
- Cardiology consult

@branch
if: Stable and regular narrow-complex, and drugs not yet tried
go: svt-stable
