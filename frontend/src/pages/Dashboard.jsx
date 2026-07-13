import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Client states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // AI Matchmaker states
  const [matchingJobId, setMatchingJobId] = useState(null);
  const [matchingScore, setMatchingScore] = useState(null);
  const [matchingReason, setMatchingReason] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await API.get('/jobs');
      setJobs(response.data.data);
    } catch (err) {
      setError('Could not fetch jobs from the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setError('');

    try {
      await API.post('/jobs/new', {
        title,
        description,
        budget,
        deadline,
        category
      });
      setSuccessMsg('Job posted successfully!');
      setTitle('');
      setDescription('');
      setBudget('');
      setDeadline('');
      setCategory('');
      fetchJobs(); // Refresh jobs list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post job.');
    }
  };

  const handleCheckCompatibility = async (jobId) => {
    setMatchingJobId(jobId);
    setMatchingScore(null);
    setMatchingReason('');
    setAiLoading(true);

    try {
      const response = await API.post('/ai/matchmaker', {
        freelancerId: user.id,
        jobId: jobId
      });
      const { compatibilityScore, reason } = response.data.data;
      setMatchingScore(compatibilityScore);
      setMatchingReason(reason);
    } catch (err) {
      setMatchingReason('Failed to calculate compatibility score. Check if server and AI are running.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight font-sans">
            Welcome back, <span className="bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">{user?.name}</span>
          </h1>
          <p className="mt-2 text-dark-400">
            You are logged in as a <span className="text-primary-400 capitalize font-semibold">{user?.role}</span>
          </p>
        </div>

        {user?.role === 'freelancer' && (
          <div className="glassmorphism p-4 rounded-xl max-w-sm flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-xs text-dark-300">
              Active Skills: <span className="text-white font-medium">{user.skills?.length ? user.skills.join(', ') : 'None listed'}</span>
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
          {successMsg}
        </div>
      )}

      {user?.role === 'client' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Post Job Form */}
          <div className="lg:col-span-1 glassmorphism p-6 rounded-2xl h-fit">
            <h2 className="text-xl font-bold text-white mb-6">Post a New Gig</h2>
            
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Need a logo designed"
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Design, Writing, Dev..."
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="50"
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what needs to be done..."
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 text-sm resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl transition-all duration-200"
              >
                Post Job
              </button>
            </form>
          </div>

          {/* Active Job list */}
          <div className="lg:col-span-2 glassmorphism p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Marketplace Feed (Your Posts & Others)</h2>

            {loading ? (
              <p className="text-dark-400">Loading listings...</p>
            ) : jobs.length === 0 ? (
              <p className="text-dark-400">No active job listings found.</p>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job._id} className="p-5 rounded-xl bg-dark-800/50 border border-dark-700/50 hover:border-dark-600 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">{job.title}</h3>
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase rounded bg-primary-500/10 text-primary-400 border border-primary-500/10">
                          {job.category}
                        </span>
                      </div>
                      <span className="text-lg font-extrabold text-white">${job.budget}</span>
                    </div>
                    <p className="mt-3 text-sm text-dark-300 leading-relaxed">{job.description}</p>
                    <div className="mt-4 pt-4 border-t border-dark-700/50 flex justify-between text-xs text-dark-400">
                      <span>Posted by Client: {job.client?.name || 'Anonymous'}</span>
                      <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Freelancer View: Browse Jobs & AI Matchmaker */
        <div className="glassmorphism p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Available Peer Projects</h2>

          {loading ? (
            <p className="text-dark-400">Loading listings...</p>
          ) : jobs.length === 0 ? (
            <p className="text-dark-400">No projects available to bid on right now.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div key={job._id} className="p-5 rounded-xl bg-dark-800/40 border border-dark-700/50 hover:border-dark-600 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">{job.title}</h3>
                        <span className="inline-block mt-1.5 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
                          {job.category}
                        </span>
                      </div>
                      <span className="text-lg font-extrabold text-white">${job.budget}</span>
                    </div>
                    <p className="mt-3 text-sm text-dark-300 line-clamp-3">{job.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-dark-700/50">
                    <div className="flex items-center justify-between text-xs text-dark-400 mb-4">
                      <span>Posted by: {job.client?.name || 'Peer Client'}</span>
                      <span>Due: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>

                    {matchingJobId === job._id && (
                      <div className="mb-4 p-4 rounded-xl bg-primary-500/5 border border-primary-500/10">
                        {aiLoading ? (
                          <div className="flex items-center gap-2 text-xs text-primary-400">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Recruiter Bot is analyzing your skills compatibility...</span>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-primary-400">AI Compatibility Match</span>
                              <span className={`text-sm font-bold ${matchingScore >= 80 ? 'text-emerald-400' : 'text-primary-400'}`}>
                                {matchingScore}%
                              </span>
                            </div>
                            <div className="w-full bg-dark-800 rounded-full h-1.5 mb-2.5">
                              <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${matchingScore}%` }}></div>
                            </div>
                            <p className="text-xs text-dark-300 italic">"{matchingReason}"</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCheckCompatibility(job._id)}
                        className="flex-1 py-2 text-xs font-semibold text-white bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-dark-600 rounded-lg transition-colors"
                      >
                        Check Match Score
                      </button>
                      <button className="flex-1 py-2 text-xs font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-lg transition-colors">
                        Place Bid
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
