import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Complaint, UnderlyingCivicIssue, ComplaintCategory, SeverityLevel } from '../types';
import { useCivicStore } from '../context/CivicStore';
import { t, translateCategory, translateStatus, translateSeverity } from '../utils/i18n';
import { GVMC_LOCALITIES } from '../utils/geo';
import { MapPin, Layers, Flame, Filter, Eye, CheckCircle2, AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface GisMapProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  highlightComplaintId?: string;
  onSelectComplaint?: (complaint: Complaint) => void;
  onSelectHotspot?: (issue: UnderlyingCivicIssue) => void;
}

export const GisMap: React.FC<GisMapProps> = ({
  initialCenter = [17.7410, 83.3340], // Visakhapatnam / MVP Colony baseline
  initialZoom = 13,
  highlightComplaintId,
  onSelectComplaint,
  onSelectHotspot
}) => {
  const { language, complaints, underlyingIssues } = useCivicStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const hotspotsLayerRef = useRef<L.LayerGroup | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedLocality, setSelectedLocality] = useState<string>('all');
  const [showHotspotsOnly, setShowHotspotsOnly] = useState<boolean>(false);
  const [showUnresolvedOnly, setShowUnresolvedOnly] = useState<boolean>(false);
  const [activeModalItem, setActiveModalItem] = useState<{
    type: 'complaint' | 'hotspot';
    item: Complaint | UnderlyingCivicIssue;
  } | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: true
    });

    // Standard Leaflet + OpenStreetMap tiles (no API key required, zero watermark)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    const hotspotsLayer = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = markersLayer;
    hotspotsLayerRef.current = hotspotsLayer;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    if (showHotspotsOnly) return false;
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && c.severity !== selectedSeverity) return false;
    if (selectedLocality !== 'all' && c.locality !== selectedLocality) return false;
    if (showUnresolvedOnly && (c.status === 'Resolved' || c.status === 'Closed')) return false;
    return true;
  });

  // Filter underlying issues
  const filteredHotspots = underlyingIssues.filter(h => {
    if (selectedCategory !== 'all' && h.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && h.severity !== selectedSeverity) return false;
    if (selectedLocality !== 'all' && h.locality !== selectedLocality) return false;
    return true;
  });

  // Render markers and hotspots on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const hotspotsLayer = hotspotsLayerRef.current;
    if (!map || !markersLayer || !hotspotsLayer) return;

    markersLayer.clearLayers();
    hotspotsLayer.clearLayers();

    // 1. Render Underlying Civic Issue Hotspots (Complaint DNA)
    filteredHotspots.forEach(hotspot => {
      // Density radius based on report count and priority
      const radiusMeters = Math.min(450, 150 + hotspot.reportCount * 60);

      // Outer heat wave circle
      const heatCircle = L.circle([hotspot.latitude, hotspot.longitude], {
        radius: radiusMeters,
        color: hotspot.severity === 'Critical' ? '#D94B4B' : '#0F9D92',
        fillColor: hotspot.severity === 'Critical' ? '#D94B4B' : '#0F9D92',
        fillOpacity: 0.16,
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(hotspotsLayer);

      // Inner concentrated core circle
      const coreCircle = L.circleMarker([hotspot.latitude, hotspot.longitude], {
        radius: 14,
        color: '#FFFFFF',
        weight: 2,
        fillColor: hotspot.severity === 'Critical' ? '#D94B4B' : '#0F9D92',
        fillOpacity: 0.95
      }).addTo(hotspotsLayer);

      coreCircle.bindTooltip(
        `<div style="font-weight: 700; font-size: 11px;">DNA HOTSPOT: ${hotspot.reportCount} Reports</div><div>${hotspot.title}</div>`,
        { direction: 'top', offset: [0, -10] }
      );

      coreCircle.on('click', () => {
        setActiveModalItem({ type: 'hotspot', item: hotspot });
        if (onSelectHotspot) onSelectHotspot(hotspot);
      });
      heatCircle.on('click', () => {
        setActiveModalItem({ type: 'hotspot', item: hotspot });
        if (onSelectHotspot) onSelectHotspot(hotspot);
      });
    });

    // 2. Render Individual Complaints
    filteredComplaints.forEach(complaint => {
      const isResolved = complaint.status === 'Resolved' || complaint.status === 'Closed';
      const isCritical = complaint.severity === 'Critical';

      const markerColor = isResolved
        ? '#16865A' // Success Green
        : isCritical
        ? '#D94B4B' // Error Red
        : complaint.severity === 'High'
        ? '#D99225' // Warning Amber
        : '#0F9D92'; // Civic Teal

      const marker = L.circleMarker([complaint.latitude, complaint.longitude], {
        radius: 7,
        fillColor: markerColor,
        color: '#FFFFFF',
        weight: 1.5,
        fillOpacity: 0.9
      }).addTo(markersLayer);

      marker.bindTooltip(
        `<div style="font-size: 11px; font-weight: 600;">${complaint.id}</div><div>${complaint.title}</div><div style="font-size: 10px; color: #64748B;">${complaint.locality} · Ward ${complaint.wardNumber}</div>`,
        { direction: 'top', offset: [0, -6] }
      );

      marker.on('click', () => {
        setActiveModalItem({ type: 'complaint', item: complaint });
        if (onSelectComplaint) onSelectComplaint(complaint);
      });
    });
  }, [filteredComplaints, filteredHotspots]);

  // Handle fly to locality
  const handleLocalityChange = (locName: string) => {
    setSelectedLocality(locName);
    if (locName !== 'all') {
      const loc = GVMC_LOCALITIES.find(l => l.name === locName);
      if (loc && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([loc.lat, loc.lng], 14, { duration: 1.2 });
      }
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(initialCenter, initialZoom, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-[620px] rounded-xl overflow-hidden border border-[#E5EAF0] shadow-sm bg-white">
      {/* Top Map Controls Bar */}
      <div className="absolute top-3 left-3 right-14 z-[400] flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg border border-[#E5EAF0] shadow-sm text-xs">
        <div className="flex items-center gap-1.5 font-medium text-[#142B45] pr-2 border-r border-[#E5EAF0]">
          <Layers className="w-3.5 h-3.5 text-[#0F9D92]" />
          <span>GIS Intelligence</span>
        </div>

        {/* Locality Selector */}
        <select
          value={selectedLocality}
          onChange={e => handleLocalityChange(e.target.value)}
          className="bg-[#F8FAFC] border border-[#E5EAF0] rounded px-2 py-1 text-[#142B45] focus:outline-none focus:border-[#0F9D92]"
          aria-label="Filter by GVMC Locality"
        >
          <option value="all">All 17 GVMC Localities</option>
          {GVMC_LOCALITIES.map(l => (
            <option key={l.name} value={l.name}>
              {language === 'te' ? l.teluguName : l.name} (Ward {l.ward})
            </option>
          ))}
        </select>

        {/* Category Selector */}
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="bg-[#F8FAFC] border border-[#E5EAF0] rounded px-2 py-1 text-[#142B45] focus:outline-none focus:border-[#0F9D92]"
          aria-label="Filter by Civic Category"
        >
          <option value="all">All Categories</option>
          <option value="garbage_solid_waste">Garbage & Solid Waste</option>
          <option value="drainage_sewerage">Drainage & Sewerage</option>
          <option value="water_supply">Water Supply</option>
          <option value="roads_potholes">Roads & Potholes</option>
          <option value="streetlights">Streetlights</option>
          <option value="stormwater_flooding">Stormwater & Flooding</option>
          <option value="encroachment">Encroachment</option>
        </select>

        {/* Severity Selector */}
        <select
          value={selectedSeverity}
          onChange={e => setSelectedSeverity(e.target.value)}
          className="bg-[#F8FAFC] border border-[#E5EAF0] rounded px-2 py-1 text-[#142B45] focus:outline-none focus:border-[#0F9D92]"
          aria-label="Filter by Severity"
        >
          <option value="all">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Toggles */}
        <button
          onClick={() => setShowHotspotsOnly(!showHotspotsOnly)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            showHotspotsOnly
              ? 'bg-[#0F9D92] text-white font-medium'
              : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#142B45] border border-[#E5EAF0]'
          }`}
        >
          <Flame className="w-3 h-3" />
          <span>Hotspots Only</span>
        </button>

        <button
          onClick={() => setShowUnresolvedOnly(!showUnresolvedOnly)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            showUnresolvedOnly
              ? 'bg-[#142B45] text-white font-medium'
              : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#142B45] border border-[#E5EAF0]'
          }`}
        >
          <span>Unresolved Only</span>
        </button>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-[400] flex items-center gap-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#E5EAF0] text-xs text-[#64748B] shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0F9D92]"></span>
          <span>Active Complaint</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D94B4B]"></span>
          <span>Critical Severity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#16865A]"></span>
          <span>Verified Resolved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full border border-[#0F9D92] bg-[#0F9D92]/20 flex items-center justify-center text-[8px] font-bold text-[#0F9D92]">
            DNA
          </span>
          <span>Recurring Hotspot</span>
        </div>
      </div>

      {/* Detailed Modal on Marker Click */}
      {activeModalItem && (
        <div className="absolute inset-0 z-[500] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90%] overflow-y-auto p-5 border border-[#E5EAF0]">
            <div className="flex items-start justify-between pb-3 border-b border-[#E5EAF0]">
              <div>
                <span className="text-xs font-semibold text-[#0F9D92] uppercase tracking-wider">
                  {activeModalItem.type === 'hotspot' ? 'Complaint DNA Cluster' : activeModalItem.item.id}
                </span>
                <h3 className="text-base font-bold text-[#142B45] mt-0.5">
                  {activeModalItem.item.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="p-1 rounded text-[#64748B] hover:text-[#142B45] hover:bg-[#F1F5F9]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              {activeModalItem.type === 'hotspot' ? (
                // Hotspot Details
                (() => {
                  const issue = activeModalItem.item as UnderlyingCivicIssue;
                  return (
                    <>
                      <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E5EAF0] space-y-1.5">
                        <div className="flex justify-between items-center text-[#142B45] font-medium">
                          <span>Recurrence Intensity:</span>
                          <span className="font-bold text-[#0F9D92]">{issue.recurrenceFrequency} ({issue.reportCount} Reports)</span>
                        </div>
                        <div className="flex justify-between items-center text-[#64748B]">
                          <span>Priority Score:</span>
                          <span className="font-mono-tabular font-bold text-[#142B45]">{issue.priorityScore}/100</span>
                        </div>
                        <div className="flex justify-between items-center text-[#64748B]">
                          <span>Location:</span>
                          <span className="text-[#142B45]">{issue.locality} · Ward {issue.wardNumber}</span>
                        </div>
                        <div className="flex justify-between items-center text-[#64748B]">
                          <span>Cluster Span:</span>
                          <span className="font-mono-tabular">{issue.aiExplainability.geographicProximityMeters}m radius</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-[#142B45] mb-1">Root Cause Analysis</h4>
                        <p className="text-[#64748B] leading-relaxed">{issue.rootCauseAnalysis || issue.summary}</p>
                      </div>

                      <div className="pt-2 border-t border-[#E5EAF0]">
                        <h4 className="font-semibold text-[#142B45] mb-1.5">Linked Citizen Complaints ({issue.complaintIds.length})</h4>
                        <div className="space-y-1.5">
                          {issue.complaintIds.map(cid => (
                            <div key={cid} className="p-2 bg-[#F1F5F9] rounded flex justify-between items-center">
                              <span className="font-mono-tabular font-medium text-[#142B45]">{cid}</span>
                              <span className="text-[#0F9D92] font-medium">Linked Record</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()
              ) : (
                // Individual Complaint Details
                (() => {
                  const comp = activeModalItem.item as Complaint;
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-2 p-3 bg-[#F8FAFC] rounded-lg border border-[#E5EAF0]">
                        <div>
                          <span className="text-[#64748B] block text-[11px]">Category</span>
                          <span className="font-medium text-[#142B45]">{translateCategory(language, comp.category)}</span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[11px]">Status</span>
                          <span className="font-medium text-[#0F9D92]">{translateStatus(language, comp.status)}</span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[11px]">Locality & Ward</span>
                          <span className="font-medium text-[#142B45]">{comp.locality} (Ward {comp.wardNumber})</span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[11px]">Severity</span>
                          <span className="font-medium text-[#D94B4B]">{translateSeverity(language, comp.severity)}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-[#142B45] mb-1">Description</h4>
                        <p className="text-[#64748B] leading-relaxed">{comp.description}</p>
                      </div>

                      {comp.dnaClusterName && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-900">
                          <span className="font-bold block text-[11px]">Complaint DNA Link:</span>
                          <span>{comp.dnaClusterName} ({comp.dnaConfidence}% match)</span>
                        </div>
                      )}

                      {comp.evidence.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-[#142B45] mb-1.5">Photographic Evidence</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {comp.evidence.map(ev => (
                              <div key={ev.id} className="rounded border border-[#E5EAF0] overflow-hidden">
                                <img
                                  src={ev.url}
                                  alt={ev.caption || 'Evidence'}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-24 object-cover"
                                />
                                <span className="block p-1 text-[10px] text-[#64748B] truncate">{ev.caption}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()
              )}
            </div>

            <div className="pt-3 border-t border-[#E5EAF0] flex justify-end">
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-1.5 rounded-lg bg-[#142B45] text-white text-xs font-medium hover:bg-[#1e3b5e]"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
