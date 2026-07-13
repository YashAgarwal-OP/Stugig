const axios = require('axios');
const User = require('../models/User');
const Job = require('../models/Job');

// @desc    Calculate compatibility score between freelancer and job
// @route   POST /api/ai/matchmaker
// @access  Private
exports.matchmaker = async (req, res) => {
  try {
    const { freelancerId, jobId } = req.body;

    // 1. Fetch Freelancer details
    const freelancer = await User.findById(freelancerId);
    if (!freelancer) {
      return res.status(404).json({ success: false, error: 'Freelancer not found' });
    }

    if (freelancer.role !== 'freelancer') {
      return res.status(400).json({ success: false, error: 'The provided user ID does not belong to a freelancer' });
    }

    // 2. Fetch Job details
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // 3. Prepare variables for prompt injection
    const freelancerSkills = freelancer.skills.join(', ');
    const jobDescription = job.description;

    // Notion System Prompt: 
    // "You are an expert freelance recruiter. Compare the freelancer's skills with the job description. Output a compatibility score from 1-100 and a 1-sentence reason."
    const systemPrompt = "You are an expert freelance recruiter. Compare the freelancer's skills with the job description. Output a compatibility score from 1-100 and a 1-sentence reason.";
    
    // Inject variables into the user prompt
    const userPrompt = `
Freelancer Skills: [${freelancerSkills}]
Job Description: "${jobDescription}"

Provide your assessment in the following JSON format:
{
  "compatibilityScore": <number from 1 to 100>,
  "reason": "<1-sentence reason explaining the score>"
}
`;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY') {
      console.warn('GEMINI_API_KEY is not configured. Returning Mock Matchmaker response.');
      // Graceful fallback for mock tests/sandbox when GEMINI_API_KEY is not defined
      const mockScore = Math.floor(Math.random() * 40) + 60; // 60 - 100
      return res.status(200).json({
        success: true,
        data: {
          freelancerId,
          jobId,
          compatibilityScore: mockScore,
          reason: `[Mock] Freelancer has skills (${freelancerSkills}) which are a good match for the job: "${job.title}".`
        }
      });
    }

    // 4. Invoke Gemini API generateContent endpoint
    // Standard Gemini 1.5 / 2.5 / 3.5 generateContent REST format
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: userPrompt
            }
          ]
        }
      ],
      systemInstruction: {
        parts: [
          {
            text: systemPrompt
          }
        ]
      },
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    const response = await axios.post(geminiUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 5. Parse output
    const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return res.status(502).json({ success: false, error: 'Empty or invalid response from Gemini API' });
    }

    const aiResult = JSON.parse(rawText.trim());

    res.status(200).json({
      success: true,
      data: {
        freelancerId,
        jobId,
        compatibilityScore: aiResult.compatibilityScore,
        reason: aiResult.reason
      }
    });

  } catch (error) {
    console.error('Gemini Matchmaker error:', error.message);
    if (error.response) {
      console.error('Gemini API Details:', JSON.stringify(error.response.data));
    }
    res.status(500).json({ success: false, error: error.message });
  }
};
