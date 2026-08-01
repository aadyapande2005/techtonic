import axios from "axios";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const techInterests = [
    'React', 'Node.js', 'TypeScript', 'Python', 'Go', 'Rust', 'Docker', 'Kubernetes',
    'AWS', 'Azure', 'Machine Learning', 'AI', 'Blockchain', 'Web3', 'Cybersecurity'
  ];

  const navigate = useNavigate();

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isSubmitting) return
    if (interests.length < 3) {
      setError('Please select at least 3 interests.');
      return;
    }

    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Interests:', interests);
    setError('')
    setIsSubmitting(true)

    try {
      const response = await axios.post('http://127.0.0.1:3000/auth/register', 
        {
          username,
          email,
          password,
          interests
      })

      console.log(response.data)

      navigate('/login')

    } catch (error) {
      // For Axios, error responses are in error.response.data
      const axiosError = error as AxiosError<any>;
      if (axiosError.response) {
        // The server responded with a status code outside 2xx
        console.log('Error message:', axiosError.response.data.message);
        setError(axiosError.response.data.message);
      } else {
        // Network error or request was not made
        console.log('Error:', axiosError.message);
        setError(axiosError.message || 'An error occurred');
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center px-4 py-10">
        <div className="rise-in flex w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-amber-200/70 bg-amber-50/90 shadow-2xl shadow-amber-900/15">

          <div className="flex flex-1 items-center justify-center bg-linear-to-r from-orange-100 to-amber-200 px-6 py-8">
            <div className="display-title text-5xl text-amber-950">Create Account</div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 border-t border-amber-200 p-7">
            <h1 className='display-title text-3xl italic text-amber-900'>Start blogging {username || 'today'}!</h1>
            <input 
              type="text" 
              placeholder="username" 
              className="mt-2 w-full rounded-2xl border border-amber-300 bg-white px-5 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="email" 
              className="w-full rounded-2xl border border-amber-300 bg-white px-5 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="password" 
              className="w-full rounded-2xl border border-amber-300 bg-white px-5 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="w-full">
              <label className="block text-amber-900 font-medium mb-2">Select your interests (at least 3):</label>
              <div className="flex flex-wrap gap-2">
                {techInterests.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                      interests.includes(interest) 
                        ? 'bg-amber-800 text-amber-50 border-amber-800' 
                        : 'bg-white text-amber-800 border-amber-300 hover:border-amber-500'
                    }`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <button 
              className="pressable mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-amber-800 px-5 py-3 text-lg font-semibold text-amber-50 shadow-lg shadow-orange-300/40 transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-70" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting && <span className="loading-dot" />}
              {isSubmitting ? 'Creating account...' : 'Sign up'}
            </button>

            <div className="min-h-6 text-red-500">{error}</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register