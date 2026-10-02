@topic weakness
cluster: collapse
name: Generalized weakness
name_fa: ضعف عمومی
source: B
keywords: gbs myasthenia botulism tick paralysis hub
refs: ada-soc-2026, kdigo-potassium-2020, aha-ais-2026

@guide
# ایده کلی
«ضعف» یک شکایت مبهم است که پشت آن علل خطرناک می‌تواند باشد. دستورهای پایه گسترده‌اند چون علت‌های زیادی دارد.
# فهرست علل مهم
- سکته مغزی [^aha-ais-2026]
- گیلن‌باره، میاستنی، بوتولیسم، فلج کنه (نوروماسکولار)
- مسمومیت‌ها
- رابدومیولیز
- دهیدراتاسیون، افت قند [^ada-soc-2026]
- اختلال الکترولیت (پتاسیم) [^kdigo-potassium-2020]
- کم‌خونی، ایسکمی قلبی، سپسیس
# در سالمندان
شایع‌ترین علل: اختلال الکترولیت، علل قلبی، عفونت ریه و ادراری، دلیریوم، کم‌خونی، مصرف چند دارو و بدخیمی.

@variant weakness-hub
name: Work-up and branches (hub)
level: II
source: B
meta: Imp: Generalized weakness · C: II (may be I, II or III) · ABC first
refs: ada-soc-2026

@scenario
خانمی ۷۰ ساله سه روز است احساس ضعف می‌کند و امروز نمی‌تواند از روی صندلی بلند شود. اشتها ندارد و اسهال خفیف داشته است. فشار 100/60، نبض 98 و بدون تب. پنج دارو مصرف می‌کند.

@why
ضعف علل زیادی دارد؛ دستورهای پایه گسترده‌اند و هاب به صفحه علت احتمالی می‌برد.

@orders
- CVS / NPO / CBR; **ABC** done first (airway, breathing, circulation secured)
- IV line fix; N/S 1 L every 12 h
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, CPK, LDH, Trop, VBG, UA, U/C, ESR, CRP, **blood culture**, AST, ALT, ALP
- PO & HM
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%
- Bed-side guard + fixed relative
- CXR; brain CT; ECG; BS glucometry
- Amp Ranitidine 50 mg IV stat
- Amp **Apotel (acetaminophen) 1 g** IV infusion if T ≥ 37.8 °C

@branch
if: Focal deficit, face / arm / leg weakness, speech change
go: stroke-initial

@branch
if: Dark urine, muscle pain, high CPK
go: rhabdo-std

@branch
if: Low BS
go: hypoglycemia-bs

@branch
if: High K, low K, other electrolyte disorder
go: hyperk-ecg

@branch
if: Sepsis / infection
go: pna-cap, pyelo-uncomp

@branch
if: Cardiac ischemia
go: acs-stable

@branch
if: Dehydration, anemia
- Treat accordingly (fluids; transfusion if Hb < 8)

@branch
if: **Guillain–Barré, myasthenic crisis, botulism, tick paralysis**

@branch
if: Poisoning
- Toxin screen; see the toxicology cluster
go: opioid-resp, meoh-base

@branch
if: **Elderly**: the commonest causes are electrolyte disorders, cardiac causes, lung and urinary infection, delirium, anemia, polypharmacy, malignancy
- Think of these first

@notes
- تشخیص‌های افتراقی مهم: CVA، گیلن باره، کریز میاستنی، بوتولیسم، فلج تیک، مسمومیت‌ها، رابدومیولیز، دهیدراتاسیون، افت BS، اختلالات الکترولیت، آنمی، ایسکمی قلبی، سپسیس.
- شایع‌ترین علل ضعف ژنرالیزه در افراد مسن: اختلال الکترولیت، علل قلبی، عفونت‌های ریه و ژنیتویورینری، دلیریوم، آنمی، اختلالات مصرف داروهای متعدد و بدخیمی.
