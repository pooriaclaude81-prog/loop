@topic pabd
cluster: trauma
name: Penetrating abdominal trauma
name_fa: ترومای نافذ شکم
source: B
keywords: stab wound gunshot evisceration
refs: atls-11, east-pabd-2010

@guide
# ایده کلی
زخم نافذ شکم (چاقو، گلوله) می‌تواند به عروق و احشا آسیب بزند. اول وضعیت همودینامیک مهم است، نه نوع زخم [^atls-11].
# سه مسیر
- **ناپایدار** (فشار زیر ۹۰، خونریزی فعال، کاهش هوشیاری، خروج روده، پریتونیت، چاقوی باقی‌مانده): اتاق احیا، رگ بزرگ، مایع/خون، eFAST و جراحی اورژانس.
- **پایدار با زخم عمیق یا نامشخص:** CT شکم و لگن با کنتراست وریدی، eFAST، آزمایش، پایش.
- **پایدار با زخم بسیار سطحی که کف آن دیده می‌شود:** بررسی موضعی و ترمیم ساده؛ آزمایش کامل و CT لازم نیست [^east-pabd-2010].
# همیشه
کزاز، آنتی‌بیوتیک (سفازولین)، مسکن، NPO و مشاوره جراحی در هر شک.

@variant pabd-unstable
name: Unstable → resuscitation
level: I
source: B
meta: Imp: Penetrating abdominal trauma · C: II (→ Level I when unstable) · NPO · CBR · supine
refs: atls-11

@scenario
جوانی ۲۴ ساله با چاقو به پهلوی چپ بالای شکم زخمی شده است. فشار 76/40، نبض 132، رنگ‌پریده و خواب‌آلود، روده‌اش از زخم بیرون زده و شکمش سفت است. خونریزی فعال دارد و ممکن است چاقو هنوز داخل شکم باشد.

@why
ناپایدار است؛ هم‌زمان احیا و جراحی اورژانس، نه انتظار برای آزمایش.

@orders
- **Move at once to the resuscitation room**; ATLS protocol; resuscitation + intubation equipment ready
- CVS / NPO / CBR; supine
- IV line ×2 **large**
- Serum N/S **1 L free**
- eFAST
- Labs: CBC/diff, BUN/Cr, Na, K, VBG, BG/Rh, UA, amylase, lipase, AST, ALT, ALP, Bili T/D, CPK, LDH. **Lactate** in unstable patients.
- HM, PO (cardiac monitor, pulse oximetry)
- O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%
- Portable CXR
- NGT fix; Foley catheter fix
- Reserve **4 units P.C** (iso-group, iso-Rh) and **4 units FFP**
- Amp **Morphine sulfate 3 mg** IV slow over 2 min (not in asthma / COPD)
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- Amp **Cefazolin 1 g** IV infusion
- Amp Ranitidine 50 mg IV stat
- Hb/Hct every 6 h; control I/O; ECG; **cervical collar** fix; protected bed with fixed relative
- Emergency **surgery visit**; to the emergency OR for wound exploration

@branch
if: **Unstable** = SBP < 90, active bleeding, ↓LOC, bowel outside the abdomen, peritonitis signs (tenderness, rebound, guarding, rigidity), knife or foreign body in the abdomen
- Resuscitation room + emergency surgery visit at the same time

@branch
if: Any trauma patient with SBP < 90, respiratory distress needing intubation, or penetrating trauma to neck, chest, abdomen or proximal limbs, or GCS ≤ 8
- Request emergency surgery visit

@branch
if: Associated head injury (as printed on this page of the source)
- Brain CT; neurosurgery after the CT; move only with the resuscitation team
- If intubated: Amp **Phenytoin 1 g** IV in 250 mL N/S over 30 min, **ECG first** to check for pre-existing blocks

@branch
if: Deformed limbs
- X-ray of the limbs, but **first examine vessels and nerves**. If pulses or neurological exam are abnormal: surgery and orthopedics visit.

@branch
if: Women of childbearing age
- **βHCG**

@branch
if: Elderly with chest trauma
- **Troponin**

@notes
- اگر بیمار ناپایدار است یعنی فشارخون کمتر از ۹۰ میلی‌متر جیوه دارد، خونریزی فعال از شکم دارد، کاهش سطح هوشیاری دارد، روده‌های بیمار از شکم بیرون است، علائم پریتونیت، تندرنس، ریباند تندرنس، گاردینگ و رژیدیتی دارد، چاقو یا جسم خارجی درون شکم مانده است بیمار فوراً به اتاق احیا برده شود و همزمان ویزیت اورژانس سرویس محترم جراحی درخواست شود.
- در هر بیمار ترومایی با BP<90، دیسترس تنفسی که نیاز به اینتوباسیون دارد یا ترومای نافذ با گلوله به گردن، توراکس، شکم، پروگزیمال اندام‌ها و GCS ≤ 8 ویزیت اورژانس سرویس محترم جراحی درخواست شود.
- در موارد ناپایداری لاکتات چک شود.

@variant pabd-stable-deep
name: Stable, deep or unclear wound → CT
level: II
source: B
meta: Imp: Penetrating abdominal trauma · C: II · stable
refs: east-pabd-2010

@scenario
مردی ۳۰ ساله با چاقو به پهلوی راست زخمی شده است. فشار 126/80، نبض 90 و هوشیار با حساسیت خفیف. عمق و کف زخم دیده نمی‌شود و پریتوئن ممکن است سوراخ شده باشد.

@why
پایدار ولی زخم عمیق یا نامشخص است؛ CT شکم و لگن با کنتراست و پایش.

@orders
- CVS / NPO / CBR; supine
- Labs: CBC/diff, BUN/Cr, Na, K, VBG, BG/Rh, UA, amylase, lipase, AST, ALT, ALP, Bili T/D, CPK, LDH
- HM, PO (cardiac monitor, pulse oximetry)
- O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%
- **Abdominal and pelvic CT with IV contrast**
- IV line ×2 large; Serum N/S 1 L free **if indicated**
- **eFAST**
- Upright CXR **after the patient is stable**
- NGT, Foley **if indicated**
- Reserve P.C and FFP **if indicated**
- Amp **Morphine sulfate 3 mg** IV slow over 2 min
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- Amp **Cefazolin 1 g** IV infusion
- After stabilization and the orders above, **transfer to the emergency OR for exploration** of the wound
- Amp Ranitidine 50 mg IV stat; Hb/Hct every 6 h; control I/O; ECG; **collar** fix; protected bed with relative

@branch
if: Patient is **stable** and the wound depth and base are **not clear**, or the wound is **deep / penetrates the abdomen**
- **CT of the abdomen and pelvis with IV contrast**

@branch
if: **Pelvic X-ray** (PXR)
- If he has **not walked**, or has **lower abdominal tenderness**

@branch
if: Suspected foreign body (knife etc.) in the abdomen
- **Abdominal X-ray AP and lateral**

@branch
if: Patient becomes unstable
- **Portable CXR**
go: pabd-unstable

@branch
if: Young, no cardiac history, no chest trauma or chest pain
- **No ECG needed**

@branch
if: Severe trauma elsewhere or any neck finding (neck tenderness, focal deficit, intoxication, ↓LOC, long-bone fractures = NEXUS)
- Fix a cervical collar and request a neck AP / lateral film

@branch
if: Severe bleeding or hemodynamic instability
- Reserve **P.C and FFP**

@branch
if: Asthma or COPD
- **No morphine**

@variant pabd-superficial
name: Superficial wound, base visible
level: III
source: B
meta: Imp: Penetrating abdominal trauma, superficial
refs: east-pabd-2010

@scenario
مردی ۲۲ ساله زخم بسیار سطحی ۲ سانتی‌متری چاقو در دیواره راست شکم دارد. کف زخم دیده می‌شود، زخم کم‌عمق و پریتوئن سالم است. علائم حیاتی نرمال و شکم نرم است.

@why
زخم سطحی است؛ آزمایش کامل و CT لازم نیست و ترمیم ساده کافی است.

@orders
- CVS / NPO / CBR; supine
- Local wound exploration at the bedside; **simple repair**
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- Amp **Cefazolin 1 g** IV infusion (if laceration)

@branch
if: Wound base visible, wound shallow, peritoneum intact
- **No need for full laboratory tests**
- **No abdominal CT with contrast**
- **No NGT or Foley**

@branch
if: Wound or peritoneal breach is deep or unclear
go: pabd-stable-deep

@notes
- اگر زخم شکم بیمار بسیار سطحی است و کف زخم مشخص است و عمق زخم زیاد نیست و از پریتوئن رد نشده است نیازی به ارسال آزمایشات کامل نمی‌باشد.
