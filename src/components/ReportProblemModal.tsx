import React, { useState } from 'react';
import { useCivicStore } from '../context/CivicStore';
import { t, translateCategory } from '../utils/i18n';
import { ComplaintCategory, SeverityLevel } from '../types';
import { GVMC_LOCALITIES } from '../utils/geo';
import { Camera, MapPin, UploadCloud, AlertCircle, CheckCircle2, X, Sparkles, Navigation } from 'lucide-react';

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (complaintId: string) => void;
  openVoiceAssistant?: () => void;
}

const CATEGORIES: ComplaintCategory[] = [
  'garbage_solid_waste',
  'drainage_sewerage',
  'water_supply',
  'roads_potholes',
  'streetlights',
  'sanitation',
  'stormwater_flooding',
  'stray_animals',
  'infrastructure',
  'parks',
  'encroachment',
  'other'
];

export const ReportProblemModal: React.FC<ReportProblemModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  openVoiceAssistant
}) => {
  const { language, submitComplaint } = useCivicStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('garbage_solid_waste');
  const [description, setDescription] = useState('');
  const [locality, setLocality] = useState(GVMC_LOCALITIES[0].name);
  const [wardNumber, setWardNumber] = useState(GVMC_LOCALITIES[0].ward);
  const [addressDetails, setAddressDetails] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [severity, setSeverity] = useState<SeverityLevel>('High');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [coordinates, setCoordinates] = useState({
    lat: GVMC_LOCALITIES[0].lat,
    lng: GVMC_LOCALITIES[0].lng
  });

  const handleLocalityChange = (locName: string) => {
    setLocality(locName);
    const found = GVMC_LOCALITIES.find(l => l.name === locName);
    if (found) {
      setWardNumber(found.ward);
      setCoordinates({ lat: found.lat, lng: found.lng });
    }
  };

  const handleDetectGps = () => {
    setGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setCoordinates({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4))
          });
          setGpsLoading(false);
        },
        () => {
          // Fallback to MVP Colony GPS
          setCoordinates({ lat: 17.7410, lng: 83.3340 });
          setGpsLoading(false);
        },
        { timeout: 5000 }
      );
    } else {
      setGpsLoading(false);
    }
  };

  // Sample photo attachments for quick demonstration
  const samplePhotos = [
    { label: 'Garbage Dump Overflow', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80' },
    { label: 'Deep Road Pothole', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80' },
    { label: 'Broken Water Pipe', url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const urls = evidenceUrl ? [evidenceUrl] : [samplePhotos[0].url];
      const created = await submitComplaint({
        title,
        description,
        category,
        locality,
        wardNumber,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        addressDetails: addressDetails || `${locality}, Ward ${wardNumber}`,
        isAnonymous,
        evidenceUrls: urls,
        originalLanguage: language,
        severity
      });

      setIsSubmitting(false);
      onSuccess(created.id);
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-[#E5EAF0] text-[#142B45] relative">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E5EAF0] flex items-center justify-between bg-[#F8FAFC] sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F9D92]"></span>
              <span className="text-xs font-bold text-[#0F9D92] uppercase tracking-wider">
                GVMC Citizen Grievance Portal
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#142B45] mt-0.5">
              {t(language, 'formTitle')}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {openVoiceAssistant && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openVoiceAssistant();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F9D92]/10 text-[#0F9D92] hover:bg-[#0F9D92]/20 text-xs font-bold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Use Voice Assistant</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded text-[#64748B] hover:text-[#142B45] hover:bg-[#F1F5F9]"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Title */}
          <div>
            <label className="block font-semibold text-[#142B45] mb-1">
              {t(language, 'fieldTitle')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t(language, 'fieldTitlePlaceholder')}
              className="w-full px-3 py-2 rounded-lg border border-[#E5EAF0] focus:outline-none focus:border-[#0F9D92] text-sm text-[#142B45]"
            />
          </div>

          {/* Category & Severity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#142B45] mb-1">
                {t(language, 'fieldCategory')}
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ComplaintCategory)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5EAF0] bg-white text-[#142B45] focus:outline-none focus:border-[#0F9D92]"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {translateCategory(language, cat)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#142B45] mb-1">
                Severity Assessment
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as SeverityLevel)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5EAF0] bg-white text-[#142B45] focus:outline-none focus:border-[#0F9D92]"
              >
                <option value="Critical">Critical (Immediate Hazard / Burst / Cave-in)</option>
                <option value="High">High (Severe Civic Inconvenience)</option>
                <option value="Medium">Medium (Standard Municipal Defect)</option>
                <option value="Low">Low (Minor / Routine Maintenance)</option>
              </select>
            </div>
          </div>

          {/* Locality & Ward */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#142B45] mb-1">
                {t(language, 'fieldLocality')}
              </label>
              <select
                value={locality}
                onChange={e => handleLocalityChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5EAF0] bg-white text-[#142B45] focus:outline-none focus:border-[#0F9D92]"
              >
                {GVMC_LOCALITIES.map(loc => (
                  <option key={loc.name} value={loc.name}>
                    {language === 'te' ? loc.teluguName : loc.name} (Ward {loc.ward})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#142B45] mb-1">
                GPS Coordinates
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5EAF0] bg-[#F8FAFC] text-[#64748B] font-mono-tabular"
                />
                <button
                  type="button"
                  onClick={handleDetectGps}
                  className="px-2.5 py-2 rounded-lg border border-[#E5EAF0] hover:bg-[#F1F5F9] text-[#0F9D92] flex items-center gap-1 font-semibold whitespace-nowrap"
                  title="Detect GPS location"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{gpsLoading ? 'Detecting...' : 'GPS'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Street Address Details */}
          <div>
            <label className="block font-semibold text-[#142B45] mb-1">
              {t(language, 'fieldAddress')}
            </label>
            <input
              type="text"
              value={addressDetails}
              onChange={e => setAddressDetails(e.target.value)}
              placeholder={t(language, 'fieldAddressPlaceholder')}
              className="w-full px-3 py-2 rounded-lg border border-[#E5EAF0] focus:outline-none focus:border-[#0F9D92] text-[#142B45]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-[#142B45] mb-1">
              {t(language, 'fieldDescription')} <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t(language, 'fieldDescPlaceholder')}
              className="w-full px-3 py-2 rounded-lg border border-[#E5EAF0] focus:outline-none focus:border-[#0F9D92] text-[#142B45] leading-relaxed"
            />
          </div>

          {/* Evidence Upload & Sample Selector */}
          <div>
            <label className="block font-semibold text-[#142B45] mb-1.5">
              {t(language, 'fieldEvidence')}
            </label>
            <div className="p-3 bg-[#F8FAFC] rounded-lg border border-dashed border-[#CBD5E1] space-y-2">
              <div className="flex items-center gap-2 text-[#64748B]">
                <Camera className="w-4 h-4 text-[#0F9D92]" />
                <span>Select a sample evidence photo or enter an image URL:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {samplePhotos.map((photo, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setEvidenceUrl(photo.url)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors border ${
                      evidenceUrl === photo.url
                        ? 'bg-[#0F9D92] text-white border-[#0F9D92]'
                        : 'bg-white text-[#142B45] border-[#E5EAF0] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {photo.label}
                  </button>
                ))}
              </div>
              <input
                type="url"
                value={evidenceUrl}
                onChange={e => setEvidenceUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-3 py-1.5 bg-white rounded border border-[#E5EAF0] text-xs text-[#142B45]"
              />
            </div>
          </div>

          {/* Privacy Anonymous Checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="anonymousCheck"
              checked={isAnonymous}
              onChange={e => setIsAnonymous(e.target.checked)}
              className="mt-0.5 rounded text-[#0F9D92] focus:ring-[#0F9D92]"
            />
            <label htmlFor="anonymousCheck" className="text-xs text-[#64748B] cursor-pointer">
              {t(language, 'fieldAnonymous')}
            </label>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-[#E5EAF0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E5EAF0] text-[#64748B] hover:text-[#142B45] hover:bg-[#F8FAFC] font-medium"
            >
              {t(language, 'cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-[#0F9D92] hover:bg-[#0A726A] text-white font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? t(language, 'submitting') : 'Submit & Connect to Complaint DNA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
