
import React, { useState } from 'react';
import { CROPS, STATE_DISTRICT_MAP, STATES, SOIL_TYPES, SEASONS, TRANSLATIONS } from '../constants';
import { predictYieldMock } from '../services/mockBackend';
import { PredictionResult, Language } from '../types';
// Fixed typo in import from lucide-center to lucide-react
import { Sprout, Calculator, IndianRupee, TrendingUp, MapPin, Droplets, FlaskConical, Ruler } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  language: Language;
  // Added isDarkMode prop to fix the missing variable error
  isDarkMode: boolean;
}

const YieldPredictor: React.FC<Props> = ({ language, isDarkMode }) => {
  const [formData, setFormData] = useState({
    crop: CROPS[0],
    state: STATES[0],
    district: STATE_DISTRICT_MAP[STATES[0]][0],
    soil: SOIL_TYPES[0],
    season: SEASONS[0],
    area: 1.0,
    rainfall: 1000,
    fertilizer: 100
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const t = TRANSLATIONS[language];

  const handleStateChange = (stateName: string) => {
    const districts = STATE_DISTRICT_MAP[stateName] || [];
    setFormData({
      ...formData,
      state: stateName,
      district: districts[0] || ''
    });
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await predictYieldMock(
        formData.crop,
        formData.district,
        formData.soil,
        formData.rainfall,
        formData.fertilizer,
        formData.area
      );
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? [
    { name: 'Your Prediction', value: result.yield, color: '#16a34a' },
    { name: 'District Average', value: result.districtAvg, color: '#94a3b8' }
  ] : [];

  return (
    <div className="bg-white dark:bg-agri-900 rounded-3xl shadow-xl border border-gray-100 dark:border-agri-800 overflow-hidden transition-colors">
      <div className="bg-agri-600 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
            <Calculator size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">{t.predict}</h2>
            <p className="text-agri-100 text-xs font-bold uppercase tracking-widest mt-0.5">Random Forest ML Model</p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* INPUT FORM */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Section: Location & Soil */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 dark:text-agri-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <MapPin size={12} className="text-agri-600 dark:text-agri-400" /> Geography & Environment
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 ml-1">State</label>
                <select 
                  className="w-full rounded-2xl border-gray-300 dark:border-agri-700 border-2 p-3.5 focus:border-agri-600 focus:ring-4 focus:ring-agri-50 dark:focus:ring-agri-800 transition-all bg-white dark:bg-agri-800 text-agri-900 dark:text-white font-bold shadow-sm cursor-pointer"
                  value={formData.state}
                  onChange={e => handleStateChange(e.target.value)}
                >
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 ml-1">District</label>
                <select 
                  className="w-full rounded-2xl border-gray-300 dark:border-agri-700 border-2 p-3.5 focus:border-agri-600 focus:ring-4 focus:ring-agri-50 dark:focus:ring-agri-800 transition-all bg-white dark:bg-agri-800 text-agri-900 dark:text-white font-bold shadow-sm cursor-pointer"
                  value={formData.district}
                  onChange={e => setFormData({...formData, district: e.target.value})}
                >
                  {(STATE_DISTRICT_MAP[formData.state] || []).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 ml-1">Soil Type</label>
              <select 
                className="w-full rounded-2xl border-gray-300 dark:border-agri-700 border-2 p-3.5 focus:border-agri-600 focus:ring-4 focus:ring-agri-50 dark:focus:ring-agri-800 transition-all bg-white dark:bg-agri-800 text-agri-900 dark:text-white font-bold shadow-sm cursor-pointer"
                value={formData.soil}
                onChange={e => setFormData({...formData, soil: e.target.value})}
              >
                {SOIL_TYPES.map(s => <option key={s} value={s}>{s} Soil</option>)}
              </select>
            </div>
          </div>

          {/* Section: Crop Selection */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 dark:text-agri-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Sprout size={12} className="text-agri-600 dark:text-agri-400" /> Target Crop
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {CROPS.map(crop => (
                <button
                  key={crop}
                  onClick={() => setFormData({...formData, crop})}
                  className={`py-4 rounded-2xl text-xs transition-all border-2 flex items-center justify-center font-black uppercase tracking-tighter ${
                    formData.crop === crop
                      ? 'bg-agri-600 text-white border-agri-600 shadow-xl shadow-agri-100 dark:shadow-agri-950/20 -translate-y-1'
                      : 'bg-white dark:bg-agri-800 text-agri-800 dark:text-agri-300 border-gray-100 dark:border-agri-700 hover:border-agri-200 dark:hover:border-agri-500 hover:bg-agri-50 dark:hover:bg-agri-700'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Farm Parameters */}
          <div className="space-y-4">
             <h3 className="text-[10px] font-black text-gray-400 dark:text-agri-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Ruler size={12} className="text-agri-600 dark:text-agri-400" /> Farming Inputs
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 ml-1 flex items-center gap-1">
                   <Ruler size={10} /> Farm Size (Ha)
                </label>
                <input 
                  type="number" step="0.1"
                  value={formData.area}
                  onChange={e => setFormData({...formData, area: parseFloat(e.target.value) || 0})}
                  className="w-full p-4 border-2 border-gray-200 dark:border-agri-700 rounded-2xl focus:border-agri-500 focus:ring-4 focus:ring-agri-50 dark:focus:ring-agri-800 transition-all bg-white dark:bg-agri-800 text-agri-950 dark:text-white font-black text-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 ml-1 flex items-center gap-1">
                  <FlaskConical size={10} /> Fertilizer (Kg)
                </label>
                <input 
                  type="number"
                  value={formData.fertilizer}
                  onChange={e => setFormData({...formData, fertilizer: parseInt(e.target.value) || 0})}
                  className="w-full p-4 border-2 border-gray-200 dark:border-agri-700 rounded-2xl focus:border-agri-500 focus:ring-4 focus:ring-agri-50 dark:focus:ring-agri-800 transition-all bg-white dark:bg-agri-800 text-agri-950 dark:text-white font-black text-xl"
                />
              </div>
            </div>

            <div className="bg-agri-50/50 dark:bg-agri-800/50 p-6 rounded-3xl border border-agri-100 dark:border-agri-700">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[11px] font-black text-agri-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <Droplets size={14} /> Expected Rainfall
                </label>
                <span className="text-xl font-black text-agri-700 dark:text-agri-400 bg-white dark:bg-agri-900 px-4 py-1.5 rounded-2xl shadow-sm border border-agri-100 dark:border-agri-700">
                  {formData.rainfall} <span className="text-xs uppercase opacity-50">mm</span>
                </span>
              </div>
              <input 
                type="range" min="0" max="2500" step="50"
                value={formData.rainfall}
                onChange={e => setFormData({...formData, rainfall: Number(e.target.value)})}
                className="w-full h-3 bg-gray-200 dark:bg-agri-700 rounded-full appearance-none cursor-pointer accent-agri-600 dark:accent-agri-400"
              />
              <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400">
                <span>DROUGHT</span>
                <span>OPTIMAL (1000-1500)</span>
                <span>EXCESSIVE</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full py-5 bg-agri-600 hover:bg-agri-700 text-white font-black text-lg rounded-[2rem] shadow-2xl shadow-agri-200 dark:shadow-agri-950 transition-all flex justify-center items-center gap-3 transform active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent" />
                <span>{t.loading}</span>
              </>
            ) : (
              <>
                <Calculator size={24} /> {t.submit}
              </>
            )}
          </button>
        </div>

        {/* RESULTS PANEL */}
        <div className="lg:col-span-2 bg-gray-50/50 dark:bg-agri-800/30 rounded-[3rem] p-8 border border-gray-100 dark:border-agri-800 flex flex-col justify-start relative overflow-hidden transition-colors">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-pulse">
              <div className="w-24 h-24 bg-white dark:bg-agri-800 rounded-[2rem] flex items-center justify-center text-agri-200 dark:text-agri-700 shadow-inner">
                <Sprout size={48} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-agri-950 dark:text-white font-black text-lg">Awaiting Parameters</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm font-bold mt-1 px-4">Fill in your farm details to see precision AI predictions.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-10 animate-fade-in relative z-10">
              <div className="text-center">
                <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] font-black mb-3">{t.yieldResult}</p>
                <div className="text-7xl font-black text-agri-950 dark:text-white my-4 tracking-tighter">
                  {result.yield.toLocaleString()}
                </div>
                <div className="text-agri-600 dark:text-agri-400 font-bold text-xl uppercase tracking-widest -mt-2">Kilograms / Ha</div>
                
                <div className="mt-8 flex justify-center">
                  <div className="inline-flex items-center gap-2 bg-agri-950 dark:bg-agri-600 text-white text-[10px] px-4 py-2 rounded-full font-black uppercase tracking-[0.15em] shadow-xl">
                    <TrendingUp size={14} className="text-agri-400 dark:text-agri-100" /> {t.confidence}: {result.accuracy}%
                  </div>
                </div>
              </div>

              <div className="h-56 w-full bg-white dark:bg-agri-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-agri-800 shadow-sm overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{fontSize: 9, fontWeight: 'bold', fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{fill: 'rgba(22, 163, 74, 0.05)'}} 
                      // Fixed isDarkMode error by destructuring it from props
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)', padding: '12px', backgroundColor: isDarkMode ? '#14532d' : '#fff', color: isDarkMode ? '#fff' : '#000' }}
                    />
                    <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={60}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white dark:bg-agri-800 p-6 rounded-[2rem] border border-gray-100 dark:border-agri-700 shadow-sm text-center transition-colors">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mb-2">{t.savings}</p>
                    <p className="text-2xl font-black text-agri-600 dark:text-agri-400 flex justify-center items-center gap-1.5">
                      <IndianRupee size={20} /> {result.costSaving.toLocaleString()}
                    </p>
                 </div>
                 <div className="bg-white dark:bg-agri-800 p-6 rounded-[2rem] border border-gray-100 dark:border-agri-700 shadow-sm text-center transition-colors">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mb-2">Confidence</p>
                    <p className="text-sm font-black text-agri-950 dark:text-agri-100">
                      {result.confidenceLow} - {result.confidenceHigh}
                    </p>
                 </div>
              </div>
              
              <div className="bg-agri-950 dark:bg-agri-800 p-6 rounded-[2.5rem] text-white transition-colors">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-agri-400 mb-2">Smart Recommendation</h4>
                 <p className="text-xs font-medium leading-relaxed italic">
                   "Based on your district average of <b>{result.districtAvg} kg/ha</b>, you are performing {result.yield > result.districtAvg ? 'above' : 'below'} standard. {result.yield > result.districtAvg ? 'Optimize storage logistics for excess yield.' : 'Review soil nitrogen levels for optimization.'}"
                 </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YieldPredictor;
