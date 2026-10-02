@topic dyspnea
cluster: resp
name: Dyspnea — undifferentiated
name_fa: تنگی نفس (بدون تشخیص مشخص)
source: B
keywords: shortness of breath hub differential
refs: aha-pe-2026, ada-dka-2024, ssc-2026

@guide
# ایده کلی
تنگی نفس نشانه است، نه تشخیص. کار شما این است که با یک سری دستور پایه، بیمار را ایمن کنید و همزمان از روی سرنخ‌های بالینی به سمت علت بروید.
# دستورهای پایه
مانیتور، SpO2، ECG، CXR، سونوگرافی ریه (پروتکل BLUE)، آزمایش (تروپونین، D-dimer، NT-proBNP، گاز خون) و رگ‌گیری. اکسیژن فقط وقتی SpO2 زیر ۹۴٪ است؛ بیش‌اکسیژن‌دهی نکنید.
# هاب تشخیص
از روی سرنخ شاخه را انتخاب کنید:
- ویز و بازدم طولانی: آسم یا COPD
- تب و خلط: پنومونی
- ارتوپنه و خس‌خس: ادم ریه
- پهلو درد پلورتیک + ریسک لخته: آمبولی ریه [^aha-pe-2026]
- کهیر و تورم: آنافیلاکسی
- قند بالا، تنفس عمیق: DKA [^ada-dka-2024]
- فشار پایین و عفونت: سپسیس [^ssc-2026]
هر شاخه به صفحه خودش لینک دارد.

@variant dyspnea-hub
name: Pick the cause (hub)
level: II
source: B
meta: Imp: Dyspnea, R/O asthma attack, PTE, MI, decompensated CHF, pneumonia · C: II · NPO · CBR · semi-sitting or sitting
refs: ada-dka-2024

@scenario
مردی ۶۰ ساله با تنگی نفس آمده و هنوز علت مشخص نیست. تنفس 28 در دقیقه، SpO2 89٪ در هوای اتاق. دستورهای پایه را شروع کنید و با سرنخ‌ها (ویز، تب، تورم پا، درد قفسه، سابقه) شاخه درست را انتخاب کنید.

@why
وقتی تشخیص روشن نیست، یک مجموعه پایه می‌چینیم و از هاب به صفحه بیماری مناسب می‌رویم.

@orders
- CVS / NPO / CBR
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, **Troponin (0, 6 h)**, **D-dimer**, **NT-proBNP**, ABG, BS
- HM, PO
- O2 by nasal cannula 4–6 L/min **if SpO2 ≤ 94%**
- CXR
- **Blue-protocol lung ultrasound** (by emergency resident)
- IV line fix; N/S 1 L IV stat
- Amp Ranitidine 50 mg IV stat
- BS glucometry
- ECG
- Bed-side guard up + fixed relative

@branch
if: Suspect **asthma**: wheeze, prolonged expiration
go: asthma-mild-mod, asthma-severe

@branch
if: Suspect **COPD** exacerbation
go: copd-modsevere, copd-mild

@branch
if: Suspect **pneumonia**: fever, sputum, infiltrate
go: pna-cap, pna-severe

@branch
if: Suspect **pulmonary edema / decompensated CHF**
go: ape-perfused, ape-hypoperfused

@branch
if: Suspect **MI**
- Follow the ACS orders, and request **fibrinolytic (reteplase)** + emergency cardiology for PCI and transfer
go: acs-stable, acs-stemi

@branch
if: Suspect **PE** (moderate / high pretest risk)
- Start **anticoagulation** in moderate / high-risk patients
- CT lung with **PE protocol**, once BUN/Cr is back

@branch
if: Suspect **anaphylaxis**
- Amp **Epinephrine 0.3 mg IM**
go: angio-allergic

@branch
if: **Flail chest / pneumothorax**
- Request surgery visit; chest-tube equipment at the bedside

@branch
if: Suspect **DKA**
- DKA: N/S 1 L/h, regular insulin 0.1 U/kg/h once K ≥ 3.3, K replacement per level, hourly glucose, VBG/BMP every 2–4 h [^ada-dka-2024]

@branch
if: Suspect **epiglottitis**
- Intubation equipment ready; **broad-spectrum antibiotics** (Tazocin + vancomycin)

@branch
if: **Cardiac tamponade**: muffled heart sounds, low BP, raised JVP
- Emergency ultrasound / echo
- Pericardiocentesis equipment at the bedside

@branch
if: **Organophosphate poisoning**
- **Atropine** repeated until lung secretions dry
- **Pralidoxime**
- Consider intubation

@branch
if: **CO poisoning**
- O2 by mask with reservoir bag **15 L/min**; consider intubation

@branch
if: Ingestion of a toxic substance with dyspnea
- Consider **prophylactic intubation**; request surgery visit

@branch
if: **CVA, Guillain–Barré, myasthenia gravis, tick paralysis**
- Brain CT and necessary measures
go: weakness-hub

@branch
if: **SBP ≤ 90**
- **RUSH exam**

@branch
if: **Abdominal sepsis / systemic sepsis**
- **Broad-spectrum antibiotics** and surgery consult

@branch
if: **GI bleeding**
- Vital-sign measures, IV fluid, **FFP + P.C** and octreotide as needed
go: gib-massive

@notes
- در موارد شک به آسم: رجوع به دستورات آسم. در موارد شک به COPD: رجوع به دستورات COPD. در موارد شک به پنومونی: رجوع به دستورات پنومونی.
- در موارد شک به PTE: آنتی‌کوآگولان در موارد ریسک متوسط و بالا شروع شود و CT ریه با پروتکل PTE با آماده بودن جواب BUN/Cr درخواست شود.
- در موارد مسمومیت با ارگانوفسفره: تجویز آتروپین تا خشک شدن ترشحات ریوی، تجویز پرالیدوکسیم و مدنظر قرار داشتن اینتوباسیون.
- در موارد مسمومیت با CO: درخواست اکسیژن با ماسک رزروبگ ۱۵ لیتر در دقیقه و مدنظر قرار داشتن اینتوباسیون.
- در موارد شک به CVA، گیلن باره، میاستنی گراویس و فلج تیک: Brain CT و اقدامات لازم.
