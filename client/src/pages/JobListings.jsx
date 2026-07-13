import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/organisms/PublicNavbar';
import Footer from '../components/organisms/Footer';
import { JobCardRow } from '../components/molecules/Card';
import { SearchBar, FilterPanel } from '../components/molecules/SearchBar';
import Button from '../components/atoms/Button';
import client from '../api/client';

export default function JobListings() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
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

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      params.append('status', 'open'); // Only open jobs on the search board

      if (search) params.append('search', search);
      if (filters.categories.length > 0) {
        params.append('category', filters.categories[0]);
      }
      if (filters.minPrice) params.append('minBudget', filters.minPrice);
      if (filters.maxPrice) params.append('maxBudget', filters.maxPrice);

      const res = await client.get(`/jobs?${params.toString()}`);
      setJobs(res.data.jobs || res.data || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, filters]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  return (
    <div className="min-h-screen flex flex-col pt-[64px] bg-[#f8f9fa]">
      <PublicNavbar />

      <main className="flex-grow max-w-[1440px] mx-auto px-8 py-8 w-full">
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-headline text-[#191c1d]">Find Freelance Jobs</h1>
          <p className="text-sm text-[#464555] font-body mt-1">Browse open job requests posted by clients and submit bids.</p>
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
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSubmit={handleSearchSubmit}
            />

            {loading ? (
              <div className="text-center py-12 text-[#464555] font-body">Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 text-[#464555] font-body">
                No open jobs found. Try adjusting your filters.
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <JobCardRow
                      key={job._id}
                      job={job}
                      onClick={() => navigate(`/jobs/${job._id}`)}
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
