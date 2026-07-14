import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/organisms/PublicNavbar';
import Footer from '../components/organisms/Footer';
import { ProfileHeaderBanner, TabBar } from '../components/organisms/ProfileHeader';
import { ServiceCard, ReviewListItem, PortfolioCard } from '../components/molecules/Card';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [loading, setLoading] = useState(true);

  const tabs = [
    { key: 'about', label: 'About' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'services', label: 'Offered Services' },
    { key: 'reviews', label: 'Ratings & Reviews' },
  ];

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Fetch user basic profile
        const userRes = await client.get(`/users/${userId}`);
        setProfileUser(userRes.data);

        // Fetch user services
        const servicesRes = await client.get(`/services?freelancerId=${userId}`);
        setServices(servicesRes.data.services || servicesRes.data || []);

        // Fetch user portfolio
        const portfolioRes = await client.get(`/portfolio/user/${userId}`);
        setPortfolio(portfolioRes.data || []);

        // Fetch user reviews
        const reviewsRes = await client.get(`/reviews/user/${userId}`);
        setReviews(reviewsRes.data || []);
      } catch (err) {
        console.error('Error fetching profile details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfileData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col pt-[64px] bg-[#f8f9fa]">
        <PublicNavbar />
        <div className="flex-grow flex items-center justify-center text-[#464555] font-body">
          Loading profile...
        </div>
        <Footer />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex flex-col pt-[64px] bg-[#f8f9fa]">
        <PublicNavbar />
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <p className="text-[#464555] font-body">User profile not found.</p>
          <button onClick={() => navigate(-1)} className="text-sm font-semibold text-[#3525cd] hover:underline">
            &larr; Go Back
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-[64px] bg-[#f8f9fa]">
      <PublicNavbar />

      <main className="flex-grow max-w-[1440px] mx-auto px-8 py-8 w-full space-y-8">
        <ProfileHeaderBanner
          user={profileUser}
          isOwner={currentUser?._id === userId || currentUser?.id === userId}
        />

        <div className="bg-white rounded-2xl border border-[#e7e8e9] overflow-hidden shadow-sm">
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="p-6">
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold font-headline text-[#191c1d] mb-2">About {profileUser.name}</h3>
                  <p className="text-sm text-[#464555] font-body whitespace-pre-wrap">
                    {profileUser.bio || 'No bio provided.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {profileUser.location && (
                    <div>
                      <h4 className="text-sm font-semibold font-label text-[#191c1d] mb-1">Location</h4>
                      <p className="text-sm text-[#464555] font-body">{profileUser.location}</p>
                    </div>
                  )}
                  {profileUser.phone && (
                    <div>
                      <h4 className="text-sm font-semibold font-label text-[#191c1d] mb-1">Contact</h4>
                      <p className="text-sm text-[#464555] font-body">{profileUser.phone}</p>
                    </div>
                  )}
                  {profileUser.role === 'freelancer' && profileUser.yearsOfExperience !== undefined && (
                    <div>
                      <h4 className="text-sm font-semibold font-label text-[#191c1d] mb-1">Experience</h4>
                      <p className="text-sm text-[#464555] font-body">{profileUser.yearsOfExperience} {profileUser.yearsOfExperience === 1 ? 'year' : 'years'}</p>
                    </div>
                  )}
                </div>

                {profileUser.role === 'freelancer' && profileUser.skills?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold font-label text-[#191c1d] mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {profileUser.skills.map((skill, i) => (
                        <span key={i} className="px-2.5 py-1 bg-[#f3f4f5] text-[#464555] rounded-lg text-xs font-medium border border-[#e7e8e9]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profileUser.role === 'freelancer' && profileUser.languages?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold font-label text-[#191c1d] mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {profileUser.languages.map((lang, i) => (
                        <span key={i} className="px-2.5 py-1 bg-[#f3f4f5] text-[#464555] rounded-lg text-xs font-medium border border-[#e7e8e9]">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div>
                {portfolio.length === 0 ? (
                  <p className="text-sm text-[#777587] font-body py-4 text-center">
                    This user has not added any portfolio items yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {portfolio.map((item) => (
                      <PortfolioCard key={item._id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                {services.length === 0 ? (
                  <p className="text-sm text-[#777587] font-body py-4 text-center">
                    This user has not listed any services yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {services.map((service) => (
                      <ServiceCard
                        key={service._id}
                        service={service}
                        onClick={() => navigate(`/services/${service._id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="divide-y divide-[#e7e8e9]">
                {reviews.length === 0 ? (
                  <p className="text-sm text-[#777587] font-body py-4 text-center">
                    No reviews received yet.
                  </p>
                ) : (
                  reviews.map((review) => (
                    <ReviewListItem
                      key={review._id}
                      review={review}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
