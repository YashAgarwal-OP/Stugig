import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/organisms/PublicNavbar';
import Footer from '../components/organisms/Footer';
import { Avatar } from '../components/atoms/Avatar';
import { Badge } from '../components/atoms/Badge';
import { Card } from '../components/molecules/Card';
import { ReviewListItem } from '../components/molecules/Card';
import Button from '../components/atoms/Button';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const serviceRes = await client.get(`/services/${id}`);
        setService(serviceRes.data);

        // Fetch reviews for the freelancer who owns this service
        if (serviceRes.data?.freelancerId?._id) {
          const reviewsRes = await client.get(`/reviews/user/${serviceRes.data.freelancerId._id}`);
          setReviews(reviewsRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching service details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col pt-[64px] bg-[#f8f9fa]">
        <PublicNavbar />
        <div className="flex-grow flex items-center justify-center text-[#464555] font-body">
          Loading service...
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col pt-[64px] bg-[#f8f9fa]">
        <PublicNavbar />
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <p className="text-[#464555] font-body">Service not found.</p>
          <Button variant="primary" onClick={() => navigate('/services')}>Browse Services</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const freelancer = service.freelancerId;

  return (
    <div className="min-h-screen flex flex-col pt-[64px] bg-[#f8f9fa]">
      <PublicNavbar />

      <main className="flex-grow max-w-[1440px] mx-auto px-8 py-8 w-full">
        {/* Back navigation */}
        <button
          onClick={() => navigate('/services')}
          className="text-sm font-semibold text-[#3525cd] hover:underline mb-6 flex items-center gap-1"
        >
          &larr; Back to Services
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service header card */}
            <div className="bg-white rounded-2xl border border-[#e7e8e9] overflow-hidden shadow-sm">
              {/* Cover image */}
              <div className="aspect-video bg-[#e2dfff] relative">
                {service.imageUrl ? (
                  <img
                    src={service.imageUrl}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-[#b0afc0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <span className="bg-[#e2dfff] text-[#3525cd] text-xs font-semibold px-3 py-1 rounded-full font-label uppercase tracking-wide">
                    {service.category}
                  </span>
                  <h1 className="text-2xl font-bold font-headline text-[#191c1d] mt-3">{service.title}</h1>
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap gap-6 text-sm text-[#464555] border-t border-[#e7e8e9] pt-4">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[#3525cd]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{service.deliveryTime} delivery</span>
                  </div>
                  {service.reviewCount > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#a44100]">★</span>
                      <span className="font-semibold text-[#191c1d]">{service.rating?.toFixed(1)}</span>
                      <span className="text-[#777587]">({service.reviewCount} review{service.reviewCount !== 1 ? 's' : ''})</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="border-t border-[#e7e8e9] pt-4">
                  <h3 className="font-semibold text-sm text-[#191c1d] mb-2 font-label">About This Service</h3>
                  <p className="text-sm text-[#464555] font-body leading-relaxed whitespace-pre-wrap">
                    {service.description}
                  </p>
                </div>

                {/* Tags */}
                {service.tags && service.tags.length > 0 && (
                  <div className="border-t border-[#e7e8e9] pt-4">
                    <h3 className="font-semibold text-sm text-[#191c1d] mb-2 font-label">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {service.tags.map((tag) => (
                        <Badge key={tag} variant="primary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews section */}
            <div className="bg-white rounded-2xl border border-[#e7e8e9] shadow-sm">
              <div className="p-6 border-b border-[#e7e8e9]">
                <h2 className="text-lg font-bold font-headline text-[#191c1d]">
                  Reviews {reviews.length > 0 && <span className="text-[#777587] font-normal text-base">({reviews.length})</span>}
                </h2>
              </div>
              <div className="p-6 divide-y divide-[#e7e8e9]">
                {reviews.length === 0 ? (
                  <p className="text-sm text-[#777587] font-body py-4 text-center">No reviews yet.</p>
                ) : (
                  reviews.map((review) => (
                    <ReviewListItem key={review._id} review={review} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pricing + CTA card */}
            <Card className="p-6 space-y-5">
              <div>
                <p className="text-xs text-[#777587] font-label uppercase tracking-wide">Starting at</p>
                <p className="text-3xl font-bold font-headline text-[#191c1d] mt-1">${service.price}</p>
              </div>

              <div className="border-t border-[#e7e8e9] pt-4 space-y-2 text-sm text-[#464555]">
                <div className="flex items-center justify-between">
                  <span className="font-body">Delivery time</span>
                  <span className="font-semibold text-[#191c1d]">{service.deliveryTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body">Category</span>
                  <span className="font-semibold text-[#191c1d]">{service.category}</span>
                </div>
              </div>

              {isAuthenticated ? (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => navigate('/messages')}
                >
                  Contact Freelancer
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  Log in to Contact
                </Button>
              )}
            </Card>

            {/* Freelancer card */}
            {freelancer && (
              <Card
                className="p-5 space-y-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/profile/${freelancer._id}`)}
              >
                <h3 className="text-sm font-semibold font-label text-[#464555] uppercase tracking-wide">About the Freelancer</h3>
                <div className="flex items-center gap-3">
                  <Avatar src={freelancer.profilePhotoUrl} name={freelancer.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#191c1d] font-headline truncate">{freelancer.name}</p>
                    {freelancer.rating > 0 && (
                      <p className="text-xs text-[#777587]">★ {freelancer.rating?.toFixed(1)} rating</p>
                    )}
                  </div>
                </div>
                {freelancer.bio && (
                  <p className="text-xs text-[#464555] font-body line-clamp-3 leading-relaxed">{freelancer.bio}</p>
                )}
                <p className="text-xs text-[#3525cd] font-semibold hover:underline">View Full Profile →</p>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
