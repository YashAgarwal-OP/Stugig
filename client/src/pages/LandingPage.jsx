import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PublicNavbar from '../components/organisms/PublicNavbar';
import Footer from '../components/organisms/Footer';
import Button from '../components/atoms/Button';
import { Avatar } from '../components/atoms/Avatar';
import { Card } from '../components/molecules/Card';
import { ServiceCard } from '../components/molecules/Card';
import client from '../api/client';

export default function LandingPage() {
  const navigate = useNavigate();
  const [featuredServices, setFeaturedServices] = useState([]);
  const [featuredFreelancers, setFeaturedFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, freelancersRes] = await Promise.all([
          client.get('/services?limit=4'),
          client.get('/users?featured=true')
        ]);
        // Handle response format from backend service Controller
        setFeaturedServices(servicesRes.data.services || servicesRes.data || []);
        setFeaturedFreelancers(freelancersRes.data || []);
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col pt-[64px] bg-[#f8f9fa]">
      <PublicNavbar />

      {/* Main Container */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="max-w-[1440px] mx-auto px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-bold font-headline text-4xl md:text-5xl text-[#3525cd] mb-6 leading-tight">
                Hire students. Get hired by students.
              </h1>
              <p className="text-lg text-[#464555] font-body mb-8 max-w-xl">
                The vibrant marketplace where ambitious students offer their skills and peers find fresh, affordable talent. Build your portfolio or build your brand.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" size="lg" onClick={() => navigate('/signup?role=freelancer')}>
                  Find Work
                </Button>
                <Button variant="accent" size="lg" onClick={() => navigate('/signup?role=client')}>
                  Hire a Freelancer
                </Button>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3] bg-[#edeeef]">
              <img
                alt="Students collaborating"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDydzct6U8b4uFQFB_O_DUk4xvUytqqSFfO662Cfq6a6a4ZEXUyQ___bkCEX2s0TrvO015dt5KdFXxhF2PO8umfIiUB0Zh-W6CLIDN-EnK43c-rochRoMyGyDSBF-9F9WtA58vHd09TdZyehAQvOyvHFipKVxs8cysxStDIDuWooiWHzPQaIwcKgOoBM1KqNhR5B5zyNEZG5Mr_LXyJ1VMS9Nnpe2CibClEqH0lN4V0Il-ZJnB2K3qC"
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-[#edeeef]/40 py-12 border-y border-[#c7c4d8]/20">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold font-headline text-[#3525cd] mb-2">10,000+</div>
                <div className="text-sm font-body text-[#464555]">Active Students</div>
              </div>
              <div>
                <div className="text-3xl font-bold font-headline text-[#3525cd] mb-2">5,000+</div>
                <div className="text-sm font-body text-[#464555]">Jobs Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold font-headline text-[#3525cd] mb-2">4.8/5</div>
                <div className="text-sm font-body text-[#464555]">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold font-headline text-[#3525cd] mb-2">50+</div>
                <div className="text-sm font-body text-[#464555]">Universities</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Services */}
        <section className="max-w-[1440px] mx-auto px-8 py-16">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold font-headline text-[#191c1d]">Featured Services</h2>
            <Link to="/services" className="text-[#3525cd] font-semibold text-sm hover:underline flex items-center gap-1">
              View all &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-[#464555] font-body">Loading services...</div>
          ) : featuredServices.length === 0 ? (
            <div className="text-center py-12 text-[#464555] font-body">No services found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.slice(0, 4).map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  onClick={() => navigate(`/services/${service._id}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Featured Freelancers */}
        <section className="max-w-[1440px] mx-auto px-8 py-16 border-t border-[#c7c4d8]/20">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold font-headline text-[#191c1d]">Top Student Freelancers</h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-[#464555] font-body">Loading freelancers...</div>
          ) : featuredFreelancers.length === 0 ? (
            <div className="text-center py-12 text-[#464555] font-body">No student freelancers found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredFreelancers.map((freelancer) => (
                <Card
                  key={freelancer._id}
                  className="p-5 flex flex-col items-center text-center gap-3"
                  hover
                  onClick={() => navigate(`/profile/${freelancer._id}`)}
                >
                  <Avatar src={freelancer.avatarUrl} name={freelancer.name} size="lg" />
                  <div>
                    <h3 className="font-semibold font-headline text-sm text-[#191c1d]">{freelancer.name}</h3>
                    <p className="text-xs text-[#464555] font-body truncate max-w-[180px]">{freelancer.bio || 'Student Freelancer'}</p>
                  </div>
                  {freelancer.rating !== undefined && (
                    <div className="text-[#a44100] text-xs font-semibold">
                      ★ {freelancer.rating.toFixed(1)}
                    </div>
                  )}
                  {freelancer.skills && freelancer.skills.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1 mt-2">
                      {freelancer.skills.slice(0, 2).map((s) => (
                        <span key={s} className="bg-[#e2dfff] text-[#3525cd] text-[10px] font-semibold px-2 py-0.5 rounded-full font-label">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
