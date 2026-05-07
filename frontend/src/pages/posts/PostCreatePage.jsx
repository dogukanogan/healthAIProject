import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { postsApi } from '../../services';
import { moderatePost } from '../../utils/contentModeration';
import './PostForm.css';

const DOMAINS    = ['Cardiology','Radiology','Emergency Medicine','Psychiatry','Geriatrics','Oncology','Neurology','Orthopedics','Dermatology','Other'];
const STAGES     = [{value:'idea',label:'Idea'},{value:'concept_validation',label:'Concept Validation'},{value:'prototype',label:'Prototype Developed'},{value:'pilot_testing',label:'Pilot Testing'},{value:'pre_deployment',label:'Pre-Deployment'}];
const COMMITMENT = ['Full-time','Part-time (10h/week)','Part-time (5h/week)','Advisor (2h/week)'];
const COLLAB     = ['Research Partner','Co-Founder','Advisor','Contractor'];

const EMPTY = {
  title:'', domain:'', description:'', expertiseRequired:'',
  city:'', country:'', projectStage:'', commitmentLevel:'',
  collaborationType:'', confidentiality:'Public pitch — details in meeting',
  expiryDate:'', status:'draft'
};

// E: AI template generator per domain
const AI_TEMPLATES = {
  Cardiology: (title) =>
    `We are developing "${title}" to address a critical unmet need in cardiology care. Our clinical team has identified that current tools fail to [specific gap — e.g., detect early-stage arrhythmias in outpatient settings]. We are seeking an engineering partner with expertise in signal processing, embedded systems, or machine learning to collaborate on a proof-of-concept. The goal is to deliver a validated prototype within 6 months. No sensitive IP will be disclosed until an NDA is signed.`,
  Radiology: (title) =>
    `"${title}" is a project aimed at improving diagnostic accuracy in radiology. We have observed that [specific challenge — e.g., radiologists miss 20% of early-stage lesions due to image resolution limitations]. We need an engineer with expertise in computer vision or medical imaging AI to co-develop a detection pipeline. We have access to an annotated dataset of [X] images under a data-sharing agreement. All collaboration will be governed by a mutual NDA.`,
  'Emergency Medicine': (title) =>
    `"${title}" addresses a time-critical problem in emergency medicine: [describe the problem — e.g., delays in triage due to manual assessment]. Our team has collected preliminary data showing [key finding]. We are looking for an engineer skilled in real-time systems, IoT, or clinical decision support to help build and test a rapid prototype in a simulated emergency environment.`,
  Psychiatry: (title) =>
    `"${title}" is a mental health technology initiative targeting [specific condition or population]. We have identified that [problem statement — e.g., existing digital tools lack clinical-grade validation]. We seek an engineer with experience in mobile app development, NLP, or sensor fusion to co-design a clinically validated solution. The collaboration will follow ethical review board guidelines from day one.`,
  Geriatrics: (title) =>
    `"${title}" focuses on improving quality of life for elderly patients facing [challenge — e.g., fall detection, medication adherence, cognitive decline monitoring]. Our geriatrics unit has piloted a low-tech version and collected preliminary feedback. We need an engineering partner to elevate this into a scalable, connected device or platform. Prior experience with accessibility design or wearable tech is highly valued.`,
  Oncology: (title) =>
    `"${title}" aims to improve outcomes for oncology patients by addressing [specific problem — e.g., chemotherapy side-effect monitoring, early recurrence detection]. Our oncology team has access to retrospective clinical data and patient cohorts. We are seeking an engineer with expertise in bioinformatics, predictive modeling, or medical device development. The collaboration will be structured around a phased research plan with clear IP agreements.`,
  Neurology: (title) =>
    `"${title}" is a neurotech project targeting [condition — e.g., Parkinson's tremor quantification, epilepsy seizure prediction]. Our neurology department has identified a measurable clinical gap: [gap description]. We are looking for an engineer with experience in neural signal processing, wearables, or brain-computer interfaces. Preliminary neurophysiology data is available for model training under a data governance agreement.`,
  Orthopedics: (title) =>
    `"${title}" addresses a biomechanical challenge in orthopedic care: [problem — e.g., post-surgical rehabilitation monitoring, implant loosening detection]. Our surgical team has documented [N] cases demonstrating the need. We seek an engineer with expertise in biomechanics, sensors, or computer-assisted surgery. The project target is a validated pilot within [timeframe], with a path toward CE/FDA clearance.`,
  Dermatology: (title) =>
    `"${title}" is a dermatology innovation project focused on [area — e.g., AI-assisted skin lesion classification, teledermatology triage]. Our clinical team has curated a labeled dataset of [X] images and identified a gap in [specific diagnostic workflow]. We are looking for an engineer skilled in image recognition, mobile health, or clinical AI to co-develop and validate the solution under dermatology supervision.`,
  Other: (title) =>
    `"${title}" is a healthcare innovation project that addresses [the core clinical problem]. Our team has validated the clinical need through [method — e.g., patient surveys, retrospective data analysis]. We are seeking an engineer with relevant technical skills to collaborate on developing and testing a solution. The project will follow a structured timeline with clear milestones and IP protection measures in place from the outset.`,
};

// Typewriter effect for AI suggestion
function typewriterFill(text, setter, onDone) {
  let i = 0;
  const tick = () => {
    i++;
    setter(text.slice(0, i));
    if (i < text.length) requestAnimationFrame(tick);
    else if (onDone) onDone();
  };
  requestAnimationFrame(tick);
}

export default function PostCreatePage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const toast     = useToast();
  const [form, setForm]         = useState(EMPTY);
  const [loading, setLoading]   = useState(false);
  const [aiLoading, setAiLoading] = useState(false);  // E
  const descRef = useRef(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // E: AI Post Assistant
  const handleAiSuggest = () => {
    if (!form.domain) { toast.warning('Select a domain first so the AI can tailor the suggestion.'); return; }
    const titleHint = form.title.trim() || 'My Healthcare Project';
    const template  = (AI_TEMPLATES[form.domain] || AI_TEMPLATES.Other)(titleHint);

    setAiLoading(true);
    setForm(f => ({ ...f, description: '' }));

    // Scroll textarea into view
    descRef.current?.focus();

    typewriterFill(
      template,
      (val) => setForm(f => ({ ...f, description: val })),
      () => {
        setAiLoading(false);
        toast.success('AI suggestion applied! Feel free to edit it.');
      }
    );
  };

  const handleSubmit = async (status) => {
    if (!form.title || !form.domain || !form.description || !form.expertiseRequired || !form.city) {
      toast.warning('Please fill in all required fields (marked with *).'); return;
    }
    const { valid, errors } = moderatePost({ title: form.title, description: form.description, expertiseRequired: form.expertiseRequired });
    if (!valid) { errors.forEach(e => toast.error(e)); return; }
    setLoading(true);
    try {
      const post = await postsApi.create({ ...form, status, userId: user.id, authorName: user.name, role: user.role });
      toast.success(status === 'active' ? 'Post published successfully!' : 'Draft saved.');
      navigate(`/posts/${post.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header"><h1 className="page-title">Create New Post</h1></div>
      <div className="post-form-card">

        {/* Basic Info */}
        <div className="form-section">
          <h3 className="form-section-title">Basic Information</h3>
          <div className="form-group">
            <label>Post Title <span className="required">*</span></label>
            <input className="form-control" name="title" placeholder="e.g. AI-Powered ECG Analysis Tool" value={form.title} onChange={handleChange} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Domain <span className="required">*</span></label>
              <select className="form-control" name="domain" value={form.domain} onChange={handleChange}>
                <option value="">Select domain...</option>
                {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Expertise Required <span className="required">*</span></label>
              <input className="form-control" name="expertiseRequired" placeholder="e.g. Cardiology / Clinical Validation" value={form.expertiseRequired} onChange={handleChange} />
            </div>
          </div>

          {/* E: Description with AI button */}
          <div className="form-group">
            <div className="form-label-row">
              <label>Description <span className="required">*</span></label>
              <button
                type="button"
                className={`ai-suggest-btn${aiLoading ? ' ai-suggest-btn--loading' : ''}`}
                onClick={handleAiSuggest}
                disabled={aiLoading}
                title="Auto-generate a professional description based on your domain"
              >
                {aiLoading ? (
                  <><span className="ai-spinner" />Writing…</>
                ) : (
                  <>✨ AI Suggest</>
                )}
              </button>
            </div>
            <textarea
              ref={descRef}
              className="form-control"
              name="description"
              rows={5}
              placeholder="Describe your project without revealing sensitive IP… or click ✨ AI Suggest above."
              value={form.description}
              onChange={handleChange}
            />
            {aiLoading && (
              <p className="ai-hint">🤖 AI is writing your description — watch it appear in real time…</p>
            )}
          </div>
        </div>

        {/* Project Details */}
        <div className="form-section">
          <h3 className="form-section-title">Project Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Project Stage</label>
              <select className="form-control" name="projectStage" value={form.projectStage} onChange={handleChange}>
                <option value="">Select stage...</option>
                {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Commitment Level</label>
              <select className="form-control" name="commitmentLevel" value={form.commitmentLevel} onChange={handleChange}>
                <option value="">Select commitment...</option>
                {COMMITMENT.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Collaboration Type</label>
              <select className="form-control" name="collaborationType" value={form.collaborationType} onChange={handleChange}>
                <option value="">Select type...</option>
                {COLLAB.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Confidentiality</label>
              <select className="form-control" name="confidentiality" value={form.confidentiality} onChange={handleChange}>
                <option value="Public pitch — details in meeting">Public pitch — details in meeting</option>
                <option value="Details discussed in meeting only">Details discussed in meeting only</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City <span className="required">*</span></label>
              <input className="form-control" name="city" placeholder="Istanbul" value={form.city} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input className="form-control" name="country" placeholder="Turkey" value={form.country} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Expiry Date</label>
              <input className="form-control" type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/posts')} disabled={loading}>Cancel</button>
          <button className="btn btn-secondary btn-lg" onClick={() => handleSubmit('draft')} disabled={loading}>Save as Draft</button>
          <button className="btn btn-primary btn-lg"   onClick={() => handleSubmit('active')} disabled={loading}>{loading ? 'Publishing…' : 'Publish Post'}</button>
        </div>
      </div>
    </div>
  );
}
