/* Bedside calculators. Reference tools only: verify against the source score and your clinical judgement.
   Types: check (adds pts), pick (select one option, each with pts), num (numeric input). */
(function (root) {
  'use strict';
  var TN = root.TN = root.TN || {};

  function pts(fields) { return fields; }
  function sum(vals, fields) {
    var s = 0;
    fields.forEach(function (f) {
      var v = vals[f.id];
      if (f.type === 'check') { if (v) s += f.pts; }
      else if (f.type === 'pick') { var o = f.opts[v == null ? 0 : v]; if (o) s += o[1]; }
    });
    return s;
  }
  function band(s, bands) { for (var i = 0; i < bands.length; i++) if (s <= bands[i][0]) return bands[i][1]; return bands[bands.length - 1][1]; }
  function n(x) { var v = parseFloat(x); return isNaN(v) ? null : v; }
  function r1(x) { return Math.round(x * 10) / 10; }

  var C = [];

  C.push({ id: 'heart', name: 'HEART score', note: 'Chest pain: risk of major adverse cardiac events at 6 weeks.',
    fields: pts([
      { id: 'h', label: 'History', type: 'pick', opts: [['Slightly suspicious', 0], ['Moderately suspicious', 1], ['Highly suspicious', 2]] },
      { id: 'e', label: 'ECG', type: 'pick', opts: [['Normal', 0], ['Non-specific repolarization disturbance', 1], ['Significant ST deviation', 2]] },
      { id: 'a', label: 'Age', type: 'pick', opts: [['< 45', 0], ['45 – 64', 1], ['≥ 65', 2]] },
      { id: 'r', label: 'Risk factors (HTN, DM, lipids, smoking, obesity, family history)', type: 'pick', opts: [['None', 0], ['1 – 2 risk factors', 1], ['≥ 3 risk factors or known atherosclerotic disease', 2]] },
      { id: 't', label: 'Troponin', type: 'pick', opts: [['≤ normal limit', 0], ['1 – 3 × normal limit', 1], ['> 3 × normal limit', 2]] }]),
    run: function (v, f) { var s = sum(v, f); return { score: s, text: band(s, [[3, 'Low risk (0–3): MACE roughly 1–2%. Early discharge may be considered with a negative serial troponin.'], [6, 'Moderate risk (4–6): MACE roughly 12–17%. Observation and further testing.'], [10, 'High risk (7–10): MACE roughly 50–65%. Early invasive strategy / admission.']]) }; } });

  C.push({ id: 'wells-pe', name: 'Wells score for PE', note: 'Pre-test probability of pulmonary embolism.',
    fields: pts([
      { id: 'a', label: 'Clinical signs of DVT (leg swelling, pain on palpation)', type: 'check', pts: 3 },
      { id: 'b', label: 'PE is the most likely diagnosis, or as likely as any other', type: 'check', pts: 3 },
      { id: 'c', label: 'Heart rate > 100', type: 'check', pts: 1.5 },
      { id: 'd', label: 'Immobilization ≥ 3 days or surgery in the previous 4 weeks', type: 'check', pts: 1.5 },
      { id: 'e', label: 'Previous PE or DVT', type: 'check', pts: 1.5 },
      { id: 'f', label: 'Hemoptysis', type: 'check', pts: 1 },
      { id: 'g', label: 'Malignancy (on treatment, treated in the last 6 months, or palliative)', type: 'check', pts: 1 }]),
    run: function (v, f) { var s = sum(v, f); return { score: s, text: (s > 4 ? 'PE likely (> 4): imaging (CT pulmonary angiography).' : 'PE unlikely (≤ 4): D-dimer first.') + ' Three-tier: ' + (s < 2 ? 'low' : s <= 6 ? 'moderate' : 'high') + ' probability.' }; } });

  C.push({ id: 'wells-dvt', name: 'Wells score for DVT', note: 'Pre-test probability of deep vein thrombosis.',
    fields: pts([
      { id: 'a', label: 'Active cancer (treatment within 6 months or palliative)', type: 'check', pts: 1 },
      { id: 'b', label: 'Paralysis, paresis or recent plaster immobilization of the leg', type: 'check', pts: 1 },
      { id: 'c', label: 'Bedridden ≥ 3 days or major surgery within 12 weeks', type: 'check', pts: 1 },
      { id: 'd', label: 'Localized tenderness along the deep venous system', type: 'check', pts: 1 },
      { id: 'e', label: 'Entire leg swollen', type: 'check', pts: 1 },
      { id: 'f', label: 'Calf swelling > 3 cm compared with the other leg', type: 'check', pts: 1 },
      { id: 'g', label: 'Pitting edema confined to the symptomatic leg', type: 'check', pts: 1 },
      { id: 'h', label: 'Collateral superficial veins (non-varicose)', type: 'check', pts: 1 },
      { id: 'i', label: 'Previously documented DVT', type: 'check', pts: 1 },
      { id: 'j', label: 'Alternative diagnosis at least as likely as DVT', type: 'check', pts: -2 }]),
    run: function (v, f) { var s = sum(v, f); return { score: s, text: s >= 3 ? 'High probability (≥ 3): compression ultrasound.' : s >= 1 ? 'Moderate probability (1–2): D-dimer or ultrasound.' : 'Low probability (≤ 0): D-dimer.' }; } });

  C.push({ id: 'perc', name: 'PERC rule', note: 'Only for patients with LOW pre-test probability of PE. If every item is absent, PE is effectively ruled out without D-dimer.',
    fields: pts([
      { id: 'a', label: 'Age ≥ 50', type: 'check', pts: 1 }, { id: 'b', label: 'Heart rate ≥ 100', type: 'check', pts: 1 },
      { id: 'c', label: 'SaO2 < 95% on room air', type: 'check', pts: 1 }, { id: 'd', label: 'Unilateral leg swelling', type: 'check', pts: 1 },
      { id: 'e', label: 'Hemoptysis', type: 'check', pts: 1 }, { id: 'f', label: 'Surgery or trauma within 4 weeks', type: 'check', pts: 1 },
      { id: 'g', label: 'Prior PE or DVT', type: 'check', pts: 1 }, { id: 'h', label: 'Hormone use (oral contraceptive, HRT, estrogen)', type: 'check', pts: 1 }]),
    run: function (v, f) { var s = sum(v, f); return { score: s, text: s === 0 ? 'PERC negative: no further PE testing if pre-test probability is truly low.' : 'PERC positive: PE is not excluded; continue the work-up (Wells, D-dimer).' }; } });

  C.push({ id: 'curb65', name: 'CURB-65', note: 'Pneumonia severity and disposition.',
    fields: pts([
      { id: 'c', label: 'Confusion (new)', type: 'check', pts: 1 }, { id: 'u', label: 'Urea > 7 mmol/L (BUN > 19 mg/dL)', type: 'check', pts: 1 },
      { id: 'r', label: 'Respiratory rate ≥ 30', type: 'check', pts: 1 }, { id: 'b', label: 'SBP < 90 or DBP ≤ 60', type: 'check', pts: 1 },
      { id: 'a', label: 'Age ≥ 65', type: 'check', pts: 1 }]),
    run: function (v, f) { var s = sum(v, f); return { score: s, text: band(s, [[1, 'Low risk (0–1): outpatient treatment may be appropriate.'], [2, 'Moderate risk (2): consider admission.'], [5, 'Severe (3–5): admit; consider ICU, especially with 4–5.']]) }; } });

  C.push({ id: 'qsofa', name: 'qSOFA', note: 'Bedside screen for poor outcome in suspected infection.',
    fields: pts([
      { id: 'r', label: 'Respiratory rate ≥ 22', type: 'check', pts: 1 }, { id: 'a', label: 'Altered mentation', type: 'check', pts: 1 },
      { id: 's', label: 'SBP ≤ 100', type: 'check', pts: 1 }]),
    run: function (v, f) { var s = sum(v, f); return { score: s, text: s >= 2 ? '≥ 2: high risk of poor outcome. Evaluate for sepsis and organ dysfunction now.' : '< 2: lower risk, but does not exclude sepsis.' }; } });

  C.push({ id: 'gcs', name: 'Glasgow Coma Scale', note: '',
    fields: pts([
      { id: 'e', label: 'Eye opening', type: 'pick', opts: [['4 Spontaneous', 4], ['3 To voice', 3], ['2 To pain', 2], ['1 None', 1]] },
      { id: 'v', label: 'Verbal response', type: 'pick', opts: [['5 Oriented', 5], ['4 Confused', 4], ['3 Inappropriate words', 3], ['2 Incomprehensible sounds', 2], ['1 None', 1]] },
      { id: 'm', label: 'Motor response', type: 'pick', opts: [['6 Obeys commands', 6], ['5 Localizes pain', 5], ['4 Withdraws', 4], ['3 Flexion (decorticate)', 3], ['2 Extension (decerebrate)', 2], ['1 None', 1]] }]),
    run: function (v, f) { var s = sum(v, f); return { score: s, text: s <= 8 ? 'Severe (≤ 8): secure the airway.' : s <= 12 ? 'Moderate (9–12).' : 'Mild (13–15).' }; } });

  var NI = function (id, label, o) { return { id: id, label: label, type: 'pick', opts: o.map(function (t, i) { return [i + ' ' + t, i]; }) }; };
  C.push({ id: 'nihss', name: 'NIHSS', note: 'Stroke severity (0–42). Scoring shortcuts shown; use the official examination instructions.',
    fields: pts([
      NI('a', '1a Level of consciousness', ['Alert', 'Drowsy (arousable)', 'Obtunded', 'Unresponsive']),
      NI('b', '1b LOC questions (month, age)', ['Both correct', 'One correct', 'None correct']),
      NI('c', '1c LOC commands (open/close eyes, grip)', ['Both correct', 'One correct', 'None correct']),
      NI('d', '2 Best gaze', ['Normal', 'Partial gaze palsy', 'Forced deviation']),
      NI('e', '3 Visual fields', ['No loss', 'Partial hemianopia', 'Complete hemianopia', 'Bilateral / blind']),
      NI('f', '4 Facial palsy', ['Normal', 'Minor', 'Partial', 'Complete']),
      NI('g', '5a Motor arm, left', ['No drift', 'Drift', 'Some effort against gravity', 'No effort against gravity', 'No movement']),
      NI('h', '5b Motor arm, right', ['No drift', 'Drift', 'Some effort against gravity', 'No effort against gravity', 'No movement']),
      NI('i', '6a Motor leg, left', ['No drift', 'Drift', 'Some effort against gravity', 'No effort against gravity', 'No movement']),
      NI('j', '6b Motor leg, right', ['No drift', 'Drift', 'Some effort against gravity', 'No effort against gravity', 'No movement']),
      NI('k', '7 Limb ataxia', ['Absent', 'One limb', 'Two limbs']),
      NI('l', '8 Sensory', ['Normal', 'Mild–moderate loss', 'Severe / total loss']),
      NI('m', '9 Best language', ['No aphasia', 'Mild–moderate', 'Severe', 'Mute / global']),
      NI('n', '10 Dysarthria', ['Normal', 'Mild–moderate', 'Severe / mute']),
      NI('o', '11 Extinction / inattention', ['None', 'One modality', 'More than one modality'])]),
    run: function (v, f) { var s = sum(v, f); return { score: s, text: band(s, [[0, 'No stroke symptoms.'], [4, 'Minor stroke (1–4).'], [15, 'Moderate stroke (5–15).'], [20, 'Moderate to severe (16–20).'], [42, 'Severe (21–42).']]) }; } });

  C.push({ id: 'cha2ds2vasc', name: 'CHA2DS2-VASc', note: 'Stroke risk in atrial fibrillation.',
    fields: pts([
      { id: 'c', label: 'Heart failure / LV dysfunction', type: 'check', pts: 1 }, { id: 'h', label: 'Hypertension', type: 'check', pts: 1 },
      { id: 'a2', label: 'Age ≥ 75', type: 'check', pts: 2 }, { id: 'd', label: 'Diabetes', type: 'check', pts: 1 },
      { id: 's', label: 'Prior stroke / TIA / thromboembolism', type: 'check', pts: 2 }, { id: 'v', label: 'Vascular disease (MI, PAD, aortic plaque)', type: 'check', pts: 1 },
      { id: 'a1', label: 'Age 65 – 74', type: 'check', pts: 1 }, { id: 'f', label: 'Female sex', type: 'check', pts: 1 }]),
    run: function (v, f) { var s = sum(v, f); return { score: s, text: s === 0 ? '0: low risk; anticoagulation generally not needed (male).' : s === 1 ? '1: consider anticoagulation.' : '≥ 2: anticoagulation recommended unless contraindicated.' }; } });

  C.push({ id: 'parkland', name: 'Parkland burn formula', note: 'Fluid in the first 24 h for burns ≥ 2nd degree. Titrate to urine output.',
    fields: [{ id: 'kg', label: 'Weight (kg)', type: 'num' }, { id: 'tbsa', label: '% TBSA burned (2nd and 3rd degree)', type: 'num' }],
    run: function (v) { var kg = n(v.kg), t = n(v.tbsa); if (kg == null || t == null) return null; var tot = 4 * kg * t; return { score: Math.round(tot) + ' mL', text: 'Ringer\'s lactate: ' + Math.round(tot / 2) + ' mL in the first 8 h (counted from the time of burn), then ' + Math.round(tot / 2) + ' mL over the next 16 h.' }; } });

  C.push({ id: 'maint', name: 'Maintenance fluid (4-2-1)', note: 'Hourly maintenance rate. Do not apply in CKD, AKI, anuria or heart failure.',
    fields: [{ id: 'kg', label: 'Weight (kg)', type: 'num' }],
    run: function (v) { var kg = n(v.kg); if (kg == null) return null; var r = kg <= 10 ? 4 * kg : kg <= 20 ? 40 + 2 * (kg - 10) : 60 + (kg - 20); return { score: r1(r) + ' mL/h', text: r1(r * 24) + ' mL per 24 h.' }; } });

  C.push({ id: 'ag', name: 'Anion gap', note: 'AG = Na − (Cl + HCO3). Normal about 8–12; add 2.5 for each 1 g/dL albumin below 4.',
    fields: [{ id: 'na', label: 'Na (mEq/L)', type: 'num' }, { id: 'cl', label: 'Cl (mEq/L)', type: 'num' }, { id: 'hco3', label: 'HCO3 (mEq/L)', type: 'num' }, { id: 'alb', label: 'Albumin (g/dL, optional)', type: 'num' }],
    run: function (v) { var na = n(v.na), cl = n(v.cl), h = n(v.hco3), a = n(v.alb); if (na == null || cl == null || h == null) return null; var g = na - cl - h, t = 'Anion gap ' + r1(g) + '. '; if (a != null) { var c = g + 2.5 * (4 - a); t += 'Albumin-corrected: ' + r1(c) + '. '; g = c; } return { score: r1(g), text: t + (g > 12 ? 'Raised: high anion gap metabolic acidosis if HCO3 is low (MUDPILES).' : 'Not raised.') }; } });

  C.push({ id: 'cca', name: 'Corrected calcium', note: 'Corrected Ca = Ca + 0.8 × (4 − albumin).',
    fields: [{ id: 'ca', label: 'Calcium (mg/dL)', type: 'num' }, { id: 'alb', label: 'Albumin (g/dL)', type: 'num' }],
    run: function (v) { var ca = n(v.ca), a = n(v.alb); if (ca == null || a == null) return null; return { score: r1(ca + 0.8 * (4 - a)) + ' mg/dL', text: 'Normal about 8.5–10.5 mg/dL.' }; } });

  C.push({ id: 'cna', name: 'Corrected sodium (hyperglycemia)', note: 'Na + 1.6 × (glucose − 100) / 100 (some use 2.4 for glucose above 400).',
    fields: [{ id: 'na', label: 'Na (mEq/L)', type: 'num' }, { id: 'glu', label: 'Glucose (mg/dL)', type: 'num' }],
    run: function (v) { var na = n(v.na), g = n(v.glu); if (na == null || g == null) return null; return { score: r1(na + 1.6 * (g - 100) / 100), text: 'With factor 2.4: ' + r1(na + 2.4 * (g - 100) / 100) + '.' }; } });

  C.push({ id: 'map', name: 'MAP and shock index', note: 'MAP = (SBP + 2 × DBP) / 3. Shock index = HR / SBP (> 0.9 raises concern).',
    fields: [{ id: 'sbp', label: 'SBP', type: 'num' }, { id: 'dbp', label: 'DBP', type: 'num' }, { id: 'hr', label: 'Heart rate', type: 'num' }],
    run: function (v) { var s = n(v.sbp), d = n(v.dbp), h = n(v.hr); if (s == null || d == null) return null; var m = (s + 2 * d) / 3, t = 'Target MAP ≥ 65 mmHg. '; if (h != null) t += 'Shock index ' + (Math.round(h / s * 100) / 100) + '.'; return { score: r1(m) + ' mmHg', text: t }; } });

  TN.CALCS = C;
  TN.calcSum = sum;
})(typeof window !== 'undefined' ? window : globalThis);
