import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import LinkBuilder from './pages/LinkBuilder'
import Settings from './pages/Settings'
import Usage from './pages/Usage'
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/builder" element={<LinkBuilder />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/usage" element={<Usage />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
