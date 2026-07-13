import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/organisms/PublicNavbar';
import Footer from '../components/organisms/Footer';
import { ProfileHeaderBanner, TabBar } from '../components/organisms/ProfileHeader';
import { ServiceCard, ReviewListItem } from '../components/molecules/Card';
import client from '../api/client';

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('services');
  const [loading, setLoading] = useState(true);

  const tabs = [
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
        <ProfileHeaderBanner user={profileUser} />

        <div className="bg-white rounded-2xl border border-[#e7e8e9] overflow-hidden shadow-sm">
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="p-6">
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
