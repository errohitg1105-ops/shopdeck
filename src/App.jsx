import React, { useState, useMemo, useEffect } from 'react';
import initialRecords from './data/hits_gc_sellers.json';
import { fetchMappingsFromSupabase } from './services/supabase.js';
import {
  Users,
  UserCheck,
  Briefcase,
  Layers,
  Search,
  Filter,
  Download,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Info,
  Database,
  Cloud,
  X,
  Mail,
  Building2,
  TrendingUp,
  Radio,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserCheck2,
  ArrowRight,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState(initialRecords);
  const [dataSource, setDataSource] = useState('local');
  const [supabaseTotal, setSupabaseTotal] = useState(18749);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [selectedGC, setSelectedGC] = useState('');
  const [selectedGM, setSelectedGM] = useState('');
  const [selectedGL, setSelectedGL] = useState('');
  const [selectedKAM, setSelectedKAM] = useState('');
  const [selectedHitStatus, setSelectedHitStatus] = useState('');
  const [selectedGoLive, setSelectedGoLive] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals
  const [selectedGCDetails, setSelectedGCDetails] = useState(null);
  const [showSqlModal, setShowSqlModal] = useState(false);

  // Connect to Supabase to verify sync status
  useEffect(() => {
    async function checkSupabase() {
      try {
        const res = await fetchMappingsFromSupabase();
        if (res.totalCount) {
          setSupabaseTotal(res.totalCount);
          setDataSource('supabase');
        }
      } catch (err) {
        console.warn('Supabase status check:', err);
      }
    }
    checkSupabase();
  }, []);

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dropdown list options
  const segments = useMemo(() => {
    const set = new Set();
    records.forEach(r => {
      if (r.business_segment) set.add(r.business_segment.trim());
    });
    // Order: HITS, PARTNER HIT, REVENUE, SELF SERVE, then others
    const priority = ['HITS', 'PARTNER HIT', 'REVENUE', 'SELF SERVE', 'ONBOARDING', 'DEACTIVATED'];
    return Array.from(set).sort((a, b) => {
      const idxA = priority.indexOf(a);
      const idxB = priority.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [records]);

  const gcs = useMemo(() => {
    const set = new Set();
    records.forEach(r => {
      if (r.gc_name && r.gc_name.trim() && r.gc_name !== 'Unassigned') set.add(r.gc_name.trim());
    });
    return Array.from(set).sort();
  }, [records]);

  const gms = useMemo(() => {
    const set = new Set();
    records.forEach(r => {
      if (r.gm_name && r.gm_name.trim() && r.gm_name !== '#N/A') set.add(r.gm_name.trim());
    });
    return Array.from(set).sort();
  }, [records]);

  const gls = useMemo(() => {
    const set = new Set();
    records.forEach(r => {
      if (r.gl_name && r.gl_name.trim() && r.gl_name !== '#N/A') set.add(r.gl_name.trim());
    });
    return Array.from(set).sort();
  }, [records]);

  const kams = useMemo(() => {
    const set = new Set();
    records.forEach(r => {
      if (r.kam_name && r.kam_name.trim() && r.kam_name !== '#N/A') set.add(r.kam_name.trim());
    });
    return Array.from(set).sort();
  }, [records]);

  const hitStatuses = useMemo(() => {
    const set = new Set();
    records.forEach(r => {
      if (r.hit_status && r.hit_status.trim()) set.add(r.hit_status.trim());
    });
    return Array.from(set).sort();
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(item => {
      const matchSearch =
        !searchTerm ||
        (item.seller_name && item.seller_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.seller_id && item.seller_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.business_segment && item.business_segment.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.gc_name && item.gc_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.gm_name && item.gm_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.gl_name && item.gl_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.kam_name && item.kam_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.hit_status && item.hit_status.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchSegment = !selectedSegment || item.business_segment === selectedSegment;
      const matchGC = !selectedGC || item.gc_name === selectedGC;
      const matchGM = !selectedGM || item.gm_name === selectedGM;
      const matchGL = !selectedGL || item.gl_name === selectedGL;
      const matchKAM = !selectedKAM || item.kam_name === selectedKAM;
      const matchHitStatus = !selectedHitStatus || item.hit_status === selectedHitStatus;
      const matchGoLive =
        !selectedGoLive ||
        (selectedGoLive === 'yes' && (item.go_live_sellers === 'Yes' || item.go_live_sellers === '1' || item.go_live_sellers === 1)) ||
        (selectedGoLive === 'no' && item.go_live_sellers !== 'Yes' && item.go_live_sellers !== '1' && item.go_live_sellers !== 1);

      return matchSearch && matchSegment && matchGC && matchGM && matchGL && matchKAM && matchHitStatus && matchGoLive;
    });
  }, [records, searchTerm, selectedSegment, selectedGC, selectedGM, selectedGL, selectedKAM, selectedHitStatus, selectedGoLive]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalSellers = records.length;
    const liveSellers = records.filter(r => r.go_live_sellers === 'Yes' || r.go_live_sellers === 1 || r.go_live_sellers === '1').length;
    
    // Segment breakdown
    const segmentCounts = {};
    const segmentLiveCounts = {};
    records.forEach(r => {
      const seg = r.business_segment || 'UNCLASSIFIED';
      segmentCounts[seg] = (segmentCounts[seg] || 0) + 1;
      if (r.go_live_sellers === 'Yes' || r.go_live_sellers === 1 || r.go_live_sellers === '1') {
        segmentLiveCounts[seg] = (segmentLiveCounts[seg] || 0) + 1;
      }
    });

    const uniqueGCs = gcs.length;
    const uniqueGMs = gms.length;
    const uniqueGLs = gls.length;
    const uniqueKAMs = kams.length;

    // GC workload breakdown
    const gcCounts = {};
    const gcLiveCounts = {};
    records.forEach(r => {
      const name = r.gc_name || 'Unassigned';
      if (name !== 'Unassigned') {
        gcCounts[name] = (gcCounts[name] || 0) + 1;
        if (r.go_live_sellers === 'Yes' || r.go_live_sellers === 1 || r.go_live_sellers === '1') {
          gcLiveCounts[name] = (gcLiveCounts[name] || 0) + 1;
        }
      }
    });

    const sortedGCs = Object.entries(gcCounts)
      .map(([name, count]) => ({
        name,
        count,
        liveCount: gcLiveCounts[name] || 0,
        rate: Math.round(((gcLiveCounts[name] || 0) / count) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    const maxCount = sortedGCs.length > 0 ? sortedGCs[0].count : 1;
    const avgPerGc = uniqueGCs > 0 ? Math.round(totalSellers / uniqueGCs) : 0;
    const liveRate = totalSellers > 0 ? Math.round((liveSellers / totalSellers) * 100) : 0;

    // GM breakdown
    const gmCounts = {};
    records.forEach(r => {
      const gm = r.gm_name || 'Direct / Unassigned';
      if (gm !== '#N/A' && gm.trim()) {
        gmCounts[gm] = (gmCounts[gm] || 0) + 1;
      }
    });

    const sortedGMs = Object.entries(gmCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalSellers,
      liveSellers,
      liveRate,
      segmentCounts,
      segmentLiveCounts,
      uniqueGCs,
      uniqueGMs,
      uniqueGLs,
      uniqueKAMs,
      avgPerGc,
      topGCs: sortedGCs.slice(0, 8),
      sortedGMs: sortedGMs.slice(0, 6),
      maxCount
    };
  }, [records, gcs, gms, gls, kams]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Export CSV with full Question 7753 + Business Segment fields
  const exportToCSV = () => {
    const headers = [
      "Seller ID",
      "Seller Name",
      "Business Segment",
      "Account Status",
      "Hit Status",
      "Go-Live Status",
      "Growth Consultant (GC)",
      "Growth Lead (GL)",
      "Growth Manager (GM)",
      "Key Account Manager (KAM)",
      "Assistant Manager",
      "AM Seller Experience",
      "Go-Live POC",
      "Onboarding POC",
      "Key Account Executive"
    ];

    const rows = filteredRecords.map(r => [
      `"${r.seller_id || ''}"`,
      `"${(r.seller_name || '').replace(/"/g, '""')}"`,
      `"${r.business_segment || ''}"`,
      `"${r.seller_account_status || ''}"`,
      `"${r.hit_status || ''}"`,
      `"${r.go_live_sellers || 'No'}"`,
      `"${(r.gc_name || '').replace(/"/g, '""')}"`,
      `"${(r.gl_name || '').replace(/"/g, '""')}"`,
      `"${(r.gm_name || '').replace(/"/g, '""')}"`,
      `"${(r.kam_name || '').replace(/"/g, '""')}"`,
      `"${(r.assistant_manager_name || '').replace(/"/g, '""')}"`,
      `"${(r.am_name || '').replace(/"/g, '""')}"`,
      `"${(r.golive_poc_name || '').replace(/"/g, '""')}"`,
      `"${(r.onboarding_poc_name || '').replace(/"/g, '""')}"`,
      `"${(r.key_account_executive_name || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shopdeck_seller_manager_segments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Inspect GC modal
  const inspectGC = (gcName) => {
    if (!gcName || gcName === 'Unassigned') return;
    const mapped = records.filter(r => r.gc_name === gcName);
    const liveCount = mapped.filter(r => r.go_live_sellers === 'Yes' || r.go_live_sellers === 1 || r.go_live_sellers === '1').length;
    const sample = mapped[0] || {};
    setSelectedGCDetails({
      name: gcName,
      gm_name: sample.gm_name || 'Not assigned',
      gl_name: sample.gl_name || 'Not assigned',
      kam_name: sample.kam_name || 'Not assigned',
      am_name: sample.assistant_manager_name || sample.am_name || 'Not assigned',
      sellers: mapped,
      liveCount,
      conversionRate: Math.round((liveCount / mapped.length) * 100)
    });
  };

  const isLive = (val) => val === 'Yes' || val === 1 || val === '1';

  // Badge renderer for business segment
  const renderSegmentBadge = (segment) => {
    switch (segment) {
      case 'PARTNER HIT':
        return (
          <span
            className="badge"
            style={{
              background: 'rgba(217, 70, 239, 0.18)',
              color: '#f0abfc',
              border: '1px solid rgba(217, 70, 239, 0.4)',
              fontSize: '11px',
              padding: '2px 8px',
              fontWeight: 600
            }}
          >
            <Sparkles size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
            PARTNER HIT
          </span>
        );
      case 'HITS':
        return (
          <span
            className="badge"
            style={{
              background: 'rgba(99, 102, 241, 0.18)',
              color: '#a5b4fc',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              fontSize: '11px',
              padding: '2px 8px',
              fontWeight: 600
            }}
          >
            <Zap size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
            HITS
          </span>
        );
      case 'REVENUE':
        return (
          <span
            className="badge"
            style={{
              background: 'rgba(16, 185, 129, 0.18)',
              color: '#6ee7b7',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              fontSize: '11px',
              padding: '2px 8px',
              fontWeight: 600
            }}
          >
            <TrendingUp size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
            REVENUE
          </span>
        );
      case 'SELF SERVE':
        return (
          <span
            className="badge"
            style={{
              background: 'rgba(245, 158, 11, 0.18)',
              color: '#fde047',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              fontSize: '11px',
              padding: '2px 8px',
              fontWeight: 600
            }}
          >
            SELF SERVE
          </span>
        );
      case 'DEACTIVATED':
        return (
          <span
            className="badge"
            style={{
              background: 'rgba(148, 163, 184, 0.12)',
              color: '#94a3b8',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              fontSize: '11px',
              padding: '2px 8px'
            }}
          >
            DEACTIVATED
          </span>
        );
      case 'ONBOARDING':
        return (
          <span
            className="badge"
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#7dd3fc',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontSize: '11px',
              padding: '2px 8px'
            }}
          >
            ONBOARDING
          </span>
        );
      default:
        return (
          <span
            className="badge"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#cbd5e1',
              fontSize: '11px',
              padding: '2px 8px'
            }}
          >
            {segment || '—'}
          </span>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="brand-section">
          <div className="brand-logo">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="brand-title">Shopdeck Intelligence</h1>
            <p className="brand-subtitle">
              <span>Seller-Manager Mapping & Segment Classification</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <a
                href="https://metabase.kaip.in/question/7753-seller-manager-mapping"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#818cf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <span>Question #7753</span>
                <ExternalLink size={12} />
              </a>
            </p>
          </div>
        </div>

        <div className="header-badges">
          <div className="badge badge-metabase">
            <Database size={13} />
            <span className="pulse-dot"></span>
            <span>Metabase Q7753 Enriched</span>
          </div>

          <div className="badge badge-supabase">
            <Cloud size={13} />
            <span>Supabase Cloud ({supabaseTotal.toLocaleString()} Rows)</span>
          </div>

          <button
            onClick={() => setShowSqlModal(true)}
            className="btn btn-outline"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <Info size={14} />
            <span>Card 7753 SQL</span>
          </button>

          <button
            onClick={exportToCSV}
            className="btn btn-outline"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      {/* KPI Cards: Segmentation Breakdown */}
      <section className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #6366f1' }}>
          <div className="stat-header">
            <span className="stat-label">HITS Segment</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Zap size={18} />
            </div>
          </div>
          <div className="stat-value">{(stats.segmentCounts['HITS'] || 0).toLocaleString()}</div>
          <div className="stat-subtext">
            <span style={{ color: '#34d399' }}>{(stats.segmentLiveCounts['HITS'] || 0).toLocaleString()} Live</span>
            {' • '}Core managed portfolio
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #d946ef' }}>
          <div className="stat-header">
            <span className="stat-label">PARTNER HIT</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(217, 70, 239, 0.18)', color: '#e879f9' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#f0abfc' }}>
            {(stats.segmentCounts['PARTNER HIT'] || 0).toLocaleString()}
          </div>
          <div className="stat-subtext">
            <span style={{ color: '#34d399' }}>100% Go-Live</span>
            {' • '}Strategic partner accounts
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-header">
            <span className="stat-label">REVENUE Segment</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#34d399' }}>
            {(stats.segmentCounts['REVENUE'] || 0).toLocaleString()}
          </div>
          <div className="stat-subtext">
            <span style={{ color: '#34d399' }}>{(stats.segmentLiveCounts['REVENUE'] || 0).toLocaleString()} Live</span>
            {' • '}Key Accounts tier
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-header">
            <span className="stat-label">SELF SERVE</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#fbbf24' }}>
            {(stats.segmentCounts['SELF SERVE'] || 0).toLocaleString()}
          </div>
          <div className="stat-subtext">
            <span style={{ color: '#34d399' }}>{(stats.segmentLiveCounts['SELF SERVE'] || 0).toLocaleString()} Live</span>
            {' • '}Automated ads accounts
          </div>
        </div>
      </section>

      {/* Visual Analytics Grid */}
      <section className="analytics-grid">
        {/* Left: Top GCs Workload Distribution */}
        <div className="panel">
          <div className="panel-title">
            <span>Top Growth Consultants by Seller Allocation</span>
            <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 400 }}>
              Click any GC to inspect or filter
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {stats.topGCs.map((gc) => {
              const pct = Math.round((gc.count / stats.maxCount) * 100);
              const isSelected = selectedGC === gc.name;
              return (
                <div
                  key={gc.name}
                  className="gc-workload-item"
                  style={{
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.5)'
                  }}
                  onClick={() => setSelectedGC(selectedGC === gc.name ? '' : gc.name)}
                >
                  <div className="gc-workload-header">
                    <span className="gc-workload-name" title={gc.name}>{gc.name}</span>
                    <span className="gc-workload-count">{gc.count} sellers</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--text-dim)' }}>
                    <span style={{ color: '#34d399' }}>● {gc.liveCount} Go-Live</span>
                    <span>{gc.rate}% rate</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: GM Pods Breakdown */}
        <div className="panel">
          <div className="panel-title">
            <span>Growth Manager Pods</span>
            <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 400 }}>
              Filter by Management Pod
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.sortedGMs.map(gm => {
              const isSelected = selectedGM === gm.name;
              return (
                <div
                  key={gm.name}
                  onClick={() => setSelectedGM(selectedGM === gm.name ? '' : gm.name)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    border: isSelected ? '1px solid var(--secondary)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#ffffff' }}>{gm.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Growth Manager</div>
                  </div>
                  <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd' }}>
                    {gm.count.toLocaleString()} sellers
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Filter & Data Table */}
      <section className="panel" style={{ padding: '20px' }}>
        {/* Segment Quick Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginRight: '6px' }}>
            BUSINESS SEGMENT:
          </span>
          <button
            className={`pill-btn ${!selectedSegment ? 'active' : ''}`}
            onClick={() => {
              setSelectedSegment('');
              setCurrentPage(1);
            }}
          >
            All Segments ({records.length.toLocaleString()})
          </button>

          <button
            className={`pill-btn ${selectedSegment === 'HITS' ? 'active' : ''}`}
            style={{
              borderColor: selectedSegment === 'HITS' ? '#6366f1' : undefined,
              color: selectedSegment === 'HITS' ? '#a5b4fc' : undefined
            }}
            onClick={() => {
              setSelectedSegment(selectedSegment === 'HITS' ? '' : 'HITS');
              setCurrentPage(1);
            }}
          >
            HITS ({(stats.segmentCounts['HITS'] || 0).toLocaleString()})
          </button>

          <button
            className={`pill-btn ${selectedSegment === 'PARTNER HIT' ? 'active' : ''}`}
            style={{
              borderColor: selectedSegment === 'PARTNER HIT' ? '#d946ef' : undefined,
              color: selectedSegment === 'PARTNER HIT' ? '#f0abfc' : undefined,
              background: selectedSegment === 'PARTNER HIT' ? 'rgba(217, 70, 239, 0.2)' : undefined
            }}
            onClick={() => {
              setSelectedSegment(selectedSegment === 'PARTNER HIT' ? '' : 'PARTNER HIT');
              setCurrentPage(1);
            }}
          >
            <Sparkles size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            PARTNER HIT ({(stats.segmentCounts['PARTNER HIT'] || 0).toLocaleString()})
          </button>

          <button
            className={`pill-btn ${selectedSegment === 'REVENUE' ? 'active' : ''}`}
            style={{
              borderColor: selectedSegment === 'REVENUE' ? '#10b981' : undefined,
              color: selectedSegment === 'REVENUE' ? '#6ee7b7' : undefined
            }}
            onClick={() => {
              setSelectedSegment(selectedSegment === 'REVENUE' ? '' : 'REVENUE');
              setCurrentPage(1);
            }}
          >
            REVENUE ({(stats.segmentCounts['REVENUE'] || 0).toLocaleString()})
          </button>

          <button
            className={`pill-btn ${selectedSegment === 'SELF SERVE' ? 'active' : ''}`}
            style={{
              borderColor: selectedSegment === 'SELF SERVE' ? '#f59e0b' : undefined,
              color: selectedSegment === 'SELF SERVE' ? '#fde047' : undefined
            }}
            onClick={() => {
              setSelectedSegment(selectedSegment === 'SELF SERVE' ? '' : 'SELF SERVE');
              setCurrentPage(1);
            }}
          >
            SELF SERVE ({(stats.segmentCounts['SELF SERVE'] || 0).toLocaleString()})
          </button>

          <button
            className={`pill-btn ${selectedSegment === 'ONBOARDING' ? 'active' : ''}`}
            onClick={() => {
              setSelectedSegment(selectedSegment === 'ONBOARDING' ? '' : 'ONBOARDING');
              setCurrentPage(1);
            }}
          >
            ONBOARDING ({(stats.segmentCounts['ONBOARDING'] || 0).toLocaleString()})
          </button>

          <button
            className={`pill-btn ${selectedSegment === 'DEACTIVATED' ? 'active' : ''}`}
            onClick={() => {
              setSelectedSegment(selectedSegment === 'DEACTIVATED' ? '' : 'DEACTIVATED');
              setCurrentPage(1);
            }}
          >
            DEACTIVATED ({(stats.segmentCounts['DEACTIVATED'] || 0).toLocaleString()})
          </button>
        </div>

        {/* Search & Dropdown Filters */}
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search Seller Name, ID, GC, GM, GL, or KAM..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="select-filter"
            value={selectedSegment}
            onChange={(e) => {
              setSelectedSegment(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Business Segments</option>
            {segments.map(seg => <option key={seg} value={seg}>{seg}</option>)}
          </select>

          <select
            className="select-filter"
            value={selectedGC}
            onChange={(e) => {
              setSelectedGC(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Growth Consultants ({gcs.length})</option>
            {gcs.map(gc => <option key={gc} value={gc}>{gc}</option>)}
          </select>

          <select
            className="select-filter"
            value={selectedGM}
            onChange={(e) => {
              setSelectedGM(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Growth Managers ({gms.length})</option>
            {gms.map(gm => <option key={gm} value={gm}>{gm}</option>)}
          </select>

          <select
            className="select-filter"
            value={selectedGL}
            onChange={(e) => {
              setSelectedGL(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Growth Leads ({gls.length})</option>
            {gls.map(gl => <option key={gl} value={gl}>{gl}</option>)}
          </select>

          <select
            className="select-filter"
            value={selectedKAM}
            onChange={(e) => {
              setSelectedKAM(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All KAMs ({kams.length})</option>
            {kams.map(kam => <option key={kam} value={kam}>{kam}</option>)}
          </select>

          <select
            className="select-filter"
            value={selectedGoLive}
            onChange={(e) => {
              setSelectedGoLive(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Live Status</option>
            <option value="yes">Go-Live Only (Yes)</option>
            <option value="no">Pending Go-Live (No)</option>
          </select>

          {(searchTerm || selectedSegment || selectedGC || selectedGM || selectedGL || selectedKAM || selectedHitStatus || selectedGoLive) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSegment('');
                setSelectedGC('');
                setSelectedGM('');
                setSelectedGL('');
                setSelectedKAM('');
                setSelectedHitStatus('');
                setSelectedGoLive('');
                setCurrentPage(1);
              }}
              className="btn btn-outline"
              style={{ padding: '8px 12px', fontSize: '12px' }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Quick GC Filter Pills */}
        <div className="quick-pills">
          <span style={{ fontSize: '12px', color: 'var(--text-dim)', alignSelf: 'center', marginRight: '4px' }}>
            Quick GC Filter:
          </span>
          <button
            className={`pill-btn ${!selectedGC ? 'active' : ''}`}
            onClick={() => setSelectedGC('')}
          >
            All GCs
          </button>
          {stats.topGCs.map(gc => (
            <button
              key={gc.name}
              className={`pill-btn ${selectedGC === gc.name ? 'active' : ''}`}
              onClick={() => setSelectedGC(selectedGC === gc.name ? '' : gc.name)}
            >
              {gc.name} ({gc.count})
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Seller Account</th>
                <th>Seller ID</th>
                <th>Business Segment</th>
                <th>Go-Live</th>
                <th>Growth Consultant (GC)</th>
                <th>Growth Lead / Manager</th>
                <th>Key Account Manager</th>
                <th>Operations Support</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                    No mapping records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((item, idx) => {
                  const live = isLive(item.go_live_sellers);
                  return (
                    <tr key={`${item.seller_id}-${idx}`}>
                      <td>
                        <div className="seller-name">
                          <Building2 size={16} color={item.business_segment === 'PARTNER HIT' ? '#e879f9' : (live ? '#34d399' : '#818cf8')} />
                          <span title={item.seller_name}>{item.seller_name || 'Unnamed Seller'}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <code style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>
                            {item.seller_id ? `${item.seller_id.slice(0, 8)}...` : 'N/A'}
                          </code>
                          {item.seller_id && (
                            <button
                              className="copy-btn"
                              title="Copy full Seller ID"
                              onClick={() => handleCopy(item.seller_id, `seller-${item.seller_id}`)}
                            >
                              {copiedId === `seller-${item.seller_id}` ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                            </button>
                          )}
                        </div>
                      </td>

                      <td>
                        {renderSegmentBadge(item.business_segment)}
                      </td>

                      <td>
                        {live ? (
                          <span
                            className="badge"
                            style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '11px', padding: '2px 8px' }}
                          >
                            <CheckCircle2 size={11} />
                            Live
                          </span>
                        ) : (
                          <span
                            className="badge"
                            style={{ background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', fontSize: '11px', padding: '2px 8px' }}
                          >
                            Pending
                          </span>
                        )}
                      </td>

                      <td>
                        <span
                          className="gc-badge"
                          title="Click to view GC portfolio"
                          onClick={() => inspectGC(item.gc_name)}
                        >
                          <UserCheck size={12} />
                          <span>{item.gc_name || 'Unassigned'}</span>
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 500 }}>
                            {item.gm_name || '—'}
                          </span>
                          {item.gl_name && (
                            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                              GL: {item.gl_name}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '13px', color: item.kam_name ? '#cbd5e1' : 'var(--text-dim)' }}>
                          {item.kam_name || '—'}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          {item.assistant_manager_name && (
                            <span>AM: {item.assistant_manager_name}</span>
                          )}
                          {item.golive_poc_name && (
                            <span style={{ color: '#38bdf8' }}>POC: {item.golive_poc_name}</span>
                          )}
                          {!item.assistant_manager_name && !item.golive_poc_name && (
                            <span>—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="pagination">
          <div>
            Showing {filteredRecords.length > 0 ? ((currentPage - 1) * pageSize + 1).toLocaleString() : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredRecords.length).toLocaleString()} of {filteredRecords.length.toLocaleString()} mapped records
          </div>

          <div className="page-controls">
            <button
              className="page-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span style={{ padding: '6px 12px', fontSize: '12px' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* GC Detail Modal */}
      {selectedGCDetails && (
        <div className="modal-overlay" onClick={() => setSelectedGCDetails(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                  {selectedGCDetails.name}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Growth Consultant Portfolio Analysis
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedGCDetails(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>TOTAL SELLERS</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-light)' }}>
                    {selectedGCDetails.sellers.length}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>GO-LIVE SELLERS</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#34d399' }}>
                    {selectedGCDetails.liveCount}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>CONVERSION</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#fbbf24' }}>
                    {selectedGCDetails.conversionRate}%
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>GROWTH MANAGER</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedGCDetails.gm_name}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
                  Portfolio Sellers ({selectedGCDetails.sellers.length})
                </h4>
                <button
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => {
                    setSelectedGC(selectedGCDetails.name);
                    setSelectedGCDetails(null);
                    setCurrentPage(1);
                  }}
                >
                  Filter Main Table
                </button>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <tbody>
                    {selectedGCDetails.sellers.map((s, idx) => {
                      const live = isLive(s.go_live_sellers);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#ffffff' }}>
                            {s.seller_name || 'Unnamed'}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            {renderSegmentBadge(s.business_segment)}
                          </td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                            {s.seller_id}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                            {live ? (
                              <span style={{ color: '#34d399', fontSize: '11px', fontWeight: 600 }}>● Live</span>
                            ) : (
                              <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>Pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SQL Modal for Metabase Question 7753 */}
      {showSqlModal && (
        <div className="modal-overlay" onClick={() => setShowSqlModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                  Metabase Question #7753 & Segment SQL Architecture
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  https://metabase.kaip.in/question/7753-seller-manager-mapping
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowSqlModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ fontSize: '13px', color: '#cbd5e1' }}>
              <p style={{ marginBottom: '12px' }}>
                Optimized SQL query with explicit <b>PARTNER HIT</b> status separation:
              </p>

              <div style={{ background: '#020617', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', fontFamily: 'monospace', fontSize: '12px', color: '#38bdf8', overflowX: 'auto', marginBottom: '16px' }}>
                {`SELECT DISTINCT
  c.seller_id,
  COALESCE(c.company_name, '') AS seller_name,
  CASE 
    WHEN LOWER(c.seller_account_status) = 'hit' THEN 'HITS'
    WHEN LOWER(c.seller_account_status) = 'partner-hit' THEN 'PARTNER HIT'
    WHEN LOWER(c.seller_account_status) = 'revenue' THEN 'REVENUE'
    WHEN LOWER(c.seller_account_status) = 'self-serve' THEN 'SELF SERVE'
    WHEN LOWER(c.seller_account_status) = 'deactivated' THEN 'DEACTIVATED'
    WHEN LOWER(c.seller_account_status) = 'onboarding' THEN 'ONBOARDING'
    WHEN LOWER(c.seller_account_status) = 'pre-onboarding' THEN 'PRE-ONBOARDING'
    ELSE UPPER(COALESCE(c.seller_account_status, 'UNCLASSIFIED'))
  END AS business_segment,
  c.seller_account_status,
  c.go_live_sellers,
  c.gc_id,
  c.gc_name,
  c.gl_id,
  c.gl_name,
  c.gm_id,
  c.gm_name,
  c.kam_id,
  c.kam_name,
  c.assistant_manager_name,
  c.am_name,
  c.golive_poc_name,
  c.onboarding_poc_name
FROM \`blitzscale-prod-project.analytics.seller_console_metrics_summary\` c
ORDER BY business_segment, gc_name, seller_name;`}
              </div>

              <h4 style={{ fontWeight: 600, color: '#ffffff', marginBottom: '6px' }}>Segment Distribution:</h4>
              <ul style={{ paddingLeft: '20px', lineHeight: 1.8 }}>
                <li><b>HITS:</b> 11,375 managed sellers</li>
                <li><b style={{ color: '#f0abfc' }}>PARTNER HIT:</b> 129 partner sellers (100% Go-Live)</li>
                <li><b style={{ color: '#34d399' }}>REVENUE:</b> 2,214 Key Account sellers</li>
                <li><b style={{ color: '#fbbf24' }}>SELF SERVE:</b> 1,574 self-serve advertising accounts</li>
                <li><b>DEACTIVATED / ONBOARDING:</b> 3,457 accounts</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}