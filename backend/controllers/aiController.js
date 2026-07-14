const axios = require('axios');
const User = require('../models/User');
const Job = require('../models/Job');

// Helper: Call Gemini API with graceful mock fallback
const callGemini = async (systemPrompt, userPrompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_API_KEY') {
    return null; // Signal to use mock
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { responseMimeType: 'application/json' }
  };

  const response = await axios.post(geminiUrl, payload, {
    headers: { 'Content-Type': 'application/json' }
  });

  const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response from Gemini API');

  return JSON.parse(rawText.trim());
};

// @desc    Get AI-matched jobs for the authenticated freelancer
// @route   GET /api/matchmaker/jobs
// @access  Private/Freelancer
exports.getMatchedJobs = async (req, res) => {
  try {
    const freelancer = await User.findById(req.user.id);
    if (!freelancer || freelancer.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only freelancers can use job matching' });
    }

    // Fetch open jobs (limit to 20 to avoid scoring too many)
    const openJobs = await Job.find({ status: 'open' })
      .populate('clientId', 'name email rating')
      .sort({ createdAt: -1 })
      .limit(20);

    if (openJobs.length === 0) {
      return res.status(200).json([]);
    }

    const freelancerSkills = freelancer.skills.join(', ') || 'general skills';

    // Score all jobs — use AI if available, otherwise use keyword matching fallback
    const scored = await Promise.all(
      openJobs.map(async (job) => {
        let matchScore = 50; // default
        let reason = 'General match based on your profile';

        try {
          const systemPrompt =
            'You are an expert freelance recruiter. Score the match between a freelancer and a job. Return only JSON.';
          const userPrompt = `
Freelancer Skills: [${freelancerSkills}]
Job Title: "${job.title}"
Job Description: "${job.description}"
Required Skills: [${(job.skillsRequired || []).join(', ')}]

Return JSON: { "compatibilityScore": <number 1-100>, "reason": "<one sentence>" }`;

          const result = await callGemini(systemPrompt, userPrompt);

          if (result) {
            matchScore = result.compatibilityScore;
            reason = result.reason;
          } else {
            // Keyword overlap fallback
            const freelancerSkillSet = new Set(
              freelancer.skills.map((s) => s.toLowerCase())
            );
            const jobSkills = (job.skillsRequired || []).map((s) => s.toLowerCase());
            const overlap = jobSkills.filter((s) => freelancerSkillSet.has(s)).length;
            const total = jobSkills.length || 1;
            matchScore = Math.min(95, 40 + Math.round((overlap / total) * 55));
            reason = `[Auto] ${overlap}/${total} required skills matched`;
          }
        } catch (err) {
          console.warn(`[Matchmaker] Scoring failed for job ${job._id}:`, err.message);
        }

        return { job, matchScore, reason };
      })
    );

    // Sort by score descending, return top matches
    scored.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(scored);
  } catch (error) {
    console.error('[Matchmaker] error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI bidding assistance for a specific job
// @route   GET /api/bidding-assistant/:jobId
// @access  Private/Freelancer
exports.getBiddingAssistance = async (req, res) => {
  try {
    const freelancer = await User.findById(req.user.id);
    if (!freelancer || freelancer.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only freelancers can use the bidding assistant' });
    }

    const job = await Job.findById(req.params.jobId).populate('clientId', 'name rating');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const freelancerSkills = freelancer.skills.join(', ') || 'general skills';
    const budgetRange = `$${job.budgetMin}–$${job.budgetMax}`;

    let suggestedPriceRange = budgetRange;
    let estimatedDeliveryTime = '3–5 days';
    let draftCoverMessage = '';
    let tips = [];

    try {
      const systemPrompt =
        'You are an expert freelance career coach helping a student win a contract. Return only valid JSON.';
      const userPrompt = `
Freelancer Skills: [${freelancerSkills}]
Job Title: "${job.title}"
Job Description: "${job.description}"
Client Budget: ${budgetRange}
Required Skills: [${(job.skillsRequired || []).join(', ')}]

Provide a JSON response with:
{
  "suggestedPriceRange": "<price range string e.g. $120–$160>",
  "estimatedDeliveryTime": "<e.g. 3 days>",
  "draftCoverMessage": "<2–3 sentence cover letter tailored for this job>",
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}`;

      const result = await callGemini(systemPrompt, userPrompt);

      if (result) {
        suggestedPriceRange = result.suggestedPriceRange || budgetRange;
        estimatedDeliveryTime = result.estimatedDeliveryTime || '3–5 days';
        draftCoverMessage = result.draftCoverMessage || '';
        tips = result.tips || [];
      } else {
        // Mock fallback
        const midBudget = Math.round((job.budgetMin + job.budgetMax) / 2);
        suggestedPriceRange = `$${Math.round(midBudget * 0.85)}–$${Math.round(midBudget * 1.05)}`;
        estimatedDeliveryTime = '3–5 days';
        draftCoverMessage = `Hi, I'm excited about your project "${job.title}". With my expertise in ${freelancerSkills}, I'm confident I can deliver exactly what you need within your budget. I'd love to discuss this further — please feel free to reach out!`;
        tips = [
          'Highlight any directly relevant past projects in your cover message',
          'Propose a clear milestone plan to build client confidence',
          'Ask one specific clarifying question to show you have read the brief'
        ];
      }
    } catch (err) {
      console.warn('[BiddingAssistant] AI call failed, using mock:', err.message);
      const midBudget = Math.round((job.budgetMin + job.budgetMax) / 2);
      suggestedPriceRange = `$${Math.round(midBudget * 0.85)}–$${Math.round(midBudget * 1.05)}`;
      estimatedDeliveryTime = '3–5 days';
      draftCoverMessage = `Hi, I'm excited about your project "${job.title}". With my expertise in ${freelancerSkills}, I'm confident I can deliver exactly what you need. Let's connect!`;
      tips = [
        'Highlight relevant past work',
        'Propose clear milestones',
        'Ask a clarifying question'
      ];
    }

    res.status(200).json({
      jobId: job._id,
      suggestedPriceRange,
      estimatedDeliveryTime,
      draftCoverMessage,
      tips
    });
  } catch (error) {
    console.error('[BiddingAssistant] error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Legacy: Calculate compatibility score (kept for backward compatibility)
// @route   POST /api/ai/matchmaker
// @access  Private
exports.matchmaker = async (req, res) => {
  try {
    const { freelancerId, jobId } = req.body;

    const freelancer = await User.findById(freelancerId);
    if (!freelancer) return res.status(404).json({ success: false, error: 'Freelancer not found' });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });

    const freelancerSkills = freelancer.skills.join(', ');

    let compatibilityScore = Math.floor(Math.random() * 40) + 60;
    let reason = `[Mock] Skills (${freelancerSkills}) match job "${job.title}"`;

    try {
      const systemPrompt = 'You are an expert freelance recruiter. Output JSON only.';
      const userPrompt = `
Freelancer Skills: [${freelancerSkills}]
Job Description: "${job.description}"
Return JSON: { "compatibilityScore": <1-100>, "reason": "<one sentence>" }`;

      const result = await callGemini(systemPrompt, userPrompt);
      if (result) {
        compatibilityScore = result.compatibilityScore;
        reason = result.reason;
      }
    } catch (err) {
      console.warn('[Matchmaker legacy] AI failed, using mock');
    }

    res.status(200).json({ success: true, data: { freelancerId, jobId, compatibilityScore, reason } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
