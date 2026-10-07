import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import * as authService from '../services/authService';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, CheckCircle, Camera, Bus } from 'lucide-react';
import PrimaryButton from '../components/ui/PrimaryButton';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
  role: yup.string().oneOf(['parent', 'staff']).required('Role is required'),
});

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'parent' }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.register(data);
      toast.success('Registration successful. Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sk-background flex flex-col md:flex-row font-sans">
      
      {/* LEFT SIDE - ILLUSTRATION & BRANDING */}
      <div className="md:w-[45%] bg-sk-navy relative overflow-hidden flex flex-col items-center justify-between pt-12 p-8 text-center text-white min-h-[40vh] md:min-h-screen">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sk-yellow opacity-10 rounded-full blur-[100px] animate-pulse-glow pointer-events-none"></div>

        {/* Branding Header */}
        <div className="z-10 max-w-md w-full animate-in fade-in slide-in-from-top-8 duration-700">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-sk-yellow/10 p-3 rounded-2xl border border-sk-yellow/20 backdrop-blur-sm">
              <Bus className="w-12 h-12 text-sk-yellow" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
            SKUBUS
          </h1>
          <p className="text-lg md:text-xl text-blue-100/80 font-medium mb-2">
            School Bus Management System
          </p>
          <p className="text-sm text-sk-yellow-light/60 italic font-medium tracking-wide">
            "Safe Journeys. Smarter Schools."
          </p>
        </div>

        {/* Custom School Bus & Environment Illustration */}
        <div className="relative w-full flex-1 max-w-lg mt-8 min-h-[250px] pointer-events-none">
          
          {/* Clouds */}
          <div className="absolute top-10 left-[-10%] opacity-40 animate-cloud-drift text-white">
            <svg width="48" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 19c2.48 0 4.5-2.02 4.5-4.5S19.98 10 17.5 10c-.17 0-.34.02-.51.05C16.43 7.15 13.9 5 11 5 7.69 5 5 7.69 5 11c0 .24.02.48.06.71C2.7 12.18 1 14.18 1 16.5 1 19.53 3.47 22 6.5 22h11c2.48 0 4.5-2.02 4.5-4.5 0-1.15-.44-2.2-1.16-3.01C20.67 14.37 20.59 14.28 20.5 14.2V14.5c0 2.48-2.02 4.5-4.5 4.5H6.5c-2.48 0-4.5-2.02-4.5-4.5s2.02-4.5 4.5-4.5h.33c-.02-.27-.03-.55-.03-.83 0-2.58 2.09-4.67 4.67-4.67 2.12 0 3.92 1.41 4.49 3.34h.34c2.02 0 3.67 1.64 3.67 3.66s-1.64 3.67-3.67 3.67H17.5v.33z"/></svg>
          </div>
          <div className="absolute top-24 right-[-20%] opacity-20 animate-cloud-drift" style={{ animationDelay: '-20s', animationDuration: '50s' }}>
            <svg width="64" height="42" viewBox="0 0 24 24" fill="currentColor" className="text-white"><path d="M17.5 19c2.48 0 4.5-2.02 4.5-4.5S19.98 10 17.5 10c-.17 0-.34.02-.51.05C16.43 7.15 13.9 5 11 5 7.69 5 5 7.69 5 11c0 .24.02.48.06.71C2.7 12.18 1 14.18 1 16.5 1 19.53 3.47 22 6.5 22h11c2.48 0 4.5-2.02 4.5-4.5 0-1.15-.44-2.2-1.16-3.01C20.67 14.37 20.59 14.28 20.5 14.2V14.5c0 2.48-2.02 4.5-4.5 4.5H6.5c-2.48 0-4.5-2.02-4.5-4.5s2.02-4.5 4.5-4.5h.33c-.02-.27-.03-.55-.03-.83 0-2.58 2.09-4.67 4.67-4.67 2.12 0 3.92 1.41 4.49 3.34h.34c2.02 0 3.67 1.64 3.67 3.66s-1.64 3.67-3.67 3.67H17.5v.33z"/></svg>
          </div>

          {/* Floating UI Elements */}
          <div className="absolute top-16 left-4 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl shadow-lg flex items-center gap-3 animate-float">
            <div className="bg-sk-success/20 p-2 rounded-full text-sk-success">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="h-2 w-16 bg-white/40 rounded-full mb-1"></div>
              <div className="h-2 w-10 bg-white/20 rounded-full"></div>
            </div>
          </div>

          <div className="absolute top-28 right-0 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl shadow-lg flex items-center gap-3 animate-float-delayed">
            <div className="bg-sk-info/20 p-2 rounded-full text-sk-info">
              <Camera className="w-5 h-5 text-blue-300" />
            </div>
            <div className="text-left">
              <div className="h-2 w-14 bg-white/40 rounded-full mb-1"></div>
              <div className="h-2 w-8 bg-white/20 rounded-full"></div>
            </div>
          </div>

          {/* Decorative School / Road */}
          <div className="absolute bottom-0 w-full flex justify-center">
            {/* Road */}
            <div className="absolute bottom-8 w-[120%] h-12 bg-sk-navy-light rounded-[100%] border-t-2 border-white/10"></div>
            
            {/* Animated Bus */}
            <div className="absolute bottom-10 z-10 w-full" style={{ animation: 'bus-move 12s linear infinite' }}>
              <div className="w-40 h-16 bg-sk-yellow rounded-xl relative shadow-2xl mx-auto" style={{ animation: 'bus-bounce 2s ease-in-out infinite' }}>
                <div className="absolute top-2 left-2 right-10 flex space-x-2">
                  <div className="w-6 h-6 bg-sk-navy/80 rounded-sm"></div>
                  <div className="w-6 h-6 bg-sk-navy/80 rounded-sm"></div>
                  <div className="w-6 h-6 bg-sk-navy/80 rounded-sm"></div>
                </div>
                <div className="absolute top-2 right-2 w-6 h-8 bg-sk-navy/80 rounded-tr-md rounded-br-md"></div>
                <div className="absolute bottom-3 right-1 w-2 h-2 bg-yellow-200 rounded-full shadow-[0_0_10px_#fef08a]"></div>
                
                {/* Wheels */}
                <div className="absolute -bottom-2 left-4 w-6 h-6 bg-sk-navy rounded-full border-2 border-gray-400 flex items-center justify-center shadow-lg" style={{ animation: 'wheel-spin 2s linear infinite' }}>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                </div>
                <div className="absolute -bottom-2 right-6 w-6 h-6 bg-sk-navy rounded-full border-2 border-gray-400 flex items-center justify-center shadow-lg" style={{ animation: 'wheel-spin 2s linear infinite' }}>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - REGISTRATION FORM */}
      <div className="md:w-[55%] flex flex-col justify-center py-12 px-4 sm:px-8 lg:px-20 xl:px-32 bg-white">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-sk-navy mb-3">Create Your Account</h2>
            <p className="text-gray-500 font-medium">Join SKUBUS and make school transportation smarter and safer.</p>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className={`h-5 w-5 ${errors.name ? 'text-sk-error' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    className={`block w-full pl-11 pr-4 py-3 border ${errors.name ? 'border-sk-error focus:ring-sk-error focus:border-sk-error' : 'border-gray-200 focus:ring-sk-yellow focus:border-sk-yellow'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white`}
                    placeholder="John Doe"
                    {...register('name')}
                  />
                </div>
                {errors.name && <p className="mt-1.5 text-xs font-medium text-sk-error flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> {errors.name.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className={`h-5 w-5 ${errors.phone ? 'text-sk-error' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    className={`block w-full pl-11 pr-4 py-3 border ${errors.phone ? 'border-sk-error focus:ring-sk-error focus:border-sk-error' : 'border-gray-200 focus:ring-sk-yellow focus:border-sk-yellow'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white`}
                    placeholder="+1 (555) 000-0000"
                    {...register('phone')}
                  />
                </div>
                {errors.phone && <p className="mt-1.5 text-xs font-medium text-sk-error flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> {errors.phone.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${errors.email ? 'text-sk-error' : 'text-gray-400'}`} />
                </div>
                <input
                  type="email"
                  className={`block w-full pl-11 pr-4 py-3 border ${errors.email ? 'border-sk-error focus:ring-sk-error focus:border-sk-error' : 'border-gray-200 focus:ring-sk-yellow focus:border-sk-yellow'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white`}
                  placeholder="parent@skubus.com"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs font-medium text-sk-error flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> {errors.email.message}</p>}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <ShieldCheck className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="appearance-none block w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-sk-yellow focus:border-sk-yellow transition-all bg-gray-50 focus:bg-white text-gray-900"
                  {...register('role')}
                >
                  <option value="parent">Parent / Guardian</option>
                  <option value="staff">School Staff</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${errors.password ? 'text-sk-error' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`block w-full pl-11 pr-10 py-3 border ${errors.password ? 'border-sk-error focus:ring-sk-error focus:border-sk-error' : 'border-gray-200 focus:ring-sk-yellow focus:border-sk-yellow'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white`}
                    placeholder="••••••••"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-sk-navy transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs font-medium text-sk-error flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> {errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${errors.confirmPassword ? 'text-sk-error' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`block w-full pl-11 pr-10 py-3 border ${errors.confirmPassword ? 'border-sk-error focus:ring-sk-error focus:border-sk-error' : 'border-gray-200 focus:ring-sk-yellow focus:border-sk-yellow'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white`}
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-sk-navy transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1.5 text-xs font-medium text-sk-error flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> {errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="pt-4">
              <PrimaryButton type="submit" isLoading={loading} className="w-full py-3.5 text-base rounded-xl font-bold">
                Create Account
              </PrimaryButton>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-sk-navy hover:text-sk-info transition-colors underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
