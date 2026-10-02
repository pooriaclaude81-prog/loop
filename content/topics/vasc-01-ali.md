@topic ali
cluster: vasc
name: Arterial occlusion (acute limb ischemia)
name_fa: انسداد حاد شریانی (ایسکمی حاد اندام)
source: A
keywords: embolism thrombosis doppler pulseless
refs: acc-pad-2024, esvs-ali-2020

@guide
# ایده کلی
قطع ناگهانی جریان شریانی اندام (آمبولی یا ترومبوز) یک اورژانس زمان‌دار است؛ حدود ۶ ساعت فرصت برای نجات عضو وجود دارد [^esvs-ali-2020].
# نشانه‌ها (6 P)
درد، رنگ‌پریدگی، نبود نبض، پارستزی، فلج، سردی. از دست رفتن حس یا حرکت یعنی عضو در خطر است.
# منطق دستورها
- مایع وریدی، آزمایش انعقادی و ECG (فیبریلاسیون دهلیزی منبع آمبولی است).
- **سونوگرافی داپلر رنگی** برای تأیید.
- **هپارین وریدی** فوراً و مشاوره فوری جراحی عروق برای بازگشایی (آمبولکتومی، ترومبولیز یا بای‌پس) [^acc-pad-2024].

@variant ali-std
name: Acute limb ischemia
level: II
source: A
meta: Imp: arterial occlusion · Diet: NPO
refs: acc-pad-2024

@scenario
مردی ۴۶ ساله (نمونه نوشته‌شده در برگه) چهار ساعت است درد ناگهانی و سردی پای چپ دارد. پا رنگ‌پریده و سرد و نبض پشت پا لمس نمی‌شود؛ سابقه فیبریلاسیون دهلیزی دارد. به آمبولی یا ترومبوز شریانی شک می‌شود.

@why
ایسکمی حاد اندام است؛ هر دقیقه ارزشمند است: تأیید، هپارین و جراح عروق.

@orders
- Diet: NPO
- IV line fix
- Serum N/S **500 mL** IV stat
- Labs: CBC/diff, **PT, PTT, INR**, BUN, Cr, Na, K, BS, **ESR, CRP**
- ECG
- **Color-Doppler ultrasound of the lower limb**
-- Added from the guidelines
- Assess the **6 Ps** (pain, pallor, pulselessness, paresthesia, paralysis, poikilothermia) and classify viability (Rutherford). **Motor loss or loss of Doppler signals = threatened limb** [^acc-pad-2024]
- **Unfractionated heparin IV bolus (e.g. 80 U/kg or 5,000 U), then infusion** per protocol, started immediately unless contraindicated [^acc-pad-2024]
- **Urgent vascular surgery consult** for revascularization (embolectomy, thrombolysis or bypass) [^acc-pad-2024]
- Analgesia, keep the limb **level or slightly dependent**, avoid heat or ice [^acc-pad-2024]
- CT angiography if it does not delay revascularization [^acc-pad-2024]

@branch
if: Limb threatened (sensory loss, weakness, no Doppler signal)
- Emergency revascularization; the most urgent consult in the department [^acc-pad-2024]

@branch
if: Prior to the above, to prevent an embolus source
- Look for atrial fibrillation on the ECG and cardiac source (echo) [^acc-pad-2024]
