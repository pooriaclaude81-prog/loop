@topic warfarin
cluster: tox
name: Warfarin toxicity / high INR
name_fa: مسمومیت با وارفارین (INR بالا)
source: B
keywords: inr vitamin k ffp pcc anticoagulant bleeding
refs: mja-warfarin-2025, aha-ich-2022

@guide
# ایده کلی
وارفارین عوامل انعقادی وابسته به ویتامین K را کم می‌کند. INR بالا یعنی خطر خونریزی؛ ولی درمان بستگی به این دارد که بیمار خونریزی تهدیدکننده حیات دارد یا نه [^mja-warfarin-2025].
# چهار حالت
- **INR بین 3 تا 4.5 بدون خونریزی:** یک نوبت وارفارین را نگیرد.
- **INR بین 4.5 تا 10 بدون خونریزی:** یک یا دو نوبت را نگیرد؛ ویتامین K خوراکی کم‌دوز.
- **INR بالای 10:** مشابه، با ویتامین K خوراکی.
- **خونریزی تهدیدکننده حیات (گوارشی، مغزی، ...):** ویتامین K وریدی آهسته + PCC (یا FFP)؛ PCC سریع‌تر عمل می‌کند و از FFP بهتر است [^aha-ich-2022].
# اگر خونریزی داخل مغزی بود
وارد مسیر خونریزی مغزی شوید و اثر وارفارین را فوراً برگردانید.

@variant warfarin-low
name: INR 3–4.5, no life-threatening bleed
level: II
source: B
meta: Imp: Warfarin toxicity · C: I or II
refs: mja-warfarin-2025

@scenario
مردی ۷۱ ساله با دریچه مکانیکی که وارفارین می‌خورد، کبودی دارد و INR برابر 3.8 (بالاتر از محدوده درمانی) است. خونریزی فعال بزرگی ندارد.

@why
INR کمی بالاست و خونریزی ندارد؛ فقط یک نوبت وارفارین را نگه می‌داریم.

@orders
- CVS / NPO / CBR; supine
- IV line fix
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, **PT, PTT, INR**, BG/Rh, VBG, Trop, AST, ALT, ALP
- Check **Hb/Hct every 6 h**
- PO & HM
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%
- Bed-side guard + fixed relative
- N/S 1 L IV infusion every 12 h
- ECG; BS glucometry; CXR
- Amp Omeprazole 40 mg IV stat
- Amp **Vitamin K** on standby

@branch
if: INR 3–4.5 and no life-threatening bleed
- **Hold one dose of warfarin**

@variant warfarin-mid
name: INR 4.5–10, no life-threatening bleed
level: II
source: B
meta: Imp: Warfarin toxicity
refs: mja-warfarin-2025

@scenario
خانمی ۷۸ ساله که تازه آنتی‌بیوتیک شروع کرده، INR برابر 7.2 دارد. خونریزی بینی داشته که قطع شده و همودینامیک پایدار است.

@why
INR نسبتاً بالا بدون خونریزی؛ نگه داشتن وارفارین و ویتامین K خوراکی کم‌دوز.

@orders
- CVS / NPO / CBR; supine
- IV line fix
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, **PT, PTT, INR**, BG/Rh, VBG, Trop, AST, ALT, ALP
- Check **Hb/Hct every 6 h**
- PO & HM
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%
- Bed-side guard + fixed relative
- N/S 1 L IV infusion every 12 h
- ECG; BS glucometry; CXR
- Amp Omeprazole 40 mg IV stat
- Amp **Vitamin K** on standby

@branch
if: INR 4.5–10 and no life-threatening bleed
- **Hold one or two doses of warfarin**
- Can give **Vitamin K 1–2 mg orally**

@variant warfarin-high
name: INR > 10, no life-threatening bleed
level: II
source: B
meta: Imp: Warfarin toxicity
refs: mja-warfarin-2025

@scenario
مردی ۶۶ ساله بعد از اشتباه در دوز، INR برابر 14 دارد ولی خونریزی فعال ندارد.

@why
INR خیلی بالا ولی بدون خونریزی؛ ویتامین K خوراکی و نگه داشتن وارفارین.

@orders
- CVS / NPO / CBR; supine
- IV line fix
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, **PT, PTT, INR**, BG/Rh, VBG, Trop, AST, ALT, ALP
- Check **Hb/Hct every 6 h**
- PO & HM
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%
- Bed-side guard + fixed relative
- N/S 1 L IV infusion every 12 h
- ECG; BS glucometry; CXR
- Amp Omeprazole 40 mg IV stat
- Amp **Vitamin K** on standby

@branch
if: INR > 10 and no life-threatening bleed
- **Hold one or two doses of warfarin**
- **Vitamin K 2 mg orally**

@variant warfarin-bleed
name: Any INR + life-threatening bleed
level: I
source: B
meta: Imp: Warfarin toxicity with major bleeding · Level I
refs: mja-warfarin-2025

@scenario
مردی ۶۹ ساله که وارفارین می‌خورد، مدفوع سیاه و سرگیجه دارد. فشار 82/50 و INR برابر 6. یا خونریزی داخل مغزی، هموپتزی ماسیو یا خونریزی داخل شکم.

@why
خونریزی تهدیدکننده حیات است؛ احیا و برگرداندن فوری اثر وارفارین با ویتامین K وریدی و PCC/FFP.

@orders
- CVS / NPO / CBR; supine
- IV line fix
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, **PT, PTT, INR**, BG/Rh, VBG, Trop, AST, ALT, ALP
- Check **Hb/Hct every 6 h**
- PO & HM
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%
- Bed-side guard + fixed relative
- N/S 1 L IV infusion every 12 h
- ECG; BS glucometry; CXR
- Amp Omeprazole 40 mg IV stat
- Amp **Vitamin K** on standby
- Reserve **4 units P.C**, iso-group iso-Rh
- Reserve **FFP**, iso-Rh
- ABC first; massive-bleed resuscitation (see [[gib-massive|massive GI bleeding]])

@branch
if: Any abnormal INR with life-threatening bleeding (GIB, hemoptysis, internal or brain bleeding)
- Amp **Vitamin K 5–10 mg IV, slowly**
- Consider **FFP** or **PCC**

@notes
- افرادی که اختلالات انعقادی دارند و با خونریزی‌های ماسیو مراجعه می‌کنند (ماسیو GIB، ماسیو همپتیزی، خونریزی‌های داخل شکمی و داخل مغزی) سریعاً باید عملیات احیا و ABC انجام شود.
