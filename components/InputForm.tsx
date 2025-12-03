import React, { useState, useEffect } from 'react';
import { Gender, UserInput } from '../types';

interface InputFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [step, setStep] = useState(1);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const [formData, setFormData] = useState<UserInput>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
    gender: Gender.MALE,
  });

  // Derived state for split inputs
  const [dateParts, setDateParts] = useState({ day: '', month: '', year: '' });
  const [timeParts, setTimeParts] = useState({ hour: '', minute: '' });

  // Sync formData to local state when entering step 2 or when formData updates externally (if ever)
  useEffect(() => {
    if (formData.birthDate) {
      const [y, m, d] = formData.birthDate.split('-');
      setDateParts({ year: y, month: m, day: d });
    }
    if (formData.birthTime) {
      const [h, m] = formData.birthTime.split(':');
      setTimeParts({ hour: h, minute: m });
    }
  }, []); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field: 'day' | 'month' | 'year', value: string) => {
      if (value && !/^\d*$/.test(value)) return; // Numbers only
      
      const newParts = { ...dateParts, [field]: value };
      
      // Limit lengths
      if (field === 'day' && value.length > 2) newParts.day = value.slice(0, 2);
      if (field === 'month' && value.length > 2) newParts.month = value.slice(0, 2);
      if (field === 'year' && value.length > 4) newParts.year = value.slice(0, 4);

      setDateParts(newParts);

      const y = newParts.year;
      const m = newParts.month;
      const d = newParts.day;
      if (y || m || d) {
         setFormData(prev => ({ ...prev, birthDate: `${y}-${m}-${d}` })); 
      }
  };

  const handleTimeChange = (field: 'hour' | 'minute', value: string) => {
      if (value && !/^\d*$/.test(value)) return;
      
      const newParts = { ...timeParts, [field]: value };
      
      if (value.length > 2) newParts[field] = value.slice(0, 2);
      
      setTimeParts(newParts);
      
      const h = newParts.hour;
      const m = newParts.minute;
      if (h || m) {
          setFormData(prev => ({ ...prev, birthTime: `${h}:${m}` }));
      }
  };


  const handleGeolocation = () => {
    if (!navigator.geolocation) {
        setLocationStatus('error');
        return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
        (position) => {
            setFormData(prev => ({
                ...prev,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                birthLocation: prev.birthLocation || '当前位置 (GPS)' 
            }));
            setLocationStatus('success');
        },
        (err) => {
            console.error(err);
            setLocationStatus('error');
        }
    );
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && !formData.name) return;
    
    if (step === 2) {
        // Validate Date
        const d = parseInt(dateParts.day);
        const m = parseInt(dateParts.month);
        const y = parseInt(dateParts.year);
        
        if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100) {
            alert("请输入有效的公历日期");
            return;
        }

        // Validate Time
        const hr = parseInt(timeParts.hour);
        const min = parseInt(timeParts.minute);
        
        if (isNaN(hr) || hr < 0 || hr > 23 || isNaN(min) || min < 0 || min > 59) {
            alert("请输入有效的时间 (0-23 时, 0-59 分)");
            return;
        }

        const formattedDate = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        const formattedTime = `${hr.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        
        setFormData(prev => ({ ...prev, birthDate: formattedDate, birthTime: formattedTime }));
    }

    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.birthDate && formData.birthTime && formData.birthLocation) {
      onSubmit(formData);
    }
  };

  const progressWidth = `${(step / 3) * 100}%`;

  return (
    <div className="w-full max-w-lg mx-auto bg-paper/95 backdrop-blur-md rounded-lg shadow-2xl border border-stone-300 relative overflow-hidden flex flex-col min-h-[450px] sm:min-h-[500px]">
       {/* Top Progress Bar */}
       <div className="h-1 w-full bg-stone-200">
            <div className="h-full bg-red-seal transition-all duration-500 ease-out" style={{ width: progressWidth }}></div>
       </div>

      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-stone-800 opacity-80 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-stone-800 opacity-80 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-stone-800 opacity-80 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-stone-800 opacity-80 pointer-events-none"></div>

      <div className="text-center pt-8 sm:pt-10 pb-4 px-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-stone-900 text-gold rounded-full flex items-center justify-center text-xl sm:text-2xl font-serif font-bold mx-auto mb-2 border-2 border-gold shadow-lg">
            {step === 1 ? '一' : step === 2 ? '二' : '三'}
        </div>
        <h2 className="text-xl sm:text-2xl font-serif text-ink tracking-widest font-bold">
             {step === 1 && "定名分阴阳"}
             {step === 2 && "生辰落八字"}
             {step === 3 && "落地定方位"}
        </h2>
        <p className="text-stone-500 font-serif text-[10px] sm:text-xs mt-1">
             {step === 1 && "姓名与性别"}
             {step === 2 && "出生日期与时间"}
             {step === 3 && "出生地点"}
        </p>
      </div>

      <div className="flex-1 px-4 sm:px-8 py-4 relative">
        <form onSubmit={step === 3 ? handleSubmit : handleNext} className="h-full flex flex-col justify-between">
          
          {/* Step 1: Name & Gender */}
          {step === 1 && (
             <div className="space-y-6 sm:space-y-8 animate-fade-in">
                <div>
                    <label className="block text-stone-600 text-xs font-bold mb-2 uppercase tracking-wider text-center">缘主姓名</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="请输入姓名"
                        autoFocus
                        className="w-full bg-transparent border-b-2 border-stone-300 text-stone-900 text-2xl sm:text-3xl font-serif py-2 focus:border-red-seal focus:outline-none placeholder-stone-300 text-center transition-colors"
                        required
                    />
                </div>
                <div>
                    <label className="block text-stone-600 text-xs font-bold mb-4 uppercase tracking-wider text-center">阴阳性别</label>
                    <div className="flex gap-4 sm:gap-6 justify-center">
                        <label className={`cursor-pointer w-28 sm:w-32 py-3 sm:py-4 border-2 rounded-lg text-center transition-all duration-300 font-serif flex flex-col items-center gap-1 sm:gap-2 ${formData.gender === Gender.MALE ? 'border-stone-800 bg-stone-800 text-paper shadow-md scale-105' : 'border-stone-200 hover:border-stone-400 text-stone-400'}`}>
                            <input
                                type="radio"
                                name="gender"
                                value={Gender.MALE}
                                checked={formData.gender === Gender.MALE}
                                onChange={handleChange}
                                className="hidden"
                            />
                            <span className="text-lg sm:text-xl">乾造 (男)</span>
                        </label>
                        <label className={`cursor-pointer w-28 sm:w-32 py-3 sm:py-4 border-2 rounded-lg text-center transition-all duration-300 font-serif flex flex-col items-center gap-1 sm:gap-2 ${formData.gender === Gender.FEMALE ? 'border-red-seal bg-red-seal text-white shadow-md scale-105' : 'border-stone-200 hover:border-stone-400 text-stone-400'}`}>
                            <input
                                type="radio"
                                name="gender"
                                value={Gender.FEMALE}
                                checked={formData.gender === Gender.FEMALE}
                                onChange={handleChange}
                                className="hidden"
                            />
                            <span className="text-lg sm:text-xl">坤造 (女)</span>
                        </label>
                    </div>
                </div>
             </div>
          )}

          {/* Step 2: Date & Time (Custom Split Inputs) */}
          {step === 2 && (
            <div className="space-y-6 sm:space-y-8 animate-fade-in px-0 sm:px-4">
                {/* Date Section */}
                <div className="flex flex-col items-center w-full">
                    <label className="block text-stone-600 text-xs font-bold mb-4 uppercase tracking-wider text-center">
                        公历出生日期
                    </label>
                    <div className="flex items-end gap-2 sm:gap-4 justify-center w-full">
                        <div className="flex flex-col items-center flex-1 max-w-[80px]">
                            <input
                                type="number"
                                placeholder="日"
                                value={dateParts.day}
                                onChange={(e) => handleDateChange('day', e.target.value)}
                                className="w-full text-center bg-transparent border-b-2 border-stone-300 text-xl sm:text-2xl font-serif py-2 focus:border-red-seal focus:outline-none placeholder-stone-200 transition-colors"
                            />
                            <span className="text-[10px] text-stone-400 mt-1">日</span>
                        </div>
                        <span className="text-xl sm:text-2xl text-stone-300 pb-3">/</span>
                        <div className="flex flex-col items-center flex-1 max-w-[80px]">
                            <input
                                type="number"
                                placeholder="月"
                                value={dateParts.month}
                                onChange={(e) => handleDateChange('month', e.target.value)}
                                className="w-full text-center bg-transparent border-b-2 border-stone-300 text-xl sm:text-2xl font-serif py-2 focus:border-red-seal focus:outline-none placeholder-stone-200 transition-colors"
                            />
                            <span className="text-[10px] text-stone-400 mt-1">月</span>
                        </div>
                         <span className="text-xl sm:text-2xl text-stone-300 pb-3">/</span>
                        <div className="flex flex-col items-center flex-1 max-w-[90px]">
                            <input
                                type="number"
                                placeholder="年"
                                value={dateParts.year}
                                onChange={(e) => handleDateChange('year', e.target.value)}
                                className="w-full text-center bg-transparent border-b-2 border-stone-300 text-xl sm:text-2xl font-serif py-2 focus:border-red-seal focus:outline-none placeholder-stone-200 transition-colors"
                            />
                            <span className="text-[10px] text-stone-400 mt-1">年</span>
                        </div>
                    </div>
                </div>

                {/* Time Section */}
                <div className="flex flex-col items-center pt-2 w-full">
                    <label className="block text-stone-600 text-xs font-bold mb-4 uppercase tracking-wider text-center">
                        出生时间
                    </label>
                    <div className="flex items-end gap-2 sm:gap-4 justify-center w-full">
                        <div className="flex flex-col items-center flex-1 max-w-[90px]">
                            <input
                                type="number"
                                placeholder="时"
                                value={timeParts.hour}
                                onChange={(e) => handleTimeChange('hour', e.target.value)}
                                className="w-full text-center bg-transparent border-b-2 border-stone-300 text-2xl sm:text-3xl font-serif py-2 focus:border-red-seal focus:outline-none placeholder-stone-200 font-bold text-ink transition-colors"
                            />
                            <span className="text-[10px] text-stone-400 mt-1">时</span>
                        </div>
                        <span className="text-2xl sm:text-3xl text-stone-300 pb-3 font-bold">:</span>
                        <div className="flex flex-col items-center flex-1 max-w-[90px]">
                            <input
                                type="number"
                                placeholder="分"
                                value={timeParts.minute}
                                onChange={(e) => handleTimeChange('minute', e.target.value)}
                                className="w-full text-center bg-transparent border-b-2 border-stone-300 text-2xl sm:text-3xl font-serif py-2 focus:border-red-seal focus:outline-none placeholder-stone-200 font-bold text-ink transition-colors"
                            />
                            <span className="text-[10px] text-stone-400 mt-1">分</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-4 sm:mt-6 text-center font-serif max-w-xs">
                        * 输入当地时间 (0-24小时制)，系统将根据经纬度自动校正为<span className="text-red-800 font-bold">真太阳时</span>
                    </p>
                </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-4">
                    <p className="text-stone-600 font-serif leading-relaxed text-sm">
                        真太阳时受经度影响。<br/>
                        请输入详细的<span className="font-bold text-ink">出生城市/县区</span>，以便校正时辰。
                    </p>
                </div>

                <div className="space-y-4">
                    <label className="block text-stone-600 text-xs font-bold uppercase tracking-wider text-center">出生地点</label>
                    
                    <input
                        type="text"
                        name="birthLocation"
                        value={formData.birthLocation}
                        onChange={handleChange}
                        placeholder="例如：北京市 海淀区"
                        className="w-full bg-stone-50 border-b-2 border-stone-300 text-stone-900 text-lg sm:text-xl focus:border-red-seal focus:bg-white block px-4 py-3 sm:py-4 outline-none transition-colors font-serif text-center placeholder-stone-300"
                        required
                        autoFocus
                    />

                    <div className="flex justify-center mt-4">
                        <button 
                            type="button"
                            onClick={handleGeolocation}
                            className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all font-serif
                                ${locationStatus === 'success' ? 'bg-green-50 border-green-300 text-green-700' : 
                                  'bg-transparent border-stone-200 text-stone-400 hover:text-stone-600 hover:border-stone-400'}`}
                        >
                            {locationStatus === 'loading' ? (
                                <span>获取中...</span>
                            ) : locationStatus === 'success' ? (
                                <span>已获取坐标 (Lat: {formData.latitude?.toFixed(2)})</span>
                            ) : (
                                <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    <span>我就出生在当前位置 (自动填入)</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 sm:mt-10 flex gap-4">
            {step > 1 && (
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-stone-100 text-stone-600 font-serif font-bold text-base sm:text-lg rounded-sm py-3 hover:bg-stone-200 transition-colors border border-stone-200 active:scale-95 transform"
                >
                    上一步
                </button>
            )}
            <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 font-serif font-bold text-base sm:text-lg rounded-sm py-3 text-center transition-all duration-300 relative overflow-hidden shadow-lg active:scale-95 transform
                    ${isLoading ? 'bg-stone-300 cursor-not-allowed text-stone-500' : 'bg-ink text-gold hover:bg-stone-800 hover:shadow-xl'}`}
            >
                {isLoading ? "推演天机中..." : step === 3 ? "开始排盘" : "下一步"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default InputForm;