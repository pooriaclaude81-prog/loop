@topic blunt
cluster: trauma
name: Blunt limb trauma
name_fa: ترومای بلانت اندام
source: B
keywords: fracture splint sedation reduction compartment
refs: acep-psa-2014

@guide
# ایده کلی
ضربه به اندام می‌تواند شکستگی، دررفتگی یا آسیب عروق و اعصاب بدهد. اولویت اول بررسی نبض، حس و حرکت است [^acep-psa-2014].
# سه مسیر
- **نورووسکولار سالم:** گرافی (دو نما)، آتل مناسب، مسکن، یخ و بالا نگه داشتن.
- **اختلال نورووسکولار یا سندروم کمپارتمان:** اورژانس عضو؛ جاانداختن یا آتل‌گیری فوری و جراحی/ارتوپدی.
- **نیاز به جااندازی با آرام‌بخشی:** رگ، مانیتور، و فردی با مهارت راه هوایی؛ بدون رزیدنت ارشد دارو تزریق نمی‌شود.
# نکته
اسکافوئید را اگر در snuffbox تندرنس هست با نمای اختصاصی ببینید؛ اگر گرافی نرمال ولی شک بالاست CT یا آتل و پیگیری.

@variant blunt-intact
name: Neurovascularly intact: splint
level: III
source: B
meta: Imp: Blunt limb injury · C: III · NPO · CBR/RBR · supine or sitting
refs: acep-psa-2014

@scenario
مردی ۳۰ ساله روی دست باز افتاده است. مچ متورم و دردناک، تندرنس در snuffbox و نبض، حس و حرکت نرمال دارد.

@why
نورووسکولار سالم است؛ گرافی با نمای مناسب و آتل.

@orders
- CVS / NPO / RBR (source: CBR); supine or sitting
- IV line, **if** reduction / sedation / severe pain / neurovascular disorder is expected
- Amp **Morphine 3 mg** IV stat, slow over 2 min (severe pain; watch for respiratory depression)
- Serum N/S 500 mL IV infusion (if the above needs IV access)
- **Ice pack and limb elevation**
- X-rays **after the patient is stable**
- Transfer to the **plaster room** for splinting and reduction, if needed

@branch
if: X-ray views
- **X-ray views**: wrist, forearm, elbow, arm, ankle, leg, knee, thigh = AP + lateral. Palm and foot = AP + oblique. Tenderness in the anatomical snuffbox = **scaphoid view**. Elbow = true lateral. Lisfranc injury = lateral weight-bearing foot view (MRI confirms). Calcaneus = calcaneal view. Lateral malleolus = AP + lateral + **mortise view**. Knee = patellar and tunnel views.

@branch
if: Mild or no pain
- No analgesic needed; or **Acetaminophen + Gelofen (ibuprofen)** tablets

@branch
if: Severe pain
- An opioid (and watch for apnea)

@branch
if: **Splint choice**
- Proximal / middle phalanges (not thumb, not great toe): **Buddy taping**
- Great toe: **Toe plate**; thumb: **thumb spica**
- Palm, wrist, distal forearm: **short volar splint**
- Mid / proximal forearm, elbow, distal humerus: **long arm splint**
- Proximal humerus and mid / distal humerus: **U-slab**
- Shoulder, clavicle: **arm sling**
- Foot and ankle: **short leg splint**; leg: **short or long leg splint**; knee: **cylinder splint**

@branch
if: Labs
- No labs for a simple trauma. Labs only if emergency surgery or a life-saving act is possible.

@branch
if: CT without contrast
- Normal films but suspected **occult fracture**, **inability to bear weight** (lower limb), severe wrist or elbow tenderness with impaired ROM, or occult shoulder / pelvis fracture

@branch
if: Neurovascular disorder
go: blunt-nv

@branch
if: Needs reduction under sedation
go: blunt-reduction

@notes
- در صورت درد خفیف و یا نبود درد نیازی به تجویز مسکن نیست. در موارد درد خفیف می‌توان از قرص استامینوفن همراه با قرص ژلوفن (بروفن) استفاده کرد. در صورت موارد درد شدید از مخدر استفاده شود و البته مراقب عوارض ناشی از مخدر از جمله احتمال آپنه تنفسی باشیم.

@variant blunt-nv
name: Neurovascular compromise / compartment syndrome
level: II
source: B
meta: Imp: Blunt limb injury with neurovascular disorder · C: II (limb threatened)
refs: atls-11

@scenario
مردی ۲۵ ساله با شکستگی سوپراکندیلار هومروس، نبض رادیال لمس نمی‌شود، دست سرد و رنگ‌پریده و انگشتان بی‌حس است. یا دررفتگی زانو با پای کبود. قطع عضو قریب‌الوقوع است.

@why
اورژانس نجات عضو است؛ جااندازی یا آتل فوری و ارتوپدی/جراحی.

@orders
- CVS / NPO / RBR (source: CBR); supine or sitting
- IV line, **if** reduction / sedation / severe pain / neurovascular disorder is expected
- Amp **Morphine 3 mg** IV stat, slow over 2 min (severe pain; watch for respiratory depression)
- Serum N/S 500 mL IV infusion (if the above needs IV access)
- **Ice pack and limb elevation**
- **Emergency limb-saving measures**
- **Immediate transfer to the OR** for reduction of the dislocation or splinting and immobilization
- **Emergency surgery or orthopedics visit**
- Labs: Na, K, PT, PTT, INR, BUN/Cr, CBC/diff
- **Arterial color-Doppler ultrasound** of the same limb if vascular findings; **CT angiography** if indicated

@branch
if: Abnormal pulse, or abnormal sensory / motor exam → **Level II**. **Cyanosis**, obvious deformity with perfusion disorder, **compartment syndrome**, or joint dislocation with **imminent amputation** → emergency OR.
- Emergency limb-saving steps, OR, surgery / ortho visit

@branch
if: **Soft or hard signs** (see the penetrating-limb pages)
go: plimb-soft, plimb-hard

@variant blunt-reduction
name: Reduction under sedation (PSA)
level: II
source: B
meta: Imp: Blunt limb injury needing reduction and procedural sedation
refs: acep-psa-2014

@scenario
مردی ۴۰ ساله با شکستگی جابه‌جاشده انتهای رادیوس که برای جااندازی و گچ‌گیری آمده و درد شدید دارد.

@why
جااندازی با آرام‌بخشی (PSA) لازم است؛ رگ، مانیتور و فرد مسلط به راه هوایی.

@orders
- CVS / NPO / RBR (source: CBR); supine or sitting
- IV line, **if** reduction / sedation / severe pain / neurovascular disorder is expected
- Amp **Morphine 3 mg** IV stat, slow over 2 min (severe pain; watch for respiratory depression)
- Serum N/S 500 mL IV infusion (if the above needs IV access)
- **Ice pack and limb elevation**
- Transfer to the plaster room / OR
-- At the bedside, ready (coordinate with the emergency specialist)
- Amp **Ketamine 150 mg** ready **or** Amp **Fentanyl 100 µg** ready **or** **Nesdonal (thiopental) 300 mg** ready
- Ambu bag, oral airway, suction, HM, PO, Amp Ondansetron, airway-management equipment for PSA
- Take a history of heart and lung disease, drug sites, and **previous difficult intubation**

@branch
if: IV line for **reduction**, a fracture with **severe pain** that needs splint or cast, **PSA**, or a neurovascular disorder
- Secure the IV line
