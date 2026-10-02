@topic lac
cluster: trauma
name: Superficial skin laceration
name_fa: بریدگی سطحی پوست
source: A
keywords: suture wound cephalexin
refs: acip-tetanus-2019

@guide
# ایده کلی
بریدگی سطحی تمیز در درمانگاه اورژانس: شستشو، ترمیم با بخیه (اتاق عمل سرپایی)، پانسمان و آموزش.
# نکات
- کزاز را با سابقه واکسن تنظیم کنید [^acip-tetanus-2019].
- آنتی‌بیوتیک سیستمیک برای زخم ساده و تمیز روتین لازم نیست؛ فقط در زخم آلوده یا خرد‌شده.
- در برگه بعثت، پماد تتراسایکلین، سفالکسین و استامینوفن نوشته شده است.

@variant lac-simple
name: Outpatient superficial laceration
level: III
source: A
meta: Source A: emergency clinic case, with a prescription
refs: acip-tetanus-2019

@scenario
مردی ۲۶ ساله با چاقوی آشپزخانه ساعد را ۳ سانتی‌متر بریده است. دو ساعت پیش، خونریزی کنترل شده و حس و حرکت نرمال است. در درمانگاه اورژانس دیده می‌شود.

@why
نمونه‌ای از برگه بعثت: بخیه در اتاق عمل سرپایی و نسخه خوراکی.

@orders
- Suture in the **outpatient operating room**
-- Prescription (source A)
- Oint **Tetracycline 3%** (N = 1), every 12 h
- Cap **Cephalexin 500 mg** (N = 30), every 6 h
- Tab **Acetaminophen 500 mg** (N = 20), every 8 h

@branch
if: Tetanus status unknown or overdue
- See the [[tetanus-table|tetanus table]]
