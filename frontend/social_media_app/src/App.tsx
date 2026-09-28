import { Outlet } from 'react-router-dom';
import TopBar from '../components/TopBar';


function App() {
  return (
    <>
        <div className='app-shell flex flex-col'>
          <div className='app-glow app-glow-left' />
          <div className='app-glow app-glow-right' />

          <div className='app-content flex flex-col min-h-screen'>
          <TopBar />
          <div className='flex justify-center items-center'>            
            <Outlet />
          </div>
          <footer className='mt-auto border-t border-amber-200/70 bg-amber-50/85 px-6 py-6 text-amber-900 backdrop-blur-sm'>
            <p className='text-sm tracking-wide'>TechTonic blog is built for practical engineering insights.</p>
          </footer>
          </div>
        </div>
    </>
  )
}


export default App
