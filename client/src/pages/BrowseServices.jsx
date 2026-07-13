import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/organisms/PublicNavbar';
import Footer from '../components/organisms/Footer';
import { ServiceCard } from '../components/molecules/Card';
import { SearchBar, FilterPanel } from '../components/molecules/SearchBar';
import Button from '../components/atoms/Button';
import client from '../api/client';

export default function BrowseServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    categories: [],
    minPrice: '',
    maxPrice: '',
    minRating: null,
  });
  const [loading, setLoading] = useState(true);

  const categoriesList = ['Design', 'Development', 'Backend', 'Marketing', 'Writing', 'Video', 'Other'];

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 8);

      if (search) params.append('search', search); // if backend supports it, otherwise filters handle it
      if (filters.categories.length > 0) {
        // Simple strategy: send first selected category, or backend handles multiple
        params.append('category', filters.categories[0]);
      }
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.minRating) params.append('minRating', filters.minRating);

      const res = await client.get(`/services?${params.toString()}`);
      setServices(res.data.services || res.data || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [page, filters]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchServices();
  };

  return (
    <div className="min-h-screen flex flex-col pt-[64px] bg-[#f8f9fa]">
      <PublicNavbar />

      <main className="flex-grow max-w-[1440px] mx-auto px-8 py-8 w-full">
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-headline text-[#191c1d]">Browse Services</h1>
          <p className="text-sm text-[#464555] font-body mt-1">Discover services offered by talented student freelancers.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FilterPanel
              categories={categoriesList}
              filters={filters}
              onFilterChange={(newFilters) => {
                setPage(1);
                setFilters(newFilters);
              }}
            />
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3 space-y-6">
            <SearchBar
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSubmit={handleSearchSubmit}
            />

            {loading ? (
              <div className="text-center py-12 text-[#464555] font-body">Loading services...</div>
            ) : services.length === 0 ? (
              <div className="text-center py-12 text-[#464555] font-body">
                No services match your filters. Try adjusting them.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <ServiceCard
                      key={service._id}
                      service={service}
                      onClick={() => navigate(`/services/${service._id}`)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-8 pt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      &larr; Previous
                    </Button>
                    <span className="text-sm font-semibold font-label text-[#464555]">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next &rarr;
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
