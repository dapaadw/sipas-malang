import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DistrictKpi, DistrictWasteRecord, TpaProfile } from '../types/sipas';
import { formatInt, formatNumber, formatPercent } from '../utils/format';

interface MalangMapProps {
  districts: DistrictWasteRecord[];
  districtKpis: DistrictKpi[];
  tpaProfile: TpaProfile;
  selectedDistrictId?: string | null;
  onSelectDistrict?: (id: string) => void;
  focusMode?: 'city' | 'tpa';
  heightClass?: string;
}

function getDistrictColor(tonHari: number | null): string {
  if (tonHari === null) return '#64748B';
  if (tonHari >= 160) return '#15803D';
  if (tonHari >= 150) return '#2563EB';
  if (tonHari >= 140) return '#0EA5E9';
  return '#10B981';
}

function getDistrictRadius(tonHari: number | null): number {
  if (tonHari === null) return 14;
  return Math.max(13, Math.min(26, (tonHari - 90) * 0.25 + 12));
}

export const MalangMap: React.FC<MalangMapProps> = ({
  districts,
  districtKpis,
  tpaProfile,
  selectedDistrictId,
  onSelectDistrict,
  focusMode = 'city',
  heightClass = 'h-[360px]',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const initialCenter: [number, number] =
      focusMode === 'tpa' ? [tpaProfile.lat, tpaProfile.lng] : [-7.9778, 112.625];
    const initialZoom = focusMode === 'tpa' ? 13 : 12;

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerGroupRef.current = group;

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, [focusMode, tpaProfile.lat, tpaProfile.lng]);

  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // Render 5 district proportional circle markers
    districts.forEach((d) => {
      const kpi = districtKpis.find((k) => k.id === d.id);
      const isSelected = selectedDistrictId === d.id;
      const color = getDistrictColor(d.tonHari);
      const radius = getDistrictRadius(d.tonHari);

      const marker = L.circleMarker([d.lat, d.lng], {
        radius: isSelected ? radius + 3 : radius,
        color: isSelected ? '#0F172A' : '#FFFFFF',
        weight: isSelected ? 3 : 2,
        fillColor: color,
        fillOpacity: isSelected ? 0.92 : 0.78,
      });

      const popupHtml = `
        <div style="min-width:190px;font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:12px;line-height:1.5;">
          <div style="font-weight:700;font-size:13px;color:#0F172A;margin-bottom:4px;">Kec. ${d.nama}</div>
          <div style="display:flex;justify-content:space-between;gap:12px;">
            <span style="color:#64748B;">Timbulan:</span>
            <strong style="color:#0F172A;">${formatNumber(d.tonHari)} ton/hari</strong>
          </div>
          <div style="display:flex;justify-content:space-between;gap:12px;">
            <span style="color:#64748B;">Tahunan:</span>
            <span>${formatNumber(d.tonTahun)} ton/thn</span>
          </div>
          <div style="display:flex;justify-content:space-between;gap:12px;">
            <span style="color:#64748B;">Kontribusi:</span>
            <span>${formatPercent(kpi?.kontribusiPersen ?? null)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;gap:12px;">
            <span style="color:#64748B;">Penduduk:</span>
            <span>${formatInt(d.penduduk)} jiwa</span>
          </div>
          <div style="margin-top:6px;padding-top:5px;border-top:1px solid #E2E8F0;font-size:11px;color:#475569;">
            Estimasi DLH ${d.tahun} (bukan tonase aktual TPA)
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.bindTooltip(`${d.nama}: ${formatNumber(d.tonHari)} t/hr`, {
        direction: 'top',
        offset: [0, -radius + 2],
      });

      marker.on('click', () => {
        onSelectDistrict?.(d.id);
      });

      marker.addTo(group);
    });

    // Render custom divIcon for TPA Supit Urang
    const tpaIcon = L.divIcon({
      className: 'sipas-tpa-marker',
      iconSize: [148, 34],
      iconAnchor: [74, 17],
      html: `
        <div style="display:inline-flex;align-items:center;gap:6px;background:#B45309;color:#FFFFFF;padding:5px 10px;border-radius:9999px;font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:11px;font-weight:700;box-shadow:0 4px 10px rgba(180,83,9,0.35);border:2px solid #FFFFFF;white-space:nowrap;">
          <span style="width:7px;height:7px;border-radius:9999px;background:#FDE68A;display:inline-block;"></span>
          TPA Supit Urang
        </div>
      `,
    });

    const tpaMarker = L.marker([tpaProfile.lat, tpaProfile.lng], {
      icon: tpaIcon,
    });

    tpaMarker.bindPopup(`
      <div style="min-width:220px;font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:12px;line-height:1.5;">
        <div style="font-weight:700;font-size:13px;color:#92400E;margin-bottom:4px;">${tpaProfile.nama}</div>
        <p style="margin:0 0 6px;color:#475569;">${tpaProfile.alamat}</p>
        <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:6px;padding:6px 8px;color:#78350F;font-size:11px;">
          <strong>Layanan Kota:</strong> Melayani seluruh 5 kecamatan Kota Malang (bukan hanya Sukun). Dilengkapi jembatan timbang &amp; WIS.
        </div>
      </div>
    `);

    tpaMarker.addTo(group);
    if (focusMode === 'tpa') {
      tpaMarker.openPopup();
    }
  }, [districts, districtKpis, tpaProfile, selectedDistrictId, onSelectDistrict, focusMode]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#E5EAE7] bg-white">
      <div ref={containerRef} className={`w-full ${heightClass} z-0`} />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-[#FAFBF9] px-4 py-2.5 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#15803D]" />
            &ge; 160 ton/hari
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#2563EB]" />
            150–159 ton/hari
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#0EA5E9]" />
            140–149 ton/hari
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#10B981]" />
            &lt; 140 ton/hari
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-amber-800">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-600 ring-2 ring-amber-200" />
            TPA Supit Urang (Layanan Kota)
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Klik titik kecamatan untuk detail
        </span>
      </div>
    </div>
  );
};
