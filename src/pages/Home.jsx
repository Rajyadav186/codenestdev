// src/pages/Home.jsx
import Navbar       from '../components/Navbar'
import Hero         from '../components/Hero'
import Services     from '../components/Services'
import Pricing      from '../components/Pricing'
import Portfolio    from '../components/Portfolio'
import WhyUs        from '../components/WhyUs'
// import Testimonials from '../components/Testimonials'
import LiveComments from '../components/LiveComments'
import Contact      from '../components/Contact'
import Footer       from '../components/Footer'
import Floaters     from '../components/Floaters'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Pricing />
        <Portfolio />
        <WhyUs />
        {/* <Testimonials /> */}
        <LiveComments />
        <Contact />
      </main>
      <Footer />
      <Floaters />
    </>
  )
}
