import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Bus, ShieldCheck, Users, Briefcase, Lock, Sparkles } from 'lucide-react';
import PrimaryButton from '../components/ui/PrimaryButton';
import FaceScanner from '../components/auth/FaceScanner';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('parent'); // Default to parent
  const [authMethod, setAuthMethod] = useState('password'); // 'password' or 'face'

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = async (data) => {
    const resultAction = await dispatch(login({ credentials: data, selectedRole: role }));
    if (login.fulfilled.match(resultAction)) {
      toast.success('Welcome back to SKUBUS');
    }
  };

  const getHeading = () => {
    if (authMethod === 'face') return 'Face Recognition Login';
    switch (role) {
      case 'admin': return 'Welcome back, Admin';
      case 'staff': return 'Welcome back, Staff';
      default: return 'Welcome back, Parent';
    }
  };

  const getSubtitle = () => {
    if (authMethod === 'face') return 'Look at the camera to securely sign in.';
    switch (role) {
      case 'admin': return 'Sign in to manage SKUBUS';
      case 'staff': return 'Sign in to manage your assigned operations';
      default: return 'Sign in to manage your child\'s transportation';
    }
  };

  return (
    <div className="min-h-screen bg-sk-background flex flex-col md:flex-row">
      
      {/* LEFT SIDE - BRANDING & ANIMATION */}
      <div className="md:w-1/2 bg-sk-navy relative overflow-hidden flex flex-col justify-center items-center p-8 text-center text-white min-h-[40vh] md:min-h-screen transition-colors duration-500">
        <div className="z-10 max-w-md">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-sk-yellow p-3 rounded-xl shadow-lg relative transition-all duration-300">
              <Bus className="w-10 h-10 text-sk-navy" />
              {/* Dynamic Role Badge (only show during password auth) */}
              {authMethod === 'password' && (
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-sk-navy rounded-full border-2 border-sk-yellow flex items-center justify-center animate-in zoom-in">
                  {role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-sk-yellow" />}
                  {role === 'parent' && <Users className="w-3.5 h-3.5 text-sk-yellow" />}
                  {role === 'staff' && <Briefcase className="w-3.5 h-3.5 text-sk-yellow" />}
                </div>
              )}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            SKUBUS
          </h1>
          <p className="text-xl text-gray-300 font-medium mb-2">
            School Bus Management System
          </p>
          <p className="text-sm text-gray-400 italic">
            "Safe Journeys. Smarter Schools."
          </p>
        </div>

        {/* CSS Animated Bus Background */}
        <div className="absolute bottom-10 left-0 w-full overflow-hidden h-32 opacity-80 pointer-events-none">
          <div className="w-full h-1 bg-gray-600 absolute bottom-4"></div>
          <div className="absolute bottom-5 w-full" style={{ animation: 'bus-move 15s linear infinite' }}>
            <div className="w-48 h-20 bg-sk-yellow rounded-lg relative shadow-lg" style={{ animation: 'bus-bounce 2s ease-in-out infinite' }}>
              {/* Windows */}
              <div className="absolute top-2 left-2 right-12 flex space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-sm"></div>
                <div className="w-8 h-8 bg-blue-100 rounded-sm"></div>
                <div className="w-8 h-8 bg-blue-100 rounded-sm"></div>
              </div>
              {/* Front windshield */}
              <div className="absolute top-2 right-2 w-8 h-10 bg-blue-100 rounded-tr-md rounded-br-md"></div>
              {/* Headlight */}
              <div className="absolute bottom-4 right-1 w-3 h-3 bg-yellow-200 rounded-full shadow-[0_0_15px_rgba(255,255,0,0.8)]"></div>
              {/* Wheels */}
              <div className="absolute -bottom-3 left-4 w-8 h-8 bg-gray-800 rounded-full border-4 border-gray-300 flex items-center justify-center" style={{ animation: 'wheel-spin 2s linear infinite' }}>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
              <div className="absolute -bottom-3 right-8 w-8 h-8 bg-gray-800 rounded-full border-4 border-gray-300 flex items-center justify-center" style={{ animation: 'wheel-spin 2s linear infinite' }}>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="md:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-32 bg-white min-h-screen overflow-y-auto">
        <div className="mx-auto w-full max-w-sm lg:max-w-md animate-in slide-in-from-right-4 duration-500">
          
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-bold text-sk-navy mb-2 transition-all">{getHeading()}</h2>
            <p className="text-gray-500">{getSubtitle()}</p>
          </div>

          {/* AUTH METHOD SELECTOR */}
          <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200 mb-8">
            <button 
              type="button"
              onClick={() => setAuthMethod('password')} 
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${authMethod === 'password' ? 'bg-white text-sk-navy shadow-sm' : 'text-gray-500 hover:text-sk-navy hover:bg-gray-200/50'}`}
            >
              <Lock className="w-4 h-4" /> Password Login
            </button>
            <button 
              type="button"
              onClick={() => setAuthMethod('face')} 
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${authMethod === 'face' ? 'bg-white text-sk-navy shadow-sm' : 'text-gray-500 hover:text-sk-navy hover:bg-gray-200/50'}`}
            >
              <Sparkles className="w-4 h-4" /> Face Recognition
            </button>
          </div>

          {authMethod === 'face' ? (
            <FaceScanner onCancel={() => setAuthMethod('password')} />
          ) : (
            <>
              {/* ROLE SELECTOR */}
              <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 text-center sm:text-left">Sign in as</label>
                <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200">
                  <button 
                    type="button"
                    onClick={() => setRole('admin')} 
                    className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${role === 'admin' ? 'bg-sk-yellow text-sk-navy shadow-sm transform scale-[1.02]' : 'text-gray-500 hover:text-sk-navy hover:bg-gray-200/50'}`}
                  >
                    <ShieldCheck className="w-4 h-4" /> Admin
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole('parent')} 
                    className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${role === 'parent' ? 'bg-sk-yellow text-sk-navy shadow-sm transform scale-[1.02]' : 'text-gray-500 hover:text-sk-navy hover:bg-gray-200/50'}`}
                  >
                    <Users className="w-4 h-4" /> Parent
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole('staff')} 
                    className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${role === 'staff' ? 'bg-sk-yellow text-sk-navy shadow-sm transform scale-[1.02]' : 'text-gray-500 hover:text-sk-navy hover:bg-gray-200/50'}`}
                  >
                    <Briefcase className="w-4 h-4" /> Staff
                  </button>
                </div>
                
                {/* Admin context hint */}
                {role === 'admin' && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2 animate-in fade-in zoom-in duration-300">
                    <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 font-medium leading-relaxed">
                      Access the SKUBUS administration dashboard. Only authorized administrators can log in here.
                    </p>
                  </div>
                )}
              </div>
              
              <form className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <div className="mt-1">
                    <input
                      type="email"
                      className={`appearance-none block w-full px-4 py-3 border ${errors.email ? 'border-sk-error' : 'border-sk-border'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sk-yellow focus:border-transparent transition-colors bg-white`}
                      placeholder="name@example.com"
                      {...register('email')}
                    />
                    {errors.email && <p className="mt-2 text-sm text-sk-error">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`appearance-none block w-full px-4 py-3 border ${errors.password ? 'border-sk-error' : 'border-sk-border'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sk-yellow focus:border-transparent transition-colors pr-10 bg-white`}
                      placeholder="••••••••"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-2 text-sm text-sk-error">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-sk-yellow focus:ring-sk-yellow border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-sk-navy hover:text-sk-navy-light underline-offset-2 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <div>
                  <PrimaryButton type="submit" isLoading={loading} className="w-full py-3.5 text-lg rounded-xl shadow-md transform hover:-translate-y-0.5 transition-all">
                    Sign In
                  </PrimaryButton>
                </div>
              </form>

              {role !== 'admin' && (
                <div className="mt-8 text-center animate-in fade-in duration-300">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-bold text-sk-info hover:underline hover:text-blue-700 transition-colors">
                      Register here
                    </Link>
                  </p>
                </div>
              )}
              
              <div className="mt-6 text-center animate-in fade-in duration-300">
                <button 
                  type="button" 
                  onClick={() => setAuthMethod('face')}
                  className="text-sm font-semibold text-gray-500 hover:text-sk-navy transition-colors underline-offset-4 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <Sparkles className="w-4 h-4" /> Use Face Recognition Instead
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
