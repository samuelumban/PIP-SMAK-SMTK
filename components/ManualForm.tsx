
import React, { useState } from 'react';
import { PIP_FIELDS, INITIAL_FORM_STATE } from '../constants';
import { PIPData } from '../types';

interface ManualFormProps {
  onSubmit: (data: PIPData) => void;
}

const ManualForm: React.FC<ManualFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<PIPData>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    PIP_FIELDS.forEach(field => {
      const value = formData[field.id];
      if (field.required && !value) {
        newErrors[field.id] = `${field.label} wajib diisi`;
      }
      if (field.validation) {
        const error = field.validation(value);
        if (error) newErrors[field.id] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (id: keyof PIPData, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      setFormData(INITIAL_FORM_STATE);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PIP_FIELDS.map((field) => (
          <div key={field.id} className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            
            {field.type === 'select' ? (
              <select
                value={formData[field.id]}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black font-medium ${
                  errors[field.id] ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300'
                }`}
              >
                <option value="" className="text-slate-400">{field.placeholder}</option>
                {field.options?.map(opt => (
                  <option key={opt} value={opt} className="text-black">{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={formData[field.id]}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black font-medium placeholder:text-slate-400 ${
                  errors[field.id] ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300'
                }`}
              />
            )}
            
            {errors[field.id] && <p className="text-xs text-red-500 font-medium">{errors[field.id]}</p>}
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i>
          Tambahkan Data
        </button>
      </div>
    </form>
  );
};

export default ManualForm;
