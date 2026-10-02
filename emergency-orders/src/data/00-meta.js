C({id:'cardiac',name:'1 · Cardiac & resuscitation'});
C({id:'resp',name:'2 · Respiratory'});
C({id:'neuro',name:'3 · Neurology'});
C({id:'collapse',name:'4 · Collapse & altered consciousness'});
C({id:'tox',name:'5 · Toxicology, envenomation & allergy'});
C({id:'gi',name:'6 · GI & abdomen'});
C({id:'renal',name:'7 · Renal, urologic, metabolic & infection'});
C({id:'trauma',name:'8 · Trauma, burns & ENT'});
C({id:'vasc',name:'9 · Vascular'});

/* cardiac */
T({id:'arrest',cluster:'cardiac',name:'Cardiac arrest',src:'A',kw:'cpr vf vt pea asystole shock epinephrine amiodarone acls',desc:'Source A has one VF case. The non-shockable pathway is not in either source and is added from the AHA ACLS guideline (flagged).'});
T({id:'svt',cluster:'cardiac',name:'AVNRT / SVT',src:'A',kw:'adenosine verapamil cardioversion tachycardia narrow complex'});
T({id:'acs',cluster:'cardiac',name:'Acute coronary syndrome (ACS)',src:'B',kw:'mi stemi nstemi chest pain aspirin plavix heparin enoxaparin nitroglycerin troponin'});
T({id:'chestpain',cluster:'cardiac',name:'Chest pain — atypical / red flags',src:'B',kw:'dissection tamponade pneumothorax pe esophageal rupture'});
T({id:'ape',cluster:'cardiac',name:'Acute pulmonary edema',src:'AB',kw:'chf heart failure lasix furosemide nitroglycerin tng morphine norepinephrine dhf'});

/* resp */
T({id:'dyspnea',cluster:'resp',name:'Dyspnea — undifferentiated',src:'B',kw:'shortness of breath hub differential'});
T({id:'asthma',cluster:'resp',name:'Asthma attack',src:'B',kw:'salbutamol atrovent pulmicort magnesium wheeze bronchospasm'});
T({id:'copd',cluster:'resp',name:'COPD exacerbation',src:'B',kw:'bipap niv intubation ventilator salbutamol steroid'});
T({id:'pna',cluster:'resp',name:'Pneumonia',src:'B',kw:'cap hcap aspiration pcp aids ceftriaxone azithromycin levofloxacin vancomycin'});

/* neuro */
T({id:'stroke',cluster:'neuro',name:'Acute stroke (CVA)',src:'AB',kw:'cva ischemic hemorrhagic alteplase tpa labetalol fnd'});
T({id:'seizure',cluster:'neuro',name:'Seizure',src:'AB',kw:'status epilepticus phenytoin diazepam depakin valproate levetiracetam'});
T({id:'headache',cluster:'neuro',name:'Headache',src:'B',kw:'sah cluster migraine temporal arteritis'});
T({id:'vertigo',cluster:'neuro',name:'Vertigo',src:'B',kw:'dizziness bppv central peripheral cerebellar'});

/* collapse */
T({id:'syncope',cluster:'collapse',name:'Syncope',src:'AB',kw:'faint collapse loss of consciousness'});
T({id:'loc',cluster:'collapse',name:'Decreased level of consciousness',src:'B',kw:'coma gcs naloxone thiamine meningitis hub'});
T({id:'weakness',cluster:'collapse',name:'Generalized weakness',src:'B',kw:'gbs myasthenia botulism tick paralysis hub'});
T({id:'hypoglycemia',cluster:'collapse',name:'Hypoglycemia',src:'A',kw:'dextrose low blood sugar diabetic'});

/* tox */
T({id:'meoh',cluster:'tox',name:'Methanol / ethylene glycol poisoning',src:'A',kw:'fomepizole ethanol alcohol dialysis'});
T({id:'opioid',cluster:'tox',name:'Opioid toxicity',src:'B',kw:'naloxone overdose methadone charcoal'});
T({id:'warfarin',cluster:'tox',name:'Warfarin toxicity / high INR',src:'B',kw:'inr vitamin k ffp pcc anticoagulant bleeding'});
T({id:'snake',cluster:'tox',name:'Snake bite',src:'A',kw:'antivenom envenomation'});
T({id:'angio',cluster:'tox',name:'Angioedema / anaphylaxis',src:'A',kw:'allergy epinephrine acei hereditary c1 glucagon'});

/* gi */
T({id:'gib',cluster:'gi',name:'GI bleeding',src:'AB',kw:'hematemesis melena pantoprazole octreotide varices blakemore transfusion'});
T({id:'he',cluster:'gi',name:'Hepatic encephalopathy',src:'B',kw:'lactulose cirrhosis ammonia sbp'});
T({id:'panc',cluster:'gi',name:'Acute pancreatitis',src:'AB',kw:'amylase lipase epigastric pain'});
T({id:'epig',cluster:'gi',name:'Epigastric / RUQ pain — undifferentiated',src:'B',kw:'cholecystitis cholangitis perforation aaa mesenteric hub'});
T({id:'sbo',cluster:'gi',name:'Small bowel obstruction',src:'B',kw:'sbo ileus ngt vomiting'});
T({id:'lbo',cluster:'gi',name:'Large bowel obstruction',src:'B',kw:'lbo volvulus pseudo-obstruction'});
T({id:'rlq',cluster:'gi',name:'RLQ pain / appendicitis',src:'B',kw:'appendicitis ultrasound ct pregnant torsion'});
T({id:'hiccup',cluster:'gi',name:'Persistent hiccup',src:'A',kw:'baclofen'});

/* renal */
T({id:'colic',cluster:'renal',name:'Renal colic',src:'AB',kw:'kidney stone ketorolac morphine flank pain'});
T({id:'aki',cluster:'renal',name:'Acute kidney injury (AKI)',src:'B',kw:'prerenal postrenal dialysis oliguria'});
T({id:'rhabdo',cluster:'renal',name:'Rhabdomyolysis',src:'A',kw:'cpk myoglobin bicarbonate fluids'});
T({id:'hyperk',cluster:'renal',name:'Hyperkalemia',src:'B',kw:'potassium calcium gluconate insulin salbutamol'});
T({id:'permcath',cluster:'renal',name:'Permcath (dialysis catheter) dysfunction',src:'B',kw:'alteplase reteplase hemodialysis catheter'});
T({id:'pyelo',cluster:'renal',name:'Pyelonephritis',src:'B',kw:'uti urinary infection ciprofloxacin ceftriaxone'});
T({id:'retention',cluster:'renal',name:'Acute urinary retention',src:'A',kw:'bph foley tamsulosin'});
T({id:'dfoot',cluster:'renal',name:'Diabetic foot infection',src:'AB',kw:'gangrene clindamycin meropenem vancomycin ulcer'});

/* trauma */
T({id:'pabd',cluster:'trauma',name:'Penetrating abdominal trauma',src:'B',kw:'stab wound gunshot evisceration'});
T({id:'pchest',cluster:'trauma',name:'Penetrating chest trauma',src:'B',kw:'stab chest tube pneumothorax hemothorax'});
T({id:'face',cluster:'trauma',name:'Facial trauma',src:'B',kw:'lefort nasal fracture mandible maxilla'});
T({id:'head',cluster:'trauma',name:'Head trauma',src:'AB',kw:'gcs brain ct herniation mannitol ich skull fracture'});
T({id:'mt',cluster:'trauma',name:'Multiple trauma',src:'B',kw:'polytrauma atls tranexamic pelvis'});
T({id:'neck',cluster:'trauma',name:'Neck trauma',src:'B',kw:'hard signs soft signs nexus collar cta'});
T({id:'blunt',cluster:'trauma',name:'Blunt limb trauma',src:'B',kw:'fracture splint sedation reduction compartment'});
T({id:'plimb',cluster:'trauma',name:'Penetrating limb trauma',src:'B',kw:'open fracture hard signs gentamicin'});
T({id:'shoulder',cluster:'trauma',name:'Shoulder dislocation',src:'B',kw:'reduction sedation nerve block'});
T({id:'mandible',cluster:'trauma',name:'Mandible dislocation',src:'B',kw:'jaw reduction barton'});
T({id:'burn',cluster:'trauma',name:'Burns',src:'A',kw:'parkland escharotomy vitamin c inhalation'});
T({id:'lac',cluster:'trauma',name:'Superficial skin laceration',src:'A',kw:'suture wound cephalexin'});
T({id:'epi',cluster:'trauma',name:'Epistaxis',src:'B',kw:'nosebleed packing silver nitrate ent'});
T({id:'tetanus',cluster:'trauma',name:'Tetanus prophylaxis (shared table)',src:'B',kw:'td tetabulin vaccine immunoglobulin wound'});

/* vasc */
T({id:'ali',cluster:'vasc',name:'Arterial occlusion (acute limb ischemia)',src:'A',kw:'embolism thrombosis doppler pulseless'});
