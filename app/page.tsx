"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Download,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  Award
} from 'lucide-react';
import { downloadCVPdf, getCVFilename } from '../lib/pdf';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CVData, AppStep, Education, Experience } from '@/types';
import { extractPassportData } from '../services/gemini';
import { ThemeToggle } from '@/components/theme-toggle';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const INITIAL_DATA: CVData = {
  fullName: '',
  passportNumber: '',
  dateOfBirth: '',
  gender: '',
  nationality: 'Nepalese',
  placeOfBirth: '',
  dateOfIssue: '',
  dateOfExpiry: '',
  issuingAuthority: '',
  email: '',
  phone: '+977 ',
  address: '',
  applyingFor: 'Kitchen Helper',
  educationLevel: '10 Pass',
  experienceYears: '2',
  experienceCountry: 'Nepal',
  height: '5’6”',
  weight: '72KG',
  maritalStatus: 'Single',
  religion: 'Hinduism',
  fatherName: '',
  languages: 'Nepali, English, Hindi',
  template: 'classic',
  education: [],
  experiences: [],
  certificates: [],
};

export default function Home() {
  const [step, setStep] = useState<AppStep>('upload-passport');
  const [data, setData] = useState<CVData>(INITIAL_DATA);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const cvRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!cvRef.current || isGenerating) return;

    const filename = getCVFilename(data);

    setIsGenerating(true);
    try {
      await downloadCVPdf(cvRef.current, filename);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate PDF';
      console.error('PDF Generation Error:', err);
      setError(errorMsg);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  }, [data, isGenerating]);

  const handlePassportUpload = async (file: File) => {
    setStep('extracting');
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const extracted = await extractPassportData(base64);
          setData((prev: CVData) => ({
            ...prev,
            ...extracted,
            passportImage: base64
          }));
          setStep('edit-data');
        } catch (err) {
          console.error(err);
          setError("Failed to extract data. Please try again or fill manually.");
          setStep('edit-data');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Error reading file.");
      setStep('upload-passport');
    }
  };

  const addEducation = () => {
    const newEdu: Education = { id: Math.random().toString(36).substr(2, 9), degree: '', institution: '', year: '' };
    setData((prev: CVData) => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const removeEducation = (id: string) => {
    setData((prev: CVData) => ({ ...prev, education: prev.education.filter((e: Education) => e.id !== id) }));
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      company: '',
      duration: '',
      country: 'Nepal'
    };
    setData((prev: CVData) => ({ ...prev, experiences: [...prev.experiences, newExp] }));
  };

  const removeExperience = (id: string) => {
    setData((prev: CVData) => ({ ...prev, experiences: prev.experiences.filter((e: Experience) => e.id !== id) }));
  };

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setData((prev: CVData) => ({ ...prev, profilePhoto: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleCertificateUpload = (files: File[]) => {
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        setData((prev: CVData) => ({
          ...prev,
          certificates: [...prev.certificates, {
            id: Math.random().toString(36).substr(2, 9),
            url: reader.result as string,
            name: file.name
          }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border px-6 py-4 no-print">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
              <FileText size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Nepal CV Maker</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Progress Menu */}
        <div className="mb-12 bg-card/50 border border-border rounded-2xl p-4 flex items-center justify-center gap-4 text-sm font-medium text-muted-foreground overflow-x-auto no-print">
          <StepItem active={step === 'upload-passport'} completed={['extracting', 'edit-data', 'upload-docs', 'preview'].includes(step)} label="Passport" />
          <ChevronRight size={14} className="shrink-0 opacity-20" />
          <StepItem active={step === 'edit-data'} completed={['upload-docs', 'preview'].includes(step)} label="Details" />
          <ChevronRight size={14} className="shrink-0 opacity-20" />
          <StepItem active={step === 'upload-docs'} completed={['preview'].includes(step)} label="Documents" />
          <ChevronRight size={14} className="shrink-0 opacity-20" />
          <StepItem active={step === 'preview'} completed={false} label="Preview" />
        </div>

        <AnimatePresence mode="wait">
          {step === 'upload-passport' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="text-4xl font-serif italic mb-4">Start with your Passport</h2>
              <p className="text-muted-foreground mb-12">Upload your Nepali passport image. We&apos;ll use AI to extract your details automatically to save you time.</p>

              <Dropzone
                onDrop={(files) => files[0] && handlePassportUpload(files[0])}
                accept={{ 'image/*': ['.jpeg', '.jpg', '.png'] }}
                icon={<Upload className="w-12 h-12 text-primary mb-4" />}
                title="Click or drag passport image here"
                subtitle="Supports JPG, PNG (Max 10MB)"
              />

              <button
                onClick={() => setStep('edit-data')}
                className="mt-8 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              >
                Skip and fill manually
              </button>
            </motion.div>
          )}

          {step === 'extracting' && (
            <motion.div
              key="extracting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
              <h2 className="text-2xl font-serif italic mb-2">Analyzing Passport...</h2>
              <p className="text-muted-foreground">Our AI is extracting your information. This usually takes a few seconds.</p>
            </motion.div>
          )}

          {step === 'edit-data' && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-serif italic mb-2">Personal Details</h2>
                  <p className="text-muted-foreground">Review extracted data and add missing information.</p>
                </div>
                <button
                  onClick={() => {
                    setError(null);
                    setStep('upload-docs');
                  }}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-primary/90 transition-all"
                >
                  Next: Documents <ChevronRight size={18} />
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Section title="Basic Information" icon={<User size={18} />}>
                  <Input label="Full Name" value={data.fullName} onChange={v => setData({ ...data, fullName: v })} />
                  <Input label="Email Address" type="email" value={data.email} onChange={v => setData({ ...data, email: v })} />
                  <Input label="Phone Number" prefix="+977" value={data.phone.replace('+977 ', '')} onChange={v => setData({ ...data, phone: `+977 ${v}` })} />
                  <Input label="Current Address" value={data.address} onChange={v => setData({ ...data, address: v })} />
                </Section>

                <Section title="Passport Details" icon={<FileText size={18} />}>
                  <Input label="Passport Number" value={data.passportNumber} onChange={v => setData({ ...data, passportNumber: v })} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Date of Issue" value={data.dateOfIssue} onChange={v => setData({ ...data, dateOfIssue: v })} />
                    <Input label="Date of Expiry" value={data.dateOfExpiry} onChange={v => setData({ ...data, dateOfExpiry: v })} />
                  </div>
                  <Input label="Place of Issue" value={data.placeOfIssue || ''} onChange={v => setData({ ...data, placeOfIssue: v })} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Date of Birth" value={data.dateOfBirth} onChange={v => setData({ ...data, dateOfBirth: v })} />
                    <Input label="Gender" value={data.gender} onChange={v => setData({ ...data, gender: v })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Nationality" value={data.nationality} onChange={v => setData({ ...data, nationality: v })} />
                    <Input label="Place of Birth" value={data.placeOfBirth} onChange={v => setData({ ...data, placeOfBirth: v })} />
                  </div>
                </Section>

                <Section title="Job & Education" icon={<Briefcase size={18} />}>
                  <Select
                    label="Applying For"
                    value={data.applyingFor}
                    onChange={v => setData({ ...data, applyingFor: v })}
                    options={[
                      { label: 'Kitchen Helper', value: 'Kitchen Helper' },
                      { label: 'Cleaner', value: 'Cleaner' },
                      { label: 'Food Service Worker', value: 'Food Service Worker' },
                      { label: 'Cook', value: 'Cook' },
                      { label: 'Waiter', value: 'Waiter' },
                      { label: 'Barista', value: 'Barista' },
                    ]}
                  />
                  <Select
                    label="Education Level"
                    value={data.educationLevel}
                    onChange={v => setData({ ...data, educationLevel: v })}
                    options={[
                      { label: '10 Pass', value: '10 Pass' },
                      { label: '12 Pass', value: '12 Pass' },
                      { label: 'Bachelor', value: 'Bachelor' },
                      { label: 'Master', value: 'Master' },
                      { label: 'Other', value: 'Other' },
                    ]}
                  />
                </Section>

                <Section title="CV Template" icon={<ImageIcon size={18} />}>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <button
                      onClick={() => setData({ ...data, template: 'elegant' })}
                      className="group text-left"
                    >
                      <TemplatePreview type="elegant" active={data.template === 'elegant'} />
                      <div className="px-1">
                        <div className={cn(
                          "font-bold text-[10px] mb-0.5 transition-colors",
                          data.template === 'elegant' ? "text-primary" : "text-foreground"
                        )}>Elegant</div>
                        <div className="text-[8px] text-muted-foreground uppercase tracking-wider">Serif / 2-Col</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setData({ ...data, template: 'professional' })}
                      className="group text-left"
                    >
                      <TemplatePreview type="professional" active={data.template === 'professional'} />
                      <div className="px-1">
                        <div className={cn(
                          "font-bold text-[10px] mb-0.5 transition-colors",
                          data.template === 'professional' ? "text-primary" : "text-foreground"
                        )}>Professional</div>
                        <div className="text-[8px] text-muted-foreground uppercase tracking-wider">Modern / Dark</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setData({ ...data, template: 'classic' })}
                      className="group text-left"
                    >
                      <TemplatePreview type="classic" active={data.template === 'classic'} />
                      <div className="px-1">
                        <div className={cn(
                          "font-bold text-[10px] mb-0.5 transition-colors",
                          data.template === 'classic' ? "text-primary" : "text-foreground"
                        )}>Classic</div>
                        <div className="text-[8px] text-muted-foreground uppercase tracking-wider">Formal / Center</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setData({ ...data, template: 'modern_classic' })}
                      className="group text-left"
                    >
                      <TemplatePreview type="modern_classic" active={data.template === 'modern_classic'} />
                      <div className="px-1">
                        <div className={cn(
                          "font-bold text-[10px] mb-0.5 transition-colors",
                          data.template === 'modern_classic' ? "text-primary" : "text-foreground"
                        )}>Modern Classic</div>
                        <div className="text-[8px] text-muted-foreground uppercase tracking-wider">Clean / Sidebar</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setData({ ...data, template: 'minimalist' })}
                      className="group text-left"
                    >
                      <TemplatePreview type="minimalist" active={data.template === 'minimalist'} />
                      <div className="px-1">
                        <div className={cn(
                          "font-bold text-[10px] mb-0.5 transition-colors",
                          data.template === 'minimalist' ? "text-primary" : "text-foreground"
                        )}>Minimalist</div>
                        <div className="text-[8px] text-muted-foreground uppercase tracking-wider">Simple / 1-Col</div>
                      </div>
                    </button>
                  </div>
                </Section>

                <Section title="Personal Details" icon={<User size={18} />}>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Height" value={data.height} onChange={v => setData({ ...data, height: v })} />
                    <Input label="Weight" value={data.weight} onChange={v => setData({ ...data, weight: v })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Select
                      label="Marital Status"
                      value={data.maritalStatus}
                      onChange={v => setData({ ...data, maritalStatus: v })}
                      options={[
                        { label: 'Single', value: 'Single' },
                        { label: 'Married', value: 'Married' },
                        { label: 'Divorced', value: 'Divorced' },
                      ]}
                    />
                    <Input label="Religion" value={data.religion} onChange={v => setData({ ...data, religion: v })} />
                  </div>
                  <div className="mt-4">
                    <Input label="Father's Name" value={data.fatherName} onChange={v => setData({ ...data, fatherName: v })} />
                  </div>
                </Section>

                <Section title="Languages" icon={<Award size={18} />}>
                  <Input label="Language" value={data.languages} onChange={v => setData({ ...data, languages: v })} />
                </Section>

                <Section title="Experience Summary" icon={<Briefcase size={18} />}>
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Total Experience"
                      value={data.experienceYears}
                      onChange={v => setData({ ...data, experienceYears: v })}
                      options={[
                        { label: '0 Years (Fresher)', value: '0' },
                        { label: '1 Year', value: '1' },
                        { label: '2 Years', value: '2' },
                        { label: '3 Years', value: '3' },
                        { label: '4 Years', value: '4' },
                        { label: '5+ Years', value: '5+' },
                      ]}
                    />
                    <Input label="Experience Country" value={data.experienceCountry} onChange={v => setData({ ...data, experienceCountry: v })} />
                  </div>
                </Section>
              </div>

              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-border pb-4">
                  <h3 className="text-xl font-serif italic flex items-center gap-2">
                    <GraduationCap size={20} className="text-primary" /> Education
                  </h3>
                  <button onClick={addEducation} className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
                    <Plus size={16} /> Add Education
                  </button>
                </div>
                <div className="space-y-4">
                  {data.education.map((edu: Education, idx: number) => (
                    <div key={edu.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card p-6 rounded-2xl shadow-sm relative group border border-border">
                      <Input label="Degree" value={edu.degree} onChange={v => {
                        const newEdu = [...data.education];
                        newEdu[idx].degree = v;
                        setData({ ...data, education: newEdu });
                      }} />
                      <div className="md:col-span-2">
                        <Input label="Institution" value={edu.institution} onChange={v => {
                          const newEdu = [...data.education];
                          newEdu[idx].institution = v;
                          setData({ ...data, education: newEdu });
                        }} />
                      </div>
                      <Input label="Year" value={edu.year} onChange={v => {
                        const newEdu = [...data.education];
                        newEdu[idx].year = v;
                        setData({ ...data, education: newEdu });
                      }} />
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {data.education.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground italic">No education history added yet.</p>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-border pb-4">
                  <h3 className="text-xl font-serif italic flex items-center gap-2">
                    <Briefcase size={20} className="text-primary" /> Work Experience
                  </h3>
                  <button onClick={addExperience} className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
                    <Plus size={16} /> Add Experience
                  </button>
                </div>
                <div className="space-y-4">
                  {data.experiences.map((exp: Experience, idx: number) => (
                    <div key={exp.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card p-6 rounded-2xl shadow-sm relative group border border-border">
                      <Input label="Job Title" value={exp.title} onChange={v => {
                        const newExp = [...data.experiences];
                        newExp[idx].title = v;
                        setData({ ...data, experiences: newExp });
                      }} />
                      <Input label="Company" value={exp.company} onChange={v => {
                        const newExp = [...data.experiences];
                        newExp[idx].company = v;
                        setData({ ...data, experiences: newExp });
                      }} />
                      <Input label="Duration" value={exp.duration} onChange={v => {
                        const newExp = [...data.experiences];
                        newExp[idx].duration = v;
                        setData({ ...data, experiences: newExp });
                      }} />
                      <Input label="Country" value={exp.country} onChange={v => {
                        const newExp = [...data.experiences];
                        newExp[idx].country = v;
                        setData({ ...data, experiences: newExp });
                      }} />
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {data.experiences.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground italic">No work experience added yet.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-12">
                <button
                  onClick={() => setStep('upload-passport')}
                  className="text-muted-foreground font-medium flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <ChevronLeft size={18} /> Back to Passport
                </button>
                <button
                  onClick={() => setStep('upload-docs')}
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium flex items-center gap-2 hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all"
                >
                  Continue to Documents <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'upload-docs' && (
            <motion.div
              key="docs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-serif italic mb-2">Additional Documents</h2>
                  <p className="text-muted-foreground">Upload your profile photo and any relevant certificates.</p>
                </div>
                <button
                  onClick={() => setStep('preview')}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  Generate CV <ChevronRight size={18} />
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  {data.profilePhoto ? (
                    <div className="relative w-48 h-48 mx-auto group">
                      <img src={data.profilePhoto} alt="Profile" className="w-full h-full object-cover rounded-3xl shadow-lg" referrerPolicy="no-referrer" />
                      <button
                        onClick={() => setData({ ...data, profilePhoto: undefined })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <Dropzone
                      onDrop={(files) => files[0] && handlePhotoUpload(files[0])}
                      accept={{ 'image/*': ['.jpeg', '.jpg', '.png'] }}
                      icon={<ImageIcon className="w-8 h-8 text-primary mb-2" />}
                      title="Upload Profile Photo"
                      subtitle="Square aspect ratio recommended"
                    />
                  )}
                </div>

                <div className="space-y-6">
                  <Dropzone
                    onDrop={handleCertificateUpload}
                    accept={{ 'image/*': ['.jpeg', '.jpg', '.png'], 'application/pdf': ['.pdf'] }}
                    icon={<Plus className="w-8 h-8 text-primary mb-2" />}
                    title="Upload Certificates"
                    subtitle="Upload multiple images or PDFs"
                  />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {data.certificates.map((cert: { id: string; url: string; name: string }) => (
                      <div key={cert.id} className="bg-card p-3 rounded-xl border border-border flex items-center justify-between group">
                        <span className="text-xs truncate max-w-[120px]">{cert.name}</span>
                        <button
                          onClick={() => setData({ ...data, certificates: data.certificates.filter((c: { id: string; url: string; name: string }) => c.id !== cert.id) })}
                          className="text-red-500 p-1 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-12">
                <button
                  onClick={() => {
                    setError(null);
                    setStep('edit-data');
                  }}
                  className="text-muted-foreground font-medium flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <ChevronLeft size={18} /> Back to Details
                </button>
                <button
                  onClick={() => setStep('preview')}
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium flex items-center gap-2 hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                >
                  Generate Final CV <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center sticky top-24 z-40 bg-background/80 backdrop-blur-sm py-4 no-print">
                <h2 className="text-3xl font-serif italic">Your Generated CV</h2>
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep('upload-docs')}
                    className="text-muted-foreground font-medium flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    <ChevronLeft size={18} /> Edit Documents
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-primary/90 shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    {isGenerating ? 'Generating PDF...' : 'Save PDF'}
                  </button>
                </div>
              </div>

              <div ref={cvRef} className="space-y-12 print:space-y-0 print:bg-white">
                {/* Page 1: CV */}
                {data.template === 'elegant' ? (
                  <div className="bg-white text-black shadow-2xl rounded-[2rem] overflow-hidden max-w-[210mm] mx-auto min-h-[297mm] p-12 print:shadow-none print:rounded-none print:p-12 print:m-0">
                    <div className="grid grid-cols-3 gap-12">
                      <div className="col-span-1 space-y-10">
                        {data.profilePhoto && (
                          <div className="relative">
                            <div className="absolute -inset-2 border-2 border-[#5A5A40]/20 rounded-[2.5rem] rotate-3"></div>
                            <img src={data.profilePhoto} alt="Profile" className="relative w-full aspect-[4/5] object-cover rounded-[2rem] shadow-xl border-4 border-white" referrerPolicy="no-referrer" />
                          </div>
                        )}

                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-[#5A5A40]/20"></div>
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A5A40]">Contact</h4>
                            <div className="h-px flex-1 bg-[#5A5A40]/20"></div>
                          </div>
                          <div className="space-y-4 text-sm text-black/80">
                            <p className="flex items-center gap-3"><User size={16} className="text-[#5A5A40]" /> {data.phone}</p>
                            <p className="flex items-center gap-3"><FileText size={16} className="text-[#5A5A40]" /> {data.email}</p>
                            <p className="flex items-center gap-3"><Briefcase size={16} className="text-[#5A5A40]" /> {data.address}</p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-[#5A5A40]/20"></div>
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A5A40]">Passport</h4>
                            <div className="h-px flex-1 bg-[#5A5A40]/20"></div>
                          </div>
                          <div className="space-y-3 text-sm text-black/80">
                            <div className="flex justify-between"><span>No:</span> <span className="font-bold">{data.passportNumber}</span></div>
                            <div className="flex justify-between"><span>Nationality:</span> <span className="font-bold">{data.nationality}</span></div>
                            <div className="flex justify-between"><span>DOB:</span> <span className="font-bold">{data.dateOfBirth}</span></div>
                            <div className="flex justify-between"><span>Gender:</span> <span className="font-bold">{data.gender}</span></div>
                            <div className="flex justify-between"><span>Marital:</span> <span className="font-bold">{data.maritalStatus}</span></div>
                            <div className="flex justify-between"><span>Religion:</span> <span className="font-bold">{data.religion}</span></div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-[#5A5A40]/20"></div>
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A5A40]">Summary</h4>
                            <div className="h-px flex-1 bg-[#5A5A40]/20"></div>
                          </div>
                          <p className="text-sm text-black/70 italic leading-relaxed">
                            Experienced {data.applyingFor} with {data.experienceYears} years of professional background in {data.experienceCountry}.
                          </p>
                        </div>
                      </div>

                      <div className="col-span-2 space-y-16">
                        <div className="relative">
                          <h1 className="text-6xl font-serif italic mb-2 tracking-tight">{data.fullName}</h1>
                          <p className="text-[#5A5A40] font-medium tracking-[0.3em] uppercase text-xs mb-6">Professional {data.applyingFor}</p>
                          <div className="h-1.5 w-32 bg-[#5A5A40] rounded-full"></div>
                        </div>

                        <div className="space-y-10">
                          <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-serif italic whitespace-nowrap">Work Experience</h3>
                            <div className="h-px w-full bg-black/5"></div>
                          </div>
                          <div className="space-y-10">
                            {data.experiences.map((exp: Experience) => (
                              <div key={exp.id} className="relative pl-8 border-l-2 border-[#5A5A40]/10 space-y-2">
                                <div className="absolute -left-2.25 top-1 w-4 h-4 rounded-full bg-white border-2 border-[#5A5A40]"></div>
                                <div className="flex justify-between items-start">
                                  <h4 className="font-bold text-xl tracking-tight">{exp.title}</h4>
                                  <span className="text-xs text-[#5A5A40] font-bold uppercase tracking-widest bg-[#5A5A40]/5 px-3 py-1 rounded-full">{exp.duration}</span>
                                </div>
                                <p className="text-[#5A5A40] font-bold text-sm uppercase tracking-wider">{exp.company} — {exp.country}</p>
                              </div>
                            ))}
                            {data.experiences.length === 0 && <p className="text-black/30 italic">No experience listed.</p>}
                          </div>
                        </div>

                        <div className="space-y-10">
                          <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-serif italic whitespace-nowrap">Education</h3>
                            <div className="h-px w-full bg-black/5"></div>
                          </div>
                          <div className="space-y-8">
                            {data.education.map((edu: Education) => (
                              <div key={edu.id} className="relative pl-8 border-l-2 border-[#5A5A40]/10 space-y-1">
                                <div className="absolute -left-2.25 top-1 w-4 h-4 rounded-full bg-white border-2 border-[#5A5A40]"></div>
                                <div className="flex justify-between items-start">
                                  <h4 className="font-bold text-xl tracking-tight">{edu.degree}</h4>
                                  <span className="text-xs text-[#5A5A40] font-bold uppercase tracking-widest bg-[#5A5A40]/5 px-3 py-1 rounded-full">{edu.year}</span>
                                </div>
                                <p className="text-[#5A5A40] font-bold text-sm uppercase tracking-wider">{edu.institution}</p>
                              </div>
                            ))}
                            <div className="relative pl-8 border-l-2 border-[#5A5A40]/10 space-y-1">
                              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#5A5A40]"></div>
                              <h4 className="font-bold text-xl tracking-tight">{data.educationLevel}</h4>
                              <p className="text-[#5A5A40] font-bold text-sm uppercase tracking-wider">Completed Secondary Education</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : data.template === 'professional' ? (
                  <div className="bg-white text-black shadow-2xl rounded-none overflow-hidden max-w-[210mm] mx-auto min-h-[297mm] flex flex-col print:shadow-none print:p-0 print:m-0">
                    {/* Professional Template Header */}
                    <div className="bg-[#1A1A1A] text-white p-16 flex justify-between items-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                      <div className="space-y-6 relative z-10">
                        <h1 className="text-5xl font-bold tracking-tighter uppercase leading-none">{data.fullName}</h1>
                        <div className="flex flex-wrap gap-6 text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                          <p className="flex items-center gap-2"><User size={14} className="text-white" /> {data.phone}</p>
                          <p className="flex items-center gap-2"><FileText size={14} className="text-white" /> {data.email}</p>
                          <p className="flex items-center gap-2"><Briefcase size={14} className="text-white" /> {data.address}</p>
                        </div>
                      </div>
                      {data.profilePhoto && (
                        <div className="relative z-10">
                          <img src={data.profilePhoto} alt="Profile" className="w-40 h-40 object-cover border-8 border-white/10 grayscale hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>

                    <div className="p-16 grid grid-cols-3 gap-16 flex-1">
                      <div className="col-span-2 space-y-16">
                        <section className="space-y-8">
                          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-black/30 flex items-center gap-4">
                            Summary <div className="h-px flex-1 bg-black/10"></div>
                          </h2>
                          <p className="text-base text-black/80 leading-relaxed font-medium">
                            Professional {data.applyingFor} with {data.experienceYears} years of experience in {data.experienceCountry}.
                            Specialized in operational excellence and high-standard service delivery.
                            Proven track record of reliability and professional growth.
                          </p>
                        </section>

                        <section className="space-y-8">
                          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-black/30 flex items-center gap-4">
                            Experience <div className="h-px flex-1 bg-black/10"></div>
                          </h2>
                          <div className="space-y-12">
                            {data.experiences.map((exp: Experience) => (
                              <div key={exp.id} className="space-y-3">
                                <div className="flex justify-between items-baseline">
                                  <h3 className="font-bold text-2xl tracking-tight">{exp.title}</h3>
                                  <span className="text-xs font-bold text-black/30 uppercase tracking-widest">{exp.duration}</span>
                                </div>
                                <p className="text-sm font-bold text-black/60 uppercase tracking-wider">{exp.company} <span className="mx-2 text-black/20">|</span> {exp.country}</p>
                              </div>
                            ))}
                            {data.experiences.length === 0 && <p className="text-black/30 italic">No experience listed.</p>}
                          </div>
                        </section>

                        <section className="space-y-8">
                          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-black/30 flex items-center gap-4">
                            Education <div className="h-px flex-1 bg-black/10"></div>
                          </h2>
                          <div className="space-y-10">
                            {data.education.map((edu: Education) => (
                              <div key={edu.id} className="space-y-2">
                                <div className="flex justify-between items-baseline">
                                  <h3 className="font-bold text-2xl tracking-tight">{edu.degree}</h3>
                                  <span className="text-xs font-bold text-black/30 uppercase tracking-widest">{edu.year}</span>
                                </div>
                                <p className="text-sm font-bold text-black/60 uppercase tracking-wider">{edu.institution}</p>
                              </div>
                            ))}
                            <div className="space-y-2">
                              <h3 className="font-bold text-2xl tracking-tight">{data.educationLevel}</h3>
                              <p className="text-sm font-bold text-black/60 uppercase tracking-wider">Secondary Education Completed</p>
                            </div>
                          </div>
                        </section>
                      </div>

                      <div className="col-span-1 space-y-16">
                        <section className="space-y-8">
                          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-black/30">Personal</h2>
                          <div className="space-y-6 text-sm">
                            <div className="group">
                              <p className="text-black/20 font-bold uppercase text-[10px] tracking-widest mb-1 group-hover:text-black transition-colors">Nationality</p>
                              <p className="font-bold text-black/80">{data.nationality}</p>
                            </div>
                            <div className="group">
                              <p className="text-black/20 font-bold uppercase text-[10px] tracking-widest mb-1 group-hover:text-black transition-colors">Passport No.</p>
                              <p className="font-bold text-black/80">{data.passportNumber}</p>
                            </div>
                            <div className="group">
                              <p className="text-black/20 font-bold uppercase text-[10px] tracking-widest mb-1 group-hover:text-black transition-colors">Date of Birth</p>
                              <p className="font-bold text-black/80">{data.dateOfBirth}</p>
                            </div>
                            <div className="group">
                              <p className="text-black/20 font-bold uppercase text-[10px] tracking-widest mb-1 group-hover:text-black transition-colors">Marital Status</p>
                              <p className="font-bold text-black/80">{data.maritalStatus}</p>
                            </div>
                            <div className="group">
                              <p className="text-black/20 font-bold uppercase text-[10px] tracking-widest mb-1 group-hover:text-black transition-colors">Religion</p>
                              <p className="font-bold text-black/80">{data.religion}</p>
                            </div>
                            <div className="group">
                              <p className="text-black/20 font-bold uppercase text-[10px] tracking-widest mb-1 group-hover:text-black transition-colors">Father&apos;s Name</p>
                              <p className="font-bold text-black/80">{data.fatherName}</p>
                            </div>
                          </div>
                        </section>

                        <section className="space-y-8">
                          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-black/30">Expertise</h2>
                          <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                <span>{data.applyingFor}</span>
                                <span>Expert</span>
                              </div>
                              <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
                                <div className="h-full w-[95%] bg-black"></div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                <span>Communication</span>
                                <span>Advanced</span>
                              </div>
                              <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
                                <div className="h-full w-[85%] bg-black"></div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                <span>Teamwork</span>
                                <span>Advanced</span>
                              </div>
                              <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
                                <div className="h-full w-[90%] bg-black"></div>
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                ) : data.template === 'modern_classic' ? (
                  <div className="bg-white text-black shadow-2xl rounded-none overflow-hidden max-w-[210mm] mx-auto min-h-[297mm] flex flex-col print:shadow-none print:p-0 print:m-0">
                    <div className="flex flex-1">
                      {/* Sidebar */}
                      <div className="w-[75mm] bg-[#F8F9FA] p-10 space-y-10 border-r border-black/5">
                        {data.profilePhoto && (
                          <img src={data.profilePhoto} alt="Profile" className="w-full aspect-square object-cover rounded-full border-4 border-white shadow-lg" referrerPolicy="no-referrer" />
                        )}

                        <section className="space-y-4">
                          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black/40 border-b border-black/10 pb-2">Contact</h2>
                          <div className="space-y-3 text-xs">
                            <p className="flex items-center gap-2 font-medium"><User size={12} /> {data.phone}</p>
                            <p className="flex items-center gap-2 font-medium"><FileText size={12} /> {data.email}</p>
                            <p className="flex items-center gap-2 font-medium"><Briefcase size={12} /> {data.address}</p>
                          </div>
                        </section>

                        <section className="space-y-4">
                          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black/40 border-b border-black/10 pb-2">Personal Details</h2>
                          <div className="space-y-3 text-xs">
                            <div>
                              <p className="text-[10px] text-black/30 font-bold uppercase">Nationality</p>
                              <p className="font-bold">{data.nationality}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-black/30 font-bold uppercase">Passport No.</p>
                              <p className="font-bold">{data.passportNumber}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-black/30 font-bold uppercase">Date of Birth</p>
                              <p className="font-bold">{data.dateOfBirth}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-black/30 font-bold uppercase">Marital Status</p>
                              <p className="font-bold">{data.maritalStatus}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-black/30 font-bold uppercase">Religion</p>
                              <p className="font-bold">{data.religion}</p>
                            </div>
                          </div>
                        </section>

                        <section className="space-y-4">
                          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black/40 border-b border-black/10 pb-2">Languages</h2>
                          <p className="text-xs font-bold">{data.languages}</p>
                        </section>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 p-12 space-y-12">
                        <header>
                          <h1 className="text-4xl font-bold tracking-tight mb-1">{data.fullName}</h1>
                          <p className="text-lg text-black/40 font-medium uppercase tracking-widest">{data.applyingFor}</p>
                        </header>

                        <section className="space-y-4">
                          <h2 className="text-lg font-bold uppercase tracking-widest border-b-2 border-black pb-1">Profile</h2>
                          <p className="text-sm text-black/70 leading-relaxed">
                            Dedicated {data.applyingFor} with a proven track record of {data.experienceYears} years in {data.experienceCountry}.
                            Highly skilled in operational tasks and committed to delivering exceptional results.
                          </p>
                        </section>

                        <section className="space-y-6">
                          <h2 className="text-lg font-bold uppercase tracking-widest border-b-2 border-black pb-1">Experience</h2>
                          <div className="space-y-8">
                            {data.experiences.map((exp: Experience) => (
                              <div key={exp.id} className="space-y-1">
                                <div className="flex justify-between items-baseline">
                                  <h3 className="font-bold text-base">{exp.title}</h3>
                                  <span className="text-xs font-bold text-black/40">{exp.duration}</span>
                                </div>
                                <p className="text-sm font-medium text-black/60">{exp.company} | {exp.country}</p>
                              </div>
                            ))}
                            <div className="space-y-1">
                              <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-base">{data.applyingFor}</h3>
                                <span className="text-xs font-bold text-black/40">{data.experienceYears} Years</span>
                              </div>
                              <p className="text-sm font-medium text-black/60">Professional Experience in {data.experienceCountry}</p>
                            </div>
                          </div>
                        </section>

                        <section className="space-y-6">
                          <h2 className="text-lg font-bold uppercase tracking-widest border-b-2 border-black pb-1">Education</h2>
                          <div className="space-y-6">
                            {data.education.map((edu: Education) => (
                              <div key={edu.id} className="space-y-1">
                                <div className="flex justify-between items-baseline">
                                  <h3 className="font-bold text-base">{edu.degree}</h3>
                                  <span className="text-xs font-bold text-black/40">{edu.year}</span>
                                </div>
                                <p className="text-sm font-medium text-black/60">{edu.institution}</p>
                              </div>
                            ))}
                            <div className="space-y-1">
                              <h3 className="font-bold text-base">{data.educationLevel}</h3>
                              <p className="text-sm font-medium text-black/60">Completed Secondary Education</p>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                ) : data.template === 'minimalist' ? (
                  <div className="bg-white text-black shadow-2xl rounded-none overflow-hidden max-w-[210mm] mx-auto min-h-[297mm] p-20 print:shadow-none print:p-12 print:m-0 space-y-12">
                    <header className="flex justify-between items-start border-b-2 border-black pb-8">
                      <div className="space-y-2">
                        <h1 className="text-5xl font-light tracking-tighter">{data.fullName}</h1>
                        <p className="text-xl text-black/40 font-medium tracking-tight">{data.applyingFor}</p>
                      </div>
                      <div className="text-right text-xs space-y-1 font-medium text-black/60">
                        <p>{data.phone}</p>
                        <p>{data.email}</p>
                        <p>{data.address}</p>
                      </div>
                    </header>

                    <section className="grid grid-cols-4 gap-8">
                      <h2 className="col-span-1 text-xs font-bold uppercase tracking-[0.3em] text-black/30">Summary</h2>
                      <p className="col-span-3 text-sm leading-relaxed">
                        Experienced {data.applyingFor} with {data.experienceYears} years of background in {data.experienceCountry}.
                        Focused on efficiency, quality, and professional growth.
                      </p>
                    </section>

                    <section className="grid grid-cols-4 gap-8">
                      <h2 className="col-span-1 text-xs font-bold uppercase tracking-[0.3em] text-black/30">Experience</h2>
                      <div className="col-span-3 space-y-8">
                        {data.experiences.map((exp: Experience) => (
                          <div key={exp.id} className="space-y-1">
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-bold text-lg">{exp.title}</h3>
                              <span className="text-xs font-bold text-black/30">{exp.duration}</span>
                            </div>
                            <p className="text-sm text-black/60">{exp.company}, {exp.country}</p>
                          </div>
                        ))}
                        <div className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-bold text-lg">{data.applyingFor}</h3>
                            <span className="text-xs font-bold text-black/30">{data.experienceYears} Years</span>
                          </div>
                          <p className="text-sm text-black/60">Professional Experience in {data.experienceCountry}</p>
                        </div>
                      </div>
                    </section>

                    <section className="grid grid-cols-4 gap-8">
                      <h2 className="col-span-1 text-xs font-bold uppercase tracking-[0.3em] text-black/30">Education</h2>
                      <div className="col-span-3 space-y-8">
                        {data.education.map((edu: Education) => (
                          <div key={edu.id} className="space-y-1">
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-bold text-lg">{edu.degree}</h3>
                              <span className="text-xs font-bold text-black/30">{edu.year}</span>
                            </div>
                            <p className="text-sm text-black/60">{edu.institution}</p>
                          </div>
                        ))}
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg">{data.educationLevel}</h3>
                          <p className="text-sm text-black/60">Completed Secondary Education</p>
                        </div>
                      </div>
                    </section>

                    <section className="grid grid-cols-4 gap-8">
                      <h2 className="col-span-1 text-xs font-bold uppercase tracking-[0.3em] text-black/30">Details</h2>
                      <div className="col-span-3 grid grid-cols-2 gap-y-4 gap-x-8 text-xs">
                        <div className="flex justify-between border-b border-black/5 pb-1">
                          <span className="text-black/30 font-bold uppercase">Nationality</span>
                          <span className="font-bold">{data.nationality}</span>
                        </div>
                        <div className="flex justify-between border-b border-black/5 pb-1">
                          <span className="text-black/30 font-bold uppercase">Passport</span>
                          <span className="font-bold">{data.passportNumber}</span>
                        </div>
                        <div className="flex justify-between border-b border-black/5 pb-1">
                          <span className="text-black/30 font-bold uppercase">DOB</span>
                          <span className="font-bold">{data.dateOfBirth}</span>
                        </div>
                        <div className="flex justify-between border-b border-black/5 pb-1">
                          <span className="text-black/30 font-bold uppercase">Marital</span>
                          <span className="font-bold">{data.maritalStatus}</span>
                        </div>
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="bg-white text-black shadow-2xl rounded-none overflow-hidden max-w-[210mm] mx-auto min-h-[297mm] p-20 print:shadow-none print:p-12 print:m-0">
                    <div className="text-center space-y-2 mb-12 border-b-4 border-black pb-8">
                      <h1 className="text-4xl font-bold uppercase tracking-[0.2em]">Curriculum Vitae</h1>
                      <div className="text-2xl font-bold uppercase tracking-widest text-black/60">
                        {data.gender.toLowerCase().includes('female') ? 'MS.' : 'MR.'} {data.fullName}
                      </div>
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-black/40">ADDRESS: {data.address}</p>
                    </div>

                    <section className="mb-12">
                      <h2 className="text-xl font-bold uppercase border-b-2 border-black mb-4 py-1 tracking-widest">OBJECTIVE</h2>
                      <p className="text-sm leading-relaxed font-medium text-black/80">
                        Seeking a challenging position in a reputed organization to grow and
                        contribute meaningfully by utilizing my educational background and
                        experience for success of the organization.
                      </p>
                    </section>

                    <section className="mb-12">
                      <h2 className="text-xl font-bold uppercase border-b-2 border-black mb-4 py-1 tracking-widest">PERSONAL DETAILS</h2>
                      <div className="grid grid-cols-1 gap-4 text-sm">
                        <div className="grid grid-cols-2 border-b border-black/5 pb-2"><span className="font-bold uppercase text-[10px] tracking-widest text-black/40">Full Name</span> <span className="font-bold">: {data.fullName}</span></div>
                        <div className="grid grid-cols-2 border-b border-black/5 pb-2"><span className="font-bold uppercase text-[10px] tracking-widest text-black/40">Date of Birth</span> <span className="font-bold">: {data.dateOfBirth}</span></div>
                        <div className="grid grid-cols-2 border-b border-black/5 pb-2"><span className="font-bold uppercase text-[10px] tracking-widest text-black/40">Nationality</span> <span className="font-bold">: {data.nationality}</span></div>
                        <div className="grid grid-cols-2 border-b border-black/5 pb-2"><span className="font-bold uppercase text-[10px] tracking-widest text-black/40">Gender</span> <span className="font-bold">: {data.gender}</span></div>
                        <div className="grid grid-cols-2 border-b border-black/5 pb-2"><span className="font-bold uppercase text-[10px] tracking-widest text-black/40">Height / Weight</span> <span className="font-bold">: {data.height} / {data.weight}</span></div>
                        <div className="grid grid-cols-2 border-b border-black/5 pb-2"><span className="font-bold uppercase text-[10px] tracking-widest text-black/40">Marital Status</span> <span className="font-bold">: {data.maritalStatus}</span></div>
                        <div className="grid grid-cols-2 border-b border-black/5 pb-2"><span className="font-bold uppercase text-[10px] tracking-widest text-black/40">Religion</span> <span className="font-bold">: {data.religion}</span></div>
                        <div className="grid grid-cols-2 border-b border-black/5 pb-2"><span className="font-bold uppercase text-[10px] tracking-widest text-black/40">Father&apos;s Name</span> <span className="font-bold">: {data.fatherName}</span></div>
                        <div className="grid grid-cols-2 border-b border-black/5 pb-2"><span className="font-bold uppercase text-[10px] tracking-widest text-black/40">Language</span> <span className="font-bold">: {data.languages}</span></div>
                        <div className="grid grid-cols-2 border-b border-black/5 pb-2"><span className="font-bold uppercase text-[10px] tracking-widest text-black/40">Education</span> <span className="font-bold">: {data.educationLevel} PASSED</span></div>
                      </div>
                    </section>

                    <section className="mb-12">
                      <h2 className="text-xl font-bold uppercase border-b-2 border-black mb-4 py-1 tracking-widest">PASSPORT DETAILS</h2>
                      <div className="grid grid-cols-1 gap-4 text-sm">
                        <div className="grid grid-cols-2 border-b border-black/5 pb-2"><span className="font-bold uppercase text-[10px] tracking-widest text-black/40">Passport No</span> <span className="font-bold">: {data.passportNumber}</span></div>
                        <div className="grid grid-cols-2 border-b border-black/5 pb-2"><span className="font-bold uppercase text-[10px] tracking-widest text-black/40">Date of issue</span> <span className="font-bold">: {data.dateOfIssue}</span></div>
                        <div className="grid grid-cols-2 border-b border-black/5 pb-2"><span className="font-bold uppercase text-[10px] tracking-widest text-black/40">Date of expiry</span> <span className="font-bold">: {data.dateOfExpiry}</span></div>
                        <div className="grid grid-cols-2 border-b border-black/5 pb-2"><span className="font-bold uppercase text-[10px] tracking-widest text-black/40">Place of issue</span> <span className="font-bold">: {data.placeOfIssue}</span></div>
                      </div>
                    </section>

                    <section className="mb-12">
                      <h2 className="text-xl font-bold uppercase border-b-2 border-black mb-4 py-1 tracking-widest">EXPERIENCE</h2>
                      <div className="space-y-4 text-sm font-medium">
                        <p className="flex items-start gap-4">
                          <span className="bg-black text-white px-2 py-0.5 text-[10px] font-bold">01</span>
                          <span>Worked as a {data.applyingFor.toUpperCase()} in {data.experienceCountry.toUpperCase()} for {data.experienceYears.padStart(2, '0')} years.</span>
                        </p>
                        {data.experiences.map((exp: Experience, i: number) => (
                          <p key={exp.id} className="flex items-start gap-4">
                            <span className="bg-black text-white px-2 py-0.5 text-[10px] font-bold">{(i + 2).toString().padStart(2, '0')}</span>
                            <span>Worked as a {exp.title.toUpperCase()} in {exp.country.toUpperCase()} for {exp.duration}.</span>
                          </p>
                        ))}
                      </div>
                    </section>

                    <div className="mt-20 text-xs italic border-t-2 border-black pt-6 text-center tracking-widest uppercase font-bold text-black/40">
                      <p>I hereby declare that the above information provided by me is true to the best of my knowledge and belief.</p>
                    </div>
                  </div>
                )}

                {/* Page 2: Passport Copy */}
                {data.passportImage && (
                  <div className="bg-white text-black shadow-2xl rounded-none overflow-hidden max-w-[210mm] mx-auto min-h-[297mm] flex flex-col items-center justify-center p-0 print:shadow-none print:m-0 print:break-before-page">
                    <div className="w-full h-full flex items-center justify-center p-8">
                      <img src={data.passportImage} alt="Passport Copy" className="max-w-full max-h-full object-contain shadow-2xl" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                )}

                {/* Page 3: Profile Picture (Full Page) */}
                {data.profilePhoto && (
                  <div className="bg-white text-black shadow-2xl rounded-none overflow-hidden max-w-[210mm] mx-auto min-h-[297mm] flex flex-col items-center justify-center p-0 print:shadow-none print:m-0 print:break-before-page">
                    <div className="w-full h-full flex items-center justify-center p-20">
                      <div className="relative w-full aspect-[3/4] max-w-[160mm]">
                        <div className="absolute -inset-4 border-8 border-black/5"></div>
                        <img src={data.profilePhoto} alt="Full Profile" className="relative w-full h-full object-cover shadow-2xl grayscale" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Page 4+: Certificates (Each on separate page) */}
                {data.certificates.map((cert: { id: string; url: string; name: string }, index: number) => (
                  <div key={cert.id} className="bg-white text-black shadow-2xl rounded-none overflow-hidden max-w-[210mm] mx-auto min-h-[297mm] flex flex-col items-center justify-center p-0 print:shadow-none print:m-0 print:break-before-page">
                    <div className="w-full h-full flex flex-col items-center justify-center p-12">
                      <div className="flex-1 w-full flex items-center justify-center">
                        <img src={cert.url} alt={cert.name} className="max-w-full max-h-[260mm] object-contain shadow-2xl border-4 border-white" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 text-muted-foreground text-sm print:hidden">
        <p>© 2024 Nepal CV Maker. Built with AI.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}

function StepItem({ active, completed, label }: { active: boolean; completed: boolean; label: string }) {
  return (
    <div className={cn(
      "flex items-center gap-2 transition-all",
      active ? "text-primary" : completed ? "text-primary/60" : "text-muted-foreground/40"
    )}>
      {completed ? <CheckCircle2 size={16} /> : <div className={cn("w-4 h-4 rounded-full border-2", active ? "border-primary" : "border-current")} />}
      <span className="text-xs uppercase tracking-wider font-bold">{label}</span>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-serif italic flex items-center gap-2 border-b border-border pb-2">
        <span className="text-primary">{icon}</span> {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", prefix }: { label: string; value: string; onChange: (v: string) => void; type?: string; prefix?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-4 text-sm font-medium text-muted-foreground border-r border-border pr-3 py-1">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={cn(
            "w-full bg-card border border-border rounded-xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
            prefix ? "pl-20 pr-4" : "px-4"
          )}
        />
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
      >
        {options.map((opt: { label: string; value: string }) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

function TemplatePreview({ type, active }: { type: 'elegant' | 'professional' | 'classic' | 'modern_classic' | 'minimalist'; active: boolean }) {
  const baseClasses = cn(
    "w-full aspect-[3/4] rounded-xl border-2 mb-3 overflow-hidden transition-all duration-300 relative group",
    active ? "border-primary shadow-lg scale-[1.02] ring-4 ring-primary/10" : "border-border hover:border-primary/30"
  );

  return (
    <div className={baseClasses}>
      {active && (
        <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground rounded-full p-1 shadow-md">
          <CheckCircle2 size={12} />
        </div>
      )}

      {type === 'elegant' && (
        <div className="h-full bg-white flex">
          <div className="w-1/3 h-full bg-[#fdfcf0] p-2 space-y-2 border-r border-black/5">
            <div className="w-full aspect-square bg-muted/40 rounded-lg" />
            <div className="space-y-1">
              <div className="h-1 w-full bg-muted/30" />
              <div className="h-1 w-2/3 bg-muted/30" />
            </div>
          </div>
          <div className="flex-1 p-3 space-y-3">
            <div className="h-4 w-3/4 bg-primary/10 rounded-sm" />
            <div className="h-1 w-1/4 bg-primary/30" />
            <div className="space-y-1.5">
              <div className="h-1 w-full bg-muted/20" />
              <div className="h-1 w-full bg-muted/20" />
              <div className="h-1 w-2/3 bg-muted/20" />
            </div>
          </div>
        </div>
      )}

      {type === 'professional' && (
        <div className="h-full bg-white flex flex-col">
          <div className="h-1/4 bg-[#1a1a1a] p-2 flex justify-between items-center">
            <div className="space-y-1">
              <div className="h-2 w-16 bg-white/20" />
              <div className="h-1 w-24 bg-white/10" />
            </div>
            <div className="w-6 h-6 bg-white/10 rounded-sm" />
          </div>
          <div className="flex-1 p-3 flex gap-3">
            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <div className="h-1 w-1/2 bg-muted/40" />
                <div className="h-1 w-full bg-muted/20" />
                <div className="h-1 w-full bg-muted/20" />
              </div>
              <div className="space-y-1">
                <div className="h-1 w-1/2 bg-muted/40" />
                <div className="h-1 w-full bg-muted/20" />
              </div>
            </div>
            <div className="w-1/4 bg-muted/5 rounded-sm" />
          </div>
        </div>
      )}

      {type === 'classic' && (
        <div className="h-full bg-white p-4 space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-2 w-24 bg-muted/40" />
            <div className="h-1 w-32 bg-muted/20" />
          </div>
          <div className="space-y-2">
            <div className="h-1 w-16 bg-muted/40 border-b border-muted/40" />
            <div className="space-y-1">
              <div className="h-1 w-full bg-muted/20" />
              <div className="h-1 w-full bg-muted/20" />
              <div className="h-1 w-3/4 bg-muted/20" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-1 w-16 bg-muted/40 border-b border-muted/40" />
            <div className="space-y-1">
              <div className="h-1 w-full bg-muted/20" />
              <div className="h-1 w-full bg-muted/20" />
            </div>
          </div>
        </div>
      )}

      {type === 'modern_classic' && (
        <div className="h-full bg-white flex">
          <div className="w-1/3 bg-muted/10 p-2 space-y-2">
            <div className="w-full aspect-square bg-muted/30 rounded-full" />
            <div className="h-1 w-full bg-muted/40" />
            <div className="h-1 w-full bg-muted/20" />
          </div>
          <div className="flex-1 p-3 space-y-3">
            <div className="h-2 w-1/2 bg-muted/40" />
            <div className="h-1 w-3/4 bg-muted/20" />
            <div className="space-y-1">
              <div className="h-1 w-full bg-muted/10" />
              <div className="h-1 w-full bg-muted/10" />
            </div>
          </div>
        </div>
      )}

      {type === 'minimalist' && (
        <div className="h-full bg-white p-4 space-y-6">
          <div className="flex justify-between items-start border-b border-muted/20 pb-2">
            <div className="h-3 w-20 bg-muted/40" />
            <div className="h-1 w-12 bg-muted/20" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="h-1 w-full bg-muted/20" />
            <div className="col-span-3 h-1 w-full bg-muted/10" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="h-1 w-full bg-muted/20" />
            <div className="col-span-3 h-1 w-full bg-muted/10" />
          </div>
        </div>
      )}
    </div>
  );
}

function Dropzone({ onDrop, accept, icon, title, subtitle }: { onDrop: (files: File[]) => void; accept: any; icon: React.ReactNode; title: string; subtitle: string }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept, multiple: true });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all",
        isDragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-border hover:border-primary/20 hover:bg-card"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center">
        {icon}
        <h3 className="text-lg font-medium mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

