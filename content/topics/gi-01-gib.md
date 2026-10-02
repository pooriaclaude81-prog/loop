@topic gib
cluster: gi
name: GI bleeding
name_fa: خونریزی گوارشی
source: AB
keywords: hematemesis melena pantoprazole octreotide varices blakemore transfusion
refs: acg-ugib-2021, esge-pub-2026, aasld-portal-2024, baveno8-2026

@guide
# ایده کلی
خونریزی گوارشی (استفراغ خونی، مدفوع سیاه) را مثل هر خونریزی دیگر با «احیا» شروع کنید و بعد علت را پیدا کنید. اندوسکوپی درمان اصلی است ولی فقط وقتی بیمار احیا شده [^acg-ugib-2021].
# چهار نسخه
- **پایدار:** رگ‌گیری، آزمایش، PPI وریدی، رزرو خون، مشاوره گوارش.
- **ماسیو یا ناپایدار:** دو رگ بزرگ، مایع و ترانسفوزیون زودهنگام (هدف فشار سیستولیک حدود 100)، گرم‌کردن بیمار، اینتوباسیون در صورت نیاز.
- **واریسی/سیروز:** علاوه بر بالا، اکتروتاید (وازواکتیو) و آنتی‌بیوتیک (سفتریاکسون) از ابتدا و آمادگی لوله بلک‌مور؛ اندوسکوپی زودتر [^aasld-portal-2024].
- **ضدانعقاد/INR بالا:** FFP یا PCC و ویتامین K.
# هدف هموگلوبین
بالای 7 (در بیمار قلبی یا سالمند بالای 9). پلاکت زیر 50 هزار با خونریزی فعال: پلاکت [^esge-pub-2026].

@variant gib-stable
name: Stable upper GI bleed
level: II
source: AB
meta: Imp: GI bleeding · C: II/III · NPO · CBR · supine or semi-sitting
refs: acg-ugib-2021

@scenario
مردی ۵۵ ساله که برای کمردرد NSAID می‌خورد، دو بار خون روشن استفراغ کرده و مدفوع سیاه دارد. فشار 118/72، نبض 96، Hb برابر 10.4، عرق نکرده و هوشیار است.

@why
خونریزی گوارشی فوقانی پایدار است؛ احیا، PPI و مشاوره گوارش کافی است و نیاز به ترانسفوزیون ماسیو نیست.

@orders
- CVS / NPO / CBR; supine or semi-sitting (A: supine, head elevated)
- IV line fix. @B **Two large-bore lines.**
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR. @B Also lactate, LDH, AST/ALT/ALP, BG/Rh, VBG.
- Cardiac monitoring + pulse oximetry
- ECG (age > 40, or any cardiac history)
- CXR / abdominal film only if perforation, obstruction or foreign body is suspected @B
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- Serum **N/S 1 L** IV stat, repeat per shock protocol @B
- Amp **Pantoprazole 80 mg** IV stat, then **8 mg/h** infusion @B
- Amp Plasil (metoclopramide) 10 mg IV stat @B
- Reserve **2 U P.C** (iso-group, iso-Rh) @A
- BS glucometry; NGT if indicated; I/O control
- GI (internal medicine) consult @B

@branch
if: Hemoglobin target
- Keep **Hb > 7 g/dL**; in **ischemic heart disease or the elderly keep Hb > 9**

@branch
if: Platelets < 50,000 with active bleeding
- Transfuse **6 units of platelets**

@branch
if: Underlying disease, disabled patient, or shock
- **Fix a Foley catheter**

@branch
if: Each fluid bolus given
- Re-check vital signs by the **shock protocol** after every dose (each 20 min) and repeat the bolus to keep **SBP about 100 mmHg**

@branch
if: Suspected perforation, obstruction or foreign body
- Upright CXR and abdominal film

@branch
if: Massive bleeding, shock, hypoxia, severe tachypnea, ↓LOC
go: gib-massive

@branch
if: Cirrhosis / alcohol / varices / abnormal LFT
go: gib-variceal

@branch
if: Warfarin or INR > 1.5
go: gib-anticoag

@variant gib-massive
name: Massive / unstable bleed → Level I
level: I
source: AB
meta: Imp: Massive GI bleeding · Level I
refs: acg-ugib-2021

@scenario
مردی ۶۲ ساله حدود ۱ لیتر خون استفراغ کرده است. فشار 78/45، نبض 126، سرد و رنگ‌پریده، خواب‌آلود و SpO2 برابر 90٪. خونریزی ادامه دارد.

@why
بیمار شوکه است؛ اولویت احیای تهاجمی با مایع و خون است و اندوسکوپی بعد از آن.

@orders
- CVS / NPO / CBR; supine or semi-sitting (A: supine, head elevated)
- IV line fix. @B **Two large-bore lines.**
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR. @B Also lactate, LDH, AST/ALT/ALP, BG/Rh, VBG.
- Cardiac monitoring + pulse oximetry
- ECG (age > 40, or any cardiac history)
- CXR / abdominal film only if perforation, obstruction or foreign body is suspected @B
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- Serum **N/S 1 L** IV stat, repeat per shock protocol @B
- Amp **Pantoprazole 80 mg** IV stat, then **8 mg/h** infusion @B
- Amp Plasil (metoclopramide) 10 mg IV stat @B
- Reserve **4 U P.C** and **4 U FFP**, iso-group, iso-Rh @B
- BS glucometry; NGT if indicated; I/O control
- GI (internal medicine) consult @B
- Move to the resuscitation room
- Aggressive fluid therapy and a **massive-transfusion plan**; intubation considered
- **Aggressive re-warming**

@branch
if: Fluid response
- Repeat the N/S bolus after re-assessment every 20 min, **aim for SBP about 100**

@notes
- در صورت Massive GIB، شوک، هیپوکسی، تاکی‌پنه شدید، کاهش سطح هوشیاری بیمار در سطح یک قرار گرفته است. مایع درمانی شدید و برنامه ماسیو ترانسفیوژن و اینتوباسیون برای بیمار مدنظر قرار گیرد.

@variant gib-variceal
name: Variceal / cirrhotic bleed
level: I
source: B
meta: Imp: GI bleeding with liver disease
refs: aasld-portal-2024

@scenario
مردی ۴۸ ساله الکلی و مبتلا به سیروز مقدار زیادی خون استفراغ کرده است. فشار 92/58، نبض 112، زردی و آسیت دارد.

@why
به واریس مری شک داریم؛ علاوه بر احیا، دارو وازواکتیو و آنتی‌بیوتیک از ابتدا لازم است.

@orders
- CVS / NPO / CBR; supine or semi-sitting (A: supine, head elevated)
- IV line fix. **Two large-bore lines.**
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR. Also lactate, LDH, AST/ALT/ALP, BG/Rh, VBG.
- Cardiac monitoring + pulse oximetry
- ECG (age > 40, or any cardiac history)
- CXR / abdominal film only if perforation, obstruction or foreign body is suspected.
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- Serum **N/S 1 L** IV stat (repeat per shock protocol).
- Amp **Pantoprazole 80 mg** IV stat, then **8 mg/h infusion**
- Amp Plasil (metoclopramide) 10 mg IV stat.
- Reserve **4 U P.C** and **4 U FFP**, iso-group.
- BS glucometry; NGT if indicated; I/O control
- GI (internal medicine) consult.
- Amp **Octreotide 50 µg bolus, then 50 µg/h** infusion (for liver disease, alcoholics, esophageal varices, deranged LFT)
- Amp **Ceftriaxone 1 g** IV infusion (antibiotic in cirrhosis, immunodeficiency or suspected bacterial peritonitis)
- **Sengstaken–Blakemore tube on standby**
- Restrictive transfusion (Hb target 7–8), endoscopy within 12 h [^aasld-portal-2024]

@variant gib-anticoag
name: On warfarin or INR > 1.5
level: I
source: B
meta: Imp: GI bleeding with coagulopathy
refs: mja-warfarin-2025

@scenario
خانمی ۷۰ ساله که وارفارین مصرف می‌کند، مدفوع سیاه و سرگیجه دارد. INR برابر 4.1 و فشار 100/60.

@why
ضدانعقاد خونریزی را بدتر می‌کند؛ باید INR را اصلاح کنیم.

@orders
- CVS / NPO / CBR; supine or semi-sitting (A: supine, head elevated)
- IV line fix. **Two large-bore lines.**
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR. Also lactate, LDH, AST/ALT/ALP, BG/Rh, VBG.
- Cardiac monitoring + pulse oximetry
- ECG (age > 40, or any cardiac history)
- CXR / abdominal film only if perforation, obstruction or foreign body is suspected.
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- Serum **N/S 1 L** IV stat (repeat per shock protocol).
- Amp **Pantoprazole 80 mg** IV stat, then **8 mg/h infusion**
- Amp Plasil (metoclopramide) 10 mg IV stat.
- Reserve **4 U P.C** and **4 U FFP**, iso-group.
- BS glucometry; NGT if indicated; I/O control
- GI (internal medicine) consult.
- Correct the coagulopathy: **FFP 10–15 mL/kg stat**
- **± Amp Vitamin K 10 mg IV stat**

@branch
if: Life-threatening bleed on warfarin
go: warfarin-bleed
